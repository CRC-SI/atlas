define([
  'atlas/util/DeveloperError',
  'atlas/lib/tinycolor',
  'atlas/model/Colour',
  // Base class.
  'atlas/visualisation/AbstractProjection'
], function (DeveloperError, tinycolour, Colour, AbstractProjection) {

  /**
   * @classdesc A ColourProjection is used to project GeoEntity parameter values
   * onto the GeoEntity's colour.
   * @class atlas.visualisation.ColourProjection
   * @author Brendan Studds
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.ColourProjection# */{
    ARTIFACT: 'colour',

    DEFAULT_CODOMAIN: {fixedProj: Colour.RED},

    /**
     * Returns the state before the Projection has been applied, or if the Projection has not been
     * applied, the current state of the actual render.
     * @returns {Object.<String, Object>}
     */
    getPreviousState: function () {
      // If changes have been made, superclass AbstractProjection can handle getting the previous state.
      if (Object.keys(this._effects).length > 0) { return this._super(); }
      // Other, the ColourProjection needs to return the current state of the actual render.
      var state = {};
      Object.keys(this._entities).forEach(function (id) {
        state[id] = {fillColour: this._entities[id].getStyle().getFillColour()};
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
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      console.debug('rendering id', entity.getId());
      var newColour = this._regressProjectionValueFromCodomain(attributes, this._configuration.codomain),
          oldColour = entity.modifyStyle(newColour);
      entity.show();
      this._effects[entity.getId()] = { 'oldValue': oldColour, 'newValue': newColour };
    },

    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} params - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender:function (entity, params) {
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      var id = entity.getId(),
          oldColour = this._effects[id].oldValue;
      entity.modifyStyle(oldColour);
      entity.showAsExtrusion();
      delete this._effects[id];
    },

    /**
     * Calculates a GeoEntity's parameter value's projected value in the given codomain.
     * Here the projected value refers to the modification to the GeoEntity's style.
     * @param {Object} attributes - Attributes of the GeoEntity parameter value to project.
     * @param {Object} codomain - Details of the codomain(s).
     * @returns {Object}
     * @private
     */
    _regressProjectionValueFromCodomain: function (attributes, codomain) {
      // Check if this is a continuous or discrete projection to set the regression factor.
      // Check if the codomain has been binned and select the correct one.
      if (codomain instanceof Array) {
        codomain = codomain[attributes.binId];
      }
      // TODO(bpstudds): Allow for more projection types then continuous and discrete?
      var regressionFactor = this._type === 'continuous' ?
          attributes.absRatio : attributes.binId / (attributes.numBins - 1);
      if ('fixedProj' in codomain) {
        return {fillColour: codomain.fixedProj};
      } else if ('startProj' in codomain && 'endProj' in codomain) {
        var startColour = codomain['startProj'].toHsv(),
            endColour = codomain['endProj'].toHsv(),
            diff = endColour.h - startColour.h,
            newHsv = {
              h: startColour.h + diff * regressionFactor,
              s: startColour.s,
              v: startColour.v
            };
        return {fillColour: Colour.fromHsv(newHsv)};
      }
      throw new DeveloperError('Unsupported codomain supplied.');
    }
  });
});

