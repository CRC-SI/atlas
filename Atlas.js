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
   * @abstract
   * @alias atlas/Atlas
   * @constructor
   */
  var Atlas = function () {
    // In Atlas assume managers are defined. Implementations will include these.
    this.managers = {};
    this.managers['render'] = {};
    this.managers['dom'] = {};
    this.managers['events'] = {};
  };


  Atlas.prototype.setManager = function (type, manager) {
    var oldManager = this.managers[type];
    this.managers[type] = manager;
    return oldManager;
  };

  // If you only have one manager you can't remove it.
  // TODO(bpstudds): Look into having multiple managers and switching between them?
  // Atlas.prototype.removeManager = function (type, manager) {
  //   if (len(this.managers[type]) == 1) {
  //     throw new DeveloperError('Can not remove last manager for type ' + type);
  //   }
  //   if (this.managers[type][-1] !== undefined) {
  //     delete this.managers[type][-1];
  //   }
  // };

  /**
   * Function to initialise the Atlas instance.
   * @param {HTMLElement} element The initial DOM element to render in.
   */
  Atlas.prototype.initialise = function (element) {
    this.managers.dom.setDomEle(element);
    this.managers.dom.populateDomEle(element);
  };

  /**
   * Function to show the Atlas render.
   */
  Atlas.prototype.show = function () {
    this.managers.dom.show();
  };

  /**
   * Function to hide the Atlas render.
   */
  Atlas.prototype.hide = function () {
    this.managers.dom.show();
  };

  /**
   * Allows the Host application to publish an event to the internal
   * Atlas event system.
   * @param  {String} eventName - The type of the event to be published.
   * @param  {Object} [args] - Arguments relevant to the event.
   */
  Atlas.prototype.publish = function (eventName, args) {
    this.managers.events.handleExternEvent(eventName, args);
  };

  /**
   * Allows the Host application to subscribe to internal events of the Atlas
   * event system.
   * @param  {String}   eventName - The event tyep to subscribe to.
   * @param  {Function} callback - The callback that will be called when the event occurs.
   */
  Atlas.prototype.subscribe = function (eventName, callback) {
    this.managers.events.addEventHandler('intern', eventName, callback);
  };

  Atlas.prototype.addPolygon = function (args) {
    throw new DeveloperError('Can not call abstract method on Atlas.');
  };


  Atlas.prototype.showEntity = function (id) {
    this.managers.render.show(id);
  };

  Atlas.prototype.hideEntity = function (id) {
    this.managers.render.hide(id);
  };

  return Atlas;
});