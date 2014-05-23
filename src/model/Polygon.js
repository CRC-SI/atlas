define([
  'atlas/model/Colour',
  'atlas/model/Handle',
  'atlas/model/Material',
  'atlas/model/Style',
  'atlas/model/Vertex',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/util/WKT',
  // Base class
  'atlas/model/GeoEntity'
], function(Colour, Handle, Material, Style, Vertex, GeoPoint, DeveloperError, defaultValue, mixin,
            WKT, GeoEntity) {

  /**
   * @typedef atlas.model.Polygon
   * @ignore
   */
  var Polygon;

  /**
   * @classdesc Represents a 2D polygon that can be rendered within an
   * Atlas scene. Polygons are constructed from a series of Vertices specified
   * in a counter-clockwise order. A {@link atlas.model.Material|Material}
   * and {@link atlas.model.Style|Style} can also be defined when
   * constructing a Polygon.
   *
   * @param {Number} id - The ID of this Polygon.
   * @param {Object} polygonData - Data describing the Polygon.
   * @param {string|Array.<atlas.model.Vertex>} [polygonData.vertices=[]] - The vertices of the Polygon.
   * @param {Number} [polygonData.height=0] - The extruded height of the Polygon to form a prism.
   * @param {Number} [polygonData.elevation] - The elevation of the base of the Polygon (or prism).
   * @param {atlas.model.Colour} [polygonData.color] - The fill colour of the Polygon (overridden/overrides Style)
   * @param {atlas.model.Style} [polygonData.style=defaultStyle] - The Style to apply to the Polygon.
   * @param {atlas.model.Material} [polygonData.material=defaultMaterial] - The Material to apply to the polygon.
   * @param {Object} [args] - Option arguments describing the Polygon.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Polygon.
   * @returns {atlas.model.Polygon}
   *
   * @class atlas.model.Polygon
   * @extends atlas.model.GeoEntity
   */
  Polygon = mixin(GeoEntity.extend(/** @lends atlas.model.Polygon# */ {
    // TODO(aramk) Either put docs on params and document the getters and setters which don't have
    // obvious usage/logic.
    // TODO(aramk) Units for height etc. are open to interpretation - define them as metres in docs.
    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @type {Array.<atlas.model.Vertex>}
     * @private
     */
    _vertices: null,

    /**
     * List of counter-clockwise ordered array of vertices constructing holes of this polygon.
     * @type {Array.<Array.<atlas.model.Vertex>>}
     * @private
     */
    _holes: null,

    /**
     * The extruded height of the polygon (if rendered as extruded polygon).
     * @type {Number}
     * @private
     */
    _height: 0,

    /**
     * The elevation of the base of the polygon (or prism).
     * @type {Number}
     * @private
     */
    _elevation: 0,

    /**
     * The z-axis order as an integer in the range [0, Infinity]. Polygons with higher zIndex will
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

    /**
     * The material used to render the polygon.
     * @type {atlas.model.Material}
     * @private
     */
    // TODO(bpstudds): Create a Polygon specific default Material to use.
    _material: null,

    /**
     * Whether the Polygon should be rendered as an extruded polygon or a 2D polygon.
     * @type {Boolean}
     * @protected
     */
    _showAsExtrusion: false,

    /**
     * Constructs a new Polygon
     * @ignore
     */
    _init: function(id, polygonData, args) {
      polygonData = mixin({}, polygonData);
      args = mixin({}, args);
      this._super(id, args);
      if (typeof polygonData.vertices === 'string') {
        // TODO(aramk) Add support for MULTIPOLYGON by not taking the first item.
        var wkt = WKT.getInstance(),
            vertices = wkt.verticesFromWKT(polygonData.vertices);
        if (vertices[0] instanceof Array) {
          this._vertices = vertices[0];
        } else {
          throw new Error('Invalid vertices for Polygon ' + id);
        }
      } else {
        this._vertices = defaultValue(polygonData.vertices, []);
      }
      // Don't have closed polygons.
      var len = this._vertices.length;
      if (this._vertices[0] === this._vertices[len - 1] && len > 1) {
        this._vertices.pop();
      }
      if (polygonData.holes) {
        this._holes = polygonData.holes;
      }
      this._height = parseFloat(polygonData.height) || this._height;
      this._elevation = parseFloat(polygonData.elevation) || this._elevation;
      this._zIndex = parseFloat(polygonData.zIndex) || this._zIndex;
      this._zIndexOffset = parseFloat(polygonData.zIndexOffset) || this._zIndexOffset;
      this._material = (polygonData.material || Material.DEFAULT);
      var style;
      if (polygonData.color) {
        if (polygonData.color instanceof Colour) {
          style = new Style({fillColour: polygonData.color});
        } else {
          style = new Style({fillColour: Colour.fromRGBA(polygonData.color)});
        }
      } else if (polygonData.style) {
        style = polygonData.style;
      } else {
        style = Polygon.getDefaultStyle();
      }
      this.setStyle(style);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getVertices: function() {
      return this._vertices;
    },

    /**
     * Gets the area of the Polygon, in <tt>unit**2</tt> where <tt>unit</tt> is the
     * unit corresponding to the Vertices describing this Polygon.
     * @see {@link http://www.mathopenref.com/coordpolygonarea2.html}
     * @returns {Number} The area of the polygon.
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
     * Gets the centroid of the Polygon. Assumes that the polygon is 2D surface, ie. Vertex.z is
     * constant across the polygon.
     * @returns {atlas.model.GeoPoint} The Polygon's centroid.
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
     * Set the elevation of the base of the polygon (or prism).
     * @param {Number} elevation - The elevation of the base of the polygon.
     */
    setElevation: function(elevation) {
      if (typeof elevation === 'number' && this._elevation !== elevation) {
        this._elevation = elevation;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The elevation of the base of the polygon (or prism).
     */
    getElevation: function() {
      return this._elevation;
    },

    /**
     * Enables showing the polygon as an extruded polygon.
     */
    enableExtrusion: function() {
      this._showAsExtrusion = true;
      this.setDirty('model');
    },

    /**
     * Disables showing the polygon as an extruded polygon.
     */
    disableExtrusion: function() {
      this._showAsExtrusion = false;
      this.setDirty('model');
    },

    /**
     * Set the extruded height of the polygon to form a prism.
     * @param {Number} height The extruded height of the building.
     */
    setHeight: function(height) {
      // TODO(aramk) Throw error if height is not number?
      if (typeof height === 'number' && this._height !== height) {
        this._height = height;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The extrusion height of the polygon.
     */
    getHeight: function() {
      return this._height;
    },

    /**
     * Sets the z-axis order. Polygons with higher zIndex will appear on top.
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
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    // TODO(aramk) Can we move the vertices into a subclass which Polygon and Line can both use?

    /**
     * Adds a vertex to the polygon end of the list of vertices describing the polygon.
     * @param {Vertex} vertex - vertex to add to the polygon.
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
     * Inserts a vertex at particular index of the polygon. If the index is larger
     * than the number of vertices in the polygon, it is appended to the
     * polygons vertices as per {@link atlas.model.Polygon#addVertex|addVertex}.
     * The last element of _vertices is reserved for a duplicate of the first vertex.
     * @param {number} index - The index to insert at.
     * @param {Vertex} vertex - The vertex to be added. '-1' to insert at the end
     * @returns {Number} The index at which vertex was inserted.
     */
    insertVertex: function(index, vertex) {
      var insertAt = index;
      if (index < -1) {
        insertAt = 0;
      } else if (index === -1 || index > this._vertices.length - 1) {
        insertAt = this._vertices.length - 1;
      }
      this._vertices.splice(insertAt, 0, vertex);
      // Maintain closed-ness
      //this._vertices[this._vertices.length - 1] = this._vertices[0];
      // Clear derived values.
      this.setDirty('vertices');
      this._area = null;
      this._centroid = null;
      return insertAt;
    },

    /**
     * Removes a vertex from the Polygon.
     * @param {Number} index - The index of the vertex to remove. '-1' for the last vertex.
     * @returns {Vertex|undefined} The vertex removed, or undefined if <code>index</code> is out of bounds.
     */
    removeVertex: function(index) {
      if (index === -1) {
        index = this._vertices.length - 1;
      }
      if (index === this._vertices.length) {
        index--;
      }
      if (0 <= index && index <= this._vertices.length - 1) {
        var removed = this._vertices.splice(index, 1)[0];
        // Clear derived values
        this.setDirty('vertices');
        this._area = null;
        this._centroid = null;
        return removed;
      }
      return undefined;
    },

    /**
     * Function to enable interactive editing of the polygon.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Polygon.');
    },

    /**
     * Translates the Polygon.
     * @param {atlas.model.Vertex} translation - The vector from the Polygon's current location to the desired location.
     * @param {Number} translation.x - The change in latitude, given in decimal degrees.
     * @param {Number} translation.y - The change in longitude, given in decimal degrees.
     * @param {Number} translation.z - The change in altitude, given in metres.
     */
    translate: function(translation) {
      for (var i = 0; i < this._vertices.length; i++) {
        this._vertices[i] = this._vertices[i].add(translation);
      }
      for (var i = 1; i < this._editingHandles.length; i++) {
        this._editingHandles[i]._dot.translate(translation);
      }
      this.setDirty('model');
      this.isVisible() && this.show();
    },

    /**
     * Scales the Polygon by the given vector. This scaling can be uniform in all axis or non-uniform.
     * A scaling factor of <code>1</code> has no effect. Factors lower or higher than <code>1</code>
     * scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as big and
     * <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the Polygon by.
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
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Handles the behaviour of the Polygon when it is selected.
     * Causes the Polygon to be rendered with the selection style.
     */
    onSelect: function() {
      this._super();
      this.setStyle(Polygon.getSelectedStyle());
      this.setDirty('style');
    },

    /**
     * Handles the behaviour of the Polygon when it is deselected.
     * Causes the Polygon to be rendered with either the previously set style or
     * the <code>getDefaultStyle</code>.
     */
    onDeselect: function() {
      this._super();
      this.setStyle(this._previousStyle);
      this.setDirty('style');
    }
  }), {

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    /**
     * Defines the default style to use when rendering a polygon.
     * @type {atlas.model.Style}
     */
    getDefaultStyle: function() {
      return new Style({fillColour: Colour.GREEN});
    },

    /**
     * Defines the default style to use when rendering a selected polygon.
     * @type {atlas.model.Style}
     */
    getSelectedStyle: function() {
      return new Style({fillColour: Colour.RED});
    },

  });
  return Polygon;
});
