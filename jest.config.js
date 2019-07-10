module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	globals: {
		'ts-jest': {
			tsConfig: 'tsconfig.test.json'
		}
	},
	testPathIgnorePatterns: ['node_modules', 'temp', 'fixtures', 'build']
};
