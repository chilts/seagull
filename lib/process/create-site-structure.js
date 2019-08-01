// --------------------------------------------------------------------------------------------------------------------

// npm
var async = require('async')

// local
var fmt = require('../fmt.js')

// --------------------------------------------------------------------------------------------------------------------

function newPathStructure() {
  return {
    page: {}, // all pages that have been read in from the filesystem (including posts)
    posts: [], // all posts (includes draft and future depending on settings)
    updated: (new Date(0)).toISOString(), // the latest date seen in 'published'
    tag: {}, // posts in each tag
    category: {}, // posts in each category
    author: {}, // posts for each author
    pages: {} // the pages for all the posts (if any)
  }
}

module.exports = function createSiteStructure (ctx, callback) {
  fmt.arrow('Creating Site Structure')
  fmt.spacer()

  const seen = {
    '/': true
  }

  var pagenames = Object.keys(ctx.page)

  // start with an empty site (at least)
  fmt.msg('Path:', true)
  fmt.li('/', true)
  ctx.site['/'] = newPathStructure()

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
      if (!(pathname in seen)) {
        seen[pathname] = true
        fmt.li(pathname, true)
      }
      ctx.site[pathname] = ctx.site[pathname] || newPathStructure()

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
    err => {
      if (err) return callback(err)
      fmt.spacer()
      fmt.msg(`Found ${Object.keys(seen).length} directories.`, true)
      fmt.spacer()
      callback()
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
