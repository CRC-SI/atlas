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
   * @param {atlas.material.Color} [lightColor=Color.WHITE] - The light square color.
   * @param {atlas.material.Color} [darkColor=Color.BLACK] - The dark square color.
   * @param {atlas.model.Vertex} [repeat={x: 20, y: 20}] - The number of times to repeat the pattern
   *     in the x and y axes.
   *
   * @class atlas.material.CheckPattern
   * @extends atlas.material.Material
   */
  CheckPattern = Material.extend(/** @lends atlas.material.CheckPattern# */ {

    lightColor: null,
    darkColor: null,
    repeat: null,

    _init: function(args) {
      args = Setter.merge({
        lightColor: 'white',
        darkColor: 'black',
        repeat: {x: 20, y: 20}
      }, args);
      this.lightColor = new Color(args.lightColor);
      this.darkColor = new Color(args.darkColor);
      this.repeat = new Vertex(args.repeat);
    },

    equals: function(other) {
      return other && this.lightColor.equals(other.lightColor) &&
          this.darkColor.equals(other.darkColor) && this.repeat.equals(other.repeat);
    }

  });

  return CheckPattern;
});
