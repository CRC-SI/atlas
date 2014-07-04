define([
  'atlas/model/GeoEntity',
  'atlas/model/Line',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter'
], function (GeoEntity, Line, Log, Setter) {
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
     * @typedef atlas.model.LineNetwork#LineData
     * @property {String} [id] - The ID of the Line. A unique ID will be assigned.
     * @property {vertexIds} - The IDs into the <code>vertexData</code> array of the vertices
     *     constructing the line.
     */

    /**
     * The array of Line objects constructing the LineNetwork.
     * @type {Array.<atlas.model.Line>}
     * @private
     */
    _lines: null,

    /**
     * The default width of each line in the network if one is not explicitly set for it.
     * @type {number|string}
     * @private
     */
    _lineDefaultWidth: '3px',

    /**
     * This is an array of all the vertices that are present in the LineNetwork.
     * @type {Array.<atlas.model.GeoPoint>}
     * @private
     */
    _vertexData: null,

    /**
     * The next unique ID used for a Line.
     * @type {number}
     * @private
     */
    _nextLineId: 100000,

    _init: function (id, networkData, args) {
      this._super(id, args);

      networkData = Setter.mixin({
        vertexData: [],
        lineData: []
      }, networkData);

      this._vertexData = networkData.vertexData;
      this._lineData = networkData.lineData.map(function (data) {
        data.id = this._getNextLineId();
        return data;
      }, this);
      this._lineDefaultWidth = networkData.lineWidth || this._lineDefaultWidth;

      // Construct the line network
      this.constructNetwork();
    },

    // -------------------------------------------
    // Getters and Setters
    // -------------------------------------------
    getDefaultLineWidth: function () {
      return this._lineDefaultWidth;
    },

    getLineData: function () {
      return this._lineData;
    },

    getVertexData: function () {
      return this._vertexData;
    },

    /**
     * @returns {atlas.model.Line} A Line in the network based on it's index in the network.
     * @param {number} i - The index of the Line.
     */
    getLine: function (i) {
      return this._lines[i];
    },

    getLines: function () {
      return this._lines;
    },

    _getNextLineId: function () {
      return this._nextLineId++;
    },

    // -------------------------------------------
    // Line Management
    // -------------------------------------------

    /**
     * @returns {boolean} Whether the LineNetwork has been constructed.
     */
    isConstructed: function () {
      // TODO(bpstudds): Should this account for modified lines?
      return this._lines && this._lines.length && this._lines.length > 0;
    },

    /**
     * Constructs a new Line object. This should be overridden in any Atlas implementations to
     * construct a renderable Line object.
     * @param args Parameters as per @link{atlas.model.Line}
     * @private
     */
    _createLine: function (id, lineData, args) {
      return new Line(id, lineData, args);
    },

    /**
     * Constructs all of the lines making up the LineNetwork
     */
    constructNetwork: function () {
      var vertices = this.getVertexData(),
          renderManager = this._renderManager,
          createLine = this._createLine,
          defaultLineWidth = this.getDefaultLineWidth(),
          networkId = this.getId();

      // Die if the network is already constructed.
      if (this.isConstructed()) {
        // TODO(bpstudds): Be able to update/edit a LineNetwork
        Log.warn('Tried to construct existing line network, use update instead.');
        return;
      }

      // Construct the Line objects.
      this._lines = this._lineData.map(function(lineData) {
        // Retrieve the GeoPoints constructing the line.
        var lineGeoPoints = lineData.vertexIds.map(function(id) {
              return vertices[id];
            }),
            width = lineData.width || defaultLineWidth,
            color = lineData.color,
            style = lineData.style;

        // Construct the line object.
        return createLine(
            networkId + '_line' + lineData.id,
            {vertices: lineGeoPoints, width: width, color: color, style: style},
            {renderManager: renderManager});
      });
    },

    // -------------------------------------------
    // Rendering
    // -------------------------------------------
    /**
     * Shows the line network.
     */
    show: function () {
      this._lines.forEach(function (line) {
        line.show();
      });
    },

    hide: function () {
      this._lines.forEach(function (line) {
        line.hide();
      });
    }
  });

  return LineNetwork;
});
