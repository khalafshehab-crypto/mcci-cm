const fs = require('fs');
let code = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');

// Replace the addFirebaseJoinReq call with a fetch call
const oldCall = `await addFirebaseJoinReq(payload);`;
const newCall = `await fetch('/api/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });`;

code = code.replace(oldCall, newCall);

// Remove the `const requestExists = dbJoinRequests.find` check that uses Firestore data
const oldCheck = `      const requestExists = dbJoinRequests.find(
        (req: any) => req.email?.trim().toLowerCase() === emailLower && !String(req.id).startsWith("join_")
      );

      if (requestExists) {
        setMessage({
          text: "هناك طلب انضمام معلق بالفعل بهذا البريد الإلكتروني. يرجى الانتظار حتى يتم اعتماده.",
          type: "error"
        });
        setLoading(false);
        return;
      }`;

const newCheck = `      const res = await fetch('/api/join-requests');
      const allReqs = await res.json();
      const requestExists = allReqs.find((req: any) => req.email?.trim().toLowerCase() === emailLower);

      if (requestExists) {
        setMessage({
          text: "هناك طلب انضمام معلق بالفعل بهذا البريد الإلكتروني. يرجى الانتظار حتى يتم اعتماده.",
          type: "error"
        });
        setLoading(false);
        return;
      }`;

code = code.replace(oldCheck, newCheck);

fs.writeFileSync('src/components/AuthGate.tsx', code);
console.log("Updated AuthGate.tsx");
