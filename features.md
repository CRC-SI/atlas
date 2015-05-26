---
layout: page
title: Atlas Features
permalink: /features/
---

Atlas has a variety of features to make geospatial rendering easy. This section provides a brief
description of each of them. For more information about the implementation details, refer to
[Atlas Design](design.md).


## Entities

An **entity** is any geospatial object that can be rendered in the scene. Atlas supports a variety
the following entity types:

Entity Type | Description
----------- | -----------
Point       | A point is just a point in space. It can be rendered in a variety of ways, such as a small dot or a sprite image.
Line        | A line (more precisely a line string) is a path between a sequence of points.
Network     | A network is a collection of connected lines. Networks provide an API for operations over the whole network.
Polygon     | A polygon is a 2D shape described by a ring of points. Polygons can also be extruded into 3D *prisms*.
Mesh        | A mesh is a complex 3D geometry that can provide a more realistic representation of a real-world object.

### Multiple forms

An entity represents a geometric form, but a **feature** represents an object in the real world.
A feature contains a collection of entities that can be used to display the feature in different
*forms*. For example, a building can be represented by its centroid (point), footprint (polygon),
massing (extruded polygon) or model (mesh).

### Editing

Atlas provides simple editing functionality for simple entities (i.e. not meshes). In edit mode,
the points that make up an entity's geometry will be rendered as handles that can be dragged and
dropped to modify the entity's shape. Other operations such as moving, rotating and scaling an
entity can be performed in a similar way.


## Projections

GIS data can be very complex and have many dimensions of information. Atlas provides logic for
**projections** that can render information about entities onto their visual appearance.

* **Colour** and **height** projections set the colour or height of an entity based on one of its
parameter values relative to the same parameter values of other entities.
* **Dynamic** projections can animate changes in the colour and height of an entity over time.


## Overlay

The **overlay** is the area of the browser window that covers the Atlas viewer component. The
overlay can be used to display information relating to the contents of the Atlas scene in the
browser using standard HTML elements. This is preferable to rendering the same information in the
the rendering library's GUI because the code (HTML, CSS and JS) can be reused consistently with any
rendering library.

The two primary uses of the overlay are *popups* and *legends*.

### Popups

A **popup** is a user interface element that hovers over an element in the scene to display
additional information about it. These are analogous to the [balloons in Google Earth][balloon].
Since the popup is displayed in native HTML/CSS on the overlay, it can contain any valid HTML,
including text, links, images and embedded videos.

### Legends

A **legend** is a user interface element that provides additional information about some visual
aspect of the scene. Common use cases for legends include:

1. Describing the values associated with different colours in [projections](#projections).
2. Displaying an association between building colours and their land use types.
3. Providing general geographic information relative to the current state of the camera, such as a
scale for distance or a compass to illustrate which direction is north.

[balloon]: https://developers.google.com/earth/documentation/balloons
