import fs from 'fs';
const data = {};
try {
  data.employees = JSON.parse(fs.readFileSync('.mock_db/employees.json', 'utf8') || '[]');
} catch(e) {}
try {
  data.approved_emails = JSON.parse(fs.readFileSync('.mock_db/approved_emails.json', 'utf8') || '[]');
} catch(e) {}
try {
  data.join_requests = JSON.parse(fs.readFileSync('.mock_db/join_requests.json', 'utf8') || '[]');
} catch(e) {}
console.log(JSON.stringify(data, null, 2));
