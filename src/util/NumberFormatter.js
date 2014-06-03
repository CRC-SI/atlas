define([
  'atlas/lib/numeral',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/String',
  'atlas/util/Class'
], function(numeral, Setter, String, Class) {
  /**
   * Formats values for presentation.
   * @class atlas.util.Formatter
   */
  return Class.extend({

    /**
     * @param {Number} x - Any given number, including one in exponential notation.
     * @param {Object} args
     * @param {Number} args.minSigFigs - The minimum number of significant figures after the period.
     * @param {Number} args.maxSigFigs - The maximum number of significant figures after the period.
     * @returns {String} A rounded string of the given number.
     */
    round: function(x, args) {
      args = Setter.mixin({
        minSigFigs: 1,
        maxSigFigs: 3
      }, args);
      if (x.toString().indexOf('e') !== -1) {
        // Number has exponential, so use a precision with 3 significant figures after the
        // period.
        x = parseFloat(x.toPrecision(args.maxSigFigs + 1));
      }
      // Use commas, with taking into account the minimum and maximum number of significant figures
      // after the period.
      var diffSigFigs = args.maxSigFigs - args.minSigFigs;
      return numeral(x).format('0,0.' + String.repeat('0', args.minSigFigs) + '[' +
          String.repeat('0', diffSigFigs));
    },

    /**
     * @param {Number|String} x
     * @returns {String} The given number with scientific notation converted from E notation to times.
     * @example
     * eNotationToTimes(1e+100) // '1x10^100'
     */
    eNotationToTimes: function(x) {
      var sign = '';
      var times = x.toString().replace(/e([+-])(\d+)/, function(match, m1, m2) {
        sign = m1;
        return 'x10^' + m2;
      });
      if (sign === '-') {
        times = sign + times;
      }
      return times;
    },

    /**
     * @param {Number|String} x
     * @returns {String} The given number with <code>^</code> converted to using HTML superscript
     * tags and <code>'x'</code> converted to <code>&times;</code>.
     * @example
     * powerToSuper('1x10^100') // '1x10<sup>100</sup>'
     */
    exponentsToHTML: function(x) {
      return x.toString().replace(/x/g, '&times;').replace(/\^(\d+)/g, '<sup>$1</sup>');
    }

  });
});
