define([
  'atlas/lib/utility/Setter',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError'
], function(Setter, Class, DeveloperError) {

  /**
   * @typedef atlas.model.Material
   * @ignore
   */
  var Material;

  /**
   * @classdesc Describes the apperance of geometry.
   *
   * @abstract
   * @class atlas.model.Material
   */
  Material = Class.extend( /** @lends atlas.model.Material# */ {

    _init: function(args) {
      
    },

    /**
     * @param {atlas.model.Material} other
     * @returns {Boolean} Whether the given object is equal to this object.
     */
    equals: function(other) {
      throw new DeveloperError('Cannot call abstact method Material#equals()');
    }

  });

  return Material;
});
