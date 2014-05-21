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
     * @private
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
     * @returns {Object.<String, atlas.edit.Handler>} A mapping of event strings to handler
     * arguments.
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
    },

    enable: function () {
      this._atlasManagers.edit.enableModule(this._name);
    }

    /**
     * Either a callback function or an object containing the given parameters.
     * @typedef {Function|Object} atlas.edit.Handler
     * @param {Function} callback
     * @param {String} [source='intern'] - Either 'intern' or 'extern'
     * @param {Boolean} [persistent=false] - If false the handler will be cancelled when the
     * module is disabled. Otherwise it will remain enabled. Calling {@link #disable} is appropriate
     * when the module no longer requires handler callbacks, but then the module has no way of
     * enabling itself when needed without knowledge of individual modules in the manager. Having a
     * persistent handler allows for calling {@link #enable} even when the module is disabled. The
     * alternative would be to use state variables and return early in the callbacks which do not
     * need to run, but this adds an unnecessary overhead to the event-driven architecture.
     */

  });
});
