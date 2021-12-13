/** @type {import('@jest/types').Config} */
module.exports = {
	// preset: 'ts-jest',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	// globals: {
	// 	'ts-jest': {
	// 		tsConfig: 'tsconfig.test.json'
	// 	}
	// },
	moduleNameMapper: {
		'^@monopacker/(.*)$': './packages/$1/src'
	},
	transform: {}
	// transform: {
	// 	'^.+\\.tsx?$': 'ts-jest',
	// 	'node_modules/@monopacker/.+\\.(j|t)sx?$': 'ts-jest'
	// }
};
