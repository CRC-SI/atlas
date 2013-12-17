define([], function() {

  var EditModule = function() {
    this._mode = {};
  };

  /**
   * @returns {Object} A mapping of event strings to methods which will be used as event handlers.
   */
  EditModule.prototype.getEventBindings = function() {
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

  EditModule.prototype.setMode = function(mode) {
  };

  EditModule.prototype.getMode = function() {
  };

  EditModule.prototype.cancel = function(name, event) {
  };

  EditModule.prototype.start = function(name, event) {
  };

  EditModule.prototype.update = function(name, event) {
  };

  EditModule.prototype.end = function(name, event) {
  };

  return EditModule;
});
