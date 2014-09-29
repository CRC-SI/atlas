define([
  'atlas/assets/testMesh',
  // Code under test
  'atlas/model/Mesh',
  'atlas/model/GeoPoint'
], function(testMesh, Mesh, GeoPoint) {
  describe('A Mesh', function() {

    var mesh, centroid, area, constructArgs;

    beforeEach(function() {
      // TODO(aramk) This isn't the actual centroid.
      centroid =
          new GeoPoint({longitude: -37.82674343831081, latitude: 145.23760111918708, elevation: 0});
      area = 177.754;
      constructArgs = {
        renderManager: {},
        eventManager: {}
      };
      mesh = new Mesh('a', testMesh, constructArgs);
    });

    afterEach(function() {
      mesh = null;
    });

    it('has a location', function() {
      expect(mesh.getGeoLocation()).toEqual(new GeoPoint(testMesh.geoLocation));
    });

    // TODO(aramk) Centroid needs vertices of a mesh, which use matrix transformations only
    // available in Cesium.
    xit('has a centroid', function() {
      expect(mesh.getCentroid()).toEqual(centroid);
    });

  });
});
