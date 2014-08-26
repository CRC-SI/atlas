define([
  // Code under test
  'atlas/model/Polygon',
  'atlas/model/GeoPoint',
  'atlas/util/WKT'
], function(Polygon, GeoPoint, WKT) {
  describe('A Polygon', function() {

    var polygon, footprint, centroid, area, constructArgs, vertices;

    beforeEach(function() {
      footprint =
          'POLYGON ((145.237709744708383 -37.826731495464358,145.237705952915746 -37.82679037235421,145.237562742764595 -37.826788424406047,145.237473553563689 -37.826747996976231,145.237482137149016 -37.826702438444919,145.237710588552915 -37.82670417818575,145.237709744708383 -37.826731495464358))';
      centroid =
          new GeoPoint({longitude: -37.82674343831081, latitude: 145.23760111918708, elevation: 0});
      area = 177.754;
      var id = 12345;
      var data = {
        vertices: footprint
      };
      constructArgs = {
        renderManager: {},
        eventManager: {}
      };
      vertices = WKT.getInstance().verticesFromWKT(footprint);
      polygon = new Polygon(id, data, constructArgs);
    });

    afterEach(function() {
      polygon = null;
    });

    describe('can be constructed', function() {
      it('with defaults', function() {
        expect(polygon.getHeight()).toEqual(0);
        expect(polygon.getElevation()).toEqual(0);
        expect(polygon.isVisible()).toEqual(false);
        expect(polygon.isRenderable()).toEqual(false);
        expect(polygon.getStyle()).toEqual(Polygon.getDefaultStyle());
      });
    });

    it('has a centroid', function() {
      expect(polygon.getCentroid()).toEqual(centroid);
    });

    it('has an area', function() {
      expect(polygon.getArea()).toBeCloseTo(area);
    });

  });
});
