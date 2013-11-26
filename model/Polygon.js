define([
  'atlas/lib/extends',
  './GeoEntity',
  './Vertex',
  './Line',
  './Style',
  './Material'
], function (extend, GeoEntity, Vertex, Line, Style, Material) {

  /**
   * Constructs a new Polygon object. A Polygon represents a 2d polygon that can be
   * rendered within a Atlas scene. Polygons are constructed from a series of Vertices
   * specified in a clockwise order. A {@link Material} and {@link Style} can also be
   * defined when constructing a Polygon.
   * 
   * @param {Number}    [id] The ID of this Polygon.
   * @param {GeoEntity} [parent=null] [description]
   * @param {Vertex[]}  [vertices=[]] The vertices of the Polygon.
   * @param {Number}    [height=0] The extruded height of the Polygon to form a prism.
   * @param {Number}    [elevation] The elevation of the base of the Polygon (or prism).
   * @param {Style}     [style=defaultStyle] The Style to apply to the Polygon.
   * @param {Material}  [material=defeaultMaterial] The Material to apply to the polygon.
   *
   * @extends {GeoEntity}
   * @alias atlas/model/Polygon 
   * @constructor
   */
  var Polygon = function(/*Number*/ id, /*GeoEntity*/ parent, /*Vertex[]*/ vertices, /*Number*/ height, /*Number*/ elevation, /*Style*/ style, /*Material*/ material) {
    Polygon.base.constructor.call(this, id, parent);

    /**
     * Ordered array of vertices constructing polygon.
     * @type {Vertex[]}
     */
    this.vertices = (vertices || []);

    /**
     * The extruded height of the polygon.
     * @type {Number}
     */
    this.height = (height || 0.0);

    /**
     * The elevation of the base of the polygon (or prism).
     * @type {Number}
     */
    this.elevation = (elevation || 0.0);

    /**
     * The visual style of the polygon.
     * @type {Style}
     */
    this.style = (style || new Style());

    /**
     * The material used to render the polygon.
     * @type {Material}
     */
    this.material = (material || new Material());

    /**
     * Whether the Polygon is visible in the scene.
     * @type {Boolean}
     */
    this.visible = false;

    /**
     * The centroid of the polygon.
     * @type {number}
     */
    this.centroid = null;

    /**
     * The area covered by the polygon.
     * @type {number}
     */
    this.area = null;
  };
  // Inherit from GeoEntity
  extend(GeoEntity, Polygon);

  /**
   * Add a vertex to the polygon.
   * @param {Vertex} vertex - vertex to add to the polygon.
   * @return {number} The index at which the vertex was added.
   */
  Polygon.prototype.addVertex = function(/*Vertex*/ vertex) {
    this.vertices.push(vertex);
    return this.vertices.length;
  };

  /**
   * Inserts a vertex at particular index of the polygon. If the index is larger than the number
   * of vertices in the polygon, it is appended to the polygons vertices.
   * @param  {number} index  The index to insert at.
   * @param  {Vertex} vertex The vertex to be added.
   * @return {number}        The index at which vertex was inserted.
   */
  Polygon.prototype.insertVertex = function(/*int*/ index, /*Vertex*/ vertex) {
    var insertAt = index > vertices.length ? vertices.length : index;
    this.vertices.splice(insertAt, 0, vertex);
    return insertAt;
  };

  /**
   * Removes vertex from the polygon.
   * @param  {number} index The index of the vertex to remove.
   * @return {Vertex} The vertex removed.
   */
  Polygon.prototype.removeVertex = function(/*int*/ index) {
    this.area = null;
    return this.vertices.splice(index, 1);
  };

  /**
   * Set the extruded height of the polygon to form a prism.
   * @param {Number} height The extruded height of the building.
   */
  Polygon.prototype.setHeight = function (/*Number*/ height) {
    this.height = height;
  };

  /**
   * Set the elevation of the base of the polygon (or prism).
   * @param {Number} height The elevation of the base of the polygon.
   */
  Polygon.prototype.setElevation = function (/*Number*/ elevation) {
    this.elevation = elevation;
  };

  /**
   * Function to enable interactive editing of the polygon.
   * @abstract
   */
  Polygon.prototype.edit = function() {
    throw new DeveloperError('Can not call methods on abstract Polygon.');
  };

  /**
   * Function to remove the polygon from the scene (vs. hiding it).
   * @abstract
   */
  Polygon.prototype.remove = function() {
    throw new DeveloperError('Can not call methods on abstract Polygon.');
  };

  /**
   * Gets the area of the Polygon, in <tt>unit**2</tt> where <tt>unit</tt> is the
   * unit corresponding to the Vertices describing this Polygon.
   * @see {@link http://www.mathopenref.com/coordpolygonarea2.html}
   * @return {number} The area of the polygon.
   */
  Polygon.prototype.getArea = function() {
    if (this.area) {
      return this.area;
    }
    this.area = 0;
    j = this.vertices.length - 1;  // The last vertex is the 'previous' one to the first
    for (i = 0; i < numPoints; i++) {
      this.area = this.area +
          (this.vertices[j].x + this.vertices[i].x) * (this.vertices[j].y - this.vertices[i].y);
      j = i;  //j is previous vertex to i
    }
    this.area /= 2;
    return this.area;
  };

  /**
   * Gets the centroid of the Polygon. Assumes that the polygon is 2d surface, ie. Vertex.z is 
   * constant across the polygon.
   * @return {Vertex} The Polygon's centroid.
   * @see {@link http://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript/9939071#9939071}
   * @see  {@link http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon}
   */
  Polygon.prototype.getCentroid = function() {
    if (this.centroid) {
      return this.centroid;
    }
    // Need a closed set of vertices for the algorithm to work. Temporarily add the first vertex
    // to the end of the list of vertices.
    this.vertices.push(this.vertices[0]);
    var x, y, f, twiceArea;
    x = y = f = twiceArea = 0;
    for (var i = 0; i < this.vertices.length - 1; i++) {
      p1 = this.vertices[i];
      p2 = this.vertices[i+1];
      f =  (p1.x * p2.y) - p2.x * p1.y;
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
      twiceArea += f;
    }
    // Remove vertex added to end
    this.vertices.pop();
    f = 3 * twiceArea;
    this.centroid = new Vertex(x / f, y / f, p1.z);
    return this.centroid;
  };

  return Polygon;
});
