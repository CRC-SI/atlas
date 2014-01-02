define([
  'atlas/util/DeveloperError',
  'atlas/util/Extends',
  'atlas/model/Colour',
  // Base class
  'atlas/model/GeoEntity'
], function (DeveloperError,
             extend,
             Colour,
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

    /**
     * The uniform colour to apply to the Mesh if a texture is not defined.
     * TODO(bpstudds): Work out the textures.
     * @type {atlas/model/Colour}
     * @private
     */
    this._uniformColour = Colour.GREEN;
  };
  // Extend from the GeoEntity class
  extend(GeoEntity, Mesh);

  /**
   * Uniform colour of the Mesh when it is selected.
   * @type {atlas/model/Colour}
   */
  Mesh.SELECTED_COLOUR = Colour.RED;


  /**
   * Translates the Mesh.
   * @param {atlas/model/Vertex} translation - The vector from the Mesh's current location to the desired location.
   * @param {Number} translation.x - The change in latitude, given in decimal degrees.
   * @param {Number} translation.y - The change in longitude, given in decimal degrees.
   * @param {Number} translation.z - The change in altitude, given in metres.
   */
  Mesh.prototype.translate = function (translation) {
    console.debug('mesh', 'trying to translate');
    // Update the 'translation', ie change _geoLocation.
    this._geoLocation = this._geoLocation.add(translation);
    // And redraw the Mesh.
    this.setRenderable(false);
    this.isVisible() && this.show();
  };

  /**
   * Scales the Mesh.
   * @param {atlas/model/Vertex} scale - The vector to scale the Mesh by.
   * @param {Number} scale.x - The scale along the <code>x</code> axis.
   * @param {Number} scale.y - The scale along the <code>y</code> axis.
   * @param {Number} scale.z - The scale along the <code>z</code> axis.
   */
  Mesh.prototype.scale = function (scale) {
    this._scale = this._scale.componentWiseMultiply(scale);
    this.setRenderable(false);
    this.isVisible() && this.show();
  };

  /**
   * Sets the uniform colour used to colour the Mesh. The current <code>_uniformColour</code>
   * is persisted in <code>_previousColour</code> so it can be restored.
   * @param {atlas/model/Colour} colour - The new colour to use.
   */
  Mesh.prototype.setUniformColour = function (colour) {
    console.debug('setting uniform colour to', colour);
    if (!(colour instanceof Colour)) {
      throw new DeveloperError('colour must be a valid atlas Colour object');
    } else {
      if (this._uniformColour !== colour) {
        // Only change colour if the new colour is different so _previousColour isn't clobbered.
        this._previousColour = this._uniformColour;
        this._uniformColour = colour;
        this.setRenderable(false);
      }
    }
  };

  return Mesh;
});
