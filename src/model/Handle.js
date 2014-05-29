define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/util/mixin',
  'atlas/model/GeoEntity',
  'atlas/lib/utility/Log'
], function(Class, DeveloperError, mixin, GeoEntity, Log) {

  /**
   * @typedef atlas.model.Handle
   * @ignore
   */
  var Handle;

  /**
   * @classdesc The Handle class is an interactive {@link atlas.model.Vertex}.
   * The Handle provides an interface between the editing subsystem and GeoEntities.
   * When a handle is modified, the Handle delegates these calls
   * to the target GeoEntities.
   * @param {atlas.model.Vertex} [args.target] - The Vertex that is target to the Handle. If no
   * target is provided, the owner is considered the target.
   * @param {atlas.model.GeoEntity} args.owner - The owner of the target
   * {@link atlas.model.Vertex}.
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
     * @type {atlas.model.Vertex}
     * @protected
     */
    _target: null,

    /**
     * The owner of a target Vertex.
     * @type {atlas.model.GeoEntity}
     * @protected
     */
    _owner: null,

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

    _init: function(args) {
      this._super(Handle._getNextId(), args);
      if (!args.target && !args.owner) {
        throw new DeveloperError('Cannot create Handle without either a target or an owner.');
      }
      this._target = args.target;
      this._owner = args.owner;
      this._dotRadius = args.dotRadius || Handle.DOT_RADIUS;
    },

    /**
     * Shows the visual element of the Handle from rendering.
     * @abstract
     */
    render: function() {
      throw new DeveloperError('Handle.render() must be implemented.');
    },

    /**
     * Removes the visual element of the Handle from rendering.
     * @abstract
     */
    unrender: function() {
      throw new DeveloperError('Handle.unrender() must be implemented.');
    },

    /**
     * Removes the Handle from its target object.
     */
    remove: function() {
      this.unrender();
      this._target = null;
      this._owner = null;
      this._dot && this._dot.remove();
      this._delegateToTarget = function() {
        Log.warn('Tried to use a removed Handle');
        // TODO(aramk) Reinstate this once bugs are fixed with drawing.
//        throw new Error('Tried to use a removed Handle');
      };
    },

    // -------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------

    /**
     * @returns {string} The ID of the Handle.
     */
    getId: function() {
      return this._id;
    },

    /**
     * @returns {atlas.model.Vertex} The Handle's target vertex.
     */
    getTarget: function() {
      return this._target;
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
          owner = this.getOwner();
      if (target) {
        var result = target[method].apply(target, args);
        // Avoid updating the owner unless necessary to allow the owner to call methods on the
        // handle when its vertices change. This prevents an infinite loop arising.
        // TODO(aramk) Perhaps use an observer pattern so both owner and handle can change with
        // vertex.
        if (!target.equals(result)) {
          // Since the Vertex methods produce new instances, set the result of the previous
          // call as the new value of the target instance.
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

//    /**
//     * Rotate the target entity.
//     * See {@link atlas.model.GeoEntity} for arguments format.
//     */
//    rotate: function() {
//      this._delegateToTarget('rotate', arguments);
//    },
//
//    /**
//     * Scale the target entity.
//     * See {@link atlas.model.GeoEntity} for arguments format.
//     */
//    scale: function() {
//      this._delegateToTarget('scale', arguments);
//    },

    /**
     * Translate the target entity.
     * See {@link atlas.model.GeoEntity} for arguments format.
     */
    translate: function(translation, args) {
      args = mixin({
        delegate: true
      }, args);
      args.delegate && this._delegateToTarget('translate', arguments);
      this._dot.translate.apply(this._dot, arguments);
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
