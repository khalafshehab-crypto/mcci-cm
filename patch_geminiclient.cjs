const fs = require('fs');

const retryLogic = `const executeWithRetry = async (operation: any, maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err: any) {
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
};
`;

let content = fs.readFileSync('src/lib/geminiClient.ts', 'utf-8');

if (!content.includes('executeWithRetry')) {
    content = content.replace('export const extractAgendaClient = async (', retryLogic + '\nexport const extractAgendaClient = async (');
    
    // Replace ai.models.generateContent calls with executeWithRetry
    content = content.replace(/await ai\.models\.generateContent\(\{/g, 'await executeWithRetry(() => ai.models.generateContent({');
    content = content.replace(/contents: \[\{ role: "user", parts: contents \}\]\n  \}\);/g, 'contents: [{ role: "user", parts: contents }]\n  }));');
    
    fs.writeFileSync('src/lib/geminiClient.ts', content);
    console.log("Patched src/lib/geminiClient.ts successfully.");
} else {
    console.log("Already patched.");
}
