define([
  'atlas/model/GeoEntity',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter'
], function (GeoEntity, Log, Setter) {
  /**
   * @typedef atlas.model.LineNetwork
   * @ignore
   */
  var LineNetwork;

  /**
   * @classdesc A LineNetwork represents a 2D graph of lines.
   * @class atlas.model.LineNetwork
   * @extends atlas.model.GeoEntity
   */
  LineNetwork = GeoEntity.extend({
    /**
     * This is an array of objects containing the data required to construct and render the lines
     * making up the LineNetwork. The geometry of the line is determined by
     * <code>lineData.vertexIds</code>. The <code>vertexId</code> refers to the index of the
     * GeoPoints constructing the line in <code>vertexData</code>.
     * @type {Array.<atlas.model.LineNetwork#LineData>}
     * @private
     */
    _lineData: null,

    /**
     * This is an array of all the vertices that are present in the LineNetwork.
     * @type {Array.<atlas.model.GeoPoint>}
     * @private
     */
    _vertexData: null,

    _init: function (args) {
      this._super(args);

      args = Setter.mixin({
        vertexData: [],
        lineData: []
      }, args);

      this._vertexData = args.vertexData;
      this._lineData = args.lineData;
    },

    // -------------------------------------------
    // Getters and Setters
    // -------------------------------------------
    getLines: function () {
      return this._lineData;
    },

    getVertices: function () {
      return this._vertexData;
    }
  });

  return LineNetwork;
});
