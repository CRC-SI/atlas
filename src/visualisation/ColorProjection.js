define([
  'atlas/material/Color',
  // Base class.
  'atlas/visualisation/AbstractProjection',
  'atlas/util/DeveloperError'
], function(Color, AbstractProjection, DeveloperError) {

  /**
   * @classdesc A ColorProjection is used to project GeoEntity parameter values
   * onto the GeoEntity's color.
   * @class atlas.visualisation.ColorProjection
   * @param {Object} args - Arguments to construct the ColorProjection
   * @param {Number} [args.opacity] - The opacity of the colors. This overrides the opacity of the
   *     colors in the codomain.
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.ColorProjection# */{

    ARTIFACT: 'color',
    DEFAULT_CODOMAIN: {startProj: Color.RED, endProj: Color.GREEN},

    _init: function(args) {
      this._super(args);
      var opacity = args.opacity;
      if (opacity !== undefined) {
        var codomain = this._configuration.codomain;
        codomain.startProj.alpha = codomain.endProj.alpha = opacity;
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Gets the codomain for the specified bin, or the first defined bin.
     * @param {Number} [binId=0] - The bin ID of the bin to retrieve.
     * @returns {Object} The bin configuration object.
     */
    getCodomain: function(binId) {
      if (!(this._configuration.codomain instanceof Array)) {
        return this._configuration.codomain;
      } else {
        if (binId) {
          return this._configuration.codomain[binId];
        } else {
          return this._configuration.codomain[0];
        }
      }
    },

    /**
     * @returns {{title: String, caption: String, legend: Object}}
     * An object literal containing the title, caption and data for the Projections legend.
     * The data property can be converted by {@link atlas.dom.Overlay} to a table.
     * @see {@link atlas.dom.Overlay#generateTable}
     */
    getLegendData: function() {
      // TODO(bpstudds): Properly invalidate this so it's not recreated every time.
      this._legend = this._super();
      if (this._type === 'discrete') {
        this._legend.key = (this._buildDiscreteLegend());
      } else {
        this._legend.key = (this._buildContinuousLegend());
      }
      return this._legend;
    },

    /**
     * Gets the legend for a discrete projection.
     * @returns {Object} As per {@link atlas.material.ColorProjection~getLegend}
     * @private
     */
    _buildDiscreteLegend: function() {
      var legend = {
        'class': 'legend',
        rows: []
      };
      var codomain = this.getCodomain();

      // TODO(bpstudds): Does forEach iterate in order?
      // With the way discrete projections currently work, there can only be one codomain
      // per projection and each bin is a discrete element of the legend.
      for (var i = 0; i < this._bins.length; i++) {
        var bin = this._bins[i];
        var regression = bin.numBins === 1 ? 0.5 : bin.binId / (bin.numBins - 1);
        // TODO(bpstudds): This won't work with a fixed projection.
        var color = codomain.startProj.interpolate(codomain.endProj, regression);
        var elements = [
          {bgColor: color, width: '1em'},
          {value: '&nbsp;&nbsp;&nbsp;' + round(bin.firstValue)},
          {value: '&nbsp;&ndash;&nbsp;'},
          {value: this._round(bin.lastValue)}
        ];
        legend.rows.unshift({cells: elements});
      }
      return legend;
    },

    /**
     * Gets the legend for a continuous projection.
     * @returns {Object} As per {@link atlas.material.ColorProjection~getLegend}
     * @private
     */
    _buildContinuousLegend: function() {
      var legend = {
        //'class': 'legend',
        rows: []
      };
      // With the way continuous projections work, there can be multiple codomains
      // per projection and each bin needs an entire legend to itself.
      // Usually, there will only be one bin per continuous projection though.
      this._bins.forEach(function(bin, i) {
        var codomain = this.getCodomain(i);
        [0, 0.25, 0.5, 0.75].forEach(function(f, i) {
          // TODO(bpstudds): This won't work with a fixed projection.
          var color1 = codomain.startProj.interpolate(codomain.endProj, f).toHexString();
          var color2 = codomain.startProj.interpolate(codomain.endProj, (f + 0.25)).toHexString();
          var lowerBound = this._round(bin.firstValue + f * bin.range);
          var upperBound = this._round(bin.firstValue + (f + 0.25) * bin.range);
          var elements = [
            {background: 'linear-gradient(to top,' + color1 + ',' + color2 + ')', width: '1em'},
            {value: '&nbsp;&nbsp;&nbsp;' + lowerBound},
            {value: '&nbsp;&ndash;&nbsp;'},
            {value: upperBound}
          ];
          // TODO(bpstudds): This won't work with more than one bin.
          legend.rows.unshift({cells: elements});
        }, this);
      }, this);
      return legend;
    },

    getCurrentState: function() {
      var state = {};
      Object.keys(this._entities).forEach(function(id) {
        state[id] = {fillMaterial: this._entities[id].getStyle().getFillMaterial()};
      }, this);
      return state;
    },

    // -------------------------------------------
    // RENDERING
    // -------------------------------------------

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to render.
     * @param {Object} attributes - The attributes of the parameter value for the given GeoEntity.
     * @private
     */
    _render: function(entity, attributes) {
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      var newColor = this._regressProjectionValueFromCodomain(attributes,
          this._configuration.codomain);
      var oldColor = entity.modifyStyle(newColor);
      entity.isVisible() && entity.show();
      this._setEffects(entity.getId(), {oldValue: oldColor, newValue: newColor});
    },

    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} params - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender: function(entity, params) {
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      var id = entity.getId();
      var oldColor = this._getEffect(id, 'oldValue');
      if (oldColor) {
        entity.modifyStyle(oldColor);
      }
    },

    /**
     * Calculates a GeoEntity's parameter value's projected value in the given codomain.
     * Here the projected value refers to the modification to the GeoEntity's style.
     * @param {Object} attributes - Attributes of the GeoEntity parameter value to project.
     * @param {Object} codomain - Details of the codomain(s).
     * @returns {Object}
     * @private
     */
    _regressProjectionValueFromCodomain: function(attributes, codomain) {
      // Check if this is a continuous or discrete projection to set the regression factor.
      // Check if the codomain has been binned and select the correct one.
      if (codomain instanceof Array) {
        codomain = codomain[attributes.binId];
      }
      // TODO(bpstudds): Allow for more projection types then continuous and discrete?
      // TODO(bpstudds): The regressionFactor for discrete isn't in [0, 1).
      var regressionFactor = this._type === 'continuous' ?
          attributes.absRatio :
              attributes.numBins === 1 ? 0.5 : attributes.binId / (attributes.numBins - 1);
      if (codomain.fixedProj) {
        return {fillMaterial: codomain.fixedProj};
      } else if (codomain.startProj && codomain.endProj) {
        var startColor = codomain.startProj;
        var endColor = codomain.endProj;
        var newColor = startColor.interpolate(endColor, regressionFactor);
        return {fillMaterial: newColor};
      }
      throw new DeveloperError('Unsupported codomain supplied.');
    }
  });
});
