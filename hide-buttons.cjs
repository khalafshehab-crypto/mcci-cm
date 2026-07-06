const fs = require('fs');

function patchFile(file, regex, replace) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replace);
    fs.writeFileSync(file, content);
}

// CommitteesMembers.tsx
let members = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');
members = members.replace(
    /onClick=\{\(\) => setActiveGearMenuId\(activeGearMenuId === m\.id \? null : m\.id\)\}/g,
    `onClick={() => setActiveGearMenuId(activeGearMenuId === m.id ? null : m.id)}\n                    style={{ display: canUserEditCommittee(m.committeeName) ? 'flex' : 'none' }}`
);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', members);

// CommitteesEvents.tsx
let events = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');
events = events.replace(
    /onClick=\{\(\) => setActiveGearMenuId\(activeGearMenuId === evt\.id \? null : evt\.id\)\}/g,
    `onClick={() => setActiveGearMenuId(activeGearMenuId === evt.id ? null : evt.id)}\n                              style={{ display: canUserEditCommittee(evt.committeeName) ? 'flex' : 'none' }}`
);
fs.writeFileSync('src/pages/CommitteesEvents.tsx', events);

// CommitteesRecommendations.tsx
let recs = fs.readFileSync('src/pages/CommitteesRecommendations.tsx', 'utf8');
recs = recs.replace(
    /onClick=\{\(\) => setActiveGearMenuId\(activeGearMenuId === evt\.id \? null : evt\.id\)\}/g,
    `onClick={() => setActiveGearMenuId(activeGearMenuId === evt.id ? null : evt.id)}\n                              style={{ display: canUserEditCommittee(evt.committeeName) ? 'flex' : 'none' }}`
);
fs.writeFileSync('src/pages/CommitteesRecommendations.tsx', recs);

// CommitteesFormation.tsx
let form = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');
form = form.replace(
    /onClick=\{\(\) => setActiveGearMenuId\(activeGearMenuId === comm\.id \? null : comm\.id\)\}/g,
    `onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}\n                    style={{ display: canUserEditCommittee(comm.name) ? 'flex' : 'none' }}`
);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', form);

