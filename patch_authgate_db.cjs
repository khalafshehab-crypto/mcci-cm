const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

const regex1 = /const pendingReq = dbJoinRequests\.find\([\s\S]*?req\.email[\s\S]*?\);/g;
code = code.replace(regex1, `
    const res = await fetch('/api/join-requests');
    const allReqs = await res.json();
    const pendingReq = allReqs.find((req: any) => req.email?.trim().toLowerCase() === emailLower);
`);

const regex2 = /const requestExists = dbJoinRequests\.find\([\s\S]*?req\.email[\s\S]*?\);/g;
code = code.replace(regex2, `
    const res = await fetch('/api/join-requests');
    const allReqs = await res.json();
    const requestExists = allReqs.find((req: any) => req.email?.trim().toLowerCase() === emailLower);
`);

fs.writeFileSync('src/components/AuthGate.tsx', code);
console.log("Replaced dbJoinRequests references");
