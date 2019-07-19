// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var find = require('find')
var async = require('async')
var fs = require('graceful-fs')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function readAllContent (ctx, callback) {
  fmt.title('Read All Content ...')

  // make sure the 'content' dir exists
  fs.stat(ctx.cfg.contentDir, function (errStat, stats) {
    if (errStat) {
      if (errStat.code === 'ENOENT') {
        // no error if it doesn't exist - just don't copy any files
        return process.nextTick(callback)
      }
      return callback(errStat)
    }

    // if this isn't a directory, then it's an error
    if (!stats.isDirectory()) {
      return callback(new Error(ctx.cfg.contentDir + ' is not a directory'))
    }

    find.file(ctx.cfg.contentDir, function (filenames) {
      // loop through each filename and read the contents
      async.eachSeries(
        filenames,
        function (filename, done) {
          // skip over backup files
          if (filename.match(/~$/)) {
            return done()
          }

          fs.readFile(filename, 'utf8', function (errReadFile, data) {
            if (errReadFile) return done(errReadFile)

            var name = filename.substr(ctx.cfg.contentDir.length)
            ctx.file[name] = data

            done()
          })
        },
        function (err) {
          if (err) callback(err)
          callback()
        }
      )
    }).error(callback)
  })
}

// --------------------------------------------------------------------------------------------------------------------
