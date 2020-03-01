#!/usr/bin/env node
// ----------------------------------------------------------------------------

// npm
const yargs = require('yargs')

// local
const config = require('../lib/config.js')
const init = require('../cmd/init.js')
const build = require('../cmd/build.js')
const serve = require('../cmd/serve.js')
const watch = require('../cmd/watch.js')
const version = require('../cmd/version.js')

// ----------------------------------------------------------------------------
// setup

const args = yargs.argv

const command = {
  init,
  build,
  serve,
  watch,
  version
}

const loadConfig = {
  init: false,
  build: true,
  serve: true,
  watch: true,
  version: false
}

// ----------------------------------------------------------------------------
// run

const opts = {
  // ToDo: ... !!!
}
const configFilename = args.config || args.c || 'seagull.json'
const cmd = args._[0]

// read the config file
;(async function () {
  const cfg = await config.load(configFilename, !loadConfig[cmd])

  if (cmd in command) {
    await command[cmd](opts, cfg, args._.slice(1))
  } else {
    if (cmd) {
      console.warn(`seagull: unknown command: '${cmd}'`)
    } else {
      console.warn('seagull: provide a command')
    }
    process.exit(2)
  }
})()

// ----------------------------------------------------------------------------
