define([
  'GeoEntity'
], function (GeoEntity) {

  /**
   * Constructs a new Object object. An Object represents an entity that can
   * be visualised either as a 2D footprint, an 3d extrusion of said footprint,
   * or a 3d model.
   * 
   * @alias Object
   * @extends {GeoEntity}
   * @constructor
   */
  var Object = function () {
    
    /**
     * The {@link Polygon} 2d footprint of this Object.
     * @type {Polygon}
     */
    this.footprint = null;

    /**
     * 3D {@link Model} for the Object.
     * @type {Model}
     */
    this.model = null;

    /**
     * The extrusion height of this Object.
     * @type {number}
     */
    this.height = 0;

    /**
     * Display mode of this Object,
     * @type {[type]}
     */
    this.displayMode = null;

    /**
     * Whether this Object is visible.
     * @type {Boolean}
     */
    this.visible = false;
  };
  // Inherit from GeoEntity.
  Object.prototype = new GeoEntity();

  /**
   * Toggle the Object's footprint to be rendered.
   */
  Object.prototype.toggleFootprintVisibility = function() {
    this.displayMode = 'footprint';
  };

  /**
   * Toggle the Object's extrusion to be rendered.
   */
  Object.prototype.toggleExtrusionVisibility = function() {
    this.displayMode = 'extrusion';
  };

  /**
   * Toggle the Object's model to be rendered.
   */
  Object.prototype.toggleModelVisibility = function() {
    this.displayMode = 'model';
  };
});
