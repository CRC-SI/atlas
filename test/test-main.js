var tests = [];
var specsConfig = [
  {name: 'camera/Camera', run: true},
  {name: 'core/Api', run: false},
  {name: 'core/ItemStore', run: true},
  {name: 'dom/DomManager', run: true},
  {name: 'dom/PopupFaculty', run: false, fix: 'Requires Overlay to be fixed'},
  {name: 'dom/Overlay', run: false, fix: 'problems with jquery'},
  {name: 'edit/EditManager', run: false, fix: 'tests totally out of date'},
  {name: 'entity/EntityManager', run: false, fix: 'abstract GeoEntity functions being called'},
  {name: 'material/Color', run: true},
  {name: 'material/Style', run: true},
  {name: 'model/Collection', run: true},
  {name: 'model/Ellipse', run: false},
  {name: 'model/Feature', run: false},
  {name: 'model/GeoPoint', run: true},
  {name: 'model/Handle', run: false},
  {name: 'model/HeightMap', run: true},
  {name: 'model/Line', run: false},
  {name: 'model/LineNetwork', run: false},
  {name: 'model/Mesh', run: false, fix: 'merge in feature/entity-create-event'},
  {name: 'model/Polygon', run: true},
  {name: 'model/Rectangle', run: true},
  {name: 'render/RenderManager', run: true},
  {name: 'render/TerrainManager', run: true},
  {name: 'test/lib/AtlasBuilder', run: false, fix: 'cannot construct ellipse without centre'},
  {name: 'util/AtlasMath', run: true},
  {name: 'util/Factory', run: true},
  {name: 'util/WKT', run: true},
  {name: 'visualisation/AbstractProjection', run: false},
  {name: 'visualisation/HeightProjection', run: false},
  {name: 'visualisation/ColorProjection', run: false},
  {name: 'visualisation/DynamicProjection', run: false}
];

var warnings = '\n';
specsConfig.forEach(function(config) {
  if (config.run) {
    tests.push('/base/atlas/test/specs/' + config.name + 'Spec.js');
  } else {
    warnings += 'Not running test spec: ' + config.name;
    config.fix && (warnings += ', fix: ' + config.fix);
    warnings += '\n';
  }
});
/* global console */
warnings !== '\n' && console.log(warnings);

/* global requirejs */
requirejs.config({
  // Karma serves files from '/base'.
  baseUrl: '/base',

  packages: [
    {name: 'atlas', location: 'atlas/src'},
    {name: 'atlas/lib', location: 'atlas/lib'},
    {name: 'atlas/lib/utility', location: 'atlas/lib/utility/src'},
    {name: 'atlas/assets', location: 'atlas/assets'}, // Only need this for testing
    {name: 'jquery', location: 'atlas/lib', main: 'jquery.js'},
    {name: 'underscore', location: 'atlas/lib/underscore', main: 'underscore'},
    {name: 'utm-converter', location: 'atlas/lib', main: 'UtmConverter.js'}
  ],

  // Ask requirejs to load these files.
  deps: tests,

  // Start tests running once requirejs is done.
  callback: function() {
    /* global require */
    require(['atlas/lib/utility/Log'], function(Log) {
      /* global GlobalLog: true */
      GlobalLog = Log;

      /* global Inspect: true */
      Inspect = function(o, msg) {
        msg = msg || '';
        // Strings don't get logged correctly if you "Stringify" them.
        if (typeof o !== 'string') {
          // Functions need to be 'toString'ed rather than 'stringify'ed.
          if (typeof o === 'function') {
            o = o.toString();
          } else {
            o = JSON.stringify(o, null, 4);
          }
        }
        GlobalLog.debug(msg + ': ', o);
      };
      /* global window */
      window.__karma__.start();
    });
  }
});
