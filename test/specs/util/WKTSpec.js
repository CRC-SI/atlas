define([
  'atlas/model/GeoPoint',
  'atlas/model/Vertex',
  // Code under test
  'atlas/util/WKT'
], function(GeoPoint, Vertex, WKT) {
  describe('WKT Utility', function() {

    var wkt, wktPolygonStr, polyGeoPoints, polyVertices, lineGeoPoints, lineVertices;

    beforeEach(function() {
      wkt = WKT.getInstance();
      wktPolygonStr =
          'POLYGON((-37.82673149546436 145.23770974470838,-37.82679037235421 145.23770595291575,-37.82673149546436 145.23770974470838))';
      wktLineStr =
          'LINESTRING(-37.82673149546436 145.23770974470838,-37.82679037235421 145.23770595291575,-37.82673149546436 145.23770974470838)';
      polyGeoPoints = [
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838}),
        new GeoPoint({latitude: -37.82679037235421, longitude: 145.23770595291575}),
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838})
      ];
      polyVertices = polyGeoPoints.map(function (point) {
        return new Vertex(point.longitude, point.latitude);
      });
      lineGeoPoints = [
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838}),
        new GeoPoint({latitude: -37.82679037235421, longitude: 145.23770595291575}),
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838})
      ];
      // TODO(aramk) Add method for this.
      lineVertices = lineGeoPoints.map(function (point) {
        return new Vertex(point.longitude, point.latitude);
      });
    });

    afterEach(function() {
      wkt = null;
    });

    it('can convert vertices to WKT', function() {
      expect(wkt.wktFromVertices(polyVertices)).toEqual(wktPolygonStr);
      expect(wkt.wktFromGeoPoints(polyGeoPoints)).toEqual(wktPolygonStr);
    });

    it('can convert a WKT polygon to vertices', function() {
      expect(wkt.verticesFromWKT(wktPolygonStr)).toEqual([polyVertices]);
      expect(wkt.geoPointsFromWKT(wktPolygonStr)).toEqual([polyGeoPoints]);
    });

    it('can convert a WKT line to vertices', function() {
      expect(wkt.verticesFromWKT(wktLineStr)).toEqual(lineVertices);
      expect(wkt.geoPointsFromWKT(wktLineStr)).toEqual(lineGeoPoints);
    });

  });
});
