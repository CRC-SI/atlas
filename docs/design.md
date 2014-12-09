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

> WIP
