// @ts-check

module.exports = {
	preset: 'ts-jest',
	verbose: true,
	resetModules: true,
	bail: 1,
	testEnvironment: 'node',
	maxConcurrency: 1,
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json'
		}
	},
	testPathIgnorePatterns: [
		'<rootDir>/node_modules',
		'<rootDir>/test/fixtures',
		'<rootDir>/build',
		'fixtures',
		'temp',
		'monopacked'
	],
	testResultsProcessor: './node_modules/jest-html-reporter'
};
