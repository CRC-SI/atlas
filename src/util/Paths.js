define([
  'module',
  'atlas/core/Atlas',
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Path',
  'atlas/lib/utility/Window',
  'atlas/util/Instances'
], function(module, Atlas, Class, Path, Window, Instances) {

  /**
   * @typedef atlas.util.Paths
   * @ignore
   */
  var Paths;

  /**
   * @classdesc A utility for manipulating paths related to Atlas.
   *
   * @abstract
   * @class atlas.util.Paths
   */
  Paths = Instances.defineGlobal(Class.extend(/** @lends atlas.util.Paths# */ {

    /**
     * @returns {String} The URL of the Atlas resources directory relative to the current URL in the
     * browser.
     */
    getRelative: function() {
      // Since we don't have a "src" directory in production, we have one less level to move up.
      var levels = Atlas.getEnvironment() === Atlas.Environment.PRODUCTION ? 2 : 3;
      // Remove relative prefix if the script is loaded locally.
      var uri = module.uri.replace(/^\.\//, '');
      return Path.dirname(uri, levels);
    },

    /**
     * @returns {String} The absolute URL of the Atlas directory.
     */
    getAbsolute: function() {
      return Window.currentDir() + this.getRelative();
    },

    /**
     * @returns {String} The absolute URL of the Atlas resources directory.
     */
    getResourceDirectory: function() {
      return Path.join(this.getAbsolute(), 'resources');
    }

  }));

  return Paths;
});
