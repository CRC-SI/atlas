# Atlas Design

When integrated within a "host" application, Atlas behaves like a component: it is completely
self-sufficient and will run by itself once started. The host application communicates with Atlas in
simple JavaScript by publishing and subscribing to events.

Importantly, the Atlas API is independent of any specific rendering library. This means it can be
implemented with adapters for different libraries, and the application can switch between rendering
technologies in real time.

For its initial release, Atlas was implemented for Cesium in the Atlas-Cesium library. More
information on how to implement adapters for other rendering libraries is coming soon.

## Managers

Atlas contains a collection of Manager objects that are responsible for maintaining state and
handling events that are not object-specific, for example the array of currently-selected entities
or executing a command to map the parameter values of a set of entities onto their colours.

There is one manager responsible for each major component of the system. The managers are summarised
below, with each component described in more detail afterwards.

Manager              | Responsibility
-------------------- | --------------
CameraManager        | Manages the position, orientation and movement of the camera in the scene. Also provides an API for setting and zooming to bookmarked viewpoints.
DomManager           | Manages the placement and visibility of the Atlas widget in the browser DOM.
EditManager          | Manages the editing of [entities](#entities) in response to user input. Logic is composed of a collection of [modules](#modules) for different edit modes.
EntityManager        | Maintains a collection of created [entities](#entities) and provides an external interface to create, update and delete them.
EventManager         | Manages the dispatching and bubbling of internal [events](#events), and the routing of external [events](#events).
InputManager         | Converts user input actions into internal Atlas [events](#events) that can be routed to other managers.
PopupManager         | Manages the display of popup elements on the [overlay](features.md#overlay).
RenderManager        | Manages the appearance of terrain and imagery in the scene, and provides access to functionality of the rendering library.
SelectionManager     | Manages selection and deselection of entities directly or within an area, and maintains a list of currently-selected entities.
VisualisationManager | Manages the application and removal of [projections](features.md#projections).

For more detailed information about the Atlas managers, consult the [JSDocs][jsdocs].

## Entities and Features



## Events

The concept of an **event** is very general, and can mean different things in different contexts.

Within Atlas, an event is published every time something happens in one part of the system that
might be of interest to another part of the system or the host application. These events are called
"internal" (`intern`) events, and every internal event is eventually published to the host
application.

The host application communicates with Atlas through the same event system. Events published by the
host application into Atlas are called "external" (`extern`) events. External events are more like
commands, or requests that the event be executed internally by the relevant Manager. From Atlas's
perspective, you can consider external events to be notifications that an event occurred in the host
application, and Atlas's internal state should be updated to be consistent with that event.

This distinction is important when deciding which events to listen for within Atlas. For example, an
external 'entity/select' event might be published when the user selects an entity in the host
application GUI, as opposed to clicking on Atlas. This event would be handled by the
SelectionManager, which synchronises the internal state by selecting the specified entity within
Atlas. Once the entity is selected, the SelectionManager would publish an internal 'entity/select'
event so that other managers can react to the completed selection if they are interested.

Subscribing to an internal events invokes the callback after the event happens and the state has
been updated. Subscribing to an external event invokes the callback when the host application
requests it, which may be before or after the command is executed (depending on the order that the
subscribed managers are notified).

## GIS Details

Atlas is designed more for convenience than for comprehensive coverage of all of the intricacies of
more complex GIS systems. As such, it is *opinionated* about some aspects of its design, meaning it
imposes certain restriction to reduce ambiguity. This will come as a welcome relief to GIS novices,
but may confuse experts searching for low-level configuration options.

This section lists the deliberate design decisions that have been made with respect to various
complexities of GIS:

* **Coordinate Projections**: All location data is expressed in the same coordinate system, namely
the standard [WGS 84][wgs84] using latitude, longitude and elevation.


> WIP

[jsdocs]: TODO
[wgs84]: https://en.wikipedia.org/wiki/World_Geodetic_System
