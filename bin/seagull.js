#!/usr/bin/env node
// ----------------------------------------------------------------------------

// local
const init = require('../cmd/init.js')
const build = require('../cmd/build.js')
const serve = require('../cmd/serve.js')

// ----------------------------------------------------------------------------
// setup

const command = {
  init,
  build,
  serve
}

// ----------------------------------------------------------------------------
// run

const cmd = process.argv[2]

if (cmd in command) {
  command[cmd](process.argv.slice(3))
} else {
  if (cmd) {
    console.warn(`seagull: unknown command: '${cmd}'`)
  } else {
    console.warn(`seagull: provide a command`)
  }
  process.exit(2)
}

// ----------------------------------------------------------------------------
