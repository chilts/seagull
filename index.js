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

// local
var pad = require('./lib/pad.js')
var extractPostsForDir = require('./lib/extract-posts-for-dir.js')

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
  console.log('seagull(): entry')

  var cfg = xtend({}, DEFAULTS, opts)
  console.log('cfg:', cfg)

  var ctx = {
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
      copyFilesToHtml.bind(null, ctx),
      readAllFiles.bind(null, ctx),
      processFilesToPages.bind(null, ctx),
      createSiteStructure.bind(null, ctx),
      convertMarkdownToHtml.bind(null, ctx),
      createIndexPages.bind(null, ctx),
      createArchivePages.bind(null, ctx),
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

function visitEveryLeaf(ctx, fn, callback) {

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

function visitEveryVertex(ctx, fn, callback) {

  function eachKey(obj, doneOuter) {
    async.eachSeries(
      Object.keys(obj),
      function(key, doneInner) {
        var item = obj[key]
        console.log('vertex: Doing ' + key)

        // if there is a 'type', then this must be a page of some sort
        if ( item.type ) {
          console.log('vertex:  - type=' + item.type)
          // nothing to do here
          return doneInner()
        }
        else {
          // another tree
          console.log('vertex:  - recursing down another tree')

          // call the fn, then move on once that's done
          fn(item, doneInner)
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
  console.log('cleanHtmlDir(): entry')
  fsExtra.emptyDir(ctx.cfg.htmlDir, callback)
}

function copyFilesToHtml(ctx, callback) {
  console.log('copyFilesToHtml(): entry')
  fsExtra.copy(ctx.cfg.fileDir, ctx.cfg.htmlDir, callback)
}

function readAllFiles(ctx, callback) {
  console.log('readAllFiles(): entry')

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

function processFilesToPages(ctx, callback) {
  console.log('processFilesToPages(): entry')

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
        console.log('pub:', meta.published)
        console.log('pub:', new Date())
        console.log('pub:', meta.published > new Date())
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
  console.log('createSiteStructure(): entry')

  var pagenames = Object.keys(ctx.page)

  async.each(
    pagenames,
    function(pagename, done) {
      var page = ctx.page[pagename]

      // split the path and take off the last element
      var s = pagename.split(/\//)
      var name = s.splice(s.length-1, 1)
      var path = s.join('/') + '/'

      // save this page at path
      ctx.site[path] = ctx.site[path] || {}
      ctx.site[path][name] = page

      done()
    },
    callback
  )
}

function convertMarkdownToHtml(ctx, callback) {
  fmt.title('Convert Markdown to HTML ...')
  console.log('convertMarkdownToHtml(): entry')

  visitEveryLeaf(
    ctx,
    function(item, done) {
      // console.log('Doing item : ' + JSON.stringify(item))
      // console.log('Making HTML ...', item)
      item.html = marked(item.content)
      process.nextTick(done)
    },
    callback
  )
}

function createIndexPages(ctx, callback) {
  fmt.title('Create Index Pages ...')
  process.nextTick(callback)
}

function createArchivePages(ctx, callback) {
  fmt.title('Create Archive Pages ...')
  console.log('createArchivePages(): entry')

  visitEveryVertex(
    ctx,
    function(dir, done) {
      console.log('Visiting : ' + JSON.stringify(dir, null, '  '))

      // gather up all of the 'posts' in this vertex
      var posts = extractPostsForDir(dir)
      
      console.log('posts for archive:', posts)

      // ok, let's create some archive pages for this directory
      dir['archive'] = {
        title : 'Archive',
        type : 'archive',
        posts : posts,
      }

      posts.forEach(function(post) {
        var year = post.published.getFullYear()
        var month = post.published.getFullYear() + '-' + pad(post.published.getMonth()+1)

        // create the year and month page name
        var yearPageName = 'archive-' + year
        var monthPageName = 'archive-' + month 

        console.log('Got post, year=%s, month=%s', year, month)

        // see if these archive pages exist yet
        if ( dir[yearPageName] ) {
          // just push onto the posts
          dir[yearPageName].posts.push(post)
        }
        else {
          // create the new page
          dir[yearPageName] = {
            title : 'Archive: ' + year,
            type : 'archive',
            posts : [ post ],
          }
        }

        if ( dir[monthPageName] ) {
          // just push onto the posts
          dir[monthPageName].posts.push(post)
        }
        else {
          // create the new page
          dir[monthPageName] = {
            title : 'Archive: ' + month,
            type : 'archive',
            posts : [ post ],
          }
        }
      })

      console.log('+++ dir +++', dir)
      // console.log(dir['archive'])

      console.log('DIR1:', dir['archive-2015'])
      console.log('DIR2:', dir['archive-2015-06'])

      console.log('pages in ctx.site:', Object.keys(ctx.site).join(', '))
      console.log('ctx.site:', ctx.site)

      process.nextTick(done)
    },
    callback
  )
}

function renderSite(ctx, callback) {
  fmt.title('Render Site ...')
  console.log('renderSite(): entry')

  var sectionNames = Object.keys(ctx.site)

  // ToDo: turn this into a visitEveryLeaf or visitEveryVertex!!!

  async.eachSeries(
    sectionNames,
    function(sectionName, done1) {
      console.log('Doing section ' + sectionName)
      var section = ctx.site[sectionName]

      // console.log('YAHBOO! section -> ', JSON.stringify(section, null, '  '))

      var pageNames = Object.keys(section)
      async.eachSeries(
        pageNames,
        function(pageName, done2) {
          console.log('Doing page ' + pageName)
          var page = section[pageName]

          // set up some common things
          var outfile = path.join(ctx.cfg.htmlDir, pageName + '.html')
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
            fs.writeFile(outfile, html, done2)
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
            fs.writeFile(outfile, html, done2)
          }
          else if ( page.type === 'archive' ) {
            // render page
            console.log('archive page:', page)
            var locals = {
              cfg     : ctx.cfg,
              site    : ctx.site,
              self    : page,
            }
            // console.log('pageL', JSON.stringify(page, '  ', 2))
            console.log('cfg', locals.cfg)
            console.log('sdf', page.type)
            console.log('sdf', page.posts.length)
            page.posts.forEach(function(post) {
              console.log(' - title:', post.title)
              console.log(' - type:', post.type)
              console.log(' - published:', post.published)
            })
            // console.log('published', page.posts[1].published)
            var html = ctx.view.archive(locals)
            // console.log('locals', JSON.stringify(locals, '  ', 2))
            fs.writeFile(outfile, html, done2)
          }
          else {
            console.warn('Unknown page type : ', page.type)
          }

        },
        done1
      )
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = seagull

// --------------------------------------------------------------------------------------------------------------------
