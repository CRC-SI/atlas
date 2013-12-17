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
    
    this._mode;
    
    this._entities;  
  };
 
  // I don't think we need an initialise()
  
  TranslationModule.prototype.setMode = function (mode) {};
  
  TranslationModule.prototype.getMode = function (mode) {};
  
  TranslationModule.prototype.cancel = function (mode) {};
  
  // Do we want to generalise this functionality? ie startDrag(), midDrag(), endDrag()?
  TranslationModule.prototype.handleMouseDown = function (mode) {};
  
  TranslationModule.prototype.handleMouseMove = function (mode) {};
  
  TranslationModule.prototype.handleMouseUp = function (mode) {};
  
  return TranslationModule;
});