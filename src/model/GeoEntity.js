define([
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  'atlas/events/Event',
  'atlas/model/Colour',
  'atlas/model/Style',
  // Base class
  'atlas/events/EventTarget'
], function (DeveloperError, mixin, Event, Colour, Style, EventTarget) {

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
   var GeoEntity = EventTarget.extend(/** @lends atlas.model.GeoEntity# */ {
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
    _childrenIds: null,

    /**
     * Array of references to the child GeoEntities.
     * @type {Array.<atlas.model.GeoEntity}
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
     * The EntityManager for the GeoEntity.
     * @type {atlas.entity.EntityManager}
     * @protected
     */
    _entityManager: null,

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
    _area: null,

    /**
     * Whether the GeoEntity is visible.
     * @type {Boolean}
     * @protected
     */
    _visible: null,

    /**
     * Whether the GeoEntity can be rendered.
     * @type {Boolean}
     * @protected
     */
    _renderable: null,

    /**
     * Components of the GeoEntity which have been changed and need to be updated when
     * the GeoEntity is re-rendered.
     * @type {Object.<String, Boolean>}
     * @protected
     */
    _dirty: null,

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

    /**
     * The style of the GeoEntity when rendered.
     * @type {atlas.model.Style}
     * @protected
     */
    _style: null,

    /**
     * Whether the GeoEntity is selected.
     * @type {Boolean}
     */
    _selected: false,

    _init: function (id, args) {
      // Call the superclass' (EventTarget) constructor.
      this._super(args.eventManager, args.parent);
      this.clean();
      this.setDirty('entity');

      if (typeof id === 'object') {
        args = id;
        id = args.id;
      }
      if (id === undefined || typeof id === 'object') {
        throw new DeveloperError('Can not create instance of GeoEntity without an ID');
      }
      if (args.style === undefined) {
        this._style = GeoEntity.DEFAULT_STYLE;
      } else {
        this._style = args.style;
      }
      this._id = id.toString();
      this._childrenIds = args.childrenIds || [];
      this._renderManager = args.renderManager;
      this._eventManager = args.eventManager;
      this._entityManager = args.entityManager;
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

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

    getChildren: function() {
      // TODO(bpstudds): Adding children and removing children needs support.
      if (this._children !== null) { return this._children; }
      this._children = this._entityManager.getByIds(this._childrenIds);
      return this._children;
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
     * Sets a particular component of the GeoEntity to dirty, which affects how the GeoEntity is
     * rendered.
     * @param component
     */
    setDirty: function(component) {
      if (typeof component === 'string') {
        this._dirty[component] = true;
      } else if (typeof component === 'object') {
        var components = component;
        if (!(component instanceof Array)) {
          components = Object.keys(component);
        }
        components.forEach(function(key) {
          this._dirty[key] = true;
        }, this)
      }
    },

    /**
     *
     * @param {String} [component] A specific component to check.
     * @returns {Boolean} Whether the given <code>component</code> is dirty, or if
     * <code>component</code> is not given, the GeoEntity as a whole.
     */
    isDirty: function(component) {
      if (component === undefined) { return Object.keys(this._dirty).length > 0; }
      return component in this._dirty;
    },

    /**
     * Clears all of the <code>_dirty</code> flags on the GeoEntity, signifying that the
     * GeoEntity is currently correctly rendered.
     */
    clean: function() {
      this._dirty = {};
    },

    /**
     * Sets the Style for the GeoEntity.
     * @param {atlas.model.Style} style - The new style to use.
     * @returns {atlas.model.Style} The old style, or null if it was not changed.
     */
    setStyle: function(style) {
      if (this._style === style) { return null; }
      this.setDirty('style');

      // Only change style if the new style is different so _previousStyle isn't clobbered.
      this._previousStyle = this._style;
      this._style = style;
      return this._previousStyle;
    },

    /**
     * @returns {atlas.model.Style} The style of the GeoEntity.
     */
    getStyle: function () {
      return this._style;
    },

    /**
     * @returns {Boolean} Whether the GeoEntity is currently renderable.
     */
    isRenderable: function () {
      return Object.keys(this._dirty).length === 0;
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

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Modifies specific components of the GeoEntity's style.
     * @param {Object} newStyle - The new values for the Style components.
     * @param {atlas.model.Colour} [newStyle.fillColour] - The new fill colour.
     * @param {atlas.model.Colour} [newStyle.borderColour] - The new border colour.
     * @param {Number} [newStyle.borderWidth] - The new border width colour.
     * @returns {Object} A mapping of parameters that have been changed to their old value.
     */
    modifyStyle: function (newStyle) {
      if (Object.keys(newStyle).length <= 0) { return {}; }

      this.setDirty('style');
      var oldStyle = {};
      // Work out what's changing
      newStyle.fillColour && (oldStyle.fillColour = this._style.getFillColour());
      newStyle.borderColour && (oldStyle.borderColour = this._style.getBorderColour());
      newStyle.borderWidth && (oldStyle.borderWidth = this._style.getBorderWidth());
      // Generate new style based on what's changed.
      var newStyle = mixin({
        fillColour: this._style.getFillColour(),
        borderColour: this._style.getBorderColour(),
        borderWidth: this._style.getBorderWidth()
      }, newStyle);
      this._style = new Style(newStyle);
      return oldStyle;
    },

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
    rotate: function (rotation) {
      throw new DeveloperError('Can not call abstract method of GeoEntity.');
    },

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
     * @returns {Boolean} Whether the GeoEntity is shown.
     * @abstract
     */
    show: function () {
      throw new DeveloperError('Can not call abstract method of GeoEntity');
    },

    /**
     * Hides the GeoEntity from the current scene.
     * @returns {Boolean} Whether the GeoEntity is hidden.
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

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

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
      this._editEventHandler = this._eventManager.addEventHandler('intern', 'input/keydown',
          function (args) {
            // TODO(bpstudds): Replace 'magic numbers' with constants. Probably should update keycode.js library for this.
            if (!args.modifiers.shiftKey && !args.modifiers.metaKey &&
                !args.modifiers.altKey && !args.modifiers.ctrlKey) {
              switch (args.key) {
                case 95: // underscore/minus beside backspace key
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
          }.bind(this)
      );
    },

    /**
     * Disables editing of the GeoEntity.
     */
    onDisableEditing: function () {
      this._editEventHandler && this._editEventHandler.cancel();
    }
  })

  // -------------------------------------------------
  // Statics
  // -------------------------------------------------
  GeoEntity.DEFAULT_STYLE = new Style(Colour.GREEN, Colour.GREEN, 5)


  return GeoEntity;
});
