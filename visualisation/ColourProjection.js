define([
  'atlas/model/Colour',
  // Base class.
  'atlas/visualisation/AbstractProjection'
], function (Colour, AbstractProjection) {

  /**
   * Constructs a new ColourProjection object.
   * @classDesc A ColourProjection is used to project GeoEntity parameter values
   * onto the GeoEntity's colour.
   * @class atlas.visualisation.ColourProjection
   * @author Brendan Studds
   * @extends atlas.visualisation.AbstractProjection
   */
  var ColourProjection = AbstractProjection.extend(/** @lends atlas.visualisation.ColourProjection# */{
    ARTIFACT: 'colour',

    /*
     * Inherited from atlas.visualisation.AbstractVisualisation
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
     * Renders the effect of the Projection.
     */
    render: function (id) {
      var ids = this._constructIdList(id);
      // Process each entity for the win.
      ids.forEach(function (id) {
        var theEntity = this._entities[id];
        var theParams = this._params[id];
        if (theEntity) {
          // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
          var newColour = {fill: Colour.RED};
          var oldColour = theEntity.modifyStyle(newColour);
          theEntity.showAsExtrusion();
          this._effects[id] = { 'oldValue': oldColour, 'newValue': newColour };
        }
      }, this);
    },

    /**
     * Unrenders the effect of the Projection.
     */
    unrender:function (id) {
      var ids = this._constructIdList(id);
      // Process each entity for the win.
      ids.forEach(function (id) {
        var theEntity = this._entities[id];
        var theParams = this._params[id];
        if (theEntity) {
          // TODO(bpstudds): Do something fancy with _configuration to allow configuration.
          var oldColour = this._effects[id].oldValue;
          theEntity.modifyStyle(oldColour);
          theEntity.showAsExtrusion();
          delete this._effects[id];
        }
      }, this);
    }
  });

  return ColourProjection
});

