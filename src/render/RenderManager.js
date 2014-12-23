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
   */
  RenderManager = Manager.extend(/** @lends atlas.render.RenderManager# */ {

    _id: 'render',

    /**
     * Whether terrain is currently being shown.
     * @type {Boolean}
     */
    _showTerrain: false,

    _init: function(managers) {
      this._super(managers);
    },

    setup: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      var handlers = {
        'extern': {
          'terrain/show': this.setTerrainVisibility.bind(this, true),
          'terrain/hide': this.setTerrainVisibility.bind(this, false)
        }
      };
      this._managers.event.addNewEventHandlers(handlers);
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
     * Function to toggle rendering of the current terrain model
     * @param {Boolen} show - Whether to show the terrain.
     *
     * @listens ExternalEvent#selection/enable
     * @listens ExternalEvent#selection/disable
     */
    setTerrainVisibility: function(show) {
      this._showTerrain = show;
    },

    /**
     * Sets the parameters required to render a terrain model.
     * @param {Object} [terrainParams] An object containing the terrain parameters.
     * @abstract
     */
    setTerrain: function(terrainParams) {
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
    }

  });

  return RenderManager;
});
