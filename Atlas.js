define([
], function () {

  /**
   * Facade class for the Atlas API. This class maintains references to all
   * managers used in the implementation. It exposes an API to the host 
   * application to control Atlas' behaviour.
   *
   * @author  Brendan Studds
   * @version 1.0
   *
   * @alias atlas/Atlas
   * @constructor
   */
  var Atlas = function () {
    // In Atlas assume managers are defined. Implementations will include these.
    this.managers = {};
  };


  Atlas.prototype.setManager = function (name, manager) {
    // TODO(bpstudds): Implement this function.
  };

  Atlas.prototype.removeManager = function (name, manager) {
    // TODO(bpstudds): Implement this function.
  };

  /**
   * Function to initialise the Atlas instance.
   * @param {HTMLElement} element The initial DOM element to render in.
   */
  Atlas.prototype.initialise = function (element) {
    //this.managers.domManager.
  };

  /**
   * Function to show the Atlas render.
   */
  Atlas.prototype.show = function () {

  };

  /**
   * Function to hide the Atlas render.
   */
  Atlas.prototype.hide = function () {

  };


  return Atlas;
});