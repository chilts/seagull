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

var months = {
  '01' : 'Jan', '02' : 'Feb', '03' : 'Mar', '04' : 'Apr',
  '05' : 'May', '06' : 'Jun', '07' : 'Jul', '08' : 'Aug',
  '09' : 'Sep', '10' : 'Oct', '11' : 'Nov', '12' : 'Dec',
}

var configFilename = 'config.json'
var cfg = fs.readFileSync(configFilename, 'utf8')
cfg = xtend(defaults, JSON.parse(cfg))

var content = {}
var site = {}

var view = {}
var viewNames = [ 'index', 'page', 'post', 'archive' ]
viewNames.forEach(function(name) {
  var filename = path.join(cfg.viewDir, name + '.jade')
  view[name] = jade.compileFile(filename, {
    filename : filename,
    pretty   : cfg.pretty || false,
  })
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
    renderPages,
    renderSite
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

  // now that we have all the posts, order them in ascending order (oldest first, newest last)
  site.posts = Object.keys(site.post).map(function(name) {
    return site.post[name]
  }).sort(function(a, b) {
    return a.published > b.published
  })

  console.log('posts:', site.posts)

  // let's put the last `postsPerPage` onto the main index page
  site.site.index = {
    title : cfg.title,
    type  : 'index',
    posts : site.posts.reverse().slice(0, cfg.postsPerPage),
  }

  // create the archive pages
  site.posts.forEach(function(post) {
    console.log('post for archive:', post)
    var d = post.published
    console.log('year:', d.getFullYear())
    console.log('month:', d.getMonth() )
    console.log('day:', d.getDay())

    post.year = d.getFullYear()
    post.month = d.getMonth() + 1
    post.day = d.getDay()

    // push onto this year's posts
    var yearName = 'archive-' + post.year
    if ( !site.site[yearName] ) {
      site.site[yearName] = {
        title : 'Archive for ' + post.year,
        posts : [],
        type  : 'archive',
      }
    }
    site.site[yearName].posts.push(post)

    // push onto this months posts
    var monthName = 'archive-' + post.year + '-' + pad2(post.month)
    if ( !site.site[monthName] ) {
      site.site[monthName] = {
        title : 'Archive for ' + months[pad2(post.month)],
        posts : [],
        type  : 'archive',
      }
    }
    site.site[monthName].posts.push(post)
  })

  console.log('index:', site.site.index)
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
        self    : post,
      }
      var html = view.post(locals)

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
        self    : page,
      }
      var html = view.page(locals)

      var outfile = path.join(cfg.htmlDir, name + '.html')
      fs.writeFile(outfile, html, done2)
    },
    done1
  )
}

function renderSite(done1) {
  console.log('renderSite(): entry')

  var htmlPages = Object.keys(site.site)

  async.eachSeries(
    htmlPages,
    function(name, done2) {
      console.log('- rendering %s', name)
      var thisPage = site.site[name]

      // render the index page
      if ( thisPage.type === 'index' ) {
        // render page
        var locals = {
          cfg  : cfg,
          site : site,
          self : thisPage, // title, type='index', posts=[...]
        }
        console.log('locals:', locals)
        console.log('locals.self.posts:', locals.self.posts)
        var html = view.index(locals)

        var outfile = path.join(cfg.htmlDir, name + '.html')
        fs.writeFile(outfile, html, done2)
      }
      else if ( thisPage.type === 'archive' ) {
        console.log('Rendering archive : ', thisPage)
        // render page
        var locals = {
          cfg  : cfg,
          site : site,
          self : thisPage, // title, type='archive', posts=[...]
        }
        console.log('locals:', locals)
        console.log('locals.self.posts:', locals.self.posts)
        var html = view.archive(locals)

        var outfile = path.join(cfg.htmlDir, name + '.html')
        fs.writeFile(outfile, html, done2)
      }
      else {
        // don't know this 'data.type'
        process.nextTick(done2)
      }
    },
    done1
  )
}

function finished() {
  console.log('Finished')
}

// --------------------------------------------------------------------------------------------------------------------
// utility

function pad2(n) {
  if ( n < 10 ) {
    return '0' + n
  }
  return '' + n
}

// ------------------------------------------------------------------------------------------------------------------

