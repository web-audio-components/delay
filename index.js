
/**
 * Simple delay implementation for the Web Audio API.
 *
 * @param {AudioContext} context
 * @param {number} type
 * @param {number} delay
 * @param {number} feedback
 */

function Delay (context, type, delay, feedback) {
  this.input = context.createGainNode();
  this.output = context.createGainNode();

  // Internal AudioNodes
  this._split = context.createChannelSplitter(2);
  this._merge = context.createChannelMerger(2);
  this._leftDelay = context.createDelayNode();
  this._rightDelay = context.createDelayNode();
  this._leftGain = context.createGainNode();
  this._rightGain = context.createGainNode();

  // AudioNode graph routing
  this.input.connect(this._split);
  this._leftDelay.connect(this._leftGain);
  this._rightDelay.connect(this._rightGain);
  this._leftGain.connect(this._merge, 0, 0);
  this._rightGain.connect(this._merge, 0, 1);
  this._merge.connect(this.output);
  this[["_routeNormal", "_routeInverted", "_routePingPong"][type || 0]]();

  // Defaults
  for (var prop in this.meta) {
    this[prop] = this.meta[prop].defaultValue;
  }
}

Delay.prototype = Object.create(null, {

  /**
   * AudioNode prototype `connect` method.
   *
   * @param {AudioNode} dest
   */

  connect: {
    value: function (dest) {
      this.output.connect(dest);
    }
  },

  /**
   * AudioNode prototype `disconnect` method.
   */

  disconnect: {
    value: function () {
      this.output.disconnect();
    }
  },

  /**
   * Module parameter metadata.
   */

  meta: {
    value: {
      delay: {
        min: 0,
        max: 10,
        defaultValue: 1.0,
        type: "pot"
      },
      feedback: {
        min: 0,
        max: 1,
        defaultValue: 0.5,
        type: "pot"
      }
    }
  },

  /**
   * Various routing schemes.
   */

  _routeNormal: {
    value: function () {
      this._split.connect(this._leftDelay, 0);
      this._split.connect(this._rightDelay, 1);
      this._leftGain.connect(this._leftDelay);
      this._rightGain.connect(this._rightDelay);
    }
  },

  _routeInverted: {
    value: function () {
      this._split.connect(this._leftDelay, 1);
      this._split.connect(this._rightDelay, 0);
      this._leftGain.connect(this._leftDelay);
      this._rightGain.connect(this._rightDelay);
    }
  },

  _routePingPong: {
    value: function () {
      this._split.connect(this._leftDelay, 0);
      this._split.connect(this._rightDelay, 1);
      this._leftGain.connect(this._rightDelay);
      this._rightGain.connect(this._leftDelay);
    }
  },

  /**
   * Public delay parameter.
   */

  delay: {
    enumerable: true,
    get: function () { return this._leftDelay.delayTime.value; },
    set: function (value) {
      this._leftDelay.delayTime.setValueAtTime(value, 0);
      this._rightDelay.delayTime.setValueAtTime(value, 0);
    }
  },

  /**
   * Public feedback parameter.
   */

  feedback: {
    enumerable: true,
    get: function () { return this._leftGain.gain.value; },
    set: function (value) {
      this._leftGain.gain.setValueAtTime(value, 0);
      this._rightGain.gain.setValueAtTime(value, 0);
    }
  }

});

/**
 * Exports.
 */

module.exports = Delay;
