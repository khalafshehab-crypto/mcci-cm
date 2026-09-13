const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace startObj
  const startObjRegex = /startObj = \{ dateTime: dt\.toISOString\(\), timeZone: "Asia\/Riyadh" \};/g;
  content = content.replace(startObjRegex, 'startObj = { dateTime: dt.toISOString() };');

  // Replace endObj
  const endObjRegex = /endObj = \{ dateTime: endDt\.toISOString\(\), timeZone: "Asia\/Riyadh" \};/g;
  content = content.replace(endObjRegex, 'endObj = { dateTime: endDt.toISOString() };');

  fs.writeFileSync(file, content);
  console.log("Fixed dates in", path.basename(file));
});
