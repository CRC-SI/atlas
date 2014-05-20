define([
  'atlas/util/Class'
], function(Class) {
  /**
   * Defines the common interface for <code>Modules</code> used in
   * the {@link atlas.edit.EditManager}.
   * @class atlas.edit.BaseEditModule
   * @abstract
   */
  return Class.extend(/** @class atlas.edit.BaseEditModule# */ {

    /**
     * The name of the module set by the {@link atlas.edit.EditManager}.
     * @type {String}
     */
    _name: null,
    /**
     * A map of strings used by the module which determines its behaviour.
     * @type {Object.<String, Object>}
     */
    _modes: null,
    _atlasManagers: null,

    _init: function(atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._modes = {};
    },

    /**
     * @returns {Object} A mapping of event strings to methods which will be used as event handlers.
     */
    getEventBindings: function() {
      return {
        'input/leftdown': this.start,
        'input/mousemove': this.update,
        'input/leftup': this.end,
        'input/key': function(name, event) {
          // TODO(aramk) find a nice way to map key codes.
          if (event.keyCode === 27) {
            return this.cancel(name, event);
          }
          return function() {
          };
        }
      }
    },

    /**
     * Sets a mode on the module. Invalid modes will be ignored by the module.
     * @param {String} mode -
     * @param {Object} [args=null] - Optional arguments associated with the mode.
     */
    setMode: function(mode, args) {
      this._modes[mode] = args || null;
    },

    /**
     * @returns {Object.<String, Object>} The modes for this module.
     */
    getModes: function() {
      return this._modes;
    },

    /**
     * @returns {Boolean} Whether the given mode is enabled.
     * @param {String} mode - The mode name.
     */
    hasMode: function(mode) {
      return this._modes[mode] !== undefined;
    },

    /**
     * Removes the mode with the given name from this module.
     * @param mode - The name of the mode.
     */
    removeMode: function(mode) {
      delete this._modes[mode];
    },

    /**
     * An event handler which starts the action this module performs.
     * @param {Object} args - Event arguments.
     * @abstract
     */
    start: function(args) {
    },

    /**
     * An event handler which updates the progress of the action this module performs.
     * @param {Object} args - Event arguments.
     * @abstract
     */
    update: function(args) {
    },

    /**
     * An event handler which ends the action this module performs.
     * @param {Object} args - Event arguments.
     * @abstract
     */
    end: function(args) {
    },

    /**
     * Cancels the action performed by this module and returns to the state before
     * {@link BaseEditModule.start} was called.
     * @param {Object} args - Event arguments.
     * @abstract
     */
    cancel: function(args) {
    },

    disable: function () {
      // TODO(aramk) Module should ideally not know about the manager.
      this._atlasManagers.edit.disableModule(this._name);
    }

  });
});
