const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesTasks.tsx', 'utf8');

const originalForwardInit = `const [forwardAssignDept, setForwardAssignDept] = useState("إدارة اللجان");`;
const replacementForwardInit = `const [forwardAssignDept, setForwardAssignDept] = useState("");`;

const originalSelectedInit = `const [selectedAssignDept, setSelectedAssignDept] = useState("إدارة اللجان");`;
const replacementSelectedInit = `const [selectedAssignDept, setSelectedAssignDept] = useState("");`;

const originalForwardReset = `setForwardAssignDept("إدارة اللجان");`;
const replacementForwardReset = `setForwardAssignDept("");`;

code = code.replace(originalForwardInit, replacementForwardInit);
code = code.replace(originalSelectedInit, replacementSelectedInit);
code = code.replace(/setForwardAssignDept\("إدارة اللجان"\);/g, replacementForwardReset);


fs.writeFileSync('src/pages/CommitteesTasks.tsx', code);
console.log("Fixed forwardAssignDept defaults");
