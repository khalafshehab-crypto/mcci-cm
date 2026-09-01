const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

// Remove states
code = code.replace(/  const \[chatMsg, setChatMsg\] = useState\(""\);\n/g, "");
code = code.replace(/  const \[chatToast, setChatToast\] = useState<string \| null>\(null\);\n/g, "");
code = code.replace(/  const \[chatMessages, setChatMessages\] = useState<Array<\{[^}]+\}>>\(\[\]\);\n/g, "");
code = code.replace(/  const \[isTyping, setIsTyping\] = useState\(false\);\n/g, "");

// Remove handleSendChat
const handleSendRegex = /  const handleSendChat = \(\) => \{.*?\};\n\n/s;
code = code.replace(handleSendRegex, "");

fs.writeFileSync('src/pages/CommitteesHome.tsx', code);
