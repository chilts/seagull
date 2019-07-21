// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createIndexPages (ctx, callback) {
  fmt.arrow('Creating Index Pages')
  fmt.spacer()

  // Check each dir and see if there are any posts. If not, then we don't do anything here.

  // Then check if 'index' already exists. If it does, then we won't try to create one here.

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      fmt.msg(`Url '${url}'`, true)

      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        fmt.msg('• no posts', true)
        fmt.spacer()
        return process.nextTick(done)
      }

      // don't create an index page if one already exists
      if (dir.page.index) {
        // console.log('Index already exists')
        fmt.msg('✓ index already exists', true)
      } else {
        // create the index
        dir.page.index = {
          title: 'Index',
          type: 'archive',
          // just use the first page
          posts: dir.pages['0']
        }

        fmt.msg(`✓ created 'index.html'`, true)
      }

      // let's create 'page:*.html' pages, such as 'page:1.html' (same as index) and 'page:2.html', etc
      Object.keys(dir.pages).forEach(function (pageNum) {
        pageNum = pageNum | 0
        // console.log('=== pageNum:', pageNum)
        // console.log('=== pages:', dir.pages[pageNum])
        const actualPageNum = pageNum + 1
        dir.page['page:' + actualPageNum] = {
          title: 'Index Page ' + actualPageNum,
          type: 'archive',
          posts: dir.pages[pageNum]
        }
        fmt.msg(`✓ created page ${actualPageNum}`, true)
      })

      fmt.spacer()

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
