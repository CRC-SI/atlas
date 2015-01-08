define([
  'atlas/core/Manager',
  'atlas/util/DeveloperError',
  'atlas/model/GeoEntity'
], function(Manager, Class, DeveloperError, GeoEntity) {

  /**
   * @typedef atlas.render.RenderManager
   * @ignore
   */
  var RenderManager;

  /**
   * The RenderManager manages what is rendered and how it is rendered. The
   * RenderManager controls
   *     - the map imagery displayed on the globe
   *     - the terrain models displayed on the globe
   *     - the set of entities being displayed in the scene
   *
   * @class atlas.render.RenderManager
   * @extends atlas.core.Manager
   */
  RenderManager = Manager.extend(/** @lends atlas.render.RenderManager# */ {

    _id: 'render',

    /**
     * Map of event names to the event handle objects.
     * @type {Object.<String, Object>}
     */
    _events: null,

    /**
     * Whether terrain is currently being shown.
     * @type {Boolean}
     */
    _terrainEnabled: false,

    _init: function(managers) {
      this._super(managers);
    },

    setup: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      this._events = {};
      var handlers = {
        'extern': {
          'terrain/enable': this.setTerrain.bind(this, true),
          'terrain/disable': this.setTerrain.bind(this, false)
        }
      };
      this._events = this._managers.event.addNewEventHandlers(handlers);
    },

    /**
     * Show the given entity
     * @param {Number} entity The ID of the Entity to show.
     * @returns {Boolean} Whether the entity is shown.
     * @abstract
     */
    show: function(entity) {
      throw new DeveloperError('Can not call abstract method of RenderManager');
    },

    /**
     * Hide the given entity
     * @param {Number} entity The ID of the Entity to hide.
     * @returns {Boolean} Whether the entity is hidden.
     * @abstract
     */
    hide: function(entity) {
      throw new DeveloperError('Can not call abstract method of RenderManager');
    },

    /**
     * Function to toggle rendering of the current terrain model. This a no-op if
     * <code>enable</code> is the same as the current terrain rendering state.
     *
     * @param {Boolen} enable - Whether to enable the terrain.
     *
     * @listens ExternalEvent#terrain/enable
     * @listens ExternalEvent#terrain/disable
     */
    setTerrain: function(enable) {
      if (enable != this.isTerrainEnabled()) {
        var entityShow = 'entity/show';
        this._terrainEnabled = enable;
        this._handleTerrainChange(enable);

        if (enable) {
          var renderManager = this;
          this._events[entityShow] = this._managers.event.addEventHandler('extern',
              entityShow, renderManager._handleEntityShowEvent.bind(this));
        } else {
          this._events[entityShow].cancel();
          this._events[entityShow] = null;
        }
      }
    },

    /**
     * Sets the parameters required to render a terrain model.
     * @param {Object} [terrainParams] An object containing the terrain parameters.
     * @abstract
     */
    setTerrainModel: function(terrainParams) {
      throw new DeveloperError('Can not call functions on abstract RenderManager');
    },

    /**
     * Sets the parameters required to render a specific map imagery.
     * @param {Object} [mapParams] An object containing the map imagery parameters.
     * @abstract
     */
    setMapImagery: function(mapParams) {
      throw new DeveloperError('Can not call functions on abstract RenderManager');
    },

    /**
     * Convenience function to check if a given object is a GeoEntity.
     * @private
     * @param {Object} entity The object to check.
     * @returns {Boolean} Whether the object is a GeoEntity.
     */
    _isEntity: function(entity) {
      return entity instanceof GeoEntity;
    },

    /**
     * @returns {Boolean} Whether terrain is currently being rendered.
     */
    isTerrainEnabled: function() {
      return this._terrainEnabled;
    },

    _handleEntityShowEvent: function(args) {
      var entity = this._managers.entity.getById(args.id);
      if (entity) {
        this._handleEntityShow(true, entity);
      }
    },

    /**
     * Called when either the <code>entity/show</code> or <code>entity/hide</code> event occurs.
     * This function is intended to be overriden by Atlas implementations that need to handle
     * entity visibility changes.
     *
     * @param {atlas.model.GeoEntity} entity - The entity being shown.
     * @param {Boolean} visible - Whether the entity should be visible.
     *
     * @listens ExternalEvent#entity/show
     * @listens ExternalEvent#entity/hide
     *
     * @abstract
     */
    _handleEntityShow: function(entity, visible) {},

    /**
     * Called when either the <code>terrain/show</code> or terrain/hide event occurs.
     * This function is intended to be overriden by Atlas implementations that need to handle
     * terrain state changes.
     *
     * @param {Boolean} enabled - Whether terrain is now enabled.
     *
     * @listens ExternalEvent#terrain/enable
     * @listens ExternalEvent#terrain/disable
     *
     * @abstract
     */
    _handleTerrainChange: function(enabled) {}

  });

  return RenderManager;
});
