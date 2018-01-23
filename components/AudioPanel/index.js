import React from "react";
import { Text, View, Slider } from "react-native";
import { Avatar } from "react-native-elements";

import ProgramPlayingNowText from "../ProgramPlayingNowText";
import AudioPlayer from "../AudioPlayer";

export default class AudioPanel extends React.Component {
  state = {
    busy: false,
    fontLoaded: false,
    live: false,
    message: "Tap play to start the stream",
    playing: false,
    volume: 1.0
  };

  handlePlayButtonTap = () => {
    const { playing } = this.state;
    this.setState({ playing: !playing });
  };

  handleVolumeChange = volume => {
    const { playing } = this.state;
    this.setState({ volume: volume });
  };

  handleOnBusyChange = busy => {
    this.setState({ busy });
  };

  handleOnPlayingChange = playing => {
    this.setState({ live: playing });
  };

  // componentDidMount() {
  //   Font.loadAsync({
  //     MaterialIcons: require("react-native-vector-icons/Fonts/MaterialIcons.ttf")
  //   }).then(() => {
  //     this.setState({ fontLoaded: true });
  //   });
  // }

  render() {
    const { volume, playing, busy, message, live, fontLoaded } = this.state;
    const { stream } = this.props;

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
            value={volume}
            onSlidingComplete={this.handleVolumeChange}
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
        {fontLoaded ? (
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
        ) : null}
        <AudioPlayer
          autorestart={true}
          playing={playing}
          url={stream}
          volume={volume}
          onBusyChange={this.handleOnBusyChange}
          onPlayingChange={this.handleOnPlayingChange}
        />
      </View>
    );
  }
}
