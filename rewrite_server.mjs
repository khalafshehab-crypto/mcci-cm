import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

// Replace the definition of executeWithRetry
const oldDef = `const executeWithRetry = async (operation: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err: any) { console.error('executeWithRetry error on attempt', i, err.message);
      const errStr = String(err);
      const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand") || errStr.includes("overloaded");
      const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
      
      if ((is503 || is429) && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1500 + Math.random() * 1000;
        console.warn(\`[Gemini API] busy (\${is503 ? '503' : '429'}), retrying in \${Math.round(delay)}ms... (Attempt \${i+1}/\${maxRetries-1})\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
};`;

const newDef = `const executeWithFallback = async (operationBuilder: (modelName: string) => Promise<any>, maxRetries = 2) => {
  const modelsToTry = [
    "gemini-3.7-pro",
    "gemini-3.1-pro-preview",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite-preview",
    "gemini-2.5-flash"
  ];
  let lastError: any = null;
  
  for (const modelName of modelsToTry) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(\`[Gemini API] Trying model: \${modelName} (Attempt \${i+1}/\${maxRetries})\`);
        return await operationBuilder(modelName);
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand") || errStr.includes("overloaded");
        const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
        
        console.warn(\`[Gemini API] Error on model \${modelName}: \${errStr}\`);
        
        if (is429 && errStr.includes("limit: 0")) {
            console.warn(\`[Gemini API] Quota is strictly 0 for model \${modelName}, immediately falling back to next model.\`);
            break;
        }

        if ((is503 || is429) && i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          console.warn(\`[Gemini API] busy (\${is503 ? '503' : '429'}) on \${modelName}, retrying in \${Math.round(delay)}ms...\`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        break; 
      }
    }
  }
  
  const finalErrorMsg = String(lastError?.message || lastError);
  if (finalErrorMsg.includes("429") || finalErrorMsg.includes("quota") || finalErrorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("جميع نماذج الذكاء الاصطناعي استنفدت الحصة المجانية لمفتاحك. يرجى الانتظار قليلاً أو الترقية للنسخة المدفوعة.");
  }
  throw lastError || new Error("فشل الاتصال بنماذج الذكاء الاصطناعي بعد عدة محاولات.");
};`;

if(code.includes(oldDef)) {
    code = code.replace(oldDef, newDef);
} else {
    // try replacing via regex
    code = code.replace(/const executeWithRetry = async[\s\S]*?throw err;\s*}\s*}\s*};/, newDef);
}

// Now replace usages of executeWithRetry
// Pattern 1:
// const response = await executeWithRetry(() => ai.models.generateContent({
//   model: "gemini-3.7-flash",
//   contents: ...
// }));
code = code.replace(/await executeWithRetry\(\(\) => ai\.models\.generateContent\(\{\s*model:\s*["'][^"']+["'],([\s\S]*?)\}\)\);/g, 
  "await executeWithFallback((modelName) => ai.models.generateContent({ model: modelName,$1}));");

fs.writeFileSync('server.ts', code);
console.log('Done rewrites.');
