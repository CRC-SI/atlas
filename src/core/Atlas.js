define([
  'atlas/camera/CameraManager',
  'atlas/dom/DomManager',
  'atlas/dom/PopupFaculty',
  'atlas/dom/PopupManager',
  'atlas/edit/EditManager',
  'atlas/entity/EntityManager',
  'atlas/events/EventManager',
  'atlas/input/InputManager',
  'atlas/render/RenderManager',
  'atlas/render/TerrainManager',
  'atlas/selection/SelectionManager',
  'atlas/visualisation/VisualisationManager',
  'atlas/util/DeveloperError',
  'atlas/lib/utility/Class'
], function(CameraManager, DomManager, PopupFaculty, PopupManager, EditManager, EntityManager,
  EventManager, InputManager, RenderManager, TerrainManager, SelectionManager, VisualisationManager,
  DeveloperError, Class) {

  /**
   * @typedef atlas.core.Atlas
   * @ignore
   */
  var Atlas;

  /**
   * The type of execution environment. The build tool will set this to
   * {@link Environment.PRODUCTION}.
   * @typedef {Object} atlas.core.Atlas.Environment
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
  Atlas = Class.extend(/** @lends atlas.core.Atlas# */ {

    /**
     * A mapping of every manager type in Atlas to the manager instance. This object is created on
     * Atlas, but the manager instances are set by each manager upon creation.
     * @type {Object.<String, atlas.core.Manager>}
     * @private
     */
    _managers: {},

    _managerClasses: {},

    _init: function() {
      this._managers = {};
      this._initManagers();
      this._createManagers();
      this._setup();
    },

    // -------------------------------------------
    // MANAGERS
    // -------------------------------------------

    /**
     * Creates all the {@link atlas.core.Manager} objects before initialising any. Any
     * initialisation work that requires the presence of a particular manager is done in
     * {@link #_setup}, so the managers may be created in any order. Override this in subclasses to
     * redefine or add more managers.
     */
    _initManagers: function() {
      [CameraManager, DomManager, EditManager, EntityManager, EventManager, InputManager,
        PopupManager, RenderManager, TerrainManager, SelectionManager, VisualisationManager
      ].forEach(this.setManagerClass, this);
    },

    _createManagers: function() {
      for (var id in this._managerClasses) {
        var ManagerClass = this._managerClasses[id];
        var manager = new ManagerClass(this._managers);
        this.setManager(manager);
      }
    },

    /**
     * Sets up the {@link atlas.core.Manager} objects by calling {@link atlas.core.Manager#setup}.
     */
    _setup: function() {
      // These managers are set up later.
      var delayedSetupManagers = ['input'];
      // var ignoredManagersMap = {};
      for (var id in this._managers) {
        if (delayedSetupManagers.indexOf(id) === -1) {
          this._managers[id].setup();
        }
      }
    },

    /**
     * Creates an instance of the given class and sets it on this {@link atlas.core.Atlas} instance.
     * @param {Function} ManagerClass - A class of {@link atlas.core.Manager}.
     * @returns {atlas.core.Manager}
     */
    setManagerClass: function(ManagerClass) {
      var managerId = ManagerClass.prototype._id;
      this._managerClasses[managerId] = ManagerClass;
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
     * @param {String} id - The ID of the Manager to retrieve.
     * @returns {atlas.core.Manager} The Manager object.
     */
    getManager: function(id) {
      return this._managers[id];
    },

    // -------------------------------------------
    // API
    // -------------------------------------------

    attachTo: function(elem) {
      var dom = typeof elem === 'string' ? document.getElementById(elem) : elem;
      this._managers.dom.setDom(dom, true);
      // Hook up the InputManager to the selected DOM element.
      this._managers.input.setup(dom);
      // TODO(bpstudds): Work out all this dependency injection stuff.
      // this._faculties = {};
      // this._faculties.popup = new PopupFaculty();
      // this._faculties.popup.setup({
      //   parentDomNode: elem,
      //   eventManager: this._managers.event
      // })
    },

    getCameraMetrics: function() {
      return this._managers.camera.getCameraMetrics();
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

  });

  /**
   * The class used to represent the Atlas environment value.
   * @type {atlas.core.Atlas.Environment}
   * @memberOf atlas.core.Atlas
   */
  Atlas.Environment = Environment;

  /**
   * The current Atlas environment.
   * @type {atlas.core.Atlas.Environment}
   * @memberOf atlas.core.Atlas
   * @private
   */
  Atlas._environment = Environment.DEVELOPMENT;

  /**
   * Returns the current Atlas environment.
   * @returns {atlas.core.Atlas.Environment}
   * @memberOf atlas.core.Atlas
   */
  Atlas.getEnvironment = function() {
    return Atlas._environment;
  };

  return Atlas;
});
