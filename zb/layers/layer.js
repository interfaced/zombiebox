/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {div, hide, show} from '../html';
import {debug} from '../console/console';
import Block from '../block';
import IFocusable from '../interfaces/i-focusable';
import IStateful from '../history/interfaces/i-stateful';
import Container from '../widgets/container';


/**
 * Layer is a base abstraction for Application to manipulate its visible/hidden layers
 * It could be a scene, popup or whatever
 * @implements {IStateful}
 * @implements {IFocusable}
 */
export default class Layer extends Container {
	/**
	 */
	constructor() {
		super();

		/**
		 * Layer root element
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._root = null;

		/**
		 * Layer's children layers container element
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._childLayersContainer = null;

		/**
		 * Layer content container element
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._container = null;

		/**
		 * Used for block pointer events
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._pointerBlock = null;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isVisible = false;

		/**
		 * @type {Array<Layer>}
		 * @protected
		 */
		this._childLayers = [];

		/**
		 * @type {Block}
		 * @protected
		 */
		this._block = new Block();

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_NEED_TO_BE_HIDDEN = 'need-to-be-hidden';

		/**
		 * Fired with: Layer
		 * @const {string}
		 */
		this.EVENT_CHILD_LAYER_SHOWN = 'child-layer-shown';

		/**
		 * Fired with: Layer
		 * @const {string}
		 */
		this.EVENT_CHILD_LAYER_HIDDEN = 'child-layer-hidden';

		this._block.on(this._block.EVENT_BLOCK, this._blockPointer.bind(this));
		this._block.on(this._block.EVENT_UNBLOCK, this._unblockPointer.bind(this));

		this._createDOM();
	}

	/**
	 * @override
	 */
	focus() {
		debug('Layer.focus: ' + this.getCSSClassName(), this._root.style.display || 'block');
		super.focus();
	}

	/**
	 * @override
	 */
	blur() {
		debug('Layer.blur: ' + this.getCSSClassName(), this._root.style.display || 'block');
		super.blur();
	}

	/**
	 * @override
	 */
	processKey(zbKey, event) {
		if (this._block.isBlocked()) {
			return false;
		}

		const topLayer = this.getTopChildLayer();
		if (topLayer) {
			return topLayer.processKey(zbKey, event);
		}

		return super.processKey(zbKey, event);
	}

	/**
	 * @override
	 */
	toString() {
		return this.getCSSClassName();
	}

	/**
	 * @param {Promise} promise
	 * @return {Promise}
	 */
	wait(promise) {
		return this._block.block(promise);
	}

	/**
	 * @return {boolean}
	 */
	isBlocked() {
		return this._block.isBlocked();
	}

	/**
	 * @return {string}
	 */
	getCSSClassName() {
		return this._container ? this._container.className : 'none';
	}

	/**
	 * @return {HTMLElement}
	 */
	getRoot() {
		return this._root;
	}

	/**
	 * @return {HTMLElement}
	 */
	getContainer() {
		return this._container;
	}

	/**
	 * Called before container of the layer was shown
	 */
	beforeDOMShow() {
		debug('Layer.beforeDOMShow: ' + this.getCSSClassName());

		if (!this.getActiveWidget() && this._defaultWidget) {
			this.activateWidget(this._defaultWidget);
		}

		this._widgets.forEach((widget) => {
			if (widget.isVisible()) {
				widget.beforeDOMShow();
			}
		});
	}

	/**
	 * Called before layer was hidden
	 */
	beforeDOMHide() {
		debug('Layer.beforeDOMHide: ' + this.getCSSClassName());

		this._widgets.forEach((widget) => {
			if (widget.isVisible()) {
				widget.beforeDOMHide();
			}
		});
	}

	/**
	 */
	afterDOMShow() {
		debug('Layer.afterDOMShow: ' + this.getCSSClassName());

		this._isVisible = true;

		this._widgets.forEach((widget) => {
			widget.setParentDOMVisible(true);
			if (widget.isVisible()) {
				widget.afterDOMShow();
			}
		});
	}

	/**
	 */
	afterDOMHide() {
		debug('Layer.afterDOMHide: ' + this.getCSSClassName());

		this._isVisible = false;

		this._widgets.forEach((widget) => {
			widget.setParentDOMVisible(false);
			if (widget.isVisible()) {
				widget.afterDOMHide();
			}
		});
	}

	/**
	 * @return {boolean}
	 */
	isVisible() {
		return this._isVisible;
	}

	/**
	 * Create new instance of layerClassName and append it to the container
	 * @param {Function} LayerClass
	 * @param {*=} params
	 * @return {Layer}
	 */
	showChildLayer(LayerClass, params) {
		const layer = /** @type {Layer} */ (new LayerClass(params));

		this.showChildLayerInstance(layer);

		return layer;
	}

	/**
	 * Show an existing instance of layer and append it to the container
	 * @param {Layer} layer
	 */
	showChildLayerInstance(layer) {
		const layerContainer = layer.getRoot();

		const closeLayer = this.closeChildLayer.bind(this, layer);
		const waitClose = (eventName, childLayer) => {
			if (childLayer === layer) {
				layer.off(layer.EVENT_NEED_TO_BE_HIDDEN, closeLayer);
				this.off(this.EVENT_CHILD_LAYER_HIDDEN, waitClose);
			}
		};

		layer.on(layer.EVENT_NEED_TO_BE_HIDDEN, closeLayer);
		this.on(this.EVENT_CHILD_LAYER_HIDDEN, waitClose);

		show(this._childLayersContainer);
		layer.beforeDOMShow();

		this._childLayersContainer.appendChild(layerContainer);
		this._childLayers.push(layer);

		layer.afterDOMShow();
		layer.focus();

		this._fireEvent(this.EVENT_CHILD_LAYER_SHOWN, layer);

		if (this.isFocused()) {
			this.blur();
		}
	}

	/**
	 * @param {Layer} layer
	 */
	closeChildLayer(layer) {
		const layerIndex = this._childLayers.indexOf(layer);
		const layerContainer = layer.getRoot();

		this._childLayers.splice(layerIndex, 1);

		layer.blur();
		layer.beforeDOMHide();

		this._childLayersContainer.removeChild(layerContainer);
		layer.afterDOMHide();

		if (!this.hasChildLayers()) {
			hide(this._childLayersContainer);
		}

		this._fireEvent(this.EVENT_CHILD_LAYER_HIDDEN, layer);

		if (!this.hasChildLayers()) {
			this.focus();
		}
	}

	/**
	 * @return {number}
	 */
	getChildLayersCount() {
		return this._childLayers.length;
	}

	/**
	 * @return {boolean}
	 */
	hasChildLayers() {
		return this.getChildLayersCount() !== 0;
	}

	/**
	 * @return {Array<Layer>}
	 */
	getChildLayers() {
		return this._childLayers;
	}

	/**
	 * @return {?Layer}
	 */
	getTopChildLayer() {
		return this._childLayers[this._childLayers.length - 1] || null;
	}

	/**
	 * Add CSS class name to layer container
	 * @param {string} cssClass
	 * @protected
	 */
	_addContainerClass(cssClass) {
		this._container.classList.add(cssClass);
	}

	/**
	 * Remove CSS class name to layer container
	 * @param {string} cssClass
	 * @protected
	 */
	_removeContainerClass(cssClass) {
		this._container.classList.remove(cssClass);
	}

	/**
	 * @private
	 */
	_blockPointer() {
		show(this._pointerBlock);
	}

	/**
	 * @private
	 */
	_unblockPointer() {
		hide(this._pointerBlock);
	}

	/**
	 * @private
	 */
	_createDOM() {
		this._root = div('zb-layer zb-fullscreen');
		this._container = div('zb-layer__container zb-fullscreen');
		this._childLayersContainer = div('zb-layer__children zb-fullscreen');
		this._pointerBlock = div('zb-layer__pointer-block zb-fullscreen');

		this._root.appendChild(this._container);
		this._root.appendChild(this._childLayersContainer);
		this._root.appendChild(this._pointerBlock);

		hide(this._childLayersContainer);
		hide(this._pointerBlock);
	}
}
