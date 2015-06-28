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
      if ( dir.page.index ) {
        console.log('Index already exists')
      }
      else {
        console.log('No index here')

        // create the index
        dir.page.index = {
          title : 'Index',
          type : 'archive',
          // ToDo: use the pagifyPosts info
          posts : dir.posts.reverse().slice(0, ctx.cfg.postsPerPage),
        }
      }
      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
