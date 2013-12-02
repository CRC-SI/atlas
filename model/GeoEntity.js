define([
  'atlas/util/Extends',
  'atlas/events/EventTarget'
], function (extend, EventTarget) {
  "use strict";

  /**
   * A GeoEntity is an abstract class that represents an entity that
   * has a defined place in 3d space. A GeoEntity is a purely
   * abstract module that is extended by other atlas entities that specify
   * what is this particular GeoEntity represents (eg. a polygon or a line).
   *
   * @param {Number} [id]     The ID of this GeoEntity.
   * @param {Object} [parent] The parent of the GeoEntity.
   * 
   * @see {Feature}
   * @see {Polygon}
   * @see {Network}
   * @see {Line}
   * @see {Vertex}
   * @see {PointHandle}
   *
   * @abstract
   * @extends {EventTarget}
   * @alias atlas/model/GeoEntity
   * @constructor
   */
  var GeoEntity = function (id, parent) {
    GeoEntity.base.constructor.call(this, parent);

    /**
     * The ID of the GeoEntity
     * @type {Number}
     */
    this._id = id;

    /**
     * The geometric centroid of the GeoEntity.
     * @type {Number}
     */
    this._centroid = null;

    /**
     * The area of the GeoEntity.
     * @type {Number}
     */
    this._area = 0;

    /**
     * Whether the GeoEntity is visible.
     * @type {Boolean}
     */
    this._visible = false;

    /**
     * Whether the GeoEntity can be rendered.
     * @type {Boolean}
     */
    this._renderable = false;

    /**
     * Geometry data for the GeoEntity that allows it to be rendered.
     * @type {Object}
     */
    this._geometry = null;

    /**
     * Appearance data to modified how the GeoEntity is rendered.
     * @type {Object}
     */
    this._appearance = null;
  };
  // Inherit from EventTarget
  extend(EventTarget, GeoEntity);

  /**
   * Get the footprint centroid of the GeoEntity.
   * @return {number} GeoEntity's footprint centroid.
   */
  GeoEntity.prototype.getCentroid = function() {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };

  /**
   * Returns the footprint area of the GeoEntity.
   * @return {number} Footprint area.
   */
  GeoEntity.prototype.getArea = function() {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };

  /**
   * Returns the visibility of this GeoEntity.
   * @return {Boolean} Whether the GeoEntity is visible.
   */
  GeoEntity.prototype.isVisible = function() {
    return this._visible;
  };

  /**
   * Returns whether the GeoEntity is renderable.
   * @return {Boolean} Whether the GeoEntity is renderable.
   */
  GeoEntity.prototype.isRenderable = function () {
    return this._renderable;
  };

  /**
   * Function to build the GeoEntity so it can be rendered.
   * @abstract
   */
  GeoEntity.prototype.build = function() {
    throw new DeveloperError('Can not call abstract method of GeoEntity.');
  };

  GeoEntity.prototype._setRenderable = function (render) {
    if (typeof render !== 'undefined') {
      this._renderable = render;
    } else {
      this._renderable = true;
    }
  };


  /**
   * Returns the geometry data for the GeoEntity so it can be rendered.
   * The <code>build</code> method should be called to construct this geometry
   * data.
   * @return {Object} The geometry data.
   */
  GeoEntity.prototype.getGeometry = function() {
    if (this.isRenderable())
      return this._geometry;
  };

  /**
   * Returns the appearance data for the GeoEntity so it can be rendered.
   * The <code>build</code> method should be called to construct this appearance
   * data.
   * @return {Object} The appearance data.
   */
  GeoEntity.prototype.getAppearance = function() {
    if (this.isRenderable())
      return this._appearance;
  };

  return GeoEntity;
});
