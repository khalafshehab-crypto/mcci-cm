const fs = require('fs');
const path = 'src/pages/CommitteesEvents.tsx';
let code = fs.readFileSync(path, 'utf8');

const startIdx = code.indexOf('{/* AI Minutes of Meeting */}');
const endMarker = 'توليد المحضر الرسمي\n                                              </button>\n                                            </div>';
const endIdx = code.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + code.slice(endIdx + endMarker.length);
  fs.writeFileSync(path, code);
  console.log("Removed AI section successfully");
} else {
  console.log("Could not find AI section", startIdx, endIdx);
}
