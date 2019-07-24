// ----------------------------------------------------------------------------

// npm
const chokidar = require('chokidar')

// local
const seagull = require('../lib/seagull.js')

// ----------------------------------------------------------------------------
// watch


function watch (opts, cfg, args) {
  function build () {
    // pass the opts and config to seagull
    seagull(opts, cfg, err => {
      if (err) throw err
    })
  }

  // watch the paths set in the config
  const watchPaths = ['config.json', cfg.contentDir, cfg.dataDir, cfg.staticDir, cfg.viewDir]

  const watcher = chokidar.watch(watchPaths, {
    ignoreInitial: true,
  })

  watcher.on('ready', () => {
    console.log('Initial scan complete ... watching ...')
    build()
  })

  watcher.on('add', path => {
    console.log(`Added ${path}`)
    build()
  })

  watcher.on('change', path => {
    console.log(`Changed ${path}`)
    build()
  })

  watcher.on('unlink', path => {
    console.log(`Removed ${path}`)
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
