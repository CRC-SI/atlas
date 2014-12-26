define([
  'atlas/lib/utility/Setter',
  'atlas/material/Color',
  'atlas/model/Style',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError',
  'atlas/util/WKT',
  // Base class
  'atlas/model/VertexedEntity'
], function(Setter, Colour, Style, GeoPoint, DeveloperError, WKT, VertexedEntity) {

  /**
   * @typedef atlas.model.Image
   * @ignore
   */
  var Image;

  /**
   * @classdesc Represents a 2D image.
   *
   * @param {Number} id - The ID of this Image.
   * @param {Object} imageData - Data describing the Image.
   * @param {string|Array.<atlas.model.GeoPoint>} [imageData.vertices=[]] - The vertices of the Image.
   * @param {Number} [imageData.height=0] - The extruded height of the Image to form a prism.
   * @param {Number} [imageData.elevation] - The elevation of the base of the Image (or prism).
   * @param {atlas.material.Color} [imageData.color] - The fill colour of the Image (overridden/overrides Style)
   * @param {atlas.model.Style} [imageData.style=defaultStyle] - The Style to apply to the Image.
   * @param {Object} [args] - Option arguments describing the Image.
   * @param {atlas.model.GeoEntity} [args.parent=null] - The parent entity of the Image.
   * @returns {atlas.model.Image}
   *
   * @class atlas.model.Image
   * @extends atlas.model.VertexedEntity
   */
  Image = VertexedEntity.extend(/** @lends atlas.model.Image# */ {
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
     * Whether the Image should be rendered as an extruded image or a 2D image.
     * @type {Boolean}
     * @protected
     */
    _showAsExtrusion: false,

    /**
     * Constructs a new Image
     * @ignore
     */
    _setup: function(id, imageData, args) {
      args = args || {};
      this._super(id, imageData, args);
      // Don't have closed images.
      if (this._vertices.first === this._vertices.last) {
        this._vertices.pop();
      }
      if (imageData.image) {
        this._image = imageData.image;
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Function to enable interactive editing of the image.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Image.');
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Handles the update of the image when it is selected.
     * @private
     */
    _onSelect: function() {
      this._selected = true;
      this.setStyle(Style.getDefaultSelected());
    }

  });

  return Image;
});
