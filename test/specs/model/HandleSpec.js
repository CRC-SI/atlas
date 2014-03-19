define([
  'atlas/model/GeoEntity',
  'atlas/model/Vertex',
  // Code under test
  'atlas/model/Handle'
], function (GeoEntity, Vertex, Handle) {
  describe ('A Handle', function () {
    var handle,
        entity1,
        entity2,
        vertex,
        modifiers = ['translate', 'rotate', 'scale'];

    beforeEach (function () {
      entity1 = new GeoEntity({id: '001'});
      entity2 = new GeoEntity({id: '002'});
      vertex = new Vertex({x: 0, y: 0, z: 0});
      [entity1, entity2].forEach(function (entity) {
        modifiers.forEach(function (method) {
          spyOn(entity, method);
        });
      });
      spyOn(vertex, 'translate');
    });

    afterEach (function () {
      handle = null;
      entity1 = null;
      entity2 = null;
      vertex = null;
    });

    describe ('can be constructed', function () {
      it ('with a GeoEntity', function () {
        handle = new Handle(entity1);
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual(entity1);
        expect(handle._id).toEqual('handle' + Handle._nextId);
      });

      it ('with a Vertex', function () {
        handle = new Handle(vertex);
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual(vertex);
        expect(handle._id).toEqual('handle' + Handle._nextId);
      });

      // Not any more
      xit ('with multiple targets', function () {
        handle = new Handle([entity1, entity2]);
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual([entity1, entity2]);
      });

      it ('but fails without a target', function () {
        var fail = function () {
          return new Handle();
        };
        expect(fail).toThrow();
      });

      it ('but fails with a non-Vertex or GeoEntity target', function () {
        var fail = function () {
          return new Handle('string');
        };
        expect(fail).toThrow();
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

      xit ('to multiple GeoEntities', function () {
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
