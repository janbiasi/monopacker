import { validateConfig } from '../src/validator';

describe('validator', () => {
	it('should validate a valid config correctly', async () => {
		expect(() => validateConfig({ packs: [{ source: 'my-app' }] })).not.toThrow();
	});

	it('should validate a non-existent config correctly', async () => {
		expect(() => validateConfig(undefined as any)).toThrow('Monopacker configuration must be an object');
	});

	it('should validate an invalid config correctly (packs missing)', async () => {
		expect(() => validateConfig({})).toThrow('Monopacker configuration must contain a property "packs"');
	});

	it('should validate an invalid config correctly (no pack entries)', async () => {
		expect(() => validateConfig({ packs: [] })).toThrow('Monopacker packs setting must contain at least one entry');
	});
});
