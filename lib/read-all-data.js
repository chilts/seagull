// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var async = require('async')
var fs = require('graceful-fs')
var glob = require('glob')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function readAllData (ctx, callback) {
  fmt.arrow('Reading All Data')

  // make sure the 'data' dir exists
  fs.stat(ctx.cfg.dataDir, function (err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        // doesn't matter if the dir doesn't exist
        fmt.msg('No data dir exists.', true)
        fmt.spacer()
        return process.nextTick(callback)
      }
      return callback(err)
    }

    // if this isn't a directory, then it's an error
    if (!stats.isDirectory()) {
      return callback(new Error(ctx.cfg.filesDir + ' is not a directory'))
    }

    glob(`${ctx.cfg.dataDir}/*.json`, function (err, filenames) {
      if (err) {
        callback(err)
        return
      }

      if (filenames.length === 0) {
        fmt.msg(`No data files.`, true)
        fmt.spacer()
        callback()
        return
      }

      let count = 0
      fmt.spacer()
      fmt.msg('Filenames:', true)

      // loop through each filename and read the contents
      async.eachSeries(
        filenames,
        function (filename, done) {
          // console.log('Reading ' + filename)
          fs.readFile(filename, 'utf8', function (err, json) {
            if (err) {
              return done(err)
            }

            fmt.li(`${filename.substr(ctx.cfg.dataDir.length + 1)}`, true)
            count = count + 1

            const data = JSON.parse(json)
            const name = filename.substring(ctx.cfg.dataDir.length + 1, filename.length - 5)
            ctx.data[name] = data

            done()
          })
        },
        err => {
          if (err) return callback(err)
          fmt.spacer()
          fmt.msg(`Found ${count} files.`, true)
          fmt.spacer()
          callback()
        }

      )
    })
  })
}

// --------------------------------------------------------------------------------------------------------------------
