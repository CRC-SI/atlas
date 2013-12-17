define([

], function () {

  /**
   * Constructs a new TranslationModule.
   * @class TranslationModule desc ...
   *
   * @alias atlas/edit/TranslationModule
   * @constructor
   */
  var TranslationModule = function () {
    // don't need an enabled state, that's handled by EditManager.

    this._mode = {};

    this._entities = {};
    
    this._originalEntityLocations = {};
  };

  // I don't think we need an initialise()

  TranslationModule.prototype.setMode = function (mode) {};

  TranslationModule.prototype.getMode = function (mode) {};

  // Undo an operation mid way?
  TranslationModule.prototype.cancel = function (mode) {};

  // Stores Entities being translated, initial location
  TranslationModule.prototype.start = function (mode) {
    // PSUEDO CODE
    /* lastLocation = here
     * for each selected entity
     *    store current entity location locally
     */
  };

  // Updates 'initial' location, renders entities at current location
  // Have function on GeoEntity to temporarily change location data and re-render
  TranslationModule.prototype.update = function (mode) {
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
  TranslationModule.prototype.end = function (mode) {
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