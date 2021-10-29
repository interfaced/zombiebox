/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @param {function()|function(...*)} targetFunction
 * @param {number} waitTime
 * @return {function()|function(...*)}
 */
export const debounce = (targetFunction, waitTime) => {
	let timer = null;

	const debouncedFunction = function(...args) {
		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			timer = null;
			targetFunction(...args);
		}, waitTime);
	};

	debouncedFunction.cancel = () => {
		clearTimeout(timer);
		timer = null;
	};

	return debouncedFunction;
};


/**
 * @param {function()|function(...*)} targetFunction
 * @param {number} waitTime
 * @return {function()|function(...*)}
 */
export const throttle = (targetFunction, waitTime) => {
	let lastEventTimestamp = null;

	return function(...args) {
		const now = Date.now();

		if (!lastEventTimestamp || now - lastEventTimestamp >= waitTime) {
			lastEventTimestamp = now;
			targetFunction(...args);
		}
	};
};
