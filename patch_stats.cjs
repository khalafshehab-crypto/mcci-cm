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

code = code.replace('export function useDashboardStats() {', getEventKindStrString + '\nexport function useDashboardStats() {');

code = code.replace(
  'const completedEvts = evts.filter(e => e.status === "منتهية" || e.status === "مكتملة" || e.status === "منجزة" || e.status === "مؤكد").length;',
  `const completedEvts = evts.filter(e => {
        const stepValues = [
          !!e.committeeConfirmed,
          !!e.invitationSent,
          !!e.attendanceConfirmed,
          !!e.preparationsConfirmed,
          !!(e.agenda && e.agenda.length > 0 && e.agendaTransferred),
          !!e.minutesSaved,
          !!e.exportedRecommendationsToPage
        ];
        return stepValues.filter(Boolean).length === 7 || e.status === "منتهية" || e.status === "مكتملة" || e.status === "منجزة";
      }).length;`
);

code = code.replace('const meetingsEvts = evts.filter(e => e.type === "اجتماع").length;', 'const meetingsEvts = evts.filter(e => getEventKindStr(e.title) === "اجتماع").length;');
code = code.replace('const gatheringsEvts = evts.filter(e => e.type === "لقاء").length;', 'const gatheringsEvts = evts.filter(e => getEventKindStr(e.title) === "لقاء").length;');
code = code.replace('const workshopsEvts = evts.filter(e => e.type === "ورشة عمل").length;', 'const workshopsEvts = evts.filter(e => getEventKindStr(e.title) === "ورشة عمل").length;');
code = code.replace('const visitsEvts = evts.filter(e => e.type === "زيارة").length;', 'const visitsEvts = evts.filter(e => getEventKindStr(e.title) === "زيارة").length;');

fs.writeFileSync('src/hooks/useDashboardStats.ts', code);
console.log("Stats patched!");
