define([
  'atlas/model/GeoEntity',
  'atlas/model/GeoPoint',
  // Code under test
  'atlas/model/Handle'
], function(GeoEntity, GeoPoint, Handle) {

  // TODO(aramk) Need to update test to use entities so centroid can be calculated when creating
  // handles.

  describe ('A Handle', function() {
    var handle,
        entity1,
        entity2,
        geoPoint,
        modifiers = ['translate']; // Only translation of Handles is supported currently.

    // Override abstract render function.
    Handle.prototype.render = function() {};
    Handle.prototype.unrender = function() {};

    beforeEach (function() {
      entity1 = new GeoEntity({id: '001'});
      entity2 = new GeoEntity({id: '002'});
      geoPoint = new GeoPoint({longitude: 0, latitude: 0, elevation: 0});
      [entity1, entity2].forEach(function(entity) {
        spyOn(entity, 'show');
        modifiers.forEach(function(method) {
          spyOn(entity, method);
        });
      });
    });

    afterEach (function() {
      handle = null;
      entity1 = null;
      entity2 = null;
      geoPoint = null;
    });

    describe ('can be constructed', function() {
      it ('with a linked or target GeoEntity', function() {
        handle = new Handle({owner: entity1});
        expect(handle).not.toBeNull();
        expect(handle.getTarget().getId()).toEqual(entity1.getId());
        expect(handle.getId()).toEqual('handle100000');
        handle = new Handle({target: geoPoint, owner: entity1});
        expect(handle).not.toBeNull();
        expect(handle.getOwner().getId()).toEqual(entity1.getId());
        expect(handle.getTarget()).toEqual(geoPoint);
        expect(handle.getId()).toEqual('handle100001');
      });

      it ('with a target GeoPoint and owner', function() {
        handle = new Handle({target: geoPoint, owner: entity1});
        expect(handle).not.toBeNull();
        expect(handle.getOwner().getId()).toEqual(entity1.getId());
        expect(handle.getTarget()).toEqual(geoPoint);
      });

      it ('but fails without a an owner', function() {
        var noArg = function() {
          return new Handle();
        };
        expect(noArg).toThrow();
        noArg = function() {
          return new Handle({target: null});
        };
        expect(noArg).toThrow();
      });

      it ('but fails with a non-Geopoint target', function() {
        var incorrectArg = function() {
          return new Handle({target: 'string', owner: entity1});
        };
        expect(incorrectArg).toThrow();
      });

      xit ('but fails if a GeoPoint is linked without an owner', function() {
        var incorrectArg = function() {
          return new Handle({target: geoPoint});
        };
        expect(incorrectArg).toThrow();
      });
    });

    describe ('delegates modification calls', function() {
      it ('when linked directly to a GeoEntity', function() {
        handle = new Handle({target: entity1});
        modifiers.forEach(function(method) {
          spyOn(handle, method).and.callThrough();
          handle[method]();
          expect(entity1[method].calls.count()).toEqual(1);
        });
        //expect(entity1.show.calls.count()).toEqual(3);
      });

      it ('when linked to a GeoPoint, which then updates the GeoEntity', function() {
        handle = new Handle({target: geoPoint, owner: entity1});
        spyOn(entity1, 'setDirty');
        handle.translate({longitude: 1, latitude: 1, elevation: 1});
        expect(entity1.setDirty).toHaveBeenCalledWith('vertices');
        //expect(entity1.show.calls.count()).toEqual(1);
      });
    });

    describe ('can be removed', function() {
      it ('from a single GeoEntity', function() {
        handle = new Handle({target: entity1});
        handle.remove();

        expect(handle.getOwner()).toBeNull();
        expect(handle.getTarget()).toBeNull();
        modifiers.forEach(function(method) {
          expect(handle[method]).toThrow();
          expect(entity1[method].calls.count()).toEqual(0);
        });
      });
    })
  }); // End 'A Handle'
});
