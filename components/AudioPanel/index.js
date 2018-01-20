import React from "react";
import { Audio } from "expo";
import { Text, View, Slider } from "react-native";
import { Avatar } from "react-native-elements";

import ProgramPlayingNowText from '../ProgramPlayingNowText';

export default class AudioPanel extends React.Component {
  constructor(props) {
    super(props);

    this.mounted = false;
    this.sound = new Expo.Audio.Sound();
    this.retryTimer = 0;
    this.retrying = false;
    this.state = {
      message: "Tap play to start the stream",
      volume: 1.0,
      playing: false,
      pending: false,
      live: false
    };

    this.sound.setOnPlaybackStatusUpdate(
      this.handlePlaybackStatusUpdate.bind(this)
    );
  }

  handlePlaybackStatusUpdate(status) {
    const { retrying } = this;
    const { pending, playing } = this.state;
    if (!this.mounted) return;

    console.log('status=', status);

    if (!status.isLoaded && playing && !retrying) {
      this.retryPlayback();
    } else if (status.isPlaying) {
      this.setState({ message: "Playing", live: true });
    } else if (!status.didJustFinish) {
      this.setState({ message: "Buffering...", live: false });
    }
  }

  retryPlayback = () => {
    const { sound } = this;
    if (this.retrying) return;
    this.retrying = true;

    sound.unloadAsync().then(_ => {
      this.setState({
        message: "Playback error (will try again in 5 sec)",
        live: false
      });

      this.retryTimer = setTimeout(() => this.startPlayback(true), 5000);
    });
  };

  startPlayback = (fromRetry = false) => {
    const { sound } = this;
    const { stream } = this.props;
    const { pending, playing, volume } = this.state;
    if (!fromRetry && (playing || pending)) return;

    this.retrying = false;
    this.setState({
      live: false,
      playing: true,
      pending: true,
      message: "Connecting to server..."
    });
    try {
      sound
        .loadAsync(
          // { uri: "http://stream.radiojar.com/qgra821mrtwtv" },
          // {uri: 'http://www.noiseaddicts.com/samples_1w72b820/3919.mp3'},
          { uri: stream },
          {
            shouldPlay: true,
            rate: 1.0,
            shouldCorrectPitch: true,
            volume: volume,
            isMuted: false,
            isLooping: false
          },
          false
        )
        .then(status => {
          this.setState({ pending: false });

          if (!status.isLoaded) {
            this.retryPlayback();
          } else {
            this.setState({ message: "Buffering..." });
          }
        });
    } catch (e) {
      this.retryPlayback();
    }
  };

  stopPlayback = () => {
    const { sound } = this;
    const { pending, playing } = this.state;
    if (!playing || pending) return;

    clearTimeout(this.retryTimer);
    this.setState({ playing: false, live: false, message: "Stopping..." });

    sound
      .stopAsync()
      .then(_ => {
        sound.unloadAsync().then(_ => {
          this.setState({
            pending: false,
            message: "Tap play to start the stream"
          });
        });
      })
      .catch(e => {
        this.setState({ pending: false, message: "Something went wrong" });
        sound
          .unloadAsync()
          .then(_ => {
            this.setState({
              pending: false,
              message: "Tap play to start the stream"
            });
          })
          .catch(e => {
            /* sink */
          });
      });
  };

  togglePlay = () => {
    const { playing } = this.state;
    if (playing) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  };

  setVolume = volume => {
    const { sound } = this;
    const { playing } = this.state;

    if (playing) {
      sound.setVolumeAsync(volume);
    }
  };

  componentDidMount() {
    this.mounted = true;
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    }).then(_ => {
      if (this.props.autoplay) {
        this.startPlayback();
      }
    })
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.retryTimer);
  }

  render() {
    const { playing, pending, message, live } = this.state;

    return (
      <View
        style={{
          backgroundColor: "#333",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View
          style={{
            flex: 1,
            height: 58,
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <Slider
            thumbTintColor="#666"
            minimumTrackTintColor="#666"
            value={this.state.volume}
            onSlidingComplete={this.setVolume}
            onValueChange={volume => this.setState({ volume })}
          />
          {live ? (
            <ProgramPlayingNowText
              style={{ fontSize: 12, color: "#fff", paddingLeft: 16 }}
              placeholder={message}
            />
          ) : (
            <Text style={{ fontSize: 12, color: "#666", paddingLeft: 16 }}>
              {message}
            </Text>
          )}
        </View>
        <Avatar
          width={52}
          height={52}
          rounded
          disabled={pending}
          icon={{ name: playing ? "stop" : "play-arrow" }}
          onPress={this.togglePlay}
          activeOpacity={0.7}
          containerStyle={{ marginRight: 5 }}
        />
      </View>
    );
  }
}
