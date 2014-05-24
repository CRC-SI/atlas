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

    // Override abstract render function.
    Handle.prototype.render = function () {};
    Handle.prototype.unrender = function () {};

    beforeEach (function () {
      entity1 = new GeoEntity({id: '001'});
      entity2 = new GeoEntity({id: '002'});
      vertex = new Vertex({x: 0, y: 0, z: 0});
      [entity1, entity2].forEach(function (entity) {
        spyOn(entity, 'show');
        modifiers.forEach(function (method) {
          spyOn(entity, method);
        });
      });
    });

    afterEach (function () {
      handle = null;
      entity1 = null;
      entity2 = null;
      vertex = null;
    });

    describe ('can be constructed', function () {
      it ('with a linked or target GeoEntity', function () {
        handle = new Handle({target: entity1});
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual(entity1);
        expect(handle.getTarget()).toEqual(entity1);
        expect(handle._id).toEqual('handle100000');
        handle = new Handle({target: entity2, owner: entity1});
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual(entity2);
        expect(handle.getTarget()).toEqual(entity2);
        expect(handle._id).toEqual('handle100001');
      });

      it ('with a Vertex', function () {
        handle = new Handle({target: vertex, owner: entity1});
        expect(handle).not.toBeNull();
        expect(handle.getLinked()).toEqual(vertex);
        expect(handle.getTarget()).toEqual(entity1);
      });

      it ('but fails without a link', function () {
        var noArg = function () {
          return new Handle();
        };
        expect(noArg).toThrow();
        noArg = function () {
          return new Handle({target: null});
        };
        expect(noArg).toThrow();
      });

      it ('but fails with a non-Vertex or GeoEntity link', function () {
        var incorrectArg = function () {
          return new Handle({target: 'string'});
        };
        expect(incorrectArg).toThrow();
      });

      it ('but fails if a Vertex is linked without a target', function () {
        var incorrectArg = function () {
          return new Handle({target: vertex});
        };
        expect(incorrectArg).toThrow();
      });
    });

    describe ('delegates modification calls', function () {
      it ('when linked directly to a GeoEntity', function () {
        handle = new Handle({target: entity1});
        modifiers.forEach(function (method) {
          spyOn(handle, method).andCallThrough();
          handle[method]();
          expect(entity1[method].calls.length).toEqual(1);
        });
        expect(entity1.show.calls.length).toEqual(3);
      });

      it ('when linked to a Vertex, which then updates the GeoEntity', function () {
        handle = new Handle({target: vertex, owner: entity1});
        spyOn(entity1, 'setDirty');
        handle.translate({x: 0, y: 0, z: 0});
        expect(entity1.setDirty).toHaveBeenCalledWith('vertices');
        expect(entity1.show.calls.length).toEqual(1);
      });
    });

    describe ('can be removed', function () {

      it ('from a single GeoEntity', function () {
        handle = new Handle({target: entity1});
        handle.remove();

        expect(handle.getLinked()).toBeNull();
        expect(handle.getTarget()).toBeNull();
        modifiers.forEach(function (method) {
          expect(handle[method]).toThrow();
          expect(entity1[method].calls.length).toEqual(0);
        });
      });
    })
  }); // End 'A Handle'
});
