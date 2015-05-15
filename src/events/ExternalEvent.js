/**
 * External events are published by the host application into Atlas as commands to update the
 * internal state. These events are the primary method of interacting with Atlas.
 *
 * @namespace ExternalEvent
 */

/**
 * A command to select one or more entities.
 *
 * @event ExternalEvent#entity/select
 * @type {atlas.events.Event}
 * @property {Array.<String>} args.ids - The IDs of the selected entities.
 */

/**
 * A command to deselect one or more entities.
 *
 * @event ExternalEvent#entity/deselect
 * @type {atlas.events.Event}
 * @property {Array.<String>} args.ids - The IDs of the entities to deselect.
 */

/**
 * A command to deselect all entities.
 *
 * @event ExternalEvent#entity/deselect/all
 * @type {atlas.events.Event}
 */

/**
 * A command to enable selection.
 *
 * @event ExternalEvent#selection/enable
 * @type {atlas.events.Event}
 */

/**
 * A command to disable selection.
 *
 * @event ExternalEvent#selection/disable
 * @type {atlas.events.Event}
 */

/**
 * A command to enable terrain.
 *
 * @event ExternalEvent#terrain/enable
 * @type {atlas.events.Event}
 */

/**
 * A command to disable terrain.
 *
 * @event ExternalEvent#terrain/disable
 * @type {atlas.events.Event}
 */

/**
 * A command to create a new Feature.
 *
 * @event ExternalEvent#entity/create
 * @type {atlas.events.Event}
 */

/**
 * A command to create new Features.
 *
 * @event ExternalEvent#entity/create/bulk
 * @type {atlas.events.Event}
 */

/**
 * A command to show an existing Feature.
 *
 * @event ExternalEvent#entity/show
 * @type {atlas.events.Event}
 */

/**
 * A command to hide an existing Feature.
 *
 * @event ExternalEvent#entity/hide
 * @type {atlas.events.Event}
 */
