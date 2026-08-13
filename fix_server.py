import re

with open('server.ts', 'r') as f:
    content = f.read()

# Remove all executeWithRetry definitions
content = re.sub(
    r'const executeWithRetry = async \(operation: any, maxRetries = \d+\) => \{.*?\};\n',
    '',
    content,
    flags=re.DOTALL
)

retry_func = """
const executeWithRetry = async (operation: any, maxRetries = 5) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      const errStr = String(err);
      const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand") || errStr.includes("overloaded");
      const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
      
      if ((is503 || is429) && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1500 + Math.random() * 1000;
        console.warn(`[Gemini API] busy (${is503 ? '503' : '429'}), retrying in ${Math.round(delay)}ms... (Attempt ${i+1}/${maxRetries-1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
};
"""

content = content.replace("async function startServer() {\n  const app = express();", "async function startServer() {\n  const app = express();\n" + retry_func)

# Fix model name just in case
content = content.replace('"gemini-3.6-flash"', '"gemini-2.5-flash"')
content = content.replace('"gemini-3.0-flash"', '"gemini-2.5-flash"')

with open('server.ts', 'w') as f:
    f.write(content)
