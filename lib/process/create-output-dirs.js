// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var fmt = require('fmt')
var mkdirp = require('mkdirp')

// local
var visitEveryDir = require('../visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createOutputDirs (ctx, callback) {
  fmt.arrow('Create Output Dirs ...')
  fmt.spacer()

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      var dirname = path.join(ctx.cfg.distDir, url)
      fmt.field(`Path=${url}`, `Dir=${dirname}`, true)
      mkdirp(dirname, done)
    },
    err => {
      if (err) return callback(err)
      fmt.spacer()
      callback()
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
