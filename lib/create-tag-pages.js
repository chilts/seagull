// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createTagPages (ctx, callback) {
  fmt.arrow('Creating Tag Pages')
  fmt.spacer()

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      fmt.msg(`Path '${url}'`, true)

      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        fmt.msg('• no posts', true)
        fmt.spacer()
        return process.nextTick(done)
      }

      // ok, let's create some tag pages for this directory
      const tagNames = Object.keys(dir.tag)
      if (tagNames.length === 0) {
        fmt.msg('• no tags', true)
        fmt.spacer()
        return process.nextTick(done)
      }
      tagNames.forEach(tagName => {
        const posts = dir.tag[tagName]

        // create this tag page
        // (and yes, we can use colon, much like https://en.wikipedia.org/wiki/Template:Welcome)
        const pageName = 'tag:' + tagName
        dir.page[pageName] = {
          title: 'Tag: ' + tagName,
          type: 'archive',
          posts
        }
        fmt.msg(`✓ created tag '${tagName}'`, true)
      })

      fmt.spacer()

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
