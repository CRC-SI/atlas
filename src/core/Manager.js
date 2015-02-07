define([
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Objects',
  'atlas/util/DeveloperError'
], function(Class, Objects, DeveloperError) {
  /**
   * @typedef atlas.core.Manager
   * @ignore
   */
  var Manager;

  /**
   * @classdesc Manages a distinct area of functionality.
   *
   * @param {Object} managers - A map of manager types to actual manager objects.
   *       The map is maintained on the main Atlas facade object, but the instances
   *       are created by each manager object upon creation.
   *
   * @class atlas.core.Manager
   * @abstract
   */
  Manager = Class.extend(/** @lends atlas.core.Manager# */ {

    /**
     * @type {String} The name of this manager when references by other managers.
     * @private
     */
    _id: null,

    /**
     * Map of event names to the event handle objects.
     *
     * @type {Object.<String, atlas.events.EventManager.EventHandle>}
     *
     * @private
     */
    _eventHandles: null,

    _init: function(managers) {
      this._managers = managers;
      var id = this._id;
      if (id) {
        this._managers[id] = this;
      } else {
        throw new DeveloperError('Unresolved manager ID');
      }
      this._eventHandles = {};
    },

    /**
     * Sets up the manager. Can rely on dependent managers existing.
     */
    setup: function() {
      // By default, only bind any events defined in subclasses.
      this._bindEvents();
    },

    /**
     * Binds all Events required by the Manager.
     * This should be overridden by subclasses when required.
     * @abstract
     */
    _bindEvents: function() {},

    /**
     * Unbinds all currently bound events whose handles have been stored in
     * <code>_eventHandles</code>. If subclasses have specific event bindings that should _always_
     * be active, they should not be stored in <code>_eventHandles</code>.
     */
    _unbindEvents: function() {
      Objects.keys(this._eventHandles, function(handle) {
        handle.cancel();
      });
    }

  });

  return Manager;
});
