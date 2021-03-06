// Build profile for RequireJS.
({
  baseUrl: '../src',
  packages: [
    {name: 'jquery', location: '../lib', main: 'jquery'},
    {name: 'underscore', location: '../lib/underscore', main: 'underscore'},
    {name: 'utm-converter', location: '../lib', main: 'UtmConverter.js'}
  ],
  paths: {
    'atlas': '',
    'atlas/lib': '../lib',
    'atlas/lib/utility': '../lib/utility/src'
  },
  name: 'main',
  out: '../dist/atlas.min.js',
  excludeShallow: ['main']
})
