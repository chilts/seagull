// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var async = require('async')
var xtend = require('xtend')
var fmt = require('fmt')

// plugins
var loadUpPugViews = require('./lib/load-up-pug-views.js')
var cleanHtmlDir = require('./lib/clean-html-dir.js')
var copyStaticFilesToHtml = require('./lib/copy-static-files-to-html.js')
var readAllContent = require('./lib/read-all-content.js')
var processContentToPages = require('./lib/process-content-to-pages.js')
var createSiteStructure = require('./lib/create-site-structure.js')
var convertMarkdownToHtml = require('./lib/convert-markdown-to-html.js')
var createIndexPages = require('./lib/create-index-pages.js')
var createArchivePages = require('./lib/create-archive-pages.js')
var createSitemap = require('./lib/create-sitemap.js')
var processPosts = require('./lib/process-posts.js')
var createAtomFeeds = require('./lib/create-atom-feeds.js')
var createRssFeeds = require('./lib/create-rss-feeds.js')
var createOutputDirs = require('./lib/create-output-dirs.js')
var renderSite = require('./lib/render-site.js')

// --------------------------------------------------------------------------------------------------------------------

var DEFAULTS = {
  postsPerPage: 10,
  viewDir: 'views',
  contentDir: 'content',
  fileDir: 'files',
  htmlDir: 'html',
  includeDrafts: false,
  includeFutures: false
}

function seagull (opts, callback) {
  fmt.title('seagull(): entry')

  var cfg = xtend({}, DEFAULTS, opts)
  console.log('cfg:', cfg)

  var ctx = {
    now: cfg.published ? new Date(cfg.published) : new Date(), // so all plugins can use exactly the same date
    cfg: cfg,
    view: {}, // the Jade functions for views
    file: {}, // the raw     { '/about.md' : 'file contents' }
    page: {}, // the pages : { '/about' : { ...etc... } } // no hierarchy yet (e.g. no '/blog/', just '/blog/post.md'
    site: {} // the site  : { '/' : { 'about' : { ... }}, '/blog/' : { 'first-post' : { ... } }} // with hierarchy
  }

  async.series(
    [
      cleanHtmlDir.bind(null, ctx),
      copyStaticFilesToHtml.bind(null, ctx),
      readAllContent.bind(null, ctx),
      processContentToPages.bind(null, ctx),
      loadUpPugViews.bind(null, ctx),
      createSiteStructure.bind(null, ctx),
      createSitemap.bind(null, ctx),
      convertMarkdownToHtml.bind(null, ctx),
      processPosts.bind(null, ctx),
      createIndexPages.bind(null, ctx),
      createArchivePages.bind(null, ctx),
      createAtomFeeds.bind(null, ctx),
      createRssFeeds.bind(null, ctx),
      // this is where we could dump the data structure
      createOutputDirs.bind(null, ctx),
      renderSite.bind(null, ctx)
    ],
    function (err) {
      console.log('-------------------------------------------------------------------------------')
      console.log('err:', err)
      console.log('ctx:', ctx)
      console.log('-------------------------------------------------------------------------------')
      callback(err)
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = seagull

// --------------------------------------------------------------------------------------------------------------------
