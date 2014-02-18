define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/WKT',
  './GeoEntity',
  './Vertex'
], function(DeveloperError, defaultValue, WKT, GeoEntity, Vertex) {
  /**
   * @classdesc Represents a 2D line segment.
   * @class atlas.model.Line
   * @extends atlas.model.GeoEntity
   */
  return GeoEntity.extend(/** @lends atlas.model.Line# */{

    /**
     * Counter-clockwise ordered array of vertices constructing polygon.
     * @type {Array.<atlas.model.Vertex>}
     * @private
     */
    _vertices: null,

    /**
     * @type {atlas.model.Style}
     * @private
     */
    _style: null,

    /**
     * Constructs a new {@link Line}.
     * @ignore
     */
    _init: function(id, args) {
      this._super(id, args);
      if (typeof args.vertices === 'string') {
        var wkt = WKT.getInstance(),
            vertices = wkt.verticesFromWKT(args.vertices);
        if (vertices instanceof Array) {
          this._vertices = vertices;
        } else {
          throw new Error('Invalid vertices for Line ' + id);
        }
      } else {
        this._vertices = defaultValue(args.vertices, []);
      }
    },

    /**
     * Function to enable interactive editing of the polygon.
     * @abstract
     */
    edit: function() {
      throw new DeveloperError('Can not call methods on abstract Polygon.');
    }

  });
});
