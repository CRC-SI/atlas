/**
 * External events are published by the host application into Atlas as commands to update the
 * internal state. These events are the primary method of interacting with Atlas.
 *
 * @namespace ExternalEvent
 */

/**
 * A command to zoom the camera to a given location.
 *
 * @event ExternalEvent#camera/zoomTo
 * @type {atlas.events.Event}
 * @property {atlas.model.GeoPoint} [args.position] - A geographic coordinate.
 * @property {String} [args.address] - A geographic location name which is resolved by a Geocoder.
 * @property {atlas.model.Rectangle} [args.rectangle] - A bounding box rectangle.
 * @property {Array.<String>} [args.ids] - A IDs of the {@link atlas.model.GeoEntity} objects to
 *     zoom to by using their bounding box.
 * @property {Boolean} [args.useCentroid] - Whether to use the centroid of the
 *     {@link atlas.model.GeoEntity} objects passed to "ids". By default, after 300 entities the
 *     centroid is used to generate the bounding box for better performance.
 * @property {Number} [args.boundingBoxScale=1.5] - The default scale to apply to the bounding box
 *     generated if "ids" is provided as padding.
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
