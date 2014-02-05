define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/default',
  'atlas/util/dom/DomClass',
  'atlas/util/dom/DomChild',
  'atlas/util/mixin'
], function(
  Class,
  DeveloperError,
  defaultValue,
  DomClass,
  DomChild,
  mixin) {
  "use strict";

  /**
   * @classdesc Object to manage the DOM node that Atlas is rendered into.
   * @author Brendan Studds
   *
   * @param {Object} atlasManagers - A mapping of every manager type in Atlas to the manager instance.
   * @param {String} [domId] - The ID of the DOM element to attach Atlas to.
   *
   * @class atlas.dom.DomManager
   */
  var DomManager = mixin(Class.extend( /** @lends atlas.dom.DomManager# */ {
    /**
     * A mapping of every manager type in Atlas to the manager instance. This
     * object is created on Atlas, but the manager instances are set by each
     * manager upon creation.
     * @type {Object}
     */
    _atlasManagers: null,

    _currentDomId: null,

    _rendered: null,

    _visible: null,

    _init: function(atlasManagers, domId) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.dom = this;

      this._currentDomId = defaultValue(domId, null);
      this._rendered = false;
      this._visible = false;

      if (this._currentDomId !== null) {
        this.setDom(this._currentDomId, true);
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Changes the DOM node which Atlas is displayed in.
     * If Atlas is currently displayed changing the DOM automatically causes
     * it to be re-rendered in the new DOM element.
     *
     * @param {String|HTMLElement} elem - Either the ID of a DOM element or the element itself.
     * @param {Boolean} [show=true] - Whether the object should be displayed immediately in this new location.
     */
    setDom: function (elem, show) {
      var showNow = defaultValue(show, true);
      var newDomNode = typeof elem === 'string' ? document.getElementById(elem) : elem;
      if (!newDomNode) {
        throw new DeveloperError('DOM node not found: ' + elem);
      }
      var newDomNodeId = newDomNode.id;

      // Move existing DOM if there is one.
      console.debug('setting DOM with current ID', this._currentDomId, 'to', newDomNodeId);
      if (this._currentDomId !== null) {
        // Always show in the new position if Atlas is being moved.
        showNow = true;
        console.debug('moving atlas from', this._currentDomId, 'to', newDomNodeId);
        var curDomNode = document.getElementById(this._currentDomId);
        var childDomNode = DomChild.getChildren(curDomNode);
        DomChild.addChildren(newDomNode, childDomNode);
        console.debug('moved atlas into', newDomNodeId);
      }
      this._currentDomId = newDomNodeId;
      // Show in new location if required.
      if (showNow) {
        DomClass.remove(newDomNode, "hidden");
        this._visible = true;
      } else {
        DomClass.add(newDomNode, "hidden");
        this._visible = false;
      }
      // Cause the set DOM element to be populated with the Atlas visualisation.
      this.populateDom(this._currentDomId);
    },

    /**
     * @returns {HTMLElement} The current DOM node used by Atlas.
     */
    getDom: function () {
      return document.getElementById(this._currentDomId);
    },

    getHeight: function () {
      return document.getElementById(this._currentDomId).offsetHeight;
    },

    getWidth: function () {
      return document.getElementById(this._currentDomId).offsetWidth;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Populates the Atlas DOM element.
     * @abstract
     */
    populateDom: function (id) {
      throw new DeveloperError('Can not call abstract method atlas/dom/DomManager.populateDom');
    },

    /**
     * Shows the Atlas DOM element.
     */
    show: function () {
      if (!this._visible) {
        var domNode = document.getElementById(this._currentDomId);
        DomClass.remove(domNode, 'hidden');
        this._visible = true;
      }
    },

    /**
     * Hides the Atlas DOM element.
     */
    hide: function () {
      if (this._visible) {
        var domNode = document.getElementById(this._currentDomId);
        DomClass.add(domNode, 'hidden');
        this._visible = false;
      }
    },

    /**
     * Toggles the visiblity of the Atlas DOM element.
     */
    toggleVisibility: function () {
      if (this._visible) {
        this.hide();
      } else {
        this.show();
      }
    }

  }), // End class instance definitions.

    // -------------------------------------------
    // STATICS
    // -------------------------------------------

    {
      // Nope
    }
  ); // End class static definitions.

  return DomManager;
});
