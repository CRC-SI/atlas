define([
  'atlas/events/EventManager',
  // Code under test
  'atlas/model/Polygon',
  'atlas/model/GeoPoint',
  'atlas/model/Vertex',
  'atlas/material/Style',
  'atlas/util/WKT',
  'underscore'
], function(EventManager, Polygon, GeoPoint, Vertex, Style, WKT, _) {
  describe('A Polygon', function() {

    var polygon, footprint, centroid, area, constructArgs, vertices, eventManager;

    beforeEach(function() {
      footprint =
          'POLYGON ((-37.826731495464358 145.237709744708383,-37.82679037235421 145.237705952915746,-37.826788424406047 145.237562742764595,-37.826747996976231 145.237473553563689,-37.826702438444919 145.237482137149016,-37.82670417818575 145.237710588552915,-37.826731495464358 145.237709744708383))';
      centroid =
          new GeoPoint({longitude: 145.2376011191871, latitude: -37.82674343831081, elevation: 0});
      area = 177.41975635976996;
      var id = 12345;
      var data = {
        vertices: footprint
      };
      eventManager = new EventManager({dom: {}, event: {}, render: {}});
      constructArgs = {
        renderManager: {},
        eventManager: eventManager
      };
      vertices = WKT.getInstance().geoPointsFromWKT(footprint);
      polygon = new Polygon(id, data, constructArgs);
    });

    afterEach(function() {
      polygon = eventManager = null;
    });

    describe('can be constructed', function() {
      it('with defaults', function() {
        expect(polygon.getHeight()).toEqual(0);
        expect(polygon.getElevation()).toEqual(0);
        expect(polygon.isVisible()).toEqual(true);
        expect(polygon.isRenderable()).toEqual(true);
        expect(polygon.getStyle()).toEqual(Style.getDefault());
      });
    });

    it('has a centroid', function() {
      expect(polygon.getCentroid()).toEqual(centroid);
      expect(polygon.toJson().centroid).toEqual(centroid.toArray());
      var translation = new GeoPoint({latitude: 0.001, longitude: 0.001});
      polygon.translate(translation);
      // Ensure the centroid in the JSON doesn't change due to transformations.
      expect(polygon.toJson().centroid).toEqual(centroid.toArray());
    });

    it('has an area', function() {
      expect(polygon.getArea()).toBeCloseTo(area);
    });

    it('can set height', function() {
      var value = 50;
      polygon.setHeight(value);
      expect(polygon.getHeight()).toEqual(value);
      expect(polygon.isExtrusion()).toEqual(true);
    });

    it('can set elevation', function() {
      var value = 50;
      polygon.setElevation(value);
      expect(polygon.getElevation()).toEqual(value);
    });

    it('can be selected and deselected', function() {
      var oldStyle = polygon.getStyle();
      polygon.setSelected(true);
      // Selecting an entity doesn't affect the result of getStyle(), despite the entity
      // changing appearance due to the selection.
      expect(polygon.getStyle()).toEqual(oldStyle);
      // Selecting again should not lose previous style info.
      polygon.setSelected(true);
      polygon.setSelected(false);
      expect(polygon.getStyle()).toEqual(oldStyle);
      // Deselecting again should have no effect.
      polygon.setSelected(false);
      expect(polygon.getStyle()).toEqual(oldStyle);
    });

    it('can be selected', function() {
      var spy = jasmine.createSpy();
      eventManager.addEventHandler('intern', 'entity/select', spy);
      polygon.setSelected(true);
      expect(spy.calls.count()).toEqual(1);
    });

    it('has a null centroid if no vertices exist', function() {
      var polygon2 = new Polygon('foo', {vertices: []}, constructArgs);
      expect(polygon2.getCentroid()).toEqual(null);
    });

    it('can be translated', function() {
      testTransformations(function() {
        var oldCentroid = polygon.getCentroid();
        var translation = new GeoPoint({latitude: 0.001, longitude: 0.001});
        polygon.translate(translation);
        expect(polygon.getCentroid().isCloseTo(oldCentroid.translate(translation))).toBe(true);
        var json = polygon.toJson();
        expect(json.translation).toDeepEqual(translation.toArray());
      });
    });

    it('can be scaled', function() {
      testTransformations(function() {
        var oldArea = polygon.getArea();
        var scale = new Vertex(2, 2, 2);
        polygon.scale(scale);
        var json = polygon.toJson();
        expect(oldArea).not.toEqual(polygon.getArea());
        expect(json.scale).toDeepEqual(scale.toArray());
      });
    });

    it('can be rotated', function() {
      var rotation = new Vertex(0, 0, 90);
      polygon.rotate(rotation);
      var json = polygon.toJson();
      expect(json.rotation).toDeepEqual(rotation.toArray());

      // TODO(aramk) Atlas currently doesn't support rotation transformations affecting the vertices
      // of a polygon.s
      // testTransformations(function() {
      //   var rotation = new Vertex(0, 0, 90);
      //   polygon.rotate(rotation);
      // });
    });

    // AUXILIARY

    // getVertices() returns a shallow copy, so we need to clone them to make comparisons after
    // transformations.
    function getVerticesArray(vertices) {
      return _.map(vertices, function(vertex) {
        return vertex.toArray();
      });
    }

    function testTransformations(callback) {
      var oldVertices = getVerticesArray(polygon.getVertices());
      var initialVerticesBefore = getVerticesArray(polygon.getInitialVertices());
      expect(initialVerticesBefore).toDeepEqual(oldVertices);
      // Apply transformations.
      callback();
      var newVertices = getVerticesArray(polygon.getVertices());
      expect(newVertices).not.toDeepEqual(oldVertices);
      // Ensure initial vertices are not affected by transformations.
      var initialVerticesAfter = getVerticesArray(polygon.getInitialVertices());
      expect(initialVerticesAfter).toDeepEqual(oldVertices);
      expect(initialVerticesAfter).toDeepEqual(initialVerticesBefore);
      // The JSON should use the original coordinates.
      var json = polygon.toJson();
      expect(json.coordinates).toDeepEqual(initialVerticesAfter);
    }

  });
});
