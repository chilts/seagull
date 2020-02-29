// ----------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
const xtend = require('xtend')

// ----------------------------------------------------------------------------
// setup

const loadConfig = {
  init: false,
  build: true,
  serve: true,
  watch: true,
  version: false
}

const configFilename = 'config.json'

const CFG_DEFAULTS = {
  protocol: 'https',
  postsPerPage: 10,
  viewDir: 'views',
  contentDir: 'content',
  dataDir: 'data',
  staticDir: 'static',
  distDir: 'dist',
  includeDrafts: false,
  includeFutures: false
}

// ----------------------------------------------------------------------------

let cfg = null
const cmd = process.argv[2]

if (loadConfig[cmd]) {
  // read the config file
  const data = fs.readFileSync(configFilename, 'utf8')

  try {
    cfg = JSON.parse(data)
    cfg = xtend({}, CFG_DEFAULTS, cfg)
    // console.log('cfg:', cfg)
  } catch (errJsonParse) {
    /* eslint no-process-exit: 0 */
    console.warn('Error parsing config: ' + errJsonParse)
    process.exit(2)
  }
} else {
  cfg = CFG_DEFAULTS
}

// ----------------------------------------------------------------------------

module.exports = cfg

// ----------------------------------------------------------------------------
