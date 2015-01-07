define([
  'atlas/core/Atlas',
  '../../../lib/AtlasBuilder.js'
], function(Atlas, AtlasBuilder) {

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
      var atlas = AtlasBuilder().build();
      expect(atlas instanceof Atlas).toBe(true);
    });

    it('should be able to make an Atlas with an empty Feature', function() {
      var atlas = AtlasBuilder()
        .feature('id1')
        .build();

      var feature = atlas.getManager('entity').getById('id1');
      expect(atlas instanceof Atlas).toBe(true);
      expect(feature).toBeDefined();
    });

    it('should be able to make an Atlas with multiple empty Feature', function() {
      var atlas = AtlasBuilder()
        .feature('id1')
        .feature('id2')
        .feature('id3')
        .feature('id4')
        .build();

      expect(atlas instanceof Atlas).toBe(true);
      [1, 2, 3, 4].forEach(function(id) {
        var feature = atlas.getManager('entity').getById('id' + id);
        expect(feature).toBeDefined();
      });
    });

  });
});
