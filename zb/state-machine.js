/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import EventPublisher from './events/event-publisher';


/**
 * @template STATE_TYPE
 */
export default class StateMachine extends EventPublisher {
	/**
	 * @param {!Object<STATE_TYPE, Array<STATE_TYPE>>} transitionsTable
	 * @param {STATE_TYPE} initialState
	 */
	constructor(transitionsTable, initialState) {
		super();

		/**
		 * @type {!Object<STATE_TYPE, Array<STATE_TYPE>>}
		 * @protected
		 */
		this._transitionsTable = transitionsTable;

		/**
		 * @type {?STATE_TYPE}
		 * @protected
		 */
		this._currentState = initialState;

		/**
		 * @type {?{from: STATE_TYPE, to: STATE_TYPE}}
		 * @protected
		 */
		this._pendingTransition = null;

		/**
		 * Fired with:
		 *     {STATE_TYPE} The state that was entered
		 *     {STATE_TYPE} The previous state
		 * @const {string}
		 */
		this.EVENT_STATE_ENTER = 'state-enter';

		/**
		 * Fired with:
		 *     {STATE_TYPE} The state that was was exited
		 *     {STATE_TYPE} The next state
		 * @const {string}
		 */
		this.EVENT_STATE_EXIT = 'state-exit';
	}

	/**
	 * @param {STATE_TYPE} newState
	 * @throws {InvalidTransitionError<STATE_TYPE>}
	 * @throws {PendingTransitionError<STATE_TYPE>}
	 */
	setState(newState) {
		if (!this.canTransitTo(newState)) {
			throw new InvalidTransitionError(this._currentState, newState);
		}

		if (this._pendingTransition && this._pendingTransition.to !== newState) {
			throw new PendingTransitionError(this._pendingTransition.from, this._pendingTransition.to, newState);
		}

		let previousState;
		if (!this._pendingTransition) {
			previousState = this._currentState;
			this._fireEvent(this.EVENT_STATE_EXIT, previousState, newState);
		} else {
			previousState = this._pendingTransition.from;
			this._pendingTransition = null;
		}

		this._currentState = newState;
		this._fireEvent(this.EVENT_STATE_ENTER, this._currentState, previousState);
	}

	/**
	 * @param {STATE_TYPE} state
	 * @throws {PendingTransitionError<STATE_TYPE>}
	 */
	startTransitionTo(state) {
		if (this._pendingTransition) {
			throw new PendingTransitionError(this._pendingTransition.from, this._pendingTransition.to, state);
		}

		if (!this.canTransitTo(state)) {
			throw new InvalidTransitionError(this._currentState, state);
		}

		this._pendingTransition = {
			from: this._currentState,
			to: state
		};
		this._currentState = null;
		this._fireEvent(this.EVENT_STATE_EXIT, this._pendingTransition.from, state);
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {boolean}
	 */
	isIn(state) {
		return this._currentState === state;
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {boolean}
	 */
	isNotIn(state) {
		return !this.isIn(state);
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {boolean}
	 */
	canTransitTo(state) {
		return !this._currentState || (this._transitionsTable[this._currentState] || []).includes(state);
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {boolean}
	 */
	cannotTransitTo(state) {
		return !this.canTransitTo(state);
	}

	/**
	 * @return {boolean}
	 */
	hasPendingTransition() {
		return !!this._pendingTransition;
	}

	/**
	 * @return {?{from: STATE_TYPE, to: STATE_TYPE}}
	 */
	getPendingTransition() {
		return this._pendingTransition;
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {boolean}
	 */
	isTransitingFrom(state) {
		return !!this._pendingTransition && this._pendingTransition.from === state;
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {boolean}
	 */
	isTransitingTo(state) {
		return !!this._pendingTransition && this._pendingTransition.to === state;
	}

	/**
	 */
	abortPendingTransition() {
		if (!this._pendingTransition) {
			return;
		}
		this._currentState = this._pendingTransition.from;
		this._pendingTransition = null;
	}

	/**
	 * @return {STATE_TYPE}
	 */
	getCurrentState() {
		return this._currentState;
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {Array<STATE_TYPE>}
	 */
	getStatesFollowingFrom(state) {
		return this._transitionsTable[state] || [];
	}

	/**
	 * @param {STATE_TYPE} state
	 * @return {Array<STATE_TYPE>}
	 */
	getStatesLeadingTo(state) {
		return Object.keys(this._transitionsTable)
			.filter((from) => this._transitionsTable[from].includes(state));
	}
}


/**
 * @template STATE_TYPE
 */
export class InvalidTransitionError extends Error {
	/**
	 * @param {STATE_TYPE} from
	 * @param {STATE_TYPE} to
	 */
	constructor(from, to) {
		super(`Invalid transition from "${from}" to "${to}"`);

		/**
		 * @type {STATE_TYPE}
		 */
		this.from = from;

		/**
		 * @type {STATE_TYPE}
		 */
		this.to = to;
	}
}


/**
 * @template STATE_TYPE
 */
export class PendingTransitionError extends Error {
	/**
	 * @param {STATE_TYPE} pendingFrom
	 * @param {STATE_TYPE} pendingTo
	 * @param {STATE_TYPE} attempted
	 */
	constructor(pendingFrom, pendingTo, attempted) {
		super(
			`There is a pending transition from "${pendingFrom}" to "${pendingTo}", cannot transition to "${attempted}"`
		);

		/**
		 * @type {STATE_TYPE}
		 */
		this.from = pendingFrom;

		/**
		 * @type {STATE_TYPE}
		 */
		this.to = pendingTo;
	}
}
