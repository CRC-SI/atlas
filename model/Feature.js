define([
  './GeoEntity'
], function (GeoEntity) {

  /**
   * Constructs a new Feature object. A Feature represents an entity that can
   * be visualised either as a 2D footprint, an 3d extrusion of said footprint,
   * or a 3d model.
   * 
   * @alias Feature
   * @extends {GeoEntity}
   * @constructor
   */
  var Feature = function () {
    
    /**
     * The {@link Polygon} 2d footprint of this Feature.
     * @type {Polygon}
     */
    this.footprint = null;

    /**
     * 3D {@link Model} for this Feature.
     * @type {Model}
     */
    this.model = null;

    /**
     * The extrusion height of this Feature.
     * @type {number}
     */
    this.height = 0;

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
  Feature.prototype = new GeoEntity();

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
   * Toggle the Feature's model to be rendered.
   */
  Feature.prototype.toggleModelVisibility = function() {
    this.displayMode = 'model';
  };
});
