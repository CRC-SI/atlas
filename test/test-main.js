var tests = [];
    specsConfig = [
      { name: 'visualisation/AbstractProjection', run: true },
      { name: 'visualisation/HeightProjection', run: true },
      { name: 'visualisation/ColourProjection', run: true },
      { name: 'visualisation/DynamicProjection', run: true },
      { name: 'core/ItemStore', run: true },
      { name: 'dom/Overlay', run: true },
      { name: 'model/Handle', run: true },
      { name: 'model/Ellipse', run: true },
      { name: 'edit/EditManager', run: true },
      { name: 'entity/EntityManager', run: true },
      { name: 'camera/Camera', run: true },
    ];

specsConfig.forEach(function (config) {
  if (config.run) {
    tests.push('/base/atlas/test/specs/' + config.name + 'Spec.js');
  }
});

//var tests = [];
//for (var file in window.__karma__.files) {
//  if (window.__karma__.files.hasOwnProperty(file)) {
//    if (/.*Spec\.js$/.test(file)) {
//      console.debug('test spec:', file);
//      tests.push(file);
//    }
//  }
//}

requirejs.config({
  // Karma serves files from '/base'.
  baseUrl: '/base',

  packages: [
    { name: 'atlas/lib', location: 'atlas/lib'},
    { name: 'atlas/assets', location: 'atlas/assets'}, // Only need this for testing
    { name: 'atlas', location: 'atlas/src'}
  ],

  // Ask requirejs to load these files.
  deps: tests,

  // Start tests running once requirejs is done.
  callback: window.__karma__.start
});
