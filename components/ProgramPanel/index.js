import React from "react";
import { Text, ScrollView, View } from "react-native";

import ProgramEntryDay from "../ProgramEntryDay";
import { getScheduleTable } from "../../util/Schedule";

export default class ProgramPanel extends React.Component {
  render() {
    const schedule = getScheduleTable();

    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#1c1c1c" }}>
        {schedule.map((entry, idx) => (
          <ProgramEntryDay entry={entry} key={idx} />
        ))}
      </ScrollView>
    );
  }
}
