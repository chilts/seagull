// --------------------------------------------------------------------------------------------------------------------

// core
var path = require('path')

// npm
var fmt = require('fmt')
var async = require('async')

// local
var fs = require('graceful-fs')
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function renderSite(ctx, callback) {
  fmt.title('Render Site ...')

  var paths = Object.keys(ctx.site)

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
