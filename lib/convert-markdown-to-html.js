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
  fmt.title('Convert Markdown to HTML ...')

  visitEveryPage(
    ctx,
    function (item, done) {
      item.html = marked(item.content)
      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
