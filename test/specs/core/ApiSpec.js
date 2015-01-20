define([
  '../../lib/AtlasBuilder.js'
], function(AtlasBuilder) {

  var atlas;

  describe('An Atlas', function() {
    beforeEach(function() {
      atlas = AtlasBuilder().build();
    });

    it('should be able to enable and disable terrain', function() {
      expect(atlas.getManager('terrain').isTerrainEnabled()).toBe(false);
      atlas.publish('terrain/enable');
      expect(atlas.getManager('terrain').isTerrainEnabled()).toBe(true);
      atlas.publish('terrain/disable');
      expect(atlas.getManager('terrain').isTerrainEnabled()).toBe(false);
    });

    describe('GeoEntities:', function() {
      it('should be able to create entities', function () {
        atlas.publish('entity/create', {id: 'feature'});
        expect(atlas.getManager('entity').getById('feature')).toBeDefined();
        // The entity should be invisible by default.
        expect(atlas.getManager('entity').getById('feature').isVisible()).toBe(false);
      });

      it('should be able to create entities and immediately show it', function () {
        atlas.publish('entity/create', {id: 'feature', show: true});
        expect(atlas.getManager('entity').getById('feature')).toBeDefined();
        expect(atlas.getManager('entity').getById('feature').isVisible()).toBe(true);
      });

      it('should be able to show and hide entities', function() {
        atlas.publish('entity/create', {id: 'feature'});
        atlas.publish('entity/show', {id: 'feature'});
        expect(atlas.getManager('entity').getById('feature').isVisible()).toBe(true);

        atlas.publish('entity/hide', {id: 'feature'});
        expect(atlas.getManager('entity').getById('feature').isVisible()).toBe(false);
      });

      it('should throw when trying to show non-existant entities', function() {
        expect(function() {
          atlas.publish('entity/show', {id: 'fubar'});
        }).toThrow();
      });

    });

  });

});
