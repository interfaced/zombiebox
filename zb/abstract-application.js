/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {NPM_PACKAGE_NAME} from 'generated/define';
import {div, node, hide, show} from './html';
import {warn, setLogger, getLogger} from './console/console';
import BackButtonListener from './back-button-listener';
import IKeyHandler from './interfaces/i-key-handler';
import InputDispatcher from './input-dispatcher';
import LayerManager from './layer-manager';
import SceneOpener from './scene-opener';
import Console from './console/loggers/console';
import IDevice from './device/interfaces/i-device';
import {ResolutionInfo, ResolutionInfoItem} from './device/resolutions';
import Key from './device/input/key';
import EventPublisher from './events/event-publisher';
import HistoryManager from './history/history-manager';
import IHistoryManager from './history/interfaces/i-history-manager';
import Layer from './layers/layer';
import Scene from './layers/scene';


/**
 * @abstract
 * @implements {IKeyHandler}
 */
export default class AbstractApplication extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {IDevice}
		 */
		this.device = null;

		/**
		 * Application container where layers should be added
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._layerContainer = null;

		/**
		 * Additional container to store device-dependent elements and objects
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._pluginContainer = null;

		/**
		 * Additional container to store system level child layers
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._systemContainer = null;

		/**
		 * Application body
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._body = null;

		/**
		 * @type {LayerManager}
		 * @protected
		 */
		this._layerManager = null;

		/**
		 * @type {SceneOpener}
		 * @protected
		 */
		this._sceneOpener;

		/**
		 * @type {IHistoryManager}
		 * @protected
		 */
		this._historyManager = null;

		/**
		 *
		 * @type {InputDispatcher}
		 * @protected
		 */
		this._inputDispatcher = null;

		/**
		 * System-level layer to show exception messages and other similar stuff
		 * @type {Layer}
		 * @protected
		 */
		this._systemLayer = null;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isSystemLayerShown = false;

		/**
		 * DOM ready and created all application nodes.
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_DOM_READY = 'dom-ready';

		/**
		 * Device ready.
		 * Fired with: IDevice
		 * @const {string}
		 */
		this.EVENT_DEVICE_READY = 'device-ready';

		/**
		 * Application ready to start.
		 * Fired with: {Object}
		 * @const {string}
		 */
		this.EVENT_READY = 'ready';

		/**
		 * Application starting.
		 * Fired with: {Object} launch params
		 * @const {string}
		 */
		this.EVENT_START = 'start';

		if (window.hasOwnProperty('console') && !getLogger()) {
			setLogger(new Console());
		}

		this.on(this.EVENT_DOM_READY, () => this._loadDevice());
		this.on(this.EVENT_DEVICE_READY, (eventName, device) => this._onDeviceReady(eventName, device));
		this.on(this.EVENT_READY, () => this.onReady());
		this.on(this.EVENT_START, (eventName, params) => this.onStart(params));

		window.addEventListener('load', this._createAppDOM.bind(this), false);
	}

	/**
	 * @override
	 */
	processKey(zbKey, event) {
		let result = false;

		const currentLayer = this.getCurrentLayer();
		if (currentLayer) {
			// Current layer processes key
			result = currentLayer.processKey(zbKey, event);

			if (!result) {
				result = this._processKey(zbKey, event);
			}
		} else if (!result) {
			result = this._processKey(zbKey, event);
		}

		return result;
	}

	/**
	 * Clear navigation history and open home scene
	 * @abstract
	 * @return {?Promise}
	 */
	home() {}

	/**
	 * Clear navigation history.
	 */
	clearHistory() {
		this._historyManager.clear();
	}

	/**
	 * Exit from application.
	 */
	exit() {
		const r = this.onExit();
		if (r && r instanceof Promise) {
			const exit = this.device.exit.bind(this.device);
			r.then(exit, exit);
		} else {
			this.device.exit();
		}
	}

	/**
	 * @return {Promise}
	 */
	back() {
		if (!this._historyManager.canBack()) {
			this._backOnEmptyHistory();

			return Promise.resolve(null);
		}

		const blockId = this.device.input.block();
		const unblock = this.device.input.unblock.bind(this.device.input, blockId);

		return this._historyManager.back()
			.finally(unblock);
	}

	/**
	 * @return {Promise}
	 */
	forward() {
		if (!this._historyManager.canForward()) {
			return Promise.resolve(null);
		}

		const blockId = this.device.input.block();
		const unblock = this.device.input.unblock.bind(this.device.input, blockId);

		return this._historyManager.forward()
			.finally(unblock);
	}

	/**
	 * @param {Scene} scene
	 * @param {string} name
	 */
	addScene(scene, name) {
		this._layerManager.register(scene, name);
	}

	/**
	 * @return {?Layer}
	 */
	getCurrentLayer() {
		if (this._isSystemLayerShown) {
			return this._systemLayer;
		}

		return this._layerManager.getCurrentLayer();
	}

	/**
	 * @return {boolean}
	 */
	isSystemLayerShown() {
		return this._isSystemLayerShown;
	}

	/**
	 * Create new instance of layerClassName and append it to the system container
	 * @param {Function} layerClassName
	 * @param {*=} params
	 * @return {Layer}
	 */
	showChildLayer(layerClassName, params) {
		show(this._systemContainer);

		return this._systemLayer.showChildLayer(layerClassName, params);
	}

	/**
	 * Show an existing instance of layer and append it to the system container
	 * @param {Layer} layer
	 */
	showChildLayerInstance(layer) {
		show(this._systemContainer);
		this._systemLayer.showChildLayerInstance(layer);
	}

	/**
	 * @param {Layer} layer
	 */
	closeChildLayer(layer) {
		this._systemLayer.closeChildLayer(layer);
	}

	/**
	 * Set transparent background for layers container and show device video.
	 */
	showVideo() {
		this._layerContainer.classList.add('_transparent');
	}

	/**
	 * Hide device video and restore layer container background.
	 */
	hideVideo() {
		this._layerContainer.classList.remove('_transparent');
	}

	/**
	 * Toggle video state.
	 */
	toggleVideo() {
		if (this.isVideoVisible()) {
			this.hideVideo();
		} else {
			this.showVideo();
		}
	}

	/**
	 * @return {boolean}
	 */
	isVideoVisible() {
		return this._layerContainer.classList.contains('_transparent');
	}

	/**
	 * Return plugin container
	 * @return {?HTMLElement}
	 */
	getPluginContainer() {
		return this._pluginContainer;
	}

	/**
	 * @return {InputDispatcher}
	 */
	getInputDispatcher() {
		return this._inputDispatcher;
	}

	/**
	 * @return {SceneOpener}
	 */
	getSceneOpener() {
		return this._sceneOpener;
	}

	/**
	 * @return {HTMLDivElement}
	 */
	getBody() {
		return this._body;
	}

	/**
	 * @return {LayerManager}
	 */
	getLayerManager() {
		return this._layerManager;
	}

	/**
	 * @return {HTMLDivElement}
	 */
	getLayerContainer() {
		return this._layerContainer;
	}

	/**
	 * @return {Layer}
	 */
	getSystemLayer() {
		return this._systemLayer;
	}

	/**
	 * @return {Promise|undefined}
	 */
	onExit() {
		return undefined;
	}

	/**
	 * Called when document and device are ready
	 * @protected
	 */
	onReady() {/* For override */}

	/**
	 * Method you use to launch home scene of an application
	 * @param {Object} launchParams
	 * @protected
	 */
	onStart(launchParams) { // eslint-disable-line no-unused-vars
		/* For override */
	}

	/**
	 * @param {string} eventName
	 * @param {IDevice} device
	 * @protected
	 */
	_onDeviceReady(eventName, device) {
		new BackButtonListener(this.processKey.bind(this, Key.BACK));

		this.device = device;
		this.device.storage.setKeyPrefix(NPM_PACKAGE_NAME);

		this._body.classList.add(this.device.info.type());
		this._appendScreenSizeClass();

		this._createInputDispatcher();
		this._createSystemLayer();
		this._setupLayerManager();

		this._fireEvent(this.EVENT_READY);
		this._fireEvent(this.EVENT_START, device.getLaunchParams());
	}

	/**
	 * @protected
	 */
	_onSystemLayerShown() {
		show(this._systemContainer);

		if (!this._isSystemLayerShown) {
			const currentLayer = this._layerManager.getCurrentLayer();
			if (currentLayer) {
				currentLayer.blur();
			}
		}

		this._isSystemLayerShown = true;
	}

	/**
	 * @protected
	 */
	_onSystemLayerHidden() {
		if (!this._systemLayer.hasChildLayers()) {
			const currentLayer = this._layerManager.getCurrentLayer();
			if (currentLayer) {
				currentLayer.focus();
			}

			hide(this._systemContainer);

			this._isSystemLayerShown = false;
		}
	}

	/**
	 * Load current device.
	 * @protected
	 */
	_loadDevice() {
		const device = this._createDevice();

		device.on(device.EVENT_READY, this._fireEvent.bind(this, this.EVENT_DEVICE_READY, device));
		device.init();
	}

	/**
	 * @abstract
	 * @return {IDevice}
	 * @protected
	 */
	_createDevice() {}

	/**
	 * @param {Key} zbKey
	 * @param {(KeyboardEvent|MouseEvent)=} event
	 * @return {boolean} True if Key handled, false if not
	 * @protected
	 */
	_processKey(zbKey, event) {
		let result = false;

		switch (zbKey) {
			// Back to previous scene/layer
			case Key.BACK:
				this.back();
				if (event) {
					event.preventDefault();
				}
				result = true;
				break;
		}

		// Warning for unhandled key
		if (!result) {
			warn(
				'Unhandled zbKey ' + zbKey +
				' (' + (event ? 'keyCode ' + event.keyCode : 'no keyboard event') + ')'
			);
		}

		return result;
	}

	/**
	 * Detect max suitable screen size and set related CSS class name to body tag
	 * @protected
	 */
	_appendScreenSizeClass() {
		const resolution = ResolutionInfo[this.device.info.getOSDResolution()];
		const resolutionClassName = resolution ? ('zb-' + resolution.name) : 'zb-unknown-resolution';

		this._appendViewportSize(resolution);
		this._body.classList.add(resolutionClassName);
	}

	/**
	 * Add viewport and set its size
	 * @param {ResolutionInfoItem} resolution
	 * @protected
	 */
	_appendViewportSize(resolution) {
		const meta = node('meta');

		meta.name = 'viewport';
		meta.content = 'width=' + resolution.width;

		document.head.appendChild(meta);
	}

	/**
	 * Called on BACK button with empty history
	 * @protected
	 */
	_backOnEmptyHistory() {
		this.exit();
	}

	/**
	 * Create DOM containers for app start.
	 * @protected
	 */
	_createAppDOM() {
		// Create app DOM nodes
		this._body = div('zb-body');
		document.body.appendChild(this._body);

		this._layerContainer = div('zb-layer-container zb-fullscreen');
		this._systemContainer = div('zb-system-container zb-fullscreen');
		this._pluginContainer = div('zb-plugin-container');

		this._body.appendChild(this._layerContainer);
		this._body.appendChild(this._systemContainer);
		this._body.appendChild(this._pluginContainer);

		hide(this._systemContainer);

		this._fireEvent(this.EVENT_DOM_READY);
	}

	/**
	 * @protected
	 */
	_createInputDispatcher() {
		this._inputDispatcher = new InputDispatcher(this);
		this._inputDispatcher.setInput(this.device.input);
		this._inputDispatcher.init();
	}

	/**
	 * @protected
	 */
	_createSystemLayer() {
		this._systemLayer = new Layer();
		this._systemLayer.on(this._systemLayer.EVENT_CHILD_LAYER_SHOWN, this._onSystemLayerShown.bind(this));
		this._systemLayer.on(this._systemLayer.EVENT_CHILD_LAYER_HIDDEN, this._onSystemLayerHidden.bind(this));

		this._systemContainer.appendChild(this._systemLayer.getRoot());
	}

	/**
	 * @protected
	 */
	_setupLayerManager() {
		this._layerManager = new LayerManager(this._layerContainer);
		this._historyManager = new HistoryManager();

		this._sceneOpener = new SceneOpener();
		this._sceneOpener.layerManager = this._layerManager;
		this._sceneOpener.historyManager = this._historyManager;
	}
}
