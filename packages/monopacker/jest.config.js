module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json'
		}
	},
	testPathIgnorePatterns: [
		'<rootDir>/node_modules',
		'<rootDir>/test/temp',
		'<rootDir>/test/fixtures',
		'<rootDir>/build',
		'packed'
	]
};
