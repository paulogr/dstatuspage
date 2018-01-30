const DaemonFactory = require('ipfsd-ctl')
const ipfsApi = require('ipfs-api')
const fs = require('fs')
const multiaddr = require('multiaddr')
const generator = require('./generator')
const config = require('./config')

class DSPIpfs {
  constructor ({ ipfs, apiAddr }) {
    this.initialize = ipfs
    this.apiAddr = apiAddr
    this.node = undefined
    this.api = undefined
  }

  start () {
    if (this.initialize === true) {
      console.log('Initializing IPFS...')
      return this._startIpfsDaemon()
    } else {
      this.api = ipfsApi(this.apiAddr || config.IPFS.apiAddr)
      return Promise.resolve()
    }
  }

  stop () {
    if (this.initialize === true) {
      return this._stopIpfsDaemon()
    } else {
      Promise.resolve()
    }
  }

  id () {
    return this.api.id()
  }

  async getGatewayAddress () {
    const addr = multiaddr(await this.api.config.get('Addresses.Gateway'))
    const gtwAddr = addr.nodeAddress()
    return `//${gtwAddr.address}:${gtwAddr.port}`
  }

  getConnectedPeers () {
    return this.api.swarm.peers()
  }

  async publish (incidents, settings) {
    const homeFile = {
      path: `/${config.IPFS.namespace}/index.html`,
      content: generator.buildHomePage(incidents, settings)
    }
    const incidentFiles = [ ...incidents.open || [], ...incidents.history || [] ].map(i => {
      return {
        path: `/${config.IPFS.namespace}/incidents/${i.id}.html`,
        content: generator.buildIncidentPage(i, settings)
      }
    })
    try {
      const files = await this.api.files.add([ homeFile, ...incidentFiles ])
      const { hash } = files.filter(f => f.path === config.IPFS.namespace)[0]
      await this.api.name.publish(`/ipfs/${hash}`)
      return hash
    } catch (err) {
      throw new Error('Unable to publish: ', err)
    }
  }

  _startIpfsDaemon () {
    return new Promise((resolve, reject) => {
      const df = DaemonFactory.create({ type: 'go' })
      const options = {
        disposable: false,
        config: {
          Bootstrap: config.IPFS.bootstrap
        }
      }
      const startNode = () => {
        this.node.start((err, ipfsapi) => {
          if (err) reject(err)
          this.api = ipfsapi
          console.log('IPFS ready.')
          resolve()
        })
      }
      df.spawn(options, (err, ipfsd) => {
        if (err) reject(err)
        this.node = ipfsd
        if (fs.existsSync(this.node.repoPath)) {
          startNode()
        } else {
          this.node.init((err, ipfsd) => {
            if (err) reject(err)
            this.node = ipfsd
            startNode()
          })
        }
      })
    })
  }

  _stopIpfsDaemon () {
    return new Promise(resolve => {
      this.node.stop(resolve)
    })
  }
}

module.exports = DSPIpfs
