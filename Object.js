define([
  'GeoEntity'
], function (GeoEntity) {

  var Object = function () {
    this.prototype = GeoEntity;
    
    this.footprint = null;
    this.model = null;
    this.height = 0;
    this.displayMode = null;
    this.visible = false;
  };

});
