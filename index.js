
/**
 * Simple delay implementation for the Web Audio API.
 *
 * @param {AudioContext} context
 * @param {Int} type 0: normal, 1: inverted, 2: ping-pong
 * @param {Float} delay Delay time in seconds
 * @param {Float} feedback Delay feedback level
 */

function Delay (context, type, delay, feedback) {
  this.input = context.createGainNode();
  this.output = context.createGainNode();

  // Default values
  type = type         || 0;
  delay = delay       || 1.0;
  feedback = feedback || 0.5;

  this._split = context.createChannelSplitter(2);
  this._merge = context.createChannelMerger(2);
  this._leftDelay = context.createDelayNode();
  this._rightDelay = context.createDelayNode();
  this._leftGain = context.createGainNode();
  this._rightGain = context.createGainNode();

  // Expose AudioParams nicely for clean automation and value assignment
  this.delayLeft = this._leftDelay.delayTime;
  this.delayRight = this._rightDelay.delayTime;
  this.feedbackLeft = this._leftGain.gain;
  this.feedbackRight = this._rightGain.gain;

  // AudioNode graph routing
  this.input.connect(this._split);
  this._leftDelay.connect(this._leftGain);
  this._rightDelay.connect(this._rightGain);
  this._leftGain.connect(this._merge, 0, 0);
  this._rightGain.connect(this._merge, 0, 1);
  this._merge.connect(this.output);

  this[["_routeNormal", "_routeInverted", "_routePingPong"][type]]();

  // Value assignment
  this.delayRight.setValueAtTime(delay, 0);
  this.delayLeft.setValueAtTime(delay, 0);
  this.feedbackRight.setValueAtTime(feedback, 0);
  this.feedbackLeft.setValueAtTime(feedback, 0);
}

/**
 * Various routing schemes.
 */

Delay.prototype._routeNormal = function () {
  this._split.connect(this._leftDelay, 0);
  this._split.connect(this._rightDelay, 1);
  this._leftGain.connect(this._leftDelay);
  this._rightGain.connect(this._rightDelay);
};

Delay.prototype._routeInverted = function () {
  this._split.connect(this._leftDelay, 1);
  this._split.connect(this._rightDelay, 0);
  this._leftGain.connect(this._leftDelay);
  this._rightGain.connect(this._rightDelay);
};

Delay.prototype._routePingPong = function () {
  this._split.connect(this._leftDelay, 0);
  this._split.connect(this._rightDelay, 1);
  this._leftGain.connect(this._rightDelay);
  this._rightGain.connect(this._leftDelay);
}

/**
 * Mimick AudioNode prototype functionality with `connect` and `disconnect`.
 */

Delay.prototype.connect = function (dest) {
  this.output.connect(dest);
};

Delay.prototype.disconnect = function () {
  this.output.disconnect();
};

/**
 * Exports.
 */

module.exports = Delay;
