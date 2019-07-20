// ----------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
const xtend = require('xtend')

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

// ----------------------------------------------------------------------------

let cfg = null

if (process.argv[2] === 'init') {
  cfg = CFG_DEFAULTS
} else {
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
}

// ----------------------------------------------------------------------------

module.exports = cfg

// ----------------------------------------------------------------------------
