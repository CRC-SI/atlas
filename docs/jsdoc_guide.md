# JSDoc Templates

## General rules

* Follow the following general format;

  ```
  /**
   * // Text seperated from '*' by a space
   * @...
   */
  ```

* Empty newline between "blocks" of tags.
* Parameters and properties must specify type, using the template `@param {Type} name - Description`
  or `@property {Type} name - Description`.
* Description text (including `@classdesc`) should not be indented if it is multiple lines, all
  other text must be double-indented from the start of the previous line of text not the '*' 
  character.
* Use '@returns' (cf. `@return`).


## JSDoc tips and tricks

* In tags that define the "type" of an entity, you can use the following to fully qualify
  the name
    - `foo#baz`: baz is an instance member of foo.
    - `foo.bar`: bar is a static member of foo.
    - `foo~qux`: qux is an inner member of foo.


## Order of tags

1. Un-tagged Description
1. @namespace
1. @classdesc
1. @typedef
1. @event
1. @type
1. @property
1. @private, @protected, @public _Possibly at the end?_
1. @param
1. @listens
1. @fires
1. @returns
1. @class
1. @extends
1. @abstract
1. @static _Possibly before @returns?_
1. @ignore


## Examples

### Class definition

```js
/**
 * @classdesc Description of class
 *
 * @param ... //Constructor arguments
 * @returns {...} // Fully qualified class name
 *
 * @class ... // Fully qualified class name
 */
```


### Events

Events should be defined where they are dispatched. In Atlas, the event could either be a command or
an internal event of Atlas. For example, a command's description might be "A command to select one 
or more entities.", and for notification "The left mouse button was pressed". Two namespaces, 
`ExternalEvent` and `InternalEvent`, exist to collect commands and internal events respectively.

```js
/**
 * Description of the event.
 *
 * @event (ExternalEvent|InternvalEvent)#FULLY_QUALIFIED_NAME
 * @property ... // Properties of the Event
 */
```


### Function that handles an event

```js
/**
 * Description of function
 *
 * @param ...
 * 
 * @listens ExternalEvent#...
 */
```


### Function that causes (fires) an event

```js
/**
 * Function description.
 *
 * @param ...
 *
 * @fires (ExternalEvent|InternvalEvent)#FULLY_QUALIFIED_NAME
 */
```
