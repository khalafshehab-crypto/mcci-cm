import fs from 'fs';
let code = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf8');

code = code.replace(
  'saveLocalCollection(collectionName, list);',
  'saveLocalCollection(collectionName, list);\n    setData(list);'
);
code = code.replace(
  'saveLocalCollection(collectionName, list);',
  'saveLocalCollection(collectionName, list);\n    setData(list);'
);
code = code.replace(
  'saveLocalCollection(collectionName, filtered);',
  'saveLocalCollection(collectionName, filtered);\n    setData(filtered);'
);
code = code.replace(
  'saveLocalCollection(collectionName, freshList);',
  'saveLocalCollection(collectionName, freshList);\n            setData(freshList);'
);

fs.writeFileSync('src/lib/firebaseUtils.ts', code);
