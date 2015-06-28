// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var fs = require('graceful-fs')
var fmt = require('fmt')
var jade = require('jade')
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function loadUpJadeViews(ctx, callback) {
  fmt.title('Load Up Jade Views ...')
  var viewNames = [ 'index', 'page', 'post', 'archive' ]

  async.eachSeries(
    viewNames,
    function(name, done) {
      var filename = path.join(ctx.cfg.viewDir, name + '.jade')

      if ( !fs.existsSync(filename)) {
        // this view is not found
        console.warn('View ' + name + ' template does not exist')
        process.exit(2)
      }

      ctx.view[name] = jade.compileFile(filename, {
        filename : filename,
        pretty   : ctx.cfg.pretty || false,
      })

      done()
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
