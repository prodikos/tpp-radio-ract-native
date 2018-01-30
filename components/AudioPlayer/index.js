import PropTypes from "prop-types";
import React from "react";
import Sound from "react-native-sound";
import { View } from "react-native";

Sound.setCategory("Playback", true);

/**
 * How long to wait before considering the stream down
 */
const BUFFERING_TIMEOUT = 30000;

export default class AudioPlayer extends React.Component {
  static propTypes = {
    autorestart: PropTypes.bool,
    playing: PropTypes.bool,
    url: PropTypes.string,
    volume: PropTypes.number,

    onBusyChange: PropTypes.func,
    onPlayingChange: PropTypes.func,
    onStatusChange: PropTypes.func,
  };

  static defaultProps = {
    autorestart: true,
    playing: false,
    url: null,
    volume: 1.0,

    onBusyChange() {},
    onPlayingChange() {},
    onStatusChange(prev, next) {}
  };

  constructor(props) {
    super(props);

    // Status flags
    this.flags = {
      playing: false,
      loaded: false,
      retrying: false,
      busy: false,
      buffering: false
    };

    // Local objects
    this.sound = null;
    this.loadingTimeout = null;
    this.retryTimer = null;
    this.pollingTimer = null;
    this.lastTs = null;
    this.bufferingTs = null;
  }

  componentDidMount() {
    const { playing } = this.props;

    // Start playing at mount
    console.debug(`AudioPlayer: Mounted, playing=${playing}`);
    if (playing) this.loadSound();
  }

  componentWillUnmount() {
    if (this.sound) {
      this.stopPlayback(() => {
        this.unloadSound();
      });
    }
  }

  /**
   * Update the status flags and trigger the appropriate callbacks
   */
  updateStatusFlags = flags => {
    console.debug(`AudioPlayer: Update flags=`, flags);
    const original = Object.assign({}, this.flags);
    let triggerUpdate = false;

    Object.keys(flags).forEach(key => {
      const value = flags[key];
      if (this.flags[key] !== value) this.flags[key] = value;

      if (key == "playing") {
        this.props.onPlayingChange(value);
      } else if (key == "busy") {
        this.props.onBusyChange(value);
      }
    });

    this.props.onStatusChange(this.flags, original);
  };

  /**
   * Check what's the current playback statis
   */
  handlePoll = _ => {
    const { buffering } = this.flags;
    if (!this.sound) {
      return;
    }

    this.sound.getCurrentTime((seconds, isPlaying) => {
      console.info(`seconds=${seconds}, isPlaying=${isPlaying}`);
      if (this.lastTs == seconds) {
        if (!buffering) {
          this.updateStatusFlags({ buffering: true });
          this.bufferingTs = Date.now();
        } else if (Date.now() - this.bufferingTs > BUFFERING_TIMEOUT) {
          console.info(`AudioPlayer: Stalled in buffering for too long`);
          this.handleStop();
        }
      } else {
        if (buffering) this.updateStatusFlags({ buffering: false });
      }
      this.lastTs = seconds;
    });
  };

  /**
   * Enable the polling timer
   */
  startPolling = _ => {
    this.lastTs = 0;
    this.updateStatusFlags({ buffering: true });
    this.pollingTimer = setInterval(this.handlePoll, 500);
  };

  /**
   * Disable the polling timer
   */
  stopPolling = _ => {
    clearTimeout(this.pollingTimer);
    this.pollingTimer = null;
  };

  /**
   * A loading error occurred
   */
  handleError = error => {
    console.debug(`AudioPlayer: Playback error=`, error);
    const { playing, autorestart } = this.props;

    this.updateStatusFlags({ playing: false, loaded: false, busy: false });
    this.stopPolling();
    if (playing && autorestart) {
      this.retryPlayback();
    }
  };

  /**
   * The stream has stopped or a decoding failure encountered
   */
  handleStop = () => {
    console.debug(`AudioPlayer: Playback stopped`);
    const { playing, autorestart } = this.props;

    this.updateStatusFlags({ playing: false });
    this.stopPolling();
    if (playing && autorestart) {
      this.retryPlayback();
    }
  };

  /**
   * The sound is loaded and ready for playback
   */
  handleLoaded = () => {
    console.debug(`AudioPlayer: Sound loaded`);
    const { playing } = this.props;
    this.updateStatusFlags({ loaded: true, busy: false });

    if (playing) {
      this.startPlayback();
    } else {
      this.unloadSound();
    }
  };

  /**
   * Reset the retry timeout flags
   */
  resetRetryTimeout = () => {
    console.debug(`AudioPlayer: [Retry] Reset`);

    this.updateStatusFlags({ retrying: false });
    clearTimeout(this.retryTimer);
    this.retryTimer = null;
  };

  /**
   * Handle restart triggered by the retry timeout
   */
  handleRetryTimeout = () => {
    console.debug(`AudioPlayer: [Retry] Timeout`);
    const { playing } = this.props;

    // Reset retry flag
    this.resetRetryTimeout();
    if (!playing) return;

    // Re-load the audio
    this.loadSound();
  };

  /**
   * Schedule a re-try on the playback
   */
  retryPlayback = () => {
    console.debug(`AudioPlayer: [Retry] Attempting retry`);
    const { playing } = this.props;
    if (!playing) return;

    // Schedule an attempt to re-start the stream
    const scheduleRetry = () => {
      console.debug(`AudioPlayer: [Retry] Scheduling`);
      clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(this.handleRetryTimeout, 5000);
    };

    this.updateStatusFlags({ retrying: true });

    // Unload audio and schedule retry
    if (this.sound) {
      this.stopPlayback(() => {
        this.unloadSound();
        scheduleRetry();
      });
    } else {
      scheduleRetry();
    }
  };

  /**
   * Release resources occupied by this sound object
   */
  unloadSound() {
    console.debug(`AudioPlayer: Unloading`);
    if (this.sound) {
      this.updateStatusFlags({ loaded: false, buffering: false });
      this.sound.release();
      this.sound = null;
    }
  }

  /**
   * Load the sound source and if we are playing, start playback
   */
  loadSound() {
    const { url } = this.props;
    console.debug(`AudioPlayer: Load from ${url}`);

    // Cap the time we are going to wait for the sound to be loaded
    var timedOut = false;
    var loadingTimeout = setTimeout(() => {
      console.debug(
        `AudioPlayer: Timed out while waiting for the sound to load`
      );
      this.unloadSound();

      console.debug(
        `AudioPlayer: playing=${this.props.playing}, autorestart=${this.props
          .autorestart}`
      );
      if (this.props.playing && this.props.autorestart) {
        this.retryPlayback();
      }
    }, 20000);

    // Create an instance to the sound object and callback when sound is
    // ready to be played
    this.updateStatusFlags({ busy: true });
    this.sound = new Sound(url, "", (error, sound) => {
      clearTimeout(loadingTimeout);

      // Check if loading took so long that the user aborted playback
      if (!this.props.playing) {
        console.debug(`AudioPlayer: Sound loaded but no longer playing`);
        return;
      }

      // Check if we timed out in the process
      if (timedOut) {
        console.debug(`AudioPlayer: Sound loaded but timed out`);
        return;
      }

      // Handle result
      if (error) {
        this.handleError(error);
      } else {
        this.handleLoaded();
      }
    });
  }

  /**
   * Stop the current playback and fire the given callback
   */
  stopPlayback = callback => {
    console.debug(`AudioPlayer: Stop playback`);
    if (!this.sound) {
      console.debug(`AudioPlayer: Stop: Missing sound`);
      callback();
      return;
    }

    if (!this.sound.isLoaded()) {
      console.debug(`AudioPlayer: Stop: Sound not loaded`);
      callback();
      return;
    }

    // If everything fails, call the callback with a timer
    const failureTimeout = setTimeout(() => {
      console.debug(`AudioPlayer: Stop: Failed to stop sound on time`);
      callback();
    }, 5000);
    this.updateStatusFlags({ busy: true, buffering: false });
    this.sound.getCurrentTime((seconds, isPlaying) => {
      // If the audio is not already playing, we are done
      if (!isPlaying) {
        console.debug(`AudioPlayer: Stop: Sound not playing`);
        this.updateStatusFlags({ busy: true });
        clearTimeout(failureTimeout);
        callback();
        return;
      }

      // Stop playback
      console.debug(`AudioPlayer: Stop: Stopping sound`);
      this.stopPolling();
      this.sound.stop(() => {
        console.debug(`AudioPlayer: Stop: Stound stopped`);
        this.updateStatusFlags({ playing: false, busy: false });
        clearTimeout(failureTimeout);
        callback();
      });
    });
  };

  /**
   * Start playback of the sound
   */
  startPlayback() {
    console.debug(`AudioPlayer: Start: Starting playback`);
    const { playing, volume } = this.props;

    if (!playing) {
      console.debug(`AudioPlayer: Start: User requested to stop playing`);
      return;
    }
    if (!this.sound || !this.sound.isLoaded()) {
      console.debug(`AudioPlayer: Start: Sound object missing or not loaded`);
      return;
    }

    // Start playback and add a hook when it's completed
    console.debug(`AudioPlayer: Start: Starting playback`);
    this.updateStatusFlags({ playing: true });
    this.sound.setVolume(volume);
    this.sound.play(this.handleStop);
    this.startPolling();
  }

  /**
   * Handle attribute switching
   */
  componentWillReceiveProps(newProps) {
    const { playing, volume } = newProps;
    console.debug(
      `AudioPlayer: Properties changed from`,
      this.props,
      "to",
      newProps
    );

    // Toggle playback state
    if (playing !== this.props.playing) {
      console.debug(`AudioPlayer: Playing changed to`, playing);
      if (playing) {
        // Start playback
        if (this.flags.playing) {
          console.debug(`AudioPlayer: Already playing, doing nothing`);
          return;
        } else if (this.flags.loaded) {
          console.debug(`AudioPlayer: Loaded but not playing, will play`);
          this.startPlayback();
        } else {
          console.debug(`AudioPlayer: Not loaded, will load`);
          this.loadSound();
        }
      } else {
        // Stop playback
        if (!this.flags.loaded) {
          console.debug(`AudioPlayer: Not loaded, doing nothing`);
          return;
        }
        if (this.flags.playing) {
          console.debug(`AudioPlayer: Playing, will try to stop and unload`);
          this.stopPlayback(() => {
            console.debug(`AudioPlayer: Stopped playing, will unload`);
            this.unloadSound();
          });
        } else if (this.flags.retrying) {
          console.debug(
            `AudioPlayer: Not playing, but in a retry loop, will cancel`
          );
          this.resetRetryTimeout();
        } else {
          console.debug(`AudioPlayer: Loaded but not playing, unloading it`);
          this.unloadSound();
        }
      }
    }

    // Change volume
    if (volume !== this.props.volume) {
      console.debug(`AudioPlayer: Changed volume to`, volume);
      if (this.flags.playing && this.sound != null) {
        console.debug(`AudioPlayer: Changing live sound volume`);
        this.sound.setVolume(volume);
      }
    }
  }

  render() {
    return <View />;
  }
}
