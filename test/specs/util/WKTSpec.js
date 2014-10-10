define([
  'atlas/model/GeoPoint',
  'atlas/model/Vertex',
  // Code under test
  'atlas/util/WKT',
  'atlas/lib/OpenLayers'
], function(GeoPoint, Vertex, WKT, OpenLayers) {
  describe('WKT Utility', function() {

    var wkt, wktPolygonStr, wktLineStr, polyGeoPoints, polyVertices, lineGeoPoints, lineVertices,
        openLayersPolygon;

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
      polyVertices = polyGeoPoints.map(function(point) {
        return new Vertex(point.longitude, point.latitude);
      });
      lineGeoPoints = [
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838}),
        new GeoPoint({latitude: -37.82679037235421, longitude: 145.23770595291575}),
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838})
      ];
      // TODO(aramk) Add method for this.
      lineVertices = lineGeoPoints.map(function(point) {
        return new Vertex(point.longitude, point.latitude);
      });
      openLayersPolygon = wkt.openLayersPolygonFromVertices(polyVertices);
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

    it('can convert open layers geometry to vertices', function() {
      expect(wkt.verticesFromOpenLayersGeometry(openLayersPolygon)).toEqual([polyVertices]);
    });

    it('can convert open layers geometry to geopoints', function() {
      expect(wkt.geoPointsFromOpenLayersGeometry(openLayersPolygon)).toEqual([polyGeoPoints]);
    });

    it('can convert an open layers point to a vertex', function() {
      expect(wkt.vertexFromOpenLayersPoint(new OpenLayers.Geometry.Point(10,
          20))).toEqual(new Vertex(20, 10));
    });

    it('can convert an open layers point to a geopoint', function() {
      expect(wkt.geoPointFromOpenLayersPoint(new OpenLayers.Geometry.Point(10,
          20))).toEqual(new GeoPoint({longitude: 20, latitude: 10}));
    });

  });
});
