define([
  'atlas/util/Extends',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/WKT',
  './Vertex',
  './Colour',
  './Style',
  './Material',
  // Base class
  './GeoEntity'
], function (extend, DeveloperError, defaultValue, WKT, Vertex, Colour, Style, Material, GeoEntity) {
  "use strict";

  /**
   * Constructs a new Polygon object.
   * @class  A Polygon represents a 2D polygon that can be rendered within an
   * Atlas scene. Polygons are constructed from a series of Vertices specified
   * in a counter-clockwise order. A {@link atlas/model/Material|Material}
   * and {@link atlas/model/Style|Style} can also be defined when
   * constructing a Polygon.
   *
   * @param {Number} id - The ID of this Polygon.
   * @param {string|Array.<atlas/model/Vertex>} [vertices=[]] - The vertices of the Polygon.
   * @param {Object} [args] - Option arguments describing the Polygon.
   * @param {atlas/model/GeoEntity} [args.parent=null] - The parent entity of the Polygon.
   * @param {Number} [args.height=0] - The extruded height of the Polygon to form a prism.
   * @param {Number} [args.elevation] - The elevation of the base of the Polygon (or prism).
   * @param {atlas/model/Style} [args.style=defaultStyle] - The Style to apply to the Polygon.
   * @param {atlas/model/Material} [args.material=defeaultMaterial] - The Material to apply to the polygon.
   * @returns {atlas/model/Polygon}
   *
   * @extends {atlas/model/GeoEntity}
   * @alias atlas/model/Polygon
   * @constructor
   */
   var Polygon = function(id, vertices, args) {
    args = defaultValue(args, {});
    Polygon.base.constructor.call(this, id, args);

    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @private
     * @type {Array.<atlas/model/Vertex>}
     */
    if (typeof vertices === 'string' ) {
      this._vertices = WKT.wktToVertices(vertices)[0];
    } else {
      this._vertices = defaultValue(vertices, []);
    }

    /**
     * The extruded height of the polygon (if rendered as extruded polygon).
     * @private
     * @type {Number}
     */
    this._height = defaultValue(args.height, 0.0);

    /**
     * The elevation of the base of the polygon (or prism).
     * @private
     * @type {Number}
     */
    this._elevation = defaultValue(args.elevation, 0.0);

    /**
     * The visual style of the polygon.
     * @private
     * @type {atlas/model/Style}
     */
    this._style = defaultValue(args.style, Polygon.DEFAULT_STYLE);

    /**
     * The material used to render the polygon.
     * @private
     * @type {atlas/model/Material}
     */
    // TODO(bpstudds): Create a Polygon specific default Material to use.
    this._material = defaultValue(args.material, Material.DEFAULT);

    /**
     * Whether the polygon is visible in the scene.
     * @private
     * @type {Boolean}
     */
    this._visible = false;

    /**
     * The centroid of the polygon.
     * @private
     * @type {Number}
     */
    this._centroid = null;

    /**
     * The area covered by the polygon.
     * @private
     * @type {Number}
     */
    this._area = null;
  };
  // Inherit from GeoEntity
  extend(GeoEntity, Polygon);


  /**
   * Defines the default style to use when rendering a polygon.
   * @type {atlas/model/Colour}
   */
  Polygon.DEFAULT_STYLE = new Style(Colour.GREEN, Colour.GREEN, 1);


  /**
   * Defines the default style to use when rendering a selected polygon.
   * @type {atlas/model/Colour}
   */
  Polygon.SELECTED_STYLE = new Style(Colour.RED, Colour.RED, 1);

  /**
   * Adds a vertex to the polygon end of the list of vertices describing the polygon.
   * @param {Vertex} vertex - vertex to add to the polygon.
   * @return {Number} The index at which the vertex was added.
   */
  Polygon.prototype.addVertex = function(vertex) {
    var v = this._vertices.pop();
    this._vertices.push(vertex);
    this._vertices.push(v);
    // Invalidate any pre-calculated area and centroid.
    this.setRenderable(false);
    this._area = null;
    this._centroid = null;
    return this._vertices.length;
  };

  /**
   * Inserts a vertex at particular index of the polygon. If the index is larger
   * than the number of vertices in the polygon, it is appended to the
   * polygons vertices as per {@link atlas/model/Polygon#addVertex|addVertex}.
   * The last element of _vertices is reserved for a duplicate of the first vertex.
   * @param {number} index - The index to insert at.
   * @param {Vertex} vertex - The vertex to be added. '-1' to insert at the end
   * @return {Number} The index at which vertex was inserted.
   */
  Polygon.prototype.insertVertex = function(index, vertex) {
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
  };

  /**
   * Removes a vertex from the Polygon.
   * @param {Number} index - The index of the vertex to remove. '-1' for the last vertex.
   * @return {Vertex} The vertex removed.
   */
  Polygon.prototype.removeVertex = function(index) {
    if (index === -1) {
      index = this._vertices.lenght -1;
    }
    if (index === this._vertices.length) {
      index--;
    }
    if (0 <= index && index <= this._vertices.length - 1) {
      var removed = this._vertices.splice(index, 1);
      // Maintain closed-ness
      this._vertices[this._vertices.length - 1] = this._vertices[0];
      // Clear derived values
      this.setRenderable(false);
      this._area = null;
      this._centroid = null;
      return removed;
    }
    return [];
  };

  /**
   * Set the extruded height of the polygon to form a prism.
   * @param {Number} height The extruded height of the building.
   */
  Polygon.prototype.setHeight = function (height) {
    if (typeof height === 'number') {
      this._height = height;
      this.setRenderable(false);
    }
  };

  /**
   * Set the elevation of the base of the polygon (or prism).
   * @param {Number} height The elevation of the base of the polygon.
   */
  Polygon.prototype.setElevation = function (elevation) {
    if (typeof elevation === 'number') {
      this._elevation = elevation;
      this.setRenderable(false);
    }
  };
  
  Polygon.prototype.setStyle = function (style) {
    if (!(style instanceof Style)) {
      throw new DeveloperError('Style must be a valid atlas Style object');
    } else {
      if (this._style !== style) {
        // Only change style if the new style is different so _previousStyle isn't clobbered.
        this._previousStyle = this._style;
        this._style = style;
        this.setRenderable(false);
      }
    }
  }

  /**
   * Function to enable interactive editing of the polygon.
   * @abstract
   */
  Polygon.prototype.edit = function() {
    throw new DeveloperError('Can not call methods on abstract Polygon.');
  };

  /**
   * Function to permanently remove the polygon from the scene
   * (vs. hiding it).
   * @abstract
   */
  Polygon.prototype.remove = function() {};

  /**
   * Gets the area of the Polygon, in <tt>unit**2</tt> where <tt>unit</tt> is the
   * unit corresponding to the Vertices describing this Polygon.
   * @see {@link http://www.mathopenref.com/coordpolygonarea2.html}
   * @return {Number} The area of the polygon.
   */
  Polygon.prototype.getArea = function() {
    if (this._area) {
      return this._area;
    }
    this._area = 0;
    var j = this._vertices.length - 1;  // The last vertex is the 'previous' one to the first
    for (var i = 0; i < numPoints; i++) {
      this._area = this._area +
          (this._vertices[j].x + this._vertices[i].x) * (this._vertices[j].y - this._vertices[i].y);
      j = i;  //j is previous vertex to i
    }
    this._area /= 2;
    return this._area;
  };

  /**
   * Gets the centroid of the Polygon. Assumes that the polygon is 2D surface, ie. Vertex.z is
   * constant across the polygon.
   * @return {Vertex} The Polygon's centroid.
   * @see {@link http://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript/9939071#9939071}
   * @see  {@link http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon}
   */
  Polygon.prototype.getCentroid = function() {
    if (this._centroid) {
      return this._centroid;
    }
    // Need a closed set of vertices for the algorithm to work. Temporarily add the first vertex
    // to the end of the list of vertices.
    this._vertices.push(this._vertices[0]);
    var x, y, f, twiceArea;
    x = y = f = twiceArea = 0;
    for (var i = 0; i < this._vertices.length - 1; i++) {
      var p1 = this._vertices[i];
      var p2 = this._vertices[i+1];
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
  };

  /**
   * Shows the Polygon.
   * @abstract
   */
  Polygon.prototype.show = function () {
    throw new DeveloperError('Can not call abstract method of Polygon');
  };

  /**
   * Hides the Polygon.
   * @abstract
   */
  Polygon.prototype.hide = function () {
    throw new DeveloperError('Can not call abstract method of Polygon');
  };
  
  /**
   * Handles the behaviour of the Polygon when it is selected.
   * Causes the Polygon to be rendered with the selection style.
   */
  Polygon.prototype.onSelect = function () {
    this.setStyle(Polygon.SELECTED_STYLE);
    this.show();
  };
  
  /**
   * Handles the behaviour of the Polygon when it is deselected.
   * Causes the Polygon to be rendered with either the previously set style or
   * the DEFAULT_STYLE.
   */
  Polygon.prototype.onDeselect = function () {;
    if (this._previousStyle) {
      this.setStyle(this._previousStyle);
    } else {
      this.setStyle(Polygon.DEFAULT_STYLE);
    }
    this.show();
  }
  
  return Polygon;
});
