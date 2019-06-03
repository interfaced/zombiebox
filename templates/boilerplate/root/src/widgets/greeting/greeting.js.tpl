import AbstractCuteWidget from 'cutejs/widgets/abstract-widget';
import {In, Out, render} from 'generated/cutejs/<%=name%>/widgets/greeting/greeting.jst';


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

		this._addContainerClass('w-greeting');
	}

	/**
	 * @override
	 */
	_renderTemplate() {
		return render(this._getTemplateData(), this._getTemplateOptions());
	}
}
