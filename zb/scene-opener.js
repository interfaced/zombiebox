/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import LayerManager from './layer-manager';
import IHistoryManager from './history/interfaces/i-history-manager';
import IStateful from './history/interfaces/i-stateful';
import Layer from './layers/layer';


/**
 * @implements {IStateful}
 */
export default class SceneOpener {
	/**
	 */
	constructor() {
		/**
		 * @type {LayerManager}
		 */
		this.layerManager;

		/**
		 * @type {IHistoryManager}
		 */
		this.historyManager;
	}

	/**
	 * @override
	 */
	takeSnapshot() {
		const currentLayer = this.layerManager.getCurrentLayer();
		const layerSnapshot = currentLayer ? currentLayer.takeSnapshot() : () => {/* Noop */};
		const switcherSnapshot = this.layerManager.takeSnapshot();
		const hideLayer = this.layerManager.hide.bind(this.layerManager);

		return () => Promise.resolve()
			.then(hideLayer)
			.then(layerSnapshot)
			.then(switcherSnapshot);
	}

	/**
	 * @param {Layer} layer
	 * @param {Function=} snapshot
	 * @return {Promise}
	 */
	open(layer, snapshot) {
		this.historyManager.addRecord([this]);

		return Promise.resolve()
			.then(() => this.layerManager.hide())
			.then(() => {
				layer.activateWidget(null); // Default widget

				return snapshot ? snapshot() : null;
			})
			.then(() => this.layerManager.open(layer));
	}
}
