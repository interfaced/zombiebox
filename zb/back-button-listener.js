/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * According to spec, browsers may impose limitations to calls for pushState:
 * https://html.spec.whatwg.org/multipage/history.html#history-notes
 * Additionally it's been observed that rapidly triggering history back causes state both in popstate and history.state
 * to become null. This is deduced to be a limitation on browser's part as well.
 * This is impossible to work around on ZombieBox level.
 * Therefore platforms relying on History API and BackButtonListener should be ready for these limitations.
 * Common case that causes problems are rapid keypress events emitted while back button is being held.
 * webOS does not trigger those for Back key, likely to avoid this problem.
 * Android platform was implemented to ignore key repeats as well.
 */
export default class BackButtonListener {
	/**
	 * @param {function()} callback
	 */
	constructor(callback) {
		/**
		 * @type {function()}
		 * @protected
		 */
		this._callback = callback;

		// To avoid receiving null in popstate handler we need additional record
		// When user clicks Back for the first time one of these two will be
		// discarded and event callback will receive the second one
		this._pushDummyRecord();
		this._pushDummyRecord();

		this._bindHistoryListener();
	}

	/**
	 * @protected
	 */
	_pushDummyRecord() {
		if (window.history && window.history.pushState) {
			window.history.pushState({}, 'ZombieBox history');
		}
	}

	/**
	 * @protected
	 */
	_bindHistoryListener() {
		window.addEventListener('popstate', this._onHistoryPopState.bind(this));
	}

	/**
	 * @param {Event} event
	 * @protected
	 */
	_onHistoryPopState(event) {
		const typedEvent = /** @type {PopStateEvent} */ (event);
		// WebKit approximately from 534.7 to 537.36 always fire additional popstate event on page load
		// see http://www.splefty.com/js/popstate.html
		// event.state can be null either on affected webkit or when we navigated through all the page states
		// all the way to the initial, which should never happen since we keep adding additional records and
		// also have a spare record inserted in the constructor.
		// Therefore we can discard such events.
		if (typedEvent.state === null) {
			this._pushDummyRecord();

			return;
		}

		this._callback();
		this._pushDummyRecord();
	}
}
