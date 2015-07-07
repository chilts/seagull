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
fs.readFile(configFilename, 'utf8', function(errReadFile, data) {
  if (errReadFile) {
    /* eslint no-process-exit: 0 */
    console.warn('Error opening file: ' + errReadFile)
    process.exit(2)
  }

  var cfg
  try {
    cfg = JSON.parse(data)
  }
  catch (errJsonParse) {
    /* eslint no-process-exit: 0 */
    console.warn('Error parsing config: ' + errJsonParse)
    process.exit(2)
  }

  // pass the config to seagull
  seagull(cfg, function(err) {
    if (err) throw err
    console.log('Finished')
  })
})

// ------------------------------------------------------------------------------------------------------------------
