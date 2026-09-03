const fs = require('fs');
let c = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf8');

c = c.replace(/if \(\!isUseMock\(\)\) \{\s*try \{\s*const docRef = await withTimeout\([\s\S]*?8000,[\s\S]*?null[\s\S]*?\);[\s\S]*?if \(docRef\) \{\s*return docRef\.id;\s*\}[\s\S]*?\} catch\(e\) \{\s*handleFirestoreError\(e, OperationType\.CREATE, collectionName\);\s*return newId;\s*\}\s*\}/g, `      try {
        const docRef = await addDoc(collection(db, collectionName), item);
        return docRef.id;
      } catch(e) {
        console.error("Firestore CREATE error:", e);
      }`);

c = c.replace(/if \(\!isUseMock\(\)\) \{\s*try \{\s*await withTimeout\([\s\S]*?8000,[\s\S]*?null[\s\S]*?\);[\s\S]*?\} catch\(e\) \{\s*handleFirestoreError\(e, OperationType\.UPDATE, \`\$\{collectionName\}\/\$\{id\}\`\);\s*\}\s*\}/g, `      try {
        await setDoc(doc(db, collectionName, String(id)), item, { merge: true });
      } catch(e) {
        console.error("Firestore UPDATE error:", e);
      }`);

c = c.replace(/if \(\!isUseMock\(\)\) \{\s*try \{\s*await withTimeout\([\s\S]*?8000,[\s\S]*?null[\s\S]*?\);[\s\S]*?\} catch\(e\) \{\s*handleFirestoreError\(e, OperationType\.DELETE, \`\$\{collectionName\}\/\$\{id\}\`\);\s*\}\s*\}/g, `      try {
        await deleteDoc(doc(db, collectionName, String(id)));
      } catch(e) {
        console.error("Firestore DELETE error:", e);
      }`);

c = c.replace(/if \(\!isUseMock\(\)\) \{\s*try \{\s*await withTimeout\([\s\S]*?8000,[\s\S]*?null[\s\S]*?\);[\s\S]*?\} catch\(e\) \{\s*handleFirestoreError\(e, OperationType\.WRITE, \`\$\{collectionName\}\/\$\{id\}\`\);\s*\}\s*\}/g, `      try {
        await setDoc(doc(db, collectionName, String(id)), item);
      } catch(e) {
        console.error("Firestore WRITE error:", e);
      }`);

c = c.replace(/const safetyTimeout = setTimeout\(\(\) => \{[\s\S]*?\}, 8000\);/g, '');
c = c.replace(/clearTimeout\(safetyTimeout\);/g, '');

c = c.replace(/if \(!db \|\| db\.type === "dummy_firestore"\) \{[\s\S]*?setFirestoreBlocked\(true\);[\s\S]*?return;[\s\S]*?\}/g, '');

c = c.replace(/const unsubscribeBlocked = subscribeToFirestoreBlocked\(\(blocked\) => \{[\s\S]*?\}\);/g, '');
c = c.replace(/unsubscribeBlocked\(\);/g, '');

fs.writeFileSync('src/lib/firebaseUtils.ts', c);
