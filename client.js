require('formdata-polyfill')
const choo = require('choo')
const html = require('choo/html')
const devtools = require('choo-devtools')
const dt = require('date-fns/format')
const config = require('./config')
const axios = require('axios')

// const SEVERITY_VALUES = Object.keys(config.Severity).map(k => config.Severity[k])
const INCIDENT_STATUS_VALUES = Object.keys(config.Statuses).map(k => config.Statuses[k])

const app = choo()
app.mount('div#dsp')

if (process.env.NODE_ENV !== 'production') {
  app.use(devtools())
}

app.use(function (state, emitter) {
  state.events.INCIDENT_SET = 'incident:set'
  state.events.INCIDENT_CREATE = 'incident:create'
  state.events.INCIDENT_UPDATE = 'incident:update'
  state.events.SETTINGS_UPDATE = 'settings:update'
  state.events.IPFS_STATUS = 'ipfs:status'
  state.events.FLASH_SET = 'flash:set'
  state.events.PUBLISH = 'publish'
  state.events.LOADING = 'loading'
  state.events.UNPUBLISHED_CHANGES = 'unpublished'

  if (!state.incidents) {
    state.incidents = {
      open: [],
      history: []
    }
  }
  if (!state.incident) {
    state.incident = {
      updates: []
    }
  }
  if (!state.settings) {
    state.settings = {
      ipfs: {
        peer: {}
      }
    }
  }
  if (!state.status) {
    state.status = {}
  }

  emitter.on('DOMContentLoaded', async function () {
    emitter.on(state.events.INCIDENT_SET, setIncident)
    emitter.on(state.events.INCIDENT_CREATE, createIncident)
    emitter.on(state.events.INCIDENT_UPDATE, updateIncident)
    emitter.on(state.events.SETTINGS_UPDATE, updateSettings)
    emitter.on(state.events.IPFS_STATUS, getIpfsStatus)
    emitter.on(state.events.FLASH_SET, setFlash)
    emitter.on(state.events.PUBLISH, publish)
    emitter.on(state.events.LOADING, loading)
    emitter.on(state.events.UNPUBLISHED_CHANGES, unpublishedChanges)
    emitter.on('navigate', navigate)

    const [ incidents, settings, status ] = await Promise.all([
      api('incidents'),
      api('settings'),
      api('status')
    ])
    state.incidents = incidents
    state.settings = settings
    state.status = status

    document.body.className = 'dsp-ready'
    emitter.emit('navigate')

    function setFlash (flash) {
      const isError = typeof flash === 'object'
      state.flash = html`
        <div class="flash ${isError ? 'error' : ''}">
          ${isError ? flash.message : flash}
        </div>
      `
    }

    function loading (show) {
      state.loading = show || false
    }

    function unpublishedChanges (unpublished) {
      state.status.unpublishedChanges = unpublished
    }

    function setIncident (id) {
      state.incident = [ ...state.incidents.open, ...state.incidents.history ].filter(i => i.id === id)[0]
      emitter.emit('render')
    }

    async function createIncident (form) {
      const incident = {
        title: form.title,
        severity: form.severity,
        status: form.status,
        updates: [
          { message: form.message, status: form.status }
        ]
      }
      const data = await api('incidents', 'POST', incident)
      if (data.id) {
        state.settings.ipfs.hash = data.hash
        state.incidents = await api('incidents')
        emitter.emit(state.events.FLASH_SET, 'Successfully Created')
        emitter.emit(state.events.UNPUBLISHED_CHANGES, true)
        emitter.emit('pushState', '/')
      }
    }

    async function updateIncident (form) {
      const incident = {
        id: form.id,
        status: form.status,
        updates: [
          { message: form.message, status: form.status }
        ]
      }
      const data = await api('incidents', 'PUT', incident)
      if (data.incident) {
        state.settings.ipfs.hash = data.hash
        state.incidents = await api('incidents')
        emitter.emit(state.events.FLASH_SET, 'Successfully Updated')
        emitter.emit(state.events.UNPUBLISHED_CHANGES, true)
        emitter.emit('pushState', '/')
      }
    }

    async function updateSettings (form) {
      await api('settings', 'PUT', form)
      state.settings = Object.assign({}, state.settings, form)
      emitter.emit(state.events.FLASH_SET, 'Successfully Updated')
      emitter.emit(state.events.UNPUBLISHED_CHANGES, true)
      emitter.emit('render')
    }

    async function getIpfsStatus () {
      const res = await api('status')
      state.status = res
      emitter.emit('render')
    }

    async function publish () {
      emitter.emit(state.events.LOADING, true)
      emitter.emit('render')
      state.settings.ipfs.hash = await api('publish')
      emitter.emit(state.events.LOADING, false)
      emitter.emit(state.events.FLASH_SET, 'Status page has been published')
      emitter.emit(state.events.UNPUBLISHED_CHANGES, false)
      emitter.emit('render')
    }

    function navigate () {
      state.flash = undefined
      switch (state.route) {
        case 'incidents/:id':
          emitter.emit(state.events.INCIDENT_SET, state.params.id)
          break
        case 'meta':
          emitter.emit(state.events.IPFS_STATUS)
      }
    }

    function api (url, method, data) {
      const opts = {
        method: method || 'GET',
        header: { 'Content-Type': 'application/json' },
        data
      }
      return axios(`/api/${url}`, opts)
        .then(res => res.data)
        .catch(err => {
          emitter.emit(state.events.FLASH_SET, err)
          emitter.emit('render')
          throw err
        })
    }
  })
})

app.route('/', function (state, emit) {
  const incidents = state.incidents
  let openIncidents = html`
    <div class="empty">
      You don't have any open incident.
    </div>
  `
  if (incidents.open.length > 0) {
    openIncidents = incidents.open.map(i => {
      return html`
        <div class="item">
          <div class="header">
            ${i.title}
            <div class="action">
              <a href="/incidents/${i.id}">Update Incident</a>
            </div>
          </div>
          <div class="content">
            ${i.updates.map(u => {
              return html`
                <div>
                  <p><b>${u.status}</b> - ${u.message}</p>
                  <small>${dt(u.updatedAt, 'MMM DD - HH:mm:ss (Z)')}</small>
                </div>
              `
            })}
          </div>
        </div>
      `
    })
  }
  let historyIncidents = html`
    <div class="empty">
      You don't have any history yet.
    </div>
  `
  if (incidents.history.length > 0) {
    historyIncidents = incidents.history.map(i => {
      return html`
        <div>
          <h3><a href="/incidents/${i.id}">${i.title}</a></h3>
          <p>${i.updates[0].message}</p> 
          <small>${dt(i.updates[0].updatedAt, 'MMM DD, YYYY - HH:mm:ss (Z)')}</small>
        </div>
      `
    })
  }
  return tpl(html`
    <div class="dashboard">
      ${state.loading === true ? loading() : ''}
      ${state.flash}
      <h1>Dashboard</h1>
      <div class="title">
        <div>
          <h2>Open Incidents</h2>
        </div>
        <div>
          <a class="button" target="_blank" href="${state.settings.ipfs.gateway}/ipns/${state.settings.ipfs.peer.id}">View your status page</a>
          <button class="button publish" onclick="${() => emit(state.events.PUBLISH)}" ${state.status.unpublishedChanges === true ? '' : 'disabled'}">Publish now</a>
        </div>
      </div>
      <div class="list">
        ${openIncidents}
      </div>
      <h2>Incident History</h2>
      ${historyIncidents}
    </div>
  `)
})

app.route('/create', function (state, emit) {
  const submited = (form) => emit(state.events.INCIDENT_CREATE, form)
  return tpl(html`
    <div class="incident">
      <h1>Create Incident</h1>
      ${state.flash}
      <form onsubmit=${submit(submited)}>
        <dl>
          <dt>Title: </dt>
          <dd><input type="text" name="title" autofocus required /></dd>
        </dl>
        <dl>
          <dt>Message: </dt>
          <dd><textarea name="message" autofocus required></textarea></dd>
        </dl>
        <dl>
          <dt>Incident status: </dt>
          <dd>${radios('status', INCIDENT_STATUS_VALUES)}</dd>
        </dl>
        <input type="submit" value="Create" />
      </form>
    </div>
  `)
})

app.route('/incidents/:id', function (state, emit) {
  const i = state.incident
  const submited = (form) => emit(state.events.INCIDENT_UPDATE, form)
  return tpl(html`
    <div class="incident">
      <h1>${i.title}</h1>
      ${state.flash}
      <dl>
        <dt>Incident status: </dt>
        <dd>${i.status}</dd>
      </dl>
      <dl>
        <dt>Created at: </dt>
        <dd>${dt(i.createdAt, 'MMM DD, YYYY - HH:mm:ss (Z)')}</dd>
      </dl>
      <dl>
        <dt>Last updated at: </dt>
        <dd>${i.updatedAt ? dt(i.updatedAt, 'MMM DD, YYYY - HH:mm:ss (Z)') : '-'}</dd>
      </dl>
      <dl>
        <dt>Resolved at: </dt>
        <dd>${i.resolvedAt ? dt(i.resolvedAt, 'MMM DD, YYYY - HH:mm:ss (Z)') : '-'}</dd>
      </dl>
      <h2>New Update</h2>
      <form onsubmit=${submit(submited)}>
        <dl>
          <dt>Message: </dt>
          <dd><textarea name="message" autofocus required></textarea></dd>
        </dl>
        <dl>
          <dt>Incident status: </dt>
          <dd>${radios('status', INCIDENT_STATUS_VALUES)}</dd>
        </dl>
        <input type="hidden" name="id" value="${i.id}" />
        <input type="submit" value="Update" />
      </form>
      <h2>Updates</h2>
      <div class="list">
        ${i.updates.map(u => {
          return html`
            <div class="item">
              <div class="content">
                <p><b>${u.status}</b> -- ${u.message}</p>
                <small>${dt(u.updatedAt, 'MMM DD, YYYY - HH:mm:ss (Z)')}</small>
              </div>
            </div>
          `
        })}
      </div>
    </div>
  `)
})

app.route('/meta', function (state, emit) {
  const ipfs = state.settings.ipfs
  const status = state.status
  let hash = '-'
  if (ipfs.hash) {
    hash = html`<a target="_blank" href="${ipfs.gateway}/ipfs/${ipfs.hash}">${ipfs.hash}</a>`
  }
  return tpl(html`
    <div class="meta">
      <h1>Meta Status</h1>
      ${state.flash}
      <p>You are running D StatusPage version <span style="font-weight:600;">v${config.Version}</span></p>
      <h2>IPFS</h2>
      <dl>
        <dt>Node status: </dt>
        <dd><span style="color:${status.peers > 0 ? 'green' : 'red'}; font-weight:600;">${status.peers > 0 ? 'Online' : 'Offline'}</span></dd>
      </dl>
      <dl>
        <dt>Peer id: </dt>
        <dd><a target="_blank" href="${ipfs.gateway}/ipns/${ipfs.peer.id}">${ipfs.peer.id}</a></dd>
      </dl>
      <dl>
        <dt>Last published hash: </dt>
        <dd>${hash}</dd>
      </dl>
      <dl>
        <dt>Connected peers: </dt>
        <dd>${status.peers || 0}</dd>
      </dl>
      <dl>
        <dt>Version: </dt>
        <dd>${ipfs.peer.agentVersion}</dd>
      </dl>
      <dl>
        <dt>Protocol: </dt>
        <dd>${ipfs.peer.protocolVersion}</dd>
      </dl>
    </div>
  `)
})

app.route('/settings', function (state, emit) {
  const submited = (form) => emit(state.events.SETTINGS_UPDATE, form)
  const settings = state.settings
  return tpl(html`
    <div class="settings">
      <h1>Settings</h1>
      ${state.flash}
      <h2>General</h2>
      <form onsubmit=${submit(submited)}>
        <dl>
          <dt>Page title: </dt>
          <dd><input type="text" name="title" value="${settings.title}" required /></dd>
        </dl>
        <dl>
          <dt>Company name: </dt>
          <dd><input type="text" name="company" value="${settings.company}" autofocus required /></dd>
        </dl>
        <input type="submit" value="Update" />
      </form>
    </div>
  `)
})

app.route('/*', function (state, emit) {
  return tpl(html`
    <div class="notfound">
      <a href="/">Not found, navigate
    </div>
  `)
})

function tpl (view) {
  return html`
    <div id="dsp">
      <div class="main">
        <div class="fixed">
          ${view}
        </div>
      </div>
    </div>
  `
}

/**
 * Helpers`
 */

function radios (name, values) {
  return values.map(v => {
    return html`<label><input name="${name}" value="${v}" type="radio" required /> ${v}<br /></label>`
  })
}

function submit (cb) {
  return function (ev) {
    ev.preventDefault()
    const data = new FormData(ev.currentTarget)
    const form = {}
    for (var pair of data.entries()) {
      form[pair[0]] = pair[1]
    }
    cb(form)
  }
}

function loading () {
  return html`
    <div class="loading">
      <div class="content">
        <div class="sk-cube-grid">
          <div class="sk-cube sk-cube1"></div>
          <div class="sk-cube sk-cube2"></div>
          <div class="sk-cube sk-cube3"></div>
          <div class="sk-cube sk-cube4"></div>
          <div class="sk-cube sk-cube5"></div>
          <div class="sk-cube sk-cube6"></div>
          <div class="sk-cube sk-cube7"></div>
          <div class="sk-cube sk-cube8"></div>
          <div class="sk-cube sk-cube9"></div>
        </div>
        <div class="message">
          <p>Publishing to IPNS...</p>
          <small>wait, publishing can take up to 30s</small>
        </div>
      </div>
    </div>
  `
}
