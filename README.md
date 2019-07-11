# monopacker
A tool for managing builds of monorepo frontend projects with eg. lerna or similar tools. Developers who are working within 
monorepositories often have the problem that they need to deploy an application but don't want to deploy the whole repository.
This is not possible by default, but there's monopacker - a tool for generating small bundles out of your monorepository applications which are straight deployable - with extras!

* [Installation](#installation)
* [CLI API](#cli-api)
* [Programmatic API](#programmatic-api)

###### The process steps in depth

1. Aggregate all dependencies of the target application
2. Detect which dependencies come from NPM and which are located in the repo
3. Clone the target (only needed files, customizable) to the new target
4. Create an artificial `package.json` with installable dependencies from the project, including the needed production dependencies from the internal dependencies (eg. main app (`A`) requires `B` and `B` requires `express` so express will also be a dependencies of the packed application, quite smart huh?)
5. Install all possible dependencies from NPM
6. Copy all needed submodules to the packed target to "fake" the installation
7. Done! Your application is ready to deploy individually as it is.

###### But I need to _&lt;insert your requirement here&gt;_ ...
- Monopacker provides a flexible programmatical API
- Monopacker provides also a CLI implementation
- Monopacker supports a hook system where you are able to interact within every step of the packing process
- Monopacker can be configured what to copy and what not
- Monopacker supports internal caching for repetetive processes and large repos with circular references

## Installation

```sh
npm install monopacker --save-dev --save-exact
# or with yarn
yarn add monopacker --dev
```

## CLI API

> **Note**: the CLI does not support hooks! If you want to inject side-effects please use the [programmatic API](#programmatic-api)

### analyze
| Option             | Short      | Default              | Description                                 |
|--------------------|------------|----------------------|---------------------------------------------|
| `--root`           | `-r`       | `process.cwd()`      | Set the root directory for the process      |


```sh
# Will output a JSON graph of the packable application
$ monopacker analyze packages/apps/main
```

### pack
| Option             | Short      | Default              | Description                                 |
|--------------------|------------|----------------------|---------------------------------------------|
| `--root`           | `-r`       | `process.cwd()`      | Set the root directory for the process      |
| `--copy`           | `-c`       | `**,!package.json`   | Globs for what to copy initiall to the target, comma separated |
| `--noCache`        | `-nc`      | `false`              | Disable all caching mechanisms              |
| `--adapter`        | `-a`       | `lerna`              | Select a certain adapter for processing, we only support lerna atm. |

```sh
# Will pack the application from `packages/apps/main` to `packed`
$ monopacker pack packages/apps/main
```

```sh
# Will pack the application from `packages/apps/main` to `deploy/main-app`
$ monopacker pack packages/apps/main deploy/main-app
```

```sh
# Will pack a remote application from `packages/apps/main` to `deploy/main-app`
$ monopacker pack packages/apps/main deploy/main-app --root ../another-app
$ monopacker pack packages/apps/main deploy/main-app -r ../another-app
```

```sh
# Will not copy anything initially
$ monopacker pack packages/apps/main --copy !**
$ monopacker pack packages/apps/main -c !**
```

```sh
# Force use the lerna strategy
$ monopacker pack packages/apps/main --adapter lerna
$ monopacker pack packages/apps/main -a lerna
```

```sh
# Without caching
$ monopacker pack packages/apps/main --noCache
$ monopacker pack packages/apps/main -nc
```

```sh
# Complex example
$ monopacker pack packages/main packed/main --root ./test/fixtures/basic/ --noCache --copy src,dist -a lerna
```

## Programmatic API

### Options

```ts
interface IPackerOptions {
	/**
	 * Source to pack (root is cwd)
	 */
	source: string;
	/**
	 * Target for the packed app (root is cwd)
	 */
	target: string;
	/**
	 * Monorepository type, at the moment only lerna support.
	 * Default: auto-detected
	 */
	type?: 'lerna' | 'nx';
	/**
	 * Enable or disable the cache, default is true (enabled)
	 */
	cache?: boolean;
	/**
	 * Working directory, can be changed, default: process.cwd()
	 */
	cwd?: string;
	/**
	 * Expressions to match package names which are internally defined (optional)
	 * Can be used for eg. rewriting globally available modules such as 'react-scripts'
	 * to provide a custom implementation for.
	 */
	internals?: string[];
	/**
	 * The adapter for the analytics process, default: lerna
	 */
	adapter?: IAdapterConstructable;
	/**
	 * Optional copy settings, defaults to `['**', '!package.json', ...]`
	 */
	copy?: string[];
	/**
	 * Define opt-in hooks for certain steps
	 */
	hooks?: Partial<{
		[HookPhase.INIT]: Array<(packer: Packer) => Promise<any>>;
		[HookPhase.PREANALYZE]: Array<(packer: Packer) => Promise<any>>;
		[HookPhase.POSTANALYZE]: Array<
			(
				packer: Packer,
				information: {
					analytics: IAnalytics;
					generateAnalyticsFile: boolean;
					fromCache: boolean;
				}
			) => Promise<any>
		>;
		[HookPhase.PRECOPY]: Array<(packer: Packer) => Promise<any>>;
		[HookPhase.POSTCOPY]: Array<(packer: Packer, copiedFiles: string[]) => Promise<any>>;
		[HookPhase.PRELINK]: Array<(packer: Packer, entries: ILernaPackageListEntry[]) => Promise<any>>;
		[HookPhase.POSTLINK]: Array<(packer: Packer, entries: ILernaPackageListEntry[]) => Promise<any>>;
		[HookPhase.PREINSTALL]: Array<(packer: Packer, artificalPkg: ArtificalPackage) => Promise<any>>;
		[HookPhase.POSTINSTALL]: Array<(packer: Packer, artificalPkg: ArtificalPackage) => Promise<any>>;
		[HookPhase.PACKED]: Array<
			(
				packer: Packer,
				resume: {
					analytics: IAnalytics;
					artificalPackage: ArtificalPackage;
					copiedFiles: string[];
				}
			) => Promise<any>
		>;
	}>;
}
```

### Simple example

```ts
import { Packer } from 'monopacker';

new Packer({
    root: 'packages/apps/my-app',
    target: 'packed/my-app',
}).pack();
```


### Advanced example

```ts
import { resolve } from 'path';
import * as rimraf from 'rimraf';
import * as execa from 'execa';
import { Packer } from 'monopacker';

(async () => {
    new Packer({
        cwd: resolve(__dirname, 'my-repo-is-nested'),
        source: 'packages/apps/my-app',
        target: 'packed/my-app',
        copy: [
            '!.cache',
            '!lcov-report',
            '!.gitignore',
            '!tsconfig.json',
            '!README.md',
            '!junit.xml',
            '!jest.config.js'
        ],
        hooks: {
            init: [
                async () => {
                    await execa('npm', ['run', 'build']);
                },
            ],
            precopy: [
                async packer => {
                    // create a production build before copying things
                    await packer.runInSourceDir('npm', ['run', 'build', '--production']);
                }
            ]
        }
    });

    await packer.pack();
    
    console.log('done!');
})();q
```
