define([
  'atlas/model/GeoPoint',
  'atlas/model/HeightMap'
], function(GeoPoint, HeightMap) {

  var heightmap;
  var args;

  describe('A HeightMap', function() {
    /* global GlobalLog */
    /* jshint unused:false */

    var centroid = {latitude: -37, longitude: 145};
    // Calculated from centroid using
    //     http://home.hiwaay.net/~taylorc/toolbox/geography/geoutm.html
    var centroidUtm = {easting: 322037.8102203241, northing: 5903257.940913517};

    beforeEach(function() {
      args = {
        geoLocation: new GeoPoint(centroid),
        resolution: 5,
        width: 500,
        height: 600,
        points: [[1,  2,  3,  4,  5],
                [11, 12, 13, 14, 15],
                [21, 22, 23, 24, 25],
                [31, 32, 33, 34, 35],
                [41, 42, 43, 44, 45]]
      };
      GlobalLog.setLevel('debug');
    });

    afterEach(function() {
      args.x = null;
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

    describe('when not offset', function() {
      // Centre edge points, calculated by +/- 250m or +/- 300m (args.width or args.height / 2) for
      // east/west or north/south.
      var northUtm = {easting: 322037.8102203241, northing: 5903557.940913517};
      var southUtm = {easting: 322037.8102203241, northing: 5902957.940913517};
      var eastUtm = {easting: 322287.8102203241, northing: 5903257.940913517};
      var westUtm = {easting: 321787.8102203241, northing: 5903257.940913517};

      // Calculated from above UTM coords using
      //     http://home.hiwaay.net/~taylorc/toolbox/geography/geoutm.html
      var north = {latitude: -36.99729732231739, longitude: 145.0000708112027};
      var south = {latitude: -37.002702676328965, longitude: 144.99992917934057};
      var east = {latitude: -37.000047299499236, longitude: 145.0028080312911};
      var west = {latitude: -36.99995263411956, longitude: 144.9971919752574};

      testExtentsCalculatedCorrectly(north, south, east, west);

      var farSouthEast = {latitude: south.latitude, longitude: east.longitude};
      var midSouthWest = {latitude: -37.0011, longitude: 144.9986};

      it('can calculate the actual centroid', function() {
        heightmap = new HeightMap(args);
        var actual = heightmap.getGeoLocation();
        expect(actual).toBeDefined();
        expect(actual.longitude).toBeCloseTo(145, 10);
        expect(actual.latitude).toBeCloseTo(-37, 10);
      });

      testSampleTerrainIsCorrect(centroid, north, farSouthEast, midSouthWest);

    });

    describe('when offset', function() {
      beforeEach(function() {
        args.x = 100;  // offsetX
        args.z = 200;  // offsetY
        GlobalLog.setLevel('debug');
      });

      afterEach(function() {
        GlobalLog.setLevel('error');
        args.x = args.y = null;
      });

      // Calculated incorporating the offset.
      var centroid = {latitude: -37.00096709512646, longitude: 145.00390768613428};

      // Want CENTRE points of each edge, but geoLocation + offset = NW corner. Therefore:
      //   North: offsetX + width / 2, offsetY
      //   South: offsetX + width / 2, offsetY - height
      //   East: offsetX + width, offsetY - height / 2
      //   West: offsetX, offsetY - height / 2
      var northUtm = {easting: 322387.8102203264, northing: 5903457.940913513};
      var southUtm = {easting: 322387.8102203264, northing: 5902857.940913513};
      var eastUtm = {easting: 322637.8102203264, northing: 5903157.940913513};
      var westUtm = {easting: 322137.8102203264, northing: 5903157.940913513};

      // Calculated from above UTM coords using
      //     http://home.hiwaay.net/~taylorc/toolbox/geography/geoutm.html
      var north = {latitude: -36.998264411438875, longitude: 145.00397836152217};
      var south = {latitude: -37.003669777464566, longitude: 145.00383700131877};
      var east = {latitude: -37.00101430323305, longitude: 145.00671575968846};
      var west = {latitude: -37.00091982063955, longitude: 145.00109961912713};

      // Used to check sampleTerrain, estimated from the above.
      var farSouthEast = {latitude: south.latitude, longitude: east.longitude};
      var midSouthWest = {latitude: -37.0025, longitude: 145.0028};

      testExtentsCalculatedCorrectly(north, south, east, west);

      it('can calculate the actual centroid when the geolocation is offset', function() {
        heightmap = new HeightMap(args);
        var actual = heightmap.getGeoLocation();
        expect(actual).toBeDefined();
        expect(actual.longitude).toBeCloseTo(centroid.longitude, 10);
        expect(actual.latitude).toBeCloseTo(centroid.latitude, 4);
      });

      testSampleTerrainIsCorrect(centroid, north, farSouthEast, midSouthWest);

    });

  });

  function testExtentsCalculatedCorrectly(north, south, east, west) {
    describe('Extent:', function() {
      it('can calculate the extent of the terrain model when in the southern hemisphere',
          function() {
        heightmap = new HeightMap(args);

        var rect = heightmap._calculateExtent();
        expect(rect).toBeDefined();
        expect(rect.north).toBeGreaterThan(rect.south, 'North south');
        expect(rect.east).toBeGreaterThan(rect.west, 'East west');
        expect(rect.getNorth()).toBeCloseTo(north.latitude, 10, 'North');
        expect(rect.getSouth()).toBeCloseTo(south.latitude, 10, 'South');
        expect(rect.getEast()).toBeCloseTo(east.longitude, 10, 'East');
        expect(rect.getWest()).toBeCloseTo(west.longitude, 10, 'West');
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
  }

  function testSampleTerrainIsCorrect(centroid, north, farSouthEast, midSouthWest) {
    it('should return the nearest terrain elevation when the given GeoPoint is within the' +
        'terrain model and at the centre', function() {
      heightmap = new HeightMap(args);

      var height = heightmap.sampleTerrainAtPoint(new GeoPoint(centroid));
      expect(height).toEqual(23);
    });

    it('should return the nearest terrain elevation when the given GeoPoint is within the' +
        ' terrain model and not at the centre (centre far north)', function() {
      heightmap = new HeightMap(args);

      // Northern edge at the centre
      var height = heightmap.sampleTerrainAtPoint(new GeoPoint(north));
      expect(height).toEqual(3);
    });

    it('should return the nearest terrain elevation when the given GeoPoint is within the' +
        ' terrain model and not at the centre (far south east)', function() {
      heightmap = new HeightMap(args);

      // South east corner
      var height = heightmap.sampleTerrainAtPoint(new GeoPoint(farSouthEast));
      expect(height).toEqual(45);
    });

    it('should return the nearest terrain elevation when the given GeoPoint is within the' +
        ' terrain model and not at the centre (mid south west)', function() {
      heightmap = new HeightMap(args);

      var height = heightmap.sampleTerrainAtPoint(new GeoPoint(midSouthWest));
      expect(height).toEqual(32);
    });

    it('should return an array of heights when given an array of GeoPoints', function() {
      heightmap = new HeightMap(args);
      var points = [new GeoPoint(centroid),
                    new GeoPoint(north),
                    new GeoPoint(farSouthEast)];

      expect(heightmap.sampleTerrain(points)).toEqual([23, 3, 45]);
    });
  }

});
