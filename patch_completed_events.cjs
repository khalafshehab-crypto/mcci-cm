const fs = require('fs');

function patchUseDashboardStats() {
  const path = 'src/hooks/useDashboardStats.ts';
  let code = fs.readFileSync(path, 'utf8');
  
  const targetPattern = /const completedEvts = evts\.filter\(e => \{[\s\S]*?return stepValues\.filter\(Boolean\)\.length === 7 \|\| e\.status === "منتهية" \|\| e\.status === "مكتملة" \|\| e\.status === "منجزة";\n\s*\}\)\.length;/;
  
  const replaceStr = `const completedEvts = evts.filter(e => {
        const stepValues = [
          !!e.committeeConfirmed,
          !!e.invitationSent,
          !!e.attendanceConfirmed,
          !!e.preparationsConfirmed,
          !!(e.agenda && e.agenda.length > 0 && e.agendaTransferred),
          !!e.minutesSaved,
          !!e.exportedRecommendationsToPage
        ];
        const st = (e.status || "").trim();
        return stepValues.filter(Boolean).length === 7 || st.includes("منته") || st.includes("مكتمل") || st.includes("منجز") || st.includes("مؤكد");
      }).length;`;
      
  code = code.replace(targetPattern, replaceStr);
  fs.writeFileSync(path, code);
  console.log("Patched useDashboardStats.ts");
}

function patchHome() {
  const path = 'src/pages/Home.tsx';
  let code = fs.readFileSync(path, 'utf8');
  
  // 1. Add let completedEventsCount = 0;
  code = code.replace('let eventsCount = 0;', 'let eventsCount = 0;\n    let completedEventsCount = 0;');
  
  // 2. Add calculation logic
  const targetEvtsBlock = `eventsCount = realEvents.length;`;
  const replaceEvtsBlock = `eventsCount = realEvents.length;
        completedEventsCount = realEvents.filter((e: any) => {
          const stepValues = [
            !!e.committeeConfirmed,
            !!e.invitationSent,
            !!e.attendanceConfirmed,
            !!e.preparationsConfirmed,
            !!(e.agenda && e.agenda.length > 0 && e.agendaTransferred),
            !!e.minutesSaved,
            !!e.exportedRecommendationsToPage
          ];
          const st = (e.status || "").trim();
          return stepValues.filter(Boolean).length === 7 || st.includes("منته") || st.includes("مكتمل") || st.includes("منجز") || st.includes("مؤكد");
        }).length;`;
  code = code.replace(targetEvtsBlock, replaceEvtsBlock);
  
  // 3. Add to calculatedChartData
  const targetChartData = `{ name: "إجمالي الفعاليات", value: eventsCount, color: "#eab308", icon: Zap },`;
  const replaceChartData = `{ name: "الفعاليات المنجزة", value: completedEventsCount, color: "#10b981", icon: Trophy },
      { name: "إجمالي الفعاليات", value: eventsCount, color: "#eab308", icon: Zap },`;
  code = code.replace(targetChartData, replaceChartData);
  
  // 4. Also add it to calculatedLiveDb for consistency if it's there
  code = code.replace('totalEvts: eventsCount,', 'totalEvts: eventsCount,\n      completedEvts: completedEventsCount,');
  
  fs.writeFileSync(path, code);
  console.log("Patched Home.tsx");
}

patchUseDashboardStats();
patchHome();
