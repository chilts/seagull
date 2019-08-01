// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var fs = require('graceful-fs')
var pug = require('pug')
var async = require('async')

// local
var fmt = require('../fmt.js')

// --------------------------------------------------------------------------------------------------------------------

const defaultViewNames = ['index', 'page', 'post', 'archive']

module.exports = function loadUpPugViews (ctx, callback) {
  fmt.arrow('Loading Up Templates')
  fmt.spacer()
  fmt.msg('Types/Filenames:', true)

  const viewNames = defaultViewNames.concat(Object.keys(ctx.view))

  async.eachSeries(
    viewNames,
    function (name, done) {
      fmt.li(`${name} (${name}.pug)`, true)
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
    err => {
      if (err) return callback(err)
      fmt.spacer()
      callback()
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
