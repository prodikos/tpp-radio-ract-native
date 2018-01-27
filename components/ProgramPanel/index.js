import PropTypes from "prop-types";
import React from "react";
import { Text, ScrollView, View } from "react-native";

import ProgramEntryDay from "../ProgramEntryDay";
import { getScheduleTable } from "../../util/Schedule";

export default class ProgramPanel extends React.Component {
  static propTypes = {
    schedule: PropTypes.object
  };

  render() {
    const { schedule } = this.props;
    if (!schedule) {
      return <View />;
    }

    const scheduleTable = getScheduleTable(schedule);
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
        {scheduleTable.map((entry, idx) => (
          <ProgramEntryDay schedule={schedule} entry={entry} key={idx} />
        ))}
      </ScrollView>
    );
  }
}
