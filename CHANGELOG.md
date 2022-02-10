# [2.0.0-rc.0](https://github.com/janbiasi/monopacker/compare/v2.1.0...v2.0.0-rc.0) (2020-01-30)


### Bug Fixes

* 🐛 CLI API for the new changes ([50ebc54](https://github.com/janbiasi/monopacker/commit/50ebc54))
* 🐛 CLI flag supply ([35ba288](https://github.com/janbiasi/monopacker/commit/35ba288))


### Code Refactoring

* 💡 use npm pack instead of copy ([de60f20](https://github.com/janbiasi/monopacker/commit/de60f20))


### Features

* 🎸 add the possibility to generate an installer file ([7c4ddd3](https://github.com/janbiasi/monopacker/commit/7c4ddd3))
* 🎸 detect cyclical dependencies, via CLI and before pack ([0ff3b37](https://github.com/janbiasi/monopacker/commit/0ff3b37))
* 🎸 improve quality with tests ([738d742](https://github.com/janbiasi/monopacker/commit/738d742))
* improve tests and quality ([205a5a3](https://github.com/janbiasi/monopacker/commit/205a5a3))


### Performance Improvements

* ⚡️ use NPM pack for a subset of internal modules ([b402453](https://github.com/janbiasi/monopacker/commit/b402453))


### BREAKING CHANGES

* pack strategy changed from copy to npm pack



## [2.0.1](https://github.com/janbiasi/monopacker/compare/v2.0.0...v2.0.1) (2019-07-12)


### Bug Fixes

* 🐛 catch invalid lerna packages by default ([1dff97f](https://github.com/janbiasi/monopacker/commit/1dff97f)), closes [#2](https://github.com/janbiasi/monopacker/issues/2)
* 🐛 catch null packages in lerna cycle ([6443cc8](https://github.com/janbiasi/monopacker/commit/6443cc8))



# [2.0.0](https://github.com/janbiasi/monopacker/compare/v1.0.0...v2.0.0) (2019-07-12)


### Bug Fixes

* 🐛 add keywords and correct version definition ([30640c9](https://github.com/janbiasi/monopacker/commit/30640c9))
* 🐛 update version aggregation, update stage caching ([5f953ed](https://github.com/janbiasi/monopacker/commit/5f953ed))


### BREAKING CHANGES

* Use static version for packer instead of package to break packed apps
programmatically



# [1.0.0](https://github.com/janbiasi/monopacker/compare/4f47e6e...v1.0.0) (2019-07-12)


### Bug Fixes

* 🐛 integrity hash calculation updated to exclude paths ([cabfd33](https://github.com/janbiasi/monopacker/commit/cabfd33))


### Features

* implement programmatic API for lerna packing ([4f47e6e](https://github.com/janbiasi/monopacker/commit/4f47e6e))
* **adapter:** introduce adapters instead of static analytics ([dcef0ec](https://github.com/janbiasi/monopacker/commit/dcef0ec))
* **analyze:** add fully recursive support ([1f6809c](https://github.com/janbiasi/monopacker/commit/1f6809c))
* **cli:** add CLI implementation ([27eb090](https://github.com/janbiasi/monopacker/commit/27eb090))
* **debug:** prepare for debug mode and verbosity ([4cdf6c5](https://github.com/janbiasi/monopacker/commit/4cdf6c5))



