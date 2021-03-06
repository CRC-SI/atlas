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

  // TODO(aramk) Make this into an ItemCache and add a size limit.
  /**
   * A cache containing color data useful for reducing the need to reconstruct the same colors
   * repeatedly.
   * @type {Object.<String, *>}
   */
  var cache = {};

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

    /**
     * Sets the color properties by using a cache if available.
     * @param {String} Any valid string argument for the tinycolor constructor.
     */
    _fromStr: function(str) {
      var colorArray = this._getCachedColor(str, this.__fromStr, str);
      this._fromRgba.apply(this, colorArray);
    },

    /**
     * Sets the color properties using the tinycolor constructor.
     * @param {String} Any valid string argument for the tinycolor constructor.
     * @returns {Array.<Number>} An array of RGBA values in the range [0, 1].
     */
    __fromStr: function(str) {
      var c = tinycolor(str).toRgb();
      return [this._toFloat(c.r), this._toFloat(c.g), this._toFloat(c.b), c.a];
    },

    _toFloat: function(x) {
      return x / 255;
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
          this.alpha].join(', ') + ')';
    },

    /**
     * @returns {String} The color as a string in the CSS hex format. This doesn't include alpha.
     *     Use {@link #toString()} if this is needed.
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
     * @param {Object} [args]
     * @param {Boolean} [args.floatValues=true] If true, the values are in floating point [0-1].
     *     Otherwise, they are in integers [0-255].
     * @return {Array} An array of colors in the form [red, green, blue, alpha].
     */
    toArray: function(args) {
      args = Setter.mixin({floatValues: true}, args);
      return ['red', 'green', 'blue', 'alpha'].map(function(colorName) {
        var value = this[colorName];
        return args.floatValues ? value : value * 255;
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
      lerpFactor = Setter.range(lerpFactor, 0, 1);
      hsv1.h = AtlasMath.lerp(hsv2.h, hsv1.h, lerpFactor);
      var color = Color.fromHsv(hsv1);
      color.alpha = AtlasMath.lerp(this.alpha, other.alpha, lerpFactor);
      return color;
    },

    /**
     * @param {atlas.material.Color} other
     * @returns {Boolean} Whether the given object is equal to this object.
     */
    equals: function(other) {
      return other && this.red === other.red && this.green === other.green &&
          this.blue === other.blue && this.alpha === other.alpha;
    },

    clone: function() {
      return new Color(this.toJson());
    },

    toJson: function() {
      return {
        type: 'Color',
        red: this.red,
        green: this.green,
        blue: this.blue,
        alpha: this.alpha,
      }
    },

    /**
     * @param {Number} A value to darken the color by in the range [0, 1].
     * @return {atlas.model.Color} A new color that is darker by the given amount.
     */
    darken: function(value) {
      return this._createFromCachedMethod('_darken', value);
    },

    /**
     * @param {Number} A value to lighten the color by in the range [0, 1].
     * @return {atlas.model.Color} A new color that is lighter by the given amount.
     */
    lighten: function(value) {
      return this._createFromCachedMethod('_lighten', value);
    },

    _darken: function(value) {
      return this._createFromTinyColorMethod('darken', value * 100);
    },

    _lighten: function(value) {
      return this._createFromTinyColorMethod('lighten', value * 100);
    },

    /**
     * @param {String} methodName - A method name of a tinycolor object.
     * @param {*} value - A value to pass to the method.
     * @return {String} The RGBA string from creating a tinycolor object for this color and applying
     *     the given method and passing the given value.
     */
    _createFromTinyColorMethod: function(methodName, value) {
      return tinycolor(this.toString())[methodName](value).toRgbString();
    },

    /**
     * @param {String} methodName - The name of a method which exists for this class.
     * @param {*} value - A value to pass to the method.
     * @return {atlas.material.Color} A new color created from the given method and value. Uses
     *     a cached output from the method call if available.
     */
    _createFromCachedMethod: function(methodName, value) {
      var str = this.toString();
      var name = methodName + '_' + str + '_' + value;
      var hexString = this._getCachedColor(name, this[methodName], value);
      return new Color(hexString);
    },

    /**
     * @param {String} name - A unique name for the cached object.
     * @param {Function} callback - A function which creates the object. If not found in the cache,
     *     this function is invoked and the result is cached.
     * @param {*} args - Any object which should be passed to the callback. This is more efficient
     *     than binding to the callback function with bind().
     * @return {*} The cached object, if any.
     */
    _getCachedColor: function(name, callback, args) {
      var value = cache[name];
      if (value != null) return value;
      return cache[name] = callback.call(this, args);
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

  /**
   * @return {atlas.model.Color} A random color.
   */
  Color.random = function() {
    return new Color(tinycolor.random().toHexString());
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
