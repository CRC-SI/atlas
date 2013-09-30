define([
  'GeoEntity'
], function (GeoEntity) {

  /**
   * Constructs a new Artifact artifact. An Artifact represents an entity that can
   * be visualised either as a 2D footprint, an 3d extrusion of said footprint,
   * or a 3d model.
   * 
   * @alias Artifact
   * @extends {GeoEntity}
   * @constructor
   */
  var Artifact = function () {
    
    /**
     * The {@link Polygon} 2d footprint of this Artifact.
     * @type {Polygon}
     */
    this.footprint = null;

    /**
     * 3D {@link Model} for the Artifact.
     * @type {Model}
     */
    this.model = null;

    /**
     * The extrusion height of this Artifact.
     * @type {number}
     */
    this.height = 0;

    /**
     * Display mode of this Artifact,
     * @type {string}
     */
    this.displayMode = null;

    /**
     * Whether this Artifact is visible.
     * @type {Boolean}
     */
    this.visible = false;
  };
  // Inherit from GeoEntity.
  Artifact.prototype = new GeoEntity();

  /**
   * Toggle the Artifact's footprint to be rendered.
   */
  Artifact.prototype.toggleFootprintVisibility = function() {
    this.displayMode = 'footprint';
  };

  /**
   * Toggle the Artifact's extrusion to be rendered.
   */
  Artifact.prototype.toggleExtrusionVisibility = function() {
    this.displayMode = 'extrusion';
  };

  /**
   * Toggle the Artifact's model to be rendered.
   */
  Artifact.prototype.toggleModelVisibility = function() {
    this.displayMode = 'model';
  };
});
