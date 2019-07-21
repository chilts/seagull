// --------------------------------------------------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
const test = require('tape')

// local
const cfg = require('../lib/cfg.js')
const seagull = require('..')

// --------------------------------------------------------------------------------------------------------------------

test('rebuild this site', function (t) {
  const opts = {
    stream: fs.createWriteStream('/dev/null')
  }

  // pass the config to seagull
  seagull(opts, cfg, function (err) {
    t.plan(2)
    t.ok(!err, 'No error occurred when building the site')
    t.pass('Site built without error')
  })
})

// --------------------------------------------------------------------------------------------------------------------
