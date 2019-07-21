// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var fmt = require('fmt')
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function processContentToPages (ctx, callback) {
  fmt.arrow('Processing Content to Pages')
  fmt.spacer()
  fmt.msg('Content:', true)

  var filenames = Object.keys(ctx.file)
  let count = 0

  async.each(
    filenames,
    function (filename, done) {
      // fmt.li(filename, true)

      // split for the meta information at the top
      var data = ctx.file[filename]
      var split = data.split(/\n---\n/, 2)
      var meta = JSON.parse(split[0])
      var content = split[1] || ''

      // check the meta.published to see if this is a draft, a future or neither
      meta.published = meta.published ? new Date(meta.published) : false

      // check to see if this is a future
      if (meta.published) {
        // see if this is to be published in the future
        if (meta.published > new Date()) {
          // this is a future - check to see if we're allowing futures
          if (!ctx.cfg.includeFutures) {
            // not including futures this time
            fmt.msg(`✗ ${filename} (future)`, true)
            return done()
          }
        }
      } else {
        // this is a draft - check to see if we're allowing drafts
        if (!ctx.cfg.includeDrafts) {
          // not including drafts this time
          fmt.msg(`✗ ${filename} (draft)`, true)
          return done()
        }
      }

      // make sure this page/post has a type
      if (!meta.type) {
        return done(new Error('file does not have a type: ' + filename))
      }

      fmt.msg(`✓ ${filename}`, true)
      count = count + 1

      var ext = path.extname(filename).substr(1)
      var name = filename.substr(0, filename.length - ext.length - 1)

      // save all this info into the ctx.page
      ctx.page[name] = {
        name: name + '.html',
        meta: meta,
        title: meta.title,
        type: meta.type,
        filetype: ext,
        published: meta.published,
        content: content
      }

      // also, save this view name to ctx.view so we can load up the template next
      if (meta.type !== 'page' && meta.type !== 'post') {
        ctx.view[meta.type] = true
      }

      done()
    },
    err => {
      if (err) return callback(err)
      fmt.spacer()
      fmt.msg(`Publishing ${count} of ${filenames.length} items.`, true)
      fmt.spacer()
      callback()
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
