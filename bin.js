#!/usr/bin/env node

const dsp = require('./')
const config = require('./config')
let exec = help

if (process.argv.indexOf('--daemon') > -1 || process.argv.indexOf('-d') > -1) {
  exec = () => daemon({ ipfs: true })
}

if (process.argv.indexOf('--no-ipfs') > -1) {
  const idx = process.argv.indexOf('--no-ipfs') + 1
  exec = () => daemon({ ipfs: false, apiAddr: process.argv[idx] || config.IPFS.apiAddr })
}

exec()

function help () {
  console.log(`D StatusPage v${config.Version}`)
  console.log('USAGE:')
  console.log(' - start daemon: `dstatuspage --daemon`')
  console.log(' - start daemon without IPFS (only web client): `dstatuspage --no-ipfs [api_multiaddr]`')
  process.exit()
}

function daemon (opts) {
  dsp.daemon(opts)
}
