define([
  'atlas/model/GeoEntity',
  // Code under test
  'atlas/model/Handle'
], function (GeoEntity, Handle) {
  describe ('A Handle', function () {
    var handle,
        entity1,
        entity2,
        modifiers = ['translate', 'rotate', 'scale'];

    beforeEach (function () {
      entity1 = new GeoEntity({id: '001'});
      entity2 = new GeoEntity({id: '002'});
      [entity1, entity2].forEach(function (entity) {
        modifiers.forEach(function (method) {
          spyOn(entity, method);
        });
      })
    });

    afterEach (function () {
      handle = null;
      entity1 = null;
    });

    describe ('can be constructed', function () {
      it ('with a single target', function () {
        handle = new Handle(entity1);
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual([entity1]);
      });

      it ('with multiple targets', function () {
        handle = new Handle([entity1, entity2]);
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual([entity1, entity2]);
      })
    });

    describe ('delegates modification calls', function () {
      it ('to a single GeoEntity', function () {
        handle = new Handle(entity1);
        modifiers.forEach(function (method) {
          handle[method]();
          expect(entity1[method].calls.length).toEqual(1);
        });
      });

      it ('to multiple GeoEntities', function () {
        handle = new Handle([entity1, entity2]);
        modifiers.forEach(function (method) {
          handle[method]();
          expect(entity1[method].calls.length).toEqual(1);
          expect(entity2[method].calls.length).toEqual(1);
        });
      });
    });

    describe ('can be removed', function () {

      it ('from a single GeoEntity', function () {
        handle = new Handle(entity1);
        handle.remove();

        expect(handle.getLinked()).toEqual([]);
        modifiers.forEach(function (method) {
          expect(handle[method]).toThrow();
          expect(entity1[method].calls.length).toEqual(0);
        });
      });

      it ('from multiple GeoEntities', function () {
        handle = new Handle([entity1, entity2]);
        handle.remove();

        expect(handle.getLinked()).toEqual([]);
        modifiers.forEach(function (method) {
          expect(handle[method]).toThrow();
          expect(entity1[method].calls.length).toEqual(0);
          expect(entity2[method].calls.length).toEqual(0);
        });
      });
    })
  }); // End 'A Handle'
});
