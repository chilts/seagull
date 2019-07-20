// ----------------------------------------------------------------------------

// local
const seagull = require('..')

// ----------------------------------------------------------------------------
// build

function build (cfg, args) {
  // pass the config to seagull
  seagull(cfg, err => {
    if (err) throw err
    console.log('Finished')
  })
}

// ----------------------------------------------------------------------------

module.exports = build

// ----------------------------------------------------------------------------
