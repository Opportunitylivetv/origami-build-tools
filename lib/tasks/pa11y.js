'use strict';

const denodeify = require('denodeify');
const fs = require('fs');
const path = require('path');

const fileExists = file => denodeify(fs.open)(file, 'r').then(() => true).catch(() => false);

const pa11yTest = function (config) {
	const pa11y = require('pa11y');
	const src = 'file://' + path.join(config.cwd, '/demos/local/pa11y.html');
	// ignoring warnings, notices and the href="#" error
	const defaultIgnore = ['WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124.NoSuchID', 'warning', 'notice'];
	const ignore = defaultIgnore;
	const test = pa11y({
		ignore: ignore
	});

	const pa11yTestRun = denodeify(test.run.bind(test));

	return pa11yTestRun(src)
		.then(results => {
			require('colors');
			const errors = results.filter(result => result.type === 'error')
				.map(result => '\n' +
					' • Error: ' + result.message.white +
					'\n' +
					('   ├── ' + result.code +
						'\n' +
						'   ├── ' + result.selector.replace(/\s+/g, ' ') +
						'\n' +
						'   └── ' + result.context.replace(/\s+/g, ' ')).grey
				);

			if (results.some(result => result.type === 'error')) {
				throw new Error(errors.join('\n') + '\nFailed Pa11y tests');
			}

			return results;
		});
};

module.exports = function (cfg) {
	const config = cfg || {};
	config.cwd = config.cwd || process.cwd();

	return {
		title: 'Executing Pa11y',
		task: () => pa11yTest(config),
		skip: function () {
			return fileExists(path.join(config.cwd, '/demos/local/pa11y.html'))
				.then(exists => {
					if (!exists) {
						return `No Pa11y demo found. To run Pa11y against this project, create a file at ${path.join(config.cwd, '/demos/local/pa11y.html')}`;
					}
				});
		}
	};
};
