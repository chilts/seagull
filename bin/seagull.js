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
  viewDir    : 'views',
  contentDir : 'content',
  fileDir    : 'files',
  htmlDir    : 'html',
}

var configFilename = 'config.json'
var cfg = fs.readFileSync(configFilename, 'utf8')
cfg = xtend(defaults, JSON.parse(cfg))

var content = {}
var site = {}

var pageViewFilename = path.join(cfg.viewDir, 'page.jade')
var pageView = jade.compileFile(pageViewFilename, {
  filename : pageViewFilename,
  pretty   : cfg.pretty || false,
})

var postViewFilename = path.join(cfg.viewDir, 'post.jade')
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
    readAllContent,
    processContentToSite,
    renderPosts,
    renderPages
  ],
  finished
)

// --------------------------------------------------------------------------------------------------------------------

function emptyHtmlDir(done) {
  console.log('emptyHtmlDir(): entry')
  fsExtra.emptyDir(cfg.htmlDir, done)
}

function copyFilesToHtml(done) {
  console.log('copyFilesToHtml(): entry')
  fsExtra.copy(cfg.fileDir, cfg.htmlDir, done)
}

function readAllFiles(dir, callback) {
  console.log('readAllFiles(): entry(%s, %s)', dir)
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

      if ( meta.type !== 'page' && meta.type !== 'post' ) {
        throw new Error("Required: meta.type should be 'post' or 'page', not '" + meta.type + "'")
      }

      // save all this info
      var name = filename.substr(0, filename.length-3)
      files[name] = {
        meta    : meta,
        title   : meta.title,
        content : split[1],
        html    : marked(split[1]),
        type    : meta.type,
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

function readAllContent(done) {
  console.log('readAllContent(): entry')
  readAllFiles(cfg.contentDir, function(err, files) {
    if (err) return done(err)
    content = files
    console.log('content:', content)
    done()
  })
}

function processContentToSite(done) {
  console.log('processContentToSite(): entry')

  site = {
    site  : {},
    page  : {},
    post  : {},
    posts : [],
  }

  Object.keys(content).forEach(function(name) {
    var p = content[name]

    console.log('Examining item ' + name)
    console.log('Examining item ' + p.type)

    // if this page/post is not published, don't save it
    if ( !p.published ) {
      return
    }
    // if in the future, don't save it
    if ( p.published > new Date() ) {
      return
    }

    // save to site, no matter what
    site.site[name] = p

    // now add to 'page' or 'posts'
    if ( p.type === 'page' ) {
      site.page[name] = p
    }
    else if ( p.type === 'post' ) {
      site.post[name] = p
    }
    // else, shouldn't be any other type here (yet)
  })

  console.log('page:', site.page)
  console.log('post:', site.post)

  // now that we have all the posts, order them
  site.posts = Object.keys(site.post).map(function(name) {
    return site.post[name]
  }).sort(function(a, b) {
    return a.published > b.published
  })

  console.log('posts:', site.posts)

  process.nextTick(done)
}

function renderPosts(done1) {
  console.log('renderPosts(): entry')

  async.eachSeries(
    Object.keys(site.post),
    function(name, done2) {
      console.log('Rendering post %s', name)
      var post = site.post[name]

      // render page
      var locals = {
        cfg     : cfg,
        site    : site,
        content : content,
        post    : post,
      }
      var html = postView(locals)

      var outfile = path.join(cfg.htmlDir, name + '.html')
      fs.writeFile(outfile, html, done2)
    },
    done1
  )
}

function renderPages(done1) {
  console.log('renderPages(): entry')

  async.eachSeries(
    Object.keys(site.page),
    function(name, done2) {
      console.log('Rendering page %s', name)
      var page = site.page[name]

      // render page
      var locals = {
        cfg     : cfg,
        site    : site,
        content : content,
        page    : page,
      }
      var html = pageView(locals)

      var outfile = path.join(cfg.htmlDir, name + '.html')
      fs.writeFile(outfile, html, done2)
    },
    done1
  )
}

function finished() {
  console.log('Finished')
}

// --------------------------------------------------------------------------------------------------------------------
