define([
  'atlas/core/ItemStore',
  'atlas/core/Manager',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types'
], function(ItemStore, Manager, Setter, Types) {

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

    _init: function(managers, options) {
      this._super(managers);
      this._overlays = {};
    },

    setup: function() {
      this._bindEvents();
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
              var id = this._counter + "-overlay";
              this._overlays[id] = overlay;
              this._counter++;
              var trackArgs = {
                id: id,
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
            var popupArgs = {
              entity: args.entities[0],
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
