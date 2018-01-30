
# The following files had to be patched

## `react-native-notifications`/PushNotificationPros.java

Added "silent" and "ongoing":

```java
    public PushNotificationProps(String title, String body, Boolean silent, Boolean ongoing) {
        mBundle = new Bundle();
        mBundle.putString("title", title);
        mBundle.putString("body", body);
        mBundle.putBoolean("silent", silent);
        mBundle.putBoolean("ongoing", silent);
    }

    public PushNotificationProps(Bundle bundle) {
        mBundle = bundle;
    }

    public String getTitle() {
        return mBundle.getString("title");
    }

    public String getBody() {
        return mBundle.getString("body");
    }

    public Boolean getSilent() { return mBundle.getBoolean("silent"); }

    public Boolean getOngoing() { return mBundle.getBoolean("ongoing"); }
```

## `react-native-notifications`/PushNotification.java

Added support for silent and ongoing:

```java
    protected Notification.Builder getNotificationBuilder(PendingIntent intent) {
        return new Notification.Builder(mContext)
                .setContentTitle(mNotificationProps.getTitle())
                .setContentText(mNotificationProps.getBody())
                .setSmallIcon(mContext.getApplicationInfo().icon)
                .setContentIntent(intent)
                .setDefaults(mNotificationProps.getSilent()
                        ? Notification.DEFAULT_LIGHTS
                        : Notification.DEFAULT_ALL)
                .setOngoing(mNotificationProps.getOngoing())
                .setAutoCancel(true);
    }
```
