const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
fetch('http://localhost:3000/api/google-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 12345',
      'Content-Type': 'multipart/related; boundary=test'
    },
    bodyString: 'test'
  })
}).then(res => res.text()).then(console.log);
