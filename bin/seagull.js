#!/usr/bin/env node
// ------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fs = require('graceful-fs')

// local
var seagull = require('..')

// ------------------------------------------------------------------------------------------------------------------

// use either the filename passed in, or the default 'config.json' for the config
var configFilename = process.argv[2] || 'config.json'

// read the config file
var cfg = fs.readFileSync(configFilename, 'utf8')
cfg = JSON.parse(cfg)

// pass the config to seagull
seagull(cfg, function(err) {
  if (err) throw err
  console.log('Finished')
})

// ------------------------------------------------------------------------------------------------------------------
