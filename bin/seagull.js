#!/usr/bin/env node
// ----------------------------------------------------------------------------

// local
const cfg = require('../lib/cfg.js')
const init = require('../cmd/init.js')
const build = require('../cmd/build.js')
const serve = require('../cmd/serve.js')
const watch = require('../cmd/watch.js')
const version = require('../cmd/version.js')

// ----------------------------------------------------------------------------
// setup

const command = {
  init,
  build,
  serve,
  watch,
  version
}

// ----------------------------------------------------------------------------
// run

const opts = {}
const cmd = process.argv[2]

if (cmd in command) {
  command[cmd](opts, cfg, process.argv.slice(3))
} else {
  if (cmd) {
    console.warn(`seagull: unknown command: '${cmd}'`)
  } else {
    console.warn(`seagull: provide a command`)
  }
  process.exit(2)
}

// ----------------------------------------------------------------------------
