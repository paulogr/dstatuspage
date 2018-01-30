/* eslint-env mocha */

const assert = require('assert')
const ipfs = require('../ipfs')
const core = require('../core')

describe('IPFS', function () {
  before('Initializing node', function () {
    return ipfs.start()
  })

  after('Stoping node', function () {
    return ipfs.stop()
  })

  describe('#publish()', function () {
    it('should return the published hash', async function () {
      const hash = await ipfs.publish({
        open: [
          {
            id: 'teste-incident-01',
            title: 'Test incident 01',
            status: 'Investigating',
            updates: [{ status: 'Investigating', message: 'Just a test' }]
          }
        ],
        history: [
          {
            id: 'teste-incident-01',
            title: 'Test incident 01',
            status: 'Investigating',
            updates: [{ status: 'Investigating', message: 'Just a test' }]
          }
        ]
      }, {
        title: 'Test Page',
        company: 'Test Company'
      })
      assert.notEqual(undefined, hash, `Got: ${hash}`)
    })
    it('just publish and não me irrita', async function () {
      const hash = await ipfs.publish(core.getIncidents(), core.getSettings())
      console.log(hash)
      assert.ok(hash)
    })
  })
  describe('#getConnectedPeers', function () {
    it('should return the connected peers', async function () {
      const peers = await ipfs.getConnectedPeers()
      console.log(peers)
    })
  })
})
