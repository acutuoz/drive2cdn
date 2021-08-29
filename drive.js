const { OAuth2Client } = require('google-auth-library')
const { drive } = require('@googleapis/drive')

function oauth2Client () {
  let oauth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  )
  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  })
  /*
  oauth2Client.on('tokens', tokens => {
    if (!tokens.refresh_token) {
      tokens.refresh_token = oauth2Client.credentials.refresh_token
    }
  })
  */
  return oauth2Client
}

module.exports = drive({
  version: 'v3',
  auth: oauth2Client()
})