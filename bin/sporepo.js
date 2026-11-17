#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Resolve path to compiled CLI in dist
let cliPath = path.join(__dirname, '..', 'dist', 'src', 'cli.js');
if (!fs.existsSync(cliPath)) {
  cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
}

if (!fs.existsSync(cliPath)) {
  console.error('\x1b[31m[sporepo] Error: Compiled CLI not found.\x1b[0m');
  console.error('Silakan jalankan "npm run build" terlebih dahulu sebelum menjalankan sporepo.');
  process.exit(1);
}

const { run } = require(cliPath);
run(process.argv.slice(2));
