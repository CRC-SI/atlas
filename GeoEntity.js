define([
  // Nothing
], function () {
  
  var GeoEntity = function () {
    var _centroid = null;
    var _area = null;
    var _visible = null;
  };

  GeoEntity.prototype.getCentroid = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  GeoEntity.prototype.getArea = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  GeoEntity.prototype.isVisible = function() {
    return this._visible;
  };

  GeoEntity.prototype.show = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  GeoEntity.prototype.hide = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  GeoEntity.prototype.toggleVisibility = function() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  };

  return GeoEntity;
});
