define([
  'atlas/util/AtlasMath',
  'atlas/util/Class',
  'atlas/util/FreezeObject',
  'atlas/lib/tinycolor'
], function(AtlasMath, Class, freeze, Tinycolor) {
  var __DEBUG__ = true;

  if (__DEBUG__) {
    freeze = function(o) {
      return o;
    }
  }

  /**
   * @classdesc Constructs a colour specified by red, green, blue and alpha
   * intensity values. The intensities can vary from <code>0.0</code>
   * (minimum intensity) to <code>1.0</code> (maximum intensity).
   *
   * @param {Number} [r=0.0] Red component.
   * @param {Number} [g=0.0] Green component
   * @param {Number} [b=0.0] Blue component
   * @param {Number} [a=0.0] Alpha component
   *
   * @class atlas.model.Colour
   */
  var Colour = Class.extend(/** @lends atlas.model.Colour# */ {
    red: null,
    green: null,
    blue: null,
    alpha: null,

    _init: function(r, g, b, a) {
      if (typeof r === 'object') {
        this._fromObj.apply(this, arguments);
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

    _fromObj: function (obj) {
      this.red = obj.red;
      this.green = obj.green;
      this.blue = obj.blue;
      this.alpha = obj.alpha;
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {string} The colour as a string in the format 'rbga([RED], [GREEN], [BLUE], [ALPHA])'
     */
    toString: function() {
      return 'rgba(' + [this.red * 255, this.green * 255, this.blue * 255, this.alpha].join(', ') +
          ')';
    },

    /**
     * @returns {string} The colour as a string in the CSS hex format.
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

    /**
     * @returns {Object} The colour as a tinycolor HSV object.
     */
    toHsv: function() {
      var tiny = Tinycolor(this.toString());
      return tiny.toHsv();
    },

    /**
     * Linearly interpolates between this colour and another colour.
     * @param {atlas.model.Colour} other - The end colour to interpolate to.
     * @param {Number} lerpFactor - The linear interpolation factor in the range [0,1].
     * @returns {atlas.model.Colour} The interpolated colour.
     */
    interpolate: function(other, lerpFactor) {
      return this.interpolateByHue(other, lerpFactor);
    },

    /**
     * Linearly interpolates between this colour and another colour using the hue value.
     * @param {atlas.model.Colour} other - The end colour to interpolate to.
     * @param {Number} lerpFactor - The linear interpolation factor in the range [0,1].
     * @returns {atlas.model.Colour} The interpolated colour.
     */
    interpolateByHue: function(other, lerpFactor) {
      var hsv1 = this.toHsv(),
          hsv2 = other.toHsv();
      hsv1.h = AtlasMath.lerp(hsv2.h, hsv1.h, lerpFactor);
      return Colour.fromHsv(hsv1);
    }
  });

  // ---------------------------------------------
  // GENERATORS
  // ---------------------------------------------

  /**
   * Function that creates a new Colour instance from the given RGBA values.
   * @param {Number|Array} red - The red value, where 0 is minimum intensity and 255 is maximum intensity. Alternatively, an array of 4 elements containing values for red, green, blue, and alpha in that order.
   * @param {Number} [green] - The green value, where 0 is minimum intensity and 255 is maximum intensity.
   * @param {Number} [blue] - The blue value, where 0 is minimum intensity and 255 is maximum intensity.
   * @param {Number} [alpha] - The alpha value, where 0 is minimum intensity and 255 is maximum intensity.
   * @returns {atlas.model.Colour}
   */
  Colour.fromRGBA = function(red, green, blue, alpha) {
    if (red.length) {
      return new Colour(red[0] / 255, red[1] / 255, red[2] / 255, red[3] / 255);
    } else {
      return new Colour(red / 255, green / 255, blue / 255, alpha / 255);
    }
  };

  /**
   * Generates an Atlas Colour object from a hsv value.
   * @param hsv - The HSV colour.
   * @returns {atlas.model.Colour} - The converted colour.
   */
  Colour.fromHsv = function(hsv) {
    var tiny = Tinycolor(hsv).toRgb();
    return new Colour(tiny.r / 255, tiny.g / 255, tiny.b / 255, 1);
  };

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  // These constants are frozen. Any attempt to alter them may silently fail.
  // The Karma tests will fail with these objects frozen.
  Colour.WHITE = freeze(new Colour(1, 1, 1, 1));
  Colour.GREY = freeze(new Colour(0.7, 0.7, 0.7, 1));
  Colour.BLACK = freeze(new Colour(0, 0, 0, 1));
  Colour.RED = freeze(new Colour(1, 0, 0, 1));
  Colour.GREEN = freeze(new Colour(0, 1, 0, 1));
  Colour.BLUE = freeze(new Colour(0, 0, 1, 1));

  return Colour;
});
