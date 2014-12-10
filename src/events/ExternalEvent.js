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
 * @type {Object}
 * @property {Array.<String>} ids - The IDs of the selected entities.
 */

/**
 * A command to deselect one or more entities.
 *
 * @event ExternalEvent#entity/deselect
 * @type {Object}
 * @property {Array.<String>} ids - The IDs of the entities to deselect.
 */

/**
 * A command to deselect all entities.
 *
 * @event ExternalEvent#entity/deselect/all
 * @type {Object}
 */

/**
 * A command to enable selection.
 *
 * @event ExternalEvent#selection/enable
 * @type {Object}
 */

/**
 * A command to disable selection.
 *
 * @event ExternalEvent#selection/disable
 * @type {Object}
 */
