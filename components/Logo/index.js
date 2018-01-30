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
            height: 80
          }}
        >
          <Image
            style={{ width: 55, height: 65 }}
            source={require("./assets/logo.png")}
          />
          <View style={{ height: 60, paddingLeft: 8 }}>
            <Text style={{ color: "#FFF", fontFamily: 'RobotoSlab-Regular', fontSize: 30 }}>
              The Press Project
            </Text>
            <Text
              style={{
                color: "#b3c9d2",
                fontFamily: 'RobotoSlab-Regular',
                fontSize: 12,
                paddingLeft: 4
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
