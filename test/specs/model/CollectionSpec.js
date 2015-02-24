define([
  'atlas/entity/EntityManager',
  'atlas/events/EventManager',
  // Code under test
  'atlas/model/Collection',
  'atlas/model/GeoPoint',
  'atlas/model/Polygon',
  'atlas/model/Rectangle',
  'atlas/util/WKT'
], function(EntityManager, EventManager, Collection, GeoPoint, Polygon, Rectangle, WKT) {
  describe('A Collection', function() {

    var collection;
    var polygonA;
    var polygonB;
    var centroid;
    var constructArgs;

    beforeEach(function() {
      var managers = {};
      var entityManager = new EntityManager(managers);
      var eventManager = new EventManager(managers);
      constructArgs = {
        entityManager: entityManager,
        eventManager: eventManager
      };
      var footprintA = 'POLYGON ((-37.826731495464358 145.237709744708383,-37.82679037235421 145.237705952915746,-37.826788424406047 145.237562742764595,-37.826747996976231 145.237473553563689,-37.826702438444919 145.237482137149016,-37.82670417818575 145.237710588552915,-37.826731495464358 145.237709744708383))';
      var footprintB = 'POLYGON ((-27.826665517192573 145.237515259419183,-27.826664658962351 145.237656438291026,-27.826724305962919 145.23765472183058,-27.826721731272244 145.237514830304065,-27.826665517192573 145.237515259419183))';
      polygonA = new Polygon('a', {vertices: footprintA, show: false}, constructArgs);
      polygonB = new Polygon('b', {vertices: footprintB, show: false}, constructArgs);
      collection = new Collection('c', {entities: ['a', 'b']}, constructArgs);
      centroid =
          new GeoPoint({longitude: 145.2375891232596, latitude: -33.24677037183316, elevation: 0});
    });

    afterEach(function() {
      collection = polygonA = polygonB = null;
    });

    it('can have entities', function() {
      expect(collection.getEntity('a')).toEqual(polygonA);
      expect(collection.getEntity('b')).toEqual(polygonB);
      expect(collection.getEntities('b').getCount()).toEqual(2);
    });

    it('has centroid', function() {
      expect(collection.getCentroid()).toEqual(centroid);
    });

    it('has no centroid if no entities are added', function() {
      var collection2 = new Collection('c2', {}, constructArgs);
      expect(collection2.getCentroid()).toEqual(null);
    });

    it('cannot set centroid if no entities are added', function() {
      var collection2 = new Collection('c2', {}, constructArgs);
      expect(collection2.getCentroid()).toEqual(null);
    });

    it('has area', function() {
      expect(collection.getArea()).toEqual(polygonA.getArea() + polygonB.getArea());
    });

    it('can translate', function() {
      var polyAOldCentroid = polygonA.getCentroid();
      var polyBOldCentroid = polygonB.getCentroid();
      var amount = new GeoPoint({latitude: 0.001, longitude: 0.001});
      collection.translate(amount);
      // Centroid is recalculated and floating point math causes it to vary slightly.
      expect(collection.getCentroid().isCloseTo(centroid.translate(amount))).toBe(true);
      expect(polygonA.getCentroid().isCloseTo(polyAOldCentroid.translate(amount))).toBe(true);
      expect(polygonB.getCentroid().isCloseTo(polyBOldCentroid.translate(amount))).toBe(true);
    });

    it('is not initially visible', function() {
      spyOn(polygonA, 'isVisible').and.callThrough();
      spyOn(polygonB, 'isVisible').and.callThrough();
      var isVisible = collection.isVisible();
      expect(isVisible).toBe(false);
      expect(polygonA.isVisible()).toBe(isVisible);
      expect(polygonB.isVisible()).toBe(isVisible);
      expect(polygonA.isVisible.calls.any()).toEqual(true);
      expect(polygonB.isVisible.calls.any()).toEqual(true);
    });

    it('can calculate bounding box', function() {
      var boundingBox = collection.getBoundingBox();
      var expectedBoundingBox = new Rectangle({
        west: 145.23747355356,
        south: -37.826790372354,
        east: 145.23771058855,
        north: -27.826664658962
      });
      expect(boundingBox).toEqual(expectedBoundingBox);
    });



  });
});
