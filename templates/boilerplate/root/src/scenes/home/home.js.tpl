import AbstractCuteScene from 'cutejs/layers/abstract-scene';
import {Out, render} from 'generated/cutejs/<%=name%>/scenes/home/home.jst';
import app from 'generated/app';


/**
 */
export default class Home extends AbstractCuteScene {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {Out}
		 * @protected
		 */
		this._exported;

		this._addContainerClass('s-home');

		this._onPlayerButtonClickBound = this._onPlayerButtonClick.bind(this);
		this._onBackButtonClickBound = this._onBackButtonClick.bind(this);
		this._onForwardButtonClickBound = this._onForwardButtonClick.bind(this);
	}

	/**
	 * @override
	 */
	beforeDOMShow() {
		super.beforeDOMShow();

		const {playerButton, backButton, forwardButton} = this._exported;

		playerButton.on(playerButton.EVENT_CLICK, this._onPlayerButtonClickBound);
		backButton.on(backButton.EVENT_CLICK, this._onBackButtonClickBound);
		forwardButton.on(forwardButton.EVENT_CLICK, this._onForwardButtonClickBound);
	}

	/**
	 * @override
	 */
	afterDOMHide() {
		super.afterDOMHide();

		const {playerButton, backButton, forwardButton} = this._exported;

		playerButton.off(playerButton.EVENT_CLICK, this._onPlayerButtonClickBound);
		backButton.off(backButton.EVENT_CLICK, this._onBackButtonClickBound);
		forwardButton.off(forwardButton.EVENT_CLICK, this._onForwardButtonClickBound);
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
	_onPlayerButtonClick() {
		const player = app.getLayerManager().getLayer('player');

		app.getSceneOpener().open(player, () => {
			player.play('http://vs.ifaced.ru/streams/bbb/bbb.mp4');
		});
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
