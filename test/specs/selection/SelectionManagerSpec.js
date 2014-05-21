define([
  // Code under test.
  'atlas/selection/SelectionManager'
], function (SelectionManager) {
  var sm,
      managers,
      entities;

  describe('A SelectionManager', function () {

    beforeEach(function () {
      managers = {};
      entities = [];
      ['1', '2', '3', '4'].forEach(function(id) {
        entities.push({
          id: id,
          getId: function () { return id; }
        })
      });
    });

    afterEach(function () {
      sm = null;
      managers = null;
      entities = null;
    });

    it('should add itself to the "global" managers when constructed', function () {
      sm = new SelectionManager(managers);
      expect(sm).not.toBeNull();
      expect(managers.selection).toBe(sm);
    });

    it('should be to select entities', function () {

    });

  });
});
