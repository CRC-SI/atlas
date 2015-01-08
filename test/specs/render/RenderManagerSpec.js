define([
  'atlas/entity/EntityManager',
  'atlas/events/EventManager',
  'atlas/model/Feature',
  /* Code under test */
  'atlas/render/RenderManager'
], function(EntityManager, EventManager, Feature, RenderManager) {

  var managers;
  var entityManager;
  var eventManager;
  var renderManager;
  var featureId = 'id1';

  describe('An Atlas RenderManager', function() {

    beforeEach(function() {
      /* global GlobalLog */
      GlobalLog.setLevel('error');
      managers = {};
      entityManager = new EntityManager(managers);
      eventManager = new EventManager(managers);

      entityManager.createFeature(featureId, {});

      // Construct the RenderManager
      renderManager = new RenderManager(managers);
      renderManager.setup();
      GlobalLog.setLevel('debug');
    });

    afterEach(function() {
      renderManager = null;
      eventManager = null;
      managers = {
        dom: null,
        event: null,
        render: null
      };
    });

    it('can be constructed', function() {
      expect(renderManager instanceof RenderManager).toBe(true);
      expect(managers.render).toEqual(renderManager);
    });

  });
});
