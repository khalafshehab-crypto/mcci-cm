const fs = require('fs');
let c = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

c = c.replace(/import \{ auth, db \} from '\.\.\/lib\/firebase';/, `import { auth, db } from '../lib/firebase';\nimport { signInAnonymously } from 'firebase/auth';`);

c = c.replace(/const proceedWithEmailLogin = async \(email: string\) => \{/, `const proceedWithEmailLogin = async (email: string) => {
    // If not already authenticated, try to sign in anonymously so Firestore rules pass
    if (auth && !auth.currentUser) {
       try {
          await signInAnonymously(auth);
       } catch (e) {
          console.warn("Could not sign in anonymously", e);
       }
    }`);

fs.writeFileSync('src/components/AuthGate.tsx', c);
