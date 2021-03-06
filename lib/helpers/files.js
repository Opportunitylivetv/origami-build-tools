'use strict';

const fs = require('fs-extra');
const path = require('path');
const denodeify = require('denodeify');
const deglob = denodeify(require('deglob'));

const fileExists = (file) => denodeify(fs.open)(file, 'r').then(() => true).catch(() => false);
const readFile = denodeify(fs.readFile);

function getBuildFolderPath(cwd) {
	cwd = cwd || process.cwd();
	return path.join(cwd, '/build/');
}

function requireIfExists(filePath) {
	return fileExists(filePath)
		.then(exists => {
			if (exists) {
				return readFile(filePath, 'utf-8')
					.then(file => {
						return JSON.parse(file);
					});
			} else {
				return undefined;
			}
		});
}

function getPackageJson(cwd) {
	cwd = cwd || process.cwd();
	return requireIfExists(path.join(cwd, '/package.json'));
}

function packageJsonExists(cwd) {
	return fileExists(path.join(cwd || process.cwd(), '/package.json'));
}

function getBowerJson(cwd) {
	cwd = cwd || process.cwd();
	return requireIfExists(path.join(cwd, '/bower.json'));
}

function bowerJsonExists(cwd) {
	return fileExists(path.join(cwd || process.cwd(), '/bower.json'));
}

function getMainSassPath(cwd) {
	cwd = cwd || process.cwd();
	const sassMainPath = path.join(cwd, '/main.scss');
	let isInBowerMain = false;
	return getBowerJson(cwd)
		.then(bowerJson => {
			if (bowerJson) {
				if (Array.isArray(bowerJson.main) && bowerJson.main.includes('main.scss')) {
					isInBowerMain = true;
				} else if (typeof bowerJson.main === 'string' && bowerJson.main === 'main.scss') {
					isInBowerMain = true;
				}
			}

			return fileExists(sassMainPath);
		})
		.then(sassExists => {
			if (isInBowerMain && !sassExists) {
				// This should probably throw an error
				// throw new Error('main.scss is listed in bower.json main, but file doesn\'t exist.');
			} else if (!isInBowerMain && sassExists) {
				// throw new Error('main.scss exists but is not listed in bower.json main.');
			}
			if (isInBowerMain && sassExists) {
				return sassMainPath;
			} else {
				return null;
			}
		});
}

function getMainJsPath(cwd) {
	cwd = cwd || process.cwd();
	const jsMainPath = path.join(cwd, '/main.js');
	let isInBowerMain = false;
	return getBowerJson(cwd)
		.then(bowerJson => {
			if (bowerJson) {
				if (Array.isArray(bowerJson.main) && bowerJson.main.includes('main.js')) {
					isInBowerMain = true;
				} else if (typeof bowerJson.main === 'string' && bowerJson.main === 'main.js') {
					isInBowerMain = true;
				}
			}

			return fileExists(jsMainPath);
		})
		.then(jsExists => {
			if (isInBowerMain && !jsExists) {
				// This should probably throw an error
				// throw new Error('main.js is listed in bower.json main, but file doesn\'t exist.');
			} else if (!isInBowerMain && jsExists) {
				// throw new Error('main.js exists but is not listed in bower.json main.');
			}
			if (isInBowerMain && jsExists) {
				return jsMainPath;
			} else {
				return null;
			}
		});
}

function getModuleName(cwd) {
	return getBowerJson(cwd)
		.then(bowerJson => {
			if (bowerJson) {
				return bowerJson.name;
			}
			return '';
		});
}

// List mustache files in a directory, recursing over subdirectories
function getMustacheFilesList(basePath) {
	const opts = {
		useGitIgnore: true,
		usePackageJson: false,
		cwd: basePath
	};

	return deglob(['**/**.mustache'], opts);
}

function getSassFilesList(cwd) {
	const opts = {
		useGitIgnore: true,
		usePackageJson: false,
		cwd: cwd || process.cwd()
	};

	return deglob(['**/**.scss', '**/**.sass'], opts);
}

function sassSupportsSilent(files, cwd) {
	let supportsSilent = false;
	return getModuleName(cwd)
		.then(moduleName => {
			if (moduleName) {
				return Promise.all(files.map(file => {
					return readFile(file, {
						encoding: 'utf-8'
					})
						.then(sass => {
							if (sass.includes(moduleName + '-is-silent')) {
								supportsSilent = true;
							}
						});
				}))
					.then(() => {
						return supportsSilent;
					});
			} else {
				throw new Error('Silent mode support can\'t be verified if your module name is not set in your bower.json file.');
			}
		});
}

module.exports.getBuildFolderPath = getBuildFolderPath;
module.exports.getMainSassPath = getMainSassPath;
module.exports.getMainJsPath = getMainJsPath;
module.exports.getPackageJson = getPackageJson;
module.exports.packageJsonExists = packageJsonExists;
module.exports.getBowerJson = getBowerJson;
module.exports.bowerJsonExists = bowerJsonExists;
module.exports.getModuleName = getModuleName;
module.exports.getSassFilesList = getSassFilesList;
module.exports.sassSupportsSilent = sassSupportsSilent;
module.exports.getMustacheFilesList = getMustacheFilesList;
