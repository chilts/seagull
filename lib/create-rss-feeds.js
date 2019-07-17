// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var data2xml = require('data2xml')({ attrProp : '@', valProp : '#' })
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

// Note: check feeds with -> https://validator.w3.org/feed/

module.exports = function createRssFeeds(ctx, callback) {
  fmt.title('Create RSS Feeds ...')

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      // just get enough posts for the feed
      var posts = dir.posts.reverse().slice(0, ctx.cfg.postsPerPage)

      // firstly, do the main atom feed
      createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, posts, 'rss.xml')

      // now create all of the category feeds
      if ( dir.category ) {
        Object.keys(dir.category).forEach(function(catName) {
          var name = 'category-' + catName + '.xml'
          createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.category[catName], name)
        })
      }

      // now create all of the tag feeds
      if ( dir.tag ) {
        Object.keys(dir.tag).forEach(function(tagName) {
          var name = 'tag-' + tagName + '.xml'
          createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.tag[tagName], name)
        })
      }

      // now create all of the authors feeds
      if ( dir.author ) {
        Object.keys(dir.author).forEach(function(authorName) {
          var name = 'author-' + authorName + '.xml'
          createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.author[authorName], name)
        })
      }

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------

// factor out the title, url, posts, etc so that we can call this for the main feed, categories, tags and authors

function createFeed(ctx, url, dir, title, baseUrl, authorName, authorEmail, posts, name) {
  // if no posts, don't create any feeds
  if ( posts.length === 0 ) {
    return
  }

  // firstly, make and store the RSS feed
  var rss = {
    '@'     : { version : '2.0' },
    channel : {
      title         : title,
      description   : ctx.cfg.description || 'RSS Feed for ' + ctx.cfg.domain,
      link          : baseUrl + 'rss.xml',
      lastBuildDate : ctx.now.toISOString(),
      pubDate       : ctx.now.toISOString(),
      ttl           : 1800,
      item          : [],
    },
  }

  rss.item = posts.reverse().map(function(post) {
    return {
      title       : post.title,
      description : post.content,
      link        : baseUrl + post.name,
      guid        : baseUrl + post.name,
      pubDate     : post.meta.date,
    }
  })

  dir.page[name] = {
    type    : 'rendered',
    content : data2xml('rss', rss),
  }
}

// --------------------------------------------------------------------------------------------------------------------
