// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')
var pad = require('./pad.js')

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

      var posts = dir.posts

      // ok, let's create some category pages for this directory
      fmt.li('category')

      Object.keys(dir.category).forEach(categoryName => {
        const posts = dir.category[categoryName]

        const pageName = 'category-' + categoryName
        dir.page[pageName] = {
          title: 'Category: ' + categoryName,
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
