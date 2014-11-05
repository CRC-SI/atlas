define([
  'atlas/edit/EditManager',
  'atlas/events/EventManager',
  'atlas/selection/SelectionManager',
  'atlas/visualisation/VisualisationManager',
  'atlas/dom/PopupManager',
  'atlas/dom/PopupFaculty',
  'atlas/util/DeveloperError',
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Setter'
], function(EditManager, EventManager, SelectionManager, VisualisationManager, PopupManager,
  PopupFaculty, DeveloperError, Class, Setter) {

  /**
   * @typedef atlas.core.Atlas
   * @ignore
   */
  var Atlas;

  /**
   * The type of execution environment. The build tool will set this to
   * {@link Environment.PRODUCTION}.
   * @typedef {Object} atlas.core.Environment
   */
  var Environment = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production'
  };

  /**
   * @classdesc Facade class for the Atlas API. This class maintains references to all
   * managers used in the implementation. It exposes an API to the host
   * application to control Atlas' behaviour.
   *
   * @abstract
   * @class atlas.core.Atlas
   */
  Atlas = Setter.mixin(Class.extend({

    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    _managers: {},

    _init: function() {
      this._managers = {};
      // Create all the atlas manager objects before initialising any. Any initialisation work
      // that requires the presence of a particular manager is done in <code>setup()</code>,
      // so the managers may be created in any order.
      this.setManager(new EditManager(this._managers));
      this.setManager(new EventManager(this._managers));
      this.setManager(new EntityManager(this._managers));
      this.setManager(new SelectionManager(this._managers));
      this.setManager(new VisualisationManager(this._managers));
      this.setManager(new PopupManager(this._managers));
      this._setup();
    },

    _setup: function() {
      this._managers.entity.setup();
      this._managers.selection.setup();
      this._managers.visualisation.setup();
      this._managers.popup.setup();
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
     * @returns {Object} An EventListener object that can be used to cancel the EventHandler.
     */
    subscribe: function(eventName, callback) {
      return this._managers.event.addEventHandler('intern', eventName, callback);
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

  }), {

    // Static members

    /**
     * @type {atlas.core.Environment}
     */
    _environment: Environment.DEVELOPMENT,

    Environment: Environment,

    /**
     * @type {atlas.core.Environment}
     */
    getEnvironment: function() {
      return this._environment;
    }

  });

  return Atlas;
});
