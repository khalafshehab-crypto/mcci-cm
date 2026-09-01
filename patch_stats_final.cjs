const fs = require('fs');
let code = fs.readFileSync('src/hooks/useDashboardStats.ts', 'utf-8');

const getEventKindStrString = `
const getEventKindStr = (rawTitle: string) => {
  if (!rawTitle) return "فعالية";
  const title = rawTitle.trim();
  if (title.startsWith("اجتماع") || title.includes("اجتماع")) return "اجتماع";
  if (title.startsWith("لقاء") || title.includes("لقاء")) return "لقاء";
  if (title.startsWith("زيارة") || title.includes("زيارة")) return "زيارة";
  if (title.startsWith("استضافة") || title.includes("استضافة")) return "استضافة";
  if (title.startsWith("ورشة عمل") || title.includes("ورشة عمل")) return "ورشة عمل";
  if (title.startsWith("ندوة") || title.includes("ندوة")) return "ندوة";
  if (title.startsWith("حفل") || title.includes("حفل")) return "حفل";
  if (title.startsWith("تدشين") || title.includes("تدشين")) return "تدشين";
  return "فعالية";
};
`;

// It already has getEventKindStr because I patched it earlier.
// I will just replace the specific lines.
code = code.replace(
  'const meetingsEvts = evts.filter(e => getEventKindStr(e.title) === "اجتماع").length;',
  'const meetingsEvts = evts.filter(e => e.type === "اجتماع" || getEventKindStr(e.title) === "اجتماع" || getEventKindStr(e.eventName) === "اجتماع").length;'
);

code = code.replace(
  'const gatheringsEvts = evts.filter(e => getEventKindStr(e.title) === "لقاء").length;',
  'const gatheringsEvts = evts.filter(e => e.type === "لقاء" || getEventKindStr(e.title) === "لقاء" || getEventKindStr(e.eventName) === "لقاء").length;'
);

code = code.replace(
  'const workshopsEvts = evts.filter(e => getEventKindStr(e.title) === "ورشة عمل").length;',
  'const workshopsEvts = evts.filter(e => e.type === "ورشة عمل" || getEventKindStr(e.title) === "ورشة عمل" || getEventKindStr(e.eventName) === "ورشة عمل").length;'
);

code = code.replace(
  'const visitsEvts = evts.filter(e => getEventKindStr(e.title) === "زيارة").length;',
  'const visitsEvts = evts.filter(e => e.type === "زيارة" || getEventKindStr(e.title) === "زيارة" || getEventKindStr(e.eventName) === "زيارة").length;'
);

fs.writeFileSync('src/hooks/useDashboardStats.ts', code);
console.log("useDashboardStats patched!");
