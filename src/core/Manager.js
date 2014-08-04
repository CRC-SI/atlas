define([
  'atlas/util/Class',
  'atlas/util/DeveloperError'
], function(Class, DeveloperError) {
  /**
   * @typedef atlas.core.Manager
   * @ignore
   */
  var Manager;

  /**
   * @classdesc Manages a distinct area of functionality.
   *
   * @class atlas.core.Manager
   * @abstract
   */
  Manager = Class.extend(/** @lends atlas.core.Manager# */ {

    /**
     * @type {String} The name of this manager when references by other managers.
     */
    _id: null,

    /**
     * @param {Object} managers - A map of manager types to actual manager objects.
     * The map is maintained on the main Atlas facade object, but the instances
     * are created by each manager object upon creation.
     * @constructor
     * @private
     */
    _init: function(managers) {
      this._managers = managers;
      var id = this._id;
      if (id) {
        this._managers[id] = this;
      } else {
        throw new DeveloperError('Unresolved manager ID');
      }
    },

    /**
     * Sets up the manager. Can rely on dependent managers existing.
     * @abstract
     */
    setup: function() {
      throw new DeveloperError('Cannot call abstract method of Manager');
    }

  });

  return Manager;
});
