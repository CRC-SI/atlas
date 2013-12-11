define([
  'atlas/util/Extends',
  'atlas/util/DeveloperError',
  'atlas/events/EventTarget'
], function (extend, DeveloperError, EventTarget) {
  "use strict";

  /**
   * Constructs a new GeoEntity object.
   * @class A GeoEntity is an abstract class that represents an entity that
   * has a defined place in 3D space. A GeoEntity is a purely
   * abstract module that is extended by other atlas entities that specify
   * what is this particular GeoEntity represents (eg. a polygon or a line).
   *
   * @param {Number} id - The ID of this GeoEntity.
   * @param {Object} [args] - Both optional and required construction parameters.
   * @param {atlas/render/RenderManager} args.renderManager - The RenderManager object responsible for the GeoEntity.
   * @param {atlas/events/EventManager} args.eventManager - The EventManager object responsible for the Event system.
   * @param {atlas/events/EventTarget} [args.parent] - The parent EventTarget object of the GeoEntity.
   * @returns {atlas/model/GeoEntity}
   * 
   * @see {atlas/model/Feature}
   * @see {atlas/model/Polygon}
   * @see {atlas/model/Network}
   * @see {atlas/model/Line}
   * @see {atlas/model/Vertex}
   * @see {atlas/model/PointHandle}
   *
   * @abstract
   * @extends {atlas/events/EventTarget}
   * @alias atlas/model/GeoEntity
   * @constructor
   */
  var GeoEntity = function (id, args) {
    // Check that an id has been provided.
    if (typeof id === 'object') {
      args = id;
      id = args.id;
    } 
    if (id === undefined || typeof id === 'object') {
      throw new DeveloperError('Can not create instance of GeoEntity without an ID');
    }
    /* Extend from EventTarget */
    GeoEntity.base.constructor.call(this);
    this.initEventTarget(args.eventManager, args.parent);

    /**
     * The RenderManager object for this GeoEntity.
     * @type {atlas/render/RenderManager}
     */
    this._renderManager = args.renderManager;

    /**
     * The ID of the GeoEntity
     * @type {String}
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
   * Returns the footprint centroid of the GeoEntity.
   * @return {Number} GeoEntity's footprint centroid.
   * @abstract
   */
  GeoEntity.prototype.getCentroid = function() {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };

  /**
   * Returns the footprint area of the GeoEntity.
   * @return {Number} Footprint area.
   * @abstract
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
    if (render !== undefined) {
      this._renderable = render;
    } else {
      this._renderable = true;
    }
  };

  /**
   * Function to remove the GeoEntity from rendering. This function should
   * be overridden on subclasses to accomplish any cleanup that 
   * may be required.
   */
  GeoEntity.prototype.remove = function () {
    // Does nothing unless overridden.
  };

  /**
   * Shows the GeoEntity in the current scene.
   * @abstract
   */
  GeoEntity.prototype.show = function () {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };

  /**
   * Hides the GeoEntity from the current scene.
   * @abstract
   */
  GeoEntity.prototype.hide = function () {
    throw new DeveloperError('Can not call abstract method of GeoEntity');
  };
  
  // TODO(bpstudds) This may not need to be abstract if we have a setStyle() that is
  //      abstract and defined by atlas-cesium.
  /**
   * Causes the GeoEntity to be rendered with the selection style.
   * @abstract;
   */
  GeoEntity.prototype.select = function () {};
  
  /**
   * Causes the GeoEntity to be rendered with the default style.
   * @abstract
   */
  GeoEntity.prototype.deselect = function () {};

  /**
   * Toggles the visibility of the GeoEntity.
   */
  GeoEntity.prototype.toggleVisibility = function () {
    this.isVisible() ? this.hide() : this.show();
  };

  /**
   * Returns the geometry data for the GeoEntity so it can be rendered.
   * The <code>build</code> method should be called to construct this geometry
   * data.
   * @return {Object} The geometry data.
   */
  GeoEntity.prototype.getGeometry = function() {
      return this._geometry;
  };

  /**
   * Returns the appearance data for the GeoEntity so it can be rendered.
   * The <code>build</code> method should be called to construct this appearance
   * data.
   * @return {Object} The appearance data.
   */
  GeoEntity.prototype.getAppearance = function() {
      return this._appearance;
  };

  return GeoEntity;
});
