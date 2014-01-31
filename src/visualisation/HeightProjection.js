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
      var regressionFactor = this._type === 'continuous' ? attributes.absRatio : attributes.binId;
      if ('fixedProj' in codomain) {
        return codomain.fixedProj;
      } else if ('startProj' in codomain && 'endProj' in codomain) {
        return codomain.startProj + regressionFactor * codomain.endProj;
      }
      throw new DeveloperError('Unsupported codomain supplied.');
    }
  });
});
