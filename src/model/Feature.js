define([
  'atlas/util/Class',
  'atlas/util/default',
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  'atlas/model/Colour',
  'atlas/model/Mesh',
  'atlas/model/Polygon',
  'atlas/model/Style',
  // Base class.
  './GeoEntity'
], function (Class, defaultValue, DeveloperError, mixin, Colour, Mesh, Polygon, Style, GeoEntity) {

  /**
   * @classdesc A Feature represents an entity that can be visualised either
   * as a 2D footprint, an 3D extrusion of said footprint, or a 3D mesh.
   *
   * @param {Number} id - The ID of this Feature.
   * @param {Object} args - Parameters describing the feature.
   * @param {atlas.render.RenderManager} args.renderManager - The RenderManager object responsible for rendering the Feature.
   * @param {atlas.events.EventManager} args.eventManager - The EventManager object responsible for the event system.
   * @param {String|Array.<atlas.model.Vertex>} [args.footprint=null] - Either a WKT string or array of Vertices describing the footprint polygon.
   * @param {atlas.model.Mesh} [args.mesh=null] - The Mesh object for the Feature.
   * @param {Number} [args.height=0] - The extruded height when displaying as a extruded polygon.
   * @param {Number} [args.elevation=0] - The elevation (from the terrain surface) to the base of the Mesh or Polygon.
   * @param {Boolean} [args.show=false] - Whether the feature should be initially shown when created.
   * @param {String} [args.displayMode='footprint'] - Initial display mode of feature, one of 'footprint', 'extrusion' or 'mesh'.
   *
   * @see {@link atlas.model.Polygon}
   * @see {@link atlas.model.Mesh}
   *
   * @class atlas.model.Feature
   * @extends atlas.model.GeoEntity
   */
  var Feature = mixin(GeoEntity.extend( /** @lends atlas.model.Feature# */ {

    /**
     * The 2D {@link Polygon} footprint of this Feature.
     * @type {atlas.model.Polygon}
     * @protected
     */
    _footprint: null,

    /**
     * 3D {@link Mesh} of the Feature.
     * @type {atlas.model.Mesh}
     * @protected
     */
    _mesh: null,

    /**
     * The extrusion height of the Feature.
     * @type {Number}
     * @protected
     */
    _height: null,

    /**
     * The elevation of the Feature.
     * @type {Number}
     * @protected
     */
    _elevation: null,

    /**
     * The Style to apply to the Feature.
     * @type {atlas.model.Style}
     * @protected
     */
    _style: null,

    /**
     * The display mode of the Feature.
     * Mesh trumps Footprint if they are both defined in terms of which is displayed by default.
     * @type {String}
     * @protected
     */
    _displayMode: null,

    /**
     * Whether the Feature is initially visible.
     * @type {Boolean}
     * @protected
     */
    _visible: false,

    _init: function (id, args) {
      this._super(id, args);
      this._visible = defaultValue(args.show, false);
      this._displayMode = args.footprint ? defaultValue(args.displayMode, 'extrusion') : '';
      this._displayMode = args.mesh ? defaultValue(args.displayMode, 'mesh') : this._displayMode;
      this._height = parseFloat(args.height) || 0.0;
      this._elevation = parseFloat(args.elevation) || 0.0;
      this._style = args.style || this.DEFAULT_STYLE;
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getArea: function () {
      var area = undefined;
      if (this._displayMode === 'footprint' || this._displayMode === 'extrusion') {
        area = this._footprint.getArea();
      } else if (this._displayMode === 'mesh') {
        area = this._mesh.getArea();
      }
      return area;
    },

    getCentroid: function () {
      var centroid = undefined;
      if (this._displayMode === 'footprint' || this._displayMode === 'extrusion') {
        centroid = this._footprint.getCentroid();
      } else if (this._displayMode === 'mesh') {
        centroid = this._mesh.getCentroid();
      }
      return centroid;
    },

    /**
     * Sets the elevation of the base of the feature.
     * @param {Number} elevation - The elevation of the feature.
     */
    setElevation: function (elevation) {
      this._elevation = elevation;
      this.show();
    },

    /**
     * @returns {number} The elevation of the base of the feature.
     */
    getElevation: function () {
      return this._elevation;
    },

    setFootprint: function (footprint) {
      if (!footprint instanceof Polygon) {
        throw new DeveloperError('Can only assign Polygon to footprint');
      }
      this._footprint = footprint;
    },

    /**
     * Sets the extruded height of the Feature to form a prism.
     * @param {Number} height - The extruded height of the feature.
     * @returns {Number} The previous height.
     */
    setHeight: function (height) {
      var oldHeight = this._height;
      this._height = height;
      this.show();
      return oldHeight;
    },

    /**
     * @returns {number} The extruded height of the Feature to form a prism.
     */
    getHeight: function () {
      return this._height;
    },

    setMesh: function (mesh) {
      if (!mesh instanceof Mesh) {
        throw new DeveloperError('Can only assign Mesh to mesh.');
      }
      this._mesh = mesh;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Modifies specific components of the Feature's style.
     * @param {Object} args - The new values for the Style components.
     * @param {atlas.model.Colour} [args.fill] - The new fill colour.
     * @param {atlas.model.Colour} [args.border] - The new border colour.
     * @param {Number} [args.borderWidth] - The new border width colour.
     * @returns {atlas.model.Style} - The old style.
     */
    modifyStyle: function (args) {
      // Call version on superclass GeoEntity to do the heavy lifting...
      var oldStyle = this._super(args);
      // ... and propagate the change to Feature's footprint and mesh if they exist.
      this._footprint && this._footprint.setStyle(this._style);
      this._mesh && this._mesh.setStyle(this._style);
      return oldValues;
    },

    /**
     * Renders the Feature using its footprint.
     * @see {@link atlas.model.Polygon}
     */
    showAsFootprint: function() {
      this._displayMode = 'footprint';
      this.show();
    },

    /**
     * Renders the Feature using its extruded footprint.
     * @see {@link atlas.model.Polygon}
     */
    showAsExtrusion: function() {
      this._displayMode = 'extrusion';
      this.show();
    },

    /**
     * Renders the Feature using its mesh.
     * @see {@link atlas.model.Mesh}
     */
    showAsMesh: function() {
      this._displayMode = 'mesh';
      this.show();
    },

    /**
     * Translates the Feature.
     * @see {@link atlas.model.GeoEntity#translate}
     * @param {atlas.model.Vertex} translation - The vector to translate the Feature by.
     */
    translate: function (translation) {
      this._footprint && this._footprint.translate(translation);
      this._mesh && this._mesh.translate(translation);
    },

    /**
     * Scales the Feature.
     * @see {@link atlas.model.GeoEntity#scale}
     * @param {atlas.model.Vertex} scale - The vector to scale the Feature by.
     */
    scale: function (scale) {
      this._footprint && this._footprint.scale(scale);
      this._mesh && this._mesh.scale(scale);
    },

    /**
     * Rotates the Feature.
     * @see {@link atlas.model.GeoEntity#rotate}
     * @param {atlas.model.Vertex} rotation - The vector to rotate the Feature by.
     */
    rotate: function (rotation) {
      this._footprint && this._footprint.rotate(rotation);
      this._mesh && this._mesh.rotate(rotation);
    },

    /**
     * Clean up the Feature so it can be deleted by the RenderManager.
     */
    remove: function () {
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
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Handles the behaviour of the Feature when it is selected.
     */
    onSelect: function () {
      this._footprint && this._footprint.onSelect();
      this._mesh && this._mesh.onSelect();
    },

    /**
     * Handles the behaviour of the Feature when it is deselected.
     */
    onDeselect: function () {
      this._footprint && this._footprint.onDeselect();
      this._mesh && this._mesh.onDeselect();
    },

    /**
     * Shows the Feature depending on its current <code>_displayMode</code>.
     */
    show: function() {
      console.debug('trying to show feature', this.getId(), 'as', this._displayMode);
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
    },

    /**
     * Hides the Feature.
     */
    hide: function() {
      this._visible = false;
      if (this._footprint) {
        this._footprint.hide();
      }
      if (this._mesh) {
        this._mesh.hide();
      }
    }
  }), // End class instance definition.

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    {
      DEFAULT_STYLE: new Style(Colour.GREEN, Colour.GREEN, 1)
    }
  ); // End class mixin;

  return Feature;
});
