const fs = require('fs');
let content = fs.readFileSync('src/components/AuthGate.tsx', 'utf-8');

const targetStr = `const { data: dbJoinRequests`;
const replaceStr = `const { data: dbApprovedEmails, loading: approvedEmailsLoading } = useFirestoreCollection<any>("approved_emails", []);\n  const { data: dbJoinRequests`;

content = content.replace(targetStr, replaceStr);

const loadingTarget = `const isDataLoading = employeesLoading || joinRequestsLoading;`;
const loadingReplace = `const isDataLoading = employeesLoading || joinRequestsLoading || approvedEmailsLoading;`;

content = content.replace(loadingTarget, loadingReplace);

const loginTarget = `    // 3. Is there a pending join request?`;
const loginReplace = `    // 3. Check Whitelist (Approved Emails) for auto-provisioning
    let approvedRecord = null;
    if (db && db.type !== "dummy_firestore") {
      try {
        const qAppr = query(collection(db, "approved_emails"));
        const snapAppr = await getDocs(qAppr);
        const allAppr = snapAppr.docs.map(d => ({ id: d.id, ...d.data() }));
        approvedRecord = allAppr.find((a: any) => a.email?.trim().toLowerCase() === emailLower);
      } catch(e) {}
    } else {
      approvedRecord = dbApprovedEmails.find((a: any) => a.email?.trim().toLowerCase() === emailLower);
    }
    
    if (approvedRecord) {
      // Auto-provision this user as an employee
      let parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      const newEmp = {
        id: parsedId,
        name: approvedRecord.name,
        role: approvedRecord.roleAr === "مدير إدارة" ? "MANAGER" : (approvedRecord.roleAr === "رئيس قسم" ? "HEAD" : "SPECIALIST"),
        roleAr: approvedRecord.roleAr || "أخصائي اللجان",
        jobTitle: approvedRecord.roleAr || "أخصائي",
        orgLevel1: "الأمانة العامة",
        phone: "-",
        email: emailLower,
        photo: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        committees: [],
        active: true,
        loginEnabled: true,
        joinDate: new Date().toLocaleDateString('en-GB')
      };
      await setFirebaseEmpDoc(parsedId, newEmp);
      localStorage.setItem("current_user", JSON.stringify(newEmp));
      await logSystemAction(newEmp.name, \`إنشاء تلقائي لموظف معتمد (Whitelist) وتفويض الدخول [\${emailLower}]\`, "ناجحة");
      onLogin(newEmp);
      return true;
    }

    // 4. Is there a pending join request?`;

content = content.replace(loginTarget, loginReplace);
fs.writeFileSync('src/components/AuthGate.tsx', content);
