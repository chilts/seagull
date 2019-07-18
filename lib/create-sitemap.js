// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createSitemap (ctx, callback) {
  fmt.title('Create RSS Feeds ...')

  var pages = []

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // for each (published) post and each (published) page
      Object.keys(dir.page).forEach(function (pageName) {
        let thisUrl = 'https://' + ctx.cfg.domain + url
        if (pageName !== 'index') {
          thisUrl = thisUrl + pageName + '.html'
        }
        pages.push(thisUrl)
      })

      process.nextTick(done)
    },
    function (err) {
      if (err) return callback(err)
      // concat all the pages
      ctx.site['/'].page['sitemap.txt'] = {
        type: 'rendered',
        content: pages.join('\n') + '\n'
      }
      process.nextTick(callback)
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
