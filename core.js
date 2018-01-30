const low = require('lowdb')
const slug = require('slug')
const cuid = require('cuid')
const DSPIpfs = require('./ipfs')
const config = require('./config')

const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(config.Client.path)

class DStatusPage {
  constructor () {
    this.ipfs = undefined
    this.db = low(adapter)
    this.db.defaults(config.DefaultDatabase).write()
  }

  async startIPFS (opts) {
    this.ipfs = new DSPIpfs(opts)
    await this.ipfs.start()
    const [ gateway, peer ] = await Promise.all([
      this.ipfs.getGatewayAddress(),
      this.ipfs.id()
    ])
    .catch(err => {
      if (err.code === 'ECONNREFUSED') {
        throw new Error(`Unable to connect to IPFS api at: ${opts.apiAddr}`)
      }
      throw err
    })
    this.updateSettings({ ipfs: { peer, gateway } })
  }

  stopIPFS () {
    return this.ipfs.stop()
  }

  async createIncident (incident) {
    if (!incident) {
      throw new Error('Incident is empty')
    }
    if (!incident.updates || incident.updates.length === 0) {
      throw new Error('Incident has no updates')
    }
    const id = `${slug(incident.title)}-${cuid.slug()}`.toLowerCase()
    const timestamp = new Date().toISOString()
    incident.id = id
    incident.createdAt = timestamp
    incident.status = incident.updates[0].status || incident.status
    incident.resolvedAt = incident.status === config.Statuses.RESOLVED ? timestamp : undefined
    incident.updates[0].status = incident.status
    incident.updates[0].updatedAt = timestamp
    const result = this.db.get('incidents').unshift(incident).write()
    if (!result[0].id) {
      throw new Error('Unable to create incident.')
    }
    this.db.set('unpublishedChanges', true).write()
    return { id }
  }

  async updateIncident (incident) {
    if (!incident) {
      throw new Error('Incident is empty')
    }
    if (!incident.id) {
      throw new Error('Incident has no ID')
    }
    if (!incident.updates || incident.updates.length === 0) {
      throw new Error('Incident has no updates')
    }
    const found = await this.db.get('incidents').find({ id: incident.id }).value()
    if (!found) {
      throw new Error('Incident not found')
    }
    const timestamp = new Date().toISOString()
    const update = incident.updates[incident.updates.length - 1]
    update.updatedAt = timestamp
    found.title = incident.title || found.title
    found.severity = incident.severity || found.severity
    found.services = incident.services || found.services
    found.status = update.status || found.status
    found.resolvedAt = found.status === config.Statuses.RESOLVED ? timestamp : undefined
    found.updatedAt = timestamp
    found.updates.unshift(update)
    const updated = this.db.get('incidents').find({ id: incident.id }).assign(found).write()
    if (!updated.updatedAt === timestamp) {
      throw new Error('Unable to update incident.')
    }
    this.db.set('unpublishedChanges', true).write()
    return { incident: updated }
  }

  getIncidents () {
    const incidents = this.db.get('incidents').value()
    const open = []
    const history = []
    incidents.forEach(i => {
      if (i.status === config.Statuses.RESOLVED) {
        history.push(i)
      } else {
        open.push(i)
      }
    })
    return { open, history }
  }

  getSettings () {
    return this.db.get('settings').value()
  }

  updateSettings (settings, unpublished) {
    const current = this.db.get('settings').value()
    const updated = this.db.set('settings', { ...current, ...settings, ipfs: { ...current.ipfs, ...settings.ipfs } }).write()
    if (unpublished === true) {
      this.db.set('unpublishedChanges', true).write()
    }
    return updated
  }

  async publish () {
    const hash = await this.ipfs.publish(this.getIncidents(), this.getSettings())
    this.updateSettings({ ipfs: { hash } })
    this.db.set('unpublishedChanges', false).write()
    return hash
  }

  async getStatus () {
    const peers = await this.ipfs.getConnectedPeers()
    const unpublishedChanges = this.db.get('unpublishedChanges').value()
    return { peers: peers.length, unpublishedChanges }
  }
}
module.exports = DStatusPage
