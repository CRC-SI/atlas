define([
  'atlas/lib/utility/Setter',
  'atlas/material/Color',
  'atlas/material/Material',
  'underscore'
], function(Setter, Color, Material, _) {

  /**
   * @typedef atlas.material.Gradient
   * @ignore
   */
  var Gradient;

  /**
   * @classdesc A gradient transition between multiple colors.
   *
   * @param {Array.<atlas.material.Gradient.Color>} colors - An array of gradient color points.
   *
   * @class atlas.material.Gradient
   * @extends atlas.material.Material
   */
  Gradient = Material.extend(/** @lends atlas.material.Gradient# */ {

    colors: null,

    _init: function(args) {
      args = Setter.merge({
        colors: []
      }, args);
      this.colors = _.map(args.colors, function(color) {
        return {pivot: color.pivot, color: new Color(color.color)};
      });
    },

    equals: function(other) {
      if (_.size(this.colors) !== _.size(other.colors)) {
        return false;
      }
      return _.all(this.colors, function(color, i) {
        return (color.color.equals(this.colors[i].color)) && (color.pivot == this.colors[i].pivot);
      });
    },

    toJson: function() {
      return {
        type: 'Gradient',
        colors: _.map(this.colors, function(color) {
          return {pivot: color.pivot, color: color.color.toString()}
        })
      }
    }

  });

  /**
   * A color point in a color gradient.
   * @typedef {Object} atlas.material.Gradient.Color
   * @param {atlas.material.Color} color - The color of the given point.
   * @param {Number} pivot - A number representing the point where the given color is unblended in
   *     the range [0, 1] where 0 and 1 represent the opposite ends of the gradient.
   */

  return Gradient;
});
