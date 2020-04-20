import AbstractCuteWidget from 'cutejs/widgets/abstract-widget';
import {Out, render} from 'generated/cutejs/<%=name%>/widgets/greeting/greeting.jst';


/**
 */
export default class Greeting extends AbstractCuteWidget {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {Out}
		 * @protected
		 */
		this._exported;
	}

	/**
	 * @override
	 */
	isFocusable() {
		return false;
	}

	/**
	 * @override
	 */
	_renderTemplate() {
		return render(this._getTemplateData(), this._getTemplateOptions());
	}
}
