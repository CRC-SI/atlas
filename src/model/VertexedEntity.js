define([
  'atlas/events/Event',
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Setter',
  'atlas/model/GeoEntity',
  'atlas/model/GeoPoint',
  'atlas/model/Handle',
  'atlas/util/WKT',
  'underscore'
], function(Event, Types, Setter, GeoEntity, GeoPoint, Handle, WKT, _) {
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
     * An array of vertices in counter-clockwise order. Transformations modify these values.
     * @type {Array.<atlas.model.GeoPoint>}
     */
    _vertices: null,

    /**
     * An array of vertices in counter-clockwise order before transformations.
     * @type {Array.<atlas.model.GeoPoint>}
     */
    _initialVertices: null,

    /**
     * List of counter-clockwise ordered array of vertices constructing holes of this polygon.
     * @type {Array.<Array.<atlas.model.GeoPoint>>}
     * @private
     */
    _holes: null,

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

    _setup: function(id, data, args) {
      if (Types.isString(data.vertices)) {
        var wkt = WKT.getInstance();
        var verticesWithHoles = wkt.verticesAndHolesFromWKT(data.vertices);
        data.vertices = verticesWithHoles.vertices;
        if (verticesWithHoles.holes.length > 0 && !data.holes) {
          data.holes = verticesWithHoles.holes;
        }
      }

      this._super(id, data, args);
      // This will also reset the transformations applied in the super constructor.
      this.setVertices(this._getSanitizedVertices(data.vertices));
      data.holes && this.setHoles(data.holes);
      // Apply transformations if they are provided, which will cause the vertices to be
      // transformed.
      data.translation && this.setTranslation(data.translation);
      data.scale && this.setScale(data.scale);
      data.rotation && this.setRotation(data.rotation);

      this._zIndex = parseFloat(data.zIndex) || this._zIndex;
      this._zIndexOffset = parseFloat(data.zIndexOffset) || this._zIndexOffset;
    },

    // -------------------------------------------
    // CONSTRUCTION
    // -------------------------------------------

    /**
     * @param {String|Array.<GeoPoint|Array>} vertices - Any vaid representation of vertices.
     * @return {Array.<GeoPoint>} A copy of the given vertices in the format expected by this class.
     */
    _getSanitizedVertices: function(vertices) {
      if (Types.isString(vertices)) {
        var wkt = WKT.getInstance();
        return wkt.geoPointsFromWKT(vertices);
      } else if (Types.isArrayLiteral(vertices)) {
        return vertices.map(function(vertex) {
          return new GeoPoint(vertex);
        });
      } else {
        throw new Error('Invalid vertices for entity ' + this.getId());
      }
    },

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
      this._maybeCopyInitialVertices();
      this._vertices.forEach(function(vertex) {
        vertex.set(vertex.translate(translation));
      });
      this._handles.map(function(handle) {
        handle.translate(translation, {delegate: false});
      });
      this._super(translation);
    },

    scale: function(scale) {
      this._maybeCopyInitialVertices();
      var centroid = this.getCentroid();
      this._vertices.forEach(function(vertex, i) {
        var diff = vertex.subtract(centroid).toVertex();
        diff = diff.componentwiseMultiply(scale);
        this._vertices[i] = centroid.translate(GeoPoint.fromVertex(diff));
      }, this);
      if (this._height !== undefined) {
        this._height *= scale.z;
      }
      this._super(scale);
    },

    // TODO(aramk) Rotation of vertices needs matrix math functions in Atlas.
    // TODO(aramk) Perhaps a better strategy than transforming the initial vertices would
    // be to keep the transformation entirely separate and apply it conditionally after building
    // the primitive. At the moment, we're relying on reproducing the transformation to vertices
    // that affect the primitives in atlas-cesium. At the same time, atlas should perform all the
    // calculations the provider (atlas-cesium) should only be visualising, so we likely need
    // matrix transformations in Atlas, which is more work for now.

    // rotate: function(rotation) {
    //   this._maybeCopyInitialVertices();
    //   this._super(rotation);
    // },

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
      var len = this._vertices.length;
      if (-len <= index && index <= len - 1) {
        var removed = this._vertices.splice(index, 1)[0];
        this.setDirty('vertices');
        return removed;
      }
      return null;
    },

    /**
     * Sets the given vertices.
     * @param {Array.<atlas.model.GeoPoint>} vertices
     * @param {Object} [options]
     * @param {Object} [options.resetTransformations=true] Whether to reset transformations.
     */
    setVertices: function(vertices, options) {
      options = Setter.merge({resetTransformations: true}, options);
      // Initially, vertex references are shared to save memory.
      this._vertices = this._initialVertices = this._getSanitizedVertices(vertices);
      options.resetTransformations && this.resetTransformations();
      this.setDirty('vertices');
      this._update();
      if (!this.isSetUp) {
        this._eventManager.dispatchEvent(new Event(this, 'entity/vertices/changed', {
          ids: [this.getId()]
        }));
      }
    },

    /**
     * @return {Array.<atlas.model.GeoPoint>} A reference to the transformed vertices.
     */
    getVertices: function() {
      return this._vertices;
    },

    /**
     * @return {Array.<atlas.model.GeoPoint>} A shallow copy of the initial vertices.
     */
    getInitialVertices: function() {
      this._maybeCopyInitialVertices();
      return this._initialVertices;
    },

    /**
     * Performs a copy-on-write of the current vertices to create the initial vertices if they
     * are shared references.
     * @return {Boolean} Whether the initial vertices were created.
     */
    _maybeCopyInitialVertices: function() {
      var isRef = this._initialVertices === this._vertices;
      if (isRef) {
        this._initialVertices = _.map(this._vertices, function(vertex) {
          return vertex.clone();
        });
      }
      return isRef;
    },

    /**
     * @return {atlas.model.GeoPoint} The centroid of the original vertices.
     */
    getInitialCentroid: function() {
      return this._calcCentroid({
        vertices: this.getInitialVertices()
      });
    },

    /**
     * @params {Object} [args]
     * @params {Boolean} [args.utm=false] - Whether to use UTM coordinates for the vertices.
     * @params {Array.<atlas.model.GeoPoint>} [args.vertices] - The vertices to use for calculating
     *     the centroid. By default, the current vertices (including transformations) are used.
     * @returns {OpenLayers.Geometry}
     */
    getOpenLayersGeometry: function(args) {
      var vertices = (args && args.vertices) || this.getVertices();
      var wkt = WKT.getInstance();
      if (args && args.utm) {
        vertices = vertices.map(function(point) {
          return point.toUtm().coord;
        });
        return wkt.openLayersPolygonFromVertices(vertices);
      } else {
        return wkt.openLayersPolygonFromGeoPoints(vertices);
      }
    },

    /**
     * @returns {Array.<atlas.model.GeoPoint>}
     */
    getHoles: function() {
      return this._holes;
    },

    /**
     * @param {Array.<Array.<atlas.model.GeoPoint>>} holes
     */
    setHoles: function(holes) {
      this._holes = holes.map(function(vertices) {
        return this._getSanitizedVertices(vertices);
      }, this);
      this.setDirty('vertices');
      this._update();
    },

    /**
     * Set the elevation of the base of the GeoEntity.
     * @param {Number} elevation - The elevation of the base of the GeoEntity.
     */
    setElevation: function(elevation) {
      this._super(elevation);
      this.setDirty('vertices');
      this._update();
    },

    /**
     * Sets the z-axis order. Entities with higher zIndex will appear on top.
     * @param {Number} index
     */
    setZIndex: function(index) {
      if (this._zIndex !== index) {
        this._zIndex = index;
        this.setDirty('vertices');
        this._update();
      }
    },

    /**
     * @returns {Number} The z-axis order.
     */
    getZIndex: function() {
      return this._zIndex;
    },

    toJson: function(args) {
      args = args || {};
      var json = Setter.merge(this._super(args), {
        coordinates: args.coordinates || this.getInitialVertices().map(function(vertex) {
          return vertex.toArray();
        })
      });
      var holes = args.holes;
      if (!holes) {
        holes = this.getHoles();
        if (holes) {
          holes = holes.map(function(vertices) {
            return vertices.map(function(vertex) {
              return vertex.toArray();
            });
          });
        }
      }
      if (holes) {
        json.holes = holes;
      }
      json.centroid = this.getInitialCentroid().toArray();
      return json;
    }

  });

  return VertexedEntity;
});
