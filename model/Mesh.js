define([
  'atlas/util/Extends',
  // Base class
  'atlas/model/GeoEntity'
], function (extend,
             GeoEntity) {

  /**
   * Constructs a new Mesh object.
   * @class A Mesh represents a 3D renderable object in atlas.
   *
   * @param {String} id - The ID of the Mesh object.
   * @param {Object} meshData - The data required to define what is actually rendered (Implementation defined).
   * @param {Object} args - Both optional and required construction parameters.
   * @param {String} args.id - The ID of the GeoEntity. (Optional if both <code>id</code> and <code>args</code> are provided as arguments)
   * @param {atlas/render/RenderManager} args.renderManager - The RenderManager object responsible for the GeoEntity.
   * @param {atlas/events/EventManager} args.eventManager - The EventManager object responsible for the Event system.
   * @param {atlas/events/EventTarget} [args.parent] - The parent EventTarget object of the GeoEntity.
   *
   * @alias atlas/model/Mesh
   * @extends {atlas/model/GeoEntity}
   * @constructor
   */
  var Mesh = function (id, meshData, args) {
    // Call GeoEntity base class constructor
    Mesh.base.constructor.call(this, id, args);

    /**
     * The location of the mesh object, specified by latitude, longitude, and elevation.
     * @type {atlas/model/Vertex}
     * @private
     */
    this._geoLocation = {};

    /**
     * The scale that is applied to the Mesh when transforming it from model space to world space.
     * @type {atlas/model/Vertex}
     * @private
     */
    this._scale = {};

    /**
     * The rotation that is applied to the MEsh when transforming it from model space to world space.
     * @type {atlas/model/Vertex}
     * @private
     */
    this._rotation = {};

    /**
     * Defines a transformation from model space to world space. This is derived from <code>Mesh._geoLocation</code>,
     * <code>Mesh._scale</code>, and <code>Mesh._rotation</code>.
     * @type {cesium/Core/Matrix4}
     * @private
     */
    this._modelMatrix = {};
  }
  // Extend from the GeoEntity class
  extend(GeoEntity, Mesh);

  return Mesh;
});
