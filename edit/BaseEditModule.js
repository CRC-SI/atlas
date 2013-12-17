define([], function() {

  var BaseEditModule = function() {
    this._mode = {};
  };

  /**
   * @returns {Object} A mapping of event strings to methods which will be used as event handlers.
   */
  BaseEditModule.prototype.getEventBindings = function() {
    return {
      'input/leftdown': this.start,
      'input/leftmove': this.update,
      'input/leftup': this.end,
      'input/key': function (name, event) {
        // TODO(aramk) find a nice way to map key codes.
        if (event.keyCode === 27) {
          return this.cancel(name, event);
        }
      }
    }
  };

  BaseEditModule.prototype.setMode = function(mode) {
  };

  BaseEditModule.prototype.getMode = function() {
  };

  BaseEditModule.prototype.cancel = function(name, event) {
  };

  BaseEditModule.prototype.start = function(name, event) {
  };

  BaseEditModule.prototype.update = function(name, event) {
  };

  BaseEditModule.prototype.end = function(name, event) {
  };

  return BaseEditModule;
});
