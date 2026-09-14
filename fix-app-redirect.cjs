const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('getRedirectResult')) {
  // 1. Add imports
  content = content.replace(
    'import { db, doc, onSnapshot, auth } from "./lib/firebase";',
    'import { db, doc, setDoc, onSnapshot, auth } from "./lib/firebase";\nimport { getRedirectResult, GoogleAuthProvider } from "firebase/auth";\nimport { setCachedAccessToken } from "./lib/googleApi";'
  );
  
  // 2. Add useEffect inside App
  const appUseEffectMatch = content.match(/export default function App\(\) {\n  useThemeSettings\(\);\n  const \[user, setUser\] = useState<any>\(null\);\n  const \[loading, setLoading\] = useState\(true\);\n\n  useEffect\(\(\) => {/);
  
  if (appUseEffectMatch) {
    const newUseEffect = `export default function App() {
  useThemeSettings();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect results from Google Auth on mobile
    if (auth) {
      getRedirectResult(auth).then((result) => {
        if (result) {
           const credential = GoogleAuthProvider.credentialFromResult(result);
           if (credential?.accessToken) {
             setCachedAccessToken(credential.accessToken);
             if (result.user?.email) {
               const tokenRef = doc(db, "employee_tokens", result.user.email.toLowerCase());
               setDoc(tokenRef, {
                 token: credential.accessToken,
                 timestamp: Date.now()
               }, { merge: true }).catch(console.error);
             }
           }
        }
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {`;
    
    content = content.replace(appUseEffectMatch[0], newUseEffect);
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed App.tsx redirect result handling');
} else {
  console.log('getRedirectResult already present');
}
