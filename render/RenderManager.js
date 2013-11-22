// RenderManager.js
define([
  'atlas/lib/DeveloperError'
], function (DeveloperError) {

  /**
   * The RenderManager manages what is render and how it is rendered. The
   * RenderManager controls
   *     - the map imageries displayed on the globe
   *     - the terrain models displayed on the globe
   *     - the set of entities being displayed in the scene
   *
   * @constructor
   * @alias RenderManager
   */
  var RenderManager = function () {
    /**
     * This is a map of Entity ID to GeoEntity. These are the entities
     * the RenderManager knows about and is able to cause to be rendered.
     * @type {Object}
     */
    this.entities = {};
  };

  /**
   * Convenience function to check if a given object is a GeoEntity.
   * @param  {Object}  entity The object to check.
   * @return {Boolean}        Whether the object is a GeoEntity.
   */
  var isEntity = function (entity) {
    if (! (entity instanceof GeoEntity)) {
      throw new DeveloperError("Can only add subclasses of GeoEntity");
    }
    return true;
  };

  /**
   * Add an Entity to the RenderManager so it can be rendered. This does
   * not automatically show the Entity.
   * @param {GeoEntity} entity The GeoEntity to be added to rendering.
   */
  RenderManager.prototype.add = function (entity) {
    if (isEntity(entity)) {
      this.entities[entity.id] = entity;
    }
  };

  /**
   * Remove a GeoEntity from the RenderManager.
   * @param {Number} id The ID of the GeoEntity to remove.
   */
  RenderManager.prototype.remove = function (id) {
    if (isEntity(entity)) {
      delete this.entities[id];
    }
  };

  /**
   * Show the given entity
   * @param  {Number} entity The ID of the Entity to show.
   * @return {Boolean}       Whether the entity is shown.
   */
  RenderManager.prototype.show = function (id) {
    if (entity instanceof Number) {
      if (typeof this.entities[entity] !== 'undefined') {
        this.entities[entity].show();
        return true;
      }
    }
    return false;
  };

  /**
   * Hide the given entity
   * @param  {Number} entity The ID of the Entity to hide.
   * @return {Boolean}       Whether the entity is hidden.
   */
  RenderManager.prototype.hide = function (id) {
    if (entity instanceof Number) {
      if (typeof this.entities[entity] !== 'undefined') {
        this.entities[entity].hide();
        return true;
      }
    }
    return false;
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
   */
  RenderManager.prototype.setTerrain = function (/*Object*/ terrainParams) {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  /**
   * Sets the parameters required to render a specific map imagery.
   */
  RenderManager.prototype.setMapImagery = function (/*Object*/ mapParams) {
    throw new DeveloperError("Can not call functions on abstract RenderManager");
  };

  return RenderManager;
});
