define([
  'atlas/model/GeoPoint',
  'atlas/model/Vertex',
  // Code under test
  'atlas/util/WKT',
  'atlas/lib/OpenLayers'
], function(GeoPoint, Vertex, WKT, OpenLayers) {
  describe('WKT Utility', function() {

    var wkt, wktPolygonStr, wktPointStr, wktLineStr, polyGeoPoints, polyVertices, lineGeoPoints,
      lineVertices, openLayersPolygon, openLayersPoint, singleGeoPoint;

    beforeEach(function() {
      wkt = WKT.getInstance();
      wktPointStr = 'POINT(-37.82673149546436 145.23770974470838)';
      wktPolygonStr =
          'POLYGON((-37.82673149546436 145.23770974470838,-37.82679037235421 145.23770595291575,-37.82673149546436 145.23770974470838))';
      wktHoleyPolygonStr =
          'POLYGON((35 10,45 45,15 40,10 20,35 10),(20 30,35 35,30 20,20 30))';
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
      holeyPolyGeoPoints = [
        new GeoPoint({latitude: 35, longitude: 10}),
        new GeoPoint({latitude: 45, longitude: 45}),
        new GeoPoint({latitude: 15, longitude: 40}),
        new GeoPoint({latitude: 10, longitude: 20}),
        new GeoPoint({latitude: 35, longitude: 10})
      ];
      holeyPolyHoleGeoPoints = [
        new GeoPoint({latitude: 20, longitude: 30}),
        new GeoPoint({latitude: 35, longitude: 35}),
        new GeoPoint({latitude: 30, longitude: 20}),
        new GeoPoint({latitude: 20, longitude: 30})
      ];
      holeyPolyVertices = holeyPolyGeoPoints.map(function(point) {
        return new Vertex(point.longitude, point.latitude);
      });
      holeyPolyHoleVertices = holeyPolyHoleGeoPoints.map(function(point) {
        return new Vertex(point.longitude, point.latitude);
      });
      lineGeoPoints = [
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838}),
        new GeoPoint({latitude: -37.82679037235421, longitude: 145.23770595291575}),
        new GeoPoint({latitude: -37.82673149546436, longitude: 145.23770974470838})
      ];
      singleGeoPoint = new GeoPoint(145.23770974470838, -37.82673149546436);
      // TODO(aramk) Add method for this.
      lineVertices = lineGeoPoints.map(function(point) {
        return new Vertex(point.longitude, point.latitude);
      });
      openLayersPolygon = wkt.openLayersPolygonFromVertices(polyVertices);
      openLayersPoint = wkt.openLayersPointsFromGeoPoints([singleGeoPoint])[0];
    });

    afterEach(function() {
      wkt = null;
    });

    it('can convert vertices to WKT', function() {
      expect(wkt.wktFromVertices(polyVertices)).toEqual(wktPolygonStr);
      expect(wkt.wktFromGeoPoints(polyGeoPoints)).toEqual(wktPolygonStr);
    });

    it('can convert a WKT polygon to vertices', function() {
      expect(wkt.verticesFromWKT(wktPolygonStr)).toEqual(polyVertices);
      expect(wkt.geoPointsFromWKT(wktPolygonStr)).toEqual(polyGeoPoints);
    });

    it('can convert a WKT polygon to vertices and holes', function() {
      var result = wkt.verticesAndHolesFromWKT(wktHoleyPolygonStr);
      expect(result.vertices).toEqual(holeyPolyVertices);
      expect(result.holes.length).toEqual(1);
      expect(result.holes[0]).toEqual(holeyPolyHoleVertices);
    });

    it('can convert a WKT polygon to vertices and no holes', function() {
      var result = wkt.verticesAndHolesFromWKT(wktPolygonStr);
      expect(result.vertices).toEqual(polyVertices);
      expect(result.holes.length).toEqual(0);
    });

    it('can convert vertices and holes to a WKT polygon', function() {
      var rings = [holeyPolyVertices, holeyPolyHoleVertices];
      var result = wkt.wktFromVerticesAndHoles(rings);
      expect(result).toEqual(wktHoleyPolygonStr);
    });

    it('can convert a WKT line to vertices', function() {
      expect(wkt.verticesFromWKT(wktLineStr)).toEqual(lineVertices);
      expect(wkt.geoPointsFromWKT(wktLineStr)).toEqual(lineGeoPoints);
    });

    it('can convert a WKT point to a vertex', function() {
      expect(wkt.verticesFromWKT(wktPointStr)).toEqual([singleGeoPoint.toVertex()]);
      expect(wkt.geoPointsFromWKT(wktPointStr)).toEqual([singleGeoPoint]);
    });

    it('can convert a geopoint to a WKT point', function() {
      expect(wkt.wktFromGeoPoint(singleGeoPoint)).toEqual(wktPointStr);
    });

    it('can convert open layers geometry to vertices', function() {
      expect(wkt.verticesFromOpenLayersGeometry(openLayersPolygon)).toEqual(polyVertices);
    });

    it('can convert open layers geometry to geopoints', function() {
      expect(wkt.geoPointsFromOpenLayersGeometry(openLayersPolygon)).toEqual(polyGeoPoints);
    });

    it('can convert open layers point to vertex', function() {
      expect(wkt.verticesFromOpenLayersGeometry(openLayersPoint))
          .toEqual([singleGeoPoint.toVertex()]);
    });

    it('can convert open layers point to geopoint', function() {
      expect(wkt.geoPointsFromOpenLayersGeometry(openLayersPoint)).toEqual([singleGeoPoint]);
    });

    it('can convert an open layers point to a vertex', function() {
      expect(wkt.vertexFromOpenLayersPoint(new OpenLayers.Geometry.Point(10,
          20))).toEqual(new Vertex(20, 10));
    });

    it('can convert an open layers point to a geopoint', function() {
      expect(wkt.geoPointFromOpenLayersPoint(new OpenLayers.Geometry.Point(10,
          20))).toEqual(new GeoPoint({longitude: 20, latitude: 10}));
    });

    it('can convert empty points to open layers geometry', function() {
      var polygon = wkt.openLayersPolygonFromGeoPoints([]);
      expect(polygon.components[0].components.length).toEqual(0);
    });

    it('can check whether a string is WKT', function() {
      expect(wkt.isPoint(wktPointStr)).toEqual(true);
      expect(wkt.isPolygon(wktPolygonStr)).toEqual(true);
      expect(wkt.isLine(wktLineStr)).toEqual(true);
      expect(wkt.isWKT(wktPointStr)).toEqual(true);
      expect(wkt.isWKT(wktPolygonStr)).toEqual(true);
      expect(wkt.isWKT(wktLineStr)).toEqual(true);
    });

  });
});
