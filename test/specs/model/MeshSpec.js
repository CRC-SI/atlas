define([
  'atlas/assets/testMesh',
  // Code under test
  'atlas/model/GeoPoint',
  'atlas/model/Mesh',
  'atlas/model/Vertex'
], function(c3mlMesh, GeoPoint, Mesh, Vertex) {
  describe('A Mesh', function() {

    var mesh, args;

    beforeEach(function() {
      args = {
        renderManager: {},
        eventManager: {}
      };
    });

    afterEach(function() {
      mesh = null;
    });

    it('should have some intelligent defaults', function() {
      var originalScale = c3mlMesh.scale;
      c3mlMesh.scale = null;
      mesh = new Mesh('id', c3mlMesh, args);
      expect(mesh._uniformScale).toEqual(1);
      expect(mesh._scale).toEqual(new Vertex({x: 1, y: 1, z: 1}));

      c3mlMesh.scale = originalScale;
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
