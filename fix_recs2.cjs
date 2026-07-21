const fs = require('fs');
let code = fs.readFileSync('src/pages/Recommendations.tsx', 'utf8');

const target1 = `    return (
      (e.title || "").toLowerCase().includes(term) ||
      (e.committeeName || "").toLowerCase().includes(term)
    );`;
const replace1 = `    return (
      (e.title || "").toLowerCase().includes(term) ||
      (e.committeeName || "").toLowerCase().includes(term) ||
      (e.type || "").toLowerCase().includes(term) ||
      (e.location || "").toLowerCase().includes(term) ||
      (e.status || "").toLowerCase().includes(term) ||
      (e.date || "").toLowerCase().includes(term)
    );`;

const target2 = `       combined = combined.filter(r => 
         (r.title && (r.title || "").toLowerCase().includes(term)) ||
         (r.committeeName && (r.committeeName || "").toLowerCase().includes(term))
       );`;
const replace2 = `       combined = combined.filter(r => 
         (r.title || "").toLowerCase().includes(term) ||
         (r.committeeName || "").toLowerCase().includes(term) ||
         (r.description || "").toLowerCase().includes(term) ||
         (r.recommendationText || "").toLowerCase().includes(term) ||
         (r.assignedTo || "").toLowerCase().includes(term) ||
         (r.recommendationAssignee || "").toLowerCase().includes(term) ||
         (r.eventName || "").toLowerCase().includes(term) ||
         (r.status || "").toLowerCase().includes(term)
       );`;

code = code.replace(target1, replace1).replace(target2, replace2);
fs.writeFileSync('src/pages/Recommendations.tsx', code);
console.log("Patched Recommendations");
