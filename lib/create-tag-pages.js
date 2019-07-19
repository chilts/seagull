// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')
var pad = require('./pad.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function createTagPages (ctx, callback) {
  fmt.title('Create Tag Pages ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      var posts = dir.posts

      // ok, let's create some tag pages for this directory
      fmt.li('tag')

      Object.keys(dir.tag).forEach(tagName => {
        const posts = dir.tag[tagName]

        const pageName = 'tag-' + tagName
        dir.page[pageName] = {
          title: 'Tag: ' + tagName,
          type: 'archive',
          posts,
        }
      })

      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
