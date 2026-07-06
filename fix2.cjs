const fs = require('fs');

const orgChart = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
const fixedBlock = fs.readFileSync('fixedBlock.txt', 'utf8');

// Find start and end of the broken map block
let startPattern = `                  {filteredEmployees.map((emp) => {`;
let startIdx = orgChart.indexOf(startPattern);

// The end of the block is just before `                </AnimatePresence>`
let endPattern = `                </AnimatePresence>`;
let endIdx = orgChart.indexOf(endPattern, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find patterns", startIdx, endIdx);
  process.exit(1);
}

const newOrgChart = orgChart.substring(0, startIdx) + fixedBlock + "\n" + orgChart.substring(endIdx);
fs.writeFileSync('src/pages/OrgChart.tsx', newOrgChart);
console.log("Replaced successfully!");
