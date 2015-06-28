#!/usr/bin/env node
// ------------------------------------------------------------------------------------------------------------------

// npm
var fs = require('graceful-fs')

// local
var seagull = require('..')

// ------------------------------------------------------------------------------------------------------------------

// read the config file
var configFilename = 'config.json'
var cfg = fs.readFileSync(configFilename, 'utf8')
cfg = JSON.parse(cfg)

// pass it to seagull

seagull(cfg, function(err) {
  console.log('Finished')
})

// ------------------------------------------------------------------------------------------------------------------
