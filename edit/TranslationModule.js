define([
  'atlas/util/Extends',
  './EditModule'
], function (extend, EditModule) {

  /**
   * Constructs a new TranslationModule.
   * @class Handles logic for movement through user interaction.
   *
   * @alias atlas/edit/TranslationModule
   * @constructor
   */
  var TranslationModule = function () {
    this._entities = {};
    this._originalEntityLocations = {};
  };

  // Inherit from TranslationModule.
  extend(TranslationModule, EditModule);

  // Stores Entities being translated, initial location
  TranslationModule.prototype.start = function (name, event) {
    // PSUEDO CODE
    /* lastLocation = here
     * for each selected entity
     *    store current entity location locally
     */
  };

  // Updates 'initial' location, renders entities at current location
  // Have function on GeoEntity to temporarily change location data and re-render
  TranslationModule.prototype.update = function (name, event) {
    // PSUEDO CODE
    /* currentLocation = here
     * diff = determineLocationChange
     * for each selected entity
     *    entity.move(diff);
     *    entity.show()
     * clear drag state
     * lastLocation = here
     */
  };

  // Changes actual location of entities, renders them there.
  // Have function on GeoEntity to permantely update location data and re-render
  TranslationModule.prototype.end = function (name, event) {
    // PSUEDO CODE
    /* diff = determineLocationChange
     * for each selected entity
     *    entity.move(diff);
     *    entity.show()
     * clear drag state
     */
  };

  return TranslationModule;
});