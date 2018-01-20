import React from "react";
import { Font } from "expo";
import { FlatList, Image, Text, View, Linking } from "react-native";
import { Avatar } from "react-native-elements";

import ChatClient from "../../util/ChatClient";
import InlineImage from "../../util/InlineImage";

export default class ChatMessage extends React.Component {
  renderFragment = (fragment, idx) => {
    switch (fragment.type) {
      case "text":
        return (
          <Text key={idx} style={{ color: "#fff" }}>
            {fragment.text}
          </Text>
        );

      case "notice":
        return (
          <Text key={idx} style={{ color: "#ffa500", fontWeight: "bold" }}>
            {" "}
            {fragment.text}
          </Text>
        );

      case "image":
        return (
          <InlineImage
            key={idx}
            source={{ uri: `${ChatClient.baseUrl}/${fragment.src}` }}
            style={{ width: 26, height: 26 }}
          />
        );

      case "link":
        return (
          <Text
            key={idx}
            style={{ color: "#84e8a7" }}
            onPress={() => Linking.openURL(fragment.href)}
          >
            {fragment.text}
          </Text>
        );
    }
  };

  render() {
    const { classes, user, avatar, text, date, key } = this.props.message;

    return (
      <View style={{ flexDirection: "row", marginBottom: 3 }} key={key}>
        <Avatar
          small
          rounded
          source={{ uri: `${ChatClient.baseUrl}/${avatar}` }}
          activeOpacity={0.7}
        />
        <View style={{ flex: 1, justifyContent: "center", paddingLeft: 5 }}>
          <Text>
            <Text style={{ color: "#555", fontWeight: "bold" }}>{user}: </Text>
            {text.map(this.renderFragment)}
          </Text>
        </View>
      </View>
    );
  }
}
