define([
  'atlas/util/Extends',
  'atlas/util/DeveloperError',
  'atlas/events/EventTarget'
], function (extend, DeveloperError, EventTarget) {
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
  var GeoEntity = function (id, args) {
    /* Extend from EventTarget */
    GeoEntity.base.constructor.call(this, args);
    this.initEventTarget(args.eventManager, args.parent);

    /**
     * The RenderManager object for this GeoEntity.
     * @type {RenderManager}
     */
    this._renderManager = args.renderManager;

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
  GeoEntity.prototype._build = function() {
    throw new DeveloperError('Can not call abstract method of GeoEntity.');
  };

  GeoEntity.prototype.setRenderable = function (render) {
    if (typeof render !== 'undefined') {
      this._renderable = render;
    } else {
      this._renderable = true;
    }
  };


  /**
   * Shows the GeoEntity in the current scene.
   */
  GeoEntity.prototype.show = function () {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };

  /**
   * Hides the GeoEntity from the current scene.
   */
  GeoEntity.prototype.hide = function () {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };

  /**
   * Toggles the visibility of the GeoEntity.
   */
  GeoEntity.prototype.toggleVisibility = function () {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
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
