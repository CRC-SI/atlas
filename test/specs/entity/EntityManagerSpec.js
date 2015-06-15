define([
  'atlas/lib/utility/Setter',
  'atlas/model/Feature',
  'atlas/model/GeoEntity',
  // Code under test.
  'atlas/entity/EntityManager',
  '../../lib/AtlasBuilder.js'
], function(Setter, Feature, GeoEntity, EntityManager, AtlasBuilder) {

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
        var expected = createTestEntity();
        em.add(expected);
        var actual = em.getById('id');
        expect(actual).toEqual(expected);
      });

      it('cannot add GeoEntity objects if it\'s ID is in use ', function() {
        var entity1 = createTestEntity({id: 'foo', show: false});
        var entity2 = createTestEntity({id: 'foo', show: false});
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
          expecteds.push(createTestEntity({id: 'id' + i, show: false}));
          em.add(expecteds[i]);
        });
        em.getEntities().forEach(function(actual, i) {
          expect(actual).toEqual(expecteds[i]);
        });
      });

      it('shall get the exact object reference when an Entity has been added', function() {
        var expected = createTestEntity({id: 'entity', show: false})
        em.add(expected);
        var actual = em.getById('entity');
        expect(actual).toBe(expected);
      });

      it('can remove GeoEntitys when they have been added', function() {
        em.add(createTestEntity({id: 'id', show: false}));
        expect(em.getById('id')).toBeDefined();
        em.remove('id');
        expect(em.getById('id')).toBeUndefined();
      });

      it('can show a GeoEntity by ID when it has been added', function() {
        var args = {show: false};
        var entity = new Feature('id0', args);
        em.add(entity);

        var toggleArgs = {id: entity.getId()};
        expect(entity.isVisible()).toBe(false);
        em.toggleEntityVisibility(true, toggleArgs);
        expect(entity.isVisible()).toBe(true);
        em.toggleEntityVisibility(false, toggleArgs);
        expect(entity.isVisible()).toBe(false);
      });

      it('can show multiple GeoEntities by their IDs when they have been added', function() {
        var entitys = [];
        var ids = [];
        [0, 1, 2, 3].forEach(function(i) {
          ids.push('id' + i);
          var entity = new Feature({id: 'id' + i});
          entitys.push(entity);
          em.add(entity);
        });
        [true, false].forEach(function(bool) {
          em.toggleEntityVisibility(bool, {ids: ids});
          entitys.forEach(function(entity) {
            expect(entity.isVisible()).toBe(bool);
          });
        });

      });

      it('can generate unique IDs', function() {
        em.add(createTestEntity({id: 1}));
        em.add(createTestEntity({id: 3}));
        expect(em.generateUniqueId()).toEqual(2);
        expect(em.generateUniqueId()).toEqual(4);
      });

    });

    describe('Events:', function() {
      var atlas;
      var em;

      beforeEach(function() {
        atlas = AtlasBuilder().noLog()
                  .feature('id0')
                  .feature('id1')
                  .feature('id2')
                  .build();
        em = atlas.getManager('entity');
      });

      afterEach(function() {
        em = null;
        atlas = null;
      });

      it('shall show a GeoEntity when an "entity/show" specifies a single ID', function() {
        var id = 'id0';
        atlas.publish('entity/show', {id: id});
        expect(em.getById(id).isVisible()).toBe(true);
        atlas.publish('entity/hide', {id: id});
        expect(em.getById(id).isVisible()).toBe(false);
      });

      it('shall show multipe GeoEntitys when an "entity/show" specifies IDs', function() {
        var ids = ['id0', 'id1', 'id0'];
        atlas.publish('entity/show', {ids: ids});
        ids.forEach(function(id) {
          expect(em.getById(id).isVisible()).toBe(true);
        });
        atlas.publish('entity/hide', {ids: ids});
        ids.forEach(function(id) {
          expect(em.getById(id).isVisible()).toBe(false);
        });
      });

    });

  });

  // AUXILIARY

  function createTestEntity(args) {
    args = Setter.merge({show: false}, args);
    return new GeoEntity(args.id || 'id', args, {});
  }

});
