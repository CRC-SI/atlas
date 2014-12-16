define([
  'atlas/edit/EditManager',
  'atlas/entity/EntityManager',
  'atlas/events/EventManager',
  'atlas/model/Feature',
  'atlas/render/RenderManager',
  // Code under test
  'atlas/edit/LineDrawModule'
], function(EditManager, EntityManager, EventManager, Feature, RenderManager, LineDrawModule) {
  var drawModule,
      managers;

  describe('A LineDrawModule', function() {
    beforeEach(function() {
      managers = {};
      // Managers store themselves on managers
      new EditManager(managers);
      new EventManager(managers);
      new EntityManager(managers);
      new RenderManager(managers);
      drawModule = new LineDrawModule(managers)
    });

    afterEach(function() {
      drawModule = null;
    });

    it('should construct a new Feature when setup', function() {
      drawModule._setup();
      expect(drawModule._feature).not.toBeNull();
      expect(drawModule._feature._displayMode).toBe(Feature.DisplayMode.LINE);
    });
  });
});

