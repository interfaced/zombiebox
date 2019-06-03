/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const chalk = require('chalk');
const semver = require('semver');


/**
 */
class VersionsChecker {
	/**
	 * @param {Object<string, string>} dependencies
	 * @param {Array<Object<string, *>>} packages
	 */
	constructor(dependencies, packages) {
		/**
		 * @type {Object<string, string>}
		 * @private
		 */
		this._dependencies = dependencies;

		/**
		 * @type {Array<Object<string, *>>}
		 * @private
		 */
		this._packages = packages;
	}

	/**
	 * @return {VersionsChecker.Report}
	 */
	check() {
		const reports = [];

		this._packages.forEach((pkg) => {
			const {name, peerDependencies = {}} = pkg;

			if (name in this._dependencies) {
				reports.push(
					this._checkDependency(name, this._dependencies[name], 'application')
				);
			}

			Object.keys(peerDependencies)
				.forEach((dependencyName) => {
					reports.push(
						this._checkDependency(dependencyName, peerDependencies[dependencyName], name)
					);
				});
		});

		const composedReport = createEmptyReport();
		reports.forEach((report) => {
			composedReport.warns.push(...report.warns);
			composedReport.errors.push(...report.errors);
		});

		return composedReport;
	}

	/**
	 * @param {string} name
	 * @param {string} range
	 * @param {string} dependant
	 * @return {VersionsChecker.Report}
	 * @private
	 */
	_checkDependency(name, range, dependant) {
		const {invalid, absent, incompatible} = VersionsChecker.Messages;

		const report = createEmptyReport();

		if (semver.validRange(range) === null) {
			report.warns.push(invalid(name, range, dependant));
		} else {
			const pkg = this._packages.find((pkg) => pkg.name === name);

			if (!pkg) {
				report.errors.push(absent(name, range, dependant));
			} else {
				const {version = '*'} = pkg;

				if (!satisfies(version, range)) {
					report.errors.push(incompatible(name, version, range, dependant));
				}
			}
		}

		return report;
	}
}


/**
 * @type {Object<string, function(...*): string>}
 */
VersionsChecker.Messages = {
	invalid: (name, range, by) => (
		`Required by ${chalk.bold(by)} range ${chalk.bold(range)} for ${chalk.bold(name)} is invalid.`
	),

	absent: (name, range, by) => (
		`Required by ${chalk.bold(by)} package ${chalk.bold(name)} isn't installed.\n` +
		`Install a compatible with range ${chalk.bold(range)} version of ${chalk.bold(name)} and try again.`
	),

	incompatible: (name, version, range, by) => (
		`Installed version ${chalk.bold(version)} of ${chalk.bold(name)} is incompatible ` +
		`with the required by ${chalk.bold(by)} range ${chalk.bold(range)}.\n` +
		`Install a compatible with range ${chalk.bold(range)} version of ${chalk.bold(name)} and try again.`
	)
};


/**
 * @typedef {{
 *     warns: Array<string>,
 *     errors: Array<string>
 * }}
 */
VersionsChecker.Report;


/**
 * @param {string} version
 * @param {string} range
 * @return {boolean}
 */
function satisfies(version, range) {
	if (range === '*') {
		return true;
	}

	return semver.satisfies(version, range);
}


/**
 * @return {VersionsChecker.Report}
 */
function createEmptyReport() {
	return {
		warns: [],
		errors: []
	};
}


module.exports = VersionsChecker;
