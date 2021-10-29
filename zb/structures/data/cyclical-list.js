/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import List from './list';


/**
 * @template ItemType
 */
export default class CyclicalDataList extends List {
	/**
	 * @override
	 */
	itemAt(index) {
		const remainder = index % this.size();
		let fixedIndex = index;
		if (remainder < 0) {
			fixedIndex = this.size() + remainder;
		}
		return super.itemAt(fixedIndex);
	}

	/**
	 * @override
	 */
	selectNextItem(step) {
		const fixedStep = isNaN(step) ? 1 : (step < 1 ? 1 : step);
		let index = this.currentIndex() + fixedStep;
		if (index > this.size() - 1) {
			index = index - this.size();
		}
		return this.selectAt(index);
	}

	/**
	 * @override
	 */
	selectPrevItem(step) {
		const fixedStep = isNaN(step) ? 1 : (step < 1 ? 1 : step);
		let index = this.currentIndex() - fixedStep;
		if (index < 0) {
			index = this.size() + index;
		}
		return this.selectAt(index);
	}
}
