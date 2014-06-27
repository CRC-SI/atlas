Package.describe({
  summary: 'An API for a 3D Volumetric rendering library.'
});

Package.on_use(function (api) {
  api.add_files(['dist/atlas.min.js', 'dist/atlas.min.css'], ['client']);
});
