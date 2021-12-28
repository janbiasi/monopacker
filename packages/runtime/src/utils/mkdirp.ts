import { promises as fs } from 'fs';

export async function mkdirp(dir: string) {
	try {
		await fs.mkdir(dir, { recursive: true });
	} catch (err) {
		if (err && (err as any).code !== 'EEXIST') {
			// nothing to do, directory already exists
		}

		throw err;
	}
}
