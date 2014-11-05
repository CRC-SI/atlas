define([
  'atlas/dom/Overlay',
  'atlas/dom/DomUtil',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class'
], function(Overlay, DomUtil, Log, Setter, Class) {

  /**
   * @typedef atlas.dom.Popup
   * @ignore
   */
  var Popup;

  /**
   * @classdesc A popup which appears above {@link atlas.model.GeoEntity} objects.
   *
   * @param {Object} args - Arguments to the constructor.
   * @param {atlas.model.GeoEntity} args.entity
   * @param {atlas.render.RenderManager} args.renderManager
   *
   * @class atlas.dom.Popup
   * @extends {atlas.dom.Overlay}
   */
  Popup = Overlay.extend( /** @lends atlas.dom.Popup# */ {

    _entity: null,

    _renderManager: null,

    _handles: null,

    _isExclusive: false,

    /**
     * The padding between the top of the {@link atlas.model.GeoEntity} and the bottom of this
     * {@link atlas.dom.Popup}.
     * @type {Number}
     */
    _yPadding: 20,

    _init: function(args) {
      args = Setter.merge({
      }, args);
      this._super();
      this._entity = args.entity;
      this._renderManager = args.renderManager;
      this._handles = [];
      this._bindEvents();
    },

    getId: function() {
      return Popup.ID_PREFIX + this._entity.getId();
    },

    remove: function() {
      this._handles.forEach(function(handle) {
        handle.cancel();
      });
    },

    // -------------------------------------------
    // EVENTS
    // -------------------------------------------

    _bindEvents: function() {
      var entity = this._entity;
      this._handles.push(entity.addEventListener('entity/select', this._show.bind(this)));
      this._handles.push(entity.addEventListener('entity/deselect', this._hide.bind(this)));
    },

    _show: function() {
      var entity = this._entity,
        renderManager = this._renderManager;
      var centroid = entity.getCentroid();
      var elevation = entity.getElevation() + entity.getHeight();
      // Find all points from the bounding box and convert to screen coordinates. Use this to
      // ensure the overlay doesn't overlap the entity.
      var bBox = entity.getBoundingBox();
      var cornerYs = [];
      bBox.getCorners().forEach(function(corner) {
        corner.elevation = elevation;
        cornerYs.push(renderManager.screenCoordsFromGeoPoint(corner).y);
      });
      var minY = Math.min.apply(null, cornerYs);
      var screenCoord = renderManager.screenCoordsFromGeoPoint(centroid);
      console.log('centroid screenCoord', screenCoord);
      screenCoord.y = minY - this._yPadding;
      console.log('new screenCoord', screenCoord);
      var position = {
        left: screenCoord.x - this.getWidth() / 2,
        top: screenCoord.y - this.getHeight()
      };
      console.log('position', position);
      this.setPosition(position);
      // TODO(aramk) Put this logic in the manager.
      // currentOverlay && currentOverlay.remove();
      // currentOverlay = new Overlay({
      //   content: 'Overlay',
      //   parent: atlasDomNode,
      //   position: position,
      //   dimensions: {
      //     height: height,
      //     width: width
      //   }
      // });
      // DomUtil.constrainPositionWithin(currentOverlay.getDom(), atlasDomNode);
    },

    _hide: function() {
      this.exclusive;
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

  }); // End class instance definition

  Setter.mixin(Popup, {

    ID_PREFIX: 'popup-'

  });

  return Popup;
});