
/**
 * Module depenencies.
 */

var Filter = require("filter");

/**
 * Simple delay implementation for the Web Audio API.
 *
 * @param {AudioContext} context
 * @param {object} opts
 * @param {number} opts.type
 * @param {number} opts.delay
 * @param {number} opts.feedback
 * @param {number} opts.offset
 * @param {number} opts.dry
 */

function Delay (context, opts) {
  this.input = context.createGain();
  this.output = context.createGain();

  // Defaults
  var p = this.meta.params;
  opts            = opts || {};
  opts.type       = ~~opts.type   || p.type.defaultValue;
  opts.delay      = opts.delay    || p.delay.defaultValue;
  opts.feedback   = opts.feedback || p.feedback.defaultValue;
  opts.cutoff     = opts.cutoff   || p.cutoff.defaultValue;
  opts.dry        = opts.dry      || p.dry.defaultValue;
  opts.offset     = opts.offset   || p.offset.defaultValue;

  // Avoid positive feedback
  if (opts.feedback >= 1.0) {
    throw new Error("Feedback value will force a positive feedback loop.");
  }

  // Internal AudioNodes
  this._split = context.createChannelSplitter(2);
  this._merge = context.createChannelMerger(2);
  this._leftDelay = context.createDelay();
  this._rightDelay = context.createDelay();
  this._leftGain = context.createGain();
  this._rightGain = context.createGain();
  this._leftFilter = new Filter.Lowpass(context, { frequency: opts.cutoff });
  this._rightFilter = new Filter.Lowpass(context, { frequency: opts.cutoff });
  this._dry = context.createGain();

  // Assignment
  this._type = opts.type;
  this._delayTime = opts.delay;
  this._offset = opts.offset;
  this._leftDelay.delayTime.value = opts.delay;
  this._rightDelay.delayTime.value = opts.delay;
  this._leftGain.gain.value = opts.feedback;
  this._rightGain.gain.value = opts.feedback;

  // AudioNode graph routing
  this.input.connect(this._split);
  this._leftDelay.connect(this._leftGain);
  this._rightDelay.connect(this._rightGain);
  this._leftGain.connect(this._leftFilter.input);
  this._rightGain.connect(this._rightFilter.input);
  this._merge.connect(this.output);
  this._route();

  this.input.connect(this._dry);
  this._dry.connect(this.output);
}

Delay.prototype = Object.create(null, {

  /**
   * AudioNode prototype `connect` method.
   *
   * @param {AudioNode} dest
   */

  connect: {
    value: function (dest) {
      this.output.connect( dest.input ? dest.input : dest );
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
      name: "delay",
      params: {
        type: {
          min: 0,
          max: 2,
          defaultValue: 0,
          type: "int"
        },
        delay: {
          min: 0,
          max: 10,
          defaultValue: 1.0,
          type: "float"
        },
        feedback: {
          min: 0,
          max: 1,
          defaultValue: 0.5,
          type: "float"
        },
        cutoff: {
          min: 0,
          max: 22050,
          defaultValue: 8000,
          type: "float"
        },
        offset: {
          min: -0.5,
          max: 0.5,
          defaultValue: 0,
          type: "float"
        },
        dry: {
          min: 0,
          max: 1.0,
          defaultValue: 1,
          type: "float"
        }
      }
    }
  },

  /**
   * Various routing schemes.
   */

  _route: {
    value: function () {
      this._split.disconnect();
      this._leftFilter.disconnect();
      this._rightFilter.disconnect();
      this._leftFilter.connect(this._merge, 0, 0);
      this._rightFilter.connect(this._merge, 0, 1);
      this[["_routeNormal", "_routeInverted", "_routePingPong"][this._type]]();
    }
  },

  _routeNormal: {
    value: function () {
      this._split.connect(this._leftDelay, 0);
      this._split.connect(this._rightDelay, 1);
      this._leftFilter.connect(this._leftDelay);
      this._rightFilter.connect(this._rightDelay);
    }
  },

  _routeInverted: {
    value: function () {
      this._split.connect(this._leftDelay, 1);
      this._split.connect(this._rightDelay, 0);
      this._leftFilter.connect(this._leftDelay);
      this._rightFilter.connect(this._rightDelay);
    }
  },

  _routePingPong: {
    value: function () {
      this._split.connect(this._leftDelay, 0);
      this._split.connect(this._rightDelay, 1);
      this._leftFilter.connect(this._rightDelay);
      this._rightFilter.connect(this._leftDelay);
    }
  },

  /**
   * Public parameters.
   */

  type: {
    enumerable: true,
    get: function () { return this._type; },
    set: function (value) {
      this._type = ~~value;
      this._route();
    }
  },

  delay: {
    enumerable: true,
    get: function () { return this._leftDelay.delayTime.value; },
    set: function (value) {
      this._leftDelay.delayTime.setValueAtTime(value, 0);
      this._rightDelay.delayTime.setValueAtTime(value, 0);
    }
  },

  feedback: {
    enumerable: true,
    get: function () { return this._leftGain.gain.value; },
    set: function (value) {
      this._leftGain.gain.setValueAtTime(value, 0);
      this._rightGain.gain.setValueAtTime(value, 0);
    }
  },

  cutoff: {
    enumerable: true,
    get: function () { return this._leftFilter.frequency; },
    set: function (value) {
      this._leftFilter.frequency = value;
      this._rightFilter.frequency = value;
    }
  },

  offset: {
    enumerable: true,
    get: function () { return this._offset; },
    set: function (value) {
      var offsetTime = this._delayTime + value;
      this._offset = value;
      if (value < 0) {
        this._leftDelay.delayTime.setValueAtTime(offsetTime, 0);
        this._rightDelay.delayTime.setValueAtTime(this._delayTime, 0);
      } else {
        this._leftDelay.delayTime.setValueAtTime(this._delayTime, 0);
        this._rightDelay.delayTime.setValueAtTime(offsetTime, 0);
      }
    }
  },

  dry: {
    enumerable: true,
    get: function () { return this._dry.gain.value; },
    set: function (value) {
      this._dry.gain.setValueAtTime(value, 0);
    }
  }

});

/**
 * Exports.
 */

module.exports = Delay;
