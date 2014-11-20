define([
  'atlas/core/Manager',
  'atlas/core/ItemStore',
  'atlas/util/DeveloperError',
  'atlas/dom/Overlay',
  'atlas/visualisation/AbstractProjection',
  'atlas/visualisation/ColourProjection',
  'atlas/visualisation/DynamicProjection',
  'atlas/visualisation/HeightProjection',
  'atlas/lib/utility/Log'
], function(Manager, ItemStore, DeveloperError, Overlay, AbstractProjection, ColourProjection,
            DynamicProjection, HeightProjection, Log) {

  /**
   * @typedef atlas.visualisation.VisualisationManager
   * @ignore
   */
  var VisualisationManager;

  /**
   * @classdesc The VisualisationManager is responsible for tracking, applying
   * and removing Projections.
   * @param {Object.<String, Object>} managers - A map of Atlas manager names to
   *      the current instance of that manager.
   * @class atlas.visualisation.VisualisationManager
   */
  VisualisationManager = Manager.extend(/** @lends atlas.visualisation.VisualisationManager# */{

    // TODO(bpstudds): Refactor this class to 'GeoChartFactory'? or 'ProjectionFactory'?

    _id: 'visualisation',

    /**
     * The an ItemStore of all static projections.
     * @type {atlas.core.ItemStore}
     * @private
     */
    _staticProjections: null,

    /**
     * The an ItemStore of all dynamic projections.
     * @type {atlas.core.ItemStore}
     * @private
     */
    _dynamicProjections: null,

    /**
     * A map of GUI overlays to control rendering/unrendering of Projections.
     */
    _overlays: null,

    /**
     * An Overlay containing all the Legends for current projections.
     * @type {atlas.dom.Overlay}
     * @private
     */
    _legendContainer: null,

    /**
     * An ItemStore for all of the Overlay objects for the legends.
     * @type {atlas.core.ItemStore}
     * @private
     */
    _legendStore: null,

    _init: function(managers) {
      this._super(managers);
      this._staticProjections = new ItemStore();
      this._dynamicProjections = new ItemStore();
      this._legendStore = new ItemStore();
      this._overlays = {};
    },

    /**
     * Performs any setup for the Manager that requires other Atlas managers to exist.
     */
    setup: function() {
      this._bindEvents();
    },

    /**
     * Binds functionality of the VisualisationManager to specific events.
     */
    _bindEvents: function() {
      this._eventHandlers = [
        {
          source: 'extern',
          name: 'projection/add',
          /* Creates a new projection.
           * @param {String} args.type - The type of projection, either 'colour' or 'height'.
           * @param {Array.<String>} args.ids - An array of GeoEntity IDs that the projection affects.
           * @param {Object} args.config - Constructor arguments as required by the type of projection. Refer to @{link atlas.visualisation.AbstractProjection}, @{link atlas.visualisation.ColourProjection}, and @{link atlas.visualisation.HeightProjection}.
           * @returns {atlas.visualisation.AbstractProjection} The new projection as <code>args.projection</code>.
           */
          callback: function(args) {
            args.projection = this.createProjection(args);
            this.addProjection(args.projection);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/render',
          /*
           * @param {Object} args
           * @param {String} args.id - The ID of the projection to render.
           */
          callback: function(args) {
            this.render(args.id);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/unrender',
          /*
           * @param {Object} args
           * @param {String} args.id - The id of the projection to unrender.
           */
          callback: function(args) {
            this.unrender(args.id);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/remove',
          /*
           * @param {String} args - The artifact of the projection to remove.
           */
          callback: function(args) {
            this.remove(args.id);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/remove/all',
          callback: function() {
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
           * @returns {atlas.visualisation.DynamicProjection} The new dynamic projection as <code>args.projection</code>.
           */
          callback: function(args) {
            args.projection = this.createDynamicProjection(args);
            this.addDynamicProjection(args.projection);
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/remove',
          /*
           * @param {String} args - The artifact of the dynamic projection to remove.
           */
          callback: function(args) {
            throw new DeveloperError("Dynamic projection not yet supported.");
            // TODO(aramk) This was incomplete so I threw an exception.
            this._dynamicProjections['dynamic-' + args].stop();
            delete this._dynamicProjections['dynamic-' + args];
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/start',
          /*
           * @param {String} args - The artifact of the dynamic projection to start.
           */
          callback: function(args) {
            throw new DeveloperError("Dynamic projection not yet supported.");
            // TODO(aramk) This was incomplete so I threw an exception.
            this._dynamicProjections['dynamic-' + args].start();
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/pause',
          /*
           * @param {String} args - The artifact of the dynamic projection to pause.
           */
          callback: function(args) {
            throw new DeveloperError("Dynamic projection not yet supported.");
            // TODO(aramk) This was incomplete so I threw an exception.
            this._dynamicProjections['dynamic-' + args].pause();
          }.bind(this)
        },
        {
          source: 'extern',
          name: 'projection/dynamic/stop',
          /*
           * @param {String} args - The artifact of the dynamic projection to stop.
           */
          callback: function(args) {
            throw new DeveloperError("Dynamic projection not yet supported.");
            // TODO(aramk) This was incomplete so I threw an exception.
            this._dynamicProjections['dynamic-' + args].stop();
          }.bind(this)
        }
      ];
      this._managers.event.addEventHandlers(this._eventHandlers);
    },

    // -------------------------------------------
    // Getters and Setters
    // -------------------------------------------

    getLegendContainer: function() {
      if (!this._legendContainer) {
        this._legendContainer = new Overlay({
          id: 'visman-projection-container',
          parent: this._managers.dom.getDom(),
          title: 'Projections',
          position: {top: 300, left: 0}
        })
      }
      return this._legendContainer;
    },

    // -------------------------------------------
    // Static Projections
    // -------------------------------------------

    /**
     * Creates a new projection.
     * @param {Object} args
     * @param {String} args.type - The type of projection, either 'colour' or 'height'.
     * @param {Array.<String>} args.ids - An array of GeoEntity IDs that the projection affects.
     * @param {Object} args.config - Constructor arguments as required by the type of projection. Refer to @{link atlas.visualisation.AbstractProjection}, @{link atlas.visualisation.ColourProjection}, and @{link atlas.visualisation.HeightProjection}.
     * @returns {atlas.visualisation.AbstractProjection} The new projection object.
     */
    createProjection: function(args) {
      var Projection = args.type === 'colour' ? ColourProjection : HeightProjection;

      args.config.entities = {};
      args.ids.forEach(function(id) {
        args.config.entities[id] = this._managers.entity.getById(id);
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
    createDynamicProjection: function(args) {
      var Projection = args.type === 'colour' ? ColourProjection : HeightProjection;
      // Set up the config for projection construction.
      args.config.values = {};
      args.config.entities = {};
      args.ids.forEach(function(id) {
        args.config.entities[id] = this._managers.entity.getById(id);
      }, this);
      var staticPrj = new Projection(args.config);

      return new DynamicProjection(staticPrj, args.data, args);
    },

    _addLegend: function(projection) {
      var id = projection.getId(),
          legendData = projection.getLegendData(),
          keyHtml = Overlay.generateTable(legendData.key),
          legendHtml;
      legendHtml = '<div class="legend-caption">' + legendData.caption + '</div>';
      legendHtml += keyHtml;

      var container = this.getLegendContainer(),
          contentNode = container.getDomElements().content,
          legendOverlay = new Overlay({
            id: id,
            parent: contentNode,
            title: legendData.title,
            cssClass: 'legend',
            onRemove: function(e) {
              this.remove(id);
            }.bind(this),
            onEnabledChange: function(e) {
              this.toggleRender(id);
            }.bind(this),
            showMinimised: true,
            cssPosition: 'relative',
            content: legendHtml
          });
      container.show();
      this._legendStore.add(legendOverlay);
    },

//    showLegends: function () {
//      if (!this._dynamicProjections['colour']) { return; }
//
//      // TODO(bpstudds): This needs to be refactored so we can have multiple legends.
//      var legendData = this._dynamicProjections['colour'].getLegend(),
//          legendHtml = Overlay.generateTable(legendData.legend),
//          html;
//      html = '<div class="caption">' + legendData.caption + '</div>';
//      html += legendHtml;
//
//      this._legends = new Overlay({
//        parent: this._managers.dom.getDom(),
//        title: legendData.title,
//        'class': 'legend',
//        // TODO(bpstudds): Add IDs to projections, use the ID rather than artifact to store.
//        onRemove: function (e) { this.remove('colour'); }.bind(this),
//        position: {top: 50, left: 0},
//        content: html
//      });
//
//      this._legends.show();
//    },

//    hideLegends: function () {
//      if (this._legends) {
//        this._legends.remove();
//      }
//    },

    // -------------------------------------------
    // MODIFIERS
    // -------------------------------------------

    /**
     * Adds a Projection to be managed by the VisualisationManager.
     * @param {atlas.visualisation.AbstractProjection} projection - The New Projection instance to add.
     */
    addProjection: function(projection) {
      if (!(projection instanceof AbstractProjection)) {
        throw new DeveloperError('Tried to add an object to the VisualisationManager which is not a subclass of atlas.visualisation.AbstractProjection');
      }
      var id = projection.getId(),
          old = this._staticProjections.get(id);
      if (old) {
        Log.error('Tried to add projection with the same ID as an existing projection');
        return;
      }
      this._staticProjections.add(projection);
      this._addLegend(projection);
    },

    addDynamicProjection: function(dynamic) {
      // TODO(aramk) This was incomplete so I threw an exception.
      throw new DeveloperError("Dynamic projection not yet supported.");
      var target = 'dynamic-' + dynamic._projector.ARTIFACT,
          BUTTON = 'visual-btn',
          SLIDER = 'visual-slider';

      this._dynamicProjections[target] = dynamic;
      this._overlays[target] = new Overlay({
        parent: this._managers.dom.getDom(),
        position: {top: 0, left: 0},
        content: '<p>' + target + '</p>' +
            '<input type="range" id="' + SLIDER + '-fps-' + target + '" min="1" max="30"> </br> ' +
            '<button id="' + BUTTON + '-play-' + target + '">&gt</button>' +
            '<button id="' + BUTTON + '-pause-' + target + '">||&gt</button>' +
            '<button id="' + BUTTON + '-stop-' + target + '">!</button>'
      });
      var getFpsFromForm = function(target) {
        return document.getElementById(SLIDER + '-fps-' + target).value;
      };
      document.getElementById(BUTTON + '-play-' + target).addEventListener('click',
          function(event) {
            this.setFps(getFpsFromForm(target));
            event.button === 0 && this.start();
          }.bind(this._dynamicProjections[target]));

      document.getElementById(BUTTON + '-pause-' + target).addEventListener('click',
          function(event) {
            event.button === 0 && this.pause();
          }.bind(this._dynamicProjections[target]));

      document.getElementById(BUTTON + '-stop-' + target).addEventListener('click',
          function(event) {
            event.button === 0 && this.stop();
          }.bind(this._dynamicProjections[target]));
    },

    /**
     * Removes the projection affecting the given artifact.
     * @param {string} id - The id of the projection to be removed.
     * @returns {atlas.visualisation.AbstractProjection|null} The Projection removed, or null
     *    if a projection does not existing for the given artifact.
     */
    remove: function(id) {
      var prj = this._staticProjections.get(id),
          legend = this._legendStore.get(id);
      if (!prj) {
        Log.warn('Tried to remove projection ' + id + ' that does not exist.');
        return;
      }
      if (this._currentProjection === id) {
        this._currentProjection = null;
      }
      // Unrender projection and remove the projections legend.
      prj.unrender();
      legend.remove();
      this._legendStore.remove(id);
      this._staticProjections.remove(id);
      if (this._staticProjections.isEmpty()) {
        this.getLegendContainer().hide();
      }
      return prj;
    },

    /**
     * Removes projections on all artifacts.
     * @returns {Object.<String, atlas.visualisation.AbstractProjection>} The removed projections.
     */
    removeAll: function() {
      return this._staticProjections.map(function(projection, id) {
        return this.remove(id);
      }.bind(this));
    },

    // -------------------------------------------
    // BEHAVIOUR
    // -------------------------------------------

    /**
     * Renders the effects of the Projection currently affecting the given artifact.
     * @param {Object} id - The ID of the projection to render.
     */
    render: function(id) {
      // Unrender all other projections
      var projection = this._staticProjections.get(id),
          legend = this._legendStore.get(id),
          artifact = projection.ARTIFACT;

      if (!projection) {
        throw new DeveloperError('Tried to render projection ' + id
            + ' without adding a projection object.');
      } else {
        if (this._currentProjection && this._currentProjection !== id) {
          this.unrender(this._currentProjection);
        }
        projection.render();
        legend.maximise();
        this._currentProjection = id;
        this._managers.event.handleInternalEvent('projection/render/complete',
            {id: projection.getId(), name: artifact});
      }
    },

    /**
     * Unrenders the effects of the Projection currently affecting the given artifact.
     * @param {String} id - The ID of the projection to unrender.
     */
    unrender: function(id) {
      // TODO(bpstudds): Add support for un-rendering a subset of entities.
      var projection = this._staticProjections.get(id),
          legend = this._legendStore.get(id),
          artifact = projection.ARTIFACT;

      if (!projection) {
        throw new DeveloperError('Tried to unrender projection ' + id
            + ' without adding a projection object.');
      } else {
        projection.unrender();
        legend.minimise();
        this._currentProjection = null;
        this._managers.event.handleInternalEvent('projection/unrender/complete',
            {id: projection.getId(), name: artifact});
      }
    },

    /**
     * Toggles a static projection between having its effects rendered and not rendered.
     * @param {String} id - The artifact of the projection to toggle.
     */
    toggleRender: function(id) {
      var projection = this._staticProjections.get(id);

      if (projection.isRendered()) {
        this.unrender(id);
      } else {
        this.render(id);
      }
    }
  });

  return VisualisationManager;
});
