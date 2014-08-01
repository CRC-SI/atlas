define([
  'atlas/core/ItemStore',
  'atlas/events/Event',
  // Base class
  'atlas/events/EventTarget',
  'atlas/lib/utility/Setter',
  'atlas/model/Colour',
  'atlas/model/Style',
  'atlas/util/DeveloperError'
], function(ItemStore, Event, EventTarget, Setter, Colour, Style, DeveloperError) {

  /**
   * @typedef atlas.model.GeoEntity
   * @ignore
   */
  var GeoEntity;

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
   *
   * @abstract
   * @extends atlas.events.EventTarget
   * @class atlas.model.GeoEntity
   */
  GeoEntity = Setter.mixin(EventTarget.extend(/** @lends atlas.model.GeoEntity# */ {
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
     * @type {Array.<atlas.model.GeoEntity>}
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
     * The centroid of the entity.
     * @type {atlas.model.GeoPoint}
     * @protected
     */
    _centroid: null,

    /**
     * The area of the GeoEntity in metres squared.
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
     * The style of the GeoEntity when before a change in style (e.g. during selection).
     * @type {atlas.model.Style}
     * @protected
     */
    _previousStyle: null,

    /**
     * Whether the GeoEntity is selected.
     * @type {Boolean}
     */
    _selected: false,

    /**
     * The editing {@link atlas.model.Handle}
     * @type {atlas.core.ItemStore}
     */
    _handles: null,

    _init: function(id, args) {
      if (typeof id === 'object') {
        args = id;
        id = args.id;
      } else {
        args = args || {};
      }
      id = id.toString();
      // Call the superclass' (EventTarget) constructor.
      this._super(args.eventManager, args.parent);
      this.clean();
      this.setDirty('entity');

      if (!id || typeof id === 'object') {
        throw new DeveloperError('Can not create instance of GeoEntity without an ID');
      }
      this._id = id.toString();
      this._childrenIds = args.childrenIds || [];
      this._renderManager = args.renderManager;
      this._eventManager = args.eventManager;
      this._entityManager = args.entityManager;
      this._entityManager && this._entityManager.add(this.getId(), this);
      this.setStyle(args.style || GeoEntity.getDefaultStyle());
      this._handles = new ItemStore();
    },

    // TODO(aramk) Use better dependency injection.
    /**
     * @param args - Any object used for construction.
     * @returns {Object} - The given object with manager dependencies added.
     * @protected
     */
    _bindDependencies: function(args) {
      return Setter.mixin(args, {
        renderManager: this._renderManager,
        eventManager: this._eventManager,
        entityManager: this._entityManager
      });
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
     * @returns {atlas.model.GeoPoint} The centroid of the GeoEntity.
     * @abstract
     */
    getCentroid: function() {
      return this._centroid && this._centroid.clone();
    },

    /**
     * @returns {Array.<atlas.model.Vertex>}
     * @abstract
     */
    getVertices: function() {
      throw new DeveloperError('Can not call abstract method "getVertices" of GeoEntity');
    },

    getChildren: function() {
      // TODO(bpstudds): Adding children and removing children needs support.
      if (this._children !== null) {
        return this._children;
      }
      this._children = this._entityManager.getByIds(this._childrenIds);
      return this._children;
    },

    /**
     * @returns {Number} The are of the GeoEntity's footprint, if applicable.
     * @abstract
     */
    getArea: function() {
      throw new DeveloperError('Can not call abstract method "getArea" of GeoEntity');
    },

    /**
     * @returns {Array.<atlas.model.Handle>} An array of Handles used to edit the GeoEntity.
     */
    createHandles: function() {
      throw new DeveloperError('Can not call abstract method "createHandles" of GeoEntity');
    },

    /**
     * @param {atlas.model.Vertex} vertex
     * @returns {atlas.model.Handle}
     */
    createHandle: function(vertex) {
      throw new DeveloperError('Can not call abstract method "createHandle" of GeoEntity');
    },

    /**
     * @returns {Array.<atlas.model.Handle>}
     */
    addHandles: function() {
      var handles = this.createHandles();
      this.setHandles(handles);
      return handles;
    },

    /**
     * @param {atlas.model.Handle} handle
     * @returns {atlas.model.Handle}
     */
    addHandle: function(handle) {
      this._handles.add(handle);
      return handle;
    },

    /**
     * @param {Array.<atlas.model.Handle>} handles
     */
    setHandles: function(handles) {
      this.clearHandles();
      this._handles.addArray(handles);
    },

    getHandles: function() {
      return this._handles;
    },

    clearHandles: function() {
      this._handles.purge();
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
     * Set a particular component to be clean, or cleans the GeoEntity entirely.
     * @param {string} [component] - The component to clean, if absent or null the entire GeoEntity
     *     is marked clean.
     */
    setClean: function(component) {
      if (!component) {
        delete this._dirty[component];
      } else {
        this.clean();
      }
    },

    /**
     * @param {String} [component] A specific component to check.
     * @returns {Boolean} Whether the given <code>component</code> is dirty, or if
     * <code>component</code> is not given, the GeoEntity as a whole.
     */
    isDirty: function(component) {
      if (component === undefined) {
        return Object.keys(this._dirty).length > 0;
      }
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
      if (this._style === style) {
        return null;
      }
      this.setDirty('style');

      // Only change style if the new style is different so _previousStyle isn't clobbered.
      this._previousStyle = this._style;
      this._style = style;
      return this._previousStyle;
    },

    /**
     * @returns {atlas.model.Style}
     */
    getStyle: function() {
      return this._style;
    },

    /**
     * @returns {atlas.model.Style}
     */
    getPreviousStyle: function() {
      return this._previousStyle;
    },

    /**
     * @returns {Boolean} Whether the GeoEntity is currently renderable.
     */
    isRenderable: function() {
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
    modifyStyle: function(newStyle) {
      if (Object.keys(newStyle).length <= 0) {
        return {};
      }

      this.setDirty('style');
      var oldStyle = {};
      // Work out what's changing
      newStyle.fillColour && (oldStyle.fillColour = this._style.getFillColour());
      newStyle.borderColour && (oldStyle.borderColour = this._style.getBorderColour());
      newStyle.borderWidth && (oldStyle.borderWidth = this._style.getBorderWidth());
      // Generate new style based on what's changed.
      newStyle = Setter.mixin({
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
    translate: function(translation) {
      throw new DeveloperError('Can not call abstract method "translate" of GeoEntity');
    },

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
    scale: function(scale) {
      throw new DeveloperError('Can not call abstract method "scale" of GeoEntity');
    },

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
    rotate: function(rotation) {
      throw new DeveloperError('Can not call abstract method "rotate" of GeoEntity');
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
    remove: function() {
      // TODO(aramk) We should try to keep consistent with these - either all entities have
      // references to managers or none do - otherwise we could have discrepancies in the entity
      // manger like a removed entity still being referenced.
      this._entityManager && this._entityManager.remove(this._id);
      this._eventManager && this._eventManager.dispatchEvent(new Event(new EventTarget(),
          'entity/remove', {
            id: this.getId()
          }));
    },

    /**
     * Shows the GeoEntity in the current scene.
     * @returns {Boolean} Whether the GeoEntity is shown.
     * @abstract
     */
    show: function() {
      throw new DeveloperError('Can not call abstract method "show" of GeoEntity');
    },

    /**
     * Hides the GeoEntity from the current scene.
     * @returns {Boolean} Whether the GeoEntity is hidden.
     * @abstract
     */
    hide: function() {
      throw new DeveloperError('Can not call abstract method "hide" of GeoEntity');
    },

    /**
     * Toggles the visibility of the GeoEntity.
     */
    toggleVisibility: function() {
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
     */
    onSelect: function() {
      this._selected = true;
      this.setStyle(GeoEntity.getSelectedStyle());
    },

    /**
     * Handles the GeoEntities behaviour when it is deselected.
     */
    onDeselect: function() {
      this._selected = false;
      this.setStyle(this.getPreviousStyle());
    },

    /**
     * Enables 'editing' of the GeoEntity using keyboard input.
     */
    onEnableEditing: function() {
      // TODO(bpstudds): Move this functionality to an EditManager module.
//      this._editEventHandler = this._eventManager.addEventHandler('intern', 'input/keydown',
//          function(args) {
//            // TODO(bpstudds): Replace 'magic numbers' with constants. Probably should update keycode.js library for this.
//            if (!args.modifiers.shiftKey && !args.modifiers.metaKey && !args.modifiers.altKey &&
//                !args.modifiers.ctrlKey) {
//              switch (args.key) {
//                case 95: // underscore/minus beside backspace key
//                  this.scale({x: 0.95, y: 0.95, z: 0.95});
//                  break;
//                case 61: // equals/plus beside backspace key
//                  this.scale({x: 1.05, y: 1.05, z: 1.05});
//                  break;
//                case 37: // left
//                  this.rotate({x: 0, y: 0, z: 5});
//                  break;
//                case 39: // right
//                  this.rotate({x: 0, y: 0, z: -5});
//                  break;
//              }
//            }
//          }.bind(this)
//      );
//      this._editingHandles = this.getEditingHandles();
    },

    /**
     * Disables editing of the GeoEntity.
     */
    onDisableEditing: function() {
      // TODO(bpstudds): Move this functionality to an EditManager module.
//      this._editEventHandler && this._editEventHandler.cancel();
//      this._editingHandles.forEach(function(handle) {
//        handle.remove();
//      })
//      this._editingHandles = [];
    }

  }), {

    // -------------------------------------------------
    // Statics
    // -------------------------------------------------

    /**
     * The default style of the entity.
     * @returns {atlas.model.Style}
     */
    getDefaultStyle: function() {
      return new Style({fillColour: Colour.GREEN});
    },

    /**
     * The style of the entity during selection.
     * @returns {atlas.model.Style}
     */
    getSelectedStyle: function() {
      return new Style({fillColour: Colour.RED});
    }

  });

  return GeoEntity;
});
