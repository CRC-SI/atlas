define([
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/dom/DomClass',
  'atlas/util/dom/DomChild'
], function(DeveloperError, defaultValue, DomClass, DomChild) {
  "use strict";

  /**
   * Object to manage the DOM node that Atlas is render into
   * @author Brendan Studds
   * @version 1.0
   *
   * @param {Object} atlasManagers - A mapping of every manager type in Atlas to the manager instance.
   * @param {String} [domId] - The ID of the DOM element to attach Atlas to.
   *
   * @alias atlas/dom/DomManager
   * @constructor
   */
  var DomManager = function (/*Object*/ atlasManagers, /*String*/ domId) {

    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    this._atlasManagers = atlasManagers;
    this._atlasManagers.dom = this;

    this._currentDomId = defaultValue(domId, null);
    this._rendered = false;
    this._visible = false;

    if (this._currentDomId !== null) {
      this.setDom(this._currentDomId, true);
    }
  };

  /**
   * Function to change which DOM node Atlas is rendered into. Atlas will always
   * be moved to the new location. The 'show' parameter determines whether it is
   * displayed immediately in this new location.
   * If Atlas is currently displayed changing the DOM automatically causes
   * it to be re-rendered in the new DOM element.
   *
   * @param  {String}  newDomId - The new DOM element to render into.
   * @param  {Boolean} [show=true] - Whether the object should be rendered.
   */
  DomManager.prototype.setDom = function (newDomId, show) {
    var showNow = defaultValue(show, true);
    var newDomNode = document.getElementById(newDomId);

    // Move existing DOM if there is one.
    console.debug('setting DOM with current ID', this._currentDomId, 'to', newDomId);
    if (this._currentDomId !== null || this._currentDomId !== "") {
      // Always show in the new position if Atlas is being moved.
      showNow = true;
      console.debug('moving atlas from', this._currentDomId, 'to', newDomId);
      var curDomNode = document.getElementById(this._currentDomId);
      var childDomNode = DomChild.getChildren(curDomNode);
      DomChild.addChildren(newDomNode, childDomNode);
    }
    this._currentDomId = newDomId;
    // Show in new location if required
    if (showNow) {
      DomClass.remove(newDomNode, "hidden");
      this._visible = true;
    } else {
      DomClass.add(newDomNode, "hidden");
      this._visible = false;
    }
    // Cause the set DOM element to be populated with the Atlas visualisation.
    this.populateDom(this._currentDomId);
  };

  /**
   * Function to populate the current DOM element with the required data to
   * render Atlas (Implementation defined).
   *
   * @abstract
   */
  DomManager.prototype.populateDom = function (/*string*/id) {
    throw new DeveloperError('Can not call abstract method atlas/dom/DomManager.populateDom');
  };

  /**
   * Show the DOM element that Atlas is rendered in.
   */
  DomManager.prototype.show = function () {
    if (!this._visible) {
      var domNode = document.getElementById(this._currentDomId);
      DomClass.remove(domNode, "hidden");
      this._visible = true;
    }
  };

  /**
   * Hide the DOM element that Atlas is rendered in.
   */
  DomManager.prototype.hide = function () {
    if (this._visible) {
      var domNode = document.getElementById(this._currentDomId);
      DomClass.add(domNode, "hidden");
      this._visible = false;
    }
  };

  /**
   * Toggles the visiblity of the DOM element Atlas is rendering in.
   */
  DomManager.prototype.toggleVisibility = function () {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  };

  return DomManager;
});