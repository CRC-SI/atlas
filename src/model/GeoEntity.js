define([
  'atlas/core/ItemStore',
  'atlas/events/Event',
  // Base class
  'atlas/events/EventTarget',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/model/Colour',
  'atlas/model/Style',
  'atlas/util/DeveloperError',
  'atlas/util/WKT'
], function(ItemStore, Event, EventTarget, Setter, Types, Colour, Style, DeveloperError, WKT) {

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
   * @see {atlas.model.GeoPoint}
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
     * The elevation of the base of the GeoEntity.
     * @type {Number}
     * @protected
     */
    _elevation: 0,

    /**
     * The scale of the GeoEntity with each component in the range [0,1] and 1 by default.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _scale: null,

    /**
     * The counter-clockwise rotation of the GeoEntity in degrees. By default all components are
     * 0.
     * @type {atlas.model.Vertex}
     * @protected
     */
    _rotation: null,

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
     * The style of the GeoEntity before it was selected.
     * @type {atlas.model.Style}
     * @protected
     */
    _preSelectStyle: null,

    /**
     * Whether the GeoEntity is selected.
     * @type {Boolean}
     */
    _selected: false,

    /**
     * {@link atlas.model.Handle} objects used for editing.
     * @type {atlas.core.ItemStore}
     */
    _handles: null,

    /**
     * The {@link atlas.model.Handle} on the entity itself.
     */
    _entityHandle: null,

    /**
     * Event handles which are bound to the entity and should be removed with it.
     * @type {Array.<EventListener>}
     */
    _eventHandles: null,

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
      this._renderManager = args.renderManager;
      this._eventManager = args.eventManager;
      this._entityManager = args.entityManager;
      this._entityManager && this._entityManager.add(this.getId(), this);
      this.setStyle(args.style || GeoEntity.getDefaultStyle());
      this._handles = new ItemStore();
      this._eventHandles = [];
      // TODO(aramk) This doesn't actually show - should call setVisibility(), but that means all
      // subclass constructors should have completely set up their properties. We would need a
      // method called setUp() which we call here and subclasses override to ensure all properties
      // (e.g. vertices) are set and _build() can safely be called from here.
      this._visible = Setter.def(args.show, false);
      this._rotation = new Vertex(0, 0, 0);
      this._scale = new Vertex(1, 1, 1);
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

    getCentroid: function() {
      if (!this._centroid) {
        this._centroid = this._calcCentroid();
      }
      return this._centroid && this._centroid.clone();
    },

    /**
     * Translates the GeoEntity so that its centroid is the one given.
     * @param {atlas.model.GeoPoint} centroid
     */
    setCentroid: function(centroid) {
      var oldCentroid = this.getCentroid();
      if (oldCentroid) {
        var diff = centroid.subtract(oldCentroid);
        this.translate(diff);
      }
    },

    _calcCentroid: function() {
      var wkt = WKT.getInstance();
      return wkt.vertexFromOpenLayersPoint(this.getOpenLayersGeometry().getCentroid());
    },

    /**
     * @returns {Number} The area of the GeoEntity in metres squared, if applicable.
     */
    getArea: function() {
      if (Types.isNullOrUndefined(this._area)) {
        this._area = this._calcArea();
      }
      return this._area;
    },

    _calcArea: function() {
      return this.getOpenLayersGeometry().getGeodesicArea();
    },

    /**
     * @returns {OpenLayers.Geometry}
     * @abstract
     */
    getOpenLayersGeometry: function() {
      throw new DeveloperError('Can not call abstract method "getOpenLayersGeometry" of GeoEntity');
    },

    /**
     * Set the elevation of the base of the GeoEntity.
     * @param {Number} elevation - The elevation of the base of the GeoEntity.
     */
    setElevation: function(elevation) {
      if (typeof elevation === 'number' && this._elevation !== elevation) {
        this._elevation = elevation;
        this.setDirty('model');
      }
    },

    /**
     * @returns {Number} The elevation of the base of the GeoEntity.
     */
    getElevation: function() {
      return this._elevation;
    },

    /**
     * @returns {Array.<atlas.model.Handle>} An array of Handles used to edit the GeoEntity.
     */
    createHandles: function() {
      throw new DeveloperError('Can not call abstract method "createHandles" of GeoEntity');
    },

    /**
     * @param {atlas.model.GeoPoint} [vertex] - The vertex in the entity to associate with the
     * {@link atlas.model.Handle}. If not provided, the centroid of the entity should be used.
     * @param {Number} [index] - The index of the vertex in this object. Only necessary if a vertex
     * is provided.
     * @returns {atlas.model.GeoPoint}
     */
    createHandle: function(vertex, index) {
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

    getEntityHandle: function() {
      return this._entityHandle;
    },

    setEntityHandle: function(entityHandle) {
      this._entityHandle = entityHandle;
    },

    clearHandles: function() {
      this._handles.purge();
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
      delete this._dirty[component];
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
      var previousStyle = this.getStyle();
      if (previousStyle && previousStyle.equals(style)) {
        return null;
      }
      this.setDirty('style');
      this._style = style;
      var isVisible = this.isVisible();
      this._update();
      this._updateVisibility(isVisible);
      return previousStyle;
    },

    /**
     * @returns {atlas.model.Style}
     */
    getStyle: function() {
      return this._style;
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
    // TODO(aramk) This is quite complicated - perhaps rely only on setStyle.
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
     * @param {atlas.model.GeoPoint} translation - The amount to move the GeoEntity in latitude,
     * longitude and elevation.
     */
    translate: function(translation) {
      this._onTransform();
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
     */
    scale: function(scale) {
      this._onTransform();
    },

    /**
     * @param {atlas.model.Vertex} scale
     */
    setScale: function(scale) {
      this.scale(scale.componentwiseDivide(this.getScale()));
    },

    /**
     * @returns {atlas.model.Vertex}
     */
    getScale: function() {
      return this._scale;
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
     */
    rotate: function(rotation) {
      this._onTransform();
    },

    /**
     * @param {atlas.model.Vertex} rotation
     */
    setRotation: function(rotation) {
      var diff = rotation.subtract(this.getRotation());
      this.rotate(diff);
    },

    /**
     * @returns {atlas.model.Vertex}
     */
    getRotation: function() {
      return this._rotation;
    },

    /**
     * Called by transform methods. Override to prevent default behaviour of rebuilding the model.
     * @protected
     */
    _onTransform: function () {
      this.setDirty('model');
      this._update();
    },

    /**
     * Builds the GeoEntity so it can be rendered. Do not be call this directly from subclasses -
     * use {@link #_update} instead.
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
      // TODO(aramk) Distinguish between this and destroying the entity, which should remove all
      // contained objects.
      this.hide();
      this._cancelEventHandles();
      // TODO(aramk) We should try to keep consistent with these - either all entities have
      // references to managers or none do - otherwise we could have discrepancies in the entity
      // manager like a removed entity still being referenced.
      this._entityManager && this._entityManager.remove(this._id);
      this._eventManager && this._eventManager.dispatchEvent(new Event(this, 'entity/remove', {
        id: this.getId()
      }));
    },

    /**
     * Shows the GeoEntity in the current scene.
     */
    show: function() {
      this._visible = true;
      this._update();
      this._updateVisibility(true);
    },

    /**
     * Updates the GeoEntity for rendering.
     * @private
     */
    _update: function() {
      if (this.isVisible() && !this.isRenderable()) {
        this._build();
        this.clean();
      }
    },

    /**
     * Hides the GeoEntity from the current scene.
     */
    hide: function() {
      this._visible = false;
      this._updateVisibility(false);
    },

    /**
     * @returns {Boolean} Whether the GeoEntity is currently visible.
     */
    isVisible: function() {
      return this._visible;
    },

    /**
     * @param {Boolean} visible
     */
    setVisibility: function(visible) {
      visible ? this.show() : this.hide();
    },

    /**
     * Toggles the visibility of the GeoEntity.
     */
    toggleVisibility: function() {
      this.setVisibility(!this.isVisible());
    },

    /**
     * Overridable method to update the visibility of underlying geometries based on the given
     * visibility.
     * @param {Boolean} visible
     * @abstract
     * @private
     */
    _updateVisibility: function(visible) {
      // Override in subclasses.
    },

    /**
     * @returns {Boolean} Whether the entity is selected.
     */
    isSelected: function() {
      return this._selected;
    },

    /**
     * Sets the selection state of the entity.
     * @param {Boolean} selected
     * @returns {Boolean|null} The original selection state of the entity, or null if the state
     * is unchanged.
     */
    setSelected: function(selected) {
      if (this._selected === selected) {
        return null;
      }
      this._selected = selected;
      selected ? this._onSelect() : this._onDeselect();
    },

    // -------------------------------------------
    // EVENTS
    // -------------------------------------------

    /**
     * Handles the behaviour when this entity is selected.
     */
    _onSelect: function() {
      this._preSelectStyle = this.getStyle();
      this.setStyle(GeoEntity.getSelectedStyle());
      this._eventManager.dispatchEvent(new Event(this, 'entity/select', {
        ids: [this.getId()]
      }));
    },

    /**
     * Handles the behaviour when this entity is selected.
     */
    _onDeselect: function() {
      this.setStyle(this._preSelectStyle);
      this._eventManager.dispatchEvent(new Event(this, 'entity/deselect', {
        ids: [this.getId()]
      }));
    },

    /**
     * Adds the given event handle to be managed by the entity.
     * @param {EventListener} handle
     */
    _bindEventHandle: function(handle) {
      this._eventHandles.push(handle);
    },

    /**
     * Cancels all event handles on the entity.
     */
    _cancelEventHandles: function() {
      this._eventHandles.forEach(function(handle) {
        handle.cancel();
      });
    }

  }), {

    // -------------------------------------------------
    // STATICS
    // -------------------------------------------------

    /**
     * The default style of the entity.
     * @returns {atlas.model.Style}
     */
    getDefaultStyle: function() {
      return new Style({fillColour: Colour.GREEN, borderColour: Colour.BLACK});
    },

    /**
     * The style of the entity during selection.
     * @returns {atlas.model.Style}
     */
    getSelectedStyle: function() {
      return new Style({fillColour: Colour.RED, borderColour: Colour.BLACK});
    }

  });

  return GeoEntity;
});
