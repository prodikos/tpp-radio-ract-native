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
  LayoutAnimation,
  ScrollView
} from "react-native";
import { Card, ListItem, Button } from "react-native-elements";
import moment from "moment";

import NewsProvider from "../../util/NewsProvider";
import NewsListView from "../NewsListView";
import NewsWebView from "../NewsWebView";
import HidablePopOverView from '../HidablePopOverView';

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

export default class NewsPanel extends React.Component {
  static propTypes = {
    onScroll: PropTypes.func,
    onFullViewScroll: PropTypes.func,
    onBlockScroll: PropTypes.func,
    topNews: PropTypes.number
  };

  static defaultProps = {
    topNews: 4
  };

  constructor(props) {
    super(props);

    this.updateTimer = null;
    this.updateTimerTicks = 0;
    this.state = {
      news_top: [],
      news_other: [],
      refreshing: false,
      portrait: true,
      fullTextVisible: false,
      fullTextUrl: "",
      width: 0
    };
  }

  handleLayoutUpdate = e => {
    const width = e.nativeEvent.layout.width,
      height = e.nativeEvent.layout.height;

    this.setState({
      portrait: height > width,
      width: width
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

  handleUpdateNewsTick = () => {
    if (++this.updateTimerTicks >= 5) {
      this.updateTimerTicks = 0;
      this.updateNews();
    }
  };

  handleOpenFullText = article => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (this.state.fullTextVisible) {
      this.setState({
        fullTextVisible: false
      });
      this.props.onBlockScroll(false);
    } else {
      this.setState({
        fullTextVisible: true,
        fullTextUrl: article.link
      });
      this.props.onBlockScroll(true);
    }
  };

  handleCloseFulltext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      fullTextVisible: false
    });
    this.props.onBlockScroll(false);
  };

  componentDidMount() {
    NewsProvider.on("update", this.handleNewsUpdate);
    this.updateTimer = setInterval(this.handleUpdateNewsTick, 60000);
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

  render() {
    const { onScroll, onFullViewScroll } = this.props;
    const {
      news_top,
      news_other,
      refreshing,
      portrait,
      fullTextVisible,
      fullTextUrl,
      width
    } = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: "#000"
        }}
        onLayout={this.handleLayoutUpdate}
      >
        <NewsListView
          onScroll={onScroll}
          onRefresh={this.updateNews}
          onArticleTap={this.handleOpenFullText}
          faded={fullTextVisible}
          refreshing={refreshing}
          topArticles={news_top}
          otherArticles={news_other}
          stickyHeaders={portrait}
          style={{
            left: fullTextVisible ? -20 : 0
          }}
        />
        <HidablePopOverView
          width={width}
          open={fullTextVisible}
          onClose={this.handleCloseFulltext}
           >
            <NewsWebView onScroll={onFullViewScroll} url={fullTextUrl} />
        </HidablePopOverView>
      </View>
    );
  }
}
