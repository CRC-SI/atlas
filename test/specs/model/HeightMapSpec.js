define([
  'atlas/model/HeightMap'
], function(HeightMap) {

  var heightmap;
  var args;

  describe('A HeightMap', function() {

    beforeEach(function() {
      args = {
        geoLocation: {latitude: -37, longitude: 145},
        resolution: 1,
        width: 1,
        height: 1,
        points: [[12]]
      };
    });

    afterEach(function() {
      heightmap = null;
    });

    it('can be constructed', function() {
      heightmap = new HeightMap(args);
      expect(heightmap).toBeDefined();
    });

    describe('cannot be constructed when missing property', function() {
      ['geoLocation', 'resolution', 'width', 'height', 'points'].forEach(function(property) {
        it(property, function() {
          var temp = args[property];
          args[property] = undefined;
          expect(function() {
            new HeightMap(args);
          }).toThrow();
          args[property] = temp;
        });

      });

    });

    it('can calculate the actual centroid when the geolocation is offset', function() {
      args.x = 100;
      heightmap = new HeightMap(args);
      var actual = heightmap._centroidFromGeoLocation();
      expect(actual).toBeDefined();
      expect(actual.longitude).toBeCloseTo(145.001, 3);
      expect(actual.latitude).toBeCloseTo(-37.0, 1);
    });

    it('can calculate the actual centroid when there is no offset', function() {
      heightmap = new HeightMap(args);
      var actual = heightmap._centroidFromGeoLocation();
      expect(actual).toBeDefined();
      expect(actual.longitude).toBeCloseTo(145, 6);
      expect(actual.latitude).toBeCloseTo(-37, 6);
    });

  });

});
