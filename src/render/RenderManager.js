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
     * Sets the parameters required to render a specific map imagery.
     * @param {Object} [mapParams] An object containing the map imagery parameters.
     * @abstract
     */
    setMapImagery: function(mapParams) {
      throw new DeveloperError('Can not call functions on abstract RenderManager');
    },

    /**
     * @param {atlas.model.GeoPoint} A point in geographic coordinates (Longitude, Latitude).
     * @return {atlas.model.Vertex} The local cartesian in Unity point mapped to the given point.
     */
    worldCoordFromGeoPoint: function(geoPoint) {
      throw new DeveloperError("Can not call functions on abstract RenderManager");
    },

    /**
     * @param {Vertex} worldCoord - The local world coordinates used in the Atlas provider.
     * @returns {atlas.model.GeoPoint}
     */
    geoPointFromWorldCoord: function(worldCoord) {
      throw new DeveloperError("Can not call functions on abstract RenderManager");
    },

    /**
     * Translates a screen coordinate point into a geopoint
     * @param {Vertex} screenCoords - The screen coordinates in pixels.
     * @abstract
     */
    geoPointFromScreenCoord: function(screenCoord) {
      throw new DeveloperError("Can not call functions on abstract RenderManager");
    },

    geoPointFromArgs: function(args) {
      return this.geoPointFromScreenCoord(args.position);
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
