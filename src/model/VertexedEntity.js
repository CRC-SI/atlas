define([
  'atlas/model/GeoEntity',
  'atlas/model/GeoPoint',
  'atlas/model/Vertex',
  'atlas-cesium/model/Handle'
], function (GeoEntity, GeoPoint, Vertex) {
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

    _init: function (id, args) {
      this._super(id, args);
      this._vertices = [];
    },

    // -------------------------------------------
    // CONSTRUCTION
    // -------------------------------------------

    createHandles: function() {
      var handles = [];
      // Add a Handle for the GeoEntity itself.
      handles.push(new Handle(this._bindDependencies({owner: this})));
      // Add Handles for each vertex.
      this._vertices.forEach(function(vertex, i) {
        // TODO(aramk) This modifies the underlying vertices - it should create copies and
        // respond to changes in the copies. Also move this method and createHandle() to
        // VertexedEntity.
        handles.push(this.createHandle(vertex, i));
      }, this);
      return handles;
    },

    createHandle: function(vertex, index) {
      // TODO(aramk) Use a factory to use the right handle class.
      return new Handle(this._bindDependencies({target: vertex, index: index, owner: this}));
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Translates the GeoEntity.
     * @param {atlas.model.Vertex} translation - The vector from the GeoEntity's current location to the desired location.
     * @param {Number} translation.x - The change in latitude, given in decimal degrees.
     * @param {Number} translation.y - The change in longitude, given in decimal degrees.
     * @param {Number} translation.z - The change in altitude, given in metres.
     */
    translate: function(translation) {
      this._vertices.forEach(function(vertex) {
        vertex.set(vertex.translate(translation));
      });
      this._handles.map(function(handle) {
        handle.translate(translation, {delegate: false});
      });
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    /**
     * Scales the GeoEntity by the given vector. This scaling can be uniform in all axis or non-uniform.
     * A scaling factor of <code>1</code> has no effect. Factors lower or higher than <code>1</code>
     * scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as big and
     * <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the GeoEntity by.
     * @param {Number} scale.x - The scale along the <code>latitude</code> axis.
     * @param {Number} scale.y - The scale along the <code>longitude</code> axis.
     */
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

    /**
     * Gets the area of the GeoEntity, in <tt>unit**2</tt> where <tt>unit</tt> is the
     * unit corresponding to the Vertices describing this GeoEntity.
     * @see {@link http://www.mathopenref.com/coordpolygonarea2.html}
     * @returns {Number} The area of the GeoEntity.
     */
    getArea: function() {
      if (this._area) {
        return this._area;
      }
      this._area = 0;
      var j = this._vertices.length - 1;  // The last vertex is the 'previous' one to the first
      for (var i = 0; i < this._vertices.length; i++) {
        this._area = this._area +
            (this._vertices[j].x + this._vertices[i].x) *
            (this._vertices[j].y - this._vertices[i].y);
        j = i;  //j is previous vertex to i
      }
      this._area /= 2;
      return this._area;
    },

    /**
     * Gets the centroid of the GeoEntity. Assumes that the GeoEntity is a 2D surface, ie. Vertex.z is
     * constant across the polygon.
     * @returns {atlas.model.GeoPoint} The GeoEntity's centroid.
     * @see {@link http://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript/9939071#9939071}
     * @see  {@link http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon}
     */
    getCentroid: function() {
      if (this._centroid) {
        return this._centroid.clone();
      }
      // Need a closed set of vertices for the algorithm to work. Temporarily add the first vertex
      // to the end of the list of vertices.
      this._vertices.push(this._vertices[0]);
      var x, y, f, twiceArea, p1, p2;
      x = y = f = twiceArea = 0;
      for (var i = 0; i < this._vertices.length - 1; i++) {
        p1 = this._vertices[i];
        p2 = this._vertices[i + 1];
        f = (p1.x * p2.y) - p2.x * p1.y;
        x += (p1.x + p2.x) * f;
        y += (p1.y + p2.y) * f;
        twiceArea += f;
      }
      // Remove vertex added to end
      this._vertices.pop();
      f = 3 * twiceArea;
      this._centroid = GeoPoint.fromVertex(new Vertex(x / f, y / f, p1.z + this.getElevation()));
      return this._centroid.clone();
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
