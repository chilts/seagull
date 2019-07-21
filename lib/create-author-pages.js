// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createAuthorPages (ctx, callback) {
  fmt.arrow('Creating Author Pages')
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

      // ok, let's create some author pages for this directory
      const authorNames = Object.keys(dir.author)
      if (authorNames.length === 0) {
        fmt.msg('• no authors', true)
        fmt.spacer()
        return process.nextTick(done)
      }
      authorNames.forEach(authorName => {
        const posts = dir.author[authorName]

        const pageName = 'author:' + authorName
        dir.page[pageName] = {
          title: 'Author: ' + authorName,
          type: 'archive',
          posts
        }
        fmt.msg(`✓ created author '${authorName}'`, true)
      })

      fmt.spacer()

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
