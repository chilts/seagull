#!/usr/bin/env node
// ----------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
var xtend = require('xtend')

// local
const init = require('../cmd/init.js')
const build = require('../cmd/build.js')
const serve = require('../cmd/serve.js')

// ----------------------------------------------------------------------------
// setup

const configFilename = 'config.json'
const CFG_DEFAULTS = {
  postsPerPage: 10,
  viewDir: 'views',
  contentDir: 'content',
  dataDir: 'data',
  staticDir: 'static',
  distDir: 'dist',
  includeDrafts: false,
  includeFutures: false
}

const command = {
  init,
  build,
  serve
}

// ----------------------------------------------------------------------------
// run

let cfg = null
const cmd = process.argv[2]

if (cmd === 'init') {
    cfg = CFG_DEFAULTS
} else {
  // read the config file
  const data = fs.readFileSync(configFilename, 'utf8')

  try {
    cfg = JSON.parse(data)
    cfg = xtend({}, CFG_DEFAULTS, cfg)
    console.log('cfg:', cfg)
  } catch (errJsonParse) {
    /* eslint no-process-exit: 0 */
    console.warn('Error parsing config: ' + errJsonParse)
    process.exit(2)
  }
}

if (cmd in command) {
  command[cmd](cfg, process.argv.slice(3))
} else {
  if (cmd) {
    console.warn(`seagull: unknown command: '${cmd}'`)
  } else {
    console.warn(`seagull: provide a command`)
  }
  process.exit(2)
}

// ----------------------------------------------------------------------------
