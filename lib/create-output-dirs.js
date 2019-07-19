// --------------------------------------------------------------------------------------------------------------------

'use strict'

// core
var path = require('path')

// npm
var fmt = require('fmt')
var mkdirp = require('mkdirp')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createOutputDirs (ctx, callback) {
  fmt.title('Create Output Dirs ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      var dirname = path.join(ctx.cfg.distDir, url)
      mkdirp(dirname, done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
