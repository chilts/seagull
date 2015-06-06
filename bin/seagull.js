// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var async = require('async')
var fs = require('graceful-fs')
var readDirFiles = require('read-dir-files')
var xtend = require('xtend')
var marked = require('marked')
var jade = require('jade')
var fsExtra = require('fs-extra')

// --------------------------------------------------------------------------------------------------------------------
// setup

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

var defaults = {
  postsPerPage : 10,
  views : 'views',
  posts : 'posts',
  pages : 'pages',
  files : 'files',
  html  : 'html',
}

var configFilename = 'config.json'
var cfg = fs.readFileSync(configFilename, 'utf8')
cfg = xtend(defaults, JSON.parse(cfg))

var posts = {}
var pages = {}

var pageViewFilename = path.join(cfg.views, 'page.jade')
var pageView = jade.compileFile(pageViewFilename, {
  filename : pageViewFilename,
  pretty   : cfg.pretty || false,
})

var postViewFilename = path.join(cfg.views, 'post.jade')
var postView = jade.compileFile(postViewFilename, {
  filename : postViewFilename,
  pretty   : cfg.pretty || false,
})

// --------------------------------------------------------------------------------------------------------------------

var args = {} // from command line or config file

// firstly, read in all posts
async.series(
  [
    emptyHtmlDir,
    copyFilesToHtml,
    readAllPosts,
    readAllPages,
    renderPosts,
    renderPages
  ],
  finished
)

// --------------------------------------------------------------------------------------------------------------------

function emptyHtmlDir(done) {
  console.log('emptyHtmlDir(): entry')
  fsExtra.emptyDir(cfg.html, done)
}

function copyFilesToHtml(done) {
  console.log('copyFilesToHtml(): entry')
  fsExtra.copy(cfg.files, cfg.html, done)
}

function readAllFiles(dir, type, callback) {
  console.log('readAllFiles(): entry(%s, %s)', dir, type)
  var files = {}

  readDirFiles.read(dir, 'utf8', function (err, rawFiles) {
    if (err) return callback(err)

    console.log('rawFiles:', rawFiles)

    Object.keys(rawFiles).forEach(function(filename, i) {
      // if this is not a MarkDown file, ignore it
      if ( !filename.match(/\.md$/) ) {
        return
      }

      console.log('filename:', filename)

      // split for the meta information at the top
      var split = rawFiles[filename].split(/\n---\n/, 2)
      var meta = JSON.parse(split[0])
      var content = split[1] || ''

      // check some things
      if ( !meta.title ) {
        throw new Error("Required: File '" + dir + '/' + filename + "' has no title")
      }

      // save all this info
      var name = filename.substr(0, filename.length-3)
      files[name] = {
        meta    : meta,
        title   : meta.title,
        content : split[1],
        html    : marked(split[1]),
        type    : type,
      }
      if ( meta.published ) {
        files[name].published = new Date(meta.published)
      }
      else {
        files[name].published = false
      }

      console.log('filename:', filename)
    })

    console.log('calling back')
    callback(null, files)
  })
}

function readAllPosts(done) {
  console.log('readAllPosts(): entry')
  readAllFiles(cfg.posts, 'post', function(err, files) {
    if (err) return done(err)
    posts = files
    // console.log('posts:', posts)
    done()
  })
}

function readAllPages(done) {
  console.log('readAllPages(): entry')
  readAllFiles(cfg.pages, 'page', function(err, files) {
    if (err) return done(err)
    pages = files
    console.log('pages:', pages)
    done()
  })
}

function renderPosts(done1) {
  async.eachSeries(
    Object.keys(posts),
    function(name, done2) {
      console.log('Rendering post %s', name)
      var post = posts[name]

      // render page
      var locals = {
        cfg   : cfg,
        pages : pages,
        posts : posts,
        post  : post
      }
      var html = postView(locals)

      var outfile = path.join(cfg.html, name + '.html')
      fs.writeFile(outfile, html, done2)
    },
    done1
  )
}

function renderPages(done1) {
  async.eachSeries(
    Object.keys(pages),
    function(name, done2) {
      console.log('Rendering page %s', name)
      var page = pages[name]

      // render page
      var locals = {
        cfg   : cfg,
        pages : pages,
        posts : posts,
        page  : page
      }
      var html = pageView(locals)

      var outfile = path.join(cfg.html, name + '.html')
      fs.writeFile(outfile, html, done2)
    },
    done1
  )
}

function finished() {
  console.log('Finished')
}

// --------------------------------------------------------------------------------------------------------------------
