import HTMLView from "react-native-htmlview";
import PropTypes from "prop-types";
import React from "react";
import { Avatar } from "react-native-elements";
import {
  SectionList,
  FlatList,
  Text,
  View,
  RefreshControl
} from "react-native";
import { Card, ListItem, Button } from "react-native-elements";
import moment from "moment";

import NewsProvider from "../../util/NewsProvider";

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

export default class NewsPanel extends React.Component {
  static propTypes = {
    topNews: PropTypes.number
  };

  static defaultProps = {
    topNews: 4
  };

  constructor(props) {
    super(props);

    this.updateTimer = null;
    this.state = {
      news_top: [],
      news_other: [],
      refreshing: false,
      portrait: true
    };
  }

  handleLayoutUpdate = e => {
    const width = e.nativeEvent.layout.width,
      height = e.nativeEvent.layout.height;

    this.setState({
      portrait: height > width
    });
  };

  handleNewsUpdate = news => {
    const { topNews } = this.props;
    const sorted = news
      .map(item =>
        Object.assign({}, item, {
          key: item.guid,
          ts: moment(item.date, DATE_FORMAT).unix()
        })
      )
      .sort((a, b) => b.ts - a.ts);

    const news_top = sorted.slice(0, topNews);
    const news_other = sorted.slice(topNews);

    this.setState({ news_top, news_other, refreshing: false });
  };

  componentDidMount() {
    NewsProvider.on("update", this.handleNewsUpdate);
    this.updateTimer = setInterval(this.updateNews, 60000);
    NewsProvider.lastResults().then(news => {
      this.handleNewsUpdate(news);
      NewsProvider.update()
        .then(news => this.handleNewsUpdate(news))
        .catch(_ => this.setState({ refreshing: false }));
    });
  }

  componentWillUnmount() {
    NewsProvider.off("update", this.handleNewsUpdate);
    clearTimeout(this.updateTimer);
  }

  updateNews = () => {
    this.setState({ refreshing: true });
    NewsProvider.update()
      .then(news => this.handleNewsUpdate(news))
      .catch(_ => this.setState({ refreshing: false }));
  };

  renderTopNewsItem = ({ item }) => {
    const image = item.image.replace("project/", "project.gr/");
    const content = item.description
      .replace(/<br><br>/g, "<br>")
      .replace(/^<b><\/b><br>/, "");

    return (
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
    );
  };

  renderSmallNewsItem = ({ item, index }) => {
    const image = item.image.replace("project/", "project.gr/");
    const content = item.description
      .replace(/<br><br>/g, "<br>")
      .replace(/^<b><\/b><br>/, "");

    const backgroundColor = index % 2 == 0 ? "#EEE" : "#FFF";

    return (
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
    const { news_top, news_other, refreshing, portrait } = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: "#eeeeee"
        }}
        onLayout={this.handleLayoutUpdate}
      >
        <SectionList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.updateNews}
            />
          }
          style={{ flex: 1 }}
          stickySectionHeadersEnabled={portrait}
          renderSectionHeader={this.renderSectionHeader}
          sections={[
            {
              title: "Τελευταίες Ειδήσεις",
              data: news_top,
              renderItem: this.renderTopNewsItem
            },
            {
              title: "Όλες οι Ειδήσεις",
              data: news_other,
              renderItem: this.renderSmallNewsItem
            }
          ]}
        />
      </View>
    );
  }
}
