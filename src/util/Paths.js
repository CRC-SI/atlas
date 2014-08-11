define([
  'module',
  'atlas/core/Atlas',
  'atlas/lib/utility/Class',
  'atlas/lib/utility/Path',
  'atlas/lib/utility/Window',
  'atlas/util/Instances'
], function(module, Atlas, Class, Path, Window, Instances) {

  console.debug('module', module);

  /**
   * @typedef atlas.util.Paths
   * @ignore
   */
  var Paths;

  /**
   * @classdesc A utility for loading file system resources.
   *
   * @abstract
   * @class atlas.util.Paths
   */
  Paths = Instances.defineGlobal(Class.extend({

    /**
     * @returns {String} The URL of the Atlas resources directory relative to the current URL in the
     * browser.
     */
    getRelative: function() {
//      NOTE: This is modified in the build.
//      return Path.dirname(module.uri).replace(/src[\s\S]*?$/, '');
      // Remove "src/util" going 3 levels up. In the build, this is replaced with 2 levels, since
      // there is no "src" directory.
      var levels = Atlas.getEnvironment() === Atlas.Environment.PRODUCTION ? 2 : 3;
      return Path.dirname(module.uri, levels);
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
