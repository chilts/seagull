// ----------------------------------------------------------------------------

// npm
const chokidar = require('chokidar')

// local
const seagull = require('../lib/seagull.js')
const fmt = require('../lib/fmt.js')

// ----------------------------------------------------------------------------
// watch


function watch (opts, cfg, args) {
  function build () {
    // pass the opts and config to seagull
    seagull(opts, cfg, err => {
      if (err) throw err
      console.log()
      console.log('-------------------------------------------------------------------------------')
      console.log()
      fmt.arrow('Watching ...')
      console.log()
    })
  }

  // watch the paths set in the config
  const watchPaths = ['config.json', cfg.contentDir, cfg.dataDir, cfg.staticDir, cfg.viewDir]

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
  })

  watcher.on('ready', () => {
    fmt.msg('Initial scan complete ... watching ...')
    fmt.spacer()
    build()
  })

  watcher.on('add', path => {
    fmt.msg(`Added ${path}`)
    fmt.spacer()
    build()
  })

  watcher.on('change', path => {
    fmt.msg(`Changed ${path}`)
    fmt.spacer()
    build()
  })

  watcher.on('unlink', path => {
    fmt.msg(`Removed ${path}`)
    fmt.spacer()
    build()
  })

  watcher.on('error', err => {
    console.warn('Error:', err)
    process.exit(2)
  })
}

// ----------------------------------------------------------------------------

module.exports = watch

// ----------------------------------------------------------------------------
