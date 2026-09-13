const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Find where handleOpenEdit sets newType
  // setNewType(evt.type); -> setNewType("مفردة");
  const editTypeRegex = /setNewType\(evt\.type\);/;
  content = content.replace(editTypeRegex, `setNewType("مفردة"); // Force editing to behave as a single occurrence`);

  // Remove the if (evt.type === "مفردة") branch in handleOpenEdit so it ALWAYS populates single fields
  // Wait, my previous patch did this:
  // if (evt.type === "مفردة") {
  //    setSingleTime(evt.time || "");
  //    ...
  // } else {
  //    setSeriesTime(evt.time || "");
  //    ...
  // }
  
  // Let's replace the whole block starting with if (evt.type === "مفردة")
  // Just use regex to replace the if/else completely:
  const ifElseRegex = /if \(evt\.type === "مفردة"\) \{([\s\S]*?)\} else \{([\s\S]*?)\}/;
  
  if (content.match(ifElseRegex)) {
    const singleContent = content.match(ifElseRegex)[1];
    // We just want to unconditionally run the singleContent, but also we might need to parse series rooms if it had multiple rooms. But singleRoom only takes a string. So evt.location || "" is fine.
    content = content.replace(ifElseRegex, singleContent.trim());
  }

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
