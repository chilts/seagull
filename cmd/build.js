// ----------------------------------------------------------------------------

// core
const fs = require('fs')

// local
const seagull = require('..')

// ----------------------------------------------------------------------------
// setup

const configFilename = 'config.json'

// ----------------------------------------------------------------------------
// build

function build (args) {
  // read the config file
  const data = fs.readFileSync(configFilename, 'utf8')

  let cfg
  try {
    cfg = JSON.parse(data)
  } catch (errJsonParse) {
    /* eslint no-process-exit: 0 */
    console.warn('Error parsing config: ' + errJsonParse)
    process.exit(2)
  }

  // pass the config to seagull
  seagull(cfg, err => {
    if (err) throw err
    console.log('Finished')
  })
}

// ----------------------------------------------------------------------------

module.exports = build

// ----------------------------------------------------------------------------
