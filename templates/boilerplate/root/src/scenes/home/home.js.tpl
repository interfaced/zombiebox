import AbstractCuteScene from 'cutejs/layers/abstract-scene';
import {In, Out, render} from 'generated/cutejs/<%=name%>/scenes/home/home.jst';


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
	}

	/**
	 * @override
	 */
	_renderTemplate() {
		return render(this._getTemplateData(), this._getTemplateOptions());
	}
};
