define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  'atlas/model/GeoEntity',
  'atlas/model/Vertex'
], function (Class, DeveloperError, mixin, GeoEntity, Vertex) {

  /**
   * @typedef atlas.model.Handle
   * @ignore
   */
  var Handle;

  /**
   * @classdesc The Handle class is an interactive vector linked to a GeoEntity or Vertex.
   * The Handle provides an interface between the editing subsystem and GeoEntities.
   * When a handle is modified, the Handle delegates these calls
   * to the linked GeoEntities.
   * @param {atlas.model.GeoEntity} args.target - The owner of the linked <code>Vertex</code>.
   * @param {atlas.model.Vertex | atlas.model.GeoEntity} args.linked - The Vertex or GeoEntity that is linked to the Handle.
   * @class atlas.model.Handle
   */
  Handle = Class.extend( /** @lends atlas.model.Handle# */ {

    /**
     * ID of the Handle.
     * @type {String}
     * @protected
     */
    _id: null,

    /**
     * The linked GeoEntity or Vertex.
     * @type {atlas.model.GeoEntity | atlas.model.Vertex}
     * @protected
     */
    _linked: null,

    /**
     * The owner of a linked Vertex, if the Handle is linked to a Vertex. Otherwise
     * <code>_target</code> is equivalent to <code>_linked</code>.
     * @type {atlas.model.GeoEntity}
     * @protected
     */
    _target: null,

    /**
     * The visual element of the Handle.
     * @type {atlas.model.Ellipse}
     * @protected
     */
    _dot: null,

    /**
     * The radius of the dot visual element in metres.
     * @type {number}
     */
    _dotRadius: null,

    _init: function (args) {
      if (!args.linked) {
        throw new DeveloperError('Can not create Handle without linked entity.');
      } else if (args.linked instanceof GeoEntity) {
        args.target = args.linked;
      } else if (args.linked instanceof Vertex) {
        if (!(args.target instanceof GeoEntity)) {
          throw new DeveloperError('Must specify the GeoEntity target of Handle if linked to a Vertex.');
        }
        this.rotate = function () { /* disable rotate */ };
        this.scale = function () { /* disable scale */ };
      } else {
        throw new DeveloperError('Tried to link handle to unrecognised object.');
      }
      this._id = Handle._getNextId();
      this._linked = args.linked;
      this._target = args.target;
      this._dotRadius = args.dotRadius || Handle.DOT_RADIUS;
    },

    /**
     * Shows the visual element of the Handle from rendering.
     * @abstract
     */
    render: function () {
      throw new DeveloperError('Handle.render() must be implemented.');
    },

    /**
     * Removes the visual element of the Handle from rendering.
     * @abstract
     */
    unrender: function () {
      throw new DeveloperError('Handle.unrender() must be implemented.');
    },

    /**
     * Removes the Handle from its linked object.
     */
    remove: function () {
      this._linked = null;
      this._target = null;
      this._delegateToLinked = function () {
        throw new Error('Tried to use a removed Handle');
      };
      this.unrender();
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.GeoEntity|atlas.model.Vertex} The Handle's linked entity.
     */
    getLinked: function () {
      return this._linked;
    },

    /**
     * @returns {atlas.model.GeoEntity} The Handle's target.
     */
    getTarget: function () {
      return this._target;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Delegates a given method to the Handle's linked and target Entities as required.
     * @param {String} method - The method to apply.
     * @param {Array} args - The arguments for the method.
     * @private
     */
    _delegateToLinked: function (method, args) {
      var linked = this.getLinked(),
          target = this.getTarget();
      // Apply method to the linked entity.
      linked[method].apply(linked, args);
      // If the linked entity is not the target, inform the target that it needs to update.
      if (linked !== target) {
        // linked and target are only different if linked is a Vertex and target a GeoEntity.
        target.setDirty('vertices');
      }
      // Update target with change.
      target.show();
    },

    /**
     * Rotate the linked entity.
     * See {@link atlas.model.GeoEntity} for arguments format.
     */
    rotate: function () {
      this._delegateToLinked('rotate', arguments);
    },

    /**
     * Scale the linked entity.
     * See {@link atlas.model.GeoEntity} for arguments format.
     */
    scale: function () {
      this._delegateToLinked('scale', arguments);
    },

    /**
     * Translate the linked entity.
     * See {@link atlas.model.GeoEntity} for arguments format.
     */
    translate: function () {
      this._delegateToLinked('translate', arguments);
    }
  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  /**
   * The radius of the dot in metres.
   * @type {number}
   */
  Handle.DOT_RADIUS = 0.5;

  /**
   * ID to assign to the next created Handle.
   * @type {Number}
   * @private
   */
  Handle._nextId = 100000;

  /**
   * @returns {String} The next available Handle ID
   * @private
   */
  Handle._getNextId = function () {
    return 'handle' + Handle._nextId++;
  };

  return Handle;
});
