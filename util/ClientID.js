import { AsyncStorage } from "react-native";

/**
 * Creates a random 5-character long ID
 */
function makeid() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

/**
 * We don't want to create a new user on the chat server every time we re-launch
 * the application, so we are caching a random ID on the initial app launch.
 */
export function getClientIdAsync() {
  return new Promise(accept => {
    AsyncStorage.getItem("@global:id").then(result => {
      // Create a new ID if we don't have one already
      if (result == null) {
        result = makeid();
        AsyncStorage.setItem("@global:id", result);
      }

      // Complete promise
      console.log("MY ID IS ", result);
      accept(result);
    });
  });
}

/**
 * Renew the client ID
 */
export function renewClientIdAsync() {
  const newID = makeid();
  console.log("MY NEW ID IS ", newID);
  return AsyncStorage.setItem("@global:id", newID);
}
