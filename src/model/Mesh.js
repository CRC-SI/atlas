define([
  'atlas/lib/utility/Setter',
  'atlas/model/Colour',
  'atlas/model/GeoPoint',
  'atlas/model/Style',
  'atlas/model/Vertex',
  // Base class
  'atlas/model/GeoEntity'
], function(Setter, Colour, GeoPoint, Style, Vertex, GeoEntity) {

  /**
   * @typedef atlas.model.Mesh
   * @ignore
   */
  var Mesh;

  /**
   * @classdesc A Mesh represents a 3D renderable object in Atlas. The Mesh data can be defined
   * using C3ML, the JSON of a GLTF resource, or a URL to a GLTF resource.
   *
   * Note: The use of C3ML of deprecated. If both C3ML and GLTF are provided, the GLTF resources
   *       will be used.
   *
   * @param {String} id - The ID of the Mesh object.
   * @param {Object} meshData - The data required to define what is actually rendered.
   * @param {GeoPoint} [meshData.geoLocation] - The geographic location the Mesh should be
   *     rendered at.
   * @param {Number} [meshData.uniformScale] - A uniform scale applied to the Mesh.
   * @param {Vertex} [meshData.scale] - A non-uniform scale applied to the Mesh.
   * @param {Vertex} [meshData.rotation] - A rotation applied to the Mesh.
   * @param {atlas.model.Colour} [meshData.color] - A uniform color to apply to the Mesh.
   * @param {String} [meshData.gltfUrl] - URL of GLTF data to construct the Mesh.
   * @param {Object} [meshData.gltf] - JSON GLTF object to construct the Mesh.
   * @param {Array.<Number>} [meshData.positions] - [C3ML] The array of vertex positions for the
   *     Mesh. This should be a 1D array where every three elements describe a new vertex.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Array.<Number>} [meshData.indices] - [C3ML] The array of triangle indices for the Mesh.
   *     This should be a 1D array where every three elements are groubed together and describe a
   *     triangle forming the mesh. The value of each element is the index of a vertex in the
   *     positions array.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Array.<Number>} [meshData.normals] - [C3ML] An array of normal vectors for each vertex
   *     defined in <code>meshData.positions</code>.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Object} args - Both optional and required construction parameters.
   * @param {String} args.id - The ID of the GeoEntity. (Optional if both <code>id</code> and
   *     <code>args</code> are provided as arguments)
   * @param {atlas.render.RenderManager} args.renderManager - The RenderManager object responsible
   *     for the GeoEntity.
   * @param {atlas.events.EventManager} args.eventManager - The EventManager object responsible for
   *     the Event system.
   * @param {atlas.events.EventTarget} [args.parent] - The parent EventTarget object of the
   *     GeoEntity.
   *
   * @class atlas.model.Mesh
   * @extends atlas.model.GeoEntity
   */
  Mesh = GeoEntity.extend(/** @lends atlas.model.Mesh# */ {
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
     * The location of the mesh object.
     * @type {atlas.model.GeoPoint}
     * @protected
     */
    _geoLocation: null,

    /**
     * The scale of the mesh, along the X, Y, and Z axis.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _scale: null,

    /**
     * A uniform scale to apply to the Mesh. Explicitly for Meshes defined by GLTF.
     * @type {Number}
     * @protected
     */
    _uniformScale: null,

    /**
     * The rotation of the Mesh.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _rotation: null,

    /**
     * Defines a transformation from model space to world space. This is derived from
     *     <code>Mesh._geoLocation</code>,
     * <code>Mesh._scale</code>, and <code>Mesh._rotation</code>.
     * @type {Object}
     * @protected
     */
    _modelMatrix: null,

    /**
     * The uniform colour to apply to the Mesh if a texture is not defined.
     * TODO(bpstudds): Work out the textures.
     * @type {atlas.model.Colour}
     * @protected
     * @deprecated
     */
    _uniformColour: null,

    /**
     * True iff the Mesh is defined using GLTF input.
     * @type {Boolean}
     * @protected
     */
    _isGltf: false,

    _init: function(id, meshData, args) {
      this._super(id, args);

      // Set generic properties .
      this._uniformScale = Setter.def(meshData.uniformScale, 1);
      this._rotation = Setter.defCstr(meshData.rotation, Vertex);
      this._scale = Setter.defCstr(meshData.scale, Vertex, [1, 1, 1]);
      this._geoLocation = Setter.defCstr(meshData.geoLocation, GeoPoint);

      // Set GLTF properties
      if (meshData.gltf) {
        this._gltf = meshData.gltf;
      }

      if (meshData.gltfUrl) {
        this._gltfUrl = meshData.gltfUrl;
      }
      this._isGltf = !!(this._gltf || this._gltfUrl);

      // Set the Mesh's style based on the hierarchy: a Mesh specific style,
      // inherit the parent Feature's style, or use the Mesh default style.
      if (meshData.color) {
        // TODO(bpstudds): Work out the textures.
        this.setStyle(new Style({fillColour: Colour.fromRGBA(meshData.color)}));
      } else {
        this.setStyle(args.style || Style.getDefault());
      }

      // Set C3ML properties only if GLTF is not defined.
      if (!this.isGltf()) {
        if (meshData.positions && meshData.positions.length) {
          this._positions = new Float64Array(meshData.positions.length);
          meshData.positions.forEach(function(position, i) {
            this._positions[i] = position;
          }, this);
        }

        if (meshData.triangles && meshData.triangles.length) {
          this._indices = new Uint16Array(meshData.triangles.length);
          meshData.triangles.forEach(function(triangle, i) {
            this._indices[i] = triangle;
          }, this);
        }

        // TODO(aramk) Normals not currently used.
        if (meshData.normals && meshData.normals.length) {
          this._normals = new Float64Array(meshData.normals.length);
          meshData.normals.forEach(function(normal, i) {
            this._normals[i] = normal;
          }, this);
        }
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.Vertex}
     */
    getGeoLocation: function() {
      return this._geoLocation;
    },

    getOpenLayersGeometry: function() {
      // TODO(aramk) Currently only supported in Atlas-Cesium.
      throw new Error('Incomplete method');
    },

    // TODO(aramk) Re-render mesh when changing height.
    setElevation: function(elevation) {
      this._super(elevation);
      this._geoLocation.elevation = elevation;
    },

    isGltf: function() {
      return this._isGltf;
    }

  });

  return Mesh;
});
