const os = require('os')
const path = require('path')

exports.Version = require('./package.json').version

exports.Statuses = {
  INVESTIGATING: 'Investigating',
  IDENTIFIED: 'Identified',
  MONITORING: 'Monitoring',
  RESOLVED: 'Resolved'
}

exports.Severity = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
}

exports.ServiceStatuses = {
  OPERATIONAL: 'Operational',
  UNDER_MAINTENANCE: 'Under Maintenance',
  DEGRADED_PERFORMANCE: 'Degraded Performance',
  MAJOR_OUTAGE: 'Major Outage'
}

exports.IPFS = {
  apiAddr: '/ip4/127.0.0.1/tcp/5001',
  namespace: 'dstatuspage',
  bootstrap: [
    '/ip4/192.241.170.62/tcp/4001/ipfs/QmW6wT9zVoaprMyrxnSwWCXDtcLvFRgcQBdpeHFr6Utn2W',
    '/ip4/139.59.155.119/tcp/4001/ipfs/Qmd1ih1unFQSsNdjpRbPkjH7W4xwfo9weBt6n58CJu3HvJ',
    '/dnsaddr/bootstrap.libp2p.io/ipfs/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    '/dnsaddr/bootstrap.libp2p.io/ipfs/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dnsaddr/bootstrap.libp2p.io/ipfs/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dnsaddr/bootstrap.libp2p.io/ipfs/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
    '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
    '/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
    '/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
    '/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
    '/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd'
  ]
}

exports.Client = {
  path: path.join(os.homedir(), '.dstatuspage'),
  host: 'http://localhost',
  port: 7200
}

exports.DefaultDatabase = {
  incidents: [],
  settings: {
    company: 'DStatusPage',
    title: 'Decentralized StatusPage'
  },
  unpublishedChanges: false
}
