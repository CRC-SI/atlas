define([
  'atlas/core/ItemStore',
  'atlas/dom/Overlay',
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/mixin'
], function (ItemStore, Overlay, Class, DeveloperError, mixin) {
  /**
   * @typedef atlas.visualisation.FeaturePopupFaculty
   * @ignore
   */
  var PopupFaculty;

  // Requirements:
  // Needs a DOM element to associate with.
  // Uses EventManager:
  //   On 'entity/popup/show' display the overlay
  //   On 'entity/popup/hide'
  //   On 'entity/deselect'
  //     - remove and destroy the overlay
  // Depends on Overlay

  // Interface:
  // The user should be able to specify:
  //   - the entityId of the associated entity (not required for functionality)
  //   - the CSS class of the popup container
  //   - the position of the popup as
  //     - (top || bottom || 0), (left || right || 0)
  //   - the size of the popup

  // The overlay should:
  //   - display the given html
  //   - have the given CSS class
  //   - be displayed in the given location, with the given size
  //   - not have an enable checkbox
  //   - have a close button


  PopupFaculty = Class.extend({

    /**
     * The Overlay being rendered by the popup.
     * @private
     * @type {atlas.core.ItemStore}
     */
    _overlays: null,

    /**
     * Dependency: The EventManager the PopupFaculty should register events with.
     * @private
     * @type {atlas.event.EventManager}
     */
    _eventManager: null,

    /**
     * The DOM node that popups are attached too.
     * @private
     * @type {HTMLElement}
     */
    _domNode: null,

    _init: function (args) {
      args = mixin({}, args);
      if (!args.parentDomNode) {
        throw new DeveloperError('PopupFaculty requires a parent DOM node to be specified.');
      } else if (typeof args.parentDomNode === 'string') {
        this._domNode = document.getElementById(args.parentDomNode);
      } else {
        this._domNode = args.parentDomNode;
      }
      if (!this._domNode || !this._domNode.outerHTML) {
        throw new Error('Error associating PopupFaculty with parent dom node "'
            + args.parentDomNode + '"');
      }

      if (args.eventManager && args.eventManager.addEventHandler) {
        this.bindEvents();
      }
    },

    /**
     * Performs necessary initialisation after PopupFaculty's dependencies have been
     * initialised.
     * @param args
     */
    setup: function (args) {
      if (this.has('eventManager')) {
        this.bindEvents();
      }
    },

    // -------------------------------------------
    // Popup management
    // -------------------------------------------

    /**
     * Generates a new Popup and shows it. The new popup is cached so it can be re-shown
     * if necessary.
     * @param args
     */
    show: function (args) {
      this._overlays = new ItemStore();

      args = mixin({
        cssClass: this.DEFAULT_CSS_CLASS,
        onRemove: 'close'
      }, args);
      if (!args.entityId) {throw new DeveloperError('Must specify entity ID associated with popup.');};
      if (!args.content) {throw new DeveloperError('Must content of popup.');};
      if (!args.position) {throw new DeveloperError('Must specify position of popup.');};

      overlay = new Overlay(args);
      this.setOverlay(args.entityId, overlay);
      return overlay;
    },

    _setOverlay: function (id, overlay) {
      this._overlays.add(id, overlay);
    }

  });

  PopupFaculty.DEFAULT_CSS_CLASS = 'atlas-popup';

  return PopupFaculty;

});
