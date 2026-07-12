const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const startMarker = '{/* POPUP BACKDROP & DETAILS MODAL */}';
const endMarker = '{/* 📊 GOOGLE SHEETS DYNAMIC EXPORT MODAL */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found!");
  process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

const replacement = `{/* POPUP BACKDROP & DETAILS MODAL */}
      <AnimatePresence>
        {detailsComm && (
          <CommitteeDetailsModalContent 
             detailsComm={detailsComm}
             setDetailsComm={setDetailsComm}
             handleOpenEdit={handleOpenEdit}
             handleOpenDelete={handleOpenDelete}
             dbMembers={dbMembers}
             dbEvents={dbEvents}
             dbRecs={dbRecs}
          />
        )}
      </AnimatePresence>

      `;

fs.writeFileSync('src/pages/CommitteesFormation.tsx', before + replacement + after);
console.log("Successfully replaced modal content.");
