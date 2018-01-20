import React from "react";
import { Font } from "expo";
import {
  Image,
  Text,
  View,
  Linking,
  TouchableWithoutFeedback
} from "react-native";

export default class Logo extends React.Component {
  state = {
    fontLoaded: false
  };

  componentDidMount() {
    Font.loadAsync({
      "roboto-slab-regular": require("./assets/RobotoSlab-Bold.ttf")
    }).then(() => {
      this.setState({ fontLoaded: true });
    });
  }

  getFontFamily() {
    const { fontLoaded } = this.state;
    return fontLoaded ? "roboto-slab-regular" : "sans-serif";
  }

  render() {
    const fontFamily = this.getFontFamily();

    return (
      <TouchableWithoutFeedback
        onPress={() => Linking.openURL("https://www.thepressproject.gr/")}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 80
          }}
        >
          <Image
            style={{ width: 55, height: 65 }}
            source={require("./assets/logo.png")}
          />
          <View style={{ height: 60, paddingLeft: 8 }}>
            <Text style={{ color: "#FFF", fontFamily, fontSize: 30 }}>
              The Press Project
            </Text>
            <Text
              style={{
                color: "#b3c9d2",
                fontFamily,
                fontSize: 12,
                paddingLeft: 4
              }}
            >
              Το ραδιόφωνο στη τσέπη σου
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
