// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createSiteStructure (ctx, callback) {
  fmt.title('Create Site Structure ...')

  var pagenames = Object.keys(ctx.page)

  // start with an empty site (at least)
  ctx.site['/'] = {
    page: {}, // all pages that have been read in from the filesystem (including posts)
    posts: [], // all posts (including draft and future)
    published: [], // all published posts
    tag: {}, // posts in each tag
    category: {}, // posts in each category
    author: {}, // posts for each author
    pages: {} // the pages for all the posts (if any)
  }

  async.each(
    pagenames,
    function (pagename, done) {
      var page = ctx.page[pagename]

      // split the path and take off the last element
      var s = pagename.split(/\//)
      var name = s.splice(s.length - 1, 1)[0]
      var pathname = s.join('/') + '/'

      // save this name to the page too
      page.name = name

      // save this dir at pathname (if not already there)
      ctx.site[pathname] = ctx.site[pathname] || {
        page: {}, // all pages that have been read in from the filesystem (including posts)
        posts: [], // all posts (including draft and future)
        published: [], // all published posts
        tag: {}, // posts in each tag
        category: {}, // posts in each category
        author: {}, // posts for each author
        pages: {} // the pages for all the posts (if any)
      }

      // save all 'page's to page
      ctx.site[pathname].page[name] = page

      // ... and put posts into posts too
      if (page.type === 'post') {
        ctx.site[pathname].posts.push(page)
      }
      // check to see if this post has a category
      if (page.category) {
        // cool
      }
      // check to see if this post has some tags
      if (page.tags) {
        if (typeof page.tags === 'string') {
          page.tags = [page.tags]
        }
      }

      done()
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
