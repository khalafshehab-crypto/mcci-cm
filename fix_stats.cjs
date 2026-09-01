const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldLogic = `        extractedStats: {
          meetingsCount: Math.round(freshItems.length / 3),
          eventsCount: Math.round(freshItems.length / 3),
          recommendationsCount: Math.round(freshItems.length / 3),
          completedRecsCount: Math.round(freshItems.length / 3),
          tasksCount: Math.round(freshItems.length / 3),
          completedTasksCount: Math.round(freshItems.length / 3),
          reportsCount: Math.round(freshItems.length / 3)
        }`;

const newLogic = `        extractedItems: freshItems,
        extractedStats: {
          meetingsCount: freshItems.filter(i => i.category === 'event' && i.title?.includes("اجتماع")).length,
          eventsCount: freshItems.filter(i => i.category === 'event' && !i.title?.includes("اجتماع")).length,
          recommendationsCount: freshItems.filter(i => i.category === 'recommendation').length,
          completedRecsCount: freshItems.filter(i => i.category === 'recommendation' && (i.status === "منجزة" || i.status === "مكتملة")).length,
          tasksCount: freshItems.filter(i => i.category === 'task').length,
          completedTasksCount: freshItems.filter(i => i.category === 'task' && (i.status === "منجزة" || i.status === "مكتملة")).length,
          reportsCount: freshItems.filter(i => i.category === 'report').length
        }`;

if (code.includes('Math.round(freshItems.length / 3)')) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync(path, code);
  console.log('Fixed extractedStats calculation logic.');
} else {
  console.log('Logic not found. Maybe it is slightly different?');
}
