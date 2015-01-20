define([
  'atlas/model/GeoEntity',
  // Code under test.
  'atlas/entity/EntityManager'
], function(GeoEntity, EntityManager) {

  describe('An EntityManager', function() {
    var em;
    var managers;
    var h1;
    var h2;
    var Handle = function(id) {
      this.id = id;
      this.getId = function() { return this.id; };
    };

    beforeEach(function() {
      managers = {};
      em = new EntityManager(managers);
      h1 = new Handle('1');
      h2 = new Handle('2');

    });

    afterEach(function() {
      managers.em = null;
      managers = null;
      em = null;
    });

    it('can be constructed', function() {
      expect(em).toBeDefined();
    });

    describe('Features:', function() {
      it('can create Features when', function() {
        var id = 'featureId';
        var feature = em.createFeature(id, {});
        expect(feature).toBeDefined();
        expect(feature.getId()).toEqual(id);
      });

      it('can register and store GeoEntity objects', function() {
        var expected = new GeoEntity('id', {}, {});
        em.add(expected);
        var actual = em.getById('id');
        expect(actual).toEqual(expected);
      });

      it('can retrieve all registered GeoEntitys as an array', function() {
        var expecteds = [];
        [0, 1, 2, 3].forEach(function(i) {
          expecteds.push(new GeoEntity('id' + i, {}, {}));
          em.add(expecteds[i]);
        });
        em.getEntities().forEach(function(actual, i) {
          expect(actual).toEqual(expecteds[i]);
        });
      });

    });

  });

});
