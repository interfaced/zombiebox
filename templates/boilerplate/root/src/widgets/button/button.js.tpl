import AbstractCuteWidget from 'cutejs/widgets/abstract-widget';
import {text} from 'zb/html';
import Key from 'zb/device/input/key';
import {render, Out} from 'generated/cutejs/<%=name%>/widgets/button/button.jst';


/**
 */
export default class Button extends AbstractCuteWidget {
	/**
	 * @param {string} title
	 */
	constructor(title) {
		super();

		/**
		 * @override
		 * @type {Out}
		 */
		this._exported;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_CLICK = 'click';

		this.setTitle(title);
	}

	/**
	 * @override
	 */
	processKey(zbKey, event) {
		if (zbKey === Key.ENTER) {
			this._fireEvent(this.EVENT_CLICK);
			return true;
		}

		return super.processKey(zbKey, event);
	}

	/**
	 * @param {string} title
	 */
	setTitle(title) {
		text(this._exported.title, title);
	}

	/**
	 * @override
	 */
	_renderTemplate() {
		return render(this._getTemplateData(), this._getTemplateOptions());
	}
}
