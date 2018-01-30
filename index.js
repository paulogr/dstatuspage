const DStatusPage = require('./core')
const HTTPServer = require('./server')

let dsp
let server

async function daemon (opts) {
  try {
    dsp = new DStatusPage()
    await dsp.startIPFS(opts)
    server = new HTTPServer(dsp)
    await server.start()
  } catch (err) {
    console.error('Unable do start D StatusPage:', err.message || err)
    cleanup()
  }
}
exports.daemon = daemon

// FIXME: cleanup do not waiting for async tasks
async function cleanup () {
  console.log('Shutting down...')
  if (server) await server.stop()
  if (dsp) await dsp.stopIPFS()
  console.log('Done.')
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
