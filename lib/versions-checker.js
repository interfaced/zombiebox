/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
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
	 * @param {Object<string, *>} appPackage
	 * @param {Array<Object<string, *>>} packages
	 */
	constructor(appPackage, packages) {
		/**
		 * @type {Object<string, *>}
		 * @private
		 */
		this._appPackage = appPackage;

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
		const nodeVersion = process.versions.node;
		const composedReport = createEmptyReport();

		this._packages.forEach((pkg) => {
			const {name, peerDependencies = {}} = pkg;
			const appDependencies = this._appPackage.dependencies || {};

			if (appDependencies && name in appDependencies) {
				reports.push(
					this._checkDependency(name, appDependencies[name], this._appPackage.name)
				);
			}

			Object.keys(peerDependencies)
				.forEach((dependencyName) => {
					reports.push(
						this._checkDependency(dependencyName, peerDependencies[dependencyName], name)
					);
				});
		});

		this._packages.forEach((packageJson) => {
			const {name, engines} = packageJson;
			const report = createEmptyReport();
			const {incompatibleNode} = VersionsChecker.Messages;

			if (engines && engines.node && !semver.satisfies(nodeVersion, engines.node)) {
				report.warns.push(incompatibleNode(name, engines.node, nodeVersion));
			}
			reports.push(report);
		});

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

				if (!satisfies(version, range, {includePrerelease: true})) {
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
	),

	incompatibleNode: (name, requiredVersion, installedVersion) => (
		`${chalk.bold(name)} requires Node version ${chalk.bold(requiredVersion)}, ` +
		`but ${chalk.bold(installedVersion)} is installed`
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
 * @param {Object} options
 * @return {boolean}
 */
function satisfies(version, range, options) {
	if (range === '*') {
		return true;
	}

	return semver.satisfies(version, range, options);
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
