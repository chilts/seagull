// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')
var marked = require('marked')

// local
var visitEveryPage = require('./visit-every-page.js')

// --------------------------------------------------------------------------------------------------------------------

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

module.exports = function convertMarkdownToHtml (ctx, callback) {
  fmt.arrow('Converting Markdown to HTML')
  fmt.spacer()
  fmt.msg('Page:', true)

  visitEveryPage(
    ctx,
    function (item, done) {
      if (item.type === 'rendered') {
        // console.log('Nothing to convert')
        fmt.msg(`✗ ${item.name} (pre-rendered)`, true)
        process.nextTick(done)
        return
      }
      if (!item.content) {
        // console.log('No Markdown to convert')
        fmt.msg(`✗ ${item.name} (no content)`, true)
        process.nextTick(done)
        return
      }

      // console.log('Converting Markdown ...')
      fmt.msg(`✓ ${item.name}`, true)
      item.html = marked(item.content)
      process.nextTick(done)
    },
    err => {
      if (err) return callback()
      fmt.spacer()
      callback()
    }
  )
}

// --------------------------------------------------------------------------------------------------------------------
