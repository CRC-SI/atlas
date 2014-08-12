// Meteor package definition.
Package.describe({
  summary: 'An API for a 3D Volumetric rendering library.'
});

Package.on_use(function (api) {
  // Depends on the requirejs package.
  api.use('requirejs', 'client');
  // Make the built source code and styles available for the client.
  // TODO(aramk) Atlas cannot be used on the server due to conflicts with RequireJS related to
  // http://requirejs.org/docs/errors.html#mismatch. It would be useful to have access to the
  // models and utility classes.
  api.add_files([
    'dist/atlas.min.js',
    'dist/resources/atlas.min.css',
    'dist/resources/images/handle.png'
  ], ['client']);
});
