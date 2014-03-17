define([
  // Base class
  'atlas/model/GeoEntity'
], function (GeoEntity) {
  /**
   * @classdesc The Handle class is an interactive vector linked to a collection
   * of GeoEntities (typically one). The Handle provides an interface between the editing
   * subsystem and GeoEntities. When a handle is modified, the Handle delegates these calls
   * to the linked GeoEntities.
   *
   * @class atlas.model.Handle
   * @extends atlas.model.GeoEntity
   */
  return GeoEntity.extend( /** @lends atlas.model.Handle# */ {
    /**
     * The a map of ID to linked GeoEntities.
     * @type {Object.<String, atlas.model.GeoEntity>}
     */
    _linked: null,

    _init: function (targets) {
      if (targets.getId) {
        // targets is a single GeoEntity, convert it to an array.
        var target = targets;
        targets = [target];
      }
      this._linked = targets;
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
      this.getLinked().forEach(function (entity) {
        entity[method].apply(entity, args);
      })
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
  });
});
