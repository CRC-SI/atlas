define([
  'atlas/lib/utility/Setter',
  'atlas/model/Colour',
  'atlas/model/Material',
  'atlas/model/Style',
  'atlas/model/Vertex',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/WKT',
  // Base class
  'atlas/model/GeoEntity'
], function(Setter, Colour, Material, Style, Vertex, DeveloperError, defaultValue, WKT, GeoEntity) {

  /**
   * @typedef atlas.model.Image
   * @ignore
   */
  var Image;

  /**
   * @classdesc Represents a 2D image that can be rendered within an
   * Atlas scene. Images are constructed from a series of Vertices specified
   * in a counter-clockwise order. A {@link atlas.model.Material|Material}
   * and {@link atlas.model.Style|Style} can also be defined when
   * constructing a Image.
   *
   * @param {Number} id - The ID of this Image.
   * @param {Object} imageData - Data describing the Image.
   * @param {string|Array.<atlas.model.Vertex>} [imageData.vertices=[]] - The vertices of the Image.
   * @param {Number} [imageData.height=0] - The extruded height of the Image to form a prism.
   * @param {Number} [imageData.elevation] - The elevation of the base of the Image (or prism).
   * @param {atlas.model.Colour} [imageData.color] - The fill colour of the Image (overridden/overrides Style)
   * @param {atlas.model.Style} [imageData.style=defaultStyle] - The Style to apply to the Image.
   * @param {atlas.model.Material} [imageData.material=defaultMaterial] - The Material to apply to the image.
   * @param {Object} [args] - Option arguments describing the Image.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Image.
   * @returns {atlas.model.Image}
   *
   * @class atlas.model.Image
   * @extends atlas.model.GeoEntity
   */
  Image = GeoEntity.extend(/** @lends atlas.model.Image# */ {
    // TODO(aramk) Either put docs on params and document the getters and setters which don't have
    // obvious usage/logic.
    // TODO(aramk) Units for height etc. are open to interpretation - define them as metres in docs.
    /**
     * The image base 64 data.
     * @type {String}
     * @private
     */
    _image: null,

    /**
     * Counter-clockwise ordered array of vertices constructing image.
     * @type {Array.<atlas.model.Vertex>}
     * @private
     */
    _vertices: null,

    /**
     * The elevation of the base of the image (or prism).
     * @type {Number}
     * @private
     */
    _elevation: 0,

    /**
     * The z-axis order as an integer in the range [0, Infinity]. Images with higher zIndex will
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
     * The visual style of the image.
     * @type {atlas.model.Style}
     * @private
     */
    _style: null,

    /**
     * The material used to render the image.
     * @type {atlas.model.Material}
     * @private
     */
    _material: null,

    /**
     * Whether the image is visible in the scene.
     * @type {Boolean}
     * @private
     */
    _visible: false,

    /**
     * The centroid of the image.
     * @type {atlas.model.Vertex}
     * @private
     */
    _centroid: null,

    /**
     * The area covered by the image.
     * @type {Number}
     * @private
     */
    _area: null,

    /**
     * Whether the Image should be rendered as an extruded image or a 2D image.
     * @type {Boolean}
     * @protected
     */
    _showAsExtrusion: false,

    /**
     * Constructs a new Image
     * @ignore
     */
    _init: function(id, imageData, args) {
      args = Setter.mixin({}, args);
      this._super(id, args);
      if (typeof imageData.vertices === 'string') {
        // TODO(aramk) Add support for MULTIPOLYGON by not taking the first item.
        var wkt = WKT.getInstance(),
          vertices = wkt.verticesFromWKT(imageData.vertices);
        if (vertices[0] instanceof Array) {
          this._vertices = vertices[0];
        } else {
          throw new Error('Invalid vertices for Image ' + id);
        }
      } else {
        this._vertices = defaultValue(imageData.vertices, []);
      }
      // Don't have closed images.
      if (this._vertices.first === this._vertices.last) {
        this._vertices.pop();
      }
      if (imageData.image) {
        this._image = imageData.image;
      }
      this._elevation = parseFloat(imageData.elevation) || this._elevation;
      this._zIndex = parseFloat(imageData.zIndex) || this._zIndex;
      this._zIndexOffset = parseFloat(imageData.zIndexOffset) || this._zIndexOffset;
      this._material = (imageData.material || Material.DEFAULT);
      if (imageData.color) {
        if (imageData.color instanceof Colour) {
          this._style = new Style({fillColour: imageData.color});
        } else {
          this._style = new Style({fillColour: Colour.fromRGBA(imageData.color)});
        }
      } else if (imageData.style) {
        this._style = imageData.style;
      } else {
        this._style = Image.getDefaultStyle();
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Gets the area of the Image, in <tt>unit**2</tt> where <tt>unit</tt> is the
     * unit corresponding to the Vertices describing this Image.
     * @see {@link http://www.mathopenref.com/coordimagearea2.html}
     * @returns {Number} The area of the image.
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
     * Gets the centroid of the Image. Assumes that the image is 2D surface, ie. Vertex.z is
     * constant across the image.
     * @returns {atlas.model.Vertex} The Image's centroid.
     * @see {@link http://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-image-in-javascript/9939071#9939071}
     * @see  {@link http://en.wikipedia.org/wiki/Centroid#Centroid_of_image}
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
     * Set the elevation of the base of the image (or prism).
     * @param {Number} elevation - The elevation of the base of the image.
     */
    setElevation: function(elevation) {
      if (typeof elevation === 'number' && this._elevation !== elevation) {
        this._elevation = elevation;
        this.setDirty('vertices');
      }
    },

    /**
     * @returns {Number} The elevation of the base of the image (or prism).
     */
    getElevation: function() {
      return this._elevation;
    },

    /**
     * Sets the z-axis order. Images with higher zIndex will appear on top.
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

    // TODO(aramk) Can we move the vertices into a subclass which Image and Line can both use?

    /**
     * Adds a vertex to the image end of the list of vertices describing the image.
     * @param {Vertex} vertex - vertex to add to the image.
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
     * Inserts a vertex at particular index of the image. If the index is larger
     * than the number of vertices in the image, it is appended to the
     * images vertices as per {@link atlas.model.Image#addVertex|addVertex}.
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
     * Removes a vertex from the Image.
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
     * Function to enable interactive editing of the image.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Image.');
    },

    /**
     * Translates the Image.
     * @param {atlas.model.Vertex} translation - The vector from the Image's current location to the desired location.
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
     * Scales the Image by the given vector. This scaling can be uniform in all axis or non-uniform.
     * A scaling factor of <code>1</code> has no effect. Factors lower or higher than <code>1</code>
     * scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as big and
     * <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the Image by.
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
     * Handles the behaviour of the Image when it is selected.
     * Causes the Image to be rendered with the selection style.
     */
    onSelect: function() {
      this.setStyle(Image.getSelectedStyle());
      this.setDirty('style');
    },

    /**
     * Handles the behaviour of the Image when it is deselected.
     * Causes the Image to be rendered with either the previously set style or
     * the <code>getDefaultStyle</code>.
     */
    onDeselect: function() {
      this.setStyle(this._previousStyle || Image.getDefaultStyle());
      this.setDirty('style');
    }
  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  /**
   * Defines the default style to use when rendering a image.
   * @type {atlas.model.Style}
   */
  Image.getDefaultStyle = function () {return new Style({fillColour: Colour.GREEN}); };

  /**
   * Defines the default style to use when rendering a selected image.
   * @type {atlas.model.Style}
   */
  Image.getSelectedStyle = function () { return new Style({fillColour: Colour.RED}); };

  return Image;
});
