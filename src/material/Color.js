define([
  'atlas/lib/tinycolor',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/material/Material',
  'atlas/util/AtlasMath',
  'atlas/util/FreezeObject'
], function(tinycolor, Setter, Types, Material, AtlasMath, freeze) {
  var __DEBUG__ = true;

  if (__DEBUG__) {
    freeze = function(o) {
      return o;
    }
  }

  /**
   * @typedef atlas.material.Color
   * @ignore
   */
  var Color;

  /**
   * @classdesc Constructs a color specified by red, green, blue and alpha
   * intensity values. The intensities can vary from <code>0.0</code>
   * (minimum intensity) to <code>1.0</code> (maximum intensity).
   *
   * @param {Number} [red=0.0] Red component.
   * @param {Number} [green=0.0] Green component
   * @param {Number} [blue=0.0] Blue component
   * @param {Number} [alpha=0.0] Alpha component
   *
   * @class atlas.material.Color
   * @extends atlas.material.Material
   */
  Color = Material.extend(/** @lends atlas.material.Color# */ {

    red: null,
    green: null,
    blue: null,
    alpha: null,

    _init: function() {
      var firstArg = arguments[0];
      if (Types.isArrayLiteral(firstArg)) {
        this._fromRgba.apply(this, firstArg);
      } else if (Types.isObject(firstArg)) {
        this._fromObj.apply(this, arguments);
      } else if (Types.isString(firstArg)) {
        this._fromStr.apply(this, arguments);
      } else {
        this._fromRgba.apply(this, arguments);
      }
    },

    _fromRgba: function(r, g, b, a) {
      this.red = AtlasMath.limit(r);
      this.green = AtlasMath.limit(g);
      this.blue = AtlasMath.limit(b);
      this.alpha = AtlasMath.limit(a);
    },

    _fromObj: function(obj) {
      this.red = obj.red || 0;
      this.green = obj.green || 0;
      this.blue = obj.blue || 0;
      this.alpha = obj.alpha || 1;
    },

    _fromStr: function(str) {
      var c = tinycolor(str).toRgb();
      var toFloat = function(x) {
        return x / 255;
      };
      this._fromRgba(toFloat(c.r), toFloat(c.g), toFloat(c.b), c.a);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {String} The color as a string in the format
     *     'rbga([RED], [GREEN], [BLUE], [ALPHA])'
     */
    toString: function() {
      return 'rgba(' + [this.red * 255, this.green * 255, this.blue * 255,
          this.alpha * 255].join(', ') + ')';
    },

    /**
     * @returns {string} The color as a string in the CSS hex format.
     */
    toHexString: function() {
      var hex = function(a) {
        var str = a.toString(16);
        if (a < 16) {
          str = '0' + str;
        }
        return str;
      };
      return '#' + hex(this.red * 255) + hex(this.green * 255) + hex(this.blue * 255);
    },

    toArray: function() {
      return ['red', 'green', 'blue', 'alpha'].map(function(colorName) {
        return this[colorName];
      }, this);
    },

    /**
     * @returns {Object} The color as a tinycolor HSV object.
     */
    toHsv: function() {
      var tiny = tinycolor(this.toString());
      return tiny.toHsv();
    },

    /**
     * Linearly interpolates between this color and another color.
     * @param {atlas.material.Color} other - The end color to interpolate to.
     * @param {Number} lerpFactor - The linear interpolation factor in the range [0,1].
     * @returns {atlas.material.Color} The interpolated color.
     */
    interpolate: function(other, lerpFactor) {
      return this.interpolateByHue(other, lerpFactor);
    },

    /**
     * Linearly interpolates between this color and another color using the hue value.
     * @param {atlas.material.Color} other - The end color to interpolate to.
     * @param {Number} lerpFactor - The linear interpolation factor in the range [0,1].
     * @returns {atlas.material.Color} The interpolated color.
     */
    interpolateByHue: function(other, lerpFactor) {
      var hsv1 = this.toHsv();
      var hsv2 = other.toHsv();
      hsv1.h = AtlasMath.lerp(hsv2.h, hsv1.h, Setter.range(lerpFactor, 0, 1));
      return Color.fromHsv(hsv1);
    },

    /**
     * @param {atlas.material.Color} other
     * @returns {Boolean} Whether the given object is equal to this object.
     */
    equals: function(other) {
      return other && this.red === other.red && this.green === other.green &&
          this.blue === other.blue && this.alpha === other.alpha;
    },

    toJson: function() {
      return {
        type: 'Color',
        red: this.red,
        green: this.green,
        blue: this.blue,
        alpha: this.alpha,
      }
    }

  });

  // ---------------------------------------------
  // GENERATORS
  // ---------------------------------------------

  /**
   * Function that creates a new Color instance from the given RGBA values.
   * @param {Number|Array} red - The red value, where 0 is minimum intensity and 255 is maximum
   *     intensity. Alternatively, an array of 4 elements containing values for red, green, blue,
   *     and alpha in that order.
   * @param {Number} [green] - The green value, where 0 is minimum intensity and 255 is maximum
   *     intensity.
   * @param {Number} [blue] - The blue value, where 0 is minimum intensity and 255 is maximum
   *     intensity.
   * @param {Number} [alpha] - The alpha value, where 0 is minimum intensity and 255 is maximum
   *     intensity.
   * @returns {atlas.material.Color}
   */
  Color.fromRGBA = function(red, green, blue, alpha) {
    if (red.length !== undefined) {
      return new Color(red[0] / 255, red[1] / 255, red[2] / 255, red[3] / 255);
    } else {
      return new Color(red / 255, green / 255, blue / 255, alpha / 255);
    }
  };

  /**
   * Generates an Atlas Color object from a hsv value.
   * @param {Object} hsv - The HSV color.
   * @param {Number} hsv.h - The hue in the range [0, 100].
   * @param {Number} hsv.s - The saturation in the range [0, 100].
   * @param {Number} hsv.v - The value in the range [0, 100].
   * @returns {atlas.material.Color} - The converted color.
   */
  Color.fromHsv = function(hsv) {
    var tiny = tinycolor(hsv).toRgb();
    return new Color(tiny.r / 255, tiny.g / 255, tiny.b / 255, 1);
  };

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  // These constants are frozen. Any attempt to alter them may silently fail.
  // The Karma tests will fail with these objects frozen.
  Color.WHITE = freeze(new Color(1, 1, 1, 1));
  Color.GREY = freeze(new Color(0.7, 0.7, 0.7, 1));
  Color.BLACK = freeze(new Color(0, 0, 0, 1));
  Color.RED = freeze(new Color(1, 0, 0, 1));
  Color.GREEN = freeze(new Color(0, 1, 0, 1));
  Color.BLUE = freeze(new Color(0, 0, 1, 1));
  Color.YELLOW = freeze(new Color(1, 1, 0, 1));

  return Color;
});
