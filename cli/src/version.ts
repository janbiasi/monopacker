import path from 'path';

export function getVersion() {
	const pkg = require(path.join(__dirname, '../package.json'));
	return pkg.version;
}
