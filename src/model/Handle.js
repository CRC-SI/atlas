define([
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  'atlas/model/Vertex',
  // Base class
  'atlas/model/GeoEntity'
], function (DeveloperError, mixin, Vertex, GeoEntity) {
  /**
   * @classdesc The Handle class is an interactive vector linked to a GeoEntity or Vertex.
   * The Handle provides an interface between the editing subsystem and GeoEntities.
   * When a handle is modified, the Handle delegates these calls
   * to the linked GeoEntities.
   * @param {atlas.model.GeoEntity} args.target - The owner of the linked <code>Vertex</code>.
   * @param {atlas.model.Vertex | atlas.model.GeoEntity} args.linked - The Vertex or GeoEntity that is linked to the Handle.
   * @class atlas.model.Handle
   * @extends atlas.model.GeoEntity
   */
  var Handle;
  return mixin(Handle = GeoEntity.extend( /** @lends atlas.model.Handle# */ {

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
     * The owner of the linked Vertex.
     */
    _target: null,

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
      this._id = Handle.getNextId();
      this._linked = args.linked;
      this._target = args.target;
    },

    remove: function () {
      this._linked = null;
      this._target = null;
      this._delegateToLinked = function () {
        throw new Error('Tried to use a removed Handle');
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getLinked: function () {
      return this._linked;
    },

    getTarget: function () {
      return this._target;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------
    _delegateToLinked: function (method, args) {
      var linked = this.getLinked(),
          target = this.getTarget();
      Object.apply(linked, args);
      if (linked !== target) {
        // linked and target are only different if linked is a Vertex and target a GeoEntity.
        target.setDirty('vertices');
      }
      // Update target with change.
      target.show();
    },

    rotate: function () {
      this._delegateToLinked('rotate', arguments);
    },

    scale: function () {
      this._delegateToLinked('scale', arguments);
    },

    translate: function () {
      this._delegateToLinked('translate', arguments);
    }
  }),
    {
      // -------------------------------------------
      // STATICS
      // -------------------------------------------

      /**
       * ID to assign to the next created Handle.
       * @type {Number}
       * @protected
       */
      _nextId: 100000,

      getNextId: function () {
        return 'handle' + Handle._nextId++;
      }
    }
  );
});
