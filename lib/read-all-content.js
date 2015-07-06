// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var find = require('find')
var async = require('async')
var fs = require('graceful-fs')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function readAllContent(ctx, callback) {
  fmt.title('Read All Content ...')

  find.file(ctx.cfg.contentDir, function(filenames) {

    // loop through each filename and read the contents
    async.eachSeries(
      filenames,
      function(filename, done) {
        // skip over backup files
        if ( filename.match(/~$/) ) {
          return done()
        }

        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) return done(err)

          var name = filename.substr(ctx.cfg.contentDir.length)
          ctx.file[name] = data

          done()
        })
      },
      function(err) {
        if (err) callback(err)
        callback()
      }
    )
  }).error(callback)
}

// --------------------------------------------------------------------------------------------------------------------
