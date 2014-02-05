define([
  'atlas/model/Colour',
  // Base class.
  'atlas/visualisation/AbstractProjection'
], function (Colour, AbstractProjection) {

  /**
   * @classdesc A ColourProjection is used to project GeoEntity parameter values
   * onto the GeoEntity's colour.
   * @class atlas.visualisation.ColourProjection
   * @author Brendan Studds
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.ColourProjection# */{
    ARTIFACT: 'colour',

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to render.
     * @param {Object} params - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _render: function (entity, params) {
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      var newColour = {fill: Colour.RED};
      var oldColour = entity.modifyStyle(newColour);
      entity.showAsExtrusion();
      this._effects[entity._id] = { 'oldValue': oldColour, 'newValue': newColour };
    },

    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} params - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender:function (entity, params) {
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      var id = entity._id,
          oldColour = this._effects[id].oldValue;
      entity.modifyStyle(oldColour);
      entity.showAsExtrusion();
      delete this._effects[id];
    },

    /**
     * Calculates a GeoEntity's parameter value's projected value in the given codomain.
     * Here the projected value refers to the modification to the GeoEntity's style.
     * @param {Object} attributes - The parameter value's attributes.
     * @param {Object} codomain - The codomain applicable to the parameter value.
     * @returns {Object} The modification to be made GeoEntity's style.
     * @private
     */
    _regressProjectionValueFromCodomain: function(attributes, codomain) {

    }
  });
});

