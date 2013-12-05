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
    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    this._managers = {};
    this._managers['render'] = {};
    this._managers['dom'] = {};
    this._managers['event'] = {};
  };

  /**
   * Allows the a particular manager to be replaced with another.
   * @param {String} type - The type of manager to replaced, ie 'dom' or 'render'
   * @param {Object} manager - The new manager.
   * @returns {Object} The old manager.
   */
  Atlas.prototype.setManager = function (type, manager) {
    if (!(type in this._managers)) {
      throw new DeveloperError('Attempted to set manager of unknown type.');
    } else {
      var oldManager = this._managers[type];
      this._managers[type] = manager;
      return oldManager;
    }
  };

  // If you only have one manager you can't remove it.
  // TODO(bpstudds): Look into having multiple managers and switching between them?
  // Atlas.prototype.removeManager = function (type, manager) {
  //   if (len(this._managers[type]) == 1) {
  //     throw new DeveloperError('Can not remove last manager for type ' + type);
  //   }
  //   if (this._managers[type][-1] !== undefined) {
  //     delete this._managers[type][-1];
  //   }
  // };

  /**
   * Function to initialise the Atlas instance.
   * @param {HTMLElement} element The initial DOM element to render in.
   */
  Atlas.prototype.initialise = function (element) {
    console.log(this._managers);
    this._managers.dom.setDom(element);
    this._managers.dom.populateDom(element);
  };

  /**
   * Function to show the Atlas render.
   */
  Atlas.prototype.show = function () {
    this._managers.dom.show();
  };

  /**
   * Function to hide the Atlas render.
   */
  Atlas.prototype.hide = function () {
    this._managers.dom.show();
  };

  /**
   * Allows the Host application to publish an event to the internal
   * Atlas event system.
   * @param  {String} eventName - The type of the event to be published.
   * @param  {Object} [args] - Arguments relevant to the event.
   */
  Atlas.prototype.publish = function (eventName, args) {
    this._managers.event.handleExternEvent(eventName, args);
  };

  /**
   * Allows the Host application to subscribe to internal events of the Atlas
   * event system.
   * @param  {String}   eventName - The event tyep to subscribe to.
   * @param  {Function} callback - The callback that will be called when the event occurs.
   */
  Atlas.prototype.subscribe = function (eventName, callback) {
    this._managers.event.addEventHandler('intern', eventName, callback);
  };

  Atlas.prototype.addFeature = function (id, args) {
    if (typeof id === 'undefined') {
      throw new DeveloperError('Can add Feature without specifying id');
    } else {
      // Add EventManger to the args for the feature.
      args.eventManager = this._managers.event;
      // Add the RenderManager to the args for the feature.
      args.renderManager = this._managers.render;
      var feature = new this._managers.render.FeatureClass(id, args);
      this.addEntity(feature);
      return feature;
    }
  };

  Atlas.prototype.addPolygon = function (args) {
    throw new DeveloperError('Can not call abstract method on Atlas.');
  };


  Atlas.prototype.showEntity = function (id) {
    this._managers.render.show(id);
  };

  Atlas.prototype.hideEntity = function (id) {
    this._managers.render.hide(id);
  };

  return Atlas;
});