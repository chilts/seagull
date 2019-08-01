// ----------------------------------------------------------------------------

// npm
const async = require('async')

// local
const fmt = require('./fmt.js')

// plugins
const loadUpPugViews = require('./process/01000-load-up-pug-views.js')
const cleanDistDir = require('./process/02000-clean-dist-dir.js')
const copyStaticFilesToDist = require('./process/03000-copy-static-files-to-dist.js')
const readAllContent = require('./process/04000-read-all-content.js')
const readAllData = require('./process/05000-read-all-data.js')
const processContentToSite = require('./process/06000-process-content-to-site.js')
const createSiteStructure = require('./process/07000-create-site-structure.js')
const convertMarkdownToHtml = require('./process/08000-convert-markdown-to-html.js')
const createIndexPages = require('./process/09000-create-index-pages.js')
const createArchivePages = require('./process/10000-create-archive-pages.js')
const createCategoryPages = require('./process/11000-create-category-pages.js')
const createTagPages = require('./process/12000-create-tag-pages.js')
const createAuthorPages = require('./process/13000-create-author-pages.js')
const createSitemap = require('./process/14000-create-sitemap.js')
const processPosts = require('./process/15000-process-posts.js')
const createAtomFeeds = require('./process/16000-create-atom-feeds.js')
const createRssFeeds = require('./process/17000-create-rss-feeds.js')
const createOutputDirs = require('./process/18000-create-output-dirs.js')
const renderSite = require('./process/19000-render-site.js')

// ----------------------------------------------------------------------------

function diffInMs (diff) {
  return diff[0] * 1000 + Math.round(diff[1] / 1000000)
}

function seagull (opts, cfg, callback) {
  if (opts.stream) {
    fmt.setStream(opts.stream)
  }

  const start = process.hrtime()

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
    opts,
    cfg,
    now: cfg.published ? new Date(cfg.published) : new Date(), // so all plugins can use exactly the same date
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
      // last message to user
      fmt.arrow('Congratulations!')
      fmt.spacer()
      fmt.msg('Now run the following to run a local server:', true)
      fmt.spacer()
      fmt.msg('    $ seagull serve', true)
      fmt.spacer()
      fmt.msg('Then open http://localhost:3000 to check your newly built site.', true)
      fmt.spacer()

      const diff = process.hrtime(start)
      const ms = diffInMs(diff)
      fmt.arrow(`Finished build in ${ms}ms.`)

      callback(err)
    }
  )
}

// ----------------------------------------------------------------------------

module.exports = seagull

// ----------------------------------------------------------------------------
