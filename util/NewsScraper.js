import entities from "entities";
import { extractFragment } from "./HTMLUtils";
const H1_CONTENTS = /<h1.*?>(.*?)<\/h1>/;
const IMG_BIGPHOTO = /bigphoto[\s\S]*?img[\s\S]*?src="(.*?)"/;

/*
 * Locate the title and the main content from the given HTML body.
 * The body is within the <div id="maintext"> element and the title
 * is obtained by the first <h1> tag.
 */
export function scrapeFromHTML(body) {
  return extractFragment(body, (name, attrib) => {
    return name === "div" && attrib["id"] === "maintext";
  }).then(bodyFragment => {
    const title = H1_CONTENTS.exec(body);
    const image = IMG_BIGPHOTO.exec(body);
    const STRIP_TAGS = /(<([^>]+)>)/gi;

    return {
      image:
        image &&
        image[1],
      title:
        title &&
        entities
          .decodeHTML(title[1])
          .replace(STRIP_TAGS, "")
          .trim(),
      body: bodyFragment
    };
  });
}

/**
 * Place an HTTP request and scrape the contents of the response
 */
export function scrapeFromURL(url) {
  console.debug(`NewsScraper: Scraping contents of ${url}`);
  return fetch(url).then(response => {
    if (!response.ok) {
      return null;
    }

    return response.text().then(buffer => {
      if (!buffer) {
        return null;
      }

      return scrapeFromHTML(buffer);
    });
  });
}
