/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * Creates DOM Node with className and child textNode inside if text argument exists
 * @param {string} nodeName
 * @param {string=} className
 * @param {string=} text
 * @return {HTMLElement}
 */
export const node = (nodeName, className, text) => {
	const node = document.createElement(nodeName);

	if (typeof className !== 'undefined' && className !== null) {
		node.className = className;
	}

	if (typeof text !== 'undefined') {
		node.appendChild(textNode(text));
	}

	return /** @type {HTMLElement} */ (node);
};


/**
 * Creates DIV Node with className and child textNode inside if text argument exists
 * @param {string=} className
 * @param {string=} text
 * @return {HTMLDivElement}
 */
export const div = (className, text) => /** @type {HTMLDivElement} */ (
	node('div', className, text)
);


/**
 * Create Text DOM Node
 * @param {string} text
 * @return {Text}
 */
export const textNode = (text) => document.createTextNode(text);


/**
 * @param {DocumentFragment|HTMLElement} fragment
 * @return {HTMLElement}
 */
export const findFirstElementNode = (fragment) => {
	for (let i = 0; i < fragment.childNodes.length; i++) {
		if (fragment.childNodes[i].nodeType === 1) {
			return /** @type {HTMLElement} */ (fragment.childNodes[i]);
		}
	}

	return null;
};


/**
 * Usage:
 *
 * const clean = sanitize(htmlString, {
 *      'img': ['src'],
 *      'br': [],
 *      'div': (node) => {
 *          // cleanup node attributes
 *
 *          return node;
 *      }
 *      });
 * view.innerHTML = clean;
 *
 * @param {string} html
 * @param {SanitizeFilters=} filters
 * @return {string}
 */
export const sanitize = (html, filters = {}) => {
	let doc = null;
	let node = null;

	// Store document/window methods into variables for prevent clobbering attack
	const getElementsByTagName = document.getElementsByTagName;
	const implementation = document.implementation;

	try {
		doc = new DOMParser().parseFromString(html, 'text/html');
	} catch (e) {
		/* Ignore errors */
	}

	if (!doc) {
		doc = implementation.createHTMLDocument('');
		doc.body.innerHTML = html;
	}

	if (doc.getElementsByTagName) {
		node = doc.getElementsByTagName('body')[0];
	} else {
		node = getElementsByTagName.call(doc, 'body')[0];
	}

	filters['body'] = filters['body'] || [];

	sanitizeNode(node, filters);

	return node.innerHTML;
};


/**
 * Usage:
 *
 * const clean = sanitizeNode(node, {
 *      'img': ['src'],
 *      'br': [],
 *      'div': (node) => {
 *          // cleanup node attributes
 *
 *          return node;
 *      }
 *      });
 * view.appendChild(clean);
 *
 * @param {Node} node
 * @param {SanitizeFilters=} filters
 * @return {Node}
 */
export const sanitizeNode = (node, filters = {}) => {
	// Store document/window methods into variables for prevent clobbering attack
	const TextNode = window.Text;
	const CommentNode = window.Comment;
	const NamedNodeMap = window.NamedNodeMap;
	const createNodeIterator = document.createNodeIterator.bind(document);

	const nodePropTypes = {
		'nodeType': 'number',
		'nodeName': 'string',
		'textContent': 'string',
		'removeChild': Function,
		'removeAttribute': Function,
		'setAttribute': Function,
		'attributes': NamedNodeMap
	};

	/**
	 * @param {Node} node
	 * @return {boolean}
	 */
	const isClobbered = (node) => {
		if (node instanceof CommentNode || node instanceof TextNode) {
			return false;
		}

		const props = Object.keys(nodePropTypes);
		for (let i = 0; i < props.length; i++) {
			const type = nodePropTypes[props[i]];
			if (typeof type === 'string') {
				if (typeof node[props[i]] !== type) {
					return true;
				}
			} else if (!(node[props[i]] instanceof type)) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Return first level child nodes. Used for prevent clobbering attack.
	 * @param {Node} node
	 * @return {Array<Node>}
	 */
	const getChildNodes = (node) => {
		const nodeIterator = createNodeIterator(
			node,
			NodeFilter.SHOW_ALL,
			/** @type {NodeFilter} */ ({
				acceptNode: (ch) => ch.parentNode === node ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
			}),
			false
		);

		const nodes = [];
		let currentNode = nodeIterator.nextNode();
		while (currentNode) {
			if (currentNode !== node) { // Prevent recursion loop in some old browsers (e.g. Mag250)
				nodes.push(currentNode);
			}
			currentNode = nodeIterator.nextNode();
		}

		return nodes;
	};

	/**
	 * @param {Node} node
	 * @param {Node} parent
	 * @param {SanitizeFilters} filters
	 */
	const sanitizeNodeInner = (node, parent, filters) => {
		if (isClobbered(node)) {
			parent.removeChild(node);

			return;
		}

		// Skip text and comments
		if (node.nodeType === 3 || node.nodeType === 8) {
			return;
		}

		getChildNodes(node)
			.forEach((child) => {
				sanitizeNodeInner(child, node, filters);
			});

		const filter = filters[node.tagName.toLowerCase()];
		if (!filter) {
			getChildNodes(node)
				.forEach((child) => {
					parent.insertBefore(child, node);
				});

			parent.removeChild(node);
		} else if (typeof filter === 'function') {
			// External filter
			if (!filter(node)) {
				parent.removeChild(node);
			}
		} else {
			// Erase attributes
			Array.prototype.slice.call(node.attributes)
				.forEach((attribute) => {
					if (filter.indexOf(attribute.name) === -1) {
						node.removeAttribute(attribute.name);
					}
				});
		}
	};

	if (isClobbered(node)) {
		empty(node);
		remove(node);

		return null;
	}

	getChildNodes(node)
		.forEach((child) => {
			// Type cast fixes https://github.com/google/closure-compiler/issues/3452
			sanitizeNodeInner(child, node, /** @type {SanitizeFilters} */ (filters));
		});

	return node;
};


/**
 * Adds class name if condition converts to true and removes otherwise
 * @param {Element} node
 * @param {string} className
 * @param {boolean} condition
 */
export const updateClassName = (node, className, condition) => {
	if (condition) {
		node.classList.add(className);
	} else {
		node.classList.remove(className);
	}
};


/**
 * Replace node value with text
 * @param {Element} node
 * @param {string} text
 */
export const text = (node, text) => {
	if (node.childNodes.length === 1 && node.firstChild instanceof Text) {
		node.firstChild.nodeValue = text;
	} else {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		node.appendChild(textNode(text));
	}
};


/**
 * @param {HTMLElement} element
 * @param {string} name
 * @return {?string}
 */
export const getCSS = (element, name) => {
	const computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
	if (computedStyle) {
		let value = computedStyle.getPropertyValue(name);
		if (value === '' && !computedStyle.hasOwnProperty(name)) {
			value = null;
		}

		return value;
	}

	return null;
};


/**
 * @param {HTMLElement} element
 * @param {string=} display
 */
export const show = (element, display = 'block') => {
	element.style.display = element['_oldDisplay'] === 'none' ? '' : (element['_oldDisplay'] || '');

	if (getCSS(element, 'display') === 'none') {
		element.style.display = display;
	}
};


/**
 * @param {HTMLElement} element
 */
export const hide = (element) => {
	element['_oldDisplay'] = element.style.display;
	element.style.display = 'none';
};


/**
 * @param {HTMLElement} element
 * @param {boolean} isVisible
 */
export const showHide = (element, isVisible) => {
	if (isVisible) {
		show(element);
	} else {
		hide(element);
	}
};


/**
 * Remove all child nodes of elements.
 * @param {...Node} args
 */
export const empty = (...args) => {
	for (let i = 0; i < args.length; i++) {
		const element = args[i];
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}
};


/**
 * Remove elements itself.
 * @param {...Node} args
 */
export const remove = (...args) => {
	for (let i = 0; i < args.length; i++) {
		const element = args[i];
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
	}
};


/**
 * TODO: This could be optimized or perhaps not necessary at all
 * Based on: https://davidwalsh.name/vendor-prefix
 * @return {{dom: string, lowercase: string, css: string, js: string}}
 */
export const getVendorPrefix = () => {
	const styles = window.getComputedStyle(document.documentElement, '');
	const prefix = (
		Array.prototype.slice.call(styles)
			.join('')
			.match(/-(moz|webkit|ms)-/) ||
		(styles['OLink'] === '' && ['', 'o']) ||
		['', '']
	)[1];

	const DOMPrefix = prefix ? ('WebKit|Moz|MS|O').match(new RegExp('(' + prefix + ')', 'i'))[1] : '';

	return {
		dom: DOMPrefix,
		lowercase: prefix,
		css: prefix ? '-' + prefix + '-' : '',
		js: prefix ? (prefix[0].toUpperCase() + prefix.substr(1)) : ''
	};
};


/**
 * Allowed tags name as key and allowed attributes or custom sanitize callback as value.
 * @typedef {Object<string, (Array<string>|function(Node): ?Node)>}
 */
export let SanitizeFilters;
