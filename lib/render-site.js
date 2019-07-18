// --------------------------------------------------------------------------------------------------------------------

'use strict'

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

  visitEveryDir(
    ctx,
    function(url, dir, done) {
      console.log('Doing url ' + url)

      var pageNames = Object.keys(dir.page)
      async.eachSeries(
        pageNames,
        function(pageName, done2) {
          console.log('Analysing ' + pageName)
          var page = dir.page[pageName]

          // set up some common things
          var outfile = path.join(ctx.cfg.htmlDir, url, pageName)

          // 'post' is the only special type, all the rest just render their templates

          var locals
          var html
          if ( page.type === 'page' ) {
            // render page
            console.log('Rendering page %s', pageName)
            locals = {
              cfg  : ctx.cfg,
              site : ctx.site,
              self : page,
              data : ctx.data,
            }
            html = ctx.view.page(locals)
            fs.writeFile(outfile + '.html', html, done2)
          }
          else if ( page.type === 'post' ) {
            // render page
            console.log('Rendering post %s', pageName)
            locals = {
              cfg  : ctx.cfg,
              site : ctx.site,
              self : page,
              data : ctx.data,
            }
            html = ctx.view.post(locals)
            fs.writeFile(outfile + '.html', html, done2)
          }
          else if ( page.type === 'archive' ) {
            // render page
            console.log('Rendering archive:', pageName)
            locals = {
              cfg  : ctx.cfg,
              site : ctx.site,
              self : page,
              data : ctx.data,
            }
            html = ctx.view.archive(locals)
            fs.writeFile(outfile + '.html', html, done2)
          }
          else if ( page.type === 'rendered' ) {
            // don't write an extension for this outfile
            console.log('Rendering pre-rendered:', pageName)
            fs.writeFile(outfile, page.content, done2)
          }
          else {
            // render page
            console.log('Rendering page type:', page.type)
            locals = {
              cfg  : ctx.cfg,
              site : ctx.site,
              self : page,
              data : ctx.data,
            }
            html = ctx.view[page.type](locals)
            fs.writeFile(outfile + '.html', html, done2)
          }

        },
        done
      )
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
