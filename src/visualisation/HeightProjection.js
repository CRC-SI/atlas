define([
  'atlas/util/DeveloperError',
  // Base class
  'atlas/visualisation/AbstractProjection'
], function (DeveloperError, AbstractProjection) {

  /**
   * @classdesc The HeightProjection represents a projection of Entity parameter values onto
   * the Entity's height.
   * @author Brendan Studds
   * @class atlas.visualisation.HeightProjection
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.HeightProjection.prototype */ {
    ARTIFACT: 'height',

    DEFAULT_CODOMAIN: {startProj: 50, endProj: 100},

    /**
     * Returns the state before the Projection has been applied, or if the Projection has not been
     * applied, the current state of the actual render.
     * @returns {Object.<String, Object>}
     */
    getPreviousState: function () {
      // If changes have been made, superclass AbstractProjection can handle getting the previous state.
      if (Object.keys(this._effects).length > 0) { return this._super(); }
      // Other, the HeightProjection needs to return the current state of the actual render.
      var state = {};
      Object.keys(this._entities).forEach(function (id) {
        state[id] = this._entities[id].getHeight();
      }, this);
      return state;
    },

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to render.
     * @param {Object} attributes - The attributes of the parameter value for the given GeoEntity.
     * @private
     */
    _render: function (entity, attributes) {
      // Hard code the co-domain to vary from 50 to 100 depending on the ratio of the value between min/max
      var newHeight = this._regressProjectionValueFromCodomain(attributes, this._configuration.codomain),
          oldHeight = entity.setHeight(newHeight);
      entity.showAsExtrusion();
      this._effects[entity._id] = { 'oldValue': oldHeight, 'newValue': newHeight };
    },


    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} attributes - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender: function (entity, attributes) {
      var id = entity._id;
      var oldHeight = this._effects[id].oldValue;
      entity.setHeight(oldHeight);
      delete this._effects[id];
    },

    _regressProjectionValueFromCodomain: function (attributes, codomain) {
      // Check if this is a continuous or discrete projection to set the regression factor.
      // Check if the codomain has been binned and select the correct one.
      if (codomain instanceof Array) {
        codomain = codomain[attributes.binId];
      }
      // TODO(bpstudds): Allow for more projection types then continuous and discrete?
      var regressionFactor = this._type === 'continuous' ?
          attributes.absRatio : attributes.binId / attributes.numBins;
      if ('fixedProj' in codomain) {
        return codomain.fixedProj;
      } else if ('startProj' in codomain && 'endProj' in codomain) {
        return codomain.startProj + regressionFactor * codomain.endProj;
      }
      throw new DeveloperError('Unsupported codomain supplied.');
    }
  });
});
