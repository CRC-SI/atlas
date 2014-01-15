define([
  // Base class
  'atlas/visualisation/AbstractProjection'
], function (AbstractProjection) {

  /**
   * Constructs a new HeightProjection object.
   * @classDesc The HeightProjection represents a projection of Entity parameter values onto
   * the Entity's height.
   * @author Brendan Studds
   * @class atlas.visualisation.HeightProjection
   * @extends atlas.visualisation.AbstractProjection
   */
  var HeightProjection = AbstractProjection.extend(/** @lends atlas.visualisation.HeightProjection.prototype */ {
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

    _init: function (args) {
      this._super(args);
    },


    /**
     * Renders the effects of the Projection.
     */
    render: function () {
      var ids = Object.keys(this._params);
      ids.forEach(function (id) {
        var theEntity = this._entities[id];
        var theParams = this._params[id];
        if (theEntity) {
          // Hard code the co-domain to vary from 50 to 100 depending on the ratio of the value between min/max
          // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
          var newHeight = theParams.ratioBetweenMinMax * 50 + 50;
          var oldHeight = theEntity.setHeight(newHeight);
          this._effects[id] = { 'oldValue': oldHeight, 'newValue': newHeight };
        }
      }, this);
    },

    /**
     * Unrenders the effects of the Projection.
     * @param {String} [id] - Unrender the effects of the projection on a specific GeoEntity,
     *    otherwise all effects are unrendered.
     */
    unrender: function (id) {
      var ids = id === undefined ? Object.keys(this._params) : [].push(id);
      var toBeDeleted = [];
      ids.forEach(function(id) {
        var theEntity = this._entities[id];
        if (theEntity) {
          var oldHeight = this._effects[id].oldValue;
          theEntity.setHeight(oldHeight);
          toBeDeleted.push(id);
        }
      }, this);
      if (toBeDeleted.length > 0) {
        toBeDeleted.map(function (id) { delete this._effects[id]; });
      }
    }

  });

  return HeightProjection;
});
