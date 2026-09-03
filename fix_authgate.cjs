const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

code = code.replace(/const \{ data: dbJoinRequests, addDocument: addFirebaseJoinReq, loading: joinRequestsLoading \} = useFirestoreCollection<any>\("join_requests", \[\]\);/, '');

fs.writeFileSync('src/components/AuthGate.tsx', code);
console.log("Fixed AuthGate.tsx");
