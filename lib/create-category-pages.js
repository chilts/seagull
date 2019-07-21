// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createCategoryPages (ctx, callback) {
  fmt.arrow('Create Category Pages ...')
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

      // ok, let's create some category pages for this directory
      const categoryNames = Object.keys(dir.category)
      if (categoryNames.length === 0) {
        fmt.msg('• no categories', true)
        fmt.spacer()
        return process.nextTick(done)
      }
      categoryNames.forEach(categoryName => {
        const posts = dir.category[categoryName]

        // create this category page
        // (and yes, we can use colon, much like https://en.wikipedia.org/wiki/Template:Welcome)
        const pageName = 'category:' + categoryName
        dir.page[pageName] = {
          title: 'Category: ' + categoryName,
          type: 'archive',
          posts
        }
        fmt.msg(`✓ created category '${categoryName}'`, true)
      })

      fmt.spacer()

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
