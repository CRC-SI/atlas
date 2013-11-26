define([
  'atlas/util/DeveloperError',
  'atlas/util/DomClass',
  'atlas/util/DomChild'
], function(DeveloperError, DomClass, DomChild) {

  /**
   * Object to manage the DOM node that Atlas is render into
   * @author Brendan Studds
   * @version 1.0
   *
   * @param {RenderManager} [rm] The RenderManager used by this DomManager.
   *
   * @alias atlas.dom.DomManager
   * @constructor
   */
  var DomManager = function (/*RenderManager*/ rm) {
    this.renderManager = (rm || null);
    this.currentNode = null;
    this.rendered = false;
    this.visible = false;
  };

  /**
   * Function to change which DOM node Atlas is rendered into. Atlas will always
   * be moved to the new location. The 'show' parameter determines whether it is
   * displayed immediately in this new location.
   * @param  {HTMLElement} newElem     The new DOM element to render into.
   * @param  {Boolean}     [show=true] Whether the object should be rendered.
   */
  // Todo(bpstudds): Enable deferring initial rendering.
  DomManager.prototype.setElement = function (newElem, show) {
    var show_ = (show || true);
    var childDom;
    if (this.currentNode !== null) {
      childDom = ChildDom.getChildren(this.currentNode);
      DomChild.appendChildren(newElem, childDom);
    }
    this.currentNode = newElem;
    if (show_) {
      DomClass.remove(this.currentNode, "hidden");
    } else {
      DomClass.add(this.currentNode, "hidden");
    }
  };

  /**
   * Show the DOM element that Atlas is rendered in.
   */
  DomManager.prototype.show = function () {
    DomClass.remove(this.currentNode, "hidden");
  };

  /**
   * Hide the DOM element that Atlas is rendered in.
   */
  DomManager.prototype.hide = function () {
    DomClass.add(this.currentNode, "hidden");
  };

  /**
   * Toggles the visiblity of the DOM element Atlas is rendering in.
   */
  DomManager.prototype.toggleVisibility = function () {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  };

  return DomManager;
});