// ----------------------------------------------------------------------------

// local
const pkg = require('../package.json')

// ----------------------------------------------------------------------------
// init

function version (opts, cfg, args) {
  console.log(`seagull v${pkg.version}`)
}

// ----------------------------------------------------------------------------

module.exports = version

// ----------------------------------------------------------------------------
