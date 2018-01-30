const axios = require('axios')
const slug = require('slug')
const cuid = require('cuid')
const core = require('./core')
const config = require('./config')

async function fromStatusPageIO (url) {
  const res = await axios.get(`${url}/api/v1/incidents.json`)
  const body = res.data
  const incidents = body.incidents
  incidents.forEach(i => {
    const ti = {
      id: `${slug(i.name)}-${cuid.slug()}`.toLowerCase(),
      title: i.name,
      status: config.Statuses[i.status.toUpperCase()],
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      resolvedAt: i.resolved_at,
      updates: i.incident_updates.map(u => {
        return {
          message: u.body,
          status: config.Statuses[u.status.toUpperCase()],
          updatedAt: u.created_at
        }
      })
    }
    core.createIncident(ti, false)
  })
}
exports.fromStatusPageIO = fromStatusPageIO
