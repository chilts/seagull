// --------------------------------------------------------------------------------------------------------------------

// npm
const async = require('async')

// local
const fmt = require('./lib/fmt.js')

// plugins
const loadUpPugViews = require('./lib/process/load-up-pug-views.js')
const cleanDistDir = require('./lib/process/clean-dist-dir.js')
const copyStaticFilesToDist = require('./lib/process/copy-static-files-to-dist.js')
const readAllContent = require('./lib/process/read-all-content.js')
const readAllData = require('./lib/process/read-all-data.js')
const processContentToSite = require('./lib/process/process-content-to-site.js')
const createSiteStructure = require('./lib/process/create-site-structure.js')
const convertMarkdownToHtml = require('./lib/process/convert-markdown-to-html.js')
const createIndexPages = require('./lib/process/create-index-pages.js')
const createArchivePages = require('./lib/process/create-archive-pages.js')
const createCategoryPages = require('./lib/process/create-category-pages.js')
const createTagPages = require('./lib/process/create-tag-pages.js')
const createAuthorPages = require('./lib/process/create-author-pages.js')
const createSitemap = require('./lib/process/create-sitemap.js')
const processPosts = require('./lib/process/process-posts.js')
const createAtomFeeds = require('./lib/process/create-atom-feeds.js')
const createRssFeeds = require('./lib/process/create-rss-feeds.js')
const createOutputDirs = require('./lib/process/create-output-dirs.js')
const renderSite = require('./lib/process/render-site.js')

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
      processContentToSite.bind(null, ctx),
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
