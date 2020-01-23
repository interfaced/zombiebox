/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import UnsupportedFeature from '../errors/unsupported-feature';
import IEventPublisher from '../../events/interfaces/i-event-publisher';
import IViewPort from './i-view-port';


/**
 * NOTE: interface operates milliseconds in all methods
 * @interface
 * @extends {IEventPublisher}
 */
export default class IVideo {
	/**
	 * Starts playback from optional position in milliseconds
	 * @param {string} url
	 * @param {number=} startFrom
	 * @throws {UnsupportedFeature}
	 */
	play(url, startFrom) {}

	/**
	 * Continues playback when seeking, stopped or paused with default playback rate
	 * @throws {UnsupportedFeature}
	 */
	resume() {}

	/**
	 * Pauses playback when playing or seeking
	 * @throws {UnsupportedFeature}
	 */
	pause() {}

	/**
	 * Toggles pause state
	 * @throws {UnsupportedFeature}
	 */
	togglePause() {}

	/**
	 * Stops playback
	 * @throws {UnsupportedFeature}
	 */
	stop() {}

	/**
	 * Increments speed and seek forward
	 * @return {boolean} Was incrementing of forward speed successful or not
	 * @throws {UnsupportedFeature}
	 */
	forward() {}

	/**
	 * Increment speed and seek backward
	 * @return {boolean} Was incrementing of rewind speed successful or not
	 * @throws {UnsupportedFeature}
	 */
	rewind() {}

	/**
	 * Destroys object and uninitializes platform media
	 * @throws {UnsupportedFeature}
	 */
	destroy() {}

	/**
	 * @param {number} rate
	 * @throws {UnsupportedFeature}
	 */
	setPlaybackRate(rate) {}

	/**
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getPlaybackRate() {}

	/**
	 * Sets position in milliseconds
	 * @param {number} milliseconds
	 * @throws {UnsupportedFeature}
	 */
	setPosition(milliseconds) {}

	/**
	 * Returns current position in milliseconds
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getPosition() {}

	/**
	 * Returns video duration in milliseconds
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getDuration() {}

	/**
	 * Sets volume
	 * @param {number} value 0..100
	 * @throws {UnsupportedFeature}
	 */
	setVolume(value) {}

	/**
	 * Returns current volume
	 * @return {number} 0..100 rounded to whole number
	 * @throws {UnsupportedFeature}
	 */
	getVolume() {}

	/**
	 * Increases the volume
	 * @param {number=} step Default 1
	 * @return {number} volume
	 * @throws {UnsupportedFeature}
	 */
	volumeUp(step) {}

	/**
	 * Decreases the volume
	 * @param {number=} step Default 1
	 * @return {number} volume
	 * @throws {UnsupportedFeature}
	 */
	volumeDown(step) {}

	/**
	 * Sets mute state
	 * @param {boolean} value
	 * @throws {UnsupportedFeature}
	 */
	setMuted(value) {}

	/**
	 * Returns mute state
	 * @return {boolean}
	 * @throws {UnsupportedFeature}
	 */
	getMuted() {}

	/**
	 * Returns mute state
	 * @return {boolean}
	 * @throws {UnsupportedFeature}
	 */
	isMuted() {}

	/**
	 * Toggles mute state
	 * @throws {UnsupportedFeature}
	 */
	toggleMuted() {}

	/**
	 * Returns playing url
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	getUrl() {}

	/**
	 * @return {State}
	 */
	getState() {}

	/**
	 * Returns viewport instance
	 * @return {IViewPort}
	 */
	getViewport() {}
}


/*
 * ZombieBox Video event model was designed to be as close to HTML5 <video> reference as possible
 * So, we inherit event names and method signatures where possible
 *
 *  Not all events supported for all devices,
 *  so check out Demo Player to see current supported event set
 */


/**
 * Play command has been received and player has started loading video data
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_LOAD_START;


/**
 * Position has been changed
 * Fired with: number position
 * @const {string}
 */
IVideo.prototype.EVENT_TIME_UPDATE;


/**
 * Player has started buffering
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_BUFFERING;


/**
 * An error occurred
 * Fired with: string error description
 * @const {string}
 */
IVideo.prototype.EVENT_ERROR;


/**
 * Video metadata has been loaded
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_LOADED_META_DATA;


/**
 * Video has ended
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_ENDED;


/**
 * Duration has been obtained or changed
 * Fired with: number duration in milliseconds
 * @const {string}
 */
IVideo.prototype.EVENT_DURATION_CHANGE;


/**
 * Video has started to play
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_PLAY;


/**
 * Video has been paused
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_PAUSE;


/**
 * Video has been stopped (play position has been reset)
 * Fired with: nothing
 * @const {string}
 */
IVideo.prototype.EVENT_STOP;


/**
 * Playback rate has been changed
 * Fired with: number new rate
 * @const {string}
 */
IVideo.prototype.EVENT_RATE_CHANGE;


/**
 * Volume has been changed
 * Fired with: number new volume
 * @const {string}
 */
IVideo.prototype.EVENT_VOLUME_CHANGE;


/**
 * Only if old state !== new state
 * Fired with:
 *     {State} new state
 *     {State} old state
 * @const {string} State changed.
 */
IVideo.prototype.EVENT_STATE_CHANGE;


/**
 * @enum {string}
 */
export const State = {
	UNINITED: 'uninited',
	INITED: 'inited',
	LOADING: 'loading',
	BUFFERING: 'buffering',
	PLAYING: 'playing',
	PAUSED: 'paused',
	SEEKING: 'seeking',
	STOPPED: 'stopped',
	DEINITED: 'deinited',
	ERROR: 'error'
};
