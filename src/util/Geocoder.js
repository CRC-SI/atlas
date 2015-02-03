define([
  'atlas/lib/utility/Log',
  'atlas/lib/Q',
  'atlas/model/GeoPoint',
  'atlas/lib/utility/Class',
  'atlas/util/GoogleAPI',
  'atlas/util/Instances'
], function(Log, Q, GeoPoint, Class, GoogleAPI, Instances) {

  /**
   * @typedef atlas.util.Geocoder
   * @ignore
   */
  var Geocoder;

  /**
   * Queries location names and finds their geospatial coordinates.
   * @class atlas.util.Geocoder
   */
  Geocoder = Instances.defineGlobal(Class.extend(/** @lends atlas.util.Geocoder# */{

    /**
     * A promise containing a Google Maps API geocoder instance.
     * @type {Promise.<atlas.util.Geocoder>}
     */
    _geocoderPromise: null,

    _init: function() {
      var df = Q.defer();
      this._geocoderPromise = df.promise;
      GoogleAPI.load(function() {
        if (typeof google === 'undefined') {
          df.reject('Could not load Google API.');
          return;
        }
        google.load('maps', '3.6', {
          other_params: 'sensor=false',
          callback: function() {
            Log.debug('Loaded Google Maps');
            var geocoder = new google.maps.Geocoder();
            df.resolve(geocoder);
          }
        });
      });
    },

    /**
     * Searches the given address for the coordinates.
     * @param {Object} args
     * @param {String} args.address - The location address to resolve.
     * @returns {Promise.<Object>} result - A promise which is resolve when at least one result is returned,
     * and is rejected when an error occurs or no results are returned.
     * @returns {Array.<Object>} result.results - The set of geocoded results from the Google API.
     * @returns {String} result.status - A status message for the successful geocoding.
     * @see https://developers.google.com/maps/documentation/javascript/geocoding
     */
    geocode: function(args) {
      // TODO(aramk) Add support for "location" lat lng instead of "address"
      var address = args.address;
      if (!address) {
        throw new Error('Address required');
      }
      var deferredGeocodeQuery = Q.defer();
      this._geocoderPromise.then(function(geocoder) {
        GoogleAPI.load(function() {
          geocoder.geocode({address: address}, function(results, status) {
            var result = {
              results: results,
              status: status
            };
            var hasFailed = status !== google.maps.GeocoderStatus.OK;
            deferredGeocodeQuery[hasFailed ? 'reject' : 'resolve'](result);
          });
        });
      }, deferredGeocodeQuery.reject);
      return deferredGeocodeQuery.promise;
    },

    /**
     * @param {Object} args - The same as {@link #geocode}.
     * @returns {Promise.<Object>} info
     * @returns {Object} info.address - The resolved address of the location.
     * @returns {atlas.model.GeoPoint} info.position - The resolved position of the location.
     */
    getInfo: function(args) {
      var df = Q.defer();
      // To avoid an AMD cyclic dependency, we must load Camera at runtime.
      requirejs(['atlas/camera/Camera'], function(Camera) {
        this.geocode(args).then(function(results) {
          var result = results.results[0];
          var loc = result.geometry.location;
          df.resolve({
            address: result.formatted_address,
            // TODO(aramk) Resolve appropriate elevation.
            position: new GeoPoint(loc.lng(), loc.lat(), Camera.getDefaultPosition().elevation)
          });
        }, df.reject);
      }.bind(this));
      return df.promise;
    }

  }));

  return Geocoder;
});
