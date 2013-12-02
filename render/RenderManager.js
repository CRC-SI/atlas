define([
  'atlas/util/DeveloperError',
  'atlas/model/GeoEntity'
], function (DeveloperError, GeoEntity) {

  /**
   * The RenderManager manages what is render and how it is rendered. The
   * RenderManager controls
   *     - the map imageries displayed on the globe
   *     - the terrain models displayed on the globe
   *     - the set of entities being displayed in the scene
   * @author Brendan Studds
   * @version 1.0
   *
   * @constructor
   * @alias atlas/render/RenderManager
   */
  var RenderManager = function () {
    /**
     * This is a map of Entity ID to GeoEntity. These are the entities
     * the RenderManager knows about and is able to cause to be rendered.
     * @type {Object}
     */
    this._entities = {};
  };

  /**
   * Add an Entity to the RenderManager so it can be rendered. This does
   * not automatically show the Entity.
   * @param {GeoEntity} entity The GeoEntity to be added to rendering.
   */
  RenderManager.prototype.addEntity = function (entity) {
    if (!this._isEntity(entity)) {
      throw new DeveloperError('Can only add subclass of GeoEntity');
    } else {
      console.log('adding entity', entity._id);
      this._entities[entity._id] = entity;
    }
  };

  /**
   * Remove a GeoEntity from the RenderManager.
   * @param {Number} id The ID of the GeoEntity to remove.
   */
  RenderManager.prototype.removeEntity = function (id) {
    if (this.entities[id] !== undefined) {
      delete this._entities[id];
    }
  };

  /**
   * Show the given entity
   * @param  {Number} entity The ID of the Entity to show.
   * @return {Boolean}       Whether the entity is shown.
   */
  RenderManager.prototype.show = function (entity) {
    throw new DeveloperError('Can not call abstract method of RenderManager');
  };

  /**
   * Hide the given entity
   * @param  {Number} entity The ID of the Entity to hide.
   * @return {Boolean}       Whether the entity is hidden.
   */
  RenderManager.prototype.hide = function (entity) {
    throw new DeveloperError('Can not call abstract method of RenderManager');
  };

  /**
   * Function to toggle on rendering of the current terrain model
   */
  RenderManager.prototype.showTerrain = function () {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Function to toggle off rendering the current terrain model.
   */
  RenderManager.prototype.hideTerrain = function () {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Sets the parameters required to render a terrain model.
   * @param {Object} [terrainParams] An object containing the terrain parameters.
   * @abstract
   */
  RenderManager.prototype.setTerrain = function (/*Object*/ terrainParams) {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Sets the parameters required to render a specific map imagery.
   * @param {Object} [mapParams] An object containing the map imagery parameters.
   * @abstract
   */
  RenderManager.prototype.setMapImagery = function (/*Object*/ mapParams) {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Convenience function to check if a given object is a GeoEntity.
   * @private
   * @param  {Object}  entity The object to check.
   * @return {Boolean}        Whether the object is a GeoEntity.
   */
  RenderManager.prototype._isEntity = function (entity) {
    return entity instanceof GeoEntity;
  };

  return RenderManager;
});
