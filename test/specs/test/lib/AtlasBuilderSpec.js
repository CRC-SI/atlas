define([
  'atlas/core/Atlas',
  'atlas/model/Ellipse',
  'atlas/model/Line',
  'atlas/model/Polygon',
  '../../../lib/AtlasBuilder.js'
], function(Atlas, Ellipse, Line, Polygon, AtlasBuilder) {

  describe('An AtlasBuilder', function() {

    it('should have some things defined on it which can be then overridden', function() {
      expect(typeof AtlasBuilder).toEqual('function');
      expect(typeof AtlasBuilder.build).toEqual('function');
    });

    it('should be able to make an empty Atlas', function() {
      var atlas = AtlasBuilder().build();
      expect(atlas instanceof Atlas).toBe(true);
    });

    it('should be able to create different forms on features', function() {
      var ab = AtlasBuilder();

      expect(typeof ab.feature).toEqual('function');
      expect(typeof ab.ellipse).toEqual('function');
      expect(typeof ab.line).toEqual('function');
      expect(typeof ab.polygon).toEqual('function');
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

    it('should be able to make an Atlas with an empty Feature', function() {
      var atlas = AtlasBuilder()
        .feature('emptyFeature')
        .build();

      var feature = atlas.getManager('entity').getById('emptyFeature');
      expect(atlas instanceof Atlas).toBe(true);
      expect(feature).toBeDefined();
    });

    it('should be able to make an Atlas with multiple empty Features', function() {
      var atlas = AtlasBuilder()
        .feature('emptyFeature1')
        .feature('emptyFeature2')
        .feature('emptyFeature3')
        .feature('emptyFeature4')
        .build();

      expect(atlas instanceof Atlas).toBe(true);
      [1, 2, 3, 4].forEach(function(id) {
        var feature = atlas.getManager('entity').getById('emptyFeature' + id);
        expect(feature).toBeDefined();
      });
    });

    it('should be able to make an Atlas with Features with forms', function() {
      var ellipseCentroid = {x: 1, y: 1};
      var ellipseRadius = 10;
      var polygonVertices = [{x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 1, y: 2}];

      var atlas = AtlasBuilder()
        .feature('featureWithEllipse')
          .ellipse({centroid: ellipseCentroid, semiMajor: ellipseRadius})
        .feature('featureWithPolygon')
          .polygon({vertices: polygonVertices})
        .feature('featureWithEllipseAndPolygon')
          .ellipse({centroid: ellipseCentroid, semiMajor: ellipseRadius})
          .line({vertices: polygonVertices})
        .build();

      expect(atlas instanceof Atlas).toBe(true);
      // Check featureWithEllipse
      var feature = atlas.getManager('entity').getById('featureWithEllipse');
      expect(feature).toBeDefined();
      var form = feature.getForm();
      expect(form instanceof Ellipse).toBe(true);

      // Check featureWithPolygon
      feature = atlas.getManager('entity').getById('featureWithPolygon');
      expect(feature).toBeDefined();
      form = feature.getForm();
      expect(form instanceof Polygon).toBe(true);

      // Check featureWithEllipseAndPolygon
      feature = atlas.getManager('entity').getById('featureWithEllipseAndPolygon');
      expect(feature).toBeDefined();
      form = feature.getForm('extrusion');
      expect(form instanceof Ellipse).toBe(true);
      form = feature.getForm('line');
      expect(form instanceof Line).toBe(true);
    });

    describe('should fail', function() {
      it('when creating a form without a feature', function() {
        var runner = function() {
          AtlasBuilder().ellipse({}).build();
        };
        expect(runner).toThrow();
      });

    });

  });
});
