const dt = require('date-fns/format')

function buildHomePage (incidents, settings) {
  let openIncidents = `
    <div class="allgood">
      Everything looks good today...
    </div>
  `
  if (incidents.open && incidents.open.length > 0) {
    openIncidents = `
      <div class="list">
        ${incidents.open.map(i => {
          return `
            <div class="item">
              <div class="header">
                ${i.title}
              </div>
              <div class="content">
                ${i.updates.map(u => {
                  return `
                    <p><b>${u.status}</b> - ${u.message}</p>
                    <small>${dt(u.updatedAt, 'MMM DD, YYYY - HH:mm:ss (Z)')}</small>
                  `
                })
                .join('')}
              </div>
            </div>
          `
        })
        .join('')}
      </div>
    `
  }
  let historyIncidents = ''
  if (incidents.history && incidents.history.length > 0) {
    historyIncidents = `
      <h2>Our Incident History</h2>
      ${incidents.history.map(i => {
        return `
          <h3><a class="button" href="incidents/${i.id}.html">${i.title}</a></h3>
          <p>${i.updates[0].message}</p> 
          <small>${dt(i.updates[0].updatedAt, 'MMM DD, YYYY - HH:mm:ss (Z)')}</small>
        `
      })
      .join('')}
    `
  }
  const view = `
    <div class="home">
      <header>
        <h1>${settings.title}</h1>
      </header>
      ${openIncidents}
      ${historyIncidents}
    </div>
  `
  return Buffer.from(layout(settings.title, view))
}
exports.buildHomePage = buildHomePage

function buildIncidentPage (incident, settings) {
  const view = `
    <div class="incident">
      <header>
        <h1>${incident.title}</h1>
        <h3>Incident Report for ${settings.company}</h2>
      </header>
      <div class="report">
        ${incident.updates.map(u => {
          return `
            <dl>
              <dt>${u.status}</dt>
              <dd>
                ${u.message}
                <small>${dt(u.updatedAt, 'MMM DD, YYYY - HH:mm:ss (Z)')}</small>
              </dd>
            </dl>
          `
        })
        .join('')}
      </div>
      ← <a href="../">Go Back</a>
    </div>
  `
  return Buffer.from(layout(`${settings.title} - ${incident.title}`, view))
}
exports.buildIncidentPage = buildIncidentPage

function layout (title, view) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${styles()}
    </head>
    <body>
      <div class="scroll">
        <div class="content">
          ${view}
        </div>
      </div>
      <footer>
        Powered by <a target="_blank" href="https://www.dstatuspage.net/">D StatusPage</a> on <a target="_blank" href="https://ipfs.io/">IPFS</a>
      </footer>
    </body>
    </html>
  `
}

function styles () {
  return `
    <style>
      html, body {
        margin: 0;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      }
      a {
        color: #444;
        font-weight: normal;
        text-decoration: underline;
      }
      p {
        margin: 0;
      }
      header {
        max-width: 990px;
        margin: 0 auto;
        padding: 50px 0 10px 0;
        margin-bottom: 10px;
        box-sizing: border-box;
      }
      footer {
        text-align: right;
        max-width: 990px;
        margin: 7px auto;
      }
      small {
        display: block;
        line-height: 35px;
        margin-bottom: 20px;
        color: #7B8084;
      }
      small:last-child {
        margin-bottom: 0;
      }
      dt {
        float: left;
        font-weight: 400;
        font-size: 1.25rem;
      }
      dd {
        margin-left: 280px;
      }
      .scroll {
        height: calc(100% - 33px);
        overflow-x: scroll;
      }
      .content {
        margin: 0 auto;
        max-width: 990px;
      }
      .allgood {
        color: #d4d4d4;
        font-size: 22px;
        margin: -20px 0 50px 0;
      }
      .list {
        margin-bottom: 60px;
      }
      .list .item {
        /* border: 2px solid #444; */
        border: 1px solid #d1d5da;
        margin-bottom: 10px;
        overflow: hidden;
      }
      .list .item .header {
        padding: 12px;
        background-color: #444;
        color: #fff;
        font-size: 1.25rem;
      }
      .list .item .content {
        padding: 36px 24px;
      }
      .list .item .header .action {
        float: right;
      }
      .list .item .header .action a {
        color: #fff;
      }
      .home header {
        font-weight: bold;
      }
      .incident header {
        text-align: center;
      }
      .incident header h1 {
        font-weight: 600;
        margin-bottom: 0;
      }
      .incident header h3 {
        color: #7B8084;
        margin-top: 5px;
        font-weight: 400;
      }
      .incident .report {
        border-bottom: solid 1px #d1d5da;
        margin-bottom: 15px;
        padding-bottom: 40px;
      }
      .incident a {
        font-size: 18px;
        font-weight: bold;
      }
      .incident small {
        margin-top: 10px;
      }
    </style>
  `
}
