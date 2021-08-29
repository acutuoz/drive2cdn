const fs = require('fs')
const http = require('http')
const url = require('url')
const opn = require('open')
const destroyer = require('server-destroy')
const { OAuth2Client } = require('google-auth-library')
const readlineSync = require('readline-sync')

const defaultClientID = '1003188315778-6rk6ognvoctb37jbqj6iv7mf343a9ko4.apps.googleusercontent.com'
const defaultClientSecret = 'ZgLdQd-mxDXD3M0gCarTw8oj'

async function auth () {
  return new Promise((resolve, reject) => {
    var oauth2Client
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/oauth2callback') > -1) {
          let qs = new url.URL(req.url, 'http://localhost:3999').searchParams
          let error = qs.get('error')
          if (error) {
            res.end(error)
            server.destroy()
            console.log('Authentication failed')
            return
          }
          res.end('Authentication successful! Please return to the console.')
          server.destroy()
          console.log('Authentication successful')
          let { tokens } = await oauth2Client.getToken(qs.get('code'))
          oauth2Client.setCredentials(tokens)
          resolve(oauth2Client)
        }
      } catch (e) {
        reject(e)
      }
    }).listen(0, () => {
      oauth2Client = new OAuth2Client(
        ClientID,
        ClientSecret,
        `http://localhost:${server.address().port}/oauth2callback`
      )
      let authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/drive.readonly'
      })
      console.log('Opening', authorizeUrl, 'in browser ...', "\n")
      opn(authorizeUrl, { wait: false }).then(cp => cp.unref())
    })
    destroyer(server)
  })
}

function showRefreshToken (client) {
  console.log(`Refresh Toekn: ${client.credentials.refresh_token}`)
}

const ClientID = readlineSync.question(`Nhập Client ID (mặc định: ${defaultClientID}): `, {
  defaultInput: defaultClientID
})
const ClientSecret = readlineSync.question(`Nhập Client Secret (mặc định: ${defaultClientSecret}): `, {
  defaultInput: defaultClientSecret
})
auth().then(client => showRefreshToken(client)).catch(console.error)