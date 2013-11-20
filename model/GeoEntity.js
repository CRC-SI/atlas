define([
], function () {
  
  /**
   * Defines the interface for atlas/GeoEntity. GeoEntity is a purely
   * abstract module that is extended by other atlas entities.
   * 
   * @see{Object}
   * @see{Polygon}
   * @see{Network}
   * @see{Line}
   * @see{Vertex}
   * @see{PointHandle}
   *
   * @alias GeoEntity
   * @constructor
   */
  var GeoEntity = function () {
    this.centroid = null;
    this.area = 0;
    this.visible = false;
  };

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
   * @see {RenderManager}.
   */
  GeoEntity.prototype.show = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Hide this GeoEntity.
   * Delegated to the RenderManager
   * @see {RenderManager}.
   */
  GeoEntity.prototype.hide = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  /**
   * Remove this GeoEntity from the scene (vs. hiding it).
   * Delegated to the RenderManager
   * @see {RenderManager}.
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
