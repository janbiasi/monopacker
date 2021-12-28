export function sanitizePackageName(pkgName: string) {
	return pkgName.replace('@', '').replace('/', '-');
}
