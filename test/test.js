// --------------------------------------------------------------------------------------------------------------------

// npm
const test = require('tape')

// local
const cfg = require('../lib/cfg.js')
const seagull = require('..')

// --------------------------------------------------------------------------------------------------------------------

test('rebuild this site', function (t) {
  // pass the config to seagull
  seagull({}, cfg, function (err) {
    t.plan(2)
    t.ok(!err, 'No error occurred when building the site')
    t.pass('Site built without error')
  })
})

// --------------------------------------------------------------------------------------------------------------------
