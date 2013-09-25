define([
], function () {
  var geoEntity = {
    _centroid: null,
    _area: null,
    _visible: null,
  };

  geoEntity.prototype.getCentroid = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  geoEntity.prototype.getArea = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  geoEntity.prototype.isVisible = function() {
    return this._visible;
  };

  geoEntity.prototype.show = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  geoEntity.prototype.hide = function() {
    throw new DeveloperError('Can not call method of abstract GeoEntity');
  };

  geoEntity.prototype.toggleVisibility = function() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }
  };
});
