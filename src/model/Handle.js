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

    _init: function (args) {
      if (!args.linked) {
        throw new DeveloperError('Can not create Handle without linked entity.');
      } else if (args.linked instanceof Vertex && !args.target) {
        throw new DeveloperError('Must specify target of Handle if linked to a Vertex.');
      }
      this._linked = args.linked;
      this._id = Handle.getNextId();
    },

    remove: function () {
      this._linked = [];
      this._delegateToLinked = function () {
        throw new Error('Tried to activate a removed Handle');
      }
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    getLinked: function () {
      return this._linked;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------
    _delegateToLinked: function (method, args) {
      this.getLinked().apply(this.getLinked(), args);
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
