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

    it('should be able to be constructed', function() {
      expect(renderManager instanceof RenderManager).toBe(true);
      expect(managers.render).toEqual(renderManager);
    });

    describe('(Terrain)', function() {
      it('should be able to delegate terrain changes to subclasses', function() {
        spyOn(renderManager, '_handleTerrainChange');
        // Do this so it's always changed.
        renderManager.setTerrain(!renderManager.isTerrainEnabled());
        expect(renderManager._handleTerrainChange).toHaveBeenCalled();

        // Check that the reverse change still delegates properly.
        renderManager.setTerrain(!renderManager.isTerrainEnabled());
        expect(renderManager._handleTerrainChange.calls.count()).toEqual(2);
      });

      it('should not delegate terrain changes if the change is a no-op', function() {
        spyOn(renderManager, '_handleTerrainChange');
        // Do this so it's never changed.
        renderManager.setTerrain(renderManager.isTerrainEnabled());
        expect(renderManager._handleTerrainChange).not.toHaveBeenCalled();
      });

      it('should delegate entity/show events to subclasses if terrain is enabled', function() {
        spyOn(renderManager, '_handleEntityShowEvent').and.callThrough();
        spyOn(renderManager, '_handleEntityShow');

        renderManager.setTerrain(true);
        eventManager.handleExternalEvent('entity/show', {id: featureId});

        expect(renderManager._handleEntityShowEvent).toHaveBeenCalled();
        expect(renderManager._handleEntityShow).toHaveBeenCalled();
      });

    });
  });
});
