import {
	node,
	div,
	textNode,
	findFirstElementNode,
	sanitize,
	updateClassName,
	text,
	getCSS,
	show,
	hide,
	showHide,
	empty,
	remove
} from 'zb/html';

describe('zb/html', () => {
	const createDiv = function(html = '') {
		const div = document.createElement('div');
		div.innerHTML = html;
		return div;
	};

	describe('node', () => {
		it('Create node', () => {
			expect(node('span').tagName).eq('SPAN');
		});

		it('Create node with class', () => {
			expect(node('span', 'myClass').className).eq('myClass');
			expect(node('span', 'myClass myClass2').className).eq('myClass myClass2');
		});

		it('Create node with text', () => {
			expect(node('div', '', 'text').textContent).eq('text');
			expect(node('span', 'withClassName', 'text').textContent).eq('text');
			expect(node('span', 'withClassName', 't<b>e</b>xt').textContent).eq('t<b>e</b>xt');
		});
	});

	describe('div', () => {
		it('Create DIV element', () => {
			expect(div().tagName).eq('DIV');
		});

		it('Create DIV element with className', () => {
			expect(div('myClass').className).eq('myClass');
			expect(div('myClass myClass2').className).eq('myClass myClass2');
		});

		it('Create DIV element with text', () => {
			expect(div('', 'text').textContent).eq('text');
			expect(div('withClassName', 'text').textContent).eq('text');
			expect(div('withClassName', 't<b>e</b>xt').textContent).eq('t<b>e</b>xt');
		});
	});

	describe('textNode', () => {
		it('Create text node', () => {
			expect(textNode().nodeType).eq(Node.TEXT_NODE);
		});

		it('Create text node with content', () => {
			expect(textNode('text').nodeValue).eq('text');
		});
	});

	describe('findFirstElementNode', () => {
		const test = function(html) {
			const node = findFirstElementNode(createDiv(html));
			expect(node.getAttribute('success')).eq('true');
		};

		it('Find first node', () => {
			test('<div success="true"></div>');
		});

		it('Find node after comment', () => {
			test('<!-- test --><div success="true"></div>');
		});

		it('Find node in many nodes', () => {
			test('<!-- test --><div success="true"></div><div></div>');
		});
	});

	describe('sanitize', () => {
		const test = function(input, output, filters) {
			expect(sanitize(input, filters)).eq(output);
		};

		it('Save plaint text', () => {
			test('text', 'text');
		});

		it('Remove not allowed content from node', () => {
			test(
				'TextNode' +
				'<div>' +
				'<div>' +
				'<br>' +
				'</div>' +
				'<br>' +
				'</div>',
				'TextNode<br><br>',
				{
					'br': []
				}
			);
		});

		it('Save text in deprecated child nodes', () => {
			test('t<span>ex</span>t', 'text');
		});

		it('Save many nodes at first level', () => {
			test(
				'<span>1</span>' +
				'<div>2</div>' +
				'<span>3</span>',
				'<span>1</span>2<span>3</span>',
				{
					'span': []
				}
			);
		});

		it('Save allowed child nodes', () => {
			test('t<span>ex</span>t', 't<span>ex</span>t', {span: []});
		});

		it('Support custom node validator', () => {
			test(
				'<div>there<customTag myAttr="42"  myAttrForRemove="73"> is </customTag>html</div>',
				'there<customtag myattr="42"> is </customtag>html',
				{
					'customtag': function(node) {
						node.removeAttribute('myAttrForRemove');
						return node;
					}
				}
			);
		});

		it('Remove node with custom validator', () => {
			test(
				'<div>there<customTag myAttr="42"  myAttrForRemove="73"> is </customTag>html</div>',
				'<div>therehtml</div>',
				{
					'div': [],
					'customtag': function() {
						return null;
					}
				}
			);
		});

		it('Remove attributes', () => {
			test('<img src="img.png" alt="pew">',
				'<img src="img.png">',
				{
					'img': ['src']
				}
			);
		});

		it('Clobbering: childNodes:single', () => {
			test(
				'<form><img onerror="alert(1)" src=""><img name="childNodes"></form>',
				'<form><img src=""><img></form>',
				{
					'img': ['src'],
					'form': []
				}
			);
		});

		it('Clobbering: childNodes:array', () => {
			test(
				'<form>' +
				'<input name="childNodes">' +
				'<input name="childNodes">' +
				'<script>alert(1)</script>' +
				'</form>',
				'<form><input><input>alert(1)</form>',
				{
					'form': [],
					'input': []
				}
			);
		});

		it('Clobbering: attributes', () => {
			test(
				'<form onhover="alert(1)"><input name="attributes"></form>',
				'',
				{
					'form': [],
					'input': []
				}
			);
		});

		it('Clobbering: attributes2', () => {
			test(
				'<div><form onhover="alert(1)"><input name="attributes"></form></div>',
				'<div></div>',
				{
					'div': [],
					'form': [],
					'input': []
				}
			);
		});
	});

	describe('updateClassName', () => {
		it('Add class on empty node', () => {
			const div = createDiv();
			updateClassName(div, 'myClass', true);
			expect(div.className).eq('myClass');
		});

		it('Don\'t add class on empty node', () => {
			const div = createDiv();
			updateClassName(div, 'myClass', false);
			expect(div.className).eq('');
		});

		it('Add class to exists classes', () => {
			const div = createDiv();
			div.className = 'foo bar';
			updateClassName(div, 'myClass', true);
			expect(div.className).eq('foo bar myClass');
		});

		it('Remove class from exists classes', () => {
			const div = createDiv();
			div.className = 'foo myClass bar';
			updateClassName(div, 'myClass', false);
			expect(div.className).eq('foo bar');
		});
	});

	describe('text', () => {
		it('Set text to empty node', () => {
			const div = createDiv();
			text(div, 'text');
			expect(div.textContent).eq('text');
		});

		it('Set text to node with child nodes', () => {
			const div = createDiv('<span>span-text</span>');
			text(div, 'text');
			expect(div.textContent).eq('text');
		});
	});

	describe('getCSS', () => {
		it('Get style inherits style', () => {
			const div = createDiv('<div>child</div>');
			// Without appending to document we can't get computed style
			document.body.appendChild(div);
			div.style.color = 'rgb(255, 0, 0)';
			expect(getCSS(div.firstChild, 'color')).eq('rgb(255, 0, 0)');
		});

		it('Get default style', () => {
			expect(getCSS(createDiv(), 'display')).eq('');
		});

		it('Get unknown style', () => {
			expect(getCSS(createDiv(), 'unknownProperty')).eq(null);
		});
	});

	describe('show', () => {
		const addStyle = function(css) {
			const head = document.head || document.getElementsByTagName('head')[0];
			const style = document.createElement('style');

			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}
			head.appendChild(style);

			return style;
		};

		it('Don\'t change detached node without styles', () => {
			const div = createDiv();
			show(div);
			expect(div.style.display).eq('');
		});

		it('Show detached hidden with style attribute', () => {
			const div = createDiv();
			div.style.display = 'none';
			show(div);
			expect(div.style.display).eq('');
		});

		it('Show node hidden with CSS rules', () => {
			const style = addStyle('.hidden { display: none; }');

			const div = createDiv();
			div.className = 'hidden';
			document.body.appendChild(div);

			show(div);

			style.parentNode.removeChild(style);

			expect(div.style.display).eq('block');
		});
	});

	describe('hide', () => {
		it('Hide node', () => {
			const div = createDiv();
			hide(div);
			expect(div.style.display).eq('none');
		});
	});

	describe('showHide', () => {
		it('Show', () => {
			const div = createDiv();
			div.style.display = 'none';
			showHide(div, true);
			expect(div.style.display).eq('');
		});

		it('Hide', () => {
			const div = createDiv();
			div.style.display = 'block';
			showHide(div, false);
			expect(div.style.display).eq('none');
		});
	});

	describe('empty', () => {
		it('Empty node', () => {
			const div = createDiv('<div>child</div>');
			expect(div.childNodes.length).eq(1);
			empty(div);
			expect(div.childNodes.length).eq(0);
		});
	});

	describe('remove', () => {
		it('Remove from parent', () => {
			const parent = createDiv('<div>child</div>');
			const child = parent.firstChild;
			remove(child);
			expect(parent.childNodes.length).eq(0);
			expect(child.parentNode).eq(null);
		});

		it('Remove not appended node not throw exception', () => {
			const fn = function() {
				remove(createDiv());
			};
			expect(fn).to.not.throw();
		});
	});
});
