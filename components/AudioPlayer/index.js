import PropTypes from "prop-types";
import React from "react";
import Sound from "react-native-sound";
import { View } from "react-native";

Sound.setCategory("Playback", true);

export default class AudioPlayer extends React.Component {
  static propTypes = {
    autorestart: PropTypes.bool,
    playing: PropTypes.bool,
    url: PropTypes.string,
    volume: PropTypes.number,

    onBusyChange: PropTypes.func,
    onPlayingChange: PropTypes.func,
  };

  static defaultProps = {
    autorestart: true,
    playing: false,
    url: null,
    volume: 1.0,

    onBusyChange() {},
    onPlayingChange() {},
  };

  constructor(props) {
    super(props);

    // Status flags
    this.playing = false;
    this.loaded = false;
    this.retrying = false;
    this.busy = false;

    // Local objects
    this.sound = null;
    this.retryTimer = null;
  }

  /**
   * Update the status flags and trigger the appropriate callbacks
   */
  updateStatusFlags = flags => {
    let triggerUpdate = false;

    // Update loaded flag
    if (flags.loaded !== this.loaded) {
      this.loaded = flags.loaded;
    }

    // Update retrying flag
    if (flags.retrying !== this.retrying) {
      this.retrying = flags.retrying;
    }

    // Update playing flag
    if (flags.playing !== this.playing) {
      this.playing = flags.playing;
      this.onPlayingChange(flags.playing);
    }

    // Update busy flag
    if (flags.busy !== this.busy) {
      this.busy = flags.busy;
      this.onBusyChange(flags.busy);
    }
  };

  /**
   * A loading error occurred
   */
  handleError = error => {
    const { playing, autorestart } = this.props;

    updateStatusFlags({ playing: false, loaded: false, busy: false });
    if (playing && autorestart) {
      this.retryPlayback();
    }
  };

  /**
   * The stream has stopped or a decoding failure encountered
   */
  handleStop = () => {
    const { playing, autorestart } = this.props;

    updateStatusFlags({ playing: false });
    if (playing && autorestart) {
      this.retryPlayback();
    }
  };

  /**
   * The sound is loaded and ready for playback
   */
  handleLoaded = () => {
    const { playing } = this.props;
    updateStatusFlags({ loaded: true, busy: false });

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
    updateStatusFlags({ retrying: false });
    clearTimeout(this.retryTimer);
    this.retryTimer = null;
  };

  /**
   * Handle restart triggered by the retry timeout
   */
  handleRetryTimeout = () => {
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
    const { playing } = this.props;
    if (!playing) return;

    // Schedule an attempt to re-start the stream
    const scheduleRetry = () => {
      clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(this.handleRetryTimeout, 5000);
    };

    updateStatusFlags({ retrying: true });

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
    if (this.sound) {
      updateStatusFlags({ loaded: false });
      this.sound.release();
      this.sound = null;
    }
  }

  /**
   * Load the sound source and if we are playing, start playback
   */
  loadSound() {
    const { url } = this.props;

    // Create an instance to the sound object and callback when sound is
    // ready to be played
    this.updateStatusFlags({busy: true});
    this.localState.sound = new Sound(url, "", (error, sound) => {
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
    if (!this.sound) {
      callback();
      return;
    }

    if (!this.sound.isLoaded()) {
      callback();
      return;
    }

    // If everything fails, call the callback with a timer
    const failureTimeout = setTimeout(callback, 5000);
    this.updateStatusFlags({busy: true});
    this.sound.getCurrentTime((seconds, isPlaying) => {
      // If the audio is not already playing, we are done
      if (!isPlaying) {
        this.updateStatusFlags({busy: true});
        clearTimeout(failureTimeout);
        callback();
        return;
      }

      // Stop playback
      this.sound.stop(() => {
        updateStatusFlags({ playing: false, busy: false });
        clearTimeout(failureTimeout);
        callback();
      });
    });
  };

  /**
   * Start playback of the sound
   */
  startPlayback() {
    const { playing, volume } = this.props;

    if (!playing) return;
    if (!this.sound || !this.sound.isLoaded()) return;

    // Start playback and add a hook when it's completed
    updateStatusFlags({ playing: true });
    this.sound.setVolume(volume);
    this.sound.play(this.handleStop);
  }

  /**
   * Handle attribute switching
   */
  componentWillReceiveProps(newProps) {
    const { playing, volume } = newProps;

    // Toggle playback state
    if (playing !== this.props.playing) {
      if (playing) {
        // Start playback
        if (this.playing) return;
        else if (this.loaded) this.startPlayback();
        else {
          this.loadSound();
        }
      } else {
        // Stop playback
        if (!this.loaded) return;
        if (this.playing) {
          this.stopPlayback(() => {
            this.unloadSound();
          });
        } else if (this.retrying) {
          this.resetRetryTimeout();
        } else {
          this.unloadSound();
        }
      }
    }

    // Change volume
    if (volume !== this.props.volume) {
      if (this.playing && this.sound != null) {
        this.sound.setVolume(volume);
      }
    }
  }

  render() {
    return <View />;
  }
}
