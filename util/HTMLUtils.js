import entities from "entities";
import { Parser } from "htmlparser2-without-node-native";

const AUTOCLOSING_TAGS = ["br"];
const BLOCK_TAGS = ["p", "div", "h1", "h2", "h3", "h4", "h5"];

/**
 * Helper stateful class for generating HTML contents from the DOM parser
 */
class HTMLGenerator {
  contents = "";

  stringifyAttributes(attributes) {
    return Object.keys(attributes).reduce((str, attrib) => {
      return str + ` ${attrib}="${attributes[attrib]}"`;
    }, "");
  }

  openTag(name, attrib) {
    if (AUTOCLOSING_TAGS.indexOf(name) == -1) {
      this.contents += `<${name}${this.stringifyAttributes(attrib)}>`;
    } else {
      this.contents += `<${name}/>`;
    }
  }

  closeTag(name) {
    if (AUTOCLOSING_TAGS.indexOf(name) == -1) {
      this.contents += `</${name}>`;
      if (BLOCK_TAGS.indexOf(name) !== -1) this.contents += "\n";
    }
  }

  text(text) {
    this.contents += text;
  }
}

/**
 * Helper module for parsing HTML using the smallest possible dependencies
 */
export function extractFragment(html, matchFn) {
  return new Promise((accept, reject) => {
    let found = false;
    let completed = false;
    let stack = 0;
    let gen = new HTMLGenerator();

    const parser = new Parser(
      {
        onopentag: function(name, attrib) {
          if (!found) {
            if (matchFn(name, attrib)) {
              console.debug(`Starting on: `, name, attrib);
              found = true;
              stack = 1;
              gen.openTag(name, attrib);
            }
          } else if (!completed) {
            stack++;
            gen.openTag(name, attrib);
          }
        },
        ontext: function(text) {
          if (found && !completed) {
            gen.text(text);
          }
        },
        onclosetag: function(tagname) {
          if (found && !completed) {
            gen.closeTag(tagname);
            if (--stack === 0) completed = true;
          }
        },
        onend: function() {
          accept(gen.contents);
        },
        onerror: function(error) {
          reject(error)
        }
      },
      { decodeEntities: false, recognizeSelfClosing: true }
    );

    parser.write(html);
    parser.end();
  });
}
