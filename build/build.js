// Build profile for RequireJS.
({
  baseUrl: '../src',
  paths: {
    'atlas': '',
    'atlas/lib': '../lib'
  },
  name: 'main',
  out: '../dist/atlas.min.js',
  excludeShallow: ['main']
})
