// Build profile for RequireJS.
({
  baseUrl: '../src',
  packages: [
    {name: 'jquery', location: '../lib', main: 'jquery'},
    {name: 'subdiv', location: '../lib/subdiv/dist', main: 'subdiv'},
    {name: 'utm-converter', location: '../lib', main: 'UtmConverter'}
  ],
  paths: {
    'atlas': '',
    'atlas/lib': '../lib',
    'atlas/lib/utility': '../lib/utility/src'
  },
  name: 'main',
  out: '../dist/atlas.min.js',
  excludeShallow: ['main'],
  deps: ['subdiv']
})
