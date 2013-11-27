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
    this.managers[render] = [];
    this.managers[dom] = [];
  };


  Atlas.prototype.setManager = function (name, manager) {
    this.managers[name].unshift(manager);
  };

  Atlas.prototype.removeManager = function (name, manager) {
    if (this.managers[name] !== undefined) {
      delete this.managers[name];
    }
  };

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


  Atlas.prototype.addPolygon = function (params) {
    if (params.id === undefined) {
      throw new DeveloperError('Can not create polygon without an ID');
    }
    var polygon = new Polygon(params.id, params.parent, params.vertices, params.height, params.elevation, params.style, params.material);
    this.managers.render.add(polygon);
    return polygon;
  };


  return Atlas;
});