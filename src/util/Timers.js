define([
  'atlas/lib/utility/Setter',
  'atlas/lib/Q',
  'underscore'
], function(Setter, Q, _) {

  /**
   * A set of timer utility methods.
   * @module atlas.util.Timers
   */
  return {
    /**
     * Waits until the given predicate evaluates to a truthy value.
     * @param  {Function} predicate
     * @param  {Object} args
     * @param  {Number} [args.timeout=60000] - The time in milliseconds to continue waiting. After
     *     this period, the promise is rejected. Set to false to pervent timeout.
     * @param  {Number} [args.freq=200] - The frequency in milliseconds to check the predicate.
     * @returns {Q.Deferred} A deferred promise which is resolved when the given predicate evaluates
     * to a truthy value.
     */
    waitUntil: function(predicate, args) {
      var df = Q.defer();
      _.defer(function() {
        this._waitUntil(predicate, args, df);
      }.bind(this));
      return df;
    },

    _waitUntil: function(predicate, args, df) {
      if (predicate()) {
        df.resolve();
      } else {
        args = Setter.merge({
          timeout: 60000,
          freq: 200
        }, args);
        var timeout = args.timeout;
        var hasTimeout = timeout !== false;
        var freq = args.freq;
        if (hasTimeout && freq > timeout) {
          throw new Error('Frequency must be less than timeout period.');
        }
        var totalTime = 0;
        var handle = setInterval(function() {
          var isDone = predicate();
          if (isDone) {
            df.resolve();
            clearInterval(handle);
          }
          if (hasTimeout && totalTime >= timeout) {
            clearInterval(handle);
            if (!isDone) {
              df.reject();
            }
          }
          totalTime += freq;
        }, freq);
      }
    }
  }

});
