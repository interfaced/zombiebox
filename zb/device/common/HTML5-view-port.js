/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {getVendorPrefix} from '../../html';
import AbstractViewPort from '../abstract-view-port';
import {Proportion, Common} from '../aspect-ratio/proportion';
import {Transferring} from '../aspect-ratio/aspect-ratio';
import Rect from '../../geometry/rect';


/**
 */
export default class HTML5ViewPort extends AbstractViewPort {
	/**
	 * @param {Rect} containerRect
	 * @param {HTMLDivElement} videoContainer
	 * @param {HTMLVideoElement} videoObject
	 */
	constructor(containerRect, videoContainer, videoObject) {
		super(containerRect);

		/**
		 * @type {{
		 *     width: number,
		 *     height: number
		 * }}
		 * @protected
		 */
		this._videoInfo;

		/**
		 * @type {HTMLDivElement}
		 * @protected
		 */
		this._videoContainer = videoContainer;

		/**
		 * @type {HTMLVideoElement}
		 * @protected
		 */
		this._video = videoObject;

		/**
		 * Multipliers of standard resolutions
		 * @type {Object<Proportion, number>}
		 * @protected
		 */
		this._aspectRatioMultiplierMap = this._buildAspectRatioMultiplierMap();

		/**
		 * @type {string}
		 * @protected
		 */
		this._CSSVendorPrefix = getVendorPrefix().js;
	}

	/**
	 * @override
	 */
	hasAspectRatioFeature() {
		return true;
	}

	/**
	 * @override
	 */
	hasAreaChangeFeature() {
		return true;
	}

	/**
	 * @override
	 */
	isAspectRatioSupported(ratio) {
		return true;
	}

	/**
	 * @override
	 */
	updateViewPort() {
		const area = this.getCurrentArea();

		this._setHTMLElementRect(this._videoContainer, area);
		this._setHTMLElementRect(this._video, this._calculateVideoArea());

		this._applyCropStyles();
	}

	/**
	 * @param {HTMLVideoElement} video
	 */
	setVideoObject(video) {
		this._video = video;
		this.updateViewPort();
	}

	/**
	 * @param {HTMLElement} element
	 * @param {Rect} rect
	 * @protected
	 */
	_setHTMLElementRect(element, rect) {
		const pointA = rect.getPointA();
		element.style.left = pointA.x + 'px';
		element.style.top = pointA.y + 'px';
		element.style.width = rect.getSizeX() + 'px';
		element.style.height = rect.getSizeY() + 'px';
	}

	/**
	 * @protected
	 */
	_updateVideoInfo() {
		const area = this.getCurrentArea();

		this._videoInfo = {
			width: this._video.videoWidth || area.getSizeX(),
			height: this._video.videoHeight || area.getSizeY()
		};
	}

	/**
	 * @return {Rect}
	 * @protected
	 */
	_calculateVideoArea() {
		const area = this.getCurrentArea();
		const transferring = this._aspectRatio.getTransferring();
		const isLetterBoxMode = transferring === Transferring.LETTERBOX;

		const areaMultiplier = area.getSizeY() / area.getSizeX();
		const aspectRatioMultiplier = this._getAspectRatioMultiplier(this._aspectRatio.getProportion());

		const maxHeight = area.getSizeY();
		const maxWidth = area.getSizeX();

		let width = maxWidth;
		let height = maxHeight;

		let letterBoxOffsetX = 0;
		let letterBoxOffsetY = 0;

		if (isLetterBoxMode) {
			if (aspectRatioMultiplier > areaMultiplier) {
				width = maxHeight / aspectRatioMultiplier;
			} else {
				height = maxWidth * aspectRatioMultiplier;
			}

			letterBoxOffsetX = Math.round((maxWidth - width) / 2);
			letterBoxOffsetY = Math.round((maxHeight - height) / 2);
		}

		const resultArea = Rect.createByNumbers(
			letterBoxOffsetX,
			letterBoxOffsetY,
			letterBoxOffsetX + width,
			letterBoxOffsetY + height
		);

		return resultArea;
	}

	/**
	 * @protected
	 */
	_applyCropStyles() {
		const transferring = this._aspectRatio.getTransferring();
		const isCropMode = transferring === Transferring.CROP;

		if (isCropMode) {
			this._setElementStyleProperty(this._video, 'objectFit', 'contain');
			this._setElementStyleProperty(this._video, 'transform', 'scale(' + this._calculateTransitRatio() + ')');
		} else {
			this._setElementStyleProperty(this._video, 'objectFit', 'fill');
			this._setElementStyleProperty(this._video, 'transform', '');
		}
	}

	/**
	 * @return {number}
	 * @protected
	 */
	_calculateTransitRatio() {
		this._updateVideoInfo();

		const area = this.getCurrentArea();
		const areaRatio = area.getSizeX() / area.getSizeY();
		const originRatio = this._videoInfo.width / this._videoInfo.height;

		return originRatio / areaRatio;
	}

	/**
	 * @param {HTMLElement} element
	 * @param {string} propName
	 * @param {string} value
	 * @protected
	 */
	_setElementStyleProperty(element, propName, value) {
		if (element.style[propName] !== undefined) {
			element.style[propName] = value;
		} else {
			const prefixedPropName = this._CSSVendorPrefix + propName[0].toUpperCase() + propName.substr(1);
			if (element.style[prefixedPropName] !== undefined) {
				element.style[prefixedPropName] = value;
			}
		}
	}

	/**
	 * @return {Object<Proportion, number>}
	 * @protected
	 */
	_buildAspectRatioMultiplierMap() {
		const map = {};
		map[Common.X16X9] = 9 / 16;
		map[Common.X4X3] = 3 / 4;

		return map;
	}

	/**
	 * @param {Proportion} proportion
	 * @return {number}
	 * @protected
	 */
	_getAspectRatioMultiplier(proportion) {
		const CommonProportion = Common;

		if (proportion === CommonProportion.KEEP || proportion === CommonProportion.AUTO) {
			this._updateVideoInfo();

			return this._videoInfo.height / this._videoInfo.width;
		}

		return this._aspectRatioMultiplierMap[proportion];
	}
}
