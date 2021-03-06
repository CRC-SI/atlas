define([
  'atlas/lib/utility/Types',
  'atlas/lib/utility/Class',
  'atlas/util/DeveloperError'
], function(Types, Class, DeveloperError) {

  /**
   * Define the ItemStore constructor as type atlas.core.ItemStore
   * @typedef atlas.core.ItemStore
   * @ignore
   */
  var ItemStore;

  /**
   * @classdesc The ItemStore is a class to encapsulate storing and retrieving arbitrary
   * objects using unique IDs. The unique IDs need to be generated by the objects being
   * stored.
   * @param {String} id - The name of the getter function for the objects ID. Defaults
   * to <code>getId</code>.
   * @class atlas.core.ItemStore
   */
  ItemStore = Class.extend(/** @lends atlas.core.ItemStore# */ {

    /**
     * The getter function for the ID of the stored objects.
     * @type {String}
     */
    _getterName: null,

    /**
     * Count of items in the store.
     * @type {number}
     */
    _count: 0,

    /**
     * The objects stored in the ItemStore.
     * @type {Object.<String, Object>}
     * @private
     */
    _items: null,

    _init: function(getter) {
      this.purge();
      this._getterName = getter || 'getId';
    },

    // -------------------------------------------------
    // GETTERS AND SETTERS
    // -------------------------------------------------

    asArray: function() {
      return this.map(function(item) {
        return item;
      });
    },

    /**
     * @returns {number} The number of items in the store.
     */
    getCount: function() {
      return this._count;
    },

    /**
     * @returns {boolean} Whether there are items in the store.
     */
    isEmpty: function() {
      return this.getCount() === 0;
    },

    _getId: function(item) {
      return item[this._getterName]();
    },

    /**
     * @returns {Array} The item IDs in the store.
     */
    getIds: function() {
      return Object.keys(this._items);
    },

    /**
     * @returns {atlas.core.ItemStore} A shallow copy of this object.
     */
    clone: function() {
      var clone = new ItemStore();
      clone.addArray(this.asArray());
      return clone;
    },

    // -------------------------------------------------
    // ADDING AND REMOVING
    // -------------------------------------------------

    /**
     * Add an object to the store.
     * @param {Object} obj - The object to add.
     */
    add: function(obj) {
      if (!obj[this._getterName]) {
        throw new DeveloperError('Tried to add object without an ID getter to the store.');
      }
      var id = this._getId(obj);
      if (!this.contains(obj)) {
        this._items[id] = obj;
        this._count++;
      }
    },

    /**
     * Adds an array of objects to the store. Any objects with a conflicting ID are ignored.
     * @param {Array.<Object>} objs - The array of objects to add.
     * @returns {Array} The items that were added to the store. Does not include any items that
     * were already existed in the store.
     */
    addArray: function(objs) {
      var added = [];
      objs.forEach(function(obj) {
        if (!this.contains(obj)) {
          this.add(obj);
          added.push(obj);
        }
      }, this);
      return added;
    },

    /**
     * Remove an object from the store.
     * @param {String} id - The ID of the object to remove.
     * @returns {Object} The removed object.
     */
    remove: function(id) {
      var obj = this._items[id];
      delete this._items[id];
      this._count--;
      return obj;
    },

    /**
     * @param {String} id - The ID of the object to retrieve.
     * @returns {Object?} The object with the given ID.
     */
    get: function(id) {
      return this._items[id];
    },

    contains: function(obj) {
      var id = this._getId(obj);
      return this.get(id) !== undefined;
    },

    /**
     * Removes all items from the store.
     */
    purge: function() {
      this._items = {};
      this._count = 0;
    },

    // -------------------------------------------------
    // LOOPING
    // -------------------------------------------------

    /**
     * Applies a given function to every item in the store.
     * @param {String|Function.<Object>} func - The name of a method existing on each item, or a
     * function to call with each item and the id as passed arguments.
     * @param {Object} [scope] - The object that <code>this</code> will refer to. Only valid when
     * <code>func</code> is a callback function.
     * @returns {Array} The returned values from each call of the given function.
     */
    map: function(func, scope) {
      return this._forEach('map', func, scope);
    },

    /**
     * Applies a given function to every item in the store.
     * @param {String|Function.<Object>} func - The name of a method existing on each item, or a
     * function to call with each item and the id as passed arguments.
     * @param {Object} [scope] - The object that <code>this</code> will refer to. Only used when
     * <code>func</code> is a callback function.
     */
    forEach: function(func, scope) {
      return this._forEach('forEach', func, scope);
    },

    /**
     * Applies a given function to every item in the store.
     * @param {String|Function.<Object>} func - The name of a method existing on each item, or a
     * function to call with each item and the id as passed arguments.
     * @param {Object} [scope] - The object that <code>this</code> will refer to. Only used when
     * <code>func</code> is a callback function.
     * @returns {Array} Whether at least one call to the given function returned true.
     */
    some: function(func, scope) {
      return this._forEach('some', func, scope);
    },

    /**
     * Applies a given function to every item in the store.
     * @param {String|Function.<Object>} func - The name of a method existing on each item, or a
     * function to call with each item and the id as passed arguments.
     * @param {Object} [scope] - The object that <code>this</code> will refer to. Only used when
     * <code>func</code> is a callback function.
     * @returns {Array} Whether all calls to the given function returned true.
     */
    every: function(func, scope) {
      return this._forEach('every', func, scope);
    },

    /**
     * Calls an array method with the given function and scope.
     * @param arrayMethod - A method which exists in <code>Array.prototype<code>.
     * @param {String|Function.<Object>} func - The name of a method existing on each item, or a
     * function to call with each item and the id as passed arguments.
     * @param {Object} [scope] - The object that <code>this</code> will refer to. Only valid when
     * <code>func</code> is a callback function.
     * @returns {Array} The returned value from the given Array method.
     * @private
     */
    _forEach: function(arrayMethod, func, scope) {
      scope = scope || this;
      return Object.keys(this._items)[arrayMethod](function(id) {
        var item = this.get(id);
        if (Types.isString(func)) {
          return item[func]();
        } else {
          return func.call(scope, item, id);
        }
      }, this);
    }

  });

  return ItemStore;
});
