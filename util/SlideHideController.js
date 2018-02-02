/**
 * A class that tracks the location of a specific scrollable view and propagates
 * the scroll down to the master component.
 */
class SlideHideControllerComponentState {
  constructor(parent) {
    this.position = 0;
    this.parent = parent;
  }

  handler = event => {
    const lastPosition = this.position;
    let position = event.nativeEvent.contentOffset.y;
    let maxHeight =
      event.nativeEvent.contentSize.height -
      event.nativeEvent.layoutMeasurement.height -
      this.parent.maxDistance;

    // Ignore bounce
    if (position < 0) position = 0;
    if (position > maxHeight) position = maxHeight;

    console.log('pos=', position);

    // Forward the update to the parent
    if (position != lastPosition) {
      this.parent.updateDirection(position - lastPosition);
    }

    this.position = position;
  };
}

/**
 * A stateful component that tracks the slide position of various components
 * and calls-out when a slide operation should take place.
 */
export default class SlideHideController {
  constructor({ onHideChangeCallback = () => {}, distance = 60 }) {
    this.onHideChangeCallback = onHideChangeCallback;
    this.components = {};

    this.position = 0;
    this.maxDistance = distance;
  }

  updateDirection(delta) {
    this.position = Math.max(
      0,
      Math.min(this.maxDistance, this.position + delta)
    );
    this.onHideChangeCallback(this.position / this.maxDistance);
  }

  /**
   * Return a singleton instance of the handler function for the given component
   */
  handleFor(component) {
    if (this.components[component] == null) {
      this.components[component] = new SlideHideControllerComponentState(this);
    }

    return this.components[component].handler;
  }
}
