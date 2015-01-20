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
      it('can create an empty Feature when a valid ID is given', function() {
        var id = 'featureId';
        var feature = em.createFeature(id, {});
        expect(feature).toBeDefined();
        expect(feature.getId()).toEqual(id);
      });

      it('cannot create a Feature if a duplicate ID is given', function() {
        var id = 'featureId';
        // Add once.
        em.createFeature(id, {});
        expect(function() {
          // Try to add again.
          em.createFeature(id, {});
        }).toThrow();
      });

    });

    describe('Entities:', function() {
      it('can add GeoEntity objects to its store when the Entitys ID is not in use ', function() {
        var expected = new GeoEntity('id', {}, {});
        em.add(expected);
        var actual = em.getById('id');
        expect(actual).toEqual(expected);
      });

      it('cannot add GeoEntity objects if it\'s ID is in use ', function() {
        var entity1 = new GeoEntity('id', {}, {});
        var entity2 = new GeoEntity('id', {}, {});
        // Add original
        em.add(entity1);
        expect(function() {
          // Add new Entity with duplicate ID.
          em.add(entity2);
        }).toThrow();
      });

      it('cannot add objects which do not subclass GeoEntity', function() {
        expect(function() {
          em.add({});
        }).toThrow();
      });

      it('shall return an empty array if all Entities are requested and none exist', function() {
        var actual = em.getEntities();
        expect(actual).toEqual([]);
      });

      it('shall return undefined if a non-existent Entity (by ID) is requested', function() {
        var actual = em.getById('foo');
        expect(actual).toBeUndefined();
      });

      it('can get all registered GeoEntitys as an array', function() {
        var expecteds = [];
        [0, 1, 2, 3].forEach(function(i) {
          expecteds.push(new GeoEntity('id' + i, {}, {}));
          em.add(expecteds[i]);
        });
        em.getEntities().forEach(function(actual, i) {
          expect(actual).toEqual(expecteds[i]);
        });
      });

      it('shall get the exact object reference when an Entity has been added', function() {
        var expected = new GeoEntity({id: 'entity'});
        em.add(expected);
        var actual = em.getById('entity');
        expect(actual).toBe(expected);
      });

      it('can remove GeoEntitys when they have been added', function() {
        em.add(new GeoEntity({id: 'id'}));
        expect(em.getById('id')).toBeDefined();
        em.remove('id');
        expect(em.getById('id')).toBeUndefined();
      });

    });

  });

});
