// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var find = require('find')
var async = require('async')
var fs = require('graceful-fs')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function readAllContent (ctx, callback) {
  fmt.arrow('Reading All Content')

  // make sure the 'content' dir exists
  fs.stat(ctx.cfg.contentDir, function (errStat, stats) {
    if (errStat) {
      if (errStat.code === 'ENOENT') {
        // no error if it doesn't exist - just don't copy any files
        fmt.msg('Info: No content dir exists, not reading any files.', true)
        return process.nextTick(callback)
      }
      return callback(errStat)
    }

    // if this isn't a directory, then it's an error
    if (!stats.isDirectory()) {
      return callback(new Error(ctx.cfg.contentDir + ' is not a directory'))
    }

    fmt.spacer()
    fmt.msg('Filenames:', true)
    let count = 0
    find.file(ctx.cfg.contentDir, function (filenames) {
      // loop through each filename and read the contents
      async.eachSeries(
        filenames,
        function (filename, done) {
          // skip over backup files
          if (filename.match(/~$/)) {
            return done()
          }

          fmt.li(`${filename.substr(ctx.cfg.contentDir.length + 1)}`, true)
          count = count + 1
          fs.readFile(filename, 'utf8', function (errReadFile, data) {
            if (errReadFile) return done(errReadFile)

            var name = filename.substr(ctx.cfg.contentDir.length)
            ctx.file[name] = data

            done()
          })
        },
        function (err) {
          if (err) callback(err)
          fmt.spacer()
          fmt.msg(`Found ${count} files.`, true)
          fmt.spacer()
          callback()
        }
      )
    }).error(callback)
  })
}

// --------------------------------------------------------------------------------------------------------------------
