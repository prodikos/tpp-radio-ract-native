import React from "react";
import { Animated, StyleSheet, Text, View, ScrollView } from "react-native";
import { IndicatorViewPager, PagerDotIndicator } from "rn-viewpager";

import Config from './Config';
import { getCurrentBroadcast } from './util/Schedule';

import Logo from "./components/Logo";
import ChatPanel from "./components/ChatPanel";
import AudioPanel from "./components/AudioPanel";
import ProgramPanel from './components/ProgramPanel';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 18 }} />
        <Logo />
        <View style={{ flex: 1 }}>
          <IndicatorViewPager
            style={{ flex: 1 }}
            indicator={<PagerDotIndicator pageCount={2} />}
          >
            <View>
              <ProgramPanel />
            </View>
            <View>
              <ChatPanel />
            </View>
          </IndicatorViewPager>
          <AudioPanel stream={Config.stream} autoplay={!!getCurrentBroadcast()} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#014b69"
  },
  text: {
    fontFamily: "roboto-slab-regular"
  }
});
