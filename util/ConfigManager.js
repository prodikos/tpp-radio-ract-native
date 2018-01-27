import DefaultConfig from "../Config";
import { AsyncStorage } from "react-native";

const CONFIG_EXPIRE_TIMEOUT = 3600;
const CONFIG_KEY = "@global:config";
const CONFIG_UPSTERAM_URL = "https://www.thepressproject.gr/xml/radio.json";

var getConfigSingleton = null;

/**
 * Check if there is a newer config and fetch it
 */
export function getConfig() {
  if (getConfigSingleton == null) {
    getConfigSingleton = new Promise(resolve => {
      resolve(DefaultConfig);
      return;


      console.debug("ConfigManager: Checking stored config");

      AsyncStorage.getItem(CONFIG_KEY).then(result => {
        console.debug(`ConfigManager: Got '${result}'`);
        let config = null;

        // Use the saved result if available, otherwise fall back
        // to the default configuration we have hard-coded
        if (result == null) {
          config = DefaultConfig;
          console.debug(`ConfigManager: Config missing, using default`);
        } else {
          config = JSON.parse(result);
          console.debug(`ConfigManager: Using recovered config: ${config}`);
        }

        // Check if the config we have is fresh enough
        const configTimestamp = config._ts || 0;
        const configDelta = (Date.now() - configTimestamp) / 1000;
        if (configDelta < CONFIG_EXPIRE_TIMEOUT) {
          console.debug(
            `ConfigManager: Config is fresh (${configDelta} seconds)`
          );
          resolve(config);
          return;
        }

        // Check if we have a newer version available
        console.debug(`ConfigManager: Fetching updates from ${CONFIG_UPSTERAM_URL}`);
        fetch(CONFIG_UPSTERAM_URL)
          .then(response => {
            if (!response.ok) {
              console.debug(`ConfigManager: Got a failure response`);
              return resolve(config);
            }

            return response.text().then(buffer => {
              if (!buffer) {
                console.debug(`ConfigManager: Got an empty buffer`);
                return null;
              }

              const parsed = JSON.parse(buffer);
              console.debug(`ConfigManager: Got new config: ${parsed}`);

              // Make sure the configuration is sane
              if (typeof parsed.rssFeed !== "string") {
                console.debug(`ConfigManager: Invalid 'rssFeed'`);
                resolve(config);
                return;
              }
              if (typeof parsed.chatBaseUrl !== "string") {
                console.debug(`ConfigManager: Invalid 'chatBaseUrl'`);
                resolve(config);
                return;
              }
              if (typeof parsed.stream !== "string") {
                console.debug(`ConfigManager: Invalid 'stream'`);
                resolve(config);
                return;
              }
              if (typeof parsed.schedule !== "object") {
                console.debug(`ConfigManager: Invalid 'schedule'`);
                resolve(config);
                return;
              }

              // Inject timestamp
              parsed._ts = Date.now();

              // Replace the last saved config
              console.debug(`ConfigManager: Sane contents, replacing config`);
              AsyncStorage.setItem(
                CONFIG_KEY,
                JSON.stringify(parsed)
              ).then(r => {
                console.debug(`ConfigManager: Save complete`);
                resolve(parsed);
              });
            });
          })
          .catch(e => {
            console.debug(`ConfigManager: Got an error: ${e}`);
            resolve(config);
          });
      });
    });
  }

  return getConfigSingleton;
}
