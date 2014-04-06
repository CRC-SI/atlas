define([
  // Code under test.
  'atlas/entity/EntityManager'
], function (EntityManager) {

  describe('An EntityManager', function () {
    var em,
        managers,
        Handle = function (id) {
          this.id = id;
          this.getId = function () { return this.id; };
        },
        h1, h2;

    beforeEach(function () {
      managers = {};
      em = new EntityManager(managers);
      h1 = new Handle('1');
      h2 = new Handle('2');

    });

    afterEach(function () {
      managers = null;
      em = null;
    });

  }); // End 'An EntityManager'
});
