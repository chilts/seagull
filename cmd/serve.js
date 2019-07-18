// ----------------------------------------------------------------------------

// core
const http = require('http')

// npm
const finalhandler = require('finalhandler')
const serveStatic = require('serve-static')

// ----------------------------------------------------------------------------
// serve

function serve (args) {
  // Serve up public/ftp folder
  const serve = serveStatic('html', { index: ['index.html', 'index.htm'] })

  // Create server
  const server = http.createServer()
  server.on('request', (req, res) => {
    serve(req, res, finalhandler(req, res))
  })

  // Listen
  server.listen(3000, () => {
    console.log('Listening on port 3000. Press C-c to stop server.')
  })
}

// ----------------------------------------------------------------------------

module.exports = serve

// ----------------------------------------------------------------------------
