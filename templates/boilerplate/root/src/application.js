import BaseApplication from 'generated/base-application';
import Home from './scenes/home/home'

/**
 */
export default class Application extends BaseApplication {
	/**
	 */
	constructor() {
		super();
	}

	/**
	 */
	onReady() {
		this.addScene(new Home(), 'home');
	}

	/**
	 * @override
	 */
	home() {
		this.clearHistory();
		const homeScene = this.getLayerManager().getLayer('home');

		return this.getSceneOpener().open(homeScene, () => {
			// Set home scene data here
		});
	}

	/**
	 * @override
	 */
	onStart() {
		this.home();
	}
}
