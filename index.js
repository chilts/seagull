// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var async = require('async')
var fmt = require('fmt')

// plugins
var loadUpPugViews = require('./lib/load-up-pug-views.js')
var cleanDistDir = require('./lib/clean-dist-dir.js')
var copyStaticFilesToDist = require('./lib/copy-static-files-to-dist.js')
var readAllContent = require('./lib/read-all-content.js')
var readAllData = require('./lib/read-all-data.js')
var processContentToPages = require('./lib/process-content-to-pages.js')
var createSiteStructure = require('./lib/create-site-structure.js')
var convertMarkdownToHtml = require('./lib/convert-markdown-to-html.js')
var createIndexPages = require('./lib/create-index-pages.js')
var createArchivePages = require('./lib/create-archive-pages.js')
var createCategoryPages = require('./lib/create-category-pages.js')
var createTagPages = require('./lib/create-tag-pages.js')
var createAuthorPages = require('./lib/create-author-pages.js')
var createSitemap = require('./lib/create-sitemap.js')
var processPosts = require('./lib/process-posts.js')
var createAtomFeeds = require('./lib/create-atom-feeds.js')
var createRssFeeds = require('./lib/create-rss-feeds.js')
var createOutputDirs = require('./lib/create-output-dirs.js')
var renderSite = require('./lib/render-site.js')

// --------------------------------------------------------------------------------------------------------------------

function seagull (cfg, callback) {
  fmt.arrow('Seagull')
  fmt.msg('Static site generator. Fast, powerful, simple. Choose all three.', true)
  fmt.spacer()
  fmt.msg('Config:', true)
  Object.keys(cfg).forEach(key => {
    fmt.li(`${key} = ${cfg[key]}`, true)
  })
  fmt.spacer()

  // create the context to use throughout the build
  const ctx = {
    now: cfg.published ? new Date(cfg.published) : new Date(), // so all plugins can use exactly the same date
    cfg: cfg,
    view: {}, // the Jade functions for views
    file: {}, // the raw     { '/about.md' : 'file contents' }
    page: {}, // the pages : { '/about' : { ...etc... } } // no hierarchy yet (e.g. no '/blog/', just '/blog/post.md'
    site: {}, // the site  : { '/' : { 'about' : { ... }}, '/blog/' : { 'first-post' : { ... } }} // with hierarchy
    data: {} // the data from the `data/` dir
  }

  async.series(
    [
      cleanDistDir.bind(null, ctx),
      copyStaticFilesToDist.bind(null, ctx),
      readAllContent.bind(null, ctx),
      readAllData.bind(null, ctx),
      processContentToPages.bind(null, ctx),
      loadUpPugViews.bind(null, ctx),
      createSiteStructure.bind(null, ctx),
      createSitemap.bind(null, ctx),
      convertMarkdownToHtml.bind(null, ctx),
      processPosts.bind(null, ctx),
      createIndexPages.bind(null, ctx),
      createArchivePages.bind(null, ctx),
      createCategoryPages.bind(null, ctx),
      createTagPages.bind(null, ctx),
      createAuthorPages.bind(null, ctx),
      createAtomFeeds.bind(null, ctx),
      createRssFeeds.bind(null, ctx),
      // this is where we could dump the data structure
      createOutputDirs.bind(null, ctx),
      renderSite.bind(null, ctx)
    ],
    function (err) {
      fmt.arrow('Congratulations!')
      fmt.spacer()
      fmt.msg('Now run the following to run a local server:', true)
      fmt.spacer()
      fmt.msg('    $ seagull serve', true)
      fmt.spacer()
      fmt.msg('Then open http://localhost:3000 to check your newly built site.', true)
      fmt.spacer()
      fmt.arrow('Finished')
      callback(err)
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = seagull

// --------------------------------------------------------------------------------------------------------------------
