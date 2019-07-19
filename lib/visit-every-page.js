// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var async = require('async')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function visitEveryPage (ctx, fn, callback) {
  function eachKey (site, doneSite) {
    console.log('eachKey() - site:', site)
    async.eachSeries(
      Object.keys(site),
      function (dirName, doneDir) {
        console.log('Inside visitEveryPage() - dirName:', dirName)
        const dir = site[dirName]

        async.eachSeries(
          Object.keys(dir.page),
          function (pageName, donePage) {
            console.log('Inside visitEveryPage() - pageName:', pageName)
            const page = dir.page[pageName]
            fn(page, donePage)
          },
          doneDir
        )
      },
      doneSite
    )
  }

  // kick it all off
  eachKey(ctx.site, callback)
}

// --------------------------------------------------------------------------------------------------------------------
