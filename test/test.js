// --------------------------------------------------------------------------------------------------------------------

'use strict'

// core
var fs = require('fs')

// npm
var test = require('tape')

// local
var seagull = require('..')

// --------------------------------------------------------------------------------------------------------------------

test('rebuild the average site', function (t) {
  // use either the filename passed in, or the default 'config.json' for the config
  var configFilename = 'config.json'

  // read the config file
  var cfg = fs.readFileSync(configFilename, 'utf8')
  cfg = JSON.parse(cfg)

  // pass the config to seagull
  seagull(cfg, function (err) {
    t.plan(2)
    t.ok(!err, 'No error occurred when building the site')
    t.pass('Site built without error')
  })
})

// --------------------------------------------------------------------------------------------------------------------
