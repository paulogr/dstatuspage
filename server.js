const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const path = require('path')
const api = require('./api')
const config = require('./config')

class HTTPServer {
  constructor (dsp) {
    this.dsp = dsp
    this.app = express()
  }

  start () {
    return new Promise((resolve, reject) => {
      this.app.use(cors())
      this.app.use(compression())
      this.app.use(bodyParser.json())
      this.app.use('/assets', express.static(path.join(__dirname, 'public', 'client', 'assets')))
      this.app.use('/api', api.handler(this.dsp))
      this.app.get('/*', this._clientHandler)
      this.app.use(api.errorHandler)
      this.server = this.app.listen(config.Client.port, () => {
        console.log(`D StatusPage is running on port ${config.Client.host}:${config.Client.port}`)
        resolve()
      })
      this.server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`port ${config.Client.port} already in use`))
        } else {
          reject(err)
        }
      })
    })
  }

  stop () {
    return new Promise(resolve => {
      this.server.close(resolve)
    })
  }

  _clientHandler (req, res) {
    res.header('Content-Type', 'text/html')
    res.sendFile(path.join(__dirname, 'public', 'client', 'index.html'))
  }
}
module.exports = HTTPServer
