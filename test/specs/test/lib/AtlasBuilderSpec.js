define([
  'atlas/core/Atlas',
  '../../../lib/AtlasBuilder.js'
], function(Atlas, AtlasBuilder) {
  /* global Inspect */

  describe('An AtlasBuilder', function() {
    it('should have some things defined on it.', function() {
      expect(typeof AtlasBuilder).toEqual('function');
      expect(typeof AtlasBuilder.makeFeature).toEqual('function');
      expect(typeof AtlasBuilder.makeEllipse).toEqual('function');
      expect(typeof AtlasBuilder.makePolygon).toEqual('function');
      expect(typeof AtlasBuilder.build).toEqual('function');
    });

    it('build() should be overridable', function() {
      var tempBuild = AtlasBuilder.build;

      AtlasBuilder.build = function() {
        return 'hello';
      };
      var out = AtlasBuilder().build();
      expect(out).toEqual('hello');
      AtlasBuilder.build = tempBuild;
    });

    it('should be able to make an empty Atlas', function() {
      Inspect(AtlasBuilder.toString());
      var atlas = AtlasBuilder().build();
      expect(atlas instanceof Atlas).toBe(true);
    });

    it('should be able to make an Atlas with a Feature', function() {
      var atlas = AtlasBuilder()
        .feature('id1')
          .ellipse({x: 1, y: 1}, 30)
        .build();

      var feature = atlas.getManager('entity').getById('id1');
      expect(atlas instanceof Atlas).toBe(true);
      expect(feature).toBeDefined();
      expect(feature).toBeDefined();
      // expect(feature.ellipse).toBeDefined();
      // expect(feature.ellipse).toBeDefined();
    });

  });
});
