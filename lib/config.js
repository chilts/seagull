// ----------------------------------------------------------------------------

// core
const fs = require('fs')

// npm
const xtend = require('xtend')

// ----------------------------------------------------------------------------
// setup

// const loadConfig = {
//   init: false,
//   build: true,
//   serve: true,
//   watch: true,
//   version: false
// }

const CFG_DEFAULTS = {
  protocol: 'https',
  postsPerPage: 10,
  viewDir: 'views',
  contentDir: 'content',
  dataDir: 'data',
  staticDir: 'static',
  distDir: 'dist',
  includeDrafts: false,
  includeFutures: false
}

// ----------------------------------------------------------------------------

function load (filename, loadDefault) {
  if (loadDefault) {
    return Promise.resolve(CFG_DEFAULTS)
  }

  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, json) => {
      if (err) {
        return reject(err)
      }

      try {
        let cfg = JSON.parse(json)
        cfg = xtend({}, CFG_DEFAULTS, cfg)
        resolve(cfg)
      } catch (err) {
        reject(err)
      }
    })
  })
}

// ----------------------------------------------------------------------------

module.exports = {
  load
}

// ----------------------------------------------------------------------------
