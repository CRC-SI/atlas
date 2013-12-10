define([
  'atlas/util/Extends',
  'atlas/util/default',
  'atlas/util/DeveloperError',
  'atlas/model/Polygon',
  'atlas/model/Mesh',
  // Base class.
  './GeoEntity',
], function (extend, defaultValue, DeveloperError, Polygon, Mesh, GeoEntity) {

  /**
   * Constructs a new Feature object.
   * @class A Feature represents an entity that can be visualised either
   * as a 2D footprint, an 3D extrusion of said footprint, or a 3D mesh.
   *
   * @param {number} id - The ID of this Feature.
   * @param {object} [args] - Parameters describing the feature.
   * @param {string|Array.atlas/model/Vertex} [args.footprint=null] - Either a WKT string or array of Vertices describing the footprint polygon.
   * @param {mesh} [args.mesh=null] - The Mesh object for the Feature.
   * @param {number} [args.height=0] - The extruded height when displaying as a extruded polygon.
   * @param {number} [args.elevation=0] - The elevation (from the terrain surface) to the base of the Mesh or Polygon.
   * @param {boolean} [args.show=false] - Whether the feature should be initially shown when created.
   * @param {string} [args.displayMode='footprint'] - Initial display mode of feature, one of 'footprint', 'extrusion' or 'mesh'.
   * 
   * @abstract
   * @extends {GeoEntity}
   * @alias atlas/model/Feature
   * @constructor
   */
  var Feature = function (/*Number*/ id, /*Object*/ args) {
    // Construct GeoEntity base class
    Feature.base.constructor.call(this, id, args);

    /**
     * The 2D {@link Polygon} footprint of this Feature.
     * @type {Polygon}
     */
    this._footprint = null;
    if (args.footprint !== undefined) {
      this._footprint = new Polygon(id + 'polygon', args.footprint, args);
    }

    /**
     * 3D {@link Mesh} of this Feature.
     * @type {Mesh}
     */
    this._mesh = null;
    if (args.mesh !== undefined) {
      this._mesh = new Mesh(id + 'mesh', args.mesh, args);
    }

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
     * Initial display mode of this Feature,
     * @type {string}
     */
    this._displayMode = defaultValue(args.displayMode, 'footprint');

    /**
     * Whether this Feature is initially visible.
     * @type {Boolean}
     */
    this._visible = defaultValue(args.show, false);
  };
  // Inherit from GeoEntity.
  extend(GeoEntity, Feature);


  Feature.prototype.setMesh = function (mesh) {
    if (!footprint instanceof Mesh) {
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
    if (this._displayMode === 'footprint') {
      if (this._mesh) {
        this._mesh.hide();
      }
      if (this._footprint) {
        this._visible = this._footprint.show();
      }
    } else if (this._displayMode === 'extrusion') {
      if (this._mesh) {
        this._mesh.hide();
      }
      if (this._footprint) {
        this._visible = this._footprint.show(this._height);
      }
    } else if (this._displayMode === 'mesh') {
      if (this._footprint) {
        this._footprint.hide();
      }
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
   * Clean up the Feature so it can be deleted permanently.
   */
  Feature.prototype.remove = function () {
    // Remove mesh and footprint.
    if (this._mesh !== null) {
      console.debug('attempting to remove mesh', this._mesh);
      this._mesh.remove();
      this._mesh = {};
    }
    if (this._footprint !== null) {
      console.debug('attempting to remove footprint', this._footprint);
      this._footprint.remove();
      this._footprint = {};
    }
  };

  return Feature;
});
