define([
  'atlas/core/Manager',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/util/DeveloperError',
  'atlas/util/dom/DomClass',
  'atlas/util/dom/DomChild'
], function(Manager, Log, Setter, DeveloperError, DomClass, DomChild) {
  /* global document,window */

  /**
   * @typedef atlas.dom.DomManager
   * @ignore
   */
  var DomManager;

  /**
   * @classdesc Manage the DOM node that Atlas is rendered into.
   *
   * @param {Object} managers - A mapping of every manager type in Atlas to the manager instance.
   *
   * @class atlas.dom.DomManager
   * @extends atlas.core.Manager
   */
  DomManager = Setter.mixin(Manager.extend(/** @lends atlas.dom.DomManager# */ {

    _id: 'dom',

    /**
     * The current DOM node.
     *
     * @type {HTMLElement}
     *
     * @private
     */
    _domNode: null,

    // TODO(bpstudds): What is the property for?
    _rendered: null,

    /**
     * Whether the current DOM node is visible.
     *
     * @type {Boolean}
     *
     * @private
     */
    _visible: null,

    _init: function() {
      this._super.apply(this, arguments);
      this._rendered = false;
      this._visible = false;
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
     * @param {Boolean} [show=false] - Whether the object should be displayed immediately in this
     *     new location.
     */
    setDom: function(elem, show) {
      var showNow = Setter.def(show, false);
      var newDomNode = typeof elem === 'string' ? document.getElementById(elem) : elem;

      if (!newDomNode) {
        throw new DeveloperError('DOM node not found: ' + elem);
      }

      // Add atlas specific class name to node.
      DomClass.add(newDomNode, DomManager.ATLAS_CSS_CLASS);

      // Move existing DOM if there is one.
      Log.debug('setting DOM node', elem);
      if (this._domNode !== null) {
        var curDomNode = this.getDomNode();
        Log.debug('moving atlas from', curDomNode, 'to', newDomNode);

        // Hide the current dom node
        DomClass.add(curDomNode, 'hidden');

        // Move the current DOM node's contents to the new one.
        var childDomNode = DomChild.getChildren(curDomNode);
        DomChild.addChildren(newDomNode, childDomNode);

        Log.debug('moved atlas into', newDomNode);
      }
      this._domNode = newDomNode;

      // Show in new location if required.
      if (showNow) {
        DomClass.remove(newDomNode, 'hidden');
      } else {
        DomClass.add(newDomNode, 'hidden');
      }
      this._visible = !!showNow;

      // Delegate populating the Atlas visualisation to concrete Atlas implementation.
      this.populateDom();
    },

    /**
     * @returns {HTMLElement} The current DOM node used by Atlas.
     */
    getDomNode: function() {
      return this._domNode;
    },

    /**
     * Calculates the relative (x, y) coordinate in the Atlas widget for the given global (x, y)
     * coordinate of an event.
     *
     * @param {Object} screenCoords - The absolute coordinates of the event to make relative.
     * @param {Number} screenCoords.x - The absolute x coordinate.
     * @param {Number} screenCoords.y - The absolute y coordinate.
     * @returns {Object} An object with relative x and y coordinates.
     */
    translateEventCoords: function(screenCoords) {
      var element = this.getDomNode();
      var style = window.getComputedStyle(element);
      var getCss = function(css) {
        return parseInt(style.getPropertyValue(css).replace('px', '')) || 0;
      };
      return {
        x: screenCoords.x - element.getBoundingClientRect().left - getCss('padding-left'),
        y: screenCoords.y - element.getBoundingClientRect().top - getCss('padding-top')
      };
    },

    getHeight: function() {
      return this.getDomNode().offsetHeight;
    },

    getWidth: function() {
      return this.getDomNode().offsetWidth;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Populates the current Atlas DOM element with the Altas visualisation.
     * @abstract
     */
    populateDom: function() {
      throw new DeveloperError('Can not call abstract method atlas/dom/DomManager.populateDom');
    },

    /**
     * Shows the Atlas DOM element.
     */
    show: function() {
      if (!this._visible) {
        DomClass.remove(this.getDomNode(), 'hidden');
        this._visible = true;
      }
    },

    /**
     * Hides the Atlas DOM element.
     */
    hide: function() {
      if (this._visible) {
        DomClass.add(this.getDomNode(), 'hidden');
        this._visible = false;
      }
    },

    /**
     * Toggles the visiblity of the Atlas DOM element.
     */
    toggleVisibility: function() {
      this._visible ? this.hide() : this.show();
    }

  }),
    // -------------------------------------------
    // STATICS
    // -------------------------------------------
    {
      ATLAS_CSS_CLASS: 'atlas'
    }
  ); // End class static definitions.

  return DomManager;

});
