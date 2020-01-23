/**
 * @const {boolean}
 */
export const ENABLE_CONSOLE = true;

/**
 * @const {string}
 */
export const PLATFORM_NAME = "";

/**
 * @const {string}
 */
export const string = "foo";

/**
 * @const {number}
 */
export const number = 30;

/**
 * @struct
 */
export const object = {
	/**
	 * @const {boolean}
	 */
	boolean: true,
	
	/**
	 * @const {number}
	 */
	number: 0
};

/**
 * @struct
 */
export const several = {
	/**
	 * @struct
	 */
	layers: {
		/**
		 * @struct
		 */
		deep: {
			/**
			 * @const {number}
			 */
			number: 10
		}
	}
};

/**
 * @struct
 */
export const emptyObject = {
	
};

/**
 * @const {undefined}
 */
export const undefined = undefined;

/**
 * @const {null}
 */
export const nullValue = null;

/**
 * @const {Array<string>}
 */
export const stringArray = ["zero","one","two"];

/**
 * @const {Array<number>}
 */
export const numbersArray = [1,2];

/**
 * @const {Array<string|boolean|number>}
 */
export const mixedArray = ["zero",true,2];

/**
 * @const {Array<Array<number>>}
 */
export const arrayArray = [[1],[2,3]];

/**
 * @const {Array<Array<string>|Array<number>>}
 */
export const mixedArrayArray = [["foo"],[2,3]];

/**
 * @const {Array<Object>}
 */
export const objectArray = [{"string":"foo"},{"string":"bar"}];

/**
 * @const {Array<*>}
 */
export const emptyArray = [];

/**
 * @const {Function}
 */
export const functionValue = () => 0;

/**
 * @const {string}
 */
export const NPM_PACKAGE_NAME = "zb-test";

/**
 * @const {string}
 */
export const NPM_PACKAGE_VERSION = "0.0.0";

/**
 * @const {string}
 */
export const ZOMBIEBOX_VERSION = "0.0.0";