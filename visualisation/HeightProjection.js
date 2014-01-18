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
     * _params
     * _configuration
     */

    /**
     * Renders the effects of the Projection.
     * @param {String|Array.<String>} [id] - Render the effects of the projection on a specific GeoEntity,
     *    or list of GeoEntities, otherwise all effects are rendered.
     */
    render: function (id) {
      var ids = null;
      var allIds = Object.keys(this._entities);
      // If argument id was provided...
      if (id && id === String) { ids = [id]; }
      if (id && id === Number) { ids = id; }
      // ... use the entities it specifies instead of all the entities.
      if (!ids) { ids = allIds; }
      // Process each entity for the win.
      ids.forEach(function (id) {
        var theEntity = this._entities[id];
        var theParams = this._params[id];
        if (theEntity) {
          // Hard code the co-domain to vary from 50 to 100 depending on the ratio of the value between min/max
          // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
          var newHeight = theParams.ratioBetweenMinMax * 50 + 50;
          var oldHeight = theEntity.setHeight(newHeight);
          theEntity.showAsExtrusion();
          this._effects[id] = { 'oldValue': oldHeight, 'newValue': newHeight };
        }
      }, this);
    },

    /**
     * Unrenders the effects of the Projection.
     * @param {String|Array.<String>} [id] - Unrender the effects of the projection on a specific
     *    GeoEntity, or list of GeoEntities, otherwise all effects are unrendered.
     */
    unrender: function (id) {
      var toBeDeleted = [];
      var ids = null;
      var allIds = Object.keys(this._entities);
      // If argument id was provided...
      if (id && id === String) { ids = [id]; }
      if (id && id === Number) { ids = id; }
      // ... use the entities it specifies instead of all the entities.
      if (!ids) { ids = allIds; }
      ids.forEach(function(id) {
        var theEntity = this._entities[id];
        if (theEntity) {
          var oldHeight = this._effects[id].oldValue;
          theEntity.setHeight(oldHeight);
          toBeDeleted.push(id);
        }
      }, this);
      toBeDeleted.forEach(function (id) {
        delete this._effects[id];
      }, this);
    }
  });
});
