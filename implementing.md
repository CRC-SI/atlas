---
layout: page
title: Implementing Atlas
permalink: /implementing/
---

This is a guide to implementing the Atlas API with a new renderer. This is for you if you're
interested in using the Atlas API, but would like to use a rendering library other than Cesium.
Implementing an adapter for a new rendering library requires a bit of work, but not as much as you
might think.

## Introduction

Atlas was originally designed as a high-level abstraction over the Cesium rendering
library. Most of the logic was not specific to Cesium, so it was separated into the
renderer-agnostic Atlas library. The Cesium implementation was implemented as Atlas-Cesium, and as
such the same Atlas API can be implemented for some other renderer "Foo" as a library "Atlas-Foo".

## TODO

This guide is a WIP.
