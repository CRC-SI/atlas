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
     * The elevation of the base of the GeoEntity.
     * @type {Number}
     * @private
     */
    _elevation: 0,

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
            vertexArray = wkt.verticesFromWKT(vertices);
        if (vertexArray[0] instanceof Array) {
          this._vertices = vertexArray[0];
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
        // Rebuild centroid. Assign it back in case subclasses change memoization logic.
        var oldCentroid = this._centroid;
        this._centroid = null;
        this._centroid = this.getCentroid();
        if (oldCentroid && !oldCentroid.equals(this._centroid)) {
          // Update the entity handle (if any).
          var entityHandle = this.getEntityHandle();
          if (entityHandle) {
            entityHandle.setTarget(this._centroid);
          }
        }
        // Invalidate the area.
        this._area = null;
      }
      this.clean();
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
      // TODO(aramk) This centroid isn't the same instance as in the handle.
      this.getCentroid().translate(translation);
      this._vertices.forEach(function(vertex) {
        vertex.set(vertex.translate(translation));
      });
      // TODO(aramk) Why does this update the handle vertex?
      this._handles.map(function(handle) {
        handle.translate(translation, {delegate: false});
      });
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    scale: function(scale) {
      var centroid = this.getCentroid();
      this._vertices.forEach(function(vertex, i) {
        var diff = vertex.subtract(centroid);
        diff = diff.componentwiseMultiply(scale);
        this._vertices[i] = diff.add(centroid);
      }, this);
      this.setDirty('model');
      this.isVisible() && this.show();
    },

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
      // Invalidate any pre-calculated area and centroid.
      this.setDirty('vertices');
      this._area = null;
      this._centroid = null;
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
      // Clear derived values.
      this.setDirty('vertices');
      this._area = null;
      this._centroid = null;
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
        // Clear derived values
        this.setDirty('vertices');
        this._area = null;
        this._centroid = null;
        return removed;
      }
      return null;
    },

    getVertices: function() {
      return this._vertices;
    },

    getOpenLayersGeometry: function() {
      var wkt = WKT.getInstance();
      return wkt.openLayersPolygonFromVertices(this._vertices);
    },

    /**
     * Set the elevation of the base of the GeoEntity.
     * @param {Number} elevation - The elevation of the base of the GeoEntity.
     */
    setElevation: function(elevation) {
      if (typeof elevation === 'number' && this._elevation !== elevation) {
        this._elevation = elevation;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The elevation of the base of the GeoEntity.
     */
    getElevation: function() {
      return this._elevation;
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
