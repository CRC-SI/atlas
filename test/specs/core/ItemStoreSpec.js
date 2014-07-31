define([
  'atlas/lib/utility/Type',
  // Code under test.
  'atlas/core/ItemStore'
], function (Type, ItemStore) {

  describe('A ItemStore', function () {

    var itemStore,
        items;

    beforeEach(function () {
      items = [];
      [0, 1, 2, 3].forEach(function (id) {
        items.push({
          id: id.toString(),
          val: id,
          getId: function () { return this.id; },
          incrVal: function () { this.val++; }
        });
      })
    });

    afterEach(function () {
      items = null;
      itemStore = null;
    });

    it('can be constructed', function () {
      itemStore = new ItemStore();
      expect(itemStore._getterName).toEqual('getId');
      expect(itemStore._items).toEqual({});
      itemStore = new ItemStore('itemIdGetterFunction');
      expect(itemStore._getterName).toEqual('itemIdGetterFunction');
      expect(itemStore._items).toEqual({});
    });

    describe('can do stuff', function () {

      beforeEach(function () {
        itemStore = new ItemStore();
      });

      it('fails awesomely if a null id is added', function () {
        var f = function () { itemStore.add({x: 0}); };
        expect(f).toThrow();
        expect(itemStore.getCount()).toBe(0);
      });

      it('can have items added', function () {
        itemStore.add(items[0]);
        itemStore.add(items[1]);
        expect(itemStore._items['0']).toEqual(items[0]);
        expect(itemStore._items['1']).toEqual(items[1]);
        expect(itemStore.getCount()).toBe(2);
      });

      it('can have multiple objects added', function () {
        itemStore.addArray(items);
        [0,1,2,3].forEach(function (id) {
          expect(itemStore._items[id.toString()]).toEqual(items[id]);
        });
        expect(itemStore.getCount()).toBe(4);
      });

      it('can retrieve items', function () {
        itemStore.add(items[0]);
        itemStore.add(items[1]);
        expect(itemStore.get('0')).toEqual(items[0]);
        expect(itemStore.get('1')).toEqual(items[1]);
      });

      it('can retrieve all items as an array', function () {
        itemStore.addArray(items);
        var asArray = itemStore.asArray();
        expect(Type.isArrayLiteral(asArray)).toBe(true);
        expect(asArray).not.toBe(items);
        expect(asArray).toEqual(items);
      });

      it('can have items removed', function () {
        itemStore.add(items[0]);
        itemStore.add(items[1]);
        expect(itemStore.getCount()).toBe(2);
        itemStore.remove('0');
        expect(itemStore.getCount()).toBe(1);
        expect(itemStore._items['0']).toBeUndefined();
        expect(itemStore._items['1']).toEqual(items[1]);
      });

      it('safely fails to get a non-existent item', function () {
        itemStore.add(items[1]);
        itemStore.remove('1');
        var nothing = itemStore.get('nothing'),
            moreNothing = itemStore.get('1');
        expect(nothing).toBeFalsy();
        expect(!nothing).toBe(true);
        expect(moreNothing).toBeFalsy();
        expect(!moreNothing).toBe(true);
      })

      it('like apply a function to all items', function () {
        itemStore.add(items[0]);
        itemStore.add(items[1]);
        itemStore.add(items[2]);
        itemStore.add(items[3]);
        itemStore.map('incrVal');
        [0,1,2,3].forEach(function (id) {
          expect(itemStore.get(id.toString()).val).toEqual(id + 1);
        });
      });
    });
  });
});
