import PropTypes from "prop-types";
import React from "react";
import { View, Platform } from "react-native";
import NotificationsIOS, { NotificationsAndroid } from 'react-native-notifications';

const GlobalNotificationListeners = [];
const NotificationsIOSCategories = {};

function handleNotificationOpened(info) {
  console.log('Notification Opened:', info);
  GlobalNotificationListeners.forEach(fn => fn(info.data ? info.data : info._data));
}

function notificationReceivedForeground(...args) {
  console.log('Notification fg:', args);
}

if (Platform.OS == 'ios') {
  NotificationsIOS.addEventListener('notificationOpened', handleNotificationOpened);
  NotificationsIOS.addEventListener('notificationReceivedBackground', n => {console.log('Notification bg:', n)});
  NotificationsIOS.addEventListener('notificationReceivedForeground', n => notificationReceivedForeground);
  NotificationsIOS.requestPermissions([])
  NotificationsIOS.consumeBackgroundQueue();
} else {
  NotificationsAndroid.setNotificationOpenedListener(handleNotificationOpened);
}

export default class SystemNotification extends React.Component {
  static propTypes = {
    message: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    sticky: PropTypes.bool,
    silent: PropTypes.bool,
    visible: PropTypes.bool,

    onDismiss: PropTypes.func
  };

  static defaultProps = {
    sticky: true,
    silent: true,
    visible: true,

    onDismiss() {}
  };

  constructor(props) {
    super(props);
    this.id = String((Math.random() * 0x7FFFFFFF) & 0x7FFFFFFF);
    this.visible = false;
    this.notification = null;
  }

  handleNotification = notification => {
    if (this.id != notification.id) return;

    // Re-dispatch if message is sticky, otherwise call onDismiss
    if (this.props.sticky) {
      setTimeout(() => {
        this.showNotification();
      }, 50);
    } else {
      this.props.onDismiss();
    }
  };

  showNotification = () => {
    const id = this.id;
    const { title, message, sticky, silent } = this.props;

    console.log("Showing local notification: ", { title, message });

    this.hideNotification();
    if (Platform.OS == 'ios') {
      this.notification = NotificationsIOS.localNotification({
        id,
        alertBody: title,
        alertTitle: message,
        silent,
        category: "DEFAULT",
        userInfo: { id }
      });
    } else {
      this.notification = NotificationsAndroid.localNotification({
        id,
        title,
        body: message,
        ongoing: true,
        silent
      });
    }
  };

  hideNotification = () => {
    if (this.notification == null) return;
    console.log("Canceling local notification");
    if (Platform.OS == 'ios') {
      NotificationsIOS.cancelLocalNotification(this.notification);
    } else {
      NotificationsAndroid.cancelLocalNotification(this.notification);
    }
  };

  /**
   * Show notifications at mount
   */
  componentDidMount() {
    if (this.props.visible) this.showNotification();
    // Subscribe to the notification listeners
    GlobalNotificationListeners.push(this.handleNotification);
  }

  /**
   * Hide notifications at unmount
   */
  componentWillUnmount() {
    this.hideNotification();
    // Unsubscribe from the notification linsteners
    const i = GlobalNotificationListeners.indexOf(this.handleNotification);
    GlobalNotificationListeners.splice(i, 1);
  }

  /**
   * Handle notification visibility based on properties
   */
  componentWillReceiveProps(newProps) {
    if (newProps.visible !== this.props.visible) {
      console.log("Props changed: ", newProps.visible);
      if (newProps.visible) {
        this.showNotification();
      } else {
        this.hideNotification();
      }
    }
  }

  render() {
    return null;
  }
}
