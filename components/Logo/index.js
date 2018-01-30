import React from "react";
import {
  Image,
  Text,
  View,
  Linking,
  TouchableWithoutFeedback
} from "react-native";

export default class Logo extends React.Component {

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => Linking.openURL("https://www.thepressproject.gr/")}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 60,
            marginBottom: 5
          }}
        >
          <Image
            style={{ width: 41.25, height: 48.75 }}
            source={require("./assets/logo.png")}
          />
          <View style={{ height: 45, paddingLeft: 11 }}>
            <Text style={{ color: "#FFF", fontFamily: 'RobotoSlab-Regular', fontSize: 23 }}>
              The Press Project
            </Text>
            <Text
              style={{
                color: "#b3c9d2",
                fontFamily: 'RobotoSlab-Regular',
                fontSize: 11,
                paddingLeft: 2
              }}
            >
              Αντικειμενική ενημέρωση, στην τσέπη σου
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
