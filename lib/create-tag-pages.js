// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createTagPages (ctx, callback) {
  fmt.title('Create Tag Pages ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      // ok, let's create some tag pages for this directory
      fmt.li('tag')

      Object.keys(dir.tag).forEach(tagName => {
        const posts = dir.tag[tagName]

        // create this tag page
        // (and yes, we can use colon, much like https://en.wikipedia.org/wiki/Template:Welcome)
        const pageName = 'tag:' + tagName
        dir.page[pageName] = {
          title: 'Tag: ' + tagName,
          type: 'archive',
          posts
        }
      })

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
