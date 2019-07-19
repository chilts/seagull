// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var async = require('async')
var fs = require('graceful-fs')
var glob = require('glob')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function readAllData (ctx, callback) {
  fmt.title('Read All Data ...')

  console.log('ctx.cfg.dataDir:' + ctx.cfg.dataDir)

  // make sure the 'data' dir exists
  fs.stat(ctx.cfg.dataDir, function (err, stats) {
    console.log('err:' + err)
    console.log('stats:', stats)
    if (err) {
      if (err.code === 'ENOENT') {
        // doesn't matter if the dir doesn't exist
        return process.nextTick(callback)
      }
      return callback(err)
    }

    // if this isn't a directory, then it's an error
    if (!stats.isDirectory()) {
      return callback(new Error(ctx.cfg.filesDir + ' is not a directory'))
    }

    glob(`${ctx.cfg.dataDir}/*.json`, function (err, filenames) {
      console.log('filenames:', filenames)
      if (err) {
        callback(err)
        return
      }

      // loop through each filename and read the contents
      async.eachSeries(
        filenames,
        function (filename, done) {
          console.log('Reading ' + filename)
          fs.readFile(filename, 'utf8', function (err, json) {
            if (err) {
              return done(err)
            }
            console.log('JSON: ' + json)

            const data = JSON.parse(json)
            const name = filename.substring(ctx.cfg.dataDir.length + 1, filename.length - 5)
            console.log('**** name=' + name)
            ctx.data[name] = data

            done()
          })
        },
        callback
      )
    })
  })
}

// --------------------------------------------------------------------------------------------------------------------
