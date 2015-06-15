---
layout: page
title: Developer Guide
permalink: /developers/
---

## Overview

This document describes how to use Atlas in a Web application. This includes both instructions to
build the library from source if so desired, and how to include the compiled JavaScript in the
application to create a 3D globe.

The intended audience is developers of new or existing applications that are implementing (or
considering implementing) Atlas in their project. It is also instructive to developers of the core
library of Atlas or any of its implementations who will likely need to build Atlas from source.

## Introduction

Atlas is a JavaScript library that provides a high-level API for 3D geospatial rendering. The Atlas
API makes it easy to incorporate modern rendering technologies in Web applications, supporting the
next generation of GIS tools.

When integrated within a “host” application, Atlas behaves like a component: it is completely
self-sufficient and will run by itself once started. The host application communicates with Atlas in
simple JavaScript by publishing and subscribing to events.

Importantly, the Atlas API is independent of any specific rendering library. This means it can be
implemented with adapters for different libraries, and the application can switch between rendering
technologies in real time.

For its initial release, Atlas was implemented for Cesium in the Atlas-Cesium library. For more
information on how to implement adapters for other rendering libraries, see [Implementing
Atlas](implementing).

## Project Layout

The Atlas project contains a variety of different configuration files and directories to support the
associated tools.

   Directory    |                Description
--------------- | ------------------------------------------
`/assets`       | Assets available for testing the rendering.
`/build`        | Intermediate files created during the [build process](#building).
`/coverage`     | Reports on test coverage.
`/dist`         | Final output of the [build process](#building).
`/docs`         | The source Markdown files for this documentation.
`/jsdocs`       | Code documentation compiled with [JSDoc][jsdoc].
`/lib`          | Downloaded [Bower][bower] dependencies.
`/node_modules` | Downloaded [npm][npm] dependencies.
`/resources`    | Static assets used by Atlas, particularly images and styles.
`/src`          | The source code of the Atlas library.
`/test`         | Unit and integration tests of the Atlas library.

For more detailed information about the Atlas managers, consult the [JSDocs][atlas-jsdocs].


## Building

Atlas uses [Grunt][grunt] to automate the build process, and Grunt requires the [Node package
manager][npm] (`npm`).If you have Grunt installed, then from the root Atlas directory you can simply
run:

    npm install
    grunt install
    grunt build

The output of the build will be placed in the `dist` directory. Intermediate files will be in the
`build` directory.

### What does the build do?

Building Atlas performs the following tasks:

1. Compiles all of the JavaScript modules and dependencies into a single file.
2. Minifies the resulting JavaScript file using [r.js][rjs].
3. Compiles all of the Less styles into a single CSS file.
4. Copies the compiled code and resources to the `dist` directory.

To leave the code unminified, call `grunt build:no-minify` instead of `grunt build`.

### Building JSDocs

JavaScript documentation can be compiled using [JSDoc][jsdoc] by running:

    grunt doc

The output of the JSDoc build will be placed in the `jsdoc` directory.


[grunt]: http://gruntjs.com/
[npm]: https://www.npmjs.org/
[rjs]: http://requirejs.org/docs/optimization.html
[jsdoc]: http://usejsdoc.org/
[bower]: http://bower.io/
[atlas-jsdocs]: http://jsdocs.atlas.urbanetic.net/
