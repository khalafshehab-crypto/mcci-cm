const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

const regex = /const handleGoogleLogin = async \(\) => \{[\s\S]*?const user = result\.user;/;
const replacement = `const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = getGoogleProvider();
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
        // Save this user's Google token globally so others can assign tasks to them!
        try {
          if (result.user && result.user.email) {
            const tokenRef = doc(db, "employee_tokens", result.user.email.toLowerCase());
            await setDoc(tokenRef, {
               token: credential.accessToken,
               timestamp: Date.now()
            });
          }
        } catch (e) {
          console.warn("Failed to save employee token:", e);
        }
      }
      
      const user = result.user;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AuthGate.tsx', code);
