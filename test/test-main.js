var tests = [];
specsConfig = [
  {name: 'camera/Camera', run: true},
  {name: 'core/ItemStore', run: true},
  {name: 'dom/PopupFaculty', run: true},
  {name: 'dom/Overlay', run: true},
  {name: 'edit/EditManager', run: true},
  {name: 'entity/EntityManager', run: true},
  {name: 'model/Collection', run: true},
  {name: 'model/Ellipse', run: true},
  {name: 'model/Feature', run: true},
  {name: 'model/Handle', run: true},
  {name: 'model/Line', run: true},
  {name: 'model/LineNetwork', run: true},
  {name: 'model/Mesh', run: true},
  {name: 'model/Polygon', run: true},
  {name: 'model/Rectangle', run: true},
  {name: 'util/WKT', run: true},
  {name: 'visualisation/AbstractProjection', run: true},
  {name: 'visualisation/HeightProjection', run: true},
  {name: 'visualisation/ColourProjection', run: true},
  {name: 'visualisation/DynamicProjection', run: true}
];

specsConfig.forEach(function(config) {
  if (config.run) {
    tests.push('/base/atlas/test/specs/' + config.name + 'Spec.js');
  }
});

requirejs.config({
  // Karma serves files from '/base'.
  baseUrl: '/base',

  packages: [
    {name: 'jquery', location: 'atlas/lib', main: 'jquery.js'},
    {name: 'atlas/lib', location: 'atlas/lib'},
    {name: 'atlas/lib/utility', location: 'atlas/lib/utility/src'},
    {name: 'atlas/assets', location: 'atlas/assets'}, // Only need this for testing
    {name: 'atlas', location: 'atlas/src'}
  ],

  // Ask requirejs to load these files.
  deps: tests,

  // Start tests running once requirejs is done.
  callback: function() {
    require(['atlas/lib/utility/Log'], function(Log) {
      Log.setLevel('debug');
      window.__karma__.start()
    })
  }
});
