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
import {Type as DRMType} from '../drm/drm';
import IViewPort from './i-view-port';
import IDRMClient from './i-drm-client';


/**
 * @interface
 * @extends {IEventPublisher}
 */
export default class IStatefulVideo {
	/**
	 */
	constructor() {
		/**
		 * Fired with: {State}, {State}
		 * @const {string}
		 */
		this.EVENT_STATE_EXIT;

		/**
		 * Fired with: {State}, {State}
		 * @const {string}
		 */
		this.EVENT_STATE_ENTER;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WILL_PLAY;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WILL_PAUSE;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WILL_STOP;

		/**
		 * Fired with: {number} – Expected position
		 * @const {string}
		 */
		this.EVENT_WILL_SEEK;

		/**
		 * Fired with: {number} – Expected rate
		 * @const {string}
		 */
		this.EVENT_WILL_CHANGE_RATE;

		/**
		 * Fired with: {number} – Expected volume
		 * @const {string}
		 */
		this.EVENT_WILL_CHANGE_VOLUME;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_IDLE;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_LOADING;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_READY;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_PLAYING;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_PAUSED;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WAITING;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_SEEKING;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_ENDED;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_ERROR;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_INVALID;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_DESTROYED;

		/**
		 * Fired with: {number} – New timestamp
		 * @const {string}
		 */
		this.EVENT_TIME_UPDATE;

		/**
		 * Fired with: {number} – New volume
		 * @const {string}
		 */
		this.EVENT_VOLUME_CHANGE;

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_SEEKED;

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_RATE_CHANGE;

		/**
		 * Fired with: {string}, {string|undefined}
		 * @const {string}
		 */
		this.EVENT_DEBUG_MESSAGE;
	}

	/**
	 * @param {string} url
	 * @param {Object<(PrepareOption|string), *>=} options
	 * @throws {UnsupportedFeature}
	 */
	prepare(url, options) {}

	/**
	 * @throws {UnsupportedFeature}
	 */
	destroy() {}

	/**
	 * @throws {UnsupportedFeature}
	 */
	play() {}

	/**
	 * @throws {UnsupportedFeature}
	 */
	pause() {}

	/**
	 * @throws {UnsupportedFeature}
	 */
	stop() {}

	/**
	 * @return {State}
	 */
	getState() {}

	/**
	 * @return {?{from: State, to: State}}
	 * @throws {UnsupportedFeature}
	 */
	getStateTransition() {}

	/**
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	getUrl() {}

	/**
	 * @return {IViewPort}
	 * @throws {UnsupportedFeature}
	 */
	getViewport() {}

	/**
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getDuration() {}

	/**
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getPosition() {}

	/**
	 * @param {number} position
	 * @throws {UnsupportedFeature}
	 */
	setPosition(position) {}

	/**
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getPlaybackRate() {}

	/**
	 * @param {number} rate
	 * @throws {UnsupportedFeature}
	 */
	setPlaybackRate(rate) {}

	/**
	 * @return {boolean}
	 * @throws {UnsupportedFeature}
	 */
	getMuted() {}

	/**
	 * @param {boolean} muted
	 * @throws {UnsupportedFeature}
	 */
	setMuted(muted) {}

	/**
	 * @return {boolean}
	 * @throws {UnsupportedFeature}
	 */
	toggleMuted() {}

	/**
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	getVolume() {}

	/**
	 * @param {number} volume
	 * @throws {UnsupportedFeature}
	 */
	setVolume(volume) {}

	/**
	 * @param {number=} step
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	volumeDown(step) {}

	/**
	 * @param {number=} step
	 * @return {number}
	 * @throws {UnsupportedFeature}
	 */
	volumeUp(step) {}

	/**
	 * @param {IDRMClient} client
	 * @throws {UnsupportedFeature}
	 */
	attachDRM(client) {}

	/**
	 * @param {DRMType} type
	 * @return {Promise}
	 * @throws {UnsupportedFeature}
	 */
	detachDRM(type) {}

	/**
	 * @return {?*}
	 */
	getEngine() {}

	/**
	 * @param {DRMType|string} type
	 * @return {boolean}
	 */
	static isDRMSupported(type) {}

	/**
	 * @return {boolean}
	 */
	static canHandleMultiDRM() {}
}


/**
 * @enum {string}
 */
export const State = {
	IDLE: 'idle',
	LOADING: 'loading',
	READY: 'ready',
	PLAYING: 'playing',
	PAUSED: 'paused',
	WAITING: 'waiting',
	SEEKING: 'seeking',
	ENDED: 'ended',
	ERROR: 'error',
	INVALID: 'invalid',
	DESTROYED: 'destroyed'
};


/* eslint-disable max-len */
/**
 * @type {!Object<State, !Array<State>>}
 */
export const StateDiagram = {
	[State.IDLE]: [State.LOADING, State.ERROR, State.DESTROYED, State.INVALID],
	[State.LOADING]: [State.IDLE, State.READY, State.ERROR, State.DESTROYED],
	[State.READY]: [State.IDLE, State.PLAYING, State.ERROR, State.DESTROYED],
	[State.PLAYING]: [State.IDLE, State.PAUSED, State.SEEKING, State.WAITING, State.ENDED, State.ERROR, State.DESTROYED],
	[State.PAUSED]: [State.IDLE, State.PLAYING, State.SEEKING, State.ERROR, State.DESTROYED],
	[State.WAITING]: [State.IDLE, State.PLAYING, State.ENDED, State.ERROR, State.DESTROYED],
	[State.SEEKING]: [State.IDLE, State.PLAYING, State.PAUSED, State.WAITING, State.ENDED, State.ERROR, State.DESTROYED],
	[State.ENDED]: [State.IDLE, State.SEEKING, State.ERROR, State.DESTROYED],
	[State.ERROR]: [State.IDLE, State.LOADING, State.PLAYING, State.PAUSED, State.WAITING, State.SEEKING, State.ENDED, State.DESTROYED],
	[State.INVALID]: [State.DESTROYED],
	[State.DESTROYED]: []
};


/**
 * @enum {string}
 */
export const PrepareOption = {
	TYPE: 'media-type',
	START_POSITION: 'start-position',
	IS_4K: 'is-4k',
	IS_8K: 'is-8k'
};


/**
 * @enum {string}
 */
export const MediaType = {
	DASH: 'application/dash+xml',
	HLS: 'application/vnd.apple.mpegurl',
	MP4: 'video/mp4',
	WEBM: 'video/webm',
	MSS: 'application/vnd.ms-sstr+xml'
};
