const fs = require('fs');
const file = 'src/components/AuthGate.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('signInWithRedirect')) {
  content = content.replace('signInWithPopup }', 'signInWithPopup, signInWithRedirect }');
}

const targetStr = `      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);`;

const replacement = `      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (err: any) {
        if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, provider);
          return; // The page will redirect
        }
        throw err;
      }
      const credential = GoogleAuthProvider.credentialFromResult(result);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content);
console.log('Fixed AuthGate.tsx');
