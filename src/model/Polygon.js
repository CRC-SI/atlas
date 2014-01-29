define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/mixin',
  'atlas/util/WKT',
  './Vertex',
  './Colour',
  './Style',
  './Material',
  // Base class
  './GeoEntity'
], function (Class, DeveloperError, defaultValue, mixin, WKT, Vertex, Colour, Style, Material, GeoEntity) {
  "use strict";

  /**
   * @classdesc A Polygon represents a 2D polygon that can be rendered within an
   * Atlas scene. Polygons are constructed from a series of Vertices specified
   * in a counter-clockwise order. A {@link atlas.model.Material|Material}
   * and {@link atlas.model.Style|Style} can also be defined when
   * constructing a Polygon.
   *
   * @param {Number} id - The ID of this Polygon.
   * @param {string|Array.<atlas.model.Vertex>} [args.vertices=[]] - The vertices of the Polygon.
   * @param {Object} [args] - Option arguments describing the Polygon.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Polygon.
   * @param {Number} [args.height=0] - The extruded height of the Polygon to form a prism.
   * @param {Number} [args.elevation] - The elevation of the base of the Polygon (or prism).
   * @param {atlas.model.Style} [args.style=defaultStyle] - The Style to apply to the Polygon.
   * @param {atlas.model.Material} [args.material=defaultMaterial] - The Material to apply to the polygon.
   * @returns {atlas.model.Polygon}
   *
   * @class atlas.model.Polygon
   * @extends atlas.model.GeoEntity
   */
   //var Polygon = function (id, vertices, args) {
  var Polygon = GeoEntity.extend(/** @lends atlas.model.Polygon# */ {
    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @type {Array.<atlas.model.Vertex>}
     * @private
     */
    _vertices: null,

    /**
     * The extruded height of the polygon (if rendered as extruded polygon).
     * @private
     * @type {Number}
     */
    _height: 0,

    /**
     * The elevation of the base of the polygon (or prism).
     * @private
     * @type {Number}
     */
    _elevation: 0,

    /**
     * The visual style of the polygon.
     * @private
     * @type {atlas.model.Style}
     */
    _style: null,

    /**
     * The material used to render the polygon.
     * @type {atlas.model.Material}
     * @private
     */
    // TODO(bpstudds): Create a Polygon specific default Material to use.
    _material: null,

    /**
     * Whether the polygon is visible in the scene.
     * @type {Boolean}
     * @private
     */
    _visible: false,

    /**
     * The centroid of the polygon.
     * @type {atlas.model.Vertex}
     * @private
     */
    _centroid: null,

    /**
     * The area covered by the polygon.
     * @type {Number}
     * @private
     */
    _area: null,

    /**
     * Constructs a new Polygon
     * @ignore
     */
    _init: function (id, args) {
      args = mixin({}, args);
      // Call superclass GeoEntity constructor.
      this._super(id, args);
      if (typeof args.vertices === 'string' ) {
        this._vertices = WKT.verticesFromWKT(args.vertices)[0];
      } else {
        this._vertices = defaultValue(args.vertices, []);
      }
      this._height = parseFloat(args.height) || 0.0;
      this._elevation = parseFloat(args.elevation) || 0.0;
      this._style = defaultValue(args.style, Polygon.DEFAULT_STYLE);
      this._material = defaultValue(args.material, Material.DEFAULT);
    },

//////
// GETTERS AND SETTERS

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
            (this._vertices[j].x + this._vertices[i].x) * (this._vertices[j].y - this._vertices[i].y);
        j = i;  //j is previous vertex to i
      }
      this._area /= 2;
      return this._area;
    },

    /**
     * Gets the centroid of the Polygon. Assumes that the polygon is 2D surface, ie. Vertex.z is
     * constant across the polygon.
     * @returns {atlas.model.Vertex} The Polygon's centroid.
     * @see {@link http://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript/9939071#9939071}
     * @see  {@link http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon}
     */
    getCentroid: function() {
      if (this._centroid) {
        return this._centroid;
      }
      // Need a closed set of vertices for the algorithm to work. Temporarily add the first vertex
      // to the end of the list of vertices.
      this._vertices.push(this._vertices[0]);
      var x, y, f, twiceArea, p1, p2;
      x = y = f = twiceArea = 0;
      for (var i = 0; i < this._vertices.length - 1; i++) {
        p1 = this._vertices[i];
        p2 = this._vertices[i+1];
        f =  (p1.x * p2.y) - p2.x * p1.y;
        x += (p1.x + p2.x) * f;
        y += (p1.y + p2.y) * f;
        twiceArea += f;
      }
      // Remove vertex added to end
      this._vertices.pop();
      f = 3 * twiceArea;
      this._centroid = new Vertex(x / f, y / f, p1.z);
      return this._centroid;
    },

    /**
     * Set the elevation of the base of the polygon (or prism).
     * @param {Number} elevation - The elevation of the base of the polygon.
     */
    setElevation: function (elevation) {
      if (typeof elevation === 'number') {
        this._elevation = elevation;
        this.setRenderable(false);
      }
    },

    /**
     * @returns {Number} The elevation of the base of the polygon (or prism).
     */
    getElevation: function () {
      return this._elevation;
    },

    /**
     * Set the extruded height of the polygon to form a prism.
     * @param {Number} height The extruded height of the building.
     */
    setHeight: function (height) {
      if (typeof height === 'number') {
        this._height = height;
        this.setRenderable(false);
      }
    },

    /**
     * @returns {Number} The extrusion height of the polygon.
     */
    getHeight: function () {
      return this._height;
    },

    /**
     * Sets the Style for the Polygon.
     * @param {atlas.model.Style} style - The new style to use.
     * @returns {atlas.model.Style} The old style, or null if it was not changed.
     */
    setStyle: function(style) {
      if (!(style instanceof Style)) {
        throw new DeveloperError('Style must be a valid atlas Style object');
      } else {
        if (this._style !== style) {
          console.debug('setting style of entity', this._id, 'to', style);
          // Only change style if the new style is different so _previousStyle isn't clobbered.
          this._previousStyle = this._style;
          this._style = style;
          this.setRenderable(false);
          return this._previousStyle;
        }
      }
      return null;
    },

//////
// MODIFYING

    /**
     * Adds a vertex to the polygon end of the list of vertices describing the polygon.
     * @param {Vertex} vertex - vertex to add to the polygon.
     * @returns {Number} The index at which the vertex was added.
     */
    addVertex: function(vertex) {
      var v = this._vertices.pop();
      this._vertices.push(vertex);
      this._vertices.push(v);
      // Invalidate any pre-calculated area and centroid.
      this.setRenderable(false);
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
      this.setRenderable(false);
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
        index = this._vertices.length -1;
      }
      if (index === this._vertices.length) {
        index--;
      }
      if (0 <= index && index <= this._vertices.length - 1) {
        var removed = this._vertices.splice(index, 1)[0];
        // Maintain closed-ness
        this._vertices[this._vertices.length - 1] = this._vertices[0];
        // Clear derived values
        this.setRenderable(false);
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
    translate: function (translation) {
      for (var i = 0; i < this._vertices.length; i++) {
        this._vertices[i] = this._vertices[i].add(translation);
      }
      this.setRenderable(false);
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
      console.debug('scaling polygon', this._id, 'with scale', scale);
      var centroid = this.getCentroid();
      this._vertices.forEach(function (vertex, i) {
        var diff = vertex.subtract(centroid);
        diff = diff.componentwiseMultiply(scale);
        this._vertices[i] = diff.add(centroid);
      }, this);
      this.setRenderable(false);
      this.isVisible() && this.show();
    },

    /**
     * Rotates the Polygon by the given angle.
     * @param {atlas.model.Vertex} rotation - The angle to rotate the Polygon, negative angles
     *      rotate clockwise, positive counter-clockwise.
     */
    rotate: function (rotation) {},

//////
// BEHAVIOUR

    /**
     * Shows the Polygon.
     * @abstract
     */
    show: function () {
      throw new DeveloperError('Can not call abstract method of Polygon');
    },

    /**
     * Hides the Polygon.
     * @abstract
     */
    hide: function () {
      throw new DeveloperError('Can not call abstract method of Polygon');
    },

    /**
     * Handles the behaviour of the Polygon when it is selected.
     * Causes the Polygon to be rendered with the selection style.
     */
    onSelect: function () {
      this.setStyle(Polygon.SELECTED_STYLE);
    },

    /**
     * Handles the behaviour of the Polygon when it is deselected.
     * Causes the Polygon to be rendered with either the previously set style or
     * the <code>DEFAULT_STYLE</code>.
     */
    onDeselect: function () {
      this.setStyle(this._previousStyle || Polygon.DEFAULT_STYLE);
    }
  });

  /**
   * Defines the default style to use when rendering a polygon.
   * @type {atlas.model.Colour}
   */
  Polygon.DEFAULT_STYLE = new Style(Colour.GREEN, Colour.GREEN, 1);

  /**
   * Defines the default style to use when rendering a selected polygon.
   * @type {atlas.model.Colour}
   */
  Polygon.SELECTED_STYLE = new Style(Colour.RED, Colour.RED, 1);

  return Polygon;
});
