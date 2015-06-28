// --------------------------------------------------------------------------------------------------------------------

// npm
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------
 
module.exports = function visitEveryPage(ctx, fn, callback) {

  function eachKey(obj, doneOuter) {
    async.eachSeries(
      Object.keys(obj),
      function(key, doneInner) {
        var item = obj[key]
        console.log('leaf: Doing ' + key)

        // if there is a 'type', then this must be a page of some sort
        if ( item.type ) {
          console.log('leaf:  - type=' + item.type)
          // do this function, then move on
          fn(item, doneInner)
        }
        else {
          // another tree
          console.log('leaf:  - recursing down another tree')
          eachKey(item, doneInner)
        }
      },
      doneOuter
    )
  }

  // kick it all off
  eachKey(ctx.site, callback)
}

// --------------------------------------------------------------------------------------------------------------------
