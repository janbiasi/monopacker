// @ts-check

const { readdir } = require('fs');
const { resolve, join } = require('path');
const { exec } = require('child_process');

const ROOT = resolve(process.cwd());

/**
 * Get all packed dependencies from a monopacked package repository
 * @param {string} rootDir			Root path to the npm package
 * @returns {Promise<string[]>} 	List of files
 */
exports.getMonopackedDependencies = rootDir => {
	rootDir = resolve(rootDir);

	return new Promise((resolve, reject) => {
		readdir(rootDir, (err, files) => {
			if (err) {
				return reject(err);
			}
			resolve(files);
		});
	});
};

/**
 * Install a list of tarballs
 * @param {string[]} packedPaths	Path list of monopacker packed tarballs
 */
exports.installFromMonopackedTarballs = packedPaths => {
	return Promise.all(
		packedPaths.map(packedPath => {
			return new Promise((resolve, reject) => {
				exec(`npm install ${packedPath}`, (err, stdout, stderr) => {
					if (err) {
						return reject(stderr);
					}
					resolve(stdout);
				});
			});
		})
	);
};
