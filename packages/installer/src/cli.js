#!/usr/bin/env node
// @ts-check
'use strict';

const { resolve } = require('path');
const { getMonopackedDependencies, installFromMonopackedTarballs } = require('./utils');

const ROOT = resolve(process.cwd());

getMonopackedDependencies(ROOT)
	.then(monopackedTarballs => {
		console.log(`Monopacker installer found ${monopackedTarballs.length} package(s)`);
		installFromMonopackedTarballs(monopackedTarballs)
			.then(stdout => {
				console.log(`Monopacker installer installed ${monopackedTarballs.length} package(s)`);
			})
			.catch(reason => {
				console.log(`Monopacker installer failed because of ${reason}`);
			});
	})
	.catch(reason => {
		console.log(`Monopacker installer failed because of ${reason}`);
	});
