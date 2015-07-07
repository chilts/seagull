// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var fsExtra = require('fs-extra')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function copyStaticFilesToHtml(ctx, callback) {
  fmt.title('Copy Static Files to Html ...')
  fsExtra.copy(ctx.cfg.fileDir, ctx.cfg.htmlDir, callback)
}

// --------------------------------------------------------------------------------------------------------------------
