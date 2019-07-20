// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function visitEveryDir (ctx, fn, callback) {
  function eachKey (obj, doneOuter) {
    async.eachSeries(
      Object.keys(obj),
      function (key, doneInner) {
        var item = obj[key]
        // console.log('vertex: Doing ' + key)

        // if there is a 'type', then this must be a page of some sort
        if (item.type) {
          // console.log('vertex:  - type=' + item.type)
          // nothing to do here
          return doneInner()
        } else {
          // another tree
          // console.log('vertex:  - recursing down another tree')

          // call the fn, then move on once that's done
          fn(key, item, doneInner)
        }
      },
      doneOuter
    )
  }

  // kick it all off
  eachKey(ctx.site, callback)
}

// --------------------------------------------------------------------------------------------------------------------
