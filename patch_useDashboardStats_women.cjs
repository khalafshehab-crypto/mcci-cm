const fs = require('fs');

const path = 'src/hooks/useDashboardStats.ts';
let code = fs.readFileSync(path, 'utf8');

const targetStr = `const womenMbrs = mbrs.filter(m => m.title && womenTitles.includes(m.title)).length;`;
const replaceStr = `const womenMbrs = mbrs.filter(m => {
  const title = (m.title || "").trim();
  const name = (m.name || "").trim();
  if (womenTitles.includes(title)) return true;
  if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
  return false;
}).length;`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(path, code);
console.log("useDashboardStats.ts womenMbrs patched!");
