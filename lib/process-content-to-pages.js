// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var fmt = require('fmt')
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function processContentToPages(ctx, callback) {
  fmt.title('Process Content to Pages ...')

  var filenames = Object.keys(ctx.file)

  async.each(
    filenames,
    function(filename, done) {

      // split for the meta information at the top
      var data = ctx.file[filename]
      var split = data.split(/\n---\n/, 2)
      var meta = JSON.parse(split[0])
      var content = split[1] || ''

      // check the meta.published to see if this is a draft, a future or neither
      meta.published = meta.published ? new Date(meta.published) : false

      // check to see if this is a future
      if ( meta.published ) {
        // see if this is to be published in the future
        if ( meta.published > new Date() ) {
          // this is a future - check to see if we're allowing futures
          if ( !ctx.cfg.includeFutures ) {
            // not including futures this time
            return done()
          }
        }
      }
      else {
        // this is a draft - check to see if we're allowing drafts
        if ( !ctx.cfg.includeDrafts ) {
          // not including drafts this time
          return done()
        }
      }

      // make sure this page/post has a type
      if ( !meta.type ) {
        console.error('Error: file does not have a type: ' + filename)
        process.exit(2)
      }

      var ext = path.extname(filename).substr(1)
      var name = filename.substr(0, filename.length - ext.length - 1)

      // save all this info into the ctx.page
      ctx.page[name] = {
        name      : name + '.html',
        meta      : meta,
        title     : meta.title,
        type      : meta.type,
        filetype  : ext,
        published : meta.published,
        content   : content,
      }

      done()
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
