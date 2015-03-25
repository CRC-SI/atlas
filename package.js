// Meteor package definition.
Package.describe({
  name: 'urbanetic:atlas',
  version: '0.8.0',
  summary: 'An API for a 3D Volumetric rendering library.',
  git: 'https://bitbucket.org/mutopia/atlas.git'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0');
  api.use('aramk:requirejs@2.1.15_1', ['client', 'server']);
  api.addFiles(['dist/atlas.min.js'], ['client', 'server']);
  api.addFiles(['dist/resources/atlas.min.css'], 'client');
});
