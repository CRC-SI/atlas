define([
  'atlas/events/Event',
  'atlas/lib/Q',
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Objects',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Strings',
  'atlas/lib/utility/Types',
  'atlas/model/Ellipse',
  'atlas/model/Image',
  'atlas/model/Line',
  'atlas/model/Mesh',
  'atlas/model/Point',
  'atlas/model/Polygon',
  'atlas/util/DeveloperError',
  // Base class.
  'atlas/model/GeoEntity',
  'underscore'
], function(Event, Q, Log, Objects, Setter, Strings, Types, Ellipse, Image, Line,
            Mesh, Point, Polygon, DeveloperError, GeoEntity, _) {

  /**
   * @typedef atlas.model.Feature
   * @ignore
   */
  var Feature;

  // TODO(aramk) Docs about display mode arguments are outdated.
  /**
   * @classdesc A Feature represents an entity that can be visualised either
   * as a 2D line, 2D footprint, an 3D extrusion of said footprint, or a 3D mesh.
   *
   * @param {Number} id - The ID of this Feature.
   * @param {Object} args - Parameters describing the feature.
   * @param {atlas.render.RenderManager} args.renderManager - The RenderManager object responsible
   * for rendering the Feature.
   * @param {atlas.events.EventManager} args.eventManager - The EventManager object responsible for
   * the event system.
   * @param {String|Array.<atlas.model.GeoPoint>} [args.footprint=null] - Either a WKT string or
   *     array of Vertices describing the footprint polygon.
   * @param {atlas.model.Mesh} [args.mesh=null] - The Mesh object for the Feature.
   * @param {String} [args.displayMode=Feature.DisplayMode.FOOTPRINT] - Initial display mode of
   * feature. Mesh trumps Footprint, which trumps Line if they are both defined in terms of which is
   * displayed by default.
   *
   * @see {@link atlas.model.Polygon}
   * @see {@link atlas.model.Mesh}
   *
   * @class atlas.model.Feature
   * @extends atlas.model.GeoEntity
   */
  Feature = GeoEntity.extend(/** @lends atlas.model.Feature# */ {

    /**
     * The 3D point of this Feature.
     * @type {atlas.model.Point}
     * @protected
     */
    _point: null,

    /**
     * The 2D line of this Feature.
     * @type {atlas.model.Line}
     * @protected
     */
    _line: null,

    /**
     * The 2D footprint of this Feature.
     * @type {atlas.model.Polygon}
     * @protected
     */
    _footprint: null,

    /**
     * 3D mesh of this Feature.
     * @type {atlas.model.Mesh}
     * @protected
     */
    _mesh: null,

    /**
     * 2D image of this Feature.
     * @type {atlas.model.Image}
     * @protected
     */
    _image: null,

    /** A map of the DisplayMode for each form to its GeoEntity.
     * @type {Object.<atlas.model.Feature.DisplayMode, atlas.model.GeoEntity>}
     */
    _formsMap: null,

    /**
     * The unique forms. {@link #_formsMap} can reference the same entity for two forms, whereas
     * this array only contains the entity once.
     * @type {Array.<atlas.model.GeoEntity>}
     */
    _forms: null,

    /**
     * The display mode of the Feature.
     * Mesh trumps Footprint, which trumps Line if they are both defined in terms of which is
     * displayed by default.
     * @type {atlas.model.Feature.DisplayMode}
     * @protected
     */
    _displayMode: null,

    /**
     * @type {Object.<String, Function>} A map of class names to constructors for the form models
     *     constructed by this feature.
     */
    // TODO(bpstudds) Replace this with a factory.
    _formConstructors: {
      Point: Point,
      Line: Line,
      Polygon: Polygon,
      Ellipse: Ellipse,
      Mesh: Mesh,
      // TODO(aramk) There's no constructor for GltfMesh in atlas, so we need to use Mesh.
      GltfMesh: Mesh,
      Image: Image
    },

    _setup: function(id, data, args) {
      this._formsMap = {};
      this._forms = [];
      // Delegation is necessary for calling setHeight().
      this._initDelegation();
      this._initEvents();
      this._super(id, data, args);
      var displayMode = data.displayMode;
      Object.keys(Feature.JsonPropertyToDisplayMode).forEach(function(prop) {
        var mode = Feature.JsonPropertyToDisplayMode[prop];
        var formData = data[prop];
        if (formData) {
          if (Types.isObject(formData) && !(formData instanceof GeoEntity)) {
          // Don't render the form until the feature is rendered based on the dislay mode.
            formData.show = false;
            formData.buildOnChanges = Setter.def(data.buildOnChanges, formData.buildOnChanges);
            if (this.isSelected()) {
              formData.selected = true;
            }
          }
          var form = this._getOrCreateForm(id, prop, formData, args);
          this.setForm(mode, form);
          displayMode = displayMode || mode;
        }
      }, this);
      this.setDisplayMode(displayMode);
      var height = data.height;
      if (height !== undefined) this.setHeight(height);
    },

    /**
     * @param {String} id - The ID to use as the prefix for constructing the new form.
     * @param {String} prop - The property name of this form's type in the Feature constructor. Used
     *     to determine the form's constructor.
     * @param {Object|String} data - Either the ID of an existing form or the data for constructing
     *     it.
     * @param {Object} [args] - Additional constructor arguments.
     * @return {atlas.model.GeoEntity} Either a newly constructed form, or an existing form if data
     *     is an ID.
     */
    _getOrCreateForm: function(id, prop, data, args) {
      if (data instanceof GeoEntity) {
        return data;
      } else if (Types.isString(data)) {
        var form = this._entityManager.getById(data);
        if (!form) {
          throw new Error('Cannot find form with ID ' + data);
        }
        return form;
      }
      var Constructor = this._formConstructors[Strings.toTitleCase(prop)];
      if (data.gltf || data.gltfUrl) {
        Constructor = this._formConstructors.GltfMesh;
      }
      return new Constructor(id + prop, data, args);
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * Binds various methods in {@link atlas.model.GeoEntity} which should be entirely delegated to
     * the currently active form without any extra work.
     * @private
     */
    _initDelegation: function() {
      var formMethods = ['isRenderable', 'isDirty', 'setDirty', 'clean', 'createHandles',
        'createHandle', 'addHandles', 'addHandle', 'clearHandles', 'setHandles', 'getHandles',
        'getCentroid', 'getArea', 'getVertices', 'getOpenLayersGeometry', 'getBoundingBox',
        'translate', 'scale', 'rotate', 'setScale', 'setRotation', 'setHeight', 'getHeight',
        'enableExtrusion', 'disableExtrusion'];
      formMethods.forEach(function(method) {
        this[method] = function() {
          return this._delegateToForm(method, arguments);
        };
      }, this);
      var formsMethods = ['setSelectable'];
      formsMethods.forEach(function(method) {
        this[method] = function() {
          return this._delegateToForms(method, arguments);
        };
      }, this);
    },

    _delegateToForm: function(methodName, args) {
      var form = this.getForm();
      if (form) {
        var method = form[methodName];
        return method && method.apply(form, args);
      }
    },

    _delegateToForms: function(methodName, args) {
      var forms = this.getForms();
      forms.forEach(function(form) {
        var method = form[methodName];
        return method && method.apply(form, args);
      });
    },

    /**
     * @param {atlas.model.Feature.DisplayMode} displayMode
     * @param {atlas.model.GeoEntity} entity
     */
    setForm: function(displayMode, entity) {
      this._assertDisplayMode(displayMode);
      var existing = this._formsMap[displayMode];
      if (existing === entity) return;
      if (existing) this.removeForm(displayMode);
      if (!_.contains(this._forms, entity)) {
        this._forms.push(entity);
      }
      this._formsMap[displayMode] = entity;
      entity.setParent(this);
      this.isVisible() && this.show();
    },

    /**
     * @param {atlas.model.Feature.DisplayMode} [displayMode]
     * @returns {atlas.model.GeoEntity} The form for the given display mode, or the current
     * display mode if none is given.
     */
    getForm: function(displayMode) {
      displayMode = displayMode || this._displayMode;
      if (displayMode) this._assertDisplayMode(displayMode);
      return displayMode ? this._formsMap[displayMode] : null;
    },

    removeForm: function(displayMode) {
      this._assertDisplayMode(displayMode);
      var form = this.getForm(displayMode);
      if (!form) return false;
      this._forms = _.without(this._forms, form);
      delete this._formsMap[displayMode];
      form.setParent(null);
      return true;
    },

    /**
     * @return {Array.<atlas.model.GeoEntity>} The GeoEntity objects for each unique form.
     */
    getForms: function() {
      return this._forms;
    },

    /**
     * @return {Object.<atlas.model.Feature.DisplayMode, atlas.model.GeoEntity>} A map of the
     *     DisplayMode for each feature to its GeoEntity.
     */
    _getFormsMap: function() {
      return this._formsMap;
    },

    getChildren: function() {
      return this.getForms();
    },

    ready: function() {
      return Q.all(this.getChildren().map(function(entity) { return entity.ready() }));
    },

    getJsonPropertyFromDisplayMode: function(displayMode) {
      var form = this.getForm(displayMode);
      if (displayMode === Feature.DisplayMode.FOOTPRINT ||
          displayMode === Feature.DisplayMode.EXTRUSION) {
        if (form instanceof Polygon) {
          return 'polygon';
        } else if (form instanceof Ellipse) {
          return 'ellipse';
        } else {
          // TODO(aramk) We need to refactor this so display modes and forms are the same concept.
          Log.warn('Unrecognized form for display mode: ' + displayMode);
          return null;
        }
      } else {
        return displayMode;
      }
    },

    setSelected: function(selected) {
      var result = this._super(selected);
      if (result !== null) {
        this._delegateToForm('setSelected', arguments);
      }
      return result;
    },

    // TODO(aramk) A lot of these operations below should be calling _super() and being called on
    // each form (even those which are not visible)?

    setElevation: function(elevation) {
      // The elevation of a feature may be different from its form, but if we use setElevation()
      // on the feature, both are modified.
      var result = this._super(elevation);
      this._delegateToForms('setElevation', arguments);
      return result;
    },

    setStyle: function(style) {
      var previousStyle = this.getStyle();
      this._style = style;
      return this._delegateToForms('setStyle', arguments) || previousStyle;
    },

    getStyle: function() {
      return this._delegateToForm('getStyle') || this._super();
    },

    getVisibleStyle: function() {
      return this._delegateToForm('getVisibleStyle') || this._super();
    },

    /**
     * @return {Object} json - A JSON representation of the Feature.
     * @return {Object.<String, String>} json.forms - A map of the JSON properties for the forms of
     *     this Feature to their GeoEntity IDs.
     */
    toJson: function() {
      var json = this._super();
      var forms = json.forms = {};
      var formsMap = this._getFormsMap();
      Object.keys(formsMap).forEach(function(displayMode) {
        var form = formsMap[displayMode];
        var propName = this.getJsonPropertyFromDisplayMode(displayMode);
        if (propName && json[propName] === undefined) {
          // Avoid re-running toJson() for form classes which can span multiple display modes
          // (e.g. Polygon and Ellipse).
          forms[propName] = form.getId();
        }
      }, this);
      Setter.merge(json, {
        type: 'feature',
        displayMode: this.getDisplayMode()
      });
      return json;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Renders the Feature using its footprint.
     * @see {@link atlas.model.Polygon}
     */
    showAsFootprint: function() {
      this.setDisplayMode(Feature.DisplayMode.FOOTPRINT);
    },

    /**
     * Renders the Feature using its extruded footprint.
     * @see {@link atlas.model.Polygon}
     */
    showAsExtrusion: function() {
      this.setDisplayMode(Feature.DisplayMode.EXTRUSION);
    },

    /**
     * Renders the Feature using its mesh.
     * @see {@link atlas.model.Mesh}
     */
    showAsMesh: function() {
      this.setDisplayMode(Feature.DisplayMode.MESH);
    },

    /**
     * Renders the Feature using its mesh.
     * @see {@link atlas.model.Image}
     */
    showAsImage: function() {
      this.setDisplayMode(Feature.DisplayMode.IMAGE);
    },

    /**
     * Clean up the Feature so it can be deleted by the RenderManager.
     * @param {Boolean} recursive - Whether to remove all forms as well.
     */
    remove: function(recursive) {
      recursive = Setter.def(recursive, true);
      if (recursive) {
        _.each(this._getFormsMap(), function(form, displayMode) {
          this.removeForm(displayMode);
          form.remove();
        }, this);
      }
      this._super();
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Shows the Feature depending on its current <code>_displayMode</code>.
     */
    show: function() {
      // Since _formsMap can reference the same entity twice, keep track of the unique forms to
      // hide.
      var toHideIds = {};
      var toHide = [];
      _.each(this._formsMap, function(form, displayMode) {
        var formId = form.getId();
        if (this._displayMode === displayMode) {
          form.show();
          if (displayMode === Feature.DisplayMode.FOOTPRINT) {
            form.disableExtrusion && form.disableExtrusion();
          } else if (displayMode === Feature.DisplayMode.EXTRUSION) {
            form.enableExtrusion && form.enableExtrusion();
          }
        // Ensure toHide only contains unique entities. Avoid hiding entities which were shown due
        // to matching the given displayMode.
        } else if (!toHideIds[formId] &&
            this._formsMap[displayMode] !== this._formsMap[this._displayMode]) {
          toHideIds[formId] = true;
          toHide.push(form);
        }
      }, this);
      _.each(toHide, function(form) {
        form.hide();
      });
      // Call this afterwards to avoid calling clean() on the form, which would prevent show()
      // calling _build().
      this._super();
    },

    _update: function() {
      this._super();
      // Only update the selection of the current form and after transitioning for efficiency.
      var form = this.getForm();
      form && form.setSelected(this.isSelected());
    },

    /**
     * Hides the Feature.
     */
    hide: function() {
      this._super();
      this._delegateToForm('hide');
    },

    /**
     * @param {atlas.model.Feature.DisplayMode} displayMode
     */
    setDisplayMode: function(displayMode) {
      if (displayMode) this._assertDisplayMode(displayMode);
      this._displayMode = displayMode;
      this.isVisible() ? this.show() : this.hide();
    },

    /**
     * @returns {atlas.model.Feature.DisplayMode}
     */
    getDisplayMode: function() {
      return this._displayMode;
    },

    _assertDisplayMode: function(displayMode) {
      if (!Feature.isDisplayMode(displayMode)) {
        throw new Error('Invalid display mode: ' + displayMode);
      }
    },

    _build: function() {
      // Rendering is delegated to the form.
    },

    // -------------------------------------------
    // EVENTS
    // -------------------------------------------

    /**
     * Listen for events on the forms and apply it to this feature.
     * @private
     *
     * @listens InternalEvent#entity/select
     * @listens InternalEvent#entity/deselect
     * @listens InternalEvent#entity/dblclick
     * @listens InternalEvent#entity/remove
     * @fires InternalEvent#entity/dblclick
     */
    _initEvents: function() {
      // If the original target is this feature, don't dispatch the event since it would be a
      // duplicate.
      var isOwnEvent = function(event) {
        return event.getTarget() === this;
      }.bind(this);
      // Dispatches a clone of the given event for this feature. Used to re-trigger an event from
      // the form on the feature.
      var dispatchClone = function(event) {
        if (isOwnEvent(event)) return;
        var newEvent = event.clone();
        var args = Setter.cloneDeep(newEvent.getArgs());
        args.id = this.getId();
        newEvent.setArgs(args);
        this.dispatchEvent(newEvent);
      }.bind(this);

      // This responds to events in the forms which bubble up.
      this.addEventListener('entity/select', function(event) {
        if (isOwnEvent(event)) return;
        this.setSelected(true);
      }.bind(this));
      this.addEventListener('entity/deselect', function(event) {
        if (isOwnEvent(event)) return;
        this.setSelected(false);
      }.bind(this));
      this.addEventListener('entity/dblclick', dispatchClone);
      this.addEventListener('entity/mousemove', dispatchClone);
      this.addEventListener('entity/remove', function(event) {
        if (isOwnEvent(event)) return;
        var forms = this._getFormsMap();
        Object.keys(forms).forEach(function(displayMode) {
          var form = forms[displayMode];
          if (form === event.getTarget()) {
            this.removeForm(displayMode);
            return false;
          }
        }, this);
        // Prevent this event from bubbling up further since the ancestors of this entity shouldn't
        // need to worry about its children.
        event.cancel();
      }.bind(this));
    },

    // Ignore all style since it's handled by the forms. Otherwise, setting the style for this
    // feature applies it to the form and this changes it from the pre-select style.
    _updateHighlightStyle: function() {
    }

  });

  /**
   * The display mode of the Feature which determines the underlying geometry shown.
   * @typedef {Object} atlas.model.Feature.DisplayMode
   * @static
   */
  Feature.DisplayMode = Object.freeze({
    POINT: 'point',
    LINE: 'line',
    FOOTPRINT: 'footprint',
    EXTRUSION: 'extrusion',
    MESH: 'mesh',
    IMAGE: 'image'
  });

  Feature.JsonPropertyToDisplayMode = {
    mesh: Feature.DisplayMode.MESH,
    ellipse: Feature.DisplayMode.EXTRUSION,
    point: Feature.DisplayMode.POINT,
    polygon: Feature.DisplayMode.EXTRUSION,
    line: Feature.DisplayMode.LINE,
    image: Feature.DisplayMode.IMAGE
  };

  /**
   * @returns {Array.<String>} The possible display mode IDs.
   * @static
   */
  Feature.getDisplayModeIds = _.once(function() {
    return Object.freeze(Objects.values(this.DisplayMode));
  });

  var displayModes = {}
  _.each(Feature.DisplayMode, function(displayMode) {
    displayModes[displayMode] = true;
  });

  Feature.isDisplayMode = function(displayMode) {
    return displayModes[displayMode] != null;
  };

  return Feature;
});
