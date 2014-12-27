define([
  'atlas/core/ItemStore',
  'atlas/events/Event',
  // Base class
  'atlas/events/EventTarget',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/material/Color',
  'atlas/model/Rectangle',
  'atlas/material/Style',
  'atlas/model/Vertex',
  'atlas/util/DeveloperError',
  'atlas/util/WKT'
], function(ItemStore, Event, EventTarget, Setter, Types, Color, Rectangle, Style, Vertex,
            DeveloperError, WKT) {
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
   * @param {atlas.render.RenderManager} args.renderManager - The RenderManager object responsible
   *     for the GeoEntity.
   * @param {atlas.events.EventManager} args.eventManager - The EventManager object responsible for
   *     the Event system.
   * @param {atlas.events.EventTarget} [args.parent] - The parent EventTarget object of the
   *     GeoEntity.
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
  GeoEntity = EventTarget.extend(/** @lends atlas.model.GeoEntity# */ {
    /**
     * The ID of the GeoEntity
     * @type {String}
     * @protected
     */
    _id: null,

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
     * The scale of the GeoEntity in each axis direction. 1 by default for all axes.
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
     * @type {atlas.material.Style}
     * @protected
     */
    _style: null,

    /**
     * The style of the GeoEntity before it was selected.
     * @type {atlas.material.Style}
     * @protected
     */
    _preSelectStyle: null,

    /**
     * Whether the GeoEntity is selected.
     * @type {Boolean}
     * @protected
     */
    _selected: false,

    /**
     * {@link atlas.model.Handle} objects used for editing.
     * @type {atlas.core.ItemStore}
     * @protected
     */
    _handles: null,

    /**
     * The {@link atlas.model.Handle} on the entity itself.
     * @type {atlas.model.Handle}
     * @protected
     */
    _entityHandle: null,

    /**
     * Event handles which are bound to the entity and should be removed with it.
     * @type {Array.<EventListener>}
     * @protected
     */
    _eventHandles: null,

    /**
     * @type {atlas.events.EventTarget}
     * @protected
     */
    _parent: null,

    /**
     * Whether the GeoEntity is fully set up. Rendering will be delayed until it is set up.
     * @type {Boolean}
     */
    _isSetUp: false,

    _init: function(id, data, args) {
      if (typeof id === 'object') {
        args = id;
        id = args.id;
      } else {
        args = args || {};
      }
      id = id.toString();
      if (!id || typeof id === 'object') {
        throw new DeveloperError('Can not create instance of GeoEntity without an ID');
      }
      this._id = id.toString();
      this._renderManager = args.renderManager;
      this._eventManager = args.eventManager;
      this._entityManager = args.entityManager;
      this._entityManager && this._entityManager.add(this.getId(), this);
      var parentId = args.parent;
      var parent;
      if (parentId) {
        parent = this._entityManager && this._entityManager.getById(parentId);
      }
      this._super(args.eventManager, parent);
      this.clean();
      data = data || {};
      this._setup(id, data, args);
      this._isSetUp = true;
    },

    /**
     * Sets up all properties on the GeoEntity on construction but before rendering.
     * @param {String} id
     * @param {Object} data - The data for construction.
     * @param {Object} args - Additional data for construction.
     */
    _setup: function(id, data, args) {
      this._handles = new ItemStore();
      this._eventHandles = [];
      // TODO(aramk) This doesn't actually show - should call setVisibility(), but that means all
      // subclass constructors should have completely set up their properties. We would need a
      // method called setUp() which we call here and subclasses override to ensure all properties
      // (e.g. vertices) are set and _build() can safely be called from here.
      this._visible = Setter.def(args.show, false);
      this.setDirty('entity');

      var style = data.style || Style.getDefault();
      var color = data.color;
      var borderColor = data.borderColor;
      color && style.setFillMaterial(new Color(color));
      borderColor && style.setBorderMaterial(new Color(borderColor));
      this.setStyle(style);
      this._elevation = parseFloat(data.elevation) || this._elevation;
      this._scale = new Vertex(data.scale || {x: 1, y: 1, z: 1});
      this._rotation = new Vertex(data.rotation || {x: 0, y: 0, z: 0});
    },

    // TODO(aramk) Use better dependency injection.
    /**
     * @param {Object} args - Any object used for construction.
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
     * @returns {atlas.model.GeoPoint | null} The centre-point of this GeoEntity, or null if no
     * centroid exists.
     */
    getCentroid: function() {
      if (!this._centroid) {
        this._centroid = this._calcCentroid();
      }
      return this._centroid ? this._centroid.clone() : null;
    },

    /**
     * Translates the GeoEntity so that its centroid is the one given.
     * @param {atlas.model.GeoPoint} centroid
     */
    setCentroid: function(centroid) {
      var oldCentroid = this.getCentroid();
      var diff = centroid.subtract(oldCentroid);
      this.translate(diff);
    },

    _calcCentroid: function() {
      var wkt = WKT.getInstance();
      var centroid = this.getOpenLayersGeometry().getCentroid();
      return centroid ? wkt.geoPointFromOpenLayersPoint(centroid) : null;
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
     * @returns {atlas.model.Rectangle}
     */
    getBoundingBox: function() {
      var geometry = this.getOpenLayersGeometry();
      var box = geometry.getBounds();
      if (box) {
        // OpenLayers points are (x,y) = (lat,lng) so the rectangle is in cartesian space.
        return new Rectangle(box.right, box.left, box.top, box.bottom);
      } else {
        return null;
      }
    },

    /**
     * Set the elevation of the base of the GeoEntity.
     * @param {Number} elevation - The elevation of the base of the GeoEntity.
     */
    setElevation: function(elevation) {
      if (this._elevation !== elevation) {
        this._elevation = elevation;
        this.setDirty('model');
        this._update();
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
     * @param {String|Array|Object} component - Either a single component name, or an array or
     *     object literal of component names to set to dirty.
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
        }, this);
      }
      if (this.isDirty('entity') || this.isDirty('vertices') || this.isDirty('model')) {
        this._invalidateGeometry();
      }
    },

    /**
     * Invalidates values that are calculated using the geometry of this GeoEntity.
     * @protected
     */
    _invalidateGeometry: function() {
      // Invalidate the centroid and area. They will be recalculated when requested.
      this._centroid = null;
      this._area = null;
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
     * @param {atlas.material.Style} style - The new style to use.
     * @returns {atlas.material.Style} The old style, or null if it was not changed.
     */
    setStyle: function(style) {
      var previousStyle = this.getStyle();
      if (previousStyle && previousStyle.equals(style)) {
        return null;
      }
      this.setDirty('style');
      this._style = style;
      this._update();
      return previousStyle;
    },

    /**
     * @returns {atlas.material.Style}
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
     * @param {atlas.material.Color} [newStyle.fillMaterial] - The new fill material.
     * @param {atlas.material.Color} [newStyle.borderMaterial] - The new border material.
     * @param {Number} [newStyle.borderWidth] - The new border width material.
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
      newStyle.fillMaterial && (oldStyle.fillMaterial = this._style.getFillMaterial());
      newStyle.borderMaterial && (oldStyle.borderMaterial = this._style.getBorderMaterial());
      newStyle.borderWidth && (oldStyle.borderWidth = this._style.getBorderWidth());
      // Generate new style based on what's changed.
      newStyle = Setter.mixin({
        fillMaterial: this._style.getFillMaterial(),
        borderMaterial: this._style.getBorderMaterial(),
        borderWidth: this._style.getBorderWidth()
      }, newStyle);
      return this.setStyle(newStyle)
    },

    /**
     * Translates the GeoEntity by the given vector.
     * @param {atlas.model.GeoPoint} translation - The amount to move the GeoEntity in latitude,
     * longitude and elevation.
     */
    translate: function(translation) {
      // NOTE: Translation is handled by the subclasses, since not all models have vertices.
      this._onTransform();
    },

    /**
     * Scales the GeoEntity by the given vector. This scaling can be uniform in all axis or
     *     non-uniform.
     * A scaling factor of <code>1</code> has no effect. Factors lower or higher than <code>1</code>
     * scale the GeoEntity down or up respectively. ie, <code>0.5</code> is half as big and
     * <code>2</code> is twice as big.
     * @param {atlas.model.Vertex} scale - The vector to scale the GeoEntity by.
     * @param {Number} scale.x - The scale along the <code>x</code> axis of the GeoEntity.
     * @param {Number} scale.y - The scale along the <code>y</code> axis of the GeoEntity.
     * @param {Number} scale.z - The scale along the <code>z</code> axis of the GeoEntity.
     */
    scale: function(scale) {
      this._scale = this.getScale().componentwiseMultiply(scale);
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
     * @param {GeoPoint} [centroid] - The centroid to use for rotating. By default this is the
     * centroid of the GeoEntity obtained from {@link #getCentroid}.
     */
    rotate: function(rotation, centroid) {
      this._rotation = this.getRotation().translate(rotation);
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
    _onTransform: function() {
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
     * Removes the GeoEntity from rendering. This function should be overridden on subclasses to
     * accomplish any cleanup that may be required.
     *
     * @fires InternalEvent#entity/remove
     */
    remove: function() {
      this._super();
      // TODO(aramk) Distinguish between this and destroying the entity, which should remove all
      // contained objects.
      this.hide();
      // Ensure any selected entities are deselected so any event handlers listening are notified.
      this.setSelected(false);
      this._cancelEventHandles();
      // TODO(aramk) We should try to keep consistent with these - either all entities have
      // references to managers or none do - otherwise we could have discrepancies in the entity
      // manager like a removed entity still being referenced.
      this._entityManager && this._entityManager.remove(this._id);

      /**
       * Removal of an entity.
       *
       * @event InternalEvent#entity/remove
       * @type {atlas.events.Event}
       * @property {String} args.id - The ID of the removed entity.
       */
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
    },

    /**
     * Updates the GeoEntity for rendering.
     * @private
     */
    _update: function() {
      if (!this._isSetUp) return;
      var isVisible = this.isVisible();
      if (isVisible && !this.isRenderable()) {
        this._build();
        this.clean();
      }
      this._updateVisibility(isVisible);
    },

    /**
     * Hides the GeoEntity from the current scene.
     */
    hide: function() {
      this._visible = false;
      this._update();
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
     *
     * @fires InternalEvent#entity/select
     */
    _onSelect: function() {
      this._setSelectStyle();

      /**
       * Selection of an entity.
       *
       * @event InternalEvent#entity/select
       * @type {atlas.events.Event}
       * @property {Array.<String>} args.ids - The IDs of the selected entities.
       */
      this._eventManager.dispatchEvent(new Event(this, 'entity/select', {
        ids: [this.getId()]
      }));
    },

    /**
     * Handles the behaviour when this entity is selected.
     *
     * @fires InternalEvent#entity/deselect
     */
    _onDeselect: function() {
      this._revertSelectStyle();

      /**
       * Deselection of an entity.
       *
       * @event InternalEvent#entity/deselect
       * @type {atlas.events.Event}
       * @property {Array.<String>} args.ids - The IDs of the selected entities.
       */
      this._eventManager.dispatchEvent(new Event(this, 'entity/deselect', {
        ids: [this.getId()]
      }));
    },

    _setSelectStyle: function() {
      this._preSelectStyle = this.getStyle();
      this.setStyle(Style.getDefaultSelected());
    },

    _revertSelectStyle: function() {
      this.setStyle(this._preSelectStyle);
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

  });

  return GeoEntity;
});
