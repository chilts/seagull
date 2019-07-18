// --------------------------------------------------------------------------------------------------------------------

'use strict'

// core
var path = require('path')

// npm
var fs = require('graceful-fs')
var fmt = require('fmt')
var pug = require('pug')
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function loadUpPugViews (ctx, callback) {
  fmt.title('Load Up Pug Views ...')
  var viewNames = ['index', 'page', 'post', 'archive']

  viewNames = viewNames.concat(Object.keys(ctx.view))
  fmt.dump(viewNames, 'Required Views')

  async.eachSeries(
    viewNames,
    function (name, done) {
      var filename = path.join(ctx.cfg.viewDir, name + '.pug')

      if (!fs.existsSync(filename)) {
        // this view is not found
        return done(new Error('View ' + name + ' template does not exist'))
      }

      ctx.view[name] = pug.compileFile(filename, {
        filename: filename,
        pretty: ctx.cfg.pretty || false
      })

      done()
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
