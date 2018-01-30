import React from "react";
import { Text, View, Slider, ActivityIndicator, Platform } from "react-native";
import { Avatar } from "react-native-elements";

import ProgramPlayingNowText from "../ProgramPlayingNowText";
import AudioPlayer from "../AudioPlayer";
import SystemNotification from '../SystemNotification';

export default class AudioPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      busy: false,
      live: false,
      buffering: false,
      message: "TPP.Radio :: Tap Play to Start",
      playing: !!props.autoplay,
      volume: 1.0
    };
  }

  handlePlayButtonTap = () => {
    const { playing } = this.state;
    this.setState({ playing: !playing });
  };

  handleVolumeChange = volume => {
    const { playing } = this.state;
    this.setState({ volume: volume });
  };

  handleStatusChange = (flags, oldFlags) => {
    this.setState({
      live: flags.playing,
      busy: flags.busy,
      buffering: flags.buffering
    });
  };

  render() {
    const { volume, playing, busy, message, live, buffering } = this.state;
    const { stream } = this.props;

    const sliderMargin = (Platform.OS == 'ios') ? 10 : 0;

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
            style={{marginLeft: sliderMargin, marginRight: sliderMargin}}
            thumbTintColor="#666"
            minimumTrackTintColor="#666"
            value={volume}
            onSlidingComplete={this.handleVolumeChange}
            onValueChange={volume => this.setState({ volume })}
          />
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingBottom: 10
            }}
          >
            {(busy || buffering) ? (
                <View>
                  <ActivityIndicator
                    style={{paddingLeft: 10}}
                    color="#00ff00"
                    size="small"
                  />
                </View>
              ) : (
                <View />
              )}
            {live ? (
              <ProgramPlayingNowText
                style={{ fontSize: 12, color: "#fff", marginLeft: 10 }}
                placeholder={message}
              />
            ) : (
              <Text style={{ fontSize: 12, color: "#666", marginLeft: 10 }}>
                {message}
              </Text>
            )}
          </View>
        </View>
        <Avatar
          width={52}
          height={52}
          rounded
          disabled={busy}
          icon={{ name: playing ? "stop" : "play-arrow" }}
          onPress={this.handlePlayButtonTap}
          activeOpacity={0.7}
          containerStyle={{ marginRight: 5 }}
        />
        <AudioPlayer
          autorestart={true}
          playing={playing}
          url={stream}
          volume={volume}
          onStatusChange={this.handleStatusChange}
        />
        <SystemNotification
          title="TPP.Radio"
          message="You are currently listening to TPP Radio"
          visible={playing} />
      </View>
    );
  }
}
