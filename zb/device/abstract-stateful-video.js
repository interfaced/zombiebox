/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import UnsupportedFeature from 'zb/device/errors/unsupported-feature';
import StateMachine from '../state-machine';
import EventPublisher from '../events/event-publisher';
import {ResolutionInfoItem} from './resolutions';
import {Type as DRMType} from './drm/drm';
import IStatefulVideo, {State, StateDiagram} from './interfaces/i-stateful-video';
import IViewPort from './interfaces/i-video';

// This is a workaround for @suppress erroneously triggering no-undefined-types in eslint jsdoc plugin
// TODO: should be addressed in eslint-plugin-jsdoc
const checkTypes = null;


/**
 * @abstract
 * @implements {IStatefulVideo}
 */
export default class AbstractStatefulVideo extends EventPublisher {
	/**
	 * @param {ResolutionInfoItem} panelResolution
	 * @param {ResolutionInfoItem} appResolution
	 */
	constructor(panelResolution, appResolution) {
		super();

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
		 * @type {StateMachine<State>}
		 * @protected
		 */
		this._stateMachine = new StateMachine(StateDiagram, State.IDLE);

		/**
		 * @type {IViewPort}
		 * @protected
		 */
		this._viewport;

		/**
		 * Fired with: {State}, {State}
		 * @const {string}
		 */
		this.EVENT_STATE_EXIT = 'state-exit';

		/**
		 * Fired with: {State}, {State}
		 * @const {string}
		 */
		this.EVENT_STATE_ENTER = 'state-enter';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WILL_PLAY = 'will-play';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WILL_PAUSE = 'will-pause';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WILL_STOP = 'will-stop';

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_WILL_SEEK = 'will-seek';

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_WILL_CHANGE_RATE = 'will-change-rate';

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_WILL_CHANGE_VOLUME = 'will-change-volume';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_IDLE = 'idle';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_LOADING = 'loading';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_READY = 'ready';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_PLAYING = 'playing';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_PAUSED = 'paused';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_WAITING = 'waiting';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_SEEKING = 'seeking';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_ENDED = 'ended';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_ERROR = 'error';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_INVALID = 'invalid';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_DESTROYED = 'destroyed';

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_TIME_UPDATE = 'time-update';

		/**
		 * Volume has been changed
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_VOLUME_CHANGE = 'volume-change';

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_RATE_CHANGE = 'rate-change';

		/**
		 * Fired with: {number}
		 * @const {string}
		 */
		this.EVENT_SEEKED = 'seeked';

		/**
		 * Fired with: {string}, {string|undefined}
		 * @const {string}
		 */
		this.EVENT_DEBUG_MESSAGE = 'debug-message';

		this._stateMachine.on(
			this._stateMachine.EVENT_STATE_EXIT,
			(event, oldState, newState) => this._fireEvent(this.EVENT_STATE_EXIT, oldState, newState)
		);

		this._stateMachine.on(
			this._stateMachine.EVENT_STATE_ENTER,
			(event, newState, oldState) => this._onStateEnter(newState, oldState)
		);

		this._decorateInterface();
	}

	/**
	 * @abstract
	 * @override
	 */
	prepare(url, options = {}) {}

	/**
	 * @abstract
	 * @override
	 */
	destroy() {}

	/**
	 * @abstract
	 * @override
	 */
	play() {}

	/**
	 * @abstract
	 * @override
	 */
	pause() {}

	/**
	 * @abstract
	 * @override
	 */
	stop() {}

	/**
	 * @override
	 */
	getState() {
		return this._stateMachine.getCurrentState();
	}

	/**
	 * @override
	 */
	getStateTransition() {
		return this._stateMachine.getPendingTransition();
	}

	/**
	 * @abstract
	 * @override
	 */
	getUrl() {}

	/**
	 * @abstract
	 * @override
	 */
	getViewport() {}

	/**
	 * @abstract
	 * @override
	 */
	getDuration() {}

	/**
	 * @abstract
	 * @override
	 */
	getPosition() {}

	/**
	 * @abstract
	 * @override
	 */
	setPosition(position) {}

	/**
	 * @abstract
	 * @override
	 */
	getPlaybackRate() {}

	/**
	 * @abstract
	 * @override
	 */
	setPlaybackRate(rate) {}

	/**
	 * @abstract
	 * @override
	 */
	getMuted() {}

	/**
	 * @abstract
	 * @override
	 */
	setMuted(muted) {}

	/**
	 * @override
	 */
	toggleMuted() {
		this.setMuted(!this.getMuted());
		return this.getMuted();
	}

	/**
	 * @abstract
	 * @override
	 */
	getVolume() {}

	/**
	 * @abstract
	 * @override
	 */
	setVolume(volume) {}

	/**
	 * @override
	 */
	volumeDown(step = -1) {
		this.setVolume(this.getVolume() + step);
		return this.getVolume();
	}

	/**
	 * @override
	 */
	volumeUp(step = 1) {
		this.setVolume(this.getVolume() + step);
		return this.getVolume();
	}

	/**
	 * @override
	 */
	attachDRM(client) {
		throw new UnsupportedFeature('DRM protection');
	}

	/**
	 * @override
	 */
	detachDRM(type) {
		throw new UnsupportedFeature('DRM protection');
	}

	/**
	 * @abstract
	 * @override
	 */
	getEngine() {}

	/**
	 * @param {State|Array<State>} stateOrSeveral
	 * @param {string=} message
	 * @throws {StateError}
	 * @protected
	 */
	_assertStateIs(stateOrSeveral, message) {
		const expectedStates = Array.isArray(stateOrSeveral) ? stateOrSeveral : [stateOrSeveral];
		const currentState = this._stateMachine.getCurrentState();

		if (!expectedStates.includes(currentState)) {
			throw new StateError(currentState, expectedStates, message);
		}
	}

	/**
	 * @param {State|Array<State>} stateOrSeveral
	 * @param {string=} message
	 * @throws {StateError}
	 * @protected
	 */
	_assertStateIsNot(stateOrSeveral, message) {
		const unexpectedStates = Array.isArray(stateOrSeveral) ? stateOrSeveral : [stateOrSeveral];
		const expectedStates = Object.keys(State).filter((state) => !unexpectedStates.includes(state));

		this._assertStateIs(expectedStates, message);
	}

	/**
	 * @param {State} newState
	 * @param {State} oldState
	 * @protected
	 */
	_onStateEnter(newState, oldState) {
		this._fireEvent(this.EVENT_STATE_ENTER, newState, oldState);

		const stateEvents = {
			[State.IDLE]: this.EVENT_IDLE,
			[State.LOADING]: this.EVENT_LOADING,
			[State.READY]: this.EVENT_READY,
			[State.PLAYING]: this.EVENT_PLAYING,
			[State.PAUSED]: this.EVENT_PAUSED,
			[State.WAITING]: this.EVENT_WAITING,
			[State.SEEKING]: this.EVENT_SEEKING,
			[State.ENDED]: this.EVENT_ENDED,
			// [State.ERROR]: this.EVENT_ERROR, // Error event is expected to be fired separately
			[State.INVALID]: this.EVENT_INVALID,
			[State.DESTROYED]: this.EVENT_DESTROYED
		};

		if (stateEvents.hasOwnProperty(newState)) {
			this._fireEvent(stateEvents[newState]);
		}
	}

	/**
	 * @private [sic!]
	 */
	_decorateInterface() {
		const restrict = (method, states, message) => {
			let key;
			// As a special case, everything is allowed in ERROR state at application's risk
			const statesAndError = states.includes(State.ERROR) ? states : states.concat([State.ERROR]);

			// Find the actual implementation of the method in prototype chain
			for (let prototype = this; prototype; prototype = Object.getPrototypeOf(prototype)) {
				key = Object.getOwnPropertyNames(prototype).find((key) => prototype[key] === method);
				if (key) {
					break;
				}
			}

			const restricted = (...params) => {
				this._assertStateIs(statesAndError, message);
				return method.apply(this, params);
			};

			/** @suppress {checkTypes} */
			this[key] = restricted;
		};

		// eslint-disable-next-line no-unused-vars
		const {IDLE, LOADING, READY, PLAYING, PAUSED, WAITING, SEEKING, ENDED, ERROR, INVALID, DESTROYED} = State;
		const StatesWithMediaSourceKnown = [LOADING, READY, PLAYING, PAUSED, WAITING, SEEKING, ENDED];
		const StatesWithMediaSourceReady = [READY, PLAYING, PAUSED, WAITING, SEEKING, ENDED];

		restrict(
			this.prepare,
			[IDLE],
			'prepare() can only be called while Video is not initialized with media file'
		);

		restrict(
			this.attachDRM,
			[IDLE],
			'attachDRM() can only be called while Video is not initialized with media file'
		);

		restrict(
			this.detachDRM,
			[IDLE],
			'detachDRM() can only be called while Video is not initialized with media file'
		);

		restrict(
			this.play,
			[READY, PAUSED],
			'play() can only be called when Video is ready to play'
		);

		restrict(
			this.pause,
			[PLAYING],
			'pause() can only be called when Video is playing'
		);

		restrict(
			this.stop,
			StatesWithMediaSourceKnown,
			'stop() can only be called when Video is initialized with a media file'
		);

		restrict(
			this.getUrl,
			StatesWithMediaSourceKnown,
			'getUrl() can only be called when Video is initialized with a media file'
		);

		restrict(
			this.getDuration,
			StatesWithMediaSourceReady,
			'getDuration() can only be called when Video has loaded the media'
		);

		restrict(
			this.getPosition,
			StatesWithMediaSourceReady,
			'getPosition() can only be called when Video has loaded the media'
		);

		restrict(
			this.setPosition,
			[PLAYING, PAUSED, WAITING, SEEKING, ENDED],
			'setPosition() can only be called when Video has loaded the media'
		);

		restrict(
			this.getPlaybackRate,
			StatesWithMediaSourceReady,
			'getPlaybackRate() can only be called when Video has loaded the media'
		);

		restrict(
			this.setPlaybackRate,
			StatesWithMediaSourceReady,
			'setPlaybackRate() can only be called when Video has loaded the media'
		);

		// No restrictions on: destroy, getMuted, setMuted, toggleMuted, getVolume, setVolume, volumeDown, volumeUp
	}

	/**
	 * @param {DRMType} type
	 * @return {boolean}
	 */
	static isDRMSupported(type) { // eslint-disable-line no-unused-vars
		return false;
	}

	/**
	 * @return {boolean}
	 */
	static canHandleMultiDRM() {
		return false;
	}
}


/**
 */
export class StateError extends Error {
	/**
	 * @param {State} currentState
	 * @param {Array<State>} states
	 * @param {string=} message
	 */
	constructor(currentState, states, message = 'Incorrect state') {
		super(`${message}; Current state is ${currentState}, expected: ${states.join(' or ')}`);

		/**
		 * @type {State}
		 */
		this.currentState = currentState;

		/**
		 * @type {Array<State>}
		 */
		this.expectedStates = states;
	}
}
