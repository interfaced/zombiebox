/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IInfo from './interfaces/i-info';
import {Resolution, ResolutionInfo, ResolutionInfoItem} from './resolutions';
import UnsupportedFeature from './errors/unsupported-feature';


/**
 * @abstract
 * @implements {IInfo}
 */
export default class AbstractInfo {
	/**
	 * @abstract
	 * @override
	 */
	type() {}

	/**
	 * @abstract
	 * @override
	 */
	version() {}

	/**
	 * @abstract
	 * @override
	 */
	manufacturer() {}

	/**
	 * @abstract
	 * @override
	 */
	model() {}

	/**
	 * @abstract
	 * @override
	 */
	serialNumber() {}

	/**
	 * @abstract
	 * @override
	 */
	softwareVersion() {}

	/**
	 * @abstract
	 * @override
	 */
	hardwareVersion() {}

	/**
	 * @override
	 */
	osdResolutionType() {
		return this.getOSDResolution();
	}

	/**
	 * @abstract
	 * @override
	 */
	getPanelResolution() {}

	/**
	 * @abstract
	 * @override
	 */
	getOSDResolution() {}

	/**
	 * @override
	 */
	locale() {
		const locale = this._getLocale();

		return this._validateLocale(locale) ? locale : null;
	}

	/**
	 * @abstract
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 * @protected
	 */
	_getLocale() {}

	/**
	 * @deprecated Use zb/device/resolutions findLargest instead
	 * Get resolutions smaller or equal screen size
	 * @param {number} width
	 * @param {number} height
	 * @return {Array<Resolution>}
	 * @protected
	 */
	_getResolutionsByScreenSize(width, height) {
		/** @type {Array<{
		 *     info: ResolutionInfoItem,
		 *     res: Resolution
		 * }>}
		 */
		let resolutions = [];

		Object.keys(Resolution)
			.forEach((item) => {
				const res = Resolution[item];
				const info = ResolutionInfo[res];
				if (info.width <= width && info.height <= height) {
					resolutions.push({
						info: info,
						res: res
					});
				}
			});

		// Sort with largest first
		resolutions = resolutions.sort((a, b) => {
			if (a.info.width === b.info.width) {
				return b.info.height - a.info.height;
			}

			return b.info.width - a.info.width;
		});

		return resolutions.map((record) => record.res);
	}

	/**
	 * @param {string} locale
	 * @return {boolean}
	 * @private
	 */
	_validateLocale(locale) {
		return BCP_47_TAG_PATTERN.test(locale);
	}
}


/**
 * Spec: https://tools.ietf.org/html/bcp47
 * @const {RegExp}
 */
export const BCP_47_TAG_PATTERN = (() => {
	// These tags are deprecated in favor of a more modern subtag
	// or sequence of subtags
	const irregularTags = [
		'en-GB-oed',
		'sgn-BE-FR',
		'sgn-BE-NL',
		'sgn-CH-DE',
		'i-ami',
		'i-bnn',
		'i-default',
		'i-enochian',
		'i-hak',
		'i-klingon',
		'i-lux',
		'i-mingo',
		'i-navajo',
		'i-pwn',
		'i-tao',
		'i-tay',
		'i-tsu'
	];

	// These tags are all valid, but most are deprecated in favor of
	// more modern subtags or subtag combination
	const regularTags = [
		'art-lojban',
		'cel-gaulish',
		'no-bok',
		'no-nyn',
		'zh-guoyu',
		'zh-hakka',
		'zh-min',
		'zh-min-nan',
		'zh-xiang'
	];

	// Non-redundant tag registered during the RFC 3066 era
	const grandfatheredTag = `(?:(${irregularTags.join('|')})|(${regularTags.join('|')}))`;

	// Shortest ISO 639 code sometimes followed by extended language subtags
	// or reserved for future use
	// or registered language subtag
	const primarySubtag = '((?:[a-z]{2,3}(?:(?:-[a-z]{3}){1,3})?)|[a-z]{4}|[a-z]{5,8})';

	// ISO 15924 code
	const scriptSubtag = '(?:-([a-z]{4}))?';

	// ISO 3166-1 code or UN M.49 code
	const regionSubtag = '(?:-([a-z]{2}|\\d{3}))?';

	// Registered variants
	const variantSubtag = '((?:-(?:[\\da-z]{5,8}|\\d[\\da-z]{3}))*)?';

	// Singleton (single alphanumerics except "x") + value
	const extensionSubtag = '((?:-[\\da-wy-z](?:-[\\da-z]{2,8})+)*)?';

	// "x" + value
	const privateUseSubtag = '(-x(?:-[\\da-z]{1,8})+)?';

	// Normal language tag
	const langTag = (
		primarySubtag +
		scriptSubtag +
		regionSubtag +
		variantSubtag +
		extensionSubtag +
		privateUseSubtag
	);

	// Private use tag
	const privateUseTag = '(x(?:-[\\da-z]{1,8})+)';

	return new RegExp(`^${grandfatheredTag}$|^${langTag}$|^${privateUseTag}$`, 'i');
})();
