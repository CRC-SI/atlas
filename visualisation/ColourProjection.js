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
    }
  });
});

