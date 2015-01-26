define([
  'atlas/model/GeoPoint',
  'atlas/model/HeightMap'
], function(GeoPoint, HeightMap) {

  var heightmap;
  var args;

  describe('A HeightMap', function() {
    /* global GlobalLog*/

    // var extent = {
    //   north: -37.00004729949923,
    //   south: -36.99995263411956,
    //   east: 145.0000590099906,
    //   west: 144.99994098343888
    // };

    beforeEach(function() {
      args = {
        geoLocation: {latitude: -37, longitude: 145},
        resolution: 5,
        width: 500,
        height: 500,
        points: [[1, 2, 3, 4, 5], [11, 12, 13, 14, 15], [21, 22, 23, 24, 25], [31, 32, 33, 34, 35],
            [41, 42, 43, 44, 45]]
      };
      GlobalLog.setLevel('debug');
    });

    afterEach(function() {
      heightmap = null;
      GlobalLog.setLevel('error');
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

    describe('Extent:', function() {
      it('can calculate the actual centroid when there is no offset', function() {
        heightmap = new HeightMap(args);
        var actual = heightmap._centroidFromGeoLocation();
        expect(actual).toBeDefined();
        expect(actual.longitude).toBeCloseTo(145, 6);
        expect(actual.latitude).toBeCloseTo(-37, 6);
      });

      it('can calculate the extent of the terrain model when in the southern hemisphere',
          function() {
        heightmap = new HeightMap(args);

        var rect = heightmap._calculateExtent();
        expect(rect).toBeDefined();
        expect(rect.north).toBeGreaterThan(rect.south, 'North south');
        expect(rect.east).toBeGreaterThan(rect.west, 'East west');
      });

      it('can calculate the extent of the terrain model when in the northern hemisphere',
          function() {
        args.geoLocation.latitude = 37;
        heightmap = new HeightMap(args);

        var rect = heightmap._calculateExtent();
        expect(rect).toBeDefined();
        expect(rect.north).toBeGreaterThan(rect.south, 'North south');
        expect(rect.east).toBeGreaterThan(rect.west, 'East west');
      });

      it('can calculate the extent of the terrain model when longitude is negative', function() {
        args.geoLocation.longitude = -144;
        heightmap = new HeightMap(args);

        var rect = heightmap._calculateExtent();
        expect(rect).toBeDefined();
        expect(rect.north).toBeGreaterThan(rect.south, 'North south');
        expect(rect.east).toBeGreaterThan(rect.west, 'East west');
      });
    });

  });

});
