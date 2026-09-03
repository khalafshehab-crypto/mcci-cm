import fs from 'fs';
let code = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf8');

// Remove extra setData(list)
code = code.replace(/setData\(list\);\s*setData\(list\);/g, 'setData(list);');

// Ensure updateDocument and setDocument have setData(list)
if (!code.includes('updateDocument = async (id: string, item: Partial<T>) => {') || 
    !code.substring(code.indexOf('updateDocument = async')).includes('setData(list)')) {
  
  // We need to carefully inject setData(list) after saveLocalCollection(collectionName, list); inside updateDocument
  let startIdx = code.indexOf('updateDocument = async');
  if (startIdx > -1) {
    let sub = code.substring(startIdx);
    let firstSave = sub.indexOf('saveLocalCollection(collectionName, list);');
    if (firstSave > -1) {
       let insertIdx = startIdx + firstSave + 'saveLocalCollection(collectionName, list);'.length;
       code = code.slice(0, insertIdx) + '\n    setData(list);' + code.slice(insertIdx);
    }
  }
}

if (!code.includes('setDocument = async (id: string, item: Omit<T, \'id\'>) => {') || 
    !code.substring(code.indexOf('setDocument = async')).includes('setData(list)')) {
  
  // same for setDocument
  let startIdx = code.indexOf('setDocument = async');
  if (startIdx > -1) {
    let sub = code.substring(startIdx);
    let firstSave = sub.indexOf('saveLocalCollection(collectionName, list);');
    if (firstSave > -1) {
       let insertIdx = startIdx + firstSave + 'saveLocalCollection(collectionName, list);'.length;
       code = code.slice(0, insertIdx) + '\n    setData(list);' + code.slice(insertIdx);
    }
  }
}

fs.writeFileSync('src/lib/firebaseUtils.ts', code);
