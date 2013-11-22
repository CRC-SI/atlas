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



/*
  HOW DOES IT WORK

  Have:
    - Features
      * Could be any of the below
    - Models
    - Prisms
    - Polygons
    - Lines
    - Points

  Client defines the IDs used to track renderables.
  RenderManager tracks what entities are defined.
  RenderManager tracks what entities are rendered.


  For client app:
    - **The client app has the IDs, need to be defined at
      creation of an entity.
    1.  Create entity
    2.  [opt] RenderManager.add(entity)
    2a. entity.show() -> implicit add
    2a. RenderManager.show(entity) -> implicity add
    3a. entity.hide()
    3b. RenderManager.hide(entity)
    4a. entity.remove()
    4b. RenderManager.remove()


  For RenderManager
    - Has all defined entities (can call 'show' at any time).
    - Does rendering itself? Delegates rendering to primitives?
      **Primitive creation creates data structures required for rendering
      but the RM causes rendering of primitives to occur?

 */

