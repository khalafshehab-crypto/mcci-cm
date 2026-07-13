const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const columnsButtonStart = `{/* Columns Selector Dropdown */}`;
const googleSheetsButtonStart = `{/* Google Sheets Export Button */}`;

const startIndex = code.indexOf(columnsButtonStart);
const endIndex = code.indexOf(googleSheetsButtonStart);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
