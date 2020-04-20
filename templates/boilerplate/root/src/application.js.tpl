import BaseApplication from 'generated/base-application';
import Home from './scenes/home/home';
import Player from './scenes/player/player';


/**
 */
export default class Application extends BaseApplication {
	/**
	 * @override
	 */
	onReady() {
		this.addScene(new Home(), 'home');
		this.addScene(new Player(), 'player');
	}

	/**
	 * @override
	 */
	home() {
		this.clearHistory();
		const homeScene = this.getLayerManager().getLayer('home');

		return this.getSceneOpener().open(homeScene);
	}

	/**
	 * @override
	 */
	onStart() {
		this.home();
	}
}
