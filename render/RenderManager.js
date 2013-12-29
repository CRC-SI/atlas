define([
  'atlas/util/DeveloperError',
  'atlas/model/Feature',
  'atlas/model/GeoEntity'
], function (DeveloperError, Feature, GeoEntity) {

  /**
   * The RenderManager manages what is render and how it is rendered. The
   * RenderManager controls
   *     - the map imagery displayed on the globe
   *     - the terrain models displayed on the globe
   *     - the set of entities being displayed in the scene
   * @author Brendan Studds
   *
   * @param {Object} atlasManagers - A mapping of every manager type in Atlas to the manager instance.
   *
   * @constructor
   * @alias atlas/render/RenderManager
   */
  var RenderManager = function (atlasManagers) {

    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.render = this;
  };

  /**
   * Show the given entity
   * @param {Number} entity The ID of the Entity to show.
   * @returns {Boolean}       Whether the entity is shown.
   * @abstract
   */
  RenderManager.prototype.show = function (entity) {
    throw new DeveloperError('Can not call abstract method of RenderManager');
  };

  /**
   * Hide the given entity
   * @param  {Number} entity The ID of the Entity to hide.
   * @returns {Boolean}       Whether the entity is hidden.
   * @abstract
   */
  RenderManager.prototype.hide = function (entity) {
    throw new DeveloperError('Can not call abstract method of RenderManager');
  };

  /**
   * Function to toggle on rendering of the current terrain model
   * @abstract
   */
  RenderManager.prototype.showTerrain = function () {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Function to toggle off rendering the current terrain model.
   * @abstract
   */
  RenderManager.prototype.hideTerrain = function () {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Sets the parameters required to render a terrain model.
   * @param {Object} [terrainParams] An object containing the terrain parameters.
   * @abstract
   */
  RenderManager.prototype.setTerrain = function (terrainParams) {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Sets the parameters required to render a specific map imagery.
   * @param {Object} [mapParams] An object containing the map imagery parameters.
   * @abstract
   */
  RenderManager.prototype.setMapImagery = function (mapParams) {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Convenience function to check if a given object is a GeoEntity.
   * @private
   * @param  {Object}  entity The object to check.
   * @returns {Boolean}        Whether the object is a GeoEntity.
   */
  RenderManager.prototype._isEntity = function (entity) {
    return entity instanceof GeoEntity;
  };

  return RenderManager;
});
