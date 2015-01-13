define([
  'atlas/core/Manager',
  'atlas/util/DeveloperError',
  'atlas/lib/utility/Log'
], function(Manager, DeveloperError, Log) {

  /**
   * @typedef atlas.render.TerrainManager
   * @ignore
   */
  var TerrainManager;

  /**
   * @classdesc The TerrainManager manages sets of terrain models (both global and local),
   * controlling the state of terrain, and switching between models.
   *
   * @class atlas.render.TerrainManager
   * @extends atlas.core.Manager
   */
  TerrainManager = Manager.extend(/** @lends atlas.render.TerrainManager# */ {

    _id: 'terrain',

    /**
     * Whether the Terrain is enabled. (Not the Manager itself).
     * @type {Boolean}
     * @private
     */
    _enabled: false,

    _init: function(managers) {
      this._super(managers);
    },

    setup: function() {
      this._bindEvents();
    },

    _bindEvents: function() {
      var handlers = {
        'extern': {
          'terrain/enable': this.setEnabled.bind(this, true),
          'terrain/disable': this.setEnabled.bind(this, false)
        }
      };
      this._eventHandles = this._managers.event.addNewEventHandlers(handlers);
    },

    /**
     * Function to set the rendering of the current terrain model. This a no-op if
     * <code>enable</code> is the same as the current terrain rendering state.
     *
     * @param {Boolen} enable - Whether to enable the terrain.
     *
     * @listens ExternalEvent#terrain/enable
     * @listens ExternalEvent#terrain/disable
     */
    setEnabled: function(enable) {
      if (enable === undefined) {
        throw new DeveloperError('Must specify enable value');
      }
      if (enable !== this.isTerrainEnabled()) {
        var entityShow = 'entity/show';
        this._enabled = enable;
        this._handleEnabledChange(enable);

        if (enable) {
          Log.info('Enabling terrain');
          this._eventHandles[entityShow] = this._managers.event.addEventHandler('extern',
              entityShow, this._handleEntityShowEvent.bind(this));
        } else {
          Log.info('Disabling terrain');
          this._eventHandles[entityShow].cancel();
          this._eventHandles[entityShow] = null;
        }
      }
    },

    /**
     * Sets the parameters required to render a terrain model.
     * @param {Object} [terrainParams] An object containing the terrain parameters.
     * @abstract
     */
    setTerrainModel: function(terrainParams) {
      throw new DeveloperError('Can not call functions on abstract TerrainManager');
    },

    /**
     * @returns {Boolean} Whether terrain is currently being rendered.
     */
    isTerrainEnabled: function() {
      return this._enabled;
    },

    _handleEntityShowEvent: function(args) {
      var entity = this._managers.entity.getById(args.id);
      if (entity) {
        this._handleEntityShow(true, entity);
      }
    },

    /**
     * Called when either the <code>entity/show</code> or <code>entity/hide</code> event occurs.
     * This function is intended to be overriden by Atlas implementations that need to handle
     * entity visibility changes.
     *
     * @param {atlas.model.GeoEntity} entity - The entity being shown.
     * @param {Boolean} visible - Whether the entity should be visible.
     *
     * @listens ExternalEvent#entity/show
     * @listens ExternalEvent#entity/hide
     *
     * @abstract
     */
    _handleEntityShow: function(entity, visible) {},

    /**
     * Called when either the <code>terrain/show</code> or terrain/hide event occurs.
     * This function is intended to be overriden by Atlas implementations that need to handle
     * terrain state changes.
     *
     * @param {Boolean} enabled - Whether terrain is now enabled.
     *
     * @listens ExternalEvent#terrain/enable
     * @listens ExternalEvent#terrain/disable
     *
     * @abstract
     */
    _handleEnabledChange: function(enabled) {}

  });

  return TerrainManager;
});
