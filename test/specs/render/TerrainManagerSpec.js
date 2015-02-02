define([
  'atlas/events/EventManager',
  'atlas/render/TerrainManager',
  '../../lib/AtlasBuilder.js'
], function(EventManager, TerrainManager, AtlasBuilder) {

  var atlas;
  var eventManager;
  var terrainManager;
  var featureId = 'id';

  describe('A TerrainManager', function() {

    beforeEach(function() {
      atlas = AtlasBuilder().noLog().feature(featureId).build();
      eventManager = atlas.getManager('event');
      terrainManager = atlas.getManager('terrain');
      terrainManager.setEnabled(false);
    });

    afterEach(function() {
      atlas._managers = null;
      atlas = null;
      eventManager = null;
      terrainManager = null;
    });

    it('can be constructued', function() {
      expect(terrainManager).toBeDefined();
      expect(terrainManager.isTerrainEnabled()).toBe(false);
    });

    it('should delegate terrain changes to subclasses', function() {
      spyOn(terrainManager, '_handleEnabledChange');
      // Do this so it's always changed.
      terrainManager.setEnabled(!terrainManager.isTerrainEnabled());
      expect(terrainManager._handleEnabledChange).toHaveBeenCalled();

      // Check that the reverse change still delegates properly.
      terrainManager.setEnabled(!terrainManager.isTerrainEnabled());
      expect(terrainManager._handleEnabledChange.calls.count()).toEqual(2);
    });

    it('should not delegate terrain changes if the change is a no-op', function() {
      spyOn(terrainManager, '_handleEnabledChange');
      // Do this so it's never changed.
      terrainManager.setEnabled(terrainManager.isTerrainEnabled());
      expect(terrainManager._handleEnabledChange).not.toHaveBeenCalled();
    });

    it('should delegate entity/show events to subclasses if terrain is enabled', function() {
      expect(terrainManager.isTerrainEnabled()).toBe(false);
      spyOn(terrainManager, '_handleEntityShowEvent').and.callThrough();
      spyOn(terrainManager, '_handleEntityShow');

      terrainManager.setEnabled(true);
      eventManager.handleExternalEvent('entity/show', {id: featureId});

      expect(terrainManager._handleEntityShowEvent).toHaveBeenCalled();
      expect(terrainManager._handleEntityShow).toHaveBeenCalled();
    });

  });
});
