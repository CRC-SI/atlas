define([
  'atlas/core/ItemStore',
  'atlas/core/Manager',
  'atlas/dom/Overlay',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'jquery'
], function(ItemStore, Manager, Overlay, Setter, Types, $) {

  var OverlayManager;

  OverlayManager = Manager.extend(/** @lends atlas.dom.OverlayManager# */ {

    _id: 'overlay',

    /**
     * Mapping of IDs to an overlay
     */
    _overlays: null,

    /**
     * Counter used to create a unique ID for each overlay
     */
    _counter: 0,

    /**
     * The DOM element for storing overlays.
     * @type {HTMLElement}
     */
    _overlayDom: null,

    _init: function(managers, options) {
      this._super(managers);
      this._overlays = {};
    },

    setup: function() {
      var $domNode = $(this._managers.dom.getDomNode());
      var $overlays = $('<div class="overlays"></div>');
      this._overlayDom = $overlays[0];
      $domNode.prepend($overlays);
    },

    /**
     * @param {Object} [args] - The construction arguments for the Overlay.
     * @param {Boolean} [args.contained=false] - Whether the overlay should be positioned in the
     *     overlays container. If false, it is positioned in the Atlas dom node.
     * @return {atls.model.Overlay}
     */
    createOverlay: function(args) {
      var parentDomNode;
      if (args && args.contained) {
        parentDomNode = this._overlayDom;
      } else {
        parentDomNode = this._managers.dom.getDomNode();
      }
      args = Setter.merge({parent: parentDomNode}, args);
      return new Overlay(args);
    },

    _bindEvents: function() {
      var handlers = [
        {
          source: 'intern',
          name: 'overlay/created',
          callback: function(args) {
            var overlay = args.overlay;
            var scenePosition = overlay.getScenePosition();
            if (scenePosition) {
              this._overlays[overlay.getId()] = overlay;
              overlay.getDom().id = overlay.getId();
              var trackArgs = {
                id: overlay.getId(),
                position: scenePosition
              };
              this._managers.event.handleExternalEvent('overlay/track', trackArgs);
            }
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'input/leftclick',
          callback: function(args) {
            var selectedEntities = this._managers.entity.getEntitiesFromArgs(args);
            if (selectedEntities.length == 0) {
              return;
            }

            var id = this._counter + "-overlay";
            this._counter++;

            var popupArgs = {
              entity: selectedEntities[0],
              id: id,
              position: args.position,
              scenePosition: args.sceneposition,
              title: ' ',
              content: ' '
            };
            this._managers.event.handleExternalEvent('popup/create', popupArgs);

          }.bind(this)
        },
        {
          source: 'extern',
          name: 'overlay/update',
          callback: function(args) {
            var overlay = this._overlays[args.id];
            if (!args.visible) {
              overlay.hide();
            } else if (!overlay.isVisible()) {
              overlay.show();
            }
            var parentHeight = overlay.getParentElement().offsetHeight;
            var screenPosition = {left: args.position.x, top: parentHeight - args.position.y};
            overlay.setPosition(screenPosition);
          }.bind(this)
        },
        {
          source: 'intern',
          name: 'overlay/remove',
          callback: function(args) {
            //TODO(Shady) stub
            var untrackArgs = {
              id: 'stub'
            }
            this._managers.event.handleExternalEvent('overlay/untrack', untrackArgs);
          }
        }
      ];
      this._managers.event.addEventHandlers(handlers);
    }

  });

  return OverlayManager;
});
