const express = require('express')

exports.handler = (dsp) => {
  const api = express.Router()

  api.post('/incidents', handler(createIncident))
  api.put('/incidents', handler(updateIncident))
  api.get('/incidents', handler(getIncidents))
  api.get('/settings', handler(getSettings))
  api.put('/settings', handler(updateSettings))
  api.get('/status', handler(getStatus))
  api.get('/publish', handler(publish))

  return api

  function getIncidents (req, res, next) {
    return dsp.getIncidents()
  }

  function createIncident (req, res, next) {
    return dsp.createIncident(req.body)
  }

  function updateIncident (req, res, next) {
    return dsp.updateIncident(req.body)
  }

  function getSettings (req, res, next) {
    return dsp.getSettings()
  }

  function updateSettings (req, res, next) {
    return dsp.updateSettings(req.body, true)
  }

  function getStatus (req, res, next) {
    return dsp.getStatus()
  }

  function publish (req, res, next) {
    return dsp.publish()
  }
}

function handler (fn) {
  return async function (req, res, next) {
    try {
      res.json(await fn(req, res, next))
    } catch (err) {
      next(err)
    }
  }
}

function errorHandler (err, req, res, next) {
  res.status(500).json({ message: err.message })
}
exports.errorHandler = errorHandler
