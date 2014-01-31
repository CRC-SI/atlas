define([
  'atlas/util/DeveloperError',
  'atlas/events/Event',
  // Base class
  'atlas/events/EventTarget'
], function (DeveloperError, Event, EventTarget) {

  /**
   * @classdesc A GeoEntity is an abstract class that represents an entity that
   * has a defined place in 3D space. A GeoEntity is a purely
   * abstract module that is extended by other atlas entities that specify
   * what is this particular GeoEntity represents (eg. a polygon or a line).
   *
   * @param {Number} id - The ID of this GeoEntity.
   * @param {Object} args - Both optional and required construction parameters.
   * @param {String} args.id - The ID of the GeoEntity.
   * @param {atlas.render.RenderManager} args.renderManager - The RenderManager object responsible for the GeoEntity.
   * @param {atlas.events.EventManager} args.eventManager - The EventManager object responsible for the Event system.
   * @param {atlas.events.EventTarget} [args.parent] - The parent EventTarget object of the GeoEntity.
   *
   * @see {atlas.model.Feature}
   * @see {atlas.model.Polygon}
   * @see {atlas.model.Network}
   * @see {atlas.model.Line}
   * @see {atlas.model.Vertex}
   * @see {atlas.model.PointHandle}
   *
   * @abstract
   * @extends atlas.events.EventTarget
   * @class atlas.model.GeoEntity
   */
  return EventTarget.extend(/** @lends atlas.model.GeoEntity# */ {
    /**
     * The ID of the GeoEntity
     * @type {String}
     * @protected
     */
    _id: null,

    /*
     * ID of the parent GeoEntity of the GeoEntity. Defined in EventTarget.
     * @name _parent
     * @type {String}
     * @protected
     */

    /**
     * IDs of the child GeoEntities of the GeoEntity.
     * @type {Array.<String>}
     * @protected
     */
    _children: null,

    /**
     * The RenderManager object for the GeoEntity.
     * @type {atlas.render.RenderManager}
     * @protected
     */
    _renderManager: null,

    /**
     * The geometric centroid of the GeoEntity.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _centroid: null,

    /**
     * The area of the GeoEntity.
     * @type {Number}
     * @protected
     */
    _area: 0,

    /**
     * Whether the GeoEntity is visible.
     * @type {Boolean}
     * @protected
     */
    _visible: false,

    /**
     * Whether the GeoEntity can be rendered.
     * @type {Boolean}
     * @protected
     */
    _renderable: false,

    /**
     * Geometry data for the GeoEntity that allows it to be rendered.
     * @type {Object}
     * @protected
     */
    _geometry: null,

    /**
     * Appearance data to modified how the GeoEntity is rendered.
     * @type {Object}
     * @protected
     */
    _appearance: null,

    _init: function (id, args) {
      // Call the superclass' (EventTarget) constructor.
      this._super(args.eventManager, args.parent);

      if (typeof id === 'object') {
        args = id;
        id = args.id;
      }
      if (id === undefined || typeof id === 'object') {
        throw new DeveloperError('Can not create instance of GeoEntity without an ID');
      }
      this._id = id.toString();
      this._renderManager = args.renderManager;
      this._eventManager = args.eventManager;
    },

/////
// GETTERS AND SETTERS

    /**
     * @returns {String} The ID of the GeoEntity.
     */
    getId: function() {
      return this._id;
    },

    /**
     * @returns {Number} The centroid of the GeoEntity.
     * @abstract
     */
    getCentroid: function() {
      throw new DeveloperError('Can not call abstract method of GeoEntity');
    },

    /**
     * @returns {Number} The are of the GeoEntity's footprint, if applicable.
     * @abstract
     */
    getArea: function() {
      throw new DeveloperError('Can not call abstract method of GeoEntity');
    },

    /**
     * @returns {Boolean} Whether the GeoEntity is currently visible.
     */
    isVisible: function() {
      return this._visible;
    },

    /**
     * @returns {Boolean} Whether the GeoEntity is currently renderable.
     */
    isRenderable: function () {
      return this._renderable;
    },

    /**
     * Sets whether the GeoEntity is ready to be rendered.
     * @param {Boolean} [isRenderable=true] - If true, sets the Polygon to be renderable otherwise sets it to be 'un-renderable'.
     */
    setRenderable: function (isRenderable) {

      if (isRenderable !== undefined) {
        this._renderable = isRenderable;
      } else {
        this._renderable = true;
      }
    },

    /**
     * Returns the geometry data for the GeoEntity so it can be rendered.
     * The <code>build</code> method should be called to construct this geometry
     * data.
     * @returns {Object} The geometry data.
     */
    getGeometry: function() {
        return this._geometry;
    },

    /**
     * Returns the appearance data for the GeoEntity so it can be rendered.
     * The <code>build</code> method should be called to construct this appearance
     * data.
     * @returns {Object} The appearance data.
     */
    getAppearance: function() {
        return this._appearance;
    },

//////
// MODIFYING

    /**
     * Translates the GeoEntity by the given vector.
     * @param {atlas.model.Vertex} translation - The vector to move the GeoEntity by.
     * @param {Number} translation.x - The change in latitude in decimal degrees to apply.
     * @param {Number} translation.y - The change in longitude in decimal degrees apply.
     * @param {Number} translation.z - The change in elevation in metres to apply.
     *
     * @abstract
     */
    translate: function(translation) {},

    /**
     * Scales the GeoEntity by the given vector. This scaling can be uniform in all axis or non-uniform.
     * A scaling factor of <code>1</code> has no effect. Factors lower or higher than <code>1</code>
     * scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as big and
     * <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the GeoEntity by.
     * @param {Number} scale.x - The scale along the <code>x</code> axis of the GeoEntity.
     * @param {Number} scale.y - The scale along the <code>y</code> axis of the GeoEntity.
     * @param {Number} scale.z - The scale along the <code>z</code> axis of the GeoEntity.
     *
     * @abstract
     */
    scale: function(scale) {},

    /**
     * Rotates the GeoEntity by the given vector.
     * @param {atlas.model.Vertex} rotation - The vector to rotate the GeoEntity by.
     * @param {Number} rotation.x - The rotation about the <code>x</code> axis in degrees, negative
     *      rotates clockwise, positive rotates counterclockwise.
     * @param {Number} rotation.y - The rotation about the <code>y</code> axis in degrees, negative
     *        rotates clockwise, positive rotates counterclockwise.
     * @param {Number} rotation.z - The rotation about the <code>z</code> axis in degrees, negative
     *      rotates clockwise, positive rotates counterclockwise.
     *
     * @abstract
     */
    rotate: function (rotation) {},

    /**
     * Function to build the GeoEntity so it can be rendered.
     * @abstract
     */
    _build: function() {
      throw new DeveloperError('Can not call abstract method of GeoEntity.');
    },

    /**
     * Function to remove the GeoEntity from rendering. This function should
     * be overridden on subclasses to accomplish any cleanup that
     * may be required.
     */
    remove: function () {
      this._eventManager.dispatchEvent(new Event(new EventTarget(),
        'entity/remove', {
          id: this.getId()
        }));
    },

    /**
     * Shows the GeoEntity in the current scene.
     * @abstract
     */
    show: function () {
      throw new DeveloperError('Can not call abstract method of GeoEntity');
    },

    /**
     * Hides the GeoEntity from the current scene.
     * @abstract
     */
    hide: function () {
      throw new DeveloperError('Can not call abstract method of GeoEntity');
    },

    /**
     * Toggles the visibility of the GeoEntity.
     */
    toggleVisibility: function () {
      if (this.isVisible()) {
        this.hide();
      } else {
        this.show();
      }
    },

//////
// BEHAVIOUR

    /**
     * Handles the GeoEntities behaviour when it is selected.
     * @abstract
     */
    onSelect: function () {},

    /**
     * Handles the GeoEntities behaviour when it is deselected.
     * @abstract
     */
    onDeselect: function () {},

    /**
     * Enables 'editing' of the GeoEntity using keyboard input.
     */
    onEnableEditing: function () {
      // TODO(bpstudds): Move this functionality to an EditManager module.
      this._editEventHandler = this._eventManager.addEventHandler('intern', 'input/keypress', function (args) {
        if (args.modifiers.length === 0) {
          // TODO(bpstudds): Replace 'magic numbers' with constants. Probably should update keycode.js library for this.
          switch (args.key) {
            case 45: // underscore/minus beside backspace key
              this.scale({x: 0.95, y: 0.95, z: 0.95});
              break;
            case 61: // equals/plus beside backspace key
              this.scale({x: 1.05, y: 1.05, z: 1.05});
              break;
            case 37: // left
              this.rotate({x: 0, y: 0, z:5});
              break;
            case 39: // right
              this.rotate({x: 0, y: 0, z:-5});
              break;
          }
        }
      }.bind(this));
      console.debug('onEnableEditing called on', this.getId(), 'with event id', this._editEventHandler.id);
    },

    /**
     * Disables editing of the GeoEntity.
     */
    onDisableEditing: function () {
      this._editEventHandler.cancel();
    }
  });
});
