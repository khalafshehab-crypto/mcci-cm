const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

code = code.replace(
  'meetingsCount = realEvents.filter((e: any) => e.type === "اجتماع" || e.title?.includes("اجتماع")).length;',
  'meetingsCount = realEvents.filter((e: any) => e.type === "اجتماع" || (e.title && e.title.includes("اجتماع")) || (e.eventName && e.eventName.includes("اجتماع"))).length;'
);

code = code.replace(
  'let gatheringsCount = realEvents.filter((e: any) => e.type === "لقاء" || e.title?.includes("لقاء")).length;',
  'gatheringsCount = realEvents.filter((e: any) => e.type === "لقاء" || (e.title && e.title.includes("لقاء")) || (e.eventName && e.eventName.includes("لقاء"))).length;'
);

code = code.replace(
  'let workshopsCount = realEvents.filter((e: any) => e.type === "ورشة عمل" || e.title?.includes("ورشة")).length;',
  'workshopsCount = realEvents.filter((e: any) => e.type === "ورشة عمل" || (e.title && e.title.includes("ورشة")) || (e.eventName && e.eventName.includes("ورشة"))).length;'
);

code = code.replace(
  'let visitsCount = realEvents.filter((e: any) => e.type === "زيارة" || e.title?.includes("زيارة")).length;',
  'visitsCount = realEvents.filter((e: any) => e.type === "زيارة" || (e.title && e.title.includes("زيارة")) || (e.eventName && e.eventName.includes("زيارة"))).length;'
);

fs.writeFileSync('src/pages/Home.tsx', code);
console.log("Home patched!");
