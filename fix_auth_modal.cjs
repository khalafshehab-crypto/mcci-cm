const fs = require('fs');
const file = 'src/lib/googleApi.ts';
let code = fs.readFileSync(file, 'utf8');

const replacement = `let activeAuthPromise: Promise<string> | null = null;
export let authResolve: ((token: string) => void) | null = null;
export let authReject: ((err: any) => void) | null = null;

export function triggerAuthModal(): Promise<string> {
  if (activeAuthPromise) return activeAuthPromise;
  
  activeAuthPromise = new Promise((resolve, reject) => {
    authResolve = (token: string) => {
      activeAuthPromise = null;
      resolve(token);
    };
    authReject = (err: any) => {
      activeAuthPromise = null;
      reject(err);
    };
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('show-google-auth-modal'));
    }
  });
  return activeAuthPromise;
}`;

// Replace the block from `export let authResolve` to `});\n}`
const regex = /export let authResolve.*?\}\);\n\}/s;
code = code.replace(regex, replacement);

fs.writeFileSync(file, code);
console.log("Fixed auth modal spam");
