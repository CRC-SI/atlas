// Build profile for RequireJS.
({
  baseUrl: '../src',
  packages: [
    {name: 'jquery', location: '../lib', main: 'jquery'},
    // This is the expected name of utm-converter in subdiv.
    {name: 'utm-converter', location: '../lib', main: 'UtmConverter.js'},
    // These all belong to subdiv.
    {name: 'atlas/lib/subdiv', location: '../lib/subdiv/src'},
    {name: 'ConvexHullGrahamScan', location: '../lib/subdiv/lib', main: 'ConvexHullGrahamScan.js'},
    {name: 'hull', location: '../lib/subdiv/lib', main: 'hull.js'},
    {name: 'jsts', location: '../lib/subdiv/lib/jsts'},
    {name: 'tinycolor', location: '../lib/subdiv/lib', main: 'tinycolor.js'},
    {name: 'underscore', location: '../lib/subdiv/lib', main: 'underscore.js'},
    {name: 'utility', location: '../lib/subdiv/lib/utility'}
  ],
  paths: {
    'atlas': '',
    'atlas/lib': '../lib',
    'atlas/lib/utility': '../lib/utility/src',
    'atlas/lib/subdiv': '../lib/subdiv/src'
  },
  name: 'main',
  out: '../dist/atlas.min.js',
  excludeShallow: ['main']
})
