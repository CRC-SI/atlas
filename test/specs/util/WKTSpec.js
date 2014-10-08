define([
  'atlas/model/GeoPoint',
  // Code under test
  'atlas/util/WKT'
], function(GeoPoint, WKT) {
  describe('WKT Utility', function() {

    var wkt, wktPolygonStr, vertices;

    beforeEach(function() {
      wkt = WKT.getInstance();
      wktPolygonStr =
          'POLYGON((-37.82673149546436 145.23770974470838,-37.82679037235421 145.23770595291575,-37.82673149546436 145.23770974470838))';
      wktLineStr =
          'LINESTRING(-37.82673149546436 145.23770974470838,-37.82679037235421 145.23770595291575,-37.82673149546436 145.23770974470838)';
      vertices = [
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838}),
        new GeoPoint({latitude: -37.82679037235421, longitude: 145.23770595291575}),
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838})
      ];
    });

    afterEach(function() {
      wkt = null;
    });

    it('can convert vertices to WKT', function() {
      expect(wkt.wktFromVertices(vertices)).toEqual(wktPolygonStr);
    });

    it('can convert a WKT polygon to vertices', function() {
      expect(wkt.verticesFromWKT(wktPolygonStr)).toEqual([vertices]);
    });

    it('can convert a WKT line to vertices', function() {
      expect(wkt.verticesFromWKT(wktLineStr)).toEqual(vertices);
    });

  });
});
