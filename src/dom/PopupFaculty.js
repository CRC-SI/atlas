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
  // Uses EventManager:
  //   On 'entity/popup/show' display the overlay
  //   On 'entity/popup/hide'
  //   On 'entity/selection/change'
  //     - remove and destroy the overlay
  // Depends on Overlay
  // Needs a DOM element to with which to associate the overlays.

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

    _init: function () {
      // TODO(bpstudds): Work out this dependency injection business.
      // TODO(bpstudds): All the work occurs in setup, not when the object is initialised
    },

    /**
     * Performs necessary initialisation after PopupFaculty's dependencies have been
     * initialised.
     * @param args
     */
    setup: function (args) {
      // TODO(bpstudds): Work out this dependency injection business.
      // Resolve parent DOM node where popups will be renderd.
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

      // Resolve the event manager
      if (args.eventManager && args.eventManager.addEventHandler) {
        // TODO(bpstudds): Work out this dependency injection business.
        this._eventManager = args.eventManager;
      }

      // Bind events
      if (this._eventManager !== undefined/*this.has('eventManager')*/) {
        this.bindEvents();
      }
    },

    bindEvents: function () {
      // Define some event handlers.
      this.__eventHandlerDefs = [
        {
          source: 'extern',
          name: 'entity/popup/show',
          callback: function (args) {
            this.show(args);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'entity/popup/hide',
          callback: function (args) {
            this.hide(args);
          }.bind(this)
        }/*,
        {
          source: 'intern',
          name: 'entity/selection/change',
          callback: function (args) {
            args.ids.forEach(function () {
              this.hide({entityId: id});
            });
          }.bind(this)
        }*/
      ];
      // Register the event handlers with the event manager.
      this._eventHandlers = this._eventManager.addEventHandlers(this.__eventHandlerDefs);
    },

    // -------------------------------------------
    // Popup management
    // -------------------------------------------

    hide: function (args) {
      var overlay = this._overlays.get(args.entityId);
      overlay.remove();
      return overlay;
    },

    /**
     * Generates a new Popup and shows it. The new popup is cached so it can be re-shown
     * if necessary.
     * @param args
     */
    show: function (args) {
      this._overlays = new ItemStore();

      args = mixin({
        parent: this._domNode,
        cssClass: this.DEFAULT_CSS_CLASS,
        onRemove: function () {
          this.hide(args);
        }.bind(this)
      }, args);
      if (!args.entityId) {throw new DeveloperError('Must specify entity ID associated with popup.');};
      if (!args.content) {throw new DeveloperError('Must content of popup.');};
      if (!args.position) {throw new DeveloperError('Must specify position of popup.');};
      args.id = args.entityId;

      var overlay = new Overlay(args);
      this._setOverlay(args.entityId, overlay);
      return overlay;
    },

    _setOverlay: function (id, overlay) {
      overlay.getEntityId = function () { return id; };
      this._overlays.add(overlay);
    }

  });

  PopupFaculty.DEFAULT_CSS_CLASS = 'atlas-popup';

  return PopupFaculty;

});
