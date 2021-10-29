/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @param {string} url
 * @param {number=} timeout
 * @return {Promise<Image>}
 */
const imagePreload = (url, timeout) => {
	const image = new Image();
	image.src = url;

	return new Promise((resolve, reject) => {
		if (image.complete) {
			resolve(image);
		} else {
			const onLoad = () => {
				off();
				resolve(image);
			};
			const onError = () => {
				off();
				reject(image);
			};
			const timeoutId = typeof timeout === 'number' ? setTimeout(onError, timeout) : NaN;
			const off = () => {
				image.removeEventListener('load', onLoad);
				image.removeEventListener('error', onError);
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			};

			image.addEventListener('load', onLoad);
			image.addEventListener('error', onError);
		}
	});
};

export default imagePreload;
