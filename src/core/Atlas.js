define([
  'atlas/dom/PopupFaculty',
  'atlas/util/DeveloperError',
  'atlas/lib/utility/Class'
], function(PopupFaculty, DeveloperError, Class) {

  /**
   * @typedef atlas.core.Atlas
   * @ignore
   */
  var Atlas;

  /**
   * @classdesc Facade class for the Atlas API. This class maintains references to all
   * managers used in the implementation. It exposes an API to the host
   * application to control Atlas' behaviour.
   *
   * @abstract
   * @class atlas.core.Atlas
   */
  Atlas = Class.extend({

    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    _managers: {},

    _init: function() {
      this._managers = {};
    },

    attachTo: function(elem) {
      var dom = typeof elem === 'string' ? document.getElementById(elem) : elem;
      this._managers.dom.setDom(dom, true);
      // Hook up the InputManager to the selected DOM element.
      this._managers.input.setup(dom);

      // TODO(bpstudds): Work out all this dependency injection stuff.
      this._faculties = {};
      this._faculties.popup = new PopupFaculty();
      this._faculties.popup.setup({parentDomNode: elem, eventManager: this._managers.event})
    },

    getCameraMetrics: function() {
      return this._managers.camera.getCameraMetrics();
    },

    /**
     * Allows a particular manager to be replaced with another instance.
     * @param {atlas.core.Manager} manager - The new manager.
     * @returns {atlas.core.Manager} The old manager if any, or null.
     */
    setManager: function(manager) {
      // TODO(bpstudds): Look into having multiple managers and switching between them?
      var id = manager._id;
      if (!id) {
        throw new DeveloperError('Attempted to set manager with unknown ID');
      } else {
        var oldManager = this._managers[id];
        this._managers[id] = manager;
        return oldManager;
      }
    },

    /**
     * Sets the DOM element of Atlas to be visible.
     */
    show: function() {
      this._managers.dom.show();
    },

    /**
     * Sets the DOM element of Atlas to be hidden.
     */
    hide: function() {
      this._managers.dom.hide();
    },

    /**
     * Allows the Host application to publish an event to the internal
     * Atlas event system.
     * @param  {String} eventName - The type of the event to be published.
     * @param  {Object} [args] - Arguments relevant to the event.
     */
    publish: function(eventName, args) {
      this._managers.event.handleExternalEvent(eventName, args);
    },

    /**
     * Allows the Host application to subscribe to internal events of the Atlas
     * event system.
     * @param  {String}   eventName - The event type to subscribe to.
     * @param  {Function} callback - The callback that will be called when the event occurs.
     */
    subscribe: function(eventName, callback) {
      this._managers.event.addEventHandler('intern', eventName, callback);
    },

    /**
     * Causes a given GeoEntity to be set to visible Atlas.
     * @param {string} id - The ID of the GeoEntity to show.
     */
    showEntity: function(id) {
      this._managers.render.show(id);
    },

    /**
     * Causes a given GeoEntity to be set to hidden Atlas.
     * @param {string} id - The ID of the GeoEntity to hide.
     */
    hideEntity: function(id) {
      this._managers.render.hide(id);
    }

  });

  return Atlas;
});
