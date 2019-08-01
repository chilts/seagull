// --------------------------------------------------------------------------------------------------------------------

// npm
var fsExtra = require('fs-extra')
var fmt = require('../fmt.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function cleanHtmlDir (ctx, callback) {
  fmt.arrow('Cleaning Distribution Dir')
  fsExtra.emptyDir(ctx.cfg.distDir, err => {
    if (err) return callback(err)
    fmt.msg('Done.', true)
    fmt.spacer()
    callback()
  })
}

// --------------------------------------------------------------------------------------------------------------------
