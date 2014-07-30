define([
  'atlas/lib/utility/Log',
  'atlas/lib/Q',
  'atlas/util/Class',
  'atlas/util/GoogleAPI'
], function(Log, Q, Class, GoogleAPI) {
  /**
   * Queries location names and finds their geospatial coordinates.
   * @class atlas.util.Geocoder
   */
  return Class.extend(/** @lends atlas.util.Geocoder# */{

    /**
     * A promise containing a Google Maps API geocoder instance.
     * @type {Promise}
     */
    _geocoderPromise: null,

    _init: function() {
      var df = Q.defer();
      this._geocoderPromise = df.promise;
      GoogleAPI.load(function() {
        google.load('maps', '3.6', {
          other_params: 'sensor=false',
          callback: function() {
            Log.debug('Loaded Google Maps');
            var geocoder = new google.maps.Geocoder();
            df.resolve(geocoder);
          }.bind(this)
        });
      }.bind(this));
    },

    /**
     * Searches the given address for the coordinates.
     * @param {String} address
     * @param {Function} callback
     */
    geocode: function(address) {
      var df = Q.defer();
      this._geocoderPromise.then(function(geocoder) {
        geocoder.geocode({'address': address}, function(results, status) {
          var result = {
            results: results,
            status: status
          };
          var hasFailed = status != google.maps.GeocoderStatus.OK;
          df[hasFailed ? 'reject' : 'resolve'](result);
        });
      }, df.reject);
      return df.promise;
    }

  });
});
