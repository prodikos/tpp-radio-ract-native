import { parseString } from "react-native-xml2js";
import { AsyncStorage } from "react-native";
import { EventEmitter } from "events";

import { getConfig } from "./ConfigManager";

/**
 * A registry of news entries
 */
class NewsProvider extends EventEmitter {
  constructor(capacity = 100) {
    super();

    this._changedFlag = false;
    this.capacity = capacity;
    this.news = [];
    this.initialLoadPromise = this.load();
  }

  save() {
    const payload = JSON.stringify(this.news);
    console.debug(`Newsfeed: Saving news database:`, payload);
    return AsyncStorage.setItem(`@news/store`, payload);
  }

  load() {
    console.debug(`Newsfeed: Recovering saved items`);
    return AsyncStorage.getItem(`@news/store`).then(dNews => {
      if (!dNews) {
        console.debug(`Newsfeed: No items to recover`);
        this.news = [];
        return [];
      }

      this.news = JSON.parse(dNews);

      console.debug(`Newsfeed: Recovered ${this.news.length} items`);
      return this.news;
    });
  }

  /**
   * Handle a discovered new RSS item
   */
  handleRSSItem(item, channel) {
    if (this.news.some(known => known.guid == item.guid)) {
      console.debug(`Newsfeed: Ignoring existing item`, item);
      return;
    }

    // Inject item metadata
    item.meta = {};
    this.news.push(item);

    // Drop over-capacity items
    if (this.news.length > this.capacity) {
      const drop = this.news.splice(0, this.news.length - this.capacity);
      drop.forEach(item => {
        console.debug(`Newsfeed: Dropping over-capacity item`, item);
        this.emit("removed", item);
      });
    }

    // Trigger updates
    console.debug(`Newsfeed: Added new item`, item);
    this.emit("added", item);
    this._changedFlag = true;
  }

  /**
   * Update item's meta-information
   */
  updateItemMeta(item, meta) {
    let found = false;

    // Update the metadata of matched item
    for (var i = 0; i < this.news.length; ++i) {
      if (this.news[i].guid == item.guid) {
        this.news[i].meta = meta;
        break;
      }
    }

    // If we have updated an item, save changes
    if (found) this.save();
  }

  /**
   *
   */
  lastResults() {
    return this.initialLoadPromise;
  }

  /**
   * Update the the news store from the RSS feed
   */
  update() {
    console.debug(`Newsfeed: Checking for updates`);
    return getConfig()
      .then(({ rssFeed }) => {
        console.debug(`Newsfeed: Fetching news from ${rssFeed}`);
        return fetch(rssFeed).then(response => {
          if (!response.ok) {
            console.debug(`Newsfeed: Not a failure resposne from the server`);
            return this.news;
          }

          return response.text().then(buffer => {
            if (!buffer) {
              console.debug(`Newsfeed: Got an empty buffer`);
              return this.news;
            }

            return new Promise(resolve => {
              this._changedFlag = false;
              parseString(buffer, (err, result) => {
                if (err) {
                  console.debug(`Newsfeed: Unable to parse XML Feed: ${err}`);
                  resolve(this.news);
                  return;
                }

                if (result.rss == null) {
                  console.debug(`Newsfeed: <rss> tag not found`);
                  resolve(this.news);
                  return;
                }
                if (!Array.isArray(result.rss.channel)) {
                  console.debug(
                    `Newsfeed: Invalid or missing <channel> tag not found`
                  );
                  resolve(this.news);
                  return;
                }

                // Process channels and their items
                result.rss.channel.forEach(channel => {
                  if (!Array.isArray(channel.item)) {
                    console.debug(
                      `Newsfeed: Invalid or missing <item> tag not found`
                    );
                    return;
                  }

                  // Get channel metadata
                  const channelMeta = {
                    title: channel.title && channel.title[0],
                    link: channel.link && channel.link[0],
                    description: channel.description && channel.description[0]
                  };

                  console.debug(`Newsfeed: Processing channel`, channelMeta);
                  channel.item.forEach(item => {
                    // Get item metadata
                    const itemMeta = {
                      guid: item.guid && item.guid[0],
                      title: item.title && item.title[0],
                      link: item.link && item.link[0],
                      image: item.image && item.image[0].url && item.image[0].url[0],
                      date: item.pubDate && item.pubDate[0],
                      description: item.description && item.description[0]
                    };

                    // Process the RSS item
                    console.debug(`Newsfeed: Found item`, itemMeta);
                    this.handleRSSItem(itemMeta, channelMeta);
                  });
                });

                // If we were changed, save changes and trigger update event
                if (this._changedFlag) {
                  console.debug(`Newsfeed: There were items added, will save`);
                  this.save();
                  this.emit("updated");
                } else {
                  console.debug(`Newsfeed: No new items discovered`);
                }

                // Resolve
                resolve(this.news);
              });
            });
          });
        });
      })
      .catch(_ => {});
  }
}

const singleton = new NewsProvider();
export default singleton;
