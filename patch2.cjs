const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// Change export button onClick
code = code.replace(
  `onClick={() => setIsExportOpen(true)}`,
  `onClick={handleExportToGoogleSheets}`
);

// Remove the modal entirely
// Find the start of the modal: {/* 📊 GOOGLE SHEETS DYNAMIC EXPORT MODAL */}
// and remove it up to </AnimatePresence>
const modalStart = `{/* 📊 GOOGLE SHEETS DYNAMIC EXPORT MODAL */}`;
const modalEndMarker = `</AnimatePresence>`;
const startIndex = code.indexOf(modalStart);
if (startIndex !== -1) {
  let endIndex = code.indexOf(modalEndMarker, startIndex);
  if (endIndex !== -1) {
    // Find the next </AnimatePresence> just to be sure we are removing the right block
    // Wait, AnimatePresence is used earlier too.
    // Let's just use regex or split
    let blockToRemove = code.substring(startIndex, endIndex + modalEndMarker.length);
    if (blockToRemove.includes('isExportOpen')) {
      code = code.replace(blockToRemove, '');
    }
  }
}

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
