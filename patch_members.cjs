const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Remove the inline style that hides the gear menu
  const oldStyle = `style={{ display: canUserEditCommittee(m.committeeName) ? 'flex' : 'none' }}`;
  
  if (content.includes(oldStyle)) {
     content = content.replaceAll(oldStyle, '');
     console.log("Patched style in " + filepath);
  } else {
     console.log("Could not find style in " + filepath);
  }

  // Same for evt.committeeName (if used)
  const oldStyleEvt = `style={{ display: canUserEditCommittee(evt.committeeName) ? 'flex' : 'none' }}`;
  if (content.includes(oldStyleEvt)) {
     content = content.replaceAll(oldStyleEvt, '');
     console.log("Patched evt style in " + filepath);
  }
  
  // Same for c.name
  const oldStyleC = `style={{ display: canUserEditCommittee(c.name) ? 'flex' : 'none' }}`;
  if (content.includes(oldStyleC)) {
      content = content.replaceAll(oldStyleC, '');
      console.log("Patched c style in " + filepath);
  }

  fs.writeFileSync(filepath, content);
  console.log("Saved " + filepath);
}

patchFile('src/pages/CommitteesMembers.tsx');
patchFile('src/pages/Members.tsx');
patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
patchFile('src/pages/CommitteesRecommendations.tsx');
patchFile('src/pages/Recommendations.tsx');
patchFile('src/pages/Committees.tsx');
patchFile('src/pages/CommitteesFormation.tsx');
