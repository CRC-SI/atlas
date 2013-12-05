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
   * Constructor for the base Feature object.
   * @class A Feature represents an entity that can be visualised either
   * as a 2D footprint, an 3d extrusion of said footprint,
   * or a 3d mesh.
   *
   * @param {Number}    id        The ID of this Feature
   * @param {GeoEntity} parent    The Parent of this feature
   * @param {Mesh}      mesh      The 3d mesh of this Feature
   * @param {Polygon}   footprint The 2d footprint of this Feature
   * @param {Number}    height    The extruded height of this Feature
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
     * The 2d {@link Polygon} footprint of this Feature.
     * @type {Polygon}
     */
    this._footprint = null;
    if (args.vertices !== 'undefined') {
      this._footprint = new Polygon(id + 'p', args.vertices, args);
    }

    /**
     * 3D {@link Mesh} of this Feature.
     * @type {Mesh}
     */
    this._mesh = null;
    if (args.mesh === 'undefined') {
      this._mesh = new Mesh(id + 'p', args.mesh, args);
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
     * Display mode of this Feature,
     * @type {string}
     */
    this._displayMode = defaultValue(args.displayMode, "");

    /**
     * Whether this Feature is visible.
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
   * Toggle the Feature's footprint to be rendered.
   */
  Feature.prototype.toggleFootprintVisibility = function() {
    this._displayMode = 'footprint';
  };

  /**
   * Toggle the Feature's extrusion to be rendered.
   */
  Feature.prototype.toggleExtrusionVisibility = function() {
    this._displayMode = 'extrusion';
  };

  /**
   * Toggle the Feature's mesh to be rendered.
   */
  Feature.prototype.toggleMeshVisibility = function() {
    this._displayMode = 'mesh';
  };

  /**
   * Show this feature.
   */
  Feature.prototype.show = function() {
    if (this._displayMode == 'footprint') {
      if (this._mesh) {
        this._mesh.hide();
      }
      if (this._footprint) {
        this._visible = this._footprint.show();
      }
    } else if (this.displayMode == 'extrusion') {
      if (this._mesh) {
        this._mesh.hide();
      }
      if (this._footprint) {
        this._visible = this._footprint.show(this._height);
      }
    } else if (this.displayMode == 'mesh') {
      if (this._footprint) {
        this._footprint.hide();
      }
      if (this._mesh) {
        this._visible = this._mesh.show();
      }
    }
  };

  /**
   * Hide this feature.
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
  return Feature;
});
