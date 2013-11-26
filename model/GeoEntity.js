define([
  'atlas/lib/extends',
  'atlas/events/EventTarget'
], function (extend, EventTarget) {

  /**
   * A GeoEntity is an abstract class that represents an entity that
   * has a defined place in 3d space. A GeoEntity is a purely
   * abstract module that is extended by other atlas entities that specify
   * what is this particular GeoEntity represents (eg. a polygon or a line).
   *
   * @param {Object} [id]     The ID of this GeoEntity.
   * @param {Object} [parent] The parent of the GeoEntity.
   * 
   * @see{Feature}
   * @see{Polygon}
   * @see{Network}
   * @see{Line}
   * @see{Vertex}
   * @see{PointHandle}
   *
   * @abstract
   * @extends {EventTarget}
   * @alias atlas/model/GeoEntity
   * @constructor
   */
  var GeoEntity = function (id, parent) {
    GeoEntity.base.constructor.call(this, parent);

    this.id = id;
    this.centroid = null;
    this.area = 0;
    this.visible = false;
  };
  // Inherit from EventTarget
  extend(EventTarget, GeoEntity);

  /**
   * Get the footprint centroid of the GeoEntity.
   * @return {number} GeoEntity's footprint centroid.
   */
  GeoEntity.prototype.getCentroid = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Returns the footprint area of the GeoEntity.
   * @return {number} Footprint area.
   */
  GeoEntity.prototype.getArea = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Returns the visibility of this GeoEntity.
   * @return {Boolean} Whether the GeoEntity is visible.
   */
  GeoEntity.prototype.isVisible = function() {
    return this._visible;
  };

  /**
   * Show this GeoEntity.
   * Delegated to the RenderManager
   * @see {RenderManager}
   */
  GeoEntity.prototype.show = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Hide this GeoEntity.
   * Delegated to the RenderManager
   * @see {RenderManager}
   */
  GeoEntity.prototype.hide = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Remove this GeoEntity from the scene (vs. hiding it).
   * Delegated to the RenderManager
   * @see {RenderManager}
   */
  GeoEntity.prototype.remove = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Toggle the visibility of this GeoEntity.
   */
  GeoEntity.prototype.toggleVisibility = function() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  };

  return GeoEntity;
});
