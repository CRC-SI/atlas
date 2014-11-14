// Meteor package definition.
Package.describe({
  name: 'urbanetic:atlas',
  version: '0.7.0-beta',
  summary: 'An API for a 3D Volumetric rendering library.'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.0');
  api.use('aramk:requirejs', ['client', 'server']);
  api.addFiles(['dist/atlas.min.js'], ['client', 'server']);
  api.addFiles(['dist/resources/atlas.min.css'], 'client');
});
