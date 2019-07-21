// --------------------------------------------------------------------------------------------------------------------

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('../visit-every-dir.js')
var pad = require('../pad.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createArchivePages (ctx, callback) {
  fmt.arrow('Creating Archive Pages')
  fmt.spacer()

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      fmt.msg(`Path '${url}'`, true)
      var posts = dir.posts

      // ok, let's create some archive pages for this directory
      dir.page['archive'] = {
        title: 'Archive',
        type: 'archive',
        posts: posts.reverse()
      }
      fmt.msg(`✓ created page 'archive.html'`, true)

      posts.forEach(function (post) {
        var year = post.published.getFullYear()
        var month = post.published.getFullYear() + '-' + pad(post.published.getMonth() + 1)

        // create the year and month page name
        // (and yes, we can use colon, much like https://en.wikipedia.org/wiki/Template:Welcome)
        var yearPageName = 'archive:' + year
        var monthPageName = 'archive:' + month

        // console.log('Got post, year=%s, month=%s', year, month)

        // see if these archive pages exist yet
        if (dir.page[yearPageName]) {
          // just push onto the posts
          dir.page[yearPageName].posts.push(post)
        } else {
          // create the new page
          dir.page[yearPageName] = {
            title: 'Archive: ' + year,
            type: 'archive',
            posts: [post]
          }
          fmt.msg(`✓ created year '${year}'`, true)
        }

        if (dir.page[monthPageName]) {
          // just push onto the posts
          dir.page[monthPageName].posts.push(post)
        } else {
          // create the new page
          dir.page[monthPageName] = {
            title: 'Archive: ' + month,
            type: 'archive',
            posts: [post]
          }
          fmt.msg(`✓ created month '${month}'`, true)
        }
      })

      fmt.spacer()

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
