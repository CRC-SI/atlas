define([
  'atlas/assets/testMesh',
  // Code under test
  'atlas/model/Mesh',
  'atlas/model/GeoPoint',
  'jasmine-utility'
], function(c3mlMesh, Mesh, GeoPoint, jasmineUtils) {
  describe('A Mesh', function() {

    var mesh, args;

    beforeEach(function() {
      args = {
        renderManager: {},
        eventManager: {}
      };
      jasmine.addMatchers(jasmineUtils);
    });

    afterEach(function() {
      mesh = null;
    });

    it('can be constructed with C3ML', function() {
      mesh = new Mesh('id', c3mlMesh, args);
      expect(mesh.getId()).toEqual('id');
      expect(mesh.isGltf()).toBe(false);
      expect(mesh._positions).not.toBe(null);
      expect(mesh._indices).not.toBe(null);
    });

    it('can be constructed with a GLTF url', function() {
      mesh = new Mesh('id', {gltfUrl: 'www.whatever.com'}, args);
      expect(mesh.getId()).toEqual('id');
      expect(mesh._gltfUrl).toEqual('www.whatever.com');
      expect(mesh.isGltf()).toBe(true);
      expect(mesh._positions).toBe(null);
      expect(mesh._indices).toBe(null);
    });

    it('can be constructed with GLTF JSON', function() {
      var gltfJson = {
        a: 'totally gltf'
      }
      mesh = new Mesh('id', {gltf: gltfJson}, args);
      expect(mesh.getId()).toEqual('id');
      expect(mesh._gltf).toEqual(gltfJson);
      expect(mesh.isGltf()).toBe(true);
      expect(mesh._positions).toBe(null);
      expect(mesh._indices).toBe(null);
    });
  });
});
