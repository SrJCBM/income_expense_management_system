#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

delete process.env.ELECTRON_RUN_AS_NODE;

const cypressRoot = path.dirname(require.resolve('cypress/package.json'));
const cypressBin = path.join(cypressRoot, 'bin', 'cypress');
const args = [cypressBin, ...process.argv.slice(2)];

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
