define([
  'atlas/lib/utility/Setter',
  'atlas/material/Color',
  'atlas/material/Material',
  'atlas/model/Vertex',
], function(Setter, Color, Material, Vertex) {

  /**
   * @typedef atlas.material.CheckPattern
   * @ignore
   */
  var CheckPattern;

  /**
   * @classdesc A checkered pattern.
   *
   * @param {atlas.material.Color} [color1=Color.WHITE] color1
   * @param {atlas.material.Color} [color2=Color.BLACK] color2
   * @param {atlas.model.Vertex} [repeat={x: 20, y: 20}] - The number of times to repeat the pattern
   *     in the x and y axes.
   *
   * @class atlas.material.CheckPattern
   * @extends atlas.material.Material
   */
  CheckPattern = Material.extend(/** @lends atlas.material.CheckPattern# */ {

    color1: null,
    color2: null,
    repeat: null,

    _init: function(args) {
      args = Setter.merge({
        color1: 'white',
        color2: 'black',
        repeat: {x: 20, y: 20}
      }, args);
      this.color1 = new Color(args.color1);
      this.color2 = new Color(args.color2);
      this.repeat = new Vertex(args.repeat);
    },

    equals: function(other) {
      return other && this.color1.equals(other.color1) &&
          this.color2.equals(other.color2) && this.repeat.equals(other.repeat);
    },

    toJson: function() {
      return {
        type: 'CheckPattern',
        color1: this.color1.toString(),
        color2: this.color2.toString(),
        repeat: this.repeat.toJson(),
      }
    }

  });

  return CheckPattern;
});
