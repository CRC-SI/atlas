define([
  'atlas/events/EventManager',
  'atlas/lib/utility/Setter',
  // Code under test
  'atlas/model/Feature',
  'atlas/model/Polygon',
  'atlas/model/GeoPoint',
  'atlas/util/WKT'
], function(EventManager, Setter, Feature, Polygon, GeoPoint, WKT) {
  describe('A Feature', function() {

    var feature, polygon, footprint, centroid, area, constructArgs, vertices, eventManager;

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
      eventManager = new EventManager({dom: {}, event: {}, render: {}});
      constructArgs = {
        renderManager: {},
        eventManager: eventManager
      };
      vertices = WKT.getInstance().verticesFromWKT(footprint);
      polygon = new Polygon(id + '-poly', data, constructArgs);
      feature = new Feature(id, Setter.mixin({polygon: polygon}, constructArgs));
    });

    afterEach(function() {
      feature = polygon = eventManager = null;
    });

    it('can be selected', function() {
      var spy = jasmine.createSpy();
      eventManager.addEventHandler('intern', 'entity/select', spy);
      polygon.setSelected(true);
      expect(spy.calls.count()).toEqual(2);
      expect(feature.isSelected()).toBe(true);
    });

    // TODO(aramk) Add remaining tests from DOH spec.

  });
});
