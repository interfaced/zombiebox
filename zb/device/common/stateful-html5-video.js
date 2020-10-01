/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import UnsupportedFeature from '../errors/unsupported-feature';
import {remove, div, node} from '../../html';
import AbstractStatefulVideo from '../abstract-stateful-video';
import {ResolutionInfoItem} from '../resolutions';
import {State, PrepareOption} from '../interfaces/i-stateful-video';
import {InvalidTransitionError, PendingTransitionError} from '../../state-machine';
import HTML5ViewPort from './HTML5-view-port';

const {
	IDLE,
	LOADING,
	READY,
	PLAYING,
	PAUSED,
	WAITING,
	SEEKING,
	ENDED,
	ERROR,
	INVALID,
	DESTROYED
} = State;


/**
 */
export default class StatefulHtml5Video extends AbstractStatefulVideo {
	/**
	 * @param {ResolutionInfoItem} panelResolution
	 * @param {ResolutionInfoItem} appResolution
	 */
	constructor(panelResolution, appResolution) {
		super(panelResolution, appResolution);

		/**
		 * @type {ResolutionInfoItem}
		 * @protected
		 */
		this._panelResolution = panelResolution;

		/**
		 * @type {ResolutionInfoItem}
		 * @protected
		 */
		this._appResolution = appResolution;

		/**
		 * @type {HTML5ViewPort}
		 * @protected
		 */
		this._viewport;

		/**
		 * @type {?HTMLDivElement}
		 * @protected
		 */
		this._container = null;

		/**
		 * @type {?HTMLVideoElement}
		 * @protected
		 */
		this._videoElement = null;

		/**
		 * @type {?HTMLSourceElement}
		 * @protected
		 */
		this._sourceElement = null;

		/**
		 * @type {?State}
		 * @protected
		 */
		this._stateBeforeSeeking = null;

		/**
		 * @type {?number}
		 * @protected
		 */
		this._requestedStartPosition = null;

		/**
		 * @type {StartPositionState}
		 * @protected
		 */
		this._startPositionState = StartPositionState.NONE;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._receivedCanplay = false;

		// When we encounter State Machine errors in interface methods it's user's responsibility
		// If state errors happen in these handlers it means Video implementation is erroneous
		this._onNativeEventGuarded = (event) => {
			try {
				this._onNativeEvent(event);
			} catch (error) {
				if (error instanceof InvalidTransitionError || error instanceof PendingTransitionError) {
					this._onError(error);
				} else {
					throw error;
				}
			}
		};

		try {
			this._init();
		} catch (e) {
			this._stateMachine.setState(INVALID);
		}
	}

	/**
	 * @override
	 */
	prepare(url, options = {}) {
		this._stateMachine.startTransitionTo(LOADING);

		this._sourceElement = /** @type {HTMLSourceElement} */ (node('source'));
		this._sourceElement.setAttribute('src', url);

		this._stateMachine.setState(LOADING);

		if (PrepareOption.TYPE in options) {
			this._sourceElement.setAttribute('type', options[PrepareOption.TYPE]);
		}

		this._sourceElement.addEventListener('error', this._onNativeEventGuarded);

		this._videoElement.appendChild(this._sourceElement);

		if (PrepareOption.START_POSITION in options) {
			this._requestedStartPosition = options[PrepareOption.START_POSITION];

			this._reapplyStartPosition();
		}

		this._videoElement.load();
		// Wait for canplay event
	}

	/**
	 * @override
	 */
	play() {
		this._fireEvent(this.EVENT_WILL_PLAY);
		this._stateMachine.startTransitionTo(PLAYING);
		try {
			this._videoElement.play();
		} catch (e) {
			this._onError(e);
		}
	}

	/**
	 * @override
	 */
	pause() {
		this._fireEvent(this.EVENT_WILL_PAUSE);
		this._stateMachine.startTransitionTo(PAUSED);
		try {
			this._videoElement.pause();
		} catch (e) {
			this._onError(e);
		}
	}

	/**
	 * @override
	 */
	stop() {
		this._fireEvent(this.EVENT_WILL_STOP);
		this._stateMachine.startTransitionTo(IDLE);
		if (this._sourceElement) {
			this._videoElement.removeChild(this._sourceElement);
			this._sourceElement = null;
		}
		this._startPositionState = StartPositionState.NONE;
		this._receivedCanplay = false;
		this._videoElement.load();
	}

	/**
	 * @override
	 */
	destroy() {
		this._stateMachine.abortPendingTransition();
		this._stateMachine.startTransitionTo(DESTROYED);

		this._destroyDOM();
		this._stateMachine.setState(DESTROYED);
	}

	/**
	 * @override
	 */
	getUrl() {
		return this._videoElement.currentSrc;
	}

	/**
	 * @override
	 */
	getDuration() {
		return this._videoElement.duration * 1000;
	}

	/**
	 * @override
	 */
	setMuted(value) {
		this._videoElement.muted = value;
	}

	/**
	 * @override
	 */
	getMuted() {
		return this._videoElement.muted;
	}

	/**
	 * @override
	 */
	setVolume(value) {
		const normalized = Math.max(0, Math.min(100, value));

		if (normalized === this.getVolume()) {
			return;
		}

		this._fireEvent(this.EVENT_WILL_CHANGE_VOLUME, normalized);
		this._videoElement.volume = normalized / 100;
	}

	/**
	 * @override
	 */
	getVolume() {
		return Math.round(this._videoElement.volume * 100);
	}

	/**
	 * @override
	 */
	getPosition() {
		return this._videoElement.currentTime * 1000;
	}

	/**
	 * @override
	 */
	setPosition(milliseconds) {
		this._fireEvent(this.EVENT_WILL_SEEK, milliseconds);

		const currentState = this._stateMachine.getCurrentState();
		this._stateBeforeSeeking = currentState === SEEKING ? this._stateBeforeSeeking : currentState;

		if (!this._stateMachine.isIn(SEEKING)) {
			this._stateMachine.startTransitionTo(SEEKING);
		}
		this._videoElement.currentTime = milliseconds / 1000;
	}

	/**
	 * @override
	 */
	getPlaybackRate() {
		return this._videoElement.playbackRate;
	}

	/**
	 * @override
	 */
	setPlaybackRate(value) {
		this._fireEvent(this.EVENT_WILL_CHANGE_RATE, value);

		try {
			this._videoElement.playbackRate = value;
		} catch (error) {
			if (error instanceof DOMException && error.code === DOMException.NOT_SUPPORTED_ERR) {
				throw new UnsupportedFeature(`Playback rate of ${value}.`);
			}
			throw error;
		}
	}

	/**
	 * @override
	 */
	getViewport() {
		return this._viewport;
	}

	/**
	 * @return {?HTMLVideoElement}
	 */
	getEngine() {
		return this._videoElement;
	}

	/**
	 * @protected
	 */
	_init() {
		this._container = div('html5-video-container');
		this._container.style.backgroundColor = 'black';
		this._container.style.position = 'absolute';
		this._container.style.overflow = 'hidden';
		document.body.insertBefore(this._container, document.body.firstChild);

		this._videoElement = /** @type {HTMLVideoElement} */ (node('video'));
		this._videoElement.style.position = 'relative';
		this._container.appendChild(this._videoElement);
		for (const event of NativeEvents) {
			this._videoElement.addEventListener(event, this._onNativeEventGuarded);
		}

		this._viewport = new HTML5ViewPort(
			this._panelResolution,
			this._appResolution,
			this._container,
			this._videoElement
		);
		this._viewport.updateViewPort();
	}

	/**
	 * @param {Event} event
	 * @protected
	 */
	_onNativeEvent(event) {
		const eventMap = {
			'error': this._onNativeError,
			'loadedmetadata': this._onNativeLoadedMetadata,
			'loadeddata': this._onNativeLoadedData,
			'canplay': this._onNativeCanplay,
			'playing': this._onNativePlaying,
			'pause': this._onNativePause,
			'emptied': this._onNativeEmptied,
			'ended': this._onNativeEnded,
			'seeking': this._onNativeSeeking,
			'seeked': this._onNativeSeeked,
			'waiting': this._onNativeWaiting,
			'timeupdate': this._onNativeTimeupdate,
			'volumechange': this._onNativeVolumechange,
			'ratechange': this._onNativeRatechange
		};

		if (
			this._stateMachine.isIn(DESTROYED) ||
			this._stateMachine.isTransitingTo(DESTROYED) ||
			this._stateMachine.isIn(ERROR)
		) {
			this._fireEvent(
				this.EVENT_DEBUG_MESSAGE,
				`html5 ${event.type} ignored because video is in ${this._stateMachine.getCurrentState()} state`
			);
			return;
		}

		this._fireEvent(this.EVENT_DEBUG_MESSAGE, `html5 ${event.type}`);

		const handler = eventMap[event.type];
		if (handler) {
			handler.call(this, event);
		}
	}

	/**
	 * @param {Event} event
	 * @protected
	 */
	_onNativeError(event) {
		this._onError(event);
	}

	/**
	 * @protected
	 */
	_onNativeLoadedMetadata() {
		// First attempt to correct starting position – works in Safari and webOS with HLS
		this._reapplyStartPosition();
	}

	/**
	 * @protected
	 */
	_onNativeLoadedData() {
		// Second attempt to correct starting position – helps with other formats on webOS
		this._reapplyStartPosition();
	}

	/**
	 * @protected
	 */
	_onNativeCanplay() {
		this._receivedCanplay = true;

		if (
			(
				this._startPositionState === StartPositionState.NONE ||
				this._startPositionState === StartPositionState.APPLIED
			) &&
			this._stateMachine.isIn(LOADING)
		) {
			this._stateMachine.setState(READY);
		}
	}

	/**
	 * @protected
	 */
	_onNativePlaying() {
		this._stateMachine.setState(PLAYING);
	}

	/**
	 * @protected
	 */
	_onNativePause() {
		// html5 "pause" event fires right before "ended" event, we don't want Paused state in this case
		if (this._videoElement.ended) {
			return;
		}

		this._stateMachine.setState(PAUSED);
	}

	/**
	 * @protected
	 */
	_onNativeEmptied() {
		const pendingTransition = this._stateMachine.getPendingTransition();

		if (pendingTransition && pendingTransition.to === IDLE) {
			this._stateMachine.setState(IDLE);
		}
	}

	/**
	 * @protected
	 */
	_onNativeEnded() {
		this._stateMachine.setState(ENDED);
	}

	/**
	 * @protected
	 */
	_onNativeSeeking() {
		const currentState = this._stateMachine.getCurrentState();

		if (
			this._startPositionState === StartPositionState.REQUESTED &&
			currentState === LOADING
		) {
			this._startPositionState = StartPositionState.APPLYING;
			return;
		}

		this._stateMachine.setState(SEEKING);
	}

	/**
	 * @protected
	 */
	_onNativeSeeked() {
		const currentState = this._stateMachine.getCurrentState();

		if (currentState === LOADING) {
			if (this._startPositionState === StartPositionState.APPLYING) {
				this._startPositionState = StartPositionState.APPLIED;
			}

			if (
				this._startPositionState === StartPositionState.APPLIED &&
				this._videoElement.readyState >= NativeReadyState.HAVE_CURRENT_DATA
			) {
				if (this._receivedCanplay) {
					this._stateMachine.setState(READY);
				}
			}

			return;
		}

		this._fireEvent(this.EVENT_SEEKED, this._videoElement.currentTime * 1000);

		if (
			this._videoElement.readyState < NativeReadyState.HAVE_FUTURE_DATA &&
			this._stateBeforeSeeking === PLAYING
		) {
			this._stateMachine.setState(WAITING);

			this._stateBeforeSeeking = null;
			return;
		}

		// Since we seeked from the natural end of media, assume the intention was to restart playback
		if (this._stateBeforeSeeking === ENDED) {
			this._stateMachine.startTransitionTo(PLAYING);
			try {
				this._videoElement.play();
			} catch (e) {
				this._onError(e);
			}

			this._stateBeforeSeeking = null;
			return;
		}

		if (this._stateBeforeSeeking === PAUSED && !this._videoElement.ended) {
			this._stateMachine.setState(PAUSED);

			this._stateBeforeSeeking = null;
			return;
		}
		// Playing and Ended states will be handled in "playing" and "ended" event handlers

		this._stateBeforeSeeking = null;
	}

	/**
	 * @protected
	 */
	_onNativeWaiting() {
		const currentState = this._stateMachine.getCurrentState();
		const pendingTransition = this._stateMachine.getPendingTransition();

		if (currentState === SEEKING || pendingTransition && pendingTransition.to === SEEKING) {
			return;
		}

		if (!pendingTransition) {
			this._stateMachine.setState(WAITING);
		}
	}

	/**
	 * @protected
	 */
	_onNativeTimeupdate() {
		const currentState = this._stateMachine.getCurrentState();
		const pendingTransition = this._stateMachine.getPendingTransition();

		if (currentState === PLAYING && !pendingTransition) {
			this._fireEvent(this.EVENT_TIME_UPDATE, this._videoElement.currentTime * 1000);
		}
	}

	/**
	 * @protected
	 */
	_onNativeVolumechange() {
		const volume = Math.round(this._videoElement.volume * 100);
		this._fireEvent(this.EVENT_VOLUME_CHANGE, volume);
	}

	/**
	 * @protected
	 */
	_onNativeRatechange() {
		const rate = this._videoElement.playbackRate;
		this._fireEvent(this.EVENT_RATE_CHANGE, rate);
	}

	/**
	 * @protected
	 */
	_reapplyStartPosition() {
		const needsCorrection = this._requestedStartPosition !== null &&
			Math.round(this._requestedStartPosition / 1000) !== Math.round(this._videoElement.currentTime);

		if (!needsCorrection) {
			this._startPositionState = this._requestedStartPosition === null ?
				StartPositionState.NONE :
				StartPositionState.APPLIED;
			return;
		}

		this._startPositionState = StartPositionState.REQUESTED;

		this._fireEvent(
			this.EVENT_DEBUG_MESSAGE,
			'Applying start position ' +
			`State: ${this._startPositionState} ` +
			`Current: ${this._videoElement.currentTime}, requested: ${this._requestedStartPosition}`
		);
		try {
			this._videoElement.currentTime = this._requestedStartPosition / 1000;
		} catch (e) {
			if (e instanceof DOMException && e.code === DOMException.INVALID_STATE_ERR) {
				// Ignore
			} else {
				throw e;
			}
		}
	}

	/**
	 * @param {ErrorEvent|Event|Error} eventOrError
	 * @protected
	 */
	_onError(eventOrError) {
		this._stateMachine.abortPendingTransition();

		const pieces = [];
		if (eventOrError instanceof ErrorEvent) {
			pieces.push('ErrorEvent');
			pieces.push(eventOrError.message);
			pieces.push(eventOrError.error && eventOrError.error.toString());
		} else if (eventOrError instanceof Event) {
			const error = eventOrError.target.error || this._videoElement.error;
			if (!error) {
				pieces.push('Mysterious Error event');
			} else {
				if (error instanceof MediaError) {
					pieces.push('MediaError');
				}
				pieces.push(error.code);
				pieces.push(error.message);
			}
			pieces.push(`fired by ${eventOrError.target.nodeName} element`);
		} else if (eventOrError instanceof Error) {
			pieces.push(eventOrError.name);
			pieces.push(eventOrError['code']);
			pieces.push(eventOrError.message);
		} else {
			pieces.push(eventOrError.toString());
		}

		const message = pieces.filter((p) => p !== undefined).join(' ');
		this._stateMachine.setState(ERROR);
		this._fireEvent(this.EVENT_ERROR, message);
	}

	/**
	 * @protected
	 */
	_destroyDOM() {
		for (const event of NativeEvents) {
			this._videoElement.removeEventListener(event, this._onNativeEventGuarded);
		}
		if (this._sourceElement) {
			this._sourceElement.removeEventListener('error', this._onNativeEventGuarded);
		}

		remove(this._container);
		this._sourceElement = null;
		this._videoElement = null;
		this._container = null;
	}
}


/**
 * @enum {number}
 */
export const NativeReadyState = {
	HAVE_NOTHING: 0,
	HAVE_METADATA: 1,
	HAVE_CURRENT_DATA: 2,
	HAVE_FUTURE_DATA: 3,
	HAVE_ENOUGH_DATA: 4
};

/**
 * @type {!Array<string>}
 */
const NativeEvents = [
	'abort',
	'canplay',
	'canplaythrough',
	'durationchange',
	'emptied',
	'ended',
	'error',
	'loadeddata',
	'loadedmetadata',
	'loadstart',
	'pause',
	'play',
	'playing',
	'progress',
	'ratechange',
	'seeked',
	'seeking',
	'stalled',
	'suspend',
	'timeupdate',
	'volumechange',
	'waiting'
];

/**
 * Some engines with some media formats sometimes quietly fail to apply start position at initialisation.
 * We attempt to force it again at a better time(s).
 * HLS in Safari is the easiest way to reproduce this, webOS also does that with HLS and some other.
 * Such attempts to force it may happen before or after canplay event.
 * All this warrant a more complex tracking of something as trivial as starting position
 * @enum {string}
 * @protected
 */
export const StartPositionState = {
	NONE: 'none', // No were requested in start options, playback is starting from media start
	REQUESTED: 'requested', // A non-zero value was given as START_POSITION and will be set
	APPLYING: 'applying', // An attempt was made to set starting position
	APPLIED: 'applied' // Successfully set requested position
};
