import React from "react";
import {
  BackHandler,
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ToastAndroid,
  Platform,
  LayoutAnimation
} from "react-native";
import { IndicatorViewPager, PagerDotIndicator } from "rn-viewpager";
import RNExitApp from "react-native-exit-app";

import { getConfig } from "./util/ConfigManager";
import { getCurrentBroadcast } from "./util/Schedule";

import Logo from "./components/Logo";
import ChatPanel from "./components/ChatPanel";
import AudioPanel from "./components/AudioPanel";
import ProgramPanel from "./components/ProgramPanel";
import NewsPanel from "./components/NewsPanel";
import SlideHideController from "./util/SlideHideController";

export default class App extends React.Component {
  slideHideController = new SlideHideController({ distance: 60 });
  state = {
    stream: null,
    autoplay: false,
    chatBaseUrl: "",
    backPressed: false,
    hideBars: false,
    scrollEnabled: true
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

  handleBlockScroll = blocked => {
    this.setState({
      scrollEnabled: !blocked
    });
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

    this.slideHideController.onHideChangeCallback = pos => {
      const hideBars = pos > 0.5;

      if (hideBars != this.state.hideBars) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ hideBars });
      }
    };
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    this.slideHideController.onHideChangeCallback = () => {};
  }

  render() {
    const {
      chatBaseUrl,
      schedule,
      stream,
      autoplay,
      hideBars,
      scrollEnabled
    } = this.state;

    return (
      <View style={styles.container}>
        <View style={{ marginTop: hideBars ? -60 : 0 }}>
          <View style={{ height: hideBars ? 0 : 18 }} />
          <Logo />
          <View style={{ height: hideBars ? 18 : 0 }} />
        </View>
        <View style={{ flex: 1 }}>
          <IndicatorViewPager
            style={{ flex: 1 }}
            indicator={<PagerDotIndicator pageCount={3} />}
            scrollEnabled={scrollEnabled}
          >
            <View>
              <NewsPanel
                onScroll={this.slideHideController.handleFor("news")}
                onFullViewScroll={this.slideHideController.handleFor("full")}
                onBlockScroll={this.handleBlockScroll}
                topNews={5}
              />
            </View>
            <View>
              <ProgramPanel
                onScroll={this.slideHideController.handleFor("program")}
                schedule={schedule}
              />
            </View>
            <View>
              <ChatPanel
                onScroll={this.slideHideController.handleFor("chat")}
                chatBaseUrl={chatBaseUrl}
              />
            </View>
          </IndicatorViewPager>
          <View style={{ marginBottom: hideBars ? -60 : 0 }}>
            <AudioPanel stream={stream} autoplay={autoplay} />
          </View>
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
