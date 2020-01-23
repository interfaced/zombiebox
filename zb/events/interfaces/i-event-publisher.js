/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * Event Object
 * Implements event-model to mixin for classes require
 * @interface
 */
export default class IEventPublisher {
	/**
	 * Add event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	on(event, callback) {}

	/**
	 * Remove event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	off(event, callback) {}

	/**
	 * Add event listener once
	 * @param {string} event
	 * @param {Listener} callback
	 */
	once(event, callback) {}

	/**
	 * Remove event listener
	 * @param {string=} event
	 */
	removeAllListeners(event) {}
}


/**
 * @const {string}
 */
IEventPublisher.prototype.EVENT_ANY;


/**
 * @typedef {function(string, ...?)}
 */
export let Listener;
