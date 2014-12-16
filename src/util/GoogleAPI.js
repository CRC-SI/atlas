define(function() {

  /**
   * Wrapper for the Google JS API.
   * @module atlas.util.GoogleAPI
   */
  return {
    /**
     * Loads the remote Google JS API.
     * @param {Function} callback - Once invoked, <code>google</code> will be a global variable.
     */
    load: function(callback) {
      require(['https://www.google.com/jsapi'], function() {
        callback();
      });
    }
  };

});
