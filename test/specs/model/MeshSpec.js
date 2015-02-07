define([
  'atlas/assets/testMesh',
  // Code under test
  'atlas/model/GeoPoint',
  'atlas/model/Mesh',
  'atlas/model/Vertex'
], function(c3mlMesh, GeoPoint, Mesh, Vertex) {
  describe('A Mesh', function() {

    var mesh, data, args;

    beforeEach(function() {
      args = {
        renderManager: {},
        eventManager: {}
      };
      data = {
        geoLocation: {
          latitude: -37.8,
          longitude: 144.96,
          elevation: 0
        }
      };
    });

    afterEach(function() {
      data.geoLocation = null;
      data = null;
      args = null;
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

    it('can be constructed with a glTF url', function() {
      data.gltfUrl = 'www.whatever.com';
      mesh = new Mesh('id', data, args);
      expect(mesh.getId()).toEqual('id');
      expect(mesh._gltfUrl).toEqual(data.gltfUrl);
      expect(mesh.isGltf()).toBe(true);
      expect(mesh._positions).toBe(null);
      expect(mesh._indices).toBe(null);
    });

    it('can be constructed with glTF JSON', function() {
      data.gltf = {
        a: 'totally gltf'
      };
      mesh = new Mesh('id', data, args);
      expect(mesh.getId()).toEqual('id');
      expect(mesh._gltf).toEqual(data.gltf);
      expect(mesh.isGltf()).toBe(true);
      expect(mesh._positions).toBe(null);
      expect(mesh._indices).toBe(null);
    });

  });

});
