// --------------------------------------------------------------------------------------------------------------------

// npm
var fsExtra = require('fs-extra')

// local
var fmt = require('../fmt.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function copyStaticFilesToHtml (ctx, callback) {
  fmt.arrow('Copy Static Files to Html')

  // make sure the staticDir exists
  fsExtra.stat(ctx.cfg.staticDir, function (err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        // no error if it doesn't exist - just don't copy any files
        fmt.msg('No static dir exists.', true)
        fmt.spacer()
        return process.nextTick(callback)
      }
      return callback(err)
    }

    // if this isn't a directory, then it's an error
    if (!stats.isDirectory()) {
      return callback(new Error(ctx.cfg.staticDir + ' is not a directory'))
    }

    // the directory exists, process it as normal
    fsExtra.copy(ctx.cfg.staticDir, ctx.cfg.distDir, err => {
      if (err) return callback(err)
      fmt.msg('Done.', true)
      fmt.spacer()
      callback()
    })
  })
}

// --------------------------------------------------------------------------------------------------------------------
