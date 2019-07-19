// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createCategoryPages (ctx, callback) {
  fmt.title('Create Category Pages ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      // ok, let's create some category pages for this directory
      fmt.li('category')

      Object.keys(dir.category).forEach(categoryName => {
        const posts = dir.category[categoryName]

        // create this category page
        // (and yes, we can use colon, much like https://en.wikipedia.org/wiki/Template:Welcome)
        const pageName = 'category:' + categoryName
        dir.page[pageName] = {
          title: 'Category: ' + categoryName,
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
