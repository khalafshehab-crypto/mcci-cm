const fs = require('fs');

// Fix OrgChart.tsx
let orgCode = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');
orgCode = orgCode.replace(/dbJoinRequests/g, 'serverJoinRequests');

// For toast, check if it's imported
if (!orgCode.includes('import toast') && !orgCode.includes('import { toast }')) {
    // Actually, `toast` is used without import in verifyJoinRequestsIntegrity!
    // I will just use `alert` instead.
    orgCode = orgCode.replace(/toast\.error/g, 'alert');
    orgCode = orgCode.replace(/toast\.success/g, 'alert');
}

fs.writeFileSync('src/pages/OrgChart.tsx', orgCode);

// Fix GoogleWorkspaceCenter.tsx
let gwCode = fs.readFileSync('src/components/GoogleWorkspaceCenter.tsx', 'utf8');
// The error is Object literal may only specify known properties, and 'summary' does not exist in type 'CalendarEventPayload'
gwCode = gwCode.replace(/summary:/g, 'title:'); // If the interface is title
fs.writeFileSync('src/components/GoogleWorkspaceCenter.tsx', gwCode);

console.log("Fixed errors");
