define([
  // Base class
  'atlas/visualisation/AbstractProjection'
], function (AbstractProjection) {

  /**
   * @classdesc The HeightProjection represents a projection of Entity parameter values onto
   * the Entity's height.
   * @author Brendan Studds
   * @class atlas.visualisation.HeightProjection
   * @extends atlas.visualisation.AbstractProjection
   */
  return AbstractProjection.extend(/** @lends atlas.visualisation.HeightProjection.prototype */ {
    ARTIFACT: 'height',

    /*
     * Inherited from atlas/visualisation/AbstractVisualisation
     * _type
     * _values
     * _effects
     * _stats
     * _attributes
     * _configuration
     */

    /**
     * Renders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to render.
     * @param {Object} params - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _render: function (entity, params) {
      // Hard code the co-domain to vary from 50 to 100 depending on the ratio of the value between min/max
      // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
      var newHeight = params.absRatio * 50 + 50,
          oldHeight = entity.setHeight(newHeight);
      entity.showAsExtrusion();
      this._effects[entity._id] = { 'oldValue': oldHeight, 'newValue': newHeight };
    },


    /**
     * Unrenders the effects of the Projection on a single GeoEntity.
     * @param {atlas.model.GeoEntity} entity - The GeoEntity to unrender.
     * @param {Object} params - The parameters of the Projection for the given GeoEntity.
     * @private
     */
    _unrender: function (entity, params) {
      var id = entity._id;
      var oldHeight = this._effects[id].oldValue;
      entity.setHeight(oldHeight);
      delete this._effects[id];
    }
  });
});
