const safeName = "تقرير اللجان القطاعية الـ 22";
let q = `mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false`;
q = `(${q}) or (mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false and sharedWithMe=true)`;
console.log(q);
