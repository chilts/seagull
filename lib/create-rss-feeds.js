// --------------------------------------------------------------------------------------------------------------------

// npm
const data2xml = require('data2xml')({ attrProp: '@', valProp: '#' })
const fmt = require('fmt')
const dateFns = require('date-fns')

// local
const visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

const rfc822 = 'ddd, DD MMM YYYY HH:mm:ss ZZ'

// Note: check feeds with -> https://validator.w3.org/feed/

module.exports = function createRssFeeds (ctx, callback) {
  fmt.title('Create RSS Feeds ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // just get enough posts for the feed
      var posts = dir.posts.reverse().slice(0, ctx.cfg.postsPerPage)

      // firstly, do the main atom feed
      createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, posts, 'rss.xml')

      // now create all of the category feeds
      if (dir.category) {
        Object.keys(dir.category).forEach(function (catName) {
          var name = 'category-' + catName + '.xml'
          createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.category[catName], name)
        })
      }

      // now create all of the tag feeds
      if (dir.tag) {
        Object.keys(dir.tag).forEach(function (tagName) {
          var name = 'tag-' + tagName + '.xml'
          createFeed(ctx, url, dir, ctx.cfg.title, 'http://' + ctx.cfg.domain + url, ctx.cfg.authorName, ctx.cfg.authorEmail, dir.tag[tagName], name)
        })
      }

      // now create all of the authors feeds
      if (dir.author) {
        Object.keys(dir.author).forEach(function (authorName) {
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

function createFeed (ctx, url, dir, title, baseUrl, authorName, authorEmail, posts, name) {
  // if no posts, don't create any feeds
  if (posts.length === 0) {
    return
  }

  // firstly, make and store the RSS feed
  var rss = {
    '@': {
      version: '2.0',
      'xmlns:atom': 'http://www.w3.org/2005/Atom'
    },
    channel: {
      title: title,
      description: ctx.cfg.description || 'RSS Feed for ' + ctx.cfg.domain,
      link: baseUrl + 'rss.xml',
      // https://www.feedvalidator.org/docs/warning/MissingAtomSelfLink.html
      // <atom:link href="http://dallas.example.com/rss.xml" rel="self" type="application/rss+xml" />
      'atom:link': {
        '@': {
          href: baseUrl + 'rss.xml',
          rel: 'self',
          type: 'application/rss+xml'
        }
      },
      lastBuildDate: dateFns.format(ctx.now, rfc822), // Wed, 02 Oct 2002 13:00:00 GMT
      pubDate: dateFns.format(ctx.now, rfc822), // Wed, 02 Oct 2002 13:00:00 GMT
      ttl: 1800,
      item: []
    }
  }

  rss.channel.item = posts.reverse().map(function (post) {
    return {
      title: post.title,
      description: post.html,
      link: baseUrl + post.name,
      guid: baseUrl + post.name,
      pubDate: post.meta.date
    }
  })

  dir.page[name] = {
    type: 'rendered',
    content: data2xml('rss', rss)
  }
}

// --------------------------------------------------------------------------------------------------------------------
