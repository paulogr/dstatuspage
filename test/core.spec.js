/* eslint-env mocha */

const assert = require('assert')
const core = require('../core')

describe('Core API', function () {
  describe('#createIncident()', function () {
    it('should break on empty incident', async function () {
      try {
        await core.createIncident(null)
      } catch (err) {
        assert.ok(err)
      }
    })
  })
})
