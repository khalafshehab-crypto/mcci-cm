const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

const targetRegex = /\{\/\* Chat Body - Interactive simulation context \*\/\}.*?\{\/\* Message Entry footer block \*\/\}.*?<\/div>.*?(?=\s+<\/motion\.div>)/s;

const targetMatch = code.match(targetRegex);
if (targetMatch) {
  const newCode = `{/* Chat Body - Embedded Google Chat */}
              <div className="w-full h-[500px] bg-slate-50 relative overflow-hidden flex flex-col">
                <iframe 
                  src="https://chat.google.com" 
                  className="w-full flex-1 border-0"
                  title="Google Chat"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>`;
  code = code.replace(targetMatch[0], newCode);
  fs.writeFileSync('src/pages/CommitteesHome.tsx', code);
  console.log("Successfully replaced chat modal content");
} else {
  console.log("Regex didn't match.");
}
