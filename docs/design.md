# Atlas Design

Atlas is designed to simplify the complex task of geospatial rendering on the Web.

## Overview

When integrated within a "host" application, Atlas behaves like a component: it is completely
self-sufficient and will run by itself once started. The host application communicates with Atlas in
simple JavaScript by publishing and subscribing to events.

Importantly, the Atlas API is independent of any specific rendering library. This means it can be
implemented with adapters for different libraries, and the application can switch between rendering
technologies in real time.

For its initial release, Atlas was implemented for Cesium in the Atlas-Cesium library. For more
information on how to implement adapters for other rendering libraries, see [Implementing
Atlas](implementing.md).

## Events

The concept of an "event" is very general, and can mean different things in different contexts.

Within Atlas, an event is published every something happens in one part of the system that might be
of interest to another part of the system or the host application. These events are called
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

## Projections

Atlas is designed more to be convenient than comprehensive. Atlas has the opinion that all location
data should be expressed in the same format, and the most common GIS format seems to be latitude,
longitude and elevation in the WGS 84 projection of the world.

> WIP
