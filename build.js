// Build profile for RequireJS.
({
  baseUrl: 'src',
  paths: {
    'atlas': '',
    'atlas/lib': '../lib'
  },
  name: 'main',
  out: 'dist/atlas.js',
  excludeShallow: ['main']
})
