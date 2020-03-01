// --------------------------------------------------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
const test = require('tape')

// local
const config = require('../lib/config.js')
const seagull = require('../lib/seagull.js')

// --------------------------------------------------------------------------------------------------------------------

test('rebuild this site', async function (t) {
  try {
    t.plan(1)

    const opts = {
      stream: fs.createWriteStream('/dev/null')
    }
    const cfg = await config.load('seagull.json')

    // pass the config to seagull
    await seagull(opts, cfg)
    t.pass('Site built without error')
    t.end()
  } catch (err) {
    t.fail('Error occurred when loading the config file')
  }
})

// --------------------------------------------------------------------------------------------------------------------
