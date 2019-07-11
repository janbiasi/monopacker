# monopacker
A tool for managing builds of monorepo frontend projects with eg. lerna or similar tools.

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

### pack
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

const ROOT = resolve(__dirname, '..');

(async () => {
    new Packer({
        root: resolve(ROOT, 'packages/apps/my-app'),
        target: resolve(ROOT, 'packed/my-app'),
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
