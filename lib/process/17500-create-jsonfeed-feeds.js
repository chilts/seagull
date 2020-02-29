// --------------------------------------------------------------------------------------------------------------------

// local
var visitEveryDir = require('../visit-every-dir.js')
var fmt = require('../fmt.js')

// --------------------------------------------------------------------------------------------------------------------

// Note: check feeds with -> https://validator.w3.org/feed/

module.exports = function createJSONFeedFeeds (ctx, callback) {
  fmt.arrow('Creating JSONFeed Feeds')
  fmt.spacer()

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      fmt.msg(`Path '${url}'`, true)

      // just get enough posts for the feed
      var posts = dir.pages[0]

      // firstly, do the main JSONFeed feed
      createFeed(ctx, url, dir, ctx.cfg.title, ctx.cfg.protocol + '://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, posts, 'feed.json')
      fmt.msg('✓ created \'feed.json\'', true)

      // now create all of the category feeds
      if (dir.category) {
        Object.keys(dir.category).forEach(function (catName) {
          var name = 'category:' + catName + '.json'
          createFeed(ctx, url, dir, ctx.cfg.title, ctx.cfg.protocol + '://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.category[catName], name)
          fmt.msg(`✓ created category '${catName}'`, true)
        })
      }

      // now create all of the tag feeds
      if (dir.tag) {
        Object.keys(dir.tag).forEach(function (tagName) {
          var name = 'tag:' + tagName + '.json'
          createFeed(ctx, url, dir, ctx.cfg.title, ctx.cfg.protocol + '://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.tag[tagName], name)
          fmt.msg(`✓ created tag '${tagName}'`, true)
        })
      }

      // now create all of the authors feeds
      if (dir.author) {
        Object.keys(dir.author).forEach(function (authorName) {
          var name = 'author:' + authorName + '.json'
          createFeed(ctx, url, dir, ctx.cfg.title, ctx.cfg.protocol + '://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.author[authorName], name)
          fmt.msg(`✓ created author '${authorName}'`, true)
        })
      }

      fmt.spacer()

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------

// factor out the title, url, posts, etc so that we can call this for the main feed, categories, tags and authors

function createFeed (ctx, url, dir, title, baseUrl, authorName, authorEmail, posts, name) {
  // if no posts, don't create any feeds
  if (posts.length === 0) {
    return
  }

  // start of the JSONFeed feed
  const feed = {

  }

  feed.entry = posts.map(function (post) {
    return {
      title: post.title,
      id: baseUrl + post.name,
      link: [
        {
          '@': {
            href: baseUrl + post.name
          }
        },
        {
          '@': {
            href: baseUrl + post.name,
            rel: 'self'
          }
        }
      ],
      content: {
        '@': { type: 'html' },
        '#': post.html
      },
      updated: post.published.toISOString()
    }
  })

  // make a page for the JSONfeed
  dir.page[name] = {
    type: 'rendered',
    content: JSON.stringify(feed)
  }
}

// --------------------------------------------------------------------------------------------------------------------
