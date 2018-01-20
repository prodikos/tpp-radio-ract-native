import React from "react";
import { Font } from "expo";
import { FlatList, Image, Text, View } from "react-native";
import { List, ListItem } from "react-native-elements";
import { Button, Linking } from "react-native";

import { getClientIdAsync } from "../../util/ClientID";
import ChatClient from "../../util/ChatClient";
import ChatMessage from "../ChatMessage";

export default class ChatPanel extends React.Component {
  timer = null;
  state = {
    messages: [],
    error: false,
    portrait: true
  };

  componentDidMount() {
    // Try to fetch some messages. If we succeed we are logged in
    ChatClient.getChatAsync().then(messages => {
      if (messages != null) {
        this.setState({ messages });
        this.timer = setInterval(() => {
          this.update();
        }, 5000);
        return;
      }

      // Otherwise login as guest & Update chat list
      ChatClient.loginGuestAsync().then(ans => {
        this.update();

        // Start polling timer
        this.timer = setInterval(() => {
          this.update();
        }, 5000);
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    ChatClient.logoutAsync();
  }

  update() {
    ChatClient.getChatAsync().then(messages => {
      if (!messages) {
        this.setState({ error: true });
      } else {
        this.setState({ messages });
      }
    });
    ChatClient.updateUserPresence().then(_ => {});
  }

  renderMessage = ({ item, key, index }) => {
    return <ChatMessage message={item} />;
  };

  handleLayoutUpdate = e => {
    const width = e.nativeEvent.layout.width,
      height = e.nativeEvent.layout.height;

    this.setState({
      portrait: height > width
    });
  };

  renderLoading() {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1
        }}
      >
        <Text style={{ color: "#fff" }}>Loading chat...</Text>
      </View>
    );
  }

  renderError() {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1
        }}
      >
        <Text style={{ color: "#333" }}>Unable to load chat</Text>
      </View>
    );
  }

  renderMessages() {
    const { messages } = this.state;
    return <FlatList data={messages} renderItem={this.renderMessage} />;
  }

  render() {
    const { messages, error, portrait } = this.state;
    const { flex = 1 } = this.props;

    return (
      <View
        style={{
          alignSelf: "stretch",
          backgroundColor: "#1c1c1c",
          padding: 4,
          flex
        }}
        onLayout={this.handleLayoutUpdate}
      >
        {portrait ? (
          <Button
            onPress={() =>
              Linking.openURL("https://www.thepressproject.gr/tppradio/")}
            title="ΣΥΝΔΕΘΕΙΤΕ ΓΙΑ ΝΑ ΣΧΟΛΙΑΣΕΤΕ"
            color="#841584"
          />
        ) : null}
        <View style={{ flex: 1 }}>
          {error
            ? this.renderError()
            : messages.length ? this.renderMessages() : this.renderLoading()}
        </View>
      </View>
    );
  }
}
