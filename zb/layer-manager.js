/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import * as console from './console/console';
import EventPublisher from './events/event-publisher';
import IStateful from './history/interfaces/i-stateful';
import Layer from './layers/layer';


/**
 * Layers objects factory
 * @implements {IStateful}
 */
export default class LayerManager extends EventPublisher {
	/**
	 * @param {HTMLDivElement} layerContainer
	 */
	constructor(layerContainer) {
		super();

		/**
		 * Named layers
		 * @type {Object<string, Layer>}
		 * @protected
		 */
		this._layers = {};

		/**
		 * Application level layer container
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._layerContainer = layerContainer;

		/**
		 * @type {Layer}
		 * @protected
		 */
		this._currentLayer = null;

		/**
		 * Fired with: Layer
		 * @const {string}
		 */
		this.EVENT_BEFORE_SHOW = 'before-show';

		/**
		 * Fired with: Layer
		 * @const {string}
		 */
		this.EVENT_AFTER_SHOW = 'after-show';

		/**
		 * Fired with: Layer
		 * @const {string}
		 */
		this.EVENT_BEFORE_HIDE = 'before-hide';

		/**
		 * Fired with: Layer
		 * @const {string}
		 */
		this.EVENT_AFTER_HIDE = 'after-hide';

		/**
		 * Fired with: TransitionData
		 * @const {string}
		 */
		this.EVENT_TRANSITION_START = 'transition-start';

		/**
		 * Fired with: TransitionData
		 * @const {string}
		 */
		this.EVENT_TRANSITION_SUCCESS = 'transition-success';

		/**
		 * Fired with: TransitionData and Error
		 * @const {string}
		 */
		this.EVENT_TRANSITION_FAIL = 'transition-fail';
	}

	/**
	 * @override
	 */
	takeSnapshot() {
		return (function(activeLayer) {
			return this.open(activeLayer);
		}).bind(this, this._currentLayer);
	}

	/**
	 * @param {Layer} layerInstance
	 * @param {string} name
	 */
	register(layerInstance, name) {
		console.debug('LayerManager::register: registering layer "' + name + '"');

		const layerRoot = layerInstance.getRoot();

		this._layers[name] = layerInstance;
		this._layerContainer.appendChild(layerRoot);

		layerRoot.style.display = 'none';
	}

	/**
	 * @param {string} name
	 * @return {Layer}
	 */
	getLayer(name) {
		return this._layers[name];
	}

	/**
	 * @param {Layer} layer
	 * @return {?string}
	 */
	getLayerName(layer) {
		for (const layerName in this._layers) {
			if (this._layers.hasOwnProperty(layerName)) {
				if (this._layers[layerName] === layer) {
					return layerName;
				}
			}
		}

		return null;
	}

	/**
	 * @return {Layer}
	 */
	getCurrentLayer() {
		return this._currentLayer;
	}

	/**
	 * @param {Layer} layerTo
	 * @return {Promise}
	 */
	open(layerTo) {
		console.debug('zb.Application::show: showing layer "' + layerTo + '"');

		const layerFrom = this.getCurrentLayer();

		/** @type {TransitionData} */
		const eventData = {
			layer: layerTo,
			fromLayer: layerFrom
		};

		const promise = Promise.resolve()
			.then(() => {
				this._fireEvent(this.EVENT_TRANSITION_START, eventData);

				return this._hide(layerFrom);
			})
			.then(() => this._show(layerTo))
			.then(() => {
				console.debug('LayerManager::_transit: success');
				this._currentLayer = layerTo;
				this._fireEvent(this.EVENT_TRANSITION_SUCCESS, eventData);
			})
			.then(null, (error) => {
				if (!(error instanceof Error)) {
					error = new Error(error); // eslint-disable-line interfaced/no-param-reassign
				}
				this._handleTransitionError(error, eventData);

				throw error;
			});

		if (layerFrom) {
			layerFrom.wait(promise);
		}

		return promise;
	}

	/**
	 * Hides current layer
	 */
	hide() {
		this._hide(this._currentLayer);
		this._currentLayer = null;
	}

	/**
	 * @param {Layer} layer
	 * @return {Promise}
	 * @protected
	 */
	_hide(layer) {
		console.debug('LayerManager::_transit: from "' + layer);

		if (!layer) {
			return Promise.resolve();
		}

		this._fireEvent(this.EVENT_BEFORE_HIDE, layer);

		layer.blur();
		layer.beforeDOMHide();

		layer.getRoot().style.display = 'none';
		layer.afterDOMHide();

		this._fireEvent(this.EVENT_AFTER_HIDE, layer);

		return Promise.resolve();
	}

	/**
	 * @param {Layer} layer
	 * @return {Promise}
	 * @protected
	 */
	_show(layer) {
		console.debug('LayerManager::_transit: to "' + layer + '"');

		if (!layer) {
			return Promise.resolve();
		}

		return Promise.resolve()
			.then(() => {
				this._fireEvent(this.EVENT_BEFORE_SHOW, layer);

				return layer.beforeDOMShow();
			})
			.then(() => {
				layer.getRoot().style.display = '';
				layer.afterDOMShow();
				layer.focus();

				this._fireEvent(this.EVENT_AFTER_SHOW, layer);
			});
	}

	/**
	 * @param {Error} error
	 * @param {TransitionData} eventData
	 * @return {Promise}
	 * @protected
	 */
	_handleTransitionError(error, eventData) {
		const errorMessageChunks = ['LayerManager::_transit: failed'];
		const layerFrom = eventData.fromLayer;
		const layerTo = eventData.layer;

		if (layerFrom) {
			errorMessageChunks.push('from "' + (this.getLayerName(layerFrom) || 'unknown') + '"');
		}

		errorMessageChunks.push('to "' + (this.getLayerName(layerTo) || 'unknown') + '"');
		errorMessageChunks.push('(' + error.message + ',');
		errorMessageChunks.push((error.stack || error['stacktrace'] || '') + ')');

		console.error(errorMessageChunks.join(' '));

		this._fireEvent(this.EVENT_TRANSITION_FAIL, eventData, error);

		return Promise.reject(error);
	}
}


/**
 * @typedef {{
 *     layer: Layer,
 *     fromLayer: Layer
 * }}
 */
export let TransitionData;
