// --------------------------------------------------------------------------------------------------------------------

// local
var fmt = require('../fmt.js')
var visitEveryDir = require('../visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createSitemap (ctx, callback) {
  fmt.arrow('Creating SiteMap')
  fmt.spacer()
  fmt.msg('Url:', true)

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
        fmt.li(thisUrl, true)
      })

      process.nextTick(done)
    },
    function (err) {
      if (err) return callback(err)
      fmt.spacer()
      // concat all the pages
      ctx.site['/'].page['sitemap.txt'] = {
        name: 'sitemap.txt',
        type: 'rendered',
        content: pages.join('\n') + '\n'
      }
      process.nextTick(callback)
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
