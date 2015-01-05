# Getting Started with Atlas

Atlas is a component that is designed to be included within a "host" Web application. The
integration process is not yet as simple as it could be, but this will be improved in the future.

It's important to remember that Atlas is just an API, and can't render anything by itself. It needs
to be coupled with an *implementation* that does the rendering job. The default implementation is
[Atlas-Cesium][ac], which is the example we'll use below. Check out the [Atlas-Cesium
documentation][ac-docs] for more detail information and examples.

At a high level, the required steps are as follows:

1. Download or build `atlas.js` (or `atlas.min.js`) and `atlas.css`.
2. Include the code shown below in your application's HTML.
3. In the section marked with `// ... your code`, you can start interacting with the Atlas API.

```javascript
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

You can now interact with Atlas through the `atlas` object.

Note that you need to include both Atlas and Atlas-Cesium separately. This is because you may want
to use multiple Atlas implementations at the same time (side-by-side, or switch between them), so
the Atlas API is not included in each implementation.

## Using the Atlas API

The Atlas object (`CesiumAtlas` in this case) provides a very simple interface to the internal
complexities of 3D rendering. Instructions are sent to Atlas as *events* (similar to
`jQuery.trigger`) through the `Atlas.publish` method. Conversely, to observe events that occur
within Atlas, use the `Atlas.subscribe` method.

Start by moving the camera over the beautiful city of Melbourne, which you can do with the
`camera/move` event. All coordinates in Atlas use latitude, longitude and elevation in the WGS 84
projection (if you're interested, read more about [coordinate projections in
Atlas](design.md#gis-details)).

    atlas.publish('camera/move', {...});

Perhaps the most fundamental GIS operation is rendering a thing. In Atlas, all discrete renderable
'things' are called *entities*. Typical examples of entities are polygonal footprints of buildings
and parks, road centre lines and meshes of building facades. Ultimately, the level of detail of an
entity, be it a site, building, floor, room or window, is up to you and your project's requirements.

Like moving the camera, creating an entity is done by publishing an event. In this case, the event
is `entity/create` and the body of the event contains a description of its form (geometry).
For example, to render the footprint of the Melbourne Town Hall, we define the footprint polygon
using the [WKT format](wkt):

    atlas.publish('entity/show', {...});

![Town Hall](img/hall.jpg)

If you provide an ID for the entity, Atlas will use that ID internally, allowing you to interact
with it from outside. For example to hide the entity, you can use the `entity/hide` event like so:

    atlas.publish('entity/hide', {id: <polygon_id>});

### Input and selection

Many input features common to GIS applications are built into Atlas. Selection is one such features.
Left click on entities to select them; hold Shift to select multiple entities; and left click on the
ground to deselect all entities.

![Selected Town Hall](img/hall_selected.jpg)

To build an application around Atlas, you will be particularly interested in listening for user
input events and reading their context. Input events in Atlas are designed to mirror [input events
in the DOM](dom) and should be immediately familiar to Web developers (for more detail, see [Events
in Atlas][events]).

For example, a common operation is to double-click an entity to edit it. To hear about this as it
happens, you can subscribe to the `input/dblclick` event and read the context like so:

    atlas.subscribe('input/dblclick', function(event) {
      if (event.target) {
        alert('Double-clicked on entity ' + event.target.getId());
      }
    });

### It's not a building, it's a feature!

To keep the design of Atlas simple and flexible, it makes no assumptions about what an entity
represents. What's more, multiple entities may represent the same thing (at different levels of
detail, for example). A typical example is a building that the user might want to view as a
footprint, and extruded footprint or a detailed mesh. To address this need, Atlas provides the
concept of a *feature*.

A feature is a collection of entities that represent the same thing, where each entity presents a
different form. In fact, every time you create a new entity a new feature is created to contain it,
unless you ask for that entity to be assigned to an existing feature.


[ac]: https://github.com/urbanetic/atlas-cesium
[ac-docs]: http://docs.atlas-cesium.urbanetic.net/
[wkt]: https://en.wikipedia.org/wiki/Well-known_text
[dom]: http://www.w3.org/TR/DOM-Level-2-Events/events.html
[events]: design.md#events
