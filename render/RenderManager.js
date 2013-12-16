define([
  'atlas/util/DeveloperError',
  'atlas/model/Feature',
  'atlas/model/GeoEntity'
], function (DeveloperError, Feature, GeoEntity) {
  "use strict";

  /**
   * The RenderManager manages what is render and how it is rendered. The
   * RenderManager controls
   *     - the map imageries displayed on the globe
   *     - the terrain models displayed on the globe
   *     - the set of entities being displayed in the scene
   * @author Brendan Studds
   * @version 1.0
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

    /**
     * This is a map of Entity ID to GeoEntity. These are the entities
     * the RenderManager knows about and is able to cause to be rendered.
     * @type {Object}
     */
    this._entities = {};
  };

  RenderManager.prototype.addFeature = function (id, args) {
    if (typeof id === 'object') {
      args = id;
      id = args.id;
    }
    if (id === undefined) {
      throw new DeveloperError('Can not add Feature without specifying id');
    } else if (id in this._entities) {
      throw new DeveloperError('Can not add Feature with a duplicate ID');
    } else {
      // Add EventManger to the args for the feature.
      args.eventManager = this._atlasManagers.event;
      // Add the RenderManager to the args for the feature.
      args.renderManager = this;
      var feature = new Feature(id, args);
      this.addEntity(feature);
    }
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
      this._entities[entity._id] = entity;
    }
  };

  /**
   * Remove a GeoEntity from the RenderManager.
   * @param {Number} id The ID of the GeoEntity to remove.
   */
  RenderManager.prototype.removeEntity = function (id) {
    if (this._entities[id] !== undefined) {
      console.debug('removing entity', this._entities[id]);
      this._entities[id].remove();
      delete this._entities[id];
    }
  };
  
  /**
   * Returns the Entity with the given ID if it exists.
   * @param {String} id - The ID of the GeoEntity object to return.
   * @returns {GeoEntity|Null} The GeoEntity requested or null if it does not exist.
   */
  RenderManager.prototype.getEntity = function(id) {
    if (id in this._entities) {
      return this._entities[id];
    } else {
      return null;
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
   * @return {Boolean}        Whether the object is a GeoEntity.
   */
  RenderManager.prototype._isEntity = function (entity) {
    return entity instanceof GeoEntity;
  };

  return RenderManager;
});
