import PropTypes from "prop-types";
import React from "react";
import { Text, View } from "react-native";

import { isBroadcastActive } from "../../util/Schedule";

/**
 * Pad the given string with zeros till the given length is reached
 */
function padZeros(value, length) {
  let str = String(value);
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

export default class ProgramEntryDay extends React.Component {
  static propTypes = {
    schedule: PropTypes.object,
    entry: PropTypes.array
  };

  componentDidMount() {
    this.updateTimer = setInterval(() => this.forceUpdate(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.updateTimer);
  }

  renderScheduleEntry(entry, idx, day) {
    const { schedule } = this.props;
    const active = isBroadcastActive(schedule, entry, day);
    let color = active ? "#ffa500" : "#fff";

    return (
      <View style={{ padding: 5, flexDirection: "row" }} key={idx}>
        <View style={{ width: 100 }}>
          <Text style={{ fontSize: 16, color: color }}>
            {padZeros(entry.start[0], 2)}:{padZeros(entry.start[1], 2)}
            {` - `}
            {padZeros(entry.end[0], 2)}:{padZeros(entry.end[1], 2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: color }}>
            {entry.title}
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>{entry.desc}</Text>
        </View>
      </View>
    );
  }

  renderHeader(contents) {
    return (
      <View style={{ backgroundColor: "#15698b", padding: 5 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{contents}</Text>
      </View>
    );
  }

  render() {
    const { entry } = this.props;
    if (entry.length === 0) {
      return null;
    }

    return (
      <View>
        {this.renderHeader(entry.name)}
        {entry.map((program, idx) =>
          this.renderScheduleEntry(program, idx, entry.day)
        )}
      </View>
    );
  }
}
