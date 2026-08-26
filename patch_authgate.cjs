const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf-8');

code = code.replace(/if \(newEmp\.geminiApiKey\) \{/g, 'if ((newEmp as any).geminiApiKey) {');
code = code.replace(/localStorage\.setItem\("BYOK_GEMINI_API_KEY", newEmp\.geminiApiKey\);/g, 'localStorage.setItem("BYOK_GEMINI_API_KEY", (newEmp as any).geminiApiKey);');
code = code.replace(/if \(data\.geminiApiKey\) \{/g, 'if ((data as any).geminiApiKey) {');
code = code.replace(/localStorage\.setItem\("BYOK_GEMINI_API_KEY", data\.geminiApiKey\);/g, 'localStorage.setItem("BYOK_GEMINI_API_KEY", (data as any).geminiApiKey);');

fs.writeFileSync('src/components/AuthGate.tsx', code);
console.log("Patched auth gate");
