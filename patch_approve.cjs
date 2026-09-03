const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const newApproveFunc = `  const handleApproveJoinRequest = async (req: JoinRequest) => {
    if (employeesLoading) {
      alert("جاري تحميل البيانات، يرجى المحاولة بعد قليل.");
      return;
    }
    try {
      const emailLower = req.email.trim().toLowerCase();
      // Check if email is taken by an active employee
      const emailTaken = dbEmployees.some(emp => emp.email?.trim().toLowerCase() === emailLower && emp.active);
      if (emailTaken) {
        alert(\`عذراً، البريد الإلكتروني [\$\{req.email\}] مأخوذ من قبل موظف نشط.\`);
        return;
      }

      // Check for previous works or deleted employee
      let hasWorks = false;
      const tasksQ = query(collection(db, "tasks"), where("assignedTo", "==", req.name));
      const recQ = query(collection(db, "recommendations"), where("assignedTo", "==", req.name));
      
      const [tasksSnap, recSnap] = await Promise.all([getDocs(tasksQ), getDocs(recQ)]);
      if (!tasksSnap.empty || !recSnap.empty) {
        hasWorks = true;
      }

      const disabledEmp = dbEmployees.find(emp => emp.email?.trim().toLowerCase() === emailLower && !emp.active);
      let parsedId = "";

      if (hasWorks || disabledEmp) {
        const linkChoice = window.confirm(\`هناك أعمال سابقة (مهام أو توصيات) أو حساب معطل مسجل باسم الموظف (\$\{req.name\}).\\n\\nهل تريد ربط هذا الموظف الجديد بهذه الأعمال واستعادة حسابه القديم إن وجد؟\\n\\n(موافق = ربط واستعادة، إلغاء = اعتماد كمعرف جديد)\`);
        if (linkChoice) {
          if (disabledEmp) {
            parsedId = disabledEmp.id; // restore old id
          } else {
            // Generate new ID but keep the same name so works link automatically
            parsedId = Math.floor(1000 + Math.random() * 9000).toString();
            while (dbEmployees.some(emp => emp.id === parsedId)) {
              parsedId = Math.floor(1000 + Math.random() * 9000).toString();
            }
          }
        } else {
          // Generate new ID and alter name slightly to prevent linking to old works
          parsedId = Math.floor(1000 + Math.random() * 9000).toString();
          while (dbEmployees.some(emp => emp.id === parsedId)) {
            parsedId = Math.floor(1000 + Math.random() * 9000).toString();
          }
          req.name = req.name + " (جديد)";
        }
      } else {
        parsedId = Math.floor(1000 + Math.random() * 9000).toString();
        while (dbEmployees.some(emp => emp.id === parsedId)) {
          parsedId = Math.floor(1000 + Math.random() * 9000).toString();
        }
      }

      const payload: Omit<Employee, "id"> = {
        name: req.name,
        role: "SPECIALIST",
        roleAr: "أخصائي اللجان",
        jobTitle: "أخصائي",
        orgLevel1: "الأمانة العامة",
        phone: req.phone,
        email: emailLower,
        photo: disabledEmp?.photo || PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        committees: disabledEmp?.committees || [],
        active: true,
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        gender: (req as any).gender || "MALE"
      };

      await updateFirebaseEmp(parsedId, payload);
      await deleteJoinRequest(req.id);
      alert(\`تمت الموافقة بنجاح وتم توليد رقم وظيفي للموظف: \$\{parsedId\}\`);
    } catch (error) {
      console.error(error);
      alert("فشل في اعتماد طلب الانضمام.");
    }
  };`;

code = code.replace(/const handleApproveJoinRequest = async \(req: JoinRequest\) => \{[\s\S]*?catch \(error\) \{\s*alert\("فشل في اعتماد طلب الانضمام\."\);\s*\}\s*\};/, newApproveFunc);

fs.writeFileSync('src/pages/OrgChart.tsx', code);
