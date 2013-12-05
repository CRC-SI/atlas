define([
  'atlas/util/DeveloperError',
  'atlas/util/dom/DomClass',
  'atlas/util/dom/DomChild'
], function(DeveloperError, DomClass, DomChild) {

  /**
   * Object to manage the DOM node that Atlas is render into
   * @author Brendan Studds
   * @version 1.0
   *
   * @param {Object} atlasManagers - A mapping of every manager type in Atlas to the manager instance.
   *
   * @alias atlas/dom/DomManager
   * @constructor
   */
  var DomManager = function (/*Object*/ atlasManagers) {

    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.dom = this; 

    this._currentNode = null;
    this._rendered = false;
    this._visible = false;
  };

  /**
   * Function to change which DOM node Atlas is rendered into. Atlas will always
   * be moved to the new location. The 'show' parameter determines whether it is
   * displayed immediately in this new location.
   * @param  {HTMLElement} newElem     The new DOM element to render into.
   * @param  {Boolean}     [show=true] Whether the object should be rendered.
   */
  DomManager.prototype.setDom = function (newElem, show) {
    var showNow = (show || true);
    var childDom;
    // Move existing DOM
    if (this._currentNode !== null) {
      showNow = true;
      childDom = ChildDom.getChildren(this._currentNode);
      DomChild.appendChildren(newElem, childDom);
    }
    this._currentNode = newElem;
    // Show in new location if required
    if (showNow) {
      DomClass.remove(this._currentNode, "hidden");
      this._visible = true;
    } else {
      DomClass.add(this._currentNode, "hidden");
      this._visible = false;
    }

    this.populateDom(this._currentNode);
  };

  /**
   * Function to populate the current DOM element with the required data to
   * render Atlas (Implementation defined).
   *
   * @abstract
   */
  DomManager.prototype.populateDom = function () {
    throw new DeveloperError('Can not call abstract method atlas/dom/DomManager.populateDom');
  };

  /**
   * Show the DOM element that Atlas is rendered in.
   */
  DomManager.prototype.show = function () {
    if (!this._visible) {
      DomClass.remove(this.currentNode, "hidden");
      this._visible = false;
    }
  };

  /**
   * Hide the DOM element that Atlas is rendered in.
   */
  DomManager.prototype.hide = function () {
    if (!this._visible) {
      DomClass.add(this.currentNode, "hidden");
      this._visible = true;
    }
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