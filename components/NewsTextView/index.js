import HTMLView from "react-native-htmlview";
import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet } from "react-native";

export default class NewsTextView extends React.Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    style: PropTypes.object
  };

  static defaultProps = {
    style: {}
  };

  render() {
    const { value, style, ...rest } = this.props;

    return (
      <View style={[styles.container, style]}>
        <HTMLView
          value={value}
          stylesheet={stylesheet}
          {...rest}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const defaultStyle = {
  fontFamily: "RobotoSlab-Regular",
  fontSize: 17,
  fontWeight: '300'
};

const stylesheet = StyleSheet.create({
  span: Object.assign({}, defaultStyle),
  div: Object.assign({}, defaultStyle),
  h1: Object.assign({}, defaultStyle),
  h2: Object.assign({}, defaultStyle),
  h3: Object.assign({}, defaultStyle),
  h4: Object.assign({}, defaultStyle),
  br: {
    lineHeight: 0
  },
  ul: {
    marginTop: 5
  },
  li: {
    marginTop: 5,
    marginLeft: 5
  },
  a: {
    color: '#15698b'
  }
});
