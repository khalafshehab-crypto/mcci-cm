const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.{ts,tsx}');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace various patterns of allMembers.filter
  
  // m.committeeId === newCommitteeId
  const p1 = /allMembers\.filter\s*\(\s*m\s*=>\s*m\.committeeId\s*===\s*([^ &]+)\s*\)/g;
  if (p1.test(content)) {
    content = content.replace(p1, 'allMembers.filter(m => String(m.committeeId) === String($1) || String(m.secondaryCommitteeId) === String($1))');
    changed = true;
  }

  // m.committeeId === updated.committeeId && m.active !== false
  const p2 = /allMembers\.filter\s*\(\s*m\s*=>\s*m\.committeeId\s*===\s*([^\s&]+)\s*&&\s*m\.active\s*!==\s*false\s*\)/g;
  if (p2.test(content)) {
    content = content.replace(p2, 'allMembers.filter(m => (String(m.committeeId) === String($1) || String(m.secondaryCommitteeId) === String($1)) && m.active !== false)');
    changed = true;
  }

  // m.committeeId === evt.committeeId && m.active !== false
  const p3 = /allMembers\.filter\s*\(\s*m\s*=>\s*m\.committeeId\s*===\s*(evt\.committeeId)\s*&&\s*m\.active\s*!==\s*false\s*\)/g;
  if (p3.test(content)) {
    content = content.replace(p3, 'allMembers.filter(m => (String(m.committeeId) === String($1) || String(m.secondaryCommitteeId) === String($1)) && m.active !== false)');
    changed = true;
  }
  
  // String(m.committeeId) === String(e.committeeId)
  const p4 = /allMembers\.filter\s*\(\s*m\s*=>\s*String\(m\.committeeId\)\s*===\s*String\(([^)]+)\)\s*\)/g;
  if (p4.test(content)) {
    content = content.replace(p4, 'allMembers.filter(m => String(m.committeeId) === String($1) || String(m.secondaryCommitteeId) === String($1))');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated", file);
  }
}
