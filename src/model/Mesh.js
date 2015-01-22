define([
  'atlas/lib/utility/Setter',
  'atlas/material/Color',
  'atlas/model/GeoPoint',
  'atlas/material/Style',
  'atlas/model/Vertex',
  // Base class
  'atlas/model/GeoEntity'
], function(Setter, Color, GeoPoint, Style, Vertex, GeoEntity) {

  /**
   * @typedef atlas.model.Mesh
   * @ignore
   */
  var Mesh;

  /**
   * @classdesc A Mesh represents a 3D renderable object in Atlas. The Mesh data can be defined
   * using C3ML, the JSON of a glTF resource, or a URL to a glTF resource.
   *
   * Note: The use of C3ML of deprecated. If both C3ML and glTF are provided, the glTF resources
   *       will be used.
   *
   * @param {String} id - The ID of the Mesh object.
   * @param {Object} data - The data required to define what is actually rendered.
   * @param {GeoPoint} [data.geoLocation] - The geographic location the Mesh should be
   *     rendered at.
   * @param {Number} [data.uniformScale] - A uniform scale applied to the Mesh.
   * @param {String} [data.gltfUrl] - URL of glTF data to construct the Mesh.
   * @param {Object} [data.gltf] - JSON glTF object to construct the Mesh.
   * @param {Array.<Number>} [data.positions] - [C3ML] The array of vertex positions for the
   *     Mesh. This should be a 1D array where every three elements describe a new vertex.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Array.<Number>} [data.indices] - [C3ML] The array of triangle indices for the Mesh.
   *     This should be a 1D array where every three elements are groubed together and describe a
   *     triangle forming the mesh. The value of each element is the index of a vertex in the
   *     positions array.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Array.<Number>} [data.normals] - [C3ML] An array of normal vectors for each vertex
   *     defined in <code>data.positions</code>.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {atlas.material.Color} [data.color] - [C3ML] A uniform color to apply to the Mesh.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Vertex} [data.scale] - [C3ML] A non-uniform scale applied to the Mesh.
   *     Not used if either <code>gltf</code> or <code>gltfUrl</code> are provided.
   * @param {Vertex} [data.rotation] - [C3ML] A rotation applied to the Mesh.
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
     * A uniform scale to apply to the Mesh. Explicitly for Meshes defined by glTF.
     * @type {Number}
     * @protected
     */
    _uniformScale: null,

    /**
     * Defines a transformation from model space to world space. This is derived from
     *     <code>Mesh._geoLocation</code>,
     * <code>Mesh._scale</code>, and <code>Mesh._rotation</code>.
     * @type {Object}
     * @protected
     */
    _modelMatrix: null,

    /**
     * The uniform color to apply to the Mesh if a texture is not defined.
     * TODO(bpstudds): Work out the textures.
     * @type {atlas.material.Color}
     * @protected
     * @deprecated
     */
    _uniformColor: null,

    /**
     * True iff the Mesh is defined using glTF input.
     * @type {Boolean}
     * @protected
     */
    _isGltf: false,

    _setup: function(id, data, args) {
      // Setting elevation in GeoEntity needs geoLocation.
      var geoLocation = data.geoLocation;
      if (!geoLocation) {
        throw new Error('No geolocation provided for Mesh.');
      }
      this._geoLocation = new GeoPoint(geoLocation);
      this._super(id, data, args);

      // Set generic properties .
      this._uniformScale = Setter.def(data.uniformScale, 1);

      // Set glTF properties
      if (data.gltf) {
        this._gltf = data.gltf;
      }

      if (data.gltfUrl) {
        this._gltfUrl = data.gltfUrl;
      }
      this._isGltf = !!(this._gltf || this._gltfUrl);

      // Set C3ML properties only if glTF is not defined.
      if (!this.isGltf()) {
        if (data.positions && data.positions.length) {
          this._positions = new Float64Array(data.positions.length);
          data.positions.forEach(function(position, i) {
            this._positions[i] = position;
          }, this);
        }

        if (data.triangles && data.triangles.length) {
          this._indices = new Uint16Array(data.triangles.length);
          data.triangles.forEach(function(triangle, i) {
            this._indices[i] = triangle;
          }, this);
        }

        // TODO(aramk) Normals not currently used.
        if (data.normals && data.normals.length) {
          this._normals = new Float64Array(data.normals.length);
          data.normals.forEach(function(normal, i) {
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
    },

    toJson: function(args) {
      args = args || {};
      var json = Setter.merge(this._super(), {
        type: 'mesh',
        geoLocation: this.getGeoLocation()
      });
      if (this.isGltf()) {
        json.gltf = Setter.clone(this._gltf);
        json.gltfUrl = this._gltfUrl;
      } else {
        json.positions = args.positions || Setter.clone(this._positions);
        json.triangles = Setter.clone(this._indices);
        json.normals = Setter.clone(this._normals);
      }
      return json;
    }

  });

  return Mesh;
});
