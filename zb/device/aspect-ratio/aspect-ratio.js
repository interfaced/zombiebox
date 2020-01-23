/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Proportion, Common} from './proportion';


/**
 */
export class AspectRatio {
	/**
	 * @param {Proportion=} proportion
	 * @param {Transferring=} transferring
	 */
	constructor(proportion = Common.KEEP, transferring = Transferring.KEEP) {
		/**
		 * @type {Proportion}
		 * @protected
		 */
		this._proportion = proportion;

		/**
		 * @type {Transferring}
		 * @protected
		 */
		this._transferring = transferring;
	}

	/**
	 * @param {Proportion} proportion
	 */
	setProportion(proportion) {
		this._proportion = proportion;
	}

	/**
	 * @return {Proportion}
	 */
	getProportion() {
		return this._proportion;
	}

	/**
	 * @param {Transferring} transferring
	 */
	setTransferring(transferring) {
		this._transferring = transferring;
	}

	/**
	 * @return {Transferring}
	 */
	getTransferring() {
		return this._transferring;
	}

	/**
	 * @param {Proportion=} proportion
	 * @return {boolean}
	 */
	checkProportionChangesFrom(proportion) {
		const currentProportion = this.getProportion();

		const keep = (currentProportion === Common.KEEP);
		const diff = (currentProportion !== proportion);
		const unknown = (typeof proportion === 'undefined');

		return (unknown || (!keep && diff));
	}

	/**
	 * @param {Transferring=} transferring
	 * @return {boolean}
	 */
	checkTransferringChangesFrom(transferring) {
		const currentTransferring = this.getTransferring();

		const keep = (currentTransferring === Transferring.KEEP);
		const diff = (currentTransferring !== transferring);
		const unknown = (typeof transferring === 'undefined');

		return (unknown || (!keep && diff));
	}

	/**
	 * Check if this aspect ratio mode equals to another
	 * @param {AspectRatio} that
	 * @return {boolean}
	 */
	eq(that) {
		return (this.getProportion() === that.getProportion() &&
			this.getTransferring() === that.getTransferring()
		);
	}

	/**
	 * Show human-readable value
	 * @return {string}
	 */
	explain() {
		const proportion = AspectRatio.explainProportion(this.getProportion());
		const transferring = AspectRatio.explainTransferring(this.getTransferring());

		return (`${proportion}@${transferring}`);
	}

	/**
	 * @param {Proportion} proportion
	 * @return {string}
	 */
	static explainProportion(proportion) {
		return proportion.name;
	}

	/**
	 * @param {Transferring} transferring
	 * @return {string}
	 */
	static explainTransferring(transferring) {
		return transferring;
	}
}


/**
 * Video Aspect Ratio modes
 * @enum {string}
 */
export const Transferring = {
	KEEP: 'KEEP',
	AUTO: 'AUTO',
	LETTERBOX: 'LETTERBOX',
	CROP: 'CROP',
	STRETCH: 'STRETCH'
};
