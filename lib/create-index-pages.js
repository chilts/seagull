// --------------------------------------------------------------------------------------------------------------------

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createIndexPages(ctx, callback) {
  fmt.title('Create Index Pages ...')

  // visit every vertex and see if 'index' already exists

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      // if there are no posts, then don't do anything
      if ( dir.posts.length === 0 ) {
        return process.nextTick(done)
      }

      if ( dir.page.index ) {
        console.log('Index already exists')
      }
      else {
        console.log('No index here')

        // create the index
        dir.page.index = {
          title : 'Index',
          type : 'archive',
          // just use the first page
          posts : dir.pages['0'].reverse(),
        }
      }

      // let's create 'page-*.html' pages, such as 'page-1.html' (same as index) and 'page-2.html', etc
      Object.keys(dir.pages).forEach(function(pageNum) {
        console.log('=== pageNum:', pageNum)
        console.log('=== pages:', dir.pages[pageNum])
        if ( pageNum === '0' ) {
          // skip this since it is the 'index' (above)
          return
        }
        dir.page['page-' + pageNum] = {
          title : 'Index Page ' + pageNum,
          type : 'archive',
          posts : dir.pages[pageNum],
        }
      })

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
