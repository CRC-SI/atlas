define([
  'atlas/dom/Overlay',
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  'jquery'
], function(Overlay, Class, Log, Setter, Feature, $) {

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

    // TODO(aramk) Add docs for these.

    _entity: null,

    _renderManager: null,

    _isExclusive: false,

    /**
     * The padding between the top of the {@link atlas.model.GeoEntity} and the bottom of this
     * {@link atlas.dom.Popup}.
     * @type {Number}
     */
    _yPadding: 20,

    _init: function(args) {
      var entity = args.entity;
      if (!entity) {
        throw new Error('GeoEntity needed for Popup.');
      }
      this._entity = entity;
      this._renderManager = args.renderManager;
      args = Setter.merge({
        id: Popup.ID_PREFIX + entity.getId()
      }, args);
      this._super(args);
      this.hide();
    },

    remove: function() {
      this._handles.forEach(function(handle) {
        handle.cancel();
      });
    },

    // -------------------------------------------
    // EVENTS
    // -------------------------------------------

    show: function() {
      this._super();
      this._update();
    },

    _render: function() {
      this._super();
      $(this.getDom()).addClass('popup');
      this._update();
    },

    _update: function() {
      this.setPosition(this.getPositionAboveEntity());
    },

    getPositionAboveEntity: function() {
      var entity = this._entity,
        renderManager = this._renderManager,
        $element = $(this.getDom()),
        width = $element.width(),
        height = $element.height(),
        centroid = entity.getCentroid();

      var elevation = entity.getElevation() + this.getEntityHeight(entity);
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
      return {
        left: screenCoord.x - width / 2,
        top: screenCoord.y - height
      };
    },

    getEntityHeight: function(entity) {
      var heightEntity;
      if (entity instanceof Feature) {
        heightEntity = entity.getForm(Feature.DisplayMode.EXTRUSION);
      }
      if (heightEntity && heightEntity.getHeight) {
        return heightEntity.getHeight();
      } else {
        return 0;
      }
    }

  }); // End class instance definition

  Setter.mixin(Popup, {

    ID_PREFIX: 'popup-'

  });

  return Popup;
});
