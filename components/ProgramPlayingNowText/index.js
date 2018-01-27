import React from "react";
import { Text, View } from "react-native";

import { getConfig } from '../../util/ConfigManager';
import { getCurrentBroadcast } from "../../util/Schedule";

export default class ProgramPlayingNowText extends React.Component {
  state = {
    active: null
  };

  updateProgram = () => {
    const { active } = this.state;
    getConfig().then(({schedule}) => {
      const newActive = getCurrentBroadcast(schedule);
      if (newActive !== active) {
        this.setState({
          active: newActive
        });
      }
    })
  };

  componentDidMount() {
    this.updateTimer = setInterval(this.updateProgram, 1000);
    this.updateProgram();
  }

  componentWillUnmount() {
    clearInterval(this.updateTimer);
  }

  render() {
    const { active } = this.state;

    if (!active) {
      return <Text style={this.props.style}>{this.props.placeholder}</Text>;
    }

    return (
      <Text style={this.props.style}>
        <Text style={{ fontWeight: "bold" }}>LIVE tpp.Radio : </Text>
        <Text>{active.title}</Text>
      </Text>
    );
  }
}
