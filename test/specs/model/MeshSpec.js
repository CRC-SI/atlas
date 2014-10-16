define([
  'atlas/assets/testMesh',
  // Code under test
  'atlas/model/Mesh',
  'atlas/model/GeoPoint'
], function(testMesh, Mesh, GeoPoint) {
  describe('A Mesh', function() {

    var mesh, centroid, area, constructArgs;

    beforeEach(function() {
      // TODO(aramk) This isn't the actual centroid - calculate the value below and replace if it's
      // reasonable.
      centroid =
          new GeoPoint({longitude: 145.2376011191871, latitude: -37.82674343831081, elevation: 0});
      area = 184.8778;
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
