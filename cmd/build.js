// ----------------------------------------------------------------------------

// local
const seagull = require('../lib/seagull.js')

// ----------------------------------------------------------------------------
// build

async function build (opts, cfg, args) {
  console.log('right here')
  // pass the `opts` and `cfg` to seagull (`seagull()` does nothing with `args`)
  return seagull(opts, cfg)
}

// ----------------------------------------------------------------------------

module.exports = build

// ----------------------------------------------------------------------------
