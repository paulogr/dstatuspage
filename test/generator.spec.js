/* eslint-env mocha */

const assert = require('assert')
const generator = require('../generator')

describe('Generator', function () {
  let content
  const expectedContent = '<!DOCTYPEhtml><htmllang="en"><head><metacharset="UTF-8"><metaname="viewport"content="width=device-width,initial-scale=1.0"><title></title><style>html,body{margin:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,"SegoeUI",Roboto,Helvetica,Arial,sans-serif,"AppleColorEmoji","SegoeUIEmoji","SegoeUISymbol";}a{color:#444;font-weight:normal;text-decoration:underline;}header{max-width:990px;margin:0auto;text-align:center;padding:50px;margin-bottom:10px;box-sizing:border-box;}footer{text-align:right;max-width:990px;margin:7pxauto;}small{display:block;line-height:35px;color:#7B8084;}dt{float:left;font-weight:400;font-size:1.25rem;}dd{margin-left:280px;}.scroll{height:calc(100%-33px);overflow-x:scroll;}.content{margin:0auto;max-width:990px;}.list.item{/*border:2pxsolid#444;*/border:1pxsolid#d1d5da;margin-bottom:10px;overflow:hidden;}.list.item.header{font-weight:bold;padding:12px;background-color:#444;color:#fff;}.list.item.content{padding:12px;}.list.item.contentp{margin:0;}.list.item.header.action{float:right;}.list.item.header.actiona{color:#fff;}.homeheader{font-size:34px;font-weight:bold;background-color:#eee;}.incidentheaderh1{font-weight:600;margin-bottom:0;}.incidentheaderh3{color:#7B8084;margin-top:5px;font-weight:400;}.incident.report{border-bottom:solid1px#d1d5da;margin-bottom:15px;padding-bottom:40px;}.incidenta{font-size:18px;font-weight:bold;}.incidentsmall{line-height:70px;}</style></head><body><divclass="scroll"><divclass="content"><divclass="home"><header>DescentralizedStatusPage</header><h1>OpenIncidents</h1><divclass="list"><divclass="item"><divclass="header">Testincident01<divclass="action"><aclass="button"href="incidents/teste-incident-01.html">Viewdetails</a></div></div><divclass="content"><p><b>Investigating</b>-Justatest</p><small>InvalidDate</small></div></div><divclass="item"><divclass="header">Testincident02<divclass="action"><aclass="button"href="incidents/teste-incident-02.html">Viewdetails</a></div></div><divclass="content"><p><b>Monitoring</b>-Justanothertest</p><small>InvalidDate</small></div></div></div></div></div></div><footer>Poweredby<atarget="_blank"href="https://www.statuspage.co/">DStatusPage</a>on<atarget="_blank"href="https://ipfs.io/">IPFS</a></footer></body></html>'
  describe('#build()', function () {
    it('should generate a template buffer', function () {
      const incidents = [
        {
          id: 'teste-incident-01',
          title: 'Test incident 01',
          status: 'Investigating',
          updates: [{ status: 'Investigating', message: 'Just a test' }]
        },
        {
          id: 'teste-incident-02',
          title: 'Test incident 02',
          status: 'Monitoring',
          updates: [{ status: 'Monitoring', message: 'Just another test' }]
        }
      ]
      content = generator.buildHomePage(incidents)
      assert.equal(Buffer.isBuffer(content), true)
    })
    it('generated content must match expected', function () {
      assert.strictEqual(cleanstr(content.toString()), cleanstr(expectedContent))
    })
  })
})

function cleanstr (str) {
  return str.replace(/ /g, '').replace(/\t/g, '').replace(/\n/g, '')
}
