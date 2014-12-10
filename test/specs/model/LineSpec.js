define([
  'atlas/events/EventManager',
  // Code under test
  'atlas/model/Line',
  'atlas/model/GeoPoint',
  'atlas/util/WKT'
], function(EventManager, Line, GeoPoint, WKT) {
  describe('A Polygon', function() {

    var line, wktLine, constructArgs, vertices, eventManager;

    beforeEach(function() {
      wktLine =
          'LINESTRING (-37.826731495464358 145.237709744708383,-37.82679037235421 145.237705952915746,-37.826788424406047 145.237562742764595,-37.826747996976231 145.237473553563689,-37.826702438444919 145.237482137149016,-37.82670417818575 145.237710588552915,-37.826731495464358 145.237709744708383)';
      var id = 12345;
      var data = {
        vertices: wktLine
      };
      eventManager = new EventManager({dom: {}, event: {}, render: {}});
      constructArgs = {
        renderManager: {},
        eventManager: eventManager
      };
      vertices = WKT.getInstance().geoPointsFromWKT(wktLine);
      line = new Line(id, data, constructArgs);
    });

    afterEach(function() {
      line = eventManager = null;
    });

    describe('can be constructed', function() {
      it('with defaults', function() {
        expect(line.getVertices()).toEqual(vertices);
        expect(line.getElevation()).toEqual(0);
        expect(line.isVisible()).toEqual(false);
        expect(line.isRenderable()).toEqual(false);
        expect(line.getStyle()).toEqual(Style.getDefault());
      });
    });

    // TODO(aramk) Finish these tests. Also merge the old Line.js test in Dojo into this spec.

//    it('can set elevation', function() {
//      var value = 50;
//      line.setElevation(value);
//      expect(line.getElevation()).toEqual(value);
//    });
//
//    it('can be translated', function() {
//      var oldCentroid = line.getCentroid();
//      var value = new GeoPoint({latitude: 0.001, longitude: 0.001});
//      line.translate(value);
//      expect(line.getCentroid().isCloseTo(oldCentroid.translate(value))).toBe(true);
//    });
//
//    it('can be selected and deselected', function() {
//      var oldStyle = line.getStyle();
//      line.setSelected(true);
//      expect(line.getStyle()).not.toEqual(oldStyle);
//      // Selecting again should not lose previous style info.
//      line.setSelected(true);
//      line.setSelected(false);
//      expect(line.getStyle()).toEqual(oldStyle);
//      // Deselecting again should have no effect.
//      line.setSelected(false);
//      expect(line.getStyle()).toEqual(oldStyle);
//    });
//
//    it('can be selected', function() {
//      var spy = jasmine.createSpy();
//      eventManager.addEventHandler('intern', 'entity/select', spy);
//      line.setSelected(true);
//      expect(spy.calls.count()).toEqual(1);
//    });

  });
});
