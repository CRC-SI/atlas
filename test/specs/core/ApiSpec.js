define([
  'atlas/core/Atlas'
], function(Atlas) {

  var atlas;

  describe('An Atlas', function() {
    beforeEach(function() {
      atlas = new Atlas();
    });

    it('should be able to enable and disable terrain', function() {
      expect(atlas.getManager('terrain').isTerrainEnabled()).toBe(false);
      atlas.publish('terrain/enable');
      expect(atlas.getManager('terrain').isTerrainEnabled()).toBe(true);
      atlas.publish('terrain/disable');
      expect(atlas.getManager('terrain').isTerrainEnabled()).toBe(false);
    });

  });
});
