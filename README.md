# monopacker
A tool for managing builds of monorepo frontend projects with eg. lerna or similar tools.

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
