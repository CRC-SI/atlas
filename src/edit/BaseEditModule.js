define([], function() {

  /**
   * Constructs a new BaseEditModule object.
   * @class The BaseEditModule defines the common interface for <code>Modules</code> used in
   * the {@link atlas.edit.EditManager}.
   *
   * @abstract
   * @alias atlas.edit.BaseEditModule
   * @constructor
   */
  var BaseEditModule = function() {
    /**
     * A set of strings as keys in an object which define what modes are enabled
     * for the module. Modes determine the behaviour of the module and are implementation specific.
     * @type {Object}
     */
    this._modes = {};
  };

  /**
   * @returns {Object} A mapping of event strings to methods which will be used as event handlers.
   */
  BaseEditModule.prototype.getEventBindings = function() {
    return {
      'input/leftdown': this.start,
      'input/mousemove': this.update,
      'input/leftup': this.end,
      'input/key': function (name, event) {
        // TODO(aramk) find a nice way to map key codes.
        if (event.keyCode === 27) {
          return this.cancel(name, event);
        }
        return function () {};
      }
    }
  };

  /**
   * Sets a mode on the module. Invalid modes will be ignored by the module.
   * @param {String} mode - A string used by the module which determines its behaviour.
   * @param {Object} [args=null] - Optional arguments associated with the mode.
   */
  BaseEditModule.prototype.setMode = function(mode, args) {
    this._modes[mode] = args || null;
  };

  /**
   * @returns {Object} All the enabled modes belonging to this module.
   */
  BaseEditModule.prototype.getModes = function() {
    return this._modes;
  };

  /**
   * @returns {Boolean} Whether this .
   * @param {String} mode - The mode name.
   */
  BaseEditModule.prototype.hasMode = function(mode) {
    return this._modes[mode] !== undefined;
  };

  /**
   * Removes the mode with the given name from this module.
   * @param mode - The name of the mode.
   */
  BaseEditModule.prototype.removeMode = function(mode) {
    delete this._modes[mode];
  };

  /**
   * An event handler which starts the action this module performs.
   * @param {Object} args - Event arguments.
   * @abstract
   */
  BaseEditModule.prototype.start = function(args) {};

  /**
   * An event handler which updates the progress of the action this module performs.
   * @param {Object} args - Event arguments.
   * @abstract
   */
  BaseEditModule.prototype.update = function(args) {};

  /**
   * An event handler which ends the action this module performs.
   * @param {Object} args - Event arguments.
   * @abstract
   */
  BaseEditModule.prototype.end = function(args) {};

  /**
   * Cancels the action performed by this module and returns to the state before
   * {@link BaseEditModule.start} was called.
   * @param {Object} args - Event arguments.
   * @abstract
   */
  BaseEditModule.prototype.cancel = function(args) {};

  return BaseEditModule;
});
