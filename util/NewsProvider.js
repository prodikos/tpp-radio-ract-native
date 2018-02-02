import { Parser } from "htmlparser2-without-node-native";
import { AsyncStorage } from "react-native";
import { EventEmitter } from "events";
import ExtendedFeedHandler from './ExtendedFeedHandler';

import { getConfig } from "./ConfigManager";

/**
 * Parse the RSS/RDF/Atom contents from the string given using
 * the htmlparser2 FeedHandler. This will yield an object with
 * an `items` array, with the news items.
 */
function parseFeedString(rss) {
  return new Promise((resolve, reject) => {
    const handler = new ExtendedFeedHandler((error, feed) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(feed);
    });
    const dom = handler.dom;
    const parser = new Parser(handler, {
      decodeEntities: true,
      xmlMode: true
    });
    parser.write(rss);
    parser.end();
  });
}

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

            this._changedFlag = false;

            // return new Promise(resolve => {

            return parseFeedString(buffer).then(feed => {
              const channelMeta = {
                description: feed.description,
                title: feed.title
              };

              (feed.items || []).forEach(item => {
                // Get item metadata
                const itemMeta = {
                  guid: item.id,
                  title: item.title,
                  link: item.link,
                  image: item.image,
                  date: item.pubDate,
                  description: item.description
                };

                // Process the RSS item
                console.debug(`Newsfeed: Found item`, itemMeta);
                this.handleRSSItem(itemMeta, channelMeta);
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
