const fs = require('fs');

const search = `                                                          let allAtts = [...atts];
                                                          if (evt.agendaMinutes && typeof evt.agendaMinutes === 'string') {
                                                              if (!allAtts.some(a => a.url === evt.agendaMinutes)) {
                                                                   allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.agendaMinutes });
                                                              }
                                                          }`;

const replace = `                                                          let allAtts = [...atts];
                                                          if (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') {
                                                              if (!allAtts.some(a => a.url === evt.approvedMinutesUrl)) {
                                                                   allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl });
                                                              }
                                                          }
                                                          if (evt.agendaMinutes && typeof evt.agendaMinutes === 'string') {
                                                              if (!allAtts.some(a => a.url === evt.agendaMinutes)) {
                                                                   allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.agendaMinutes });
                                                              }
                                                          }`;

const search2 = `if (fullUrl.length > 2000)`;
const replace2 = `if (fullUrl.length > 7500)`;

const files = ['src/pages/CommitteesRecommendations.tsx', 'src/pages/Recommendations.tsx'];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    if (content.includes(search)) {
      content = content.replace(search, replace);
    }
    if (content.includes(search2)) {
      content = content.replace(search2, replace2);
    }
    fs.writeFileSync(file, content);
    console.log("Patched " + file);
  } catch (e) {
    console.log(e.message);
  }
}
