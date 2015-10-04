define([
  'atlas/events/EventManager',
  'atlas/lib/utility/Setter',
  // Code under test
  'atlas/model/Feature',
  'atlas/model/Polygon',
  'atlas/model/Mesh',
  'atlas/model/GeoPoint',
  'atlas/util/WKT'
], function(EventManager, Setter, Feature, Polygon, Mesh, GeoPoint, WKT) {
  describe('A Feature', function() {

    var feature, polygon, footprint, constructArgs, vertices, eventManager;

    beforeEach(function() {
      footprint =
          'POLYGON ((-37.826731495464358 145.237709744708383,-37.82679037235421 145.237705952915746,-37.826788424406047 145.237562742764595,-37.826747996976231 145.237473553563689,-37.826702438444919 145.237482137149016,-37.82670417818575 145.237710588552915,-37.826731495464358 145.237709744708383))';
      var id = 12345;
      var data = {
        vertices: footprint,
        show: false
      };
      eventManager = new EventManager({dom: {}, event: {}, render: {}});
      constructArgs = {
        renderManager: {},
        eventManager: eventManager
      };
      vertices = WKT.getInstance().geoPointsFromWKT(footprint);
      polygon = new Polygon(id + '-poly', data, constructArgs);
      feature = new Feature(id, {polygon: polygon}, constructArgs);
    });

    afterEach(function() {
      feature = polygon = eventManager = null;
    });

    it('listens to selections on the form', function() {
      var spy = jasmine.createSpy();
      eventManager.addEventHandler('intern', 'entity/select', spy);
      polygon.setSelected(true);
      // Ensure both the entity and the feature emit a select event.
      expect(spy.calls.count()).toEqual(2);
      expect(feature.isSelected()).toBe(true);
    });

    it('can be selected and deselected', function() {
      feature.setSelected(false);
      var oldStyle = feature.getVisibleStyle().toJson();
      expect(polygon.getVisibleStyle().toJson()).toDeepEqual(oldStyle);
      feature.setSelected(true);
      expect(feature.getVisibleStyle().toJson()).not.toDeepEqual(oldStyle);
      expect(polygon.getVisibleStyle().toJson()).not.toDeepEqual(oldStyle);
      expect(feature.isSelected()).toBe(true);
      expect(polygon.isSelected()).toBe(true);
      // Selecting again should not lose previous style info.
      feature.setSelected(true);
      feature.setSelected(false);
      expect(feature.getVisibleStyle().toJson()).toDeepEqual(oldStyle);
      expect(polygon.getVisibleStyle().toJson()).toDeepEqual(oldStyle);
      // Deselecting again should have no effect.
      feature.setSelected(false);
      expect(feature.getVisibleStyle().toJson()).toDeepEqual(oldStyle);
    });

    it('can have display modes', function() {
      var mesh = new Mesh('mesh-1', {
        geoLocation: {latitude: -37.826731495464358, longitude: 145.237709744708383},
        show: false
      }, constructArgs);
      // Avoid rendering meshes since they rely on the provider implementation.
      mesh._build = function() {};
      var multiFeature = new Feature(123, {
        polygon: polygon,
        mesh: mesh
      }, constructArgs);
      expect(multiFeature.getDisplayMode()).toEqual(Feature.DisplayMode.MESH);
      expect(multiFeature.getForm(Feature.DisplayMode.MESH)).toEqual(mesh);
      expect(multiFeature.getForm(Feature.DisplayMode.EXTRUSION)).toEqual(polygon);
      expect(multiFeature.getForms()).toEqual([mesh, polygon]);
      multiFeature.setDisplayMode(Feature.DisplayMode.EXTRUSION);
      expect(multiFeature.getDisplayMode()).toEqual(Feature.DisplayMode.EXTRUSION);
    });

    // TODO(aramk) Add remaining tests from DOH spec.

  });
});
