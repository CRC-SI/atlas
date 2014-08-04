define([
  'atlas/util/Class',
  'atlas/util/DeveloperError'
], function(Class, DeveloperError) {
  /**
   * Defines the common interface for <code>Modules</code> used in
   * the {@link atlas.edit.EditManager}.
   * @class atlas.edit.BaseEditModule
   * @abstract
   */
  return Class.extend(/** @lends atlas.edit.BaseEditModule# */ {

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

    _managers: null,

    /**
     * A mapping of event strings to handler arguments.
     * @type {Object.<String, atlas.edit.Handler>}
     */
    _eventBindings: null,

    _init: function(managers) {
      this._managers = managers;
      this._modes = {};
      this._eventBindings = {};
//      this.bindEvents({
//        'input/leftdown': this.start,
//        'input/mousemove': this.update,
//        'input/leftup': this.end,
//        'input/key': function(name, event) {
//          // TODO(aramk) find a nice way to map key codes.
//          if (event.keyCode === 27) {
//            return this.cancel(name, event);
//          }
//          return function() {
//          };
//        }
//      });
    },

    /**
     * Binds the given handlers.
     * @param {Object.<String, atlas.edit.Handler>} handlers
     */
    bindEvents: function(handlers) {
      Object.keys(handlers).forEach(function (event) {
        this.bindEvent(event, handlers[event]);
      }, this);
    },

    /**
     * Binds the given event and handler.
     * @param {String} event - The event name.
     * @param {atlas.edit.Handler} handler
     */
    bindEvent: function(event, handler) {
      if (this._eventBindings[event]) {
        throw new DeveloperError('Event ' + event + ' already bound.');
      }
      this._eventBindings[event] = handler;
    },

    unbindEvent: function(event) {
      delete this._eventBindings[event];
    },

    /**
     * @returns {Object.<String, atlas.edit.Handler>}
     */
    getEventBindings: function() {
      return this._eventBindings;
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

//    /**
//     * An event handler which starts the action this module performs.
//     * @param {Object} args - Event arguments.
//     * @abstract
//     */
//    start: function(args) {
//      throw new DeveloperError("Not implemented");
//    },
//
//    /**
//     * An event handler which updates the progress of the action this module performs.
//     * @param {Object} args - Event arguments.
//     * @abstract
//     */
//    update: function(args) {
//      throw new DeveloperError("Not implemented");
//    },
//
//    /**
//     * An event handler which ends the action this module performs.
//     * @param {Object} args - Event arguments.
//     * @abstract
//     */
//    end: function(args) {
//      throw new DeveloperError("Not implemented");
//    },
//
//    /**
//     * Cancels the action performed by this module and returns to the state before
//     * {@link BaseEditModule.start} was called.
//     * @param {Object} args - Event arguments.
//     * @abstract
//     */
//    cancel: function(args) {
//      throw new DeveloperError("Not implemented");
//    },

    disable: function() {
      // TODO(aramk) Module should ideally not know about the manager.
      this._managers.edit.disableModule(this._name);
    },

    enable: function() {
      this._managers.edit.enableModule(this._name);
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
