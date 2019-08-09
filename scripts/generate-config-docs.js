const rawSchema = require('../lib/config/schema');
const RefParser = require('json-schema-ref-parser');
const fse = require('fs-extra');
const path = require('path');
const escodegen = require('escodegen');
const b = require('ast-types').builders;


/**
 */
class ConfigGenerator {
	/**
	 * @param {RefParser} parser
	 */
	constructor(parser) {
		/**
		 * @type {RefParser}
		 * @private
		 */
		this._parser = parser;

		/**
		 * @const {string}
		 */
		this.HEADER = 'This file was generated automatically from config/schema.js.\nDo not edit it manually!';
	}

	/**
	 * @return {string}
	 */
	renderMarkdown() {
		return ['<!--', this.HEADER, '-->', '', ''].join('\n') +
			this._renderMarkdownObject(this._parser.schema);
	}

	/**
	 * @return {string}
	 */
	renderJsInterface() {
		const classes = [
			this._parser.schema,
			...Object.values(this._parser.schema.definitions)
		];

		return [
			['/*', this.HEADER, '*/'].join('\n'),
			...classes.map((object) => this._renderJsClass(object)),
			this._renderJsExports(classes)
		].join('\n\n\n');
	}

	/**
	 * @param {number} level
	 * @param {string} value
	 * @return {string}
	 * @private
	 */
	_renderMakrdownHeader(level, value) {
		return '#'.repeat(level) + ' ' + value + '\n';
	}

	/**
	 * @param {Object} object
	 * @param {number} level
	 * @return {string}
	 * @private
	 */
	_renderMarkdownObject(object, level = 1) {
		let markdown = '';

		markdown += this._renderMakrdownHeader(level, object['$id']) + '\n';
		markdown += object.description + '\n';
		markdown += this._renderMarkdownProperties(object) + '\n';

		for (const subObject of Object.values(object.definitions || {})) {
			markdown += this._renderMarkdownObject(subObject, level + 1) + '\n';
		}

		return markdown;
	}

	/**
	 * @param {Object} object
	 * @return {string}
	 * @private
	 */
	_renderMarkdownProperties(object) {
		const fields = object.properties ?
			Object.entries(object.properties)
				.map(([name, subObject]) => {
					const isReference = subObject.hasOwnProperty('$ref');
					const propertyObject = isReference ? this._parser.$refs.get(subObject['$ref']) : subObject;
					const required = object.required && object.required.includes(name);
					const type = this._renderMarkdownType(subObject);

					const description = (required ? '**Required!** ' : '') +
						propertyObject.description.replace(/\n/g, ' ');

					return `| ${name} | ${type} | ${description} |`;
				}) :
			[];

		const rest = object.additionalProperties;
		const restFields = rest ?
			[`| * | ${this._renderMarkdownType(rest)} | ${rest.description} |`] :
			[];

		if (!fields.length && !restFields.length) {
			return '';
		}

		return [
			'',
			'| Key | Type | Description | ',
			'| --- | --- | --- |',
			...fields,
			...restFields,
			''
		].join('\n');
	}

	/**
	 * @param {Object} object
	 * @param {function(string): string} renderReference
	 * @return {string}
	 * @private
	 */
	_renderType(object, renderReference) {
		if (object.hasOwnProperty('$ref')) {
			const realObject = this._parser.$refs.get(object['$ref']);
			return renderReference(realObject['$id']);
		}

		switch (object.type) {
			case 'string':
				return 'string';
			case 'integer':
			case 'number':
				return 'number';
			case 'object':
				const propertyType = object.additionalProperties && typeof object.additionalProperties === 'object' ?
					`<${this._renderType(object.additionalProperties, renderReference)}>` :
					'';
				return `Object${propertyType}`;
			case 'array':
				const itemType = object.items && typeof object.items === 'object' ?
					`<${this._renderType(object.items, renderReference)}>` :
					'';
				return `Array${itemType}`;
			case 'boolean':
				return 'boolean';
			case 'null':
				return 'null';
			default:
				return '?';
		}
	}

	/**
	 * @param {Object} object
	 * @return {string}
	 * @private
	 */
	_renderMarkdownType(object) {
		return this._renderType(object, (id) => `[\`${id}\`](#markdown-header-${id.toLowerCase()})`);
	}

	/**
	 * @param {Object} object
	 * @return {string}
	 * @private
	 */
	_renderJsType(object) {
		return this._renderType(object, (id) => this._getJsInterfaceName(id));
	}

	/**
	 * @param {Object} object
	 * @return {string}
	 * @private
	 */
	_renderJsClass(object) {
		const jsdoc = [
			'/**',
			` * ${object.description}`,
			` * @interface`,
			' **/'
		].join('\n');

		const properties = Object.entries(object.properties).map(([key, object]) => {
			const expression = b.expressionStatement(
				b.memberExpression(
					b.thisExpression(),
					b.identifier(key)
				)
			);
			let type;
			if (object.hasOwnProperty('$ref')) {
				const realObject = this._parser.$refs.get(object['$ref']);
				type = this._getJsInterfaceName(realObject['$id']);
			} else {
				type = this._renderJsType(object);
			}
			expression.leadingComments = [b.block([
				'*',
				' * ' + (object.description || '').split('\n').join('\n * '),
				` * @type {${type}}`,
				' '
			].join('\n'))];
			return expression;
		});

		const constructor = b.methodDefinition(
			'constructor',
			b.identifier('constructor'),
			b.functionExpression(
				null,
				[],
				b.blockStatement(properties)
			)
		);
		constructor.leadingComments = [b.block('* ')];

		const ast = b.classExpression(
			b.identifier(this._getJsInterfaceName(object['$id'])),
			b.classBody([constructor])
		);

		return jsdoc + '\n' +
			escodegen.generate(ast, {
				comment: true,
				format: {
					indent: {
						style: '\t',
						adjustMultilineComment: true
					}
				}
			});
	}

	/**
	 * @param {string} id
	 * @return {string}
	 * @private
	 */
	_getJsInterfaceName(id) {
		return `I${id}`;
	}

	/**
	 * @param {Array<Object>} classes
	 * @return {string}
	 * @private
	 */
	_renderJsExports(classes) {
		return escodegen.generate(b.assignmentExpression(
			'=',
			b.memberExpression(
				b.identifier('module'),
				b.identifier('exports')
			),
			b.objectExpression(
				classes.map((object) => b.property(
					'init',
					b.identifier(this._getJsInterfaceName(object['$id'])),
					b.identifier(this._getJsInterfaceName(object['$id']))
				))
			)
		));
	}
}


(async () => {
	const refParser = new RefParser();
	await refParser.parse(rawSchema);

	const generator = new ConfigGenerator(refParser);
	const markdown = generator.renderMarkdown();
	await fse.writeFile(path.resolve(__dirname, '../docs/config.md'), markdown, 'utf-8');

	const jsInterface = generator.renderJsInterface();
	await fse.writeFile(path.resolve(__dirname, '../lib/config/interface.js'), jsInterface, 'utf-8');
})();
