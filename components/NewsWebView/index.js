import Icon from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import React from "react";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  Linking
} from "react-native";

import NewsTextView from "../NewsTextView";
import SlideHideWrapper from "../SlideHideWrapper";
import { scrapeFromURL } from "../../util/NewsScraper";

const LINK_TPP_ARTICLE = /^https?:\/\/[\w+.]*(thepressproject|tpp).gr\/article/;

export default class NewsWebView extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    style: PropTypes.object
  };

  static defaultProps = {
    style: {}
  };

  loadContents(url) {
    this.setState({ loading: true });
    scrapeFromURL(url)
      .then(({ title, body, image }) => {
        this.setState({ body, title, image, loading: false, error: null });
      })
      .catch(error => {
        this.setState({ body: null, loading: false, error: true });
      });
  }

  constructor(props) {
    super(props);

    this.state = {
      url: props.url,
      loading: true,
      error: null,
      body: "",
      title: "",
      image: ""
    };
  }

  handleLinkClickk = url => {
    if (LINK_TPP_ARTICLE.exec(url)) {
      this.setState({ url });
      this.loadContents(url);
    } else {
      this.handleLinkOpen(url);
    }
  };

  handleLinkOpen = url => {
    Linking.openURL(url);
  };

  componentDidMount() {
    this.loadContents(this.props.url);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.url !== this.props.url) {
      this.setState({ url: newProps.url });
      this.loadContents(newProps.url);
    }
  }

  renderLoading() {
    const { style } = this.props;

    return (
      <View
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff"
          },
          style
        ]}
      >
        <ActivityIndicator size="large" color="#014b69" />
      </View>
    );
  }

  renderError() {
    const { style } = this.props;
    const { error } = this.state;

    return (
      <View
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff"
          },
          style
        ]}
      >
        <View style={{ alignItems: "center" }}>
          <Icon name="exclamation-triangle" size={30} />
          <Text style={{ marginTop: 10 }}>Error loading article</Text>
        </View>
      </View>
    );
  }

  renderArticle() {
    const { style, onScroll } = this.props;
    const { body, title, image } = this.state;

    return (
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={[style, { flex: 1, backgroundColor: "#fff" }]}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ height: 200 }} />
        ) : null}
        <Text
          style={{
            fontFamily: "RobotoSlab-Bold",
            fontSize: 28,
            margin: 10
          }}
        >
          {title}
        </Text>
        <NewsTextView
          style={{ marginLeft: 10, marginRight: 10 }}
          value={body}
          onLinkPress={this.handleLinkClickk}
          onLinkLongPress={this.handleLinkOpen}
        />
      </ScrollView>
    );
  }

  render() {
    const { style } = this.props;
    const { error, loading } = this.state;

    if (loading) return this.renderLoading();
    if (error) return this.renderError();

    return this.renderArticle();
  }
}
