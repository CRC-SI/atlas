define([
  'atlas/lib/utility/Log',
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Types',
  'atlas/model/GeoEntity',
  'atlas/model/GeoPoint',
  'atlas/util/DeveloperError'
], function(Log, Setter, Types, GeoEntity, GeoPoint, DeveloperError) {

  /**
   * @typedef atlas.model.Handle
   * @ignore
   */
  var Handle;

  /**
   * @classdesc The Handle class is an interactive {@link atlas.model.GeoPoint}.
   * The Handle provides an interface between the editing subsystem and GeoEntities.
   * When a handle is modified, the Handle delegates these calls to the target GeoEntities.
   * @param {atlas.model.GeoPoint} [args.target] - The GeoPoint that is target to the Handle. If no
   * target is provided, the owner is considered the target.
   * @param {atlas.model.GeoEntity} args.owner - The owner of the target {@link atlas.model.GeoPoint}.
   * @param {Number} [args.dotRadius=1] - The diameter of the Handle's dot in metres.
   * @class atlas.model.Handle
   */
  Handle = GeoEntity.extend(/** @lends atlas.model.Handle# */ {

    /**
     * ID of the Handle.
     * @type {String}
     * @protected
     */
    _id: null,

    /**
     * The target Vertex.
     * @type {atlas.model.GeoPoint}
     * @protected
     */
    // TODO(aramk) Rename this to point or vertex since it's no longer a shared object between the
    // owner and the handle. Also, it should be GeoPoint.
    _target: null,

    /**
     * The target Vertex index in the owner. If not defined, it is assumed the handle exists for the
     * whole target.
     * @type {Number|null}
     * @protected
     */
    _index: null,

    /**
     * The owner of a target Vertex.
     * @type {atlas.model.GeoEntity}
     * @protected
     */
    _owner: null,

    /**
     * The radius of the dot visual element in metres.
     * @type {number}
     */
    _dotRadius: null,

    _init: function(args) {
      this._super(Handle._getNextId(), args);
      if (!args.owner && !args.target) {
        throw new DeveloperError('Cannot create Handle without either a target or an owner.');
      }
      var owner = this._owner = args.owner;
      var index = this._index = args.index;
      var target = this._target = args.target || owner.getCentroid();
      this._dotRadius = args.dotRadius || Handle.DOT_RADIUS;
      if (!owner) {
        throw new DeveloperError('Must provide owner.');
      } else if (!target) {
        throw new DeveloperError('Must provide target.');
      }
      // TODO(aramk) Use dependency injection eventually.
      args.renderManager = owner._renderManager;
      args.eventManager = owner._eventManager;
      // The dot should not be registered with the EntityManager, as the Handle already is.
      delete args.entityManager;
      this._build();
    },

    /**
     * Removes the Handle from its target object.
     */
    remove: function() {
      this._super();
      this._target = null;
      this._owner = null;
      this._delegateToTarget = function() {
        Log.warn('Tried to use a removed Handle');
      };
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {atlas.model.GeoPoint} The Handle's target vertex.
     */
    getTarget: function() {
      return this._target;
    },

    /**
     * @returns {Number} The target vertex index in the owner.
     */
    getIndex: function() {
      return this._index;
    },

    /**
     * @returns {atlas.model.GeoEntity} The Handle's owner.
     */
    getOwner: function() {
      return this._owner;
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Delegates a given method to the Handle's target and target Entities as required.
     * @param {String} method - The method to apply.
     * @param {Array} args - The arguments for the method.
     * @private
     */
    _delegateToTarget: function(method, args) {
      // TODO(aramk) Still uncertain about how rotate and scale will work - for now only translate
      // is functioning.
      var target = this.getTarget(),
          index = this.getIndex(),
          owner = this.getOwner();
      if (target) {
        var result = target[method].apply(target, args);
        // Avoid updating the owner unless necessary to allow the owner to call methods on the
        // handle when its vertices change. This prevents an infinite loop arising.
        // TODO(aramk) Perhaps use an observer pattern so both owner and handle can change with
        // vertex.
        if (target.equals && !target.equals(result)) {
          // Since the Vertex methods produce new instances, set the result of the previous
          // call as the new value of the target instance.
          var ownerVertex = owner.getVertices()[index];
          ownerVertex.set(result);
          // Modify the target to ensure the values are synchronised with the owner vertex for the
          // next update.
          target.set(result);

          owner.setDirty('vertices');
          owner.show();
        }
      } else {
        // Move the owner instead if we don't have a target vertex. Delegate updating vertices to
        // the owner.
        owner[method].apply(owner, args);
      }
    },

    translate: function(translation, args) {
      args = Setter.mixin({
        delegate: true
      }, args);
      args.delegate && this._delegateToTarget('translate', arguments);
    }

  });

  // -------------------------------------------
  // STATICS
  // -------------------------------------------

  /**
   * The radius of the dot in metres.
   * @type {number}
   */
  Handle.DOT_RADIUS = 3;

  /**
   * ID to assign to the next created Handle.
   * @type {Number}
   * @private
   */
  Handle._nextId = 100000;

  /**
   * @returns {String} The next available Handle ID
   * @protected
   */
  Handle._getNextId = function() {
    return 'handle' + Handle._nextId++;
  };

  return Handle;
});
