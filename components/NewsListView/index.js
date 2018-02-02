import HTMLView from "react-native-htmlview";
import PropTypes from "prop-types";
import React from "react";
import { Avatar } from "react-native-elements";
import {
  SectionList,
  FlatList,
  Text,
  View,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { Card, ListItem, Button } from "react-native-elements";

export default class NewsListView extends React.Component {
  static propTypes = {
    faded: PropTypes.bool,
    otherArticles: PropTypes.arrayOf(PropTypes.object),
    refreshing: PropTypes.bool,
    stickyHeaders: PropTypes.bool,
    style: PropTypes.object,
    topArticles: PropTypes.arrayOf(PropTypes.object),

    onArticleTap: PropTypes.func,
    onRefresh: PropTypes.func,
    onScroll: PropTypes.func
  };

  static defaultProps = {
    faded: false,
    otherArticles: [],
    refreshing: false,
    stickyHeaders: true,
    style: {},
    topArticles: [],

    onArticleTap() {},
    onRefresh() {},
    onScroll() {}
  };

  renderTopNewsItem = ({ item }) => {
    const { onArticleTap } = this.props;
    const image = item.image.replace("project/", "project.gr/");
    const content = item.description
      .replace(/<br><br>/g, "<br>")
      .replace(/^<b><\/b><br>/, "");

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onArticleTap(item)}>
        <Card
          key={item.guid}
          featuredTitle={item.title}
          featuredTitleStyle={{ padding: 10 }}
          image={{ uri: image }}
        >
          <HTMLView value={content} />
          <View>
            <Text style={{ fontSize: 10, textAlign: "right", color: "#CCC" }}>
              {item.date}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  renderSmallNewsItem = ({ item, index }) => {
    const { onArticleTap } = this.props;
    const image = item.image.replace("project/", "project.gr/");
    const content = item.description
      .replace(/<br><br>/g, "<br>")
      .replace(/^<b><\/b><br>/, "");

    const backgroundColor = index % 2 == 0 ? "#EEE" : "#FFF";

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => onArticleTap(item)}>
        <View
          key={item.guid}
          style={{
            backgroundColor,
            marginLeft: 12,
            marginRight: 12,
            marginTop: 10,
            padding: 8
          }}
        >
          <View style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.title}</Text>
          </View>
          <HTMLView value={content} />
          <View>
            <Text style={{ fontSize: 10, textAlign: "right", color: "#CCC" }}>
              {item.date}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderSectionHeader = ({ section }) => {
    return (
      <View
        style={{
          borderBottomColor: "#CCC",
          backgroundColor: "#eee",
          borderBottomWidth: 2,
          marginLeft: 10,
          paddingTop: 10,
          marginRight: 10,
          paddingBottom: 6
        }}
      >
        <Text
          style={{
            color: "#999",
            fontFamily: "RobotoSlab-Regular",
            fontSize: 24
          }}
        >
          <Text style={{ color: "#e6222e", fontFamily: "RobotoSlab-Bold" }}>
            »
          </Text>
          {` `}
          {section.title}
        </Text>
      </View>
    );
  };

  render() {
    const {
      onScroll,
      onRefresh,
      onArticleTap,
      topArticles,
      otherArticles,
      refreshing,
      stickyHeaders,
      faded,
      style
    } = this.props;

    return (
      <View
        style={[{
          flex: 1,
          flexDirection: "row",
          backgroundColor: "#eeeeee",
          opacity: faded ? 0.5 : 1
        }, style]}
      >
        <SectionList
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={{ flex: 1 }}
          stickySectionHeadersEnabled={stickyHeaders}
          renderSectionHeader={this.renderSectionHeader}
          sections={[
            {
              title: "Τελευταίες Ειδήσεις",
              data: topArticles,
              renderItem: this.renderTopNewsItem
            },
            {
              title: "Όλες οι Ειδήσεις",
              data: otherArticles,
              renderItem: this.renderSmallNewsItem
            }
          ]}
        />
      </View>
    );
  }
}
