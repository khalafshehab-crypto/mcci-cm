const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Dropdown options
code = code.replace(
  /\{importColumns\.map\(col => \(\s*<option key=\{col\} value=\{col\}>\{col\}<\/option>\s*\)\)\}/g,
  '{importColumns.map((col, idx) => (\\n                              <option key={idx} value={col}>{col}</option>\\n                            ))}'
);

// 2. Table Headers
code = code.replace(
  /\{importColumns\.slice\(0, 4\)\.map\(col => \(\s*<th key=\{col\}([^>]+)>\{col\}<\/th>\s*\)\)\}/g,
  '{importColumns.slice(0, 4).map((col, idx) => (\\n                              <th key={idx}$1>{col}</th>\\n                            ))}'
);

// 3. Table cells
const targetCells = `{importColumns.slice(0, 4).map(col => (
                                <td key={col} className="p-2 text-gray-800 text-xs truncate max-w-[150px] relative">
                                  {row[importColumns.indexOf(col)]}
                                  {isDup && importColumns.indexOf(col) === 0 && (
                                    <span className="absolute -top-1 -right-1 text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">مكرر</span>
                                  )}
                                </td>
                              ))}`;

const replaceCells = `{importColumns.slice(0, 4).map((col, colIdx) => (
                                <td key={colIdx} className="p-2 text-gray-800 text-xs truncate max-w-[150px] relative">
                                  {row[importColumns.indexOf(col)]}
                                  {isDup && importColumns.indexOf(col) === 0 && (
                                    <span className="absolute -top-1 -right-1 text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">مكرر</span>
                                  )}
                                </td>
                              ))}`;

code = code.replace(targetCells, replaceCells);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Keys fixed");
