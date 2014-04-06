define([
  // Code under test.
  'atlas/core/FooStore'
], function (FooStore) {

  describe('A FooStore', function () {

    var fooStore,
        foos;

    beforeEach(function () {
      foos = [];
      [0, 1, 2, 3].forEach(function (id) {
        foos.push({
          id: id.toString(),
          val: id,
          getId: function () { return this.id; },
          incrVal: function () { this.val++; }
        });
      })
    });

    afterEach(function () {
      foos = null;
      fooStore = null;
    })

    it('can be constructed', function () {
      fooStore = new FooStore();
      expect(fooStore._getter).toEqual('getId');
      expect(fooStore._foos).toEqual({});
      fooStore = new FooStore('fooIdGetterFunction');
      expect(fooStore._getter).toEqual('fooIdGetterFunction');
      expect(fooStore._foos).toEqual({});
    })

    describe('can do stuff', function () {

      beforeEach(function () {
        fooStore = new FooStore();
      });

      it('can have foos added', function () {
        fooStore.add(foos[0]);
        fooStore.add(foos[1]);
        expect(fooStore._foos['0']).toEqual(foos[0]);
        expect(fooStore._foos['1']).toEqual(foos[1]);
      });

      it('can retrieve foos', function () {
        fooStore.add(foos[0]);
        fooStore.add(foos[1]);
        expect(fooStore.get('0')).toEqual(foos[0]);
        expect(fooStore.get('1')).toEqual(foos[1]);
      });

      it('can have foos removed', function () {
        fooStore.add(foos[0]);
        fooStore.add(foos[1]);
        fooStore.remove('0');
        expect(fooStore._foos['0']).toBeUndefined();
        expect(fooStore._foos['1']).toEqual(foos[1]);
      });

      it('safely fails to get a non-existant foo', function () {
        fooStore.add(foos[1]);
        fooStore.remove('1');
        var nothing = fooStore.get('nothing'),
            moreNothing = fooStore.get('1');
        expect(nothing).toBeFalsy();
        expect(!nothing).toBe(true);
        expect(moreNothing).toBeFalsy();
        expect(!moreNothing).toBe(true);
      })

      it('like apply a function to all foos', function () {
        fooStore.add(foos[0]);
        fooStore.add(foos[1]);
        fooStore.add(foos[2]);
        fooStore.add(foos[3]);
        fooStore.map('incrVal');
        [0,1,2,3].forEach(function (id) {
          expect(fooStore.get(id.toString()).val).toEqual(id + 1);
        });
      });
    });
  });
});
