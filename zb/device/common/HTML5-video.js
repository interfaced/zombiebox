/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {findLargest, ResolutionInfo} from '../resolutions';
import {remove, div, node} from '../../html';
import Rect from '../../geometry/rect';
import AbstractVideo from '../abstract-video';
import {State} from '../interfaces/i-video';
import HTML5ViewPort from './HTML5-view-port';


/**
 */
export default class HTML5Video extends AbstractVideo {
	/**
	 * @param {Rect} rect
	 */
	constructor(rect) {
		super(rect);

		/**
		 * @type {HTML5ViewPort}
		 * @protected
		 */
		this._viewport;

		/**
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._container = this._createContainer();

		/**
		 * @type {HTMLVideoElement}
		 * @protected
		 */
		this._video = this._createVideoObject();

		/**
		 * @type {!Object<string, Function>}
		 * @protected
		 */
		this._eventListeners = {
			'error': this._errorEventListener.bind(this),
			'loadedmetadata': this._loadedmetadataEventListener.bind(this),
			'playing': this._playingEventListener.bind(this),
			'durationchange': this._durationchangeEventListener.bind(this),
			'timeupdate': this._timeupdateEventListener.bind(this),
			'pause': this._pauseEventListener.bind(this),
			'ratechange': this._ratechangeEventListener.bind(this),
			'volumechange': this._volumechangeEventListener.bind(this),
			'loadstart': this._loadstartEventListener.bind(this),
			'ended': this._endedEventListener.bind(this),
			'waiting': this._waitingEventListener.bind(this)
		};

		/**
		 * Video tags' source element
		 * @type {HTMLElement}
		 * @protected
		 */
		this._source;

		/**
		 * @type {number}
		 * @protected
		 */
		this._startTime = NaN;

		this._initViewPort();
		this._initVideoObject('');

		this._setState(State.INITED);
	}

	/**
	 * @override
	 */
	play(url, startFrom) {
		this._startTime = startFrom || NaN;
		this._initVideoObject(url);

		this._setState(State.LOADING);

		this._video.play();
	}

	/**
	 * @override
	 */
	stop() {
		if (!this._video) {
			return;
		}

		this._video.pause();

		try {
			if (!isNaN(this._video.duration)) {
				this._video.currentTime = 0;
			}
		} catch (e) {
			/* Ignore errors */
		}

		this._destroyEvents();

		this._setState(State.STOPPED);
		this._fireEvent(this.EVENT_STOP); // Have to fire after player fires PAUSE
	}

	/**
	 * @override
	 */
	destroy() {
		this._removeVideoObject();
		this._removeContainer();
		this._setState(State.DEINITED);
	}

	/**
	 * @override
	 */
	resume() {
		this._video.playbackRate = 1;
		this._video.play();
	}

	/**
	 * @override
	 */
	pause() {
		this._video.pause();
	}

	/**
	 * @override
	 */
	forward() {
		if (this._video.playbackRate <= 0) {
			this._video.playbackRate = 1;
		}

		return this._seekByPlaybackRateDoubling();
	}

	/**
	 * @override
	 */
	rewind() {
		if (this._video.playbackRate >= 0) {
			this._video.playbackRate = -1;
		}

		return this._seekByPlaybackRateDoubling();
	}

	/**
	 * @override
	 */
	getPosition() {
		return this._video.currentTime * 1000;
	}

	/**
	 * @override
	 */
	setPosition(milliseconds) {
		this._video.currentTime = milliseconds / 1000;
	}

	/**
	 * @override
	 */
	getDuration() {
		return this._video.duration * 1000 || 0;
	}

	/**
	 * @override
	 */
	setMuted(value) {
		this._video.muted = !!value;
	}

	/**
	 * @override
	 */
	getMuted() {
		return this._video.muted;
	}

	/**
	 * @override
	 */
	setVolume(value) {
		this._video.volume = Math.max(0, Math.min(100, value)) / 100;
	}

	/**
	 * @override
	 */
	getVolume() {
		return Math.round(this._video.volume * 100);
	}

	/**
	 * @override
	 */
	getPlaybackRate() {
		return this._video.playbackRate;
	}

	/**
	 * @override
	 */
	setPlaybackRate(value) {
		this._video.playbackRate = value;
	}

	/**
	 * @override
	 */
	getUrl() {
		return this._source ? this._source.src : '';
	}

	/**
	 * @override
	 */
	_createViewPort(containerRect) {
		// Compatibility with updated viewport
		const panelResolution = ResolutionInfo[findLargest(containerRect)];
		const appResolution = panelResolution;

		return new HTML5ViewPort(
			panelResolution,
			appResolution,
			this._container,
			this._video
		);
	}

	/**
	 * @return {HTMLVideoElement}
	 * @protected
	 */
	_createVideoObject() {
		const videoObject = /** @type {HTMLVideoElement} */ (document.createElement('video'));
		videoObject.setAttribute('preload', 'metadata');
		videoObject.style.position = 'relative';

		this._source = node('source');
		videoObject.appendChild(this._source);

		return videoObject;
	}

	/**
	 * @return {HTMLDivElement}
	 * @protected
	 */
	_createContainer() {
		const container = div('html5-video-container');
		container.style.backgroundColor = 'black';
		container.style.position = 'absolute';
		container.style.overflow = 'hidden';

		document.body.insertBefore(container, document.body.firstChild);

		return container;
	}

	/**
	 * @param {string} url
	 * @protected
	 */
	_initVideoObject(url) {
		this._removeVideoObject();

		this._video = this._createVideoObject();

		this._source.setAttribute('src', url);

		this._container.appendChild(this._video);
		this._viewport.setVideoObject(this._video);

		this._initEvents();
	}

	/**
	 * @param {ErrorEvent} event
	 * @protected
	 */
	_errorEventListener(event) {
		const video = this._video;

		let textError = '';

		if (video.error && video.error.message) {
			textError = video.error.message;
		} else if (video.networkState === video['NETWORK_NO_SOURCE']) {
			textError = 'NETWORK_NO_SOURCE';
		} else {
			textError = event.message;
		}

		this._fireError(textError);
	}

	/**
	 * @protected
	 */
	_loadedmetadataEventListener() {
		if (!isNaN(this._startTime)) {
			// Seek to give position. EVENT_LOADED_META_DATA will be fired after first play on new position.
			this._video.currentTime = this._startTime / 1000;
		} else {
			this._fireEvent(this.EVENT_LOADED_META_DATA);
		}
	}

	/**
	 * @protected
	 */
	_playingEventListener() {
		if (!isNaN(this._startTime)) {
			this._fireEvent(this.EVENT_LOADED_META_DATA);
			this._startTime = NaN;
		}

		this._setState(State.PLAYING);
		this._fireEvent(this.EVENT_PLAY);
	}

	/**
	 * @protected
	 */
	_durationchangeEventListener() {
		this._fireEvent(this.EVENT_DURATION_CHANGE, this.getDuration());
	}

	/**
	 * @protected
	 */
	_timeupdateEventListener() {
		this._fireEvent(this.EVENT_TIME_UPDATE, this.getPosition());
	}

	/**
	 * @protected
	 */
	_pauseEventListener() {
		this._setState(State.PAUSED);
		this._fireEvent(this.EVENT_PAUSE, null);
	}

	/**
	 * @protected
	 */
	_ratechangeEventListener() {
		this._fireEvent(this.EVENT_RATE_CHANGE, this._video.playbackRate);
	}

	/**
	 * @protected
	 */
	_volumechangeEventListener() {
		this._fireEvent(this.EVENT_VOLUME_CHANGE, this.getVolume());
	}

	/**
	 * @protected
	 */
	_loadstartEventListener() {
		this._fireEvent(this.EVENT_LOAD_START, null);
	}

	/**
	 * @protected
	 */
	_endedEventListener() {
		this._fireEvent(this.EVENT_ENDED, null);
	}

	/**
	 * @protected
	 */
	_waitingEventListener() {
		this._setState(State.BUFFERING);
		this._fireEvent(this.EVENT_BUFFERING);
	}

	/**
	 * @protected
	 */
	_initEvents() {
		Object.keys(this._eventListeners)
			.forEach((eventName) => {
				this._video.addEventListener(eventName, this._eventListeners[eventName], false);
			});

		this._source.addEventListener('error', this._eventListeners['error']);
	}

	/**
	 * @protected
	 */
	_destroyEvents() {
		if (this._eventListeners && this._video) {
			Object.keys(this._eventListeners)
				.forEach((eventName) =>
					this._video.removeEventListener(eventName, this._eventListeners[eventName], false)
				);
		}

		if (this._source) {
			this._source.removeEventListener('error', this._eventListeners['error']);
		}
	}

	/**
	 * @protected
	 */
	_removeVideoObject() {
		this._destroyEvents();

		if (this._video) {
			remove(this._video);
		}

		this._video = null;
		this._source = null;
	}

	/**
	 * @protected
	 */
	_removeContainer() {
		if (this._container) {
			remove(this._container);
		}

		this._container = null;
	}

	/**
	 * @param {string} error
	 * @protected
	 */
	_fireError(error) {
		this._fireEvent(this.EVENT_ERROR, error);
		this._setState(State.ERROR);
	}

	/**
	 * @return {boolean} Was succeeded or not
	 * @private
	 */
	_seekByPlaybackRateDoubling() {
		try {
			this._video.playbackRate = this._video.playbackRate * 2;
			this._setState(State.SEEKING);

			return true;
		} catch (e) {
			return false;
		}
	}
}
