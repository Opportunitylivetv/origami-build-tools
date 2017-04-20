const process = require('process');

const webpackConfig = require('./webpack.config.dev');

// https://github.com/webpack/webpack/issues/3324#issuecomment-289720345
delete webpackConfig.bail;

module.exports = {

	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: false,

	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: process.cwd(),

	browserDisconnectTimeout: 60 * 1000, // default 2000
	browserDisconnectTolerance: 3, // default 0
	browserNoActivityTimeout: 60 * 1000, // default 10000

	// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
	browsers: ['PhantomJS'],

	captureTimeout: 60 * 2000, // default 60000,

	// enable / disable colors in the output (reporters and logs)
	colors: true,

	concurrency: 1, // default Infinity,

	// list of files to exclude
	exclude: [],

	// list of files / patterns to load in the browser
	files: [
		'test/*.test.js'
	],

	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['mocha', 'sinon'],

	plugins: [
		'karma-mocha',
		'karma-sinon',
		'karma-phantomjs-launcher',
		'karma-webpack',
		'karma-browserstack-launcher',
		'karma-sourcemap-loader'
	],

	// web server port
	port: 9876,

	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
		'test/*.test.js': ['webpack', 'sourcemap']
	},

	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['dots'],

	// Continuous Integration mode
	// if true, Karma captures browsers, runs the tests and exits
	singleRun: true,

	webpack: webpackConfig,

	// Hide webpack output logging
	webpackMiddleware: {
		noInfo: true
	}

};