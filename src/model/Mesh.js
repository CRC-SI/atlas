define([
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  'atlas/model/Colour',
  'atlas/model/Style',
  'atlas/model/Vertex',
  // Base class
  'atlas/model/GeoEntity'
], function (
  DeveloperError,
  mixin,
  Colour,
  Style,
  Vertex,
  GeoEntity) {

  /**
   * @classdesc A Mesh represents a 3D renderable object in Atlas.
   *
   * @param {String} id - The ID of the Mesh object.
   * @param {Object} meshData - The data required to define what is actually rendered (Implementation defined).
   * @param {Object} args - Both optional and required construction parameters.
   * @param {String} args.id - The ID of the GeoEntity. (Optional if both <code>id</code> and <code>args</code> are provided as arguments)
   * @param {atlas.render.RenderManager} args.renderManager - The RenderManager object responsible for the GeoEntity.
   * @param {atlas.events.EventManager} args.eventManager - The EventManager object responsible for the Event system.
   * @param {atlas.events.EventTarget} [args.parent] - The parent EventTarget object of the GeoEntity.
   *
   * @class atlas.model.Mesh
   * @extends atlas.model.GeoEntity
   */
  //var Mesh = function (id, meshData, args) {
  var Mesh = mixin(GeoEntity.extend(/** @lends atlas.model.Mesh# */ {
    /**
     * The array of vertex positions for this Mesh, in model space coordinates.
     * This is a 1D array to conform with Cesium requirements. Every three elements of this
     * array describes a new vertex, with each element being the x, y, z component respectively.
     * @type {Float64Array}
     * @protected
     */
    _positions: null,

    /**
     * The array of indices describing the 3D mesh. Every three elements of the array are grouped
     * together and describe a triangle forming the mesh. The value of the element is the index
     * of virtual positions array (the array if each element in <code>Mesh._positions</code> was
     * an (x,y,z) tuple) that corresponds to that vertex of the triangle.
     * @type {Uint16Array}
     * @protected
     */
    _indices: null,

    /**
     * An array of normal vectors for each vertex defined in <code>Mesh._positions</code>.
     * @type {Float64Array}
     * @protected
     */
    _normals: null,

    /**
     * The location of the mesh object, specified by latitude, longitude, and elevation.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _geoLocation : null,

    /**
     * The scale that is applied to the Mesh when transforming it from model space to world space.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _scale : null,

    /**
     * The rotation that is applied to the MEsh when transforming it from model space to world space.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _rotation : null,

    /**
     * Defines a transformation from model space to world space. This is derived from <code>Mesh._geoLocation</code>,
     * <code>Mesh._scale</code>, and <code>Mesh._rotation</code>.
     * @type {Object}
     * @protected
     */
    _modelMatrix : null,

    /**
     * The uniform colour to apply to the Mesh if a texture is not defined.
     * TODO(bpstudds): Work out the textures.
     * @type {atlas.model.Colour}
     * @protected
     * @deprecated
     */
    _uniformColour: null,

    _init: function (id, meshData, args) {
      this._super(id, args);

      // Set the Mesh's style based on the hierarchy: a Mesh specific style,
      // inherit the parent Feature's style, or use the Mesh default style.
      this._style = meshData.style || args.style || Mesh.getDefaultStyle;

      // Parse all the things!
      if (meshData.positions && meshData.positions.length) {
        this._positions = new Float64Array(meshData.positions.length);
        meshData.positions.forEach(function (position, i) {
          this._positions[i] = position;
        }, this);
      }

      if (meshData.triangles && meshData.triangles.length) {
        this._indices = new Uint16Array(meshData.triangles.length);
        meshData.triangles.forEach(function (triangle, i) {
          this._indices[i] = triangle;
        }, this);
      }

      if (meshData.normals && meshData.normals.length) {
        this._normals = new Float64Array(meshData.normals.length);
        meshData.normals.forEach(function (normal, i) {
          this._normals[i] = normal;
        }, this);
      }

      if (meshData.geoLocation) {
        this._geoLocation = new Vertex(meshData.geoLocation);
      }

      if (meshData.scale && meshData.scale.length > 0) {
        this._scale = new Vertex(meshData.scale);
      } else {
        this._scale = new Vertex(1,1,1);
      }

      if (meshData.rotation && meshData.rotation.length > 0) {
        this._rotation = new Vertex(meshData.rotation);
      } else {
        this._rotation = new Vertex(0,0,0);
      }

      if (meshData.color) {
        // TODO(bpstudds): Work out the textures.
        this._style = new Style({fillColour: Colour.fromRGBA(meshData.color)});
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getVertices: function() {
      return [];
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Translates the Mesh.
     * @param {atlas.model.Vertex} translation - The vector from the Mesh's current location to the desired location.
     * @param {Number} translation.x - The change in latitude, given in decimal degrees.
     * @param {Number} translation.y - The change in longitude, given in decimal degrees.
     * @param {Number} translation.z - The change in altitude, given in metres.
     */
    translate: function (translation) {
      // Update the 'translation', ie change _geoLocation.
      this._geoLocation = this._geoLocation.add(translation);
      // And redraw the Mesh.
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    /**
     * Scales the Mesh.
     * @param {atlas.model.Vertex} scale - The vector to scale the Mesh by.
     * @param {Number} scale.x - The scale along the <code>x</code> axis.
     * @param {Number} scale.y - The scale along the <code>y</code> axis.
     * @param {Number} scale.z - The scale along the <code>z</code> axis.
     */
    scale: function (scale) {
      this._scale = this._scale.componentwiseMultiply(scale);
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    /**
     * Rotates the Mesh by the given vector.
     * @param {atlas.model.Vertex} rotation - The vector to rotate the Mesh by.
     * @param {Number} rotation.x - The rotation about the <code>x</code> axis in degrees, negative
     *    rotates clockwise, positive rotates counterclockwise.
     * @param {Number} rotation.y - The rotation about the <code>y</code> axis in degrees, negative
     *    rotates clockwise, positive rotates counterclockwise.
     * @param {Number} rotation.z - The rotation about the <code>z</code> axis in degrees, negative
     *    rotates clockwise, positive rotates counterclockwise.
     */
    rotate: function (rotation) {
      this._rotation = this._rotation.add(rotation);
      this.setDirty('model');
      this.isVisible() && this.show();
    }

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

  }), // End class instance definition

    // -------------------------------------------
    // STATICS
    // -------------------------------------------
    {

      /**
       * The default style of a Mesh.
       * @type {atlas.model.Colour}
       */
      getDefaultStyle: function () { return new Style({fillColour: Colour.GREY}); },

      /**
       * The default selected style of a Mesh.
       * @type {atlas.model.Colour}
       */
      getSelectedStyle: function() { return new Style({fillColour: Colour.RED}); }
    }
  ); // End class mixin

  return Mesh;
});
