const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

code = code.replace('employeesLoading || joinRequestsLoading || approvedEmailsLoading', 'employeesLoading || approvedEmailsLoading');

// Let's see what line 208 and 357 have for dbJoinRequests
