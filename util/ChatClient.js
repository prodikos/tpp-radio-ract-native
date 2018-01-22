import { urlEncode } from "./Network";
import { getClientIdAsync, renewClientIdAsync } from "./ClientID";

import Config from '../Config';

/**
 * Parse chat features from the HTML response
 */
function parseMessageFeatures(message_html) {
  const PARSE_MSGTAGS = /<span class="(.*?)">(.*?)<.*?>|<img .*?src="(.*?)".*?>|<a href="(.*?)".*?>(.*?)<\/a>/;
  var m,
    chunks = [],
    message = message_html.trim();

  // Try to extract features in the message in separate chuns
  while ((m = PARSE_MSGTAGS.exec(message))) {
    const text = message.substr(0, m.index);
    if (text) {
      chunks.push({
        type: "text",
        text
      });
    }
    message = message.substr(m.index + m[0].length);

    // Handle span tags
    if (m[1]) {
      switch (m[1]) {
        case "my_notice":
          chunks.push({
            type: "notice",
            text: m[2]
          });
          break;
        default:
          chunks.push({
            type: "text",
            text: m[2]
          });
      }

      // Handle images
    } else if (m[3]) {
      chunks.push({
        type: "image",
        src: m[3]
      });

      // Handle links
    } else if (m[4]) {
      chunks.push({
        type: "link",
        href: m[4],
        text: m[5]
      });
    }
  }

  // Chunk any remainders as text
  if (message) {
    chunks.push({
      type: "text",
      text: message
    });
  }
  return chunks;
}

/**
 * Parse messages from the BoomChat HTML response
 */
function parseMessages(html) {
  const PARSE_MSGLINE = /<li class="(.*?)"><div value="(.*?)".*?<img class="avatar_chat" src="(.*?)".*span> : (.*?)<span class="logs_date">(.*?)</g;
  let m,
    lines = [],
    dup_keys = {};

  while ((m = PARSE_MSGLINE.exec(html))) {

    // A little trick to avoid duplicate keys, yet
    // keeping the association correct
    let key = m[2] + ":" + m[5];
    while (dup_keys[key] != null) key += "+";
    dup_keys[key] = true;

    // Track line
    lines.push({
      classes: m[1].split(" "),
      user: m[2],
      avatar: m[3],
      text: parseMessageFeatures(m[4]),
      date: m[5],
      key: key
    });

  }
  return lines;
}

/**
 * The chat client provides an abstraction to the BoomChat API
 */
class ChatClient {
  constructor(baseUrl, room = 1) {
    this.baseUrl = baseUrl;
    this.room = room;
  }

  /**
   * Return all the messages in the chat asynchronously
   */
  getChatAsync() {
    return fetch(
      this.baseUrl +
        "/system/chat_log.php?rank=1&access=4&room=1&bottom=1&target=none&rlc=0&clogs=0&chr=1&count=0&_" +
        Date.now()
    ).then(response => {
      if (!response.ok) {
        return null;
      }

      return response.text().then(buffer => {
        if (!buffer) {
          return null;
        }

        const parsed = JSON.parse(buffer);
        return parseMessages(parsed["log1"]);
      });
    });
  }

  /**
   * Update user status (online beacon)
   */
  updateUserPresence() {
    return fetch(this.baseUrl + '/system/user_status.php?_=' + Date.now());
  }

  /**
   * Login as guest using the random client ID
   */
  loginGuestAsync() {
    return getClientIdAsync().then(clientid => {
      return fetch(this.baseUrl + "/registration.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlEncode({
          password: "guest",
          username: "tppmobile_" + clientid,
          email: "guest@boomguest.com",
          age: 0,
          gender: 0,
          country: 0,
          region: 0,
          uagree: true
        })
      })
      .then(response => response.text())
      .then(code => {
        const numCode = parseInt(code);

        if (numCode == 5) { // ID already exists, get a new one and re-try
          return renewClientIdAsync().then(_ => this.loginGuestAsync())
        } else {
          return this.updateUserPresence()
        }
      });
    });
  }

  /**
   * Login as a member with known password
   */
  loginMemberAsync(username, password) {
    return fetch(this.baseUrl + "/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: urlEncode({
        password: password,
        username: username
      })
    }).then(_ => this.updateUserPresence());
  }

  /**
   * Log the user ount
   */
  logoutAsync() {
    return fetch(this.baseUrl + "/logout.php");
  }
}

// Export a singleton
const chatClient = new ChatClient(Config.chatBaseUrl);
export default chatClient;