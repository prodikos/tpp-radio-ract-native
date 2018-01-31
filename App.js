import React from "react";
import {
  BackHandler,
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ToastAndroid,
  Platform
} from "react-native";
import { IndicatorViewPager, PagerDotIndicator } from "rn-viewpager";

import { getConfig } from "./util/ConfigManager";
import { getCurrentBroadcast } from "./util/Schedule";

import Logo from "./components/Logo";
import ChatPanel from "./components/ChatPanel";
import AudioPanel from "./components/AudioPanel";
import ProgramPanel from "./components/ProgramPanel";
import NewsPanel from "./components/NewsPanel";
import RNExitApp from "react-native-exit-app";

export default class App extends React.Component {
  state = {
    stream: null,
    autoplay: false,
    chatBaseUrl: "",
    backPressed: false
  };

  /**
   * Double-back exits the app, single tap is ignored
   */
  handleBackPress = () => {
    const { backPressed } = this.state;
    if (backPressed) {
      RNExitApp.exitApp();
    } else {
      if (Platform.OS !== "ios") {
        ToastAndroid.show("Press again to exit", ToastAndroid.SHORT);
      }
      this.setState({ backPressed: true });
      setTimeout(() => {
        this.setState({ backPressed: false });
      }, 1000);
    }

    return true;
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    getConfig().then(({ chatBaseUrl, schedule, stream }) => {
      this.setState({
        stream,
        schedule,
        chatBaseUrl,
        autoplay: !!getCurrentBroadcast(schedule)
      });
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  render() {
    const { chatBaseUrl, schedule, stream, autoplay } = this.state;

    return (
      <View style={styles.container}>
        <View style={{ height: 18 }} />
        <Logo />
        <View style={{ flex: 1 }}>
          <IndicatorViewPager
            style={{ flex: 1 }}
            indicator={<PagerDotIndicator pageCount={3} />}
          >
            <View>
              <NewsPanel topNews={5} />
            </View>
            <View>
              <ProgramPanel schedule={schedule} />
            </View>
            <View>
              <ChatPanel chatBaseUrl={chatBaseUrl} />
            </View>
          </IndicatorViewPager>
          <AudioPanel stream={stream} autoplay={autoplay} />
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
