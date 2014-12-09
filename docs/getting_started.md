# Getting Started with Atlas

Atlas is a component that is designed to be included within a "host" Web application. The
integration process is not yet as simple as it could be, but this will be improved in the future.

At a high level, the required steps are as follows:

1. Download or build `atlas.js` (or `atlas.min.js`) and `atlas.css`.
2. Include the code shown below in your application's HTML.
3. In the section marked with `// ... your code`, you can start interacting with the Atlas API.

```
<link rel="stylesheet" href="atlas/dist/resources/atlas.min.css">
<link rel="stylesheet" href="atlas-cesium/dist/resources/atlas-cesium.min.css">
<script src="atlas-cesium/lib/Requirejs/require.js"></script>
<script>
require.config({
  baseUrl: '',
  packages: [
    {name: 'atlas', location: 'atlas/dist', main: 'atlas.min'},
    {name: 'atlas-cesium', location: 'atlas-cesium/dist', main: 'atlas-cesium.min'}
  ]
});

require(['atlas'], function() {
  require(['atlas-cesium'], function() {
    require(['atlas-cesium/core/CesiumAtlas'], function(CesiumAtlas) {
      atlas = new CesiumAtlas();
      atlas.attachTo('atlas-container');
      // ... your code
    });
  });
});
</script>

<div id="atlas-container"></div>
```
