define([
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Setter',
  'atlas/model/GeoEntity',
  'atlas/model/GeoPoint',
  'atlas/model/Handle',
  'atlas/util/WKT'
], function(Types, Setter, GeoEntity, GeoPoint, Handle, WKT) {
  /**
   * @typedef atlas.model.VertexedEntity
   * @ignore
   */
  var VertexedEntity;

  /**
   * @classdesc A VertexedEntity is an GeoEntity that's rendered form can be expressed as an ordered
   * list of points. This class abstracts the process of adding, removing, and inserting new
   * vertices into the GeoEntity.
   * @class atlas.model.VertexedEntity
   * @extends atlas.model.GeoEntity
   */
  VertexedEntity = GeoEntity.extend(/** @lends atlas.model.VertexedEntity# */ {

    /**
     * An array of vertices in counter-clockwise order.
     * @type {Array.<atlas.model.GeoPoint>}
     */
    _vertices: null,

    /**
     * The z-axis order as an integer in the range [0, Infinity]. Entities with higher zIndex will
     * appear on top.
     * @type {Number}
     * @private
     */
    _zIndex: 0,

    /**
     * The z-axis offset for z-index used to separate different indices.
     * @type {Number}
     * @private
     */
    _zIndexOffset: 0.1,

    _init: function(id, data, args) {
      this._super(id, args);
      this._vertices = [];
      var vertices = data.vertices;
      if (Types.isString(vertices)) {
        var wkt = WKT.getInstance(),
            vertexArray = wkt.geoPointsFromWKT(vertices);
        if (vertexArray[0] instanceof Array) {
          // Polygon
          this._vertices = vertexArray[0];
        } else if (vertexArray[0] instanceof GeoPoint) {
          // Line
          this._vertices = vertexArray;
        } else {
          throw new Error('Invalid vertices for entity ' + id);
        }
      } else if (Types.isArrayLiteral(vertices)) {
        this._vertices = Setter.def(vertices, []).map(function(vertex) {
          return new GeoPoint(vertex);
        });
      } else {
        throw new Error('Invalid vertices for entity ' + id);
      }
    },

    // -------------------------------------------
    // CONSTRUCTION
    // -------------------------------------------

    _build: function() {
      if (this.isDirty('entity') || this.isDirty('vertices') || this.isDirty('model')) {
        // Update the entity handle (if any).
        var entityHandle = this.getEntityHandle();
        if (entityHandle) {
          entityHandle.setTarget(this.getCentroid());
        }
      }
    },

    createHandles: function() {
      var handles = [];
      // Add a Handle for the GeoEntity itself.
      var entityHandle = this._createEntityHandle();
      this.setEntityHandle(entityHandle);
      entityHandle && handles.push(entityHandle);
      // Add Handles for each vertex.
      this._vertices.forEach(function(vertex, i) {
        handles.push(this.createHandle(vertex, i));
      }, this);
      return handles;
    },

    createHandle: function(vertex, index) {
      // TODO(aramk) Use a factory to use the right handle class.
      return new Handle(this._bindDependencies({target: vertex, index: index, owner: this}));
    },

    /**
     * @return Adds a Handle for the GeoEntity itself. Override and return falsey to prevent this
     * behaviour.
     * @private
     */
    _createEntityHandle: function() {
      return this.createHandle();
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    translate: function(translation) {
      this._vertices.forEach(function(vertex) {
        vertex.set(vertex.translate(translation));
      });
      this._handles.map(function(handle) {
        handle.translate(translation, {delegate: false});
      });
      this._super(translation);
    },

    scale: function(scale) {
      var centroid = this.getCentroid();
      this._vertices.forEach(function(vertex, i) {
        var diff = vertex.subtract(centroid).toVertex();
        diff = diff.componentwiseMultiply(scale);
        this._vertices[i] = centroid.translate(GeoPoint.fromVertex(diff));
      }, this);
      this._height *= scale.z;
      this._super(scale);
    },

    // TODO(aramk) Rotation of vertices needs matrix math functions in Atlas.
    // TODO(aramk) Perhaps a better strategy than transforming the original vertices would
    // be to keep the transformation entirely separate and apply it conditionally after building
    // the primitive. At the moment, we're relying on reproducing the transformation to vertices
    // that affect the primitives in atlas-cesium. At the same time, atlas should perform all the
    // calculations the provider (atlas-cesium) should only be visualising, so we likely need
    // matrix transformations in Atlas, which is more work for now.

//    rotate: function(rotation) {
//      this._super(rotation);
//    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Adds a vertex to the end of the list of points describing the GeoEntity.
     * @param {atlas.model.GeoPoint} vertex - vertex to add to the GeoEntity.
     * @returns {Number} The index at which the vertex was added.
     */
    addVertex: function(vertex) {
      this._vertices.push(vertex);
      this.setDirty('vertices');
      return this._vertices.length;
    },

    /**
     * Inserts a vertex at particular index of the GeoEntity. If the index is larger
     * than the number of vertices in the GeoEntity, it is appended to the
     * GeoEntity's vertices as per {@link atlas.model.VertexedEntity#addVertex|addVertex}.
     * @param {number} index - The index to insert at. Negative indexes insert relative to the
     * end of the array, <code>-1</code> inserts as the last element,
     * @param {Vertex} vertex - The vertex to be added.
     * @returns {Number} The index at which vertex was inserted.
     */
    insertVertex: function(index, vertex) {
      var insertAt = index;
      if (index < 0) {
        insertAt = this._vertices.length + 1 + index;
      }
      // TODO(aramk) This will destroy the indices for the handles. Pass them IDs instead of
      // indices.
      this._vertices.splice(insertAt, 0, vertex);
      this.setDirty('vertices');
      return insertAt;
    },

    /**
     * Removes a vertex from the GeoEntity.
     * @param {Number} [index] - The index of the vertex to remove. If absent, the last vertex is
     *     removed.
     * @returns {Vertex|null} The vertex removed, or null if <code>index</code> is invalid
     */
    removeVertex: function(index) {
      if (index === undefined) {
        index = this._vertices.length - 1;
      }
      if (-this._vertices.length <= index && index <= this._vertices.length - 1) {
        var removed = this._vertices.splice(index, 1)[0];
        this.setDirty('vertices');
        return removed;
      }
      return null;
    },

    getVertices: function() {
      return this._vertices;
    },

    getArea: function() {
      if (this._area) {
        return this._area;
      }
      var geometry = this.getOpenLayersGeometry();
      this._area = geometry.getGeodesicArea();
      return this._area;
    },

    getOpenLayersGeometry: function() {
      var wkt = WKT.getInstance();
      return wkt.openLayersPolygonFromGeoPoints(this._vertices);
    },

    /**
     * Set the elevation of the base of the GeoEntity.
     * @param {Number} elevation - The elevation of the base of the GeoEntity.
     */
    setElevation: function(elevation) {
      this._super(elevation);
      this.setDirty('vertices');
    },

    /**
     * Sets the z-axis order. Entities with higher zIndex will appear on top.
     * @param {Number} index
     */
    setZIndex: function(index) {
      if (typeof index === 'number' && this._zIndex !== index) {
        this._zIndex = index;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The z-axis order.
     */
    getZIndex: function() {
      return this._zIndex;
    }

  });

  return VertexedEntity;
});
