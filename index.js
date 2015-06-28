// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var async = require('async')
var xtend = require('xtend')
var fsExtra = require('fs-extra')
var find = require('find')
var fs = require('graceful-fs')
var marked = require('marked')
var jade = require('jade')
var fmt = require('fmt')
var mkdirp = require('mkdirp')

// local
var pad = require('./lib/pad.js')
var visitEveryDir = require('./lib/visit-every-dir.js')
var createSitemap = require('./lib/create-sitemap.js')
var processPosts = require('./lib/process-posts.js')
var createAtomFeeds = require('./lib/create-atom-feeds.js')
var createRssFeeds = require('./lib/create-rss-feeds.js')

// --------------------------------------------------------------------------------------------------------------------

var now = new Date()

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
})

var DEFAULTS = {
  postsPerPage   : 10,
  viewDir        : 'views',
  contentDir     : 'content',
  fileDir        : 'files',
  htmlDir        : 'html',
  includeDrafts  : false,
  includeFutures : false,
}

function seagull(opts, callback) {
  fmt.title('seagull(): entry')

  var cfg = xtend({}, DEFAULTS, opts)
  console.log('cfg:', cfg)

  var ctx = {
    now : new Date(), // so all plugins can use exactly the same date
    cfg : cfg,
    view : {}, // the Jade functions for views
    file : {}, // the raw     { '/about.md' : 'file contents' }
    page : {}, // the pages : { '/about' : { ...etc... } } // no hierarchy yet (e.g. no '/blog/', just '/blog/post.md'
    site : {}, // the site  : { '/' : { 'about' : { ... }}, '/blog/' : { 'first-post' : { ... } }} // with hierarchy
  }

  async.series(
    [
      loadUpJadeViews.bind(null, ctx),
      cleanHtmlDir.bind(null, ctx),
      copyStaticFilesToHtml.bind(null, ctx),
      readAllContent.bind(null, ctx),
      processContentToPages.bind(null, ctx),
      createSiteStructure.bind(null, ctx),
      createSitemap.bind(null, ctx),
      convertMarkdownToHtml.bind(null, ctx),
      processPosts.bind(null, ctx),
      createIndexPages.bind(null, ctx),
      createArchivePages.bind(null, ctx),
      createAtomFeeds.bind(null, ctx),
      createRssFeeds.bind(null, ctx),
      createOutputDirs.bind(null, ctx),
      renderSite.bind(null, ctx)
    ],
    function(err) {
      console.log('-------------------------------------------------------------------------------')
      console.log('err:', err)
      console.log('ctx:', ctx)
      console.log('-------------------------------------------------------------------------------')
      callback(err)
    }
  )
}

function visitEveryPage(ctx, fn, callback) {

  function eachKey(obj, doneOuter) {
    async.eachSeries(
      Object.keys(obj),
      function(key, doneInner) {
        var item = obj[key]
        console.log('leaf: Doing ' + key)

        // if there is a 'type', then this must be a page of some sort
        if ( item.type ) {
          console.log('leaf:  - type=' + item.type)
          // do this function, then move on
          fn(item, doneInner)
        }
        else {
          // another tree
          console.log('leaf:  - recursing down another tree')
          eachKey(item, doneInner)
        }
      },
      doneOuter
    )
  }

  // kick it all off
  eachKey(ctx.site, callback)
}

// --------------------------------------------------------------------------------------------------------------------

function loadUpJadeViews(ctx, callback) {
  fmt.title('Load Up Jade Views ...')
  var viewNames = [ 'index', 'page', 'post', 'archive' ]

  async.eachSeries(
    viewNames,
    function(name, done) {
      var filename = path.join(ctx.cfg.viewDir, name + '.jade')

      if ( !fs.existsSync(filename)) {
        // this view is not found
        console.warn('View ' + name + ' template does not exist')
        process.exit(2)
      }

      ctx.view[name] = jade.compileFile(filename, {
        filename : filename,
        pretty   : ctx.cfg.pretty || false,
      })

      done()
    },
    callback
  )
}

function cleanHtmlDir(ctx, callback) {
  fmt.title('Clear HTML dir ...')
  fsExtra.emptyDir(ctx.cfg.htmlDir, callback)
}

function copyStaticFilesToHtml(ctx, callback) {
  fmt.title('Copyy Static Files to Html ...')
  fsExtra.copy(ctx.cfg.fileDir, ctx.cfg.htmlDir, callback)
}

function readAllContent(ctx, callback) {
  fmt.title('Read All Content ...')

  find.file(ctx.cfg.contentDir, function(filenames) {

    // loop through each filename and read the contents
    async.eachSeries(
      filenames,
      function(filename, done) {
        fs.readFile(filename, 'utf8', function(err, data) {
          if (err) return done(err)

          var name = filename.substr(ctx.cfg.contentDir.length)
          ctx.file[name] = data

          done()
        })
      },
      function(err) {
        if (err) callback(err)
        callback()
      }
    )
  }).error(callback)
}

function processContentToPages(ctx, callback) {
  fmt.title('Process Content to Pages ...')

  var filenames = Object.keys(ctx.file)

  async.each(
    filenames,
    function(filename, done) {

      // split for the meta information at the top
      var data = ctx.file[filename]
      var split = data.split(/\n---\n/, 2)
      var meta = JSON.parse(split[0])
      var content = split[1] || ''

      // check the meta.published to see if this is a draft, a future or neither
      meta.published = meta.published ? new Date(meta.published) : false

      // check to see if this is a future
      if ( meta.published ) {
        // see if this is to be published in the future
        if ( meta.published > new Date() ) {
          // this is a future - check to see if we're allowing futures
          if ( !ctx.cfg.includeFutures ) {
            // not including futures this time
            return done()
          }
        }
      }
      else {
        // this is a draft - check to see if we're allowing drafts
        if ( !ctx.cfg.includeDrafts ) {
          // not including drafts this time
          return done()
        }
      }

      var ext = path.extname(filename).substr(1)
      var name = filename.substr(0, filename.length - ext.length - 1)

      // save all this info into the ctx.page
      ctx.page[name] = {
        name      : name + '.html',
        meta      : meta,
        title     : meta.title,
        type      : meta.type,
        filetype  : ext,
        published : meta.published,
        content   : content,
      }

      done()
    },
    callback
  )
}

function createSiteStructure(ctx, callback) {
  fmt.title('Create Site Structure ...')

  var pagenames = Object.keys(ctx.page)

  async.each(
    pagenames,
    function(pagename, done) {
      var page = ctx.page[pagename]

      // split the path and take off the last element
      var s = pagename.split(/\//)
      var pagename = s.splice(s.length-1, 1)
      var pathname = s.join('/') + '/'

      // save this page at pathname
      ctx.site[pathname] = ctx.site[pathname] || {
        page      : {}, // all pages that have been read in from the filesystem (including posts)
        posts     : [], // all posts (including draft and future)
        published : [], // all published posts
        tag       : {}, // posts in each tag
        category  : {}, // posts in each category
        author    : {}, // posts for each author
      }

      // save all 'pages' to page
      ctx.site[pathname].page[pagename] = page
      // ... and put posts into posts too
      if ( page.type === 'post' ) {
        ctx.site[pathname].posts.push(page)
      }
      // check to see if this post has a category
      if ( page.category ) {
        // cool
      }
      // check to see if this post has some tags
      if ( page.tags ) {
        if ( typeof page.tags === 'string' ) {
          page.tags = [ page.tags ]
        }
      }

      done()
    },
    callback
  )
}

function convertMarkdownToHtml(ctx, callback) {
  fmt.title('Convert Markdown to HTML ...')

  visitEveryPage(
    ctx,
    function(item, done) {
      item.html = marked(item.content)
      process.nextTick(done)
    },
    callback
  )
}

function createIndexPages(ctx, callback) {
  fmt.title('Create Index Pages ...')

  // visit every vertex and see if 'index' already exists

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      if ( dir.page.index ) {
        console.log('Index already exists')
      }
      else {
        console.log('No index here')

        // create the index
        dir.page.index = {
          title : 'Index',
          type : 'archive',
          // ToDo: use the pagifyPosts info
          posts : dir.posts.reverse().slice(0, ctx.cfg.postsPerPage),
        }
      }
      process.nextTick(done)
    },
    callback
  )
}

function createArchivePages(ctx, callback) {
  fmt.title('Create Archive Pages ...')

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      var posts = dir.posts

      // ok, let's create some archive pages for this directory
      dir.page['archive'] = {
        title : 'Archive',
        type : 'archive',
        posts : posts.reverse(),
      }

      posts.forEach(function(post) {
        var year = post.published.getFullYear()
        var month = post.published.getFullYear() + '-' + pad(post.published.getMonth()+1)

        // create the year and month page name
        var yearPageName = 'archive-' + year
        var monthPageName = 'archive-' + month 

        console.log('Got post, year=%s, month=%s', year, month)

        // see if these archive pages exist yet
        if ( dir.page[yearPageName] ) {
          // just push onto the posts
          dir.page[yearPageName].posts.push(post)
        }
        else {
          // create the new page
          dir.page[yearPageName] = {
            title : 'Archive: ' + year,
            type : 'archive',
            posts : [ post ],
          }
        }

        if ( dir.page[monthPageName] ) {
          // just push onto the posts
          dir.page[monthPageName].posts.push(post)
        }
        else {
          // create the new page
          dir.page[monthPageName] = {
            title : 'Archive: ' + month,
            type : 'archive',
            posts : [ post ],
          }
        }
      })

      process.nextTick(done)
    },
    callback
  )
}

function createOutputDirs(ctx, callback) {
  fmt.title('Create Output Dirs ...')

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      var dirname = path.join(ctx.cfg.htmlDir, url)
      mkdirp(dirname, done)
    },
    callback
  )
}

function renderSite(ctx, callback) {
  fmt.title('Render Site ...')

  var paths = Object.keys(ctx.site)

  // ToDo: turn this into a visitEveryPage or visitEveryDir!!!

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      console.log('Doing url ' + url)

      var pageNames = Object.keys(dir.page)
      async.eachSeries(
        pageNames,
        function(pageName, done2) {
          console.log('Doing page ' + pageName)
          var page = dir.page[pageName]

          // set up some common things
          var outfile = path.join(ctx.cfg.htmlDir, url, pageName)
          var type = page.type

          // 'post' is the only special type, all the rest just render their templates
          
          if ( page.type === 'page' ) {
            // render page
            var locals = {
              cfg     : ctx.cfg,
              site    : ctx.site,
              self    : page,
            }
            var html = ctx.view.page(locals)
            fs.writeFile(outfile + '.html', html, done2)
          }
          else if ( page.type === 'post' ) {
            console.log('Rendering post %s', pageName)

            // render page
            var locals = {
              cfg     : ctx.cfg,
              site    : ctx.site,
              self    : page,
            }
            var html = ctx.view.post(locals)
            fs.writeFile(outfile + '.html', html, done2)
          }
          else if ( page.type === 'archive' ) {
            // render page
            console.log('archive page:', page)
            var locals = {
              cfg     : ctx.cfg,
              site    : ctx.site,
              self    : page,
            }

            var html = ctx.view.archive(locals)
            fs.writeFile(outfile + '.html', html, done2)
          }
          else if ( page.type === 'rendered' ) {
            // don't write an extension for this outfile
            fs.writeFile(outfile, page.content, done2)
          }
          else {
            console.warn('Unknown page type : ', page.type)
            process.nextTick(done2)
          }

        },
        done
      )
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = seagull

// --------------------------------------------------------------------------------------------------------------------
