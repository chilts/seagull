// ----------------------------------------------------------------------------

// npm
const async = require('async')

// local
const fmt = require('./fmt.js')

// plugins
const plugins = [
  require('./process/01000-clean-dist-dir.js'),
  require('./process/02000-copy-static-files-to-dist.js'),
  require('./process/03000-read-all-content.js'),
  require('./process/04000-read-all-data.js'),
  require('./process/05000-process-content-to-site.js'),
  require('./process/06000-load-up-pug-views.js'),
  require('./process/07000-create-site-structure.js'),
  require('./process/08000-create-sitemap.js'),
  require('./process/09000-convert-markdown-to-html.js'),
  require('./process/10000-process-posts.js'),
  require('./process/11000-create-index-pages.js'),
  require('./process/12000-create-archive-pages.js'),
  require('./process/13000-create-category-pages.js'),
  require('./process/14000-create-tag-pages.js'),
  require('./process/15000-create-author-pages.js'),
  require('./process/16000-create-rss-feeds.js'),
  require('./process/17000-create-atom-feeds.js'),
  require('./process/17500-create-jsonfeed-feeds.js'),
  require('./process/18000-create-output-dirs.js'),
  require('./process/19000-render-site.js')
]

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
      plugins[0].bind(null, ctx),
      plugins[1].bind(null, ctx),
      plugins[2].bind(null, ctx),
      plugins[3].bind(null, ctx),
      plugins[4].bind(null, ctx),
      plugins[5].bind(null, ctx),
      plugins[6].bind(null, ctx),
      plugins[7].bind(null, ctx),
      plugins[8].bind(null, ctx),
      plugins[9].bind(null, ctx),
      plugins[10].bind(null, ctx),
      plugins[11].bind(null, ctx),
      plugins[12].bind(null, ctx),
      plugins[13].bind(null, ctx),
      plugins[14].bind(null, ctx),
      plugins[15].bind(null, ctx),
      plugins[16].bind(null, ctx),
      plugins[17].bind(null, ctx),
      plugins[18].bind(null, ctx),
      plugins[19].bind(null, ctx)
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
