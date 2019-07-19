// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')
var pad = require('./pad.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createAuthorPages (ctx, callback) {
  fmt.title('Create Author Pages ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      var posts = dir.posts

      // ok, let's create some author pages for this directory
      fmt.li('author')

      Object.keys(dir.author).forEach(authorName => {
        const posts = dir.author[authorName]

        const pageName = 'author-' + authorName
        dir.page[pageName] = {
          title: 'Author: ' + authorName,
          type: 'archive',
          posts,
        }
      })

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
