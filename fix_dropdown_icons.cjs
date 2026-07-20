const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regexImport = /<Upload className="w-3\.5 h-3\.5" \/>(\s*<\/div>\s*<span>استيراد<\/span>)/;
if (code.match(regexImport)) {
  code = code.replace(regexImport, '<Download className="w-3.5 h-3.5" />$1');
  console.log("Replaced import icon");
}

const regexExport = /<Download className="w-3\.5 h-3\.5" \/>(\s*<\/div>\s*<span>تصدير<\/span>)/;
if (code.match(regexExport)) {
  code = code.replace(regexExport, '<Upload className="w-3.5 h-3.5" />$1');
  console.log("Replaced export icon");
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Done");
