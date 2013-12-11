/**
 * This module borrowed from the Cesium project
 * @see {@link cesium.agi.com}
 */
define([
], function() {
  "use strict";

  /**
   * Constructs an exception object that is thrown due to a developer error, e.g., invalid argument,
   * argument out of range, etc.  This exception should only be thrown during development;
   * it usually indicates a bug in the calling code.  This exception should never be
   * caught; instead the calling code should strive not to generate it.
   * <br /><br />
   * On the other hand, a {@link RuntimeError} indicates an exception that may
   * be thrown at runtime, e.g., out of memory, that the calling code should be prepared
   * to catch.
   *
   * @alias atlas/util/DeveloperError
   *
   * @param {String} [message=undefined] The error message for this exception.
   *
   * @constructor
   */
  var DeveloperError = function(message) {
    /**
     * 'DeveloperError' indicating that this exception was thrown due to a developer error.
     * @type {String}
     * @constant
     */
    this.name = 'DeveloperError';

    /**
     * The explanation for why this exception was thrown.
     * @type {String}
     * @constant
     */
    this.message = message;

    var e = new Error();

    /**
     * The stack trace of this exception, if available.
     * @type {String}
     * @constant
     */
    this.stack = e.stack;
  };

  DeveloperError.prototype.toString = function() {
    var str = this.name + ': ' + this.message;

    if (typeof this.stack !== undefined) {
        str += '\n' + this.stack.toString();
    }

    return str;
  };

  return DeveloperError;
});
