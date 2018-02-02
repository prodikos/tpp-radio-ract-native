import PropTypes from "prop-types";
import React from "react";
import { View, LayoutAnimation } from "react-native";

export default class HidablePopOverView extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    open: PropTypes.bool,
    edgeSize: PropTypes.number,
    style: PropTypes.object,
    onClose: PropTypes.func
  };

  static defaultProps = {
    open: false,
    edgeSize: 18,
    style: {},

    onClose() {}
  };

  state = {
    startx: 0,
    starty: 0,
    prevx: 0,
    dragOffset: 0,
    dragTs: 0,
    dragging: false
  };

  handleResponderMoveStart = event => {
    console.log('Start:', event.nativeEvent, 'H:', event.touchHistory);
    const historyx = event.touchHistory.touchBank[1].startPageX;
    const historyy = event.touchHistory.touchBank[1].startPageY;
    const startx = event.nativeEvent.pageX;
    const starty = event.nativeEvent.pageY;

    // Check touch bank and check if the direction we are moving is the
    // correct one (horizontal)
    if (historyy != starty) return false;

    // Start dragging
    this.setState({
      dragging: true,
      dragTs: Date.now(),
      startx,
      starty
    });
    return true;
  };

  handleResponderMouseMove = event => {
    console.log('Move:', event.nativeEvent);
    const { startx, dragging, prevx, starty } = this.state;
    const { width, edgeSize } = this.props;
    const x = event.nativeEvent.pageX;
    const y = event.nativeEvent.pageY;

    if (!dragging) return;

    // If we have diverged on the axis of swiping, bail
    if (Math.abs(y - starty) > 5) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({
        dragging: false,
        dragOffset: 0
      });
      return;
    }

    // If dragged left, reset acceleration time
    if (x < prevx) {
      this.setState({ dragTs: Date.now() });
    }

    // If dragged further than 1/3 of the page, abort
    let newOffset = x - startx;
    if (newOffset > width / 3) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({
        dragging: false,
        dragOffset: newOffset
      });
      this.props.onClose();
      return;
    }

    // If dragged further left, ignore
    if (newOffset < 0) newOffset = 0;

    this.setState({
      dragOffset: newOffset,
      prevx: x
    });

    return false;
  };

  handleResponderMouseUp = event => {
    console.log('Up:', event.nativeEvent);
    const { dragOffset, dragTs, edgeSize, width } = this.state;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Check if the velocity is big enough
    const velocity = dragOffset / (Date.now() - dragTs);
    if (velocity > 0.5) {
      this.setState({
        dragging: false,
        dragOffset: dragOffset + velocity * 200
      });
      this.props.onClose();
    } else {
      this.setState({
        dragging: false,
        dragOffset: 0
      });
    }
  };

  handleResponderTerminationRequest = event => {
    const { dragging } = this.state;
    console.log('Terminate req:', dragging);
    return !dragging;
  };

  handleResponderTerminate = event => {
    console.log('Terminated:', event.nativeEvent);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      dragging: false,
      dragOffset: 0
    });
  };

  componentWillReceiveProps(newProps) {
    if (newProps.open !== this.props.open) {
      if (newProps.open) {
        this.setState({ dragOffset: 0, dragging: false });
      }
    }
  }

  render() {
    const { children, open, edgeSize, style, width } = this.props;
    const { dragOffset } = this.state;

    return (
      <View
        style={[
          {
            position: "absolute",
            bottom: 0,
            top: 0,
            width: width - edgeSize,
            left: open ? edgeSize + dragOffset : width + 1
          },
          style
        ]}
        onMoveShouldSetResponder={this.handleResponderMoveStart}
        onResponderMove={this.handleResponderMouseMove}
        onResponderRelease={this.handleResponderMouseUp}
        onResponderTerminationRequest={this.handleResponderTerminationRequest}
        onResponderTerminate={this.handleResponderTerminate}
      >
        {this.props.children}
      </View>
    );
  }
}
