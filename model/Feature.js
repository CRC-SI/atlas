define([
  'atlas/util/Extends',
  'atlas/util/DeveloperError',
  './GeoEntity',
  './Polygon'
  //'./Mesh'   // Module to be defined
], function (extend, GeoEntity, Polygon, Mesh) {

  /**
   * Constructs a new Feature object. A Feature represents an entity that can
   * be visualised either as a 2D footprint, an 3d extrusion of said footprint,
   * or a 3d mesh.
   *
   * @param {Number}    id        The ID of this Feature
   * @param {GeoEntity} parent    The Parent of this feature
   * @param {Mesh}      mesh      The 3d mesh of this Feature
   * @param {Polygon}   footprint The 2d footprint of this Feature
   * @param {Number}    height    The extruded height of this Feature
   * 
   * @extends {GeoEntity}
   * @alias atlas/model/Feature
   * @constructor
   */
  var Feature = function (/*Number*/ id, /*GeoEntity*/ parent, /*Mesh*/ mesh, /*Polygon*/ footprint, /*Number*/ height) {
    // Construct GeoEntity base class
    Feature.base.constructor.call(this, id, parent);
    
    /**
     * The 2d {@link Polygon} footprint of this Feature.
     * @type {Polygon}
     */
    this.footprint = (footprint || null);

    /**
     * 3D {@link Mesh} of this Feature.
     * @type {Mesh}
     */
    this.mesh = (mesh || null);

    /**
     * The extrusion height of this Feature.
     * @type {number}
     */
    this.height = (height || 0);

    /**
     * Display mode of this Feature,
     * @type {string}
     */
    this.displayMode = null;

    /**
     * Whether this Feature is visible.
     * @type {Boolean}
     */
    this.visible = false;
  };
  // Inherit from GeoEntity.
  extend(GeoEntity, Feature);


  Feature.prototype.setMesh = function (mesh) {
    if (!footprint instanceof Mesh) {
      throw new DeveloperError('Can only assign Mesh to mesh.');
    }
    this.mesh = mesh;
  };


  Feature.prototype.setFootprint = function (footprint) {
    if (!footprint instanceof Polygon) {
      throw new DeveloperError('Can only assign Polygon to footprint');
    }
    this.footprint = footprint;
  };

  /**
   * Toggle the Feature's footprint to be rendered.
   */
  Feature.prototype.toggleFootprintVisibility = function() {
    this.displayMode = 'footprint';
  };

  /**
   * Toggle the Feature's extrusion to be rendered.
   */
  Feature.prototype.toggleExtrusionVisibility = function() {
    this.displayMode = 'extrusion';
  };

  /**
   * Toggle the Feature's mesh to be rendered.
   */
  Feature.prototype.toggleMeshVisibility = function() {
    this.displayMode = 'mesh';
  };

  /**
   * Show this feature.
   */
  Feature.prototype.show = function() {
    if (this.displayMode == 'footprint') {
      this.mesh.hide();
      this.visible = this.footprint.show(); 
    } else if (this.displayMode == 'extrusion') {
      this.mesh.hide();
      this.visible = this.footprint.show(thisHeight); 
    } else if (this.displayMode == 'mesh') {
      this.footprint.hide();
      this.visible = this.mesh.show();
    }
  };
  
  /**
   * Hide this feature.
   */
  Feature.prototype.hide = function() {
    this.visible = this.footprint.hide() || this.mesh.hide();
  };
  return Feature;
});
