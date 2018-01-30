/* eslint-env mocha */

// const assert = require('assert')
const importer = require('../importer')

describe('Importer', function () {
  describe('#import()', function () {
    it('just test', async function () {
      this.timeout(10000)
      importer.fromStatusPageIO('https://c0nql3j2x52j.statuspage.io')
    })
  })
})
