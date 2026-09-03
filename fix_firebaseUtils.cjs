const fs = require('fs');

let content = fs.readFileSync('src/lib/firebaseUtils.ts', 'utf8');

// Remove saveLocalCollection calls
content = content.replace(/if \(!\(snapshot as any\)\.isMock\) \{\s*saveLocalCollection\(collectionName, docs\);\s*\}/g, '');

// Remove setupLocalFallback logic inside onSnapshot
content = content.replace(/if \(unsubscribe\) \{\s*try \{ unsubscribe\(\); \} catch\(e\) \{\}\s*unsubscribe = null;\s*\}\s*setupLocalFallback\(\);/g, `if (unsubscribe) {
              try { unsubscribe(); } catch(e) {}
              unsubscribe = null;
            }`);

// Remove setupLocalFallback function
content = content.replace(/function setupLocalFallback\(\) \{[\s\S]*?\/\/ Listen to changes/g, '// Listen to changes');
content = content.replace(/function setupLocalFallback\(\) \{[\s\S]*?localCleanup = \(\) => \{[\s\S]*?clearInterval\(intervalId\);\s*\};\s*\}/g, '');

// Remove local storage fallback from addDocument
content = content.replace(/const list = getLocalCollection\(collectionName\);\s*const newId = `\$\{collectionName\.substring\(0, 4\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substring\(2, 11\)\}`;[\s\S]*?logSystemAction/g, `const newId = \`\$\{collectionName.substring(0, 4)\}_\$\{Math.random().toString(36).substring(2, 11)}\`;
    logSystemAction`);

content = content.replace(/\/\/ Sync the local storage collection's fallback ID with the actual Firestore ID[\s\S]*?return docRef\.id;/g, `return docRef.id;`);

// Remove local storage fallback from updateDocument
content = content.replace(/const list = getLocalCollection\(collectionName\);\s*const index = list\.findIndex[\s\S]*?setData\(list\);/g, '');

// Remove local storage fallback from deleteDocument
content = content.replace(/const list = getLocalCollection\(collectionName\);\s*const filtered = list\.filter[\s\S]*?setData\(filtered\);/g, '');

// Remove local storage fallback from setDocument
content = content.replace(/const list = getLocalCollection\(collectionName\);\s*const index = list\.findIndex[\s\S]*?setData\(list\);/g, '');

fs.writeFileSync('src/lib/firebaseUtils.ts', content);
