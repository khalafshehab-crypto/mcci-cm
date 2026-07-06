const fs = require('fs');

const originalPart1 = fs.readFileSync('part1.txt', 'utf8');

let mapBlockStart = originalPart1.indexOf('                  {filteredEmployees.map((emp) => {');
let mapBlock = originalPart1.substring(mapBlockStart);

let fixedBlock = mapBlock.replace(
  `{path.length > 0 ? path.map((level, index, array) => (`,
  `{path.parts.length > 0 ? path.parts.map((level, index, array) => (`
);
fixedBlock = fixedBlock.replace(
  `index >= array.length - 1 - (emp.committees?.length || 0) ? "bg-brand text-white" : "bg-gray-50 border border-gray-200"`,
  `index >= array.length - path.validCount ? "bg-brand text-white" : "bg-gray-50 border border-gray-200"`
);

fs.writeFileSync('fixedBlock.txt', fixedBlock);
