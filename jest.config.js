/** @type {import('@jest/types').Config} */
module.exports = {
	testEnvironment: 'node',
	moduleNameMapper: {
		'^@monopacker/(.*)$': '<rootDir>/packages/$1/src'
	},
	modulePathIgnorePatterns: ['fixtures']
};
