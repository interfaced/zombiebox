/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import EventPublisher from '../events/event-publisher';
import Rect from '../geometry/rect';
import IVideo, {State} from './interfaces/i-video';
import IViewPort from './interfaces/i-view-port';


/**
 * @abstract
 * @implements {IVideo}
 */
export default class AbstractVideo extends EventPublisher {
	/**
	 * @param {Rect} rect
	 */
	constructor(rect) {
		super();

		/**
		 * @type {Rect}
		 * @protected
		 */
		this._containerRect = rect;

		/**
		 * @type {State}
		 * @protected
		 */
		this._state = State.UNINITED;

		/**
		 * @type {IViewPort}
		 * @protected
		 */
		this._viewport;

		/**
		 * Play command has been received and player has started loading video data
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_LOAD_START = 'load-start';

		/**
		 * Position has been changed
		 * Fired with: number position
		 * @const {string}
		 */
		this.EVENT_TIME_UPDATE = 'time-update';

		/**
		 * Player has started buffering
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_BUFFERING = 'buffering';

		/**
		 * An error occurred
		 * Fired with: string error description
		 * @const {string}
		 */
		this.EVENT_ERROR = 'error';

		/**
		 * Video metadata has been loaded
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_LOADED_META_DATA = 'loaded-meta-data';

		/**
		 * Video has ended
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_ENDED = 'ended';

		/**
		 * Duration has been obtained or changed
		 * Fired with: number duration in milliseconds
		 * @const {string}
		 */
		this.EVENT_DURATION_CHANGE = 'duration-change';

		/**
		 * Video has started to play
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_PLAY = 'play';

		/**
		 * Video has been paused
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_PAUSE = 'pause';

		/**
		 * Video has been stopped (play position has been reset)
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_STOP = 'stop';

		/**
		 * Playback rate has been changed
		 * Fired with: number new rate
		 * @const {string}
		 */
		this.EVENT_RATE_CHANGE = 'rate-change';

		/**
		 * Volume has been changed
		 * Fired with: number new volume
		 * @const {string}
		 */
		this.EVENT_VOLUME_CHANGE = 'volume-change';

		/**
		 * Only if old state !== new state
		 * Fired with:
		 *     {State} new state
		 *     {State} old state
		 * @const {string} State changed.
		 */
		this.EVENT_STATE_CHANGE = 'state-change';
	}

	/**
	 * @override
	 */
	togglePause() {
		if (this.getState() === State.PAUSED) {
			this.resume();
		} else {
			this.pause();
		}
	}

	/**
	 * @override
	 */
	toggleMuted() {
		this.setMuted(!this.getMuted());
	}

	/**
	 * @override
	 */
	isMuted() {
		return this.getMuted();
	}

	/**
	 * @override
	 */
	getState() {
		return this._state;
	}

	/**
	 * @override
	 */
	getViewport() {
		return this._viewport;
	}

	/**
	 * @override
	 */
	volumeUp(step) {
		return this._changeVolume(typeof step === 'undefined' ? 1 : step);
	}

	/**
	 * @override
	 */
	volumeDown(step) {
		return this._changeVolume(typeof step === 'undefined' ? -1 : -step);
	}

	/**
	 * @abstract
	 * @override
	 */
	play(url, startFrom) {}

	/**
	 * @abstract
	 * @override
	 */
	stop() {}

	/**
	 * @abstract
	 * @override
	 */
	forward() {}

	/**
	 * @abstract
	 * @override
	 */
	rewind() {}

	/**
	 * @abstract
	 * @override
	 */
	setPlaybackRate(value) {}

	/**
	 * @abstract
	 * @override
	 */
	getPlaybackRate() {}

	/**
	 * @abstract
	 * @override
	 */
	resume() {}

	/**
	 * @abstract
	 * @override
	 */
	pause() {}

	/**
	 * @abstract
	 * @override
	 */
	destroy() {}

	/**
	 * @abstract
	 * @override
	 */
	setPosition(milliseconds) {}

	/**
	 * @abstract
	 * @override
	 */
	getPosition() {}

	/**
	 * @abstract
	 * @override
	 */
	getDuration() {}

	/**
	 * @abstract
	 * @override
	 */
	getMuted() {}

	/**
	 * @abstract
	 * @override
	 */
	setMuted(value) {}

	/**
	 * @abstract
	 * @override
	 */
	setVolume(value) {}

	/**
	 * @abstract
	 * @override
	 */
	getVolume() {}

	/**
	 * @abstract
	 * @override
	 */
	getUrl() {}

	/**
	 * @abstract
	 * @param {Rect} containerRect
	 * @return {IViewPort}
	 * @protected
	 */
	_createViewPort(containerRect) {}

	/**
	 * @param {number} diff
	 * @return {number}
	 * @protected
	 */
	_changeVolume(diff) {
		this.setVolume(this.getVolume() + diff);

		return this.getVolume();
	}

	/**
	 * NOTE: Call this method after all (video|plugin)Object preparations
	 * @protected
	 */
	_initViewPort() {
		this._viewport = this._createViewPort(this._containerRect);

		// Applying default property values after both (base, platform) constructors
		this._viewport.updateViewPort();
	}

	/**
	 * @param {State} state
	 * @protected
	 */
	_setState(state) {
		if (state !== this._state) {
			this._fireEvent(this.EVENT_STATE_CHANGE, state, this._state);
			this._state = state;
		}
	}
}
