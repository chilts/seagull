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

module.exports = function renderSite (ctx, callback) {
  fmt.arrow('Rendering Files')
  fmt.spacer()

  visitEveryDir(
    ctx,
    function (url, dir, doneDir) {
      fmt.msg(`Path '${url}'`, true)

      var pageNames = Object.keys(dir.page)
      async.eachSeries(
        pageNames,
        function (pageName, donePage) {

          var page = dir.page[pageName]
          // fmt.msg(`• page = ${pageName} (${page.type})`, true)

          // set up some common things
          var outfile = path.join(ctx.cfg.distDir, url, pageName)

          function donePageInternal(err) {
            if (err) return donePage(err)
            // fmt.msg(`✓ file = ${outfile}`, true)
            fmt.msg(`✓ ${pageName} -> ${outfile}`, true)
            donePage()
          }

          // 'post' is the only special type, all the rest just render their templates

          var locals
          var html
          if (page.type === 'page') {
            locals = {
              cfg: ctx.cfg,
              site: ctx.site,
              self: page,
              data: ctx.data
            }
            html = ctx.view.page(locals)
            outfile = outfile + '.html'
            fs.writeFile(outfile, html, donePageInternal)
          } else if (page.type === 'post') {
            locals = {
              cfg: ctx.cfg,
              site: ctx.site,
              self: page,
              data: ctx.data
            }
            html = ctx.view.post(locals)
            outfile = outfile + '.html'
            fs.writeFile(outfile, html, donePageInternal)
          } else if (page.type === 'archive') {
            locals = {
              cfg: ctx.cfg,
              site: ctx.site,
              self: page,
              data: ctx.data
            }
            html = ctx.view.archive(locals)
            outfile = outfile + '.html'
            fs.writeFile(outfile, html, donePageInternal)
          } else if (page.type === 'rendered') {
            // don't write an extension for this outfile
            fs.writeFile(outfile, page.content, donePageInternal)
          } else {
            locals = {
              cfg: ctx.cfg,
              site: ctx.site,
              self: page,
              data: ctx.data
            }
            html = ctx.view[page.type](locals)
            outfile = outfile + '.html'
            fs.writeFile(outfile, html, donePageInternal)
          }
        },
        err => {
          if (err) return doneDir()
          fmt.spacer()
          doneDir()
        }
      )
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
