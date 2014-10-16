// Meteor package definition.
Package.describe({
  summary: 'An API for a 3D Volumetric rendering library.'
});

Package.onUse(function (api) {
  api.use('aramk:requirejs', ['client', 'server']);
  api.addFiles(['dist/atlas.min.js'], ['client', 'server']);
  api.addFiles(['dist/resources/atlas.min.css'], 'client');
});
