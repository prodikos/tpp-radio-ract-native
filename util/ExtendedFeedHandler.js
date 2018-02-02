import { DomHandler, DomUtils } from "htmlparser2-without-node-native";

/**
 * An extension of the default FeedHandler that also supports images
 */
function ExtendedFeedHandler(callback, options) {
  this.init(callback, options);
}

require("inherits")(ExtendedFeedHandler, DomHandler);

ExtendedFeedHandler.prototype.init = DomHandler;

function getElements(what, where) {
  return DomUtils.getElementsByTagName(what, where, true);
}
function getOneElement(what, where) {
  return DomUtils.getElementsByTagName(what, where, true, 1)[0];
}
function fetch(what, where, recurse) {
  return DomUtils.getText(
    DomUtils.getElementsByTagName(what, where, recurse, 1)
  ).trim();
}

function addConditionally(obj, prop, what, where, recurse) {
  var tmp = fetch(what, where, recurse);
  if (tmp) obj[prop] = tmp;
}

var isValidFeed = function(value) {
  return value === "rss" || value === "feed" || value === "rdf:RDF";
};

ExtendedFeedHandler.prototype.onend = function() {
  var feed = {},
    feedRoot = getOneElement(isValidFeed, this.dom),
    tmp,
    childs;

  if (feedRoot) {
    if (feedRoot.name === "feed") {
      childs = feedRoot.children;

      feed.type = "atom";
      addConditionally(feed, "id", "id", childs);
      addConditionally(feed, "title", "title", childs);
      if (
        (tmp = getOneElement("link", childs)) &&
        (tmp = tmp.attribs) &&
        (tmp = tmp.href)
      )
        feed.link = tmp;
      addConditionally(feed, "description", "subtitle", childs);
      if ((tmp = fetch("updated", childs))) feed.updated = tmp;
      addConditionally(feed, "author", "email", childs, true);

      feed.items = getElements("entry", childs).map(function(item) {
        var entry = {},
          tmp;

        item = item.children;

        addConditionally(entry, "id", "id", item);
        addConditionally(entry, "title", "title", item);
        if (
          (tmp = getOneElement("link", item)) &&
          (tmp = tmp.attribs) &&
          (tmp = tmp.href)
        )
          entry.link = tmp;
        if ((tmp = fetch("summary", item) || fetch("content", item)))
          entry.description = tmp;
        if ((tmp = fetch("updated", item))) entry.pubDate = tmp;
        if ((tmp = fetch("image", item))) entry.image = tmp;
        return entry;
      });
    } else {
      childs = getOneElement("channel", feedRoot.children).children;

      feed.type = feedRoot.name.substr(0, 3);
      feed.id = "";
      addConditionally(feed, "title", "title", childs);
      addConditionally(feed, "link", "link", childs);
      addConditionally(feed, "description", "description", childs);
      if ((tmp = fetch("lastBuildDate", childs))) feed.updated = tmp;
      addConditionally(feed, "author", "managingEditor", childs, true);

      feed.items = getElements("item", feedRoot.children).map(function(item) {
        var entry = {},
          tmp;

        item = item.children;

        addConditionally(entry, "id", "guid", item);
        addConditionally(entry, "title", "title", item);
        addConditionally(entry, "link", "link", item);
        addConditionally(entry, "description", "description", item);
        if ((tmp = fetch("pubDate", item))) entry.pubDate = tmp;
        if ((tmp = fetch("url", getOneElement("image", item))))
          entry.image = tmp;
        return entry;
      });
    }
  }
  this.dom = feed;
  DomHandler.prototype._handleCallback.call(
    this,
    feedRoot ? null : Error("couldn't find root of feed")
  );
};

export default ExtendedFeedHandler;
