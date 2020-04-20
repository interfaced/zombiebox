import AbstractCuteScene from 'cutejs/layers/abstract-scene';
import IStatefulVideo, {PrepareOption} from 'zb/device/interfaces/i-stateful-video';
import {Out, render} from 'generated/cutejs/<%=name%>/scenes/player/player.jst';
import app from 'generated/app';


// Note: This implementation is pretty naive and lacks complex Video state machine handling which is vital for stable apps

/**
 */
export default class Player extends AbstractCuteScene {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {Out}
		 * @protected
		 */
		this._exported;

		/**
		 * @type {IStatefulVideo}
		 * @protected
		 */
		this._video;

		this._addContainerClass('s-player');

		this._onHomeButtonClickBound = this._onHomeButtonClick.bind(this);
		this._onBackButtonClickBound = this._onBackButtonClick.bind(this);
		this._onForwardButtonClickBound = this._onForwardButtonClick.bind(this);

		this._initVideo();
	}

	/**
	 * @override
	 */
	beforeDOMShow() {
		super.beforeDOMShow();
		app.showVideo();

		const {homeButton, backButton, forwardButton} = this._exported;

		homeButton.on(homeButton.EVENT_CLICK, this._onHomeButtonClickBound);
		backButton.on(backButton.EVENT_CLICK, this._onBackButtonClickBound);
		forwardButton.on(forwardButton.EVENT_CLICK, this._onForwardButtonClickBound);
	}

	/**
	 * @override
	 */
	afterDOMHide() {
		super.afterDOMHide();
		app.hideVideo();

		const {homeButton, backButton, forwardButton} = this._exported;

		homeButton.off(homeButton.EVENT_CLICK, this._onHomeButtonClickBound);
		backButton.off(backButton.EVENT_CLICK, this._onBackButtonClickBound);
		forwardButton.off(forwardButton.EVENT_CLICK, this._onForwardButtonClickBound);
	}

	/**
	 * @override
	 */
	takeSnapshot() {
		const lastPosition = this._video.getPosition();
		const lastUrl = this._video.getUrl();

		this._video.stop();

		return () => {
			this._video.prepare(lastUrl, {
				[PrepareOption.START_POSITION]: lastPosition
			});
		};
	}

	/**
	 * @param {string} url
	 */
	play(url) {
		this._video.prepare(url);
	}

	/**
	 * @override
	 */
	_renderTemplate() {
		return render(this._getTemplateData(), this._getTemplateOptions());
	}

	/**
	 * @protected
	 */
	_initVideo() {
		this._video = app.device.createStatefulVideo();

		this._video.on(this._video.EVENT_READY, () => this._video.play());
	}

	/**
	 * @protected
	 */
	_onHomeButtonClick() {
		const home = app.getLayerManager().getLayer('home');
		app.getSceneOpener().open(home);
	}

	/**
	 * @protected
	 */
	_onBackButtonClick() {
		app.back();
	}

	/**
	 * @protected
	 */
	_onForwardButtonClick() {
		app.forward();
	}
}
