define([
  'atlas/util/Class',
  'atlas/util/DeveloperError',
  'atlas/model/Colour',
  'atlas/dom/Overlay',
  'atlas/visualisation/AbstractProjection',
  'atlas/visualisation/ColourProjection',
  'atlas/visualisation/DynamicProjection',
  'atlas/visualisation/HeightProjection',
  'atlas/lib/utility/Log'
], function (Class, DeveloperError, Colour, Overlay, AbstractProjection, ColourProjection,
             DynamicProjection, HeightProjection, Log) {

  /**
   * @classdesc The VisualisationManager is responsible for tracking, applying
   * and removing Projections.
   * @param {Object.<String, Object>} atlasManagers - A map of Atlas manager names to
   *      the current instance of that manager.
   * @class atlas.visualisation.VisualisationManager
   */
  var VisualisationManager = Class.extend( /** @lends atlas.visualisation.VisualisationManager# */{

    // TODO(bpstudds): Refactor this class to 'GeoChartFactory'? or 'ProjectionFactory'?
    _atlasManagers: null,

    /**
     * The defined projections currently affecting Atlas.
     * @type {Object.<String, atlas.visualisation.AbstractProjection>}
     * @private
     */
    _projections: null,

    /**
     * A map of GUI overlays to control rendering/unrendering of Projections.
     */
    _overlays: null,

    _init: function (atlasManagers) {
      this._atlasManagers = atlasManagers;
      this._atlasManagers.visualisation = this;
      this._projections = {};
      this._overlays = {};
    },

    /**
     * Performs any setup for the Manager that requires other Atlas managers to exist.
     */
    setup: function () {
      this._bindEvents();
    },

    /**
     * Binds functionality of the VisualisationManager to specific events.
     */
    _bindEvents: function () {
      this._eventHandlers = [
        {
          source: 'extern',
          name: 'projection/add',
          /* Creates a new projection.
           * @param {String} args.type - The type of projection, either 'colour' or 'height'.
           * @param {Array.<String>} args.ids - An array of GeoEntity IDs that the projection affects.
           * @param {Object} args.config - Constructor arguments as required by the type of projection. Refer to @{link atlas.visualisation.AbstractProjection}, @{link atlas.visualisation.ColourProjection}, and @{link atlas.visualisation.HeightProjection}.
           * @returns {atlas.visualisation.AbstractProjection} The old projection as <code>args.theOldProjection</code> and the new one as <code>args.theProjection</code>.
           */
          callback: function (args) {
            args.theProjection = this.createProjection(args);
            args.theOldProjection = this.addProjection(args.theProjection);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/render',
          /*
           * @param {String} args - The artifact of the projection to render.
           */
          callback: function (artifact) {
            this.render(artifact);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/unrender',
          /*
           * @param {String} args - The artifact of the projection to unrender.
           */
          callback: function (artifact) {
            this.unrender(artifact);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/remove',
          /*
           * @param {String} args - The artifact of the projection to remove.
           */
          callback: function (artifact) {
            this.remove(artifact);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/remove/all',
          callback: function () {
            this.removeAll();
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/add',
          /*
           * Creates a new dynamic projection.
           * @param {Object} args
           * @param {String} args.type - The type of projection, either 'colour' or 'height'.
           * @param {Array.<String>} args.ids - An array of GeoEntity ids that the projection affects.
           * @param {Array.<Object>} args.data - An array of objects mapping index to a map of GeoEntity id to it's parameter value for that index.
           * @param {Object} args.config - Constructor arguments as required by the type of projection. Refer to @{link atlas.visualisation.AbstractProjection}, @{link atlas.visualisation.ColourProjection}, and @{link atlas.visualisation.HeightProjection}.
           * @returns {atlas.visualisation.DynamicProjection} The new dynamic projection as <code>args.theProjection</code>.
           */
          callback: function (args) {
            args.theProjection = this.createDynamicProjection(args);
            this.addDynamicProjection(args.theProjection);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/remove',
          /*
           * @param {String} args - The artifact of the dynamic projection to remove.
           */
          callback: function (args) {
            this._projections['dynamic-'+args].stop();
            delete this._projections['dynamic-'+args];
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/start',
          /*
           * @param {String} args - The artifact of the dynamic projection to start.
           */
          callback: function (args) {
            this._projections['dynamic-'+args].start();
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/pause',
          /*
           * @param {String} args - The artifact of the dynamic projection to pause.
           */
          callback: function (args) {
            this._projections['dynamic-'+args].pause();
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/stop',
          /*
           * @param {String} args - The artifact of the dynamic projection to stop.
           */
          callback: function (args) {
            this._projections['dynamic-'+args].stop();
          }.bind(this)
        }
      ];
      this._atlasManagers.event.addEventHandlers(this._eventHandlers);
    },

    /**
     * Creates a new projection.
     * @param {Object} args
     * @param {String} args.type - The type of projection, either 'colour' or 'height'.
     * @param {Array.<String>} args.ids - An array of GeoEntity IDs that the projection affects.
     * @param {Object} args.config - Constructor arguments as required by the type of projection. Refer to @{link atlas.visualisation.AbstractProjection}, @{link atlas.visualisation.ColourProjection}, and @{link atlas.visualisation.HeightProjection}.
     * @returns {atlas.visualisation.AbstractProjection} The new projection object.
     */
    createProjection: function (args) {
      var Projection = args.type === 'colour' ? ColourProjection : HeightProjection;

      args.config.entities = {};
      args.ids.forEach(function (id) {
        args.config.entities[id] = this._atlasManagers.entity.getById(id);
      }, this);

      return new Projection(args.config);
    },

    /**
     * Creates a new dynamic projection.
     * @param {Object} args
     * @param {String} args.type - The type of projection, either 'colour' or 'height'.
     * @param {Array.<String>} args.ids - An array of GeoEntity ids that the projection affects.
     * @param {Array.<Object>} args.data - An array of objects mapping index to a map of GeoEntity id to it's parameter value for that index.
     * @param {Object} args.config - Constructor arguments as required by the type of projection. Refer to @{link atlas.visualisation.AbstractProjection}, @{link atlas.visualisation.ColourProjection}, and @{link atlas.visualisation.HeightProjection}.
     * @returns {atlas.visualisation.DynamicProjection} The new dynamic projection object.
     */
    createDynamicProjection: function (args) {
      var Projection = args.type === 'colour' ? ColourProjection : HeightProjection;
      // Set up the config for projection construction.
      args.config.values = {};
      args.config.entities = {};
      args.ids.forEach(function (id) {
        args.config.entities[id] = this._atlasManagers.entity.getById(id);
      }, this);
      var staticPrj = new Projection(args.config);

      return new DynamicProjection(staticPrj, args.data, args);
    },

    showLegends: function () {
      if (!this._projections['colour']) { return; }

      var legendData = this._projections['colour'].getLegend();
          html = Overlay.generateTable(legendData);
      this._legends = new Overlay({
        parent: this._atlasManagers.dom.getDom(),
        dimensions: {top:0, left:300},
        content: html
      });
      this._legends.show();
    },

    hideLegends: function () {
      if (this._legends) {
        this._legends.remove();
      }
    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Adds a Projection to be managed by the VisualisationManager. Only one projection can be active
     * per artifact. If a Projection that is bound to an artifact that is already in use, the old
     * Projection is unrendered and removed.
     * @param {atlas.visualisation.AbstractProjection} projection - The New Projection instance to add.
     * @returns {atlas.visualisation.AbstractProjection|undefined} The existing Projection bound
     *    to same artifact as the new Projection, if it exists.
     */
    addProjection: function (projection) {
      if (!(projection instanceof AbstractProjection)) {
        throw new DeveloperError('Tried to add an object to the VisualisationManager which is not a subclass of atlas.visualisation.AbstractProjection');
      }
      var target = projection.ARTIFACT,
          old = this._projections[projection.ARTIFACT],
          ret;
      if (old) {
        Log.debug('Overriding projection on', target, 'with new projection.');
        old.unrender();
        ret = old;
      }
      this._projections[target] = projection;

      this._overlays[target] && this._overlays[target].remove();
      this._overlays[target] = new Overlay({
        parent: this._atlasManagers.dom.getDom(),
        dimensions: {top: 0, left: 0},
        content: '<button id="visual-btn-' + target + '">' + target + '</button>'
      });
      document.getElementById('visual-btn-'+target).addEventListener('click', function (target) {
        return function (event) {
          // 0 -> Left click.
          event.button === 0 && this.toggleRender(target)
        }
      }(target).bind(this));
      return ret;
    },

    addDynamicProjection: function (dynamic) {
      var target = 'dynamic-'+dynamic._projector.ARTIFACT,
          BUTTON = 'visual-btn',
          SLIDER = 'visual-slider';

      this._projections[target] = dynamic;
      this._overlays[target] = new Overlay({
        parent: this._atlasManagers.dom.getDom(),
        dimensions: {top: 0, left: 0},
        content:
          '<p>'+target+'</p>' +
          '<input type="range" id="' + SLIDER + '-fps-' + target + '" min="1" max="30"> </br> ' +
          '<button id="' + BUTTON + '-play-' + target + '">&gt</button>' +
          '<button id="' + BUTTON + '-pause-' + target + '">||&gt</button>' +
          '<button id="' + BUTTON + '-stop-' + target + '">!</button>'
      });
      var getFpsFromForm = function (target) {
        return document.getElementById(SLIDER + '-fps-' + target).value;
      };
      document.getElementById(BUTTON + '-play-' + target).addEventListener('click', function (event) {
        this.setFps(getFpsFromForm(target));
        event.button === 0 && this.start();
      }.bind(this._projections[target]));

      document.getElementById(BUTTON + '-pause-' + target).addEventListener('click', function (event) {
        event.button === 0 && this.pause();
      }.bind(this._projections[target]));

      document.getElementById(BUTTON + '-stop-' + target).addEventListener('click', function (event) {
        event.button === 0 && this.stop();
      }.bind(this._projections[target]));
    },

    /**
     * Removes the projection affecting the given artifact.
     * @param {String} artifact - The artifact of the projection object to be removed.
     * @returns {atlas.visualisation.AbstractProjection|null} The Projection removed, or null
     *    if a projection does not existing for the given artifact.
     */
    remove: function (artifact) {
      var removedProjection = this._projections[artifact];
      if (removedProjection) {
        removedProjection.unrender();
        this._projections[artifact] = null;
      }
      return removedProjection;
    },

    /**
     * Removes projections on all artifacts.
     * @returns {Object.<String, atlas.visualisation.AbstractProjection>} The removed projections.
     */
    removeAll: function () {
      return Object.keys(this._projections).map(function(artifact) {
        return this.remove(artifact);
      }.bind(this));
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Renders the effects of the Projection currently Affect the given artifact.
     * @param {Object} artifact - The artifact to render.
     */
    render: function (artifact) {
      // TODO(bpstudds): Add function to render all currently managed Projections.
      // TODO(bpstudds): Add support for rendering a subset of entities.
      if (!this._projections[artifact]) {
        throw new DeveloperError('Tried to render projection ' + artifact + ' without adding a projection object.');
      } else {
        this._projections[artifact].render();
        artifact === 'colour' && this.showLegends();
      }
    },

    /**
     * Unrenders the effects of the Projection currently affecting the given artifact.
     * @param {Object} artifact - The artifact to unrender.
     */
    unrender: function (artifact) {
      // TODO(bpstudds): Add function to unrender all currently managed Projections.
      // TODO(bpstudds): Add support for un-rendering a subset of entities.
      if (!this._projections[artifact]) {
        throw new DeveloperError('Tried to unrender projection ' + artifact + ' without adding a projection object.');
      } else {
        this._projections[artifact].unrender();
        artifact === 'colour' && this.hideLegends();
      }
    },

    /**
     * Toggles a static projection between having its effects rendered and not rendered.
     * @param {String} artifact - The artifact of the projection to toggle.
     */
    toggleRender: function (artifact) {
      if (artifact.match(/dynamic-/)) { return; }

      // TODO (bpstudds): This code appears to be buggy.
      var prj = this._projections[artifact];
      if (!prj) {
        throw new DeveloperError('Tried to toggle render of projection', artifact, 'without adding a projection object.');
      } else {
        prj.isRendered() ? this.unrender(artifact) : this.render(artifact);
      }
    }
  });
  return VisualisationManager;
})
