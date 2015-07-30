define([
  'atlas/camera/CameraManager',
  'atlas/dom/DomManager',
  'atlas/dom/PopupFaculty',
  'atlas/dom/PopupManager',
  'atlas/dom/OverlayManager',
  'atlas/edit/EditManager',
  'atlas/entity/EntityManager',
  'atlas/events/EventManager',
  'atlas/input/InputManager',
  'atlas/render/RenderManager',
  'atlas/render/TerrainManager',
  'atlas/selection/SelectionManager',
  'atlas/visualisation/VisualisationManager',
  'atlas/util/DeveloperError',
  'atlas/lib/Q',
  'atlas/lib/utility/Class',
  'underscore'
], function(CameraManager, DomManager, PopupFaculty, PopupManager, OverlayManager, EditManager,
  EntityManager, EventManager, InputManager, RenderManager, TerrainManager, SelectionManager,
  VisualisationManager, DeveloperError, Q, Class, _) {

  /**
   * @typedef atlas.core.Atlas
   * @ignore
   */
  var Atlas;

  /**
   * The type of execution environment. The build tool will set this to
   * {@link Environment.PRODUCTION}.
   *
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
     *
     * @type {Object.<String, atlas.core.Manager>}
     *
     * @private
     */
    _managers: {},

    /**
     * An array on manager IDs which will be setup after all other managers have been setup.
     *
     * @type {Array.<String>}
     *
     * @private
     */
    _delayedSetupManagers: ['input', 'terrain', 'overlay', 'popup'],

    _managerClasses: {},

    _init: function(args) {
      this._managers = {};
      this._initManagers(args);
      this._createManagers(args);
      this._setup(args);
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
        PopupManager, OverlayManager, TerrainManager, RenderManager, SelectionManager,
        VisualisationManager
      ].forEach(this.setManagerClass, this);
    },

    _createManagers: function(args) {
      for (var id in this._managerClasses) {
        if (args && args.managers && args.managers[id] === false) { continue }
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
      for (var id in this._managers) {
        if (this._delayedSetupManagers.indexOf(id) === -1) {
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
        manager._atlas = this;
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
      this._managers.dom.setDom(elem, true);
      // Setup delayed managers.
      this._delayedSetupManagers.forEach(function(id) {
        this._managers[id].setup();
      }, this);
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
    },

    /**
     * @return {Promise.<atlas.core.Atlas>} A promise which is resolved once Atlas has initialized
     *     and is ready to receive instructions.
     */
    ready: function() {
      return Q.when(this);
    },

    /**
     * @returns {Promise} A promise which is resolved once this Atlas instance is unloaded.
     */
    destroy: function() {
      // Destroy the event manager first to prevent sending events during destruction.
      this._managers.event.destroy();
      return Q.all(_.map(this._managers, function(manager) {
        return manager.destroy();
      }));
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
