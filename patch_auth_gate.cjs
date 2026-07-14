const fs = require('fs');
let content = fs.readFileSync('src/components/AuthGate.tsx', 'utf-8');

const importTarget = `import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";`;
const importReplacement = `import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getGoogleProvider, setCachedAccessToken } from "../lib/googleApi";`;

const targetFunc = `  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;`;
      
const replaceFunc = `  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = getGoogleProvider();
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
      }
      
      const user = result.user;`;

content = content.replace(importTarget, importReplacement).replace(targetFunc, replaceFunc);
fs.writeFileSync('src/components/AuthGate.tsx', content);
