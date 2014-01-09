define([
  'atlas/util/Extends',
  'atlas/util/default',
  'atlas/util/DeveloperError',
  'atlas/model/Polygon',
  'atlas/model/Mesh',
  // Base class.
  './GeoEntity'
], function (extend, defaultValue, DeveloperError, Polygon, Mesh, GeoEntity) {

  /**
   * Constructs a new Feature object.
   * @class A Feature represents an entity that can be visualised either
   * as a 2D footprint, an 3D extrusion of said footprint, or a 3D mesh.
   *
   * @param {Number} id - The ID of this Feature.
   * @param {Object} args - Parameters describing the feature.
   * @param {atlas/render/RenderManager} args.renderManager - The RenderManager object responsible for rendering the Feature.
   * @param {atlas/events/EventManager} args.eventManager - The EventManager object responsible for the event system.
   * @param {String|Array.atlas/model/Vertex} [args.footprint=null] - Either a WKT string or array of Vertices describing the footprint polygon.
   * @param {atlas/model/Mesh} [args.mesh=null] - The Mesh object for the Feature.
   * @param {Number} [args.height=0] - The extruded height when displaying as a extruded polygon.
   * @param {Number} [args.elevation=0] - The elevation (from the terrain surface) to the base of the Mesh or Polygon.
   * @param {Boolean} [args.show=false] - Whether the feature should be initially shown when created.
   * @param {String} [args.displayMode='footprint'] - Initial display mode of feature, one of 'footprint', 'extrusion' or 'mesh'.
   *
   * @extends {GeoEntity}
   * @alias atlas/model/Feature
   * @constructor
   */
  var Feature = function (id, args) {
    // Construct GeoEntity base class
    Feature.base.constructor.call(this, id, args);

    /**
     * The 2D {@link Polygon} footprint of this Feature.
     * @type {Polygon}
     */
    this._footprint = null;

    /**
     * 3D {@link Mesh} of this Feature.
     * @type {Mesh}
     */
    this._mesh = null;

    /**
     * The extrusion height of this Feature.
     * @type {number}
     */
    this._height = defaultValue(args.height, 0);

    /**
     * The elevation of this Feature.
     * @type {number}
     */
    this._elevation = defaultValue(args.elevation, 0);

    /**
     * The display mode of the Feature.
     * Mesh trumps Footprint if they are both defined in terms of which is displayed by default.
     * @type {string}
     */
    this._displayMode = '';
    this._displayMode = args.footprint ? defaultValue(args.displayMode, 'extrusion') : '';
    this._displayMode = args.mesh ? defaultValue(args.displayMode, 'mesh') : this._displayMode;

    /**
     * Whether this Feature is initially visible.
     * @type {Boolean}
     */
    this._visible = defaultValue(args.show, false);
  };
  // Inherit from GeoEntity.
  extend(GeoEntity, Feature);


  Feature.prototype.setMesh = function (mesh) {
    if (!mesh instanceof Mesh) {
      throw new DeveloperError('Can only assign Mesh to mesh.');
    }
    this._mesh = mesh;
  };


  Feature.prototype.setFootprint = function (footprint) {
    if (!footprint instanceof Polygon) {
      throw new DeveloperError('Can only assign Polygon to footprint');
    }
    this._footprint = footprint;
  };

  /**
   * Sets the extruded height of the Feature to form a prism.
   * @param {Number} height - The extruded height of the feature.
   */
  Feature.prototype.setHeight = function (height) {
    this._height = height;
    this.show();
  };

  /**
   * @returns {number} The extruded height of the Feature to form a prism.
   */
  Feature.prototype.getHeight = function () {
    return this._height;
  };

  /**
   * Sets the elevation of the base of the feature.
   * @param {Number} elevation - The elevation of the feature.
   */
  Feature.prototype.setElevation = function (elevation) {
    this._elevation = elevation;
    this.show();
  };

  /**
   * @returns {number} The elevation of the base of the feature.
   */
  Feature.prototype.getElevation = function () {
    return this._elevation;
  };

  /**
   * Renders the Feature using its footprint.
   * @see {@link atlas/model/Polygon}
   */
  Feature.prototype.showAsFootprint = function() {
    this._displayMode = 'footprint';
    this.show();
  };

  /**
   * Renders the Feature using its extruded footprint.
   * @see {@link atlas/model/Polygon}
   */
  Feature.prototype.showAsExtrusion = function() {
    this._displayMode = 'extrusion';
    this.show();
  };

  /**
   * Renders the Feature using its mesh.
   * @see {@link atlas/model/Mesh}
   */
  Feature.prototype.showAsMesh = function() {
    this._displayMode = 'mesh';
    this.show();
  };

  /**
   * Shows the Feature depending on its current <code>_displayMode</code>.
   */
  Feature.prototype.show = function() {
    console.debug('trying to show feature', this._id, 'as', this._displayMode);
    // TODO(aramk) delegate this to the setHeight setElevation.
    if (this._displayMode === 'footprint') {
      this._mesh && this._mesh.hide();
      if (this._footprint) {
        this._footprint.setHeight(0);
        this._visible = this._footprint.show();
      }
    } else if (this._displayMode === 'extrusion') {
      this._mesh && this._mesh.hide();
      if (this._footprint) {
        this._footprint.setHeight(this._height);
        this._footprint.setElevation(this._elevation);
        this._visible = this._footprint.show();
      }
    } else if (this._displayMode === 'mesh') {
      this._footprint && this._footprint.hide();
      if (this._mesh) {
        this._visible = this._mesh.show();
      }
    }
  };

  /**
   * Hides the Feature.
   */
  Feature.prototype.hide = function() {
    this._visible = false;
    if (this._footprint) {
      this._footprint.hide();
    }
    if (this._mesh) {
      this._mesh.hide();
    }
  };

  /**
   * Handles the behaviour of the Feature when it is selected.
   */
  Feature.prototype.onSelect = function () {
    this._footprint && this._footprint.onSelect();
    this._mesh && this._mesh.onSelect();
  };

  /**
   * Handles the behaviour of the Feature when it is deselected.
   */
  Feature.prototype.onDeselect = function () {
    this._footprint && this._footprint.onDeselect();
    this._mesh && this._mesh.onDeselect();
  };

  /**
   * Clean up the Feature so it can be deleted by the RenderManager.
   */
  Feature.prototype.remove = function () {
    // TODO(aramk) switch to Resig's Extend.js
    Feature.base.remove.apply(this, arguments);
    // Remove mesh and footprint.
    if (this._mesh !== null) {
      console.debug('attempting to remove mesh', this._mesh);
      this._mesh.remove();
      this._mesh = null;
    }
    if (this._footprint !== null) {
      console.debug('attempting to remove footprint', this._footprint);
      this._footprint.remove();
      this._footprint = null;
    }
  };

  Feature.prototype.getArea = function () {
    var area = undefined;
    if (this._displayMode === 'footprint' || this._displayMode === 'extrusion') {
      area = this._footprint.getArea();
    } else if (this._displayMode === 'mesh') {
      area = this._mesh.getArea();
    }
    return area;
  };

  Feature.prototype.getCentroid = function () {
    var centroid = undefined;
    if (this._displayMode === 'footprint' || this._displayMode === 'extrusion') {
      centroid = this._footprint.getCentroid();
    } else if (this._displayMode === 'mesh') {
      centroid = this._mesh.getCentroid();
    }
    return centroid;
  };

  /**
   * Translates the Feature.
   * @see {@link atlas/model/GeoEntity#translate}
   * @param {atlas/model/Vertex} translation - The vector to translate the Feature by.
   */
  Feature.prototype.translate = function (translation) {
    this._footprint && this._footprint.translate(translation);
    this._mesh && this._mesh.translate(translation);
  };

  /**
   * Scales the Feature.
   * @see {@link atlas/model/GeoEntity#scale}
   * @param {atlas/model/Vertex} scale - The vector to scale the Feature by.
   */
  Feature.prototype.scale = function (scale) {
    this._footprint && this._footprint.scale(scale);
    this._mesh && this._mesh.scale(scale);
  };

  /**
   * Rotates the Feature.
   * @see {@link atlas/model/GeoEntity#rotate}
   * @param {atlas/model/Vertex} rotation - The vector to rotate the Feature by.
   */
  Feature.prototype.rotate = function (rotation) {
    this._footprint && this._footprint.rotate(rotation);
    this._mesh && this._mesh.rotate(rotation);
  };

  return Feature;
});
