const fs = require('fs')
const max_file_size = 25000000 // The maximum file size for a single Cloudflare Pages site asset is 25MB

async function listFiles (driveClient, parent = 'root', pageToken = null) {
  let res = await driveClient.files.list({
    q: `'${parent}' in parents and trashed=false`,
    fields: 'nextPageToken, files(id, name, size, mimeType, modifiedTime)',
    pageSize: 100,
    pageToken
  })
  let files = res.data.files;
  if (res.data.nextPageToken) {
    files = files.concat(await listFiles(driveClient, parent, res.data.nextPageToken))
  }
  return files
}

async function downloadFile (driveClient, file, dir) {
  let path = dir + '/' + file.name
  if (file.mimeType != 'application/vnd.google-apps.folder') {
    /*
    if (file.size > max_file_size) {
      return
    }*/
    
    let dest = fs.createWriteStream(path)
    driveClient.files.get({
      fileId: file.id,
      alt: 'media'
    }, { responseType: 'stream' },
    function(err, res) {
      if (err) {
        return
      }
      res.data.pipe(dest)
    })
  } else {
    fs.mkdirSync(path, { recursive: true })
    let files = await listFiles(driveClient, file.id)
    files.map(file => downloadFile(driveClient, file, path))
  }
}

(async () => {
  const drive = require('./drive.js')
  let files = await listFiles(drive, process.env.DRIVE_FOLDER_ID)
  let dir = __dirname + '/public'
  files.map(file => downloadFile(drive, file, dir))
})()
