const fs = require('fs')
const http = require('http')
const https = require('https')

module.exports = {}

module.exports.createServer = function createServer(app, { certPath, keyPath } = {}) {
  if (certPath || keyPath) {
    try {
      return https.createServer({
        cert: fs.readFileSync(certPath, 'utf8'),
        key: fs.readFileSync(keyPath, 'utf8'),
      }, app)
    } catch (err) {
      console.error('Failed creating https server:', err.message)
      console.error('Falling back to http server')
    }
  }

  return http.createServer(app)
}

module.exports.isSecure = function isSecure(server) {
  return !!server.requestCert
}
