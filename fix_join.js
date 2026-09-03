const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const targetStr = `      const disabledEmp = dbEmployees.find(emp => emp.email?.trim().toLowerCase() === emailLower && !emp.active);
      let parsedId = "";`;

const splitCode = code.split(targetStr);
if(splitCode.length < 2) { console.log("Target not found"); process.exit(1); }

const endStr = `      alert(\`تمت الموافقة بنجاح وتم توليد رقم وظيفي للموظف: \${parsedId}\`);
    } catch (error) {`;

const splitPart2 = splitCode[1].split(endStr);
if(splitPart2.length < 2) { console.log("End not found"); process.exit(1); }

const newLogic = `      const disabledEmp = dbEmployees.find(emp => emp.email?.trim().toLowerCase() === emailLower && !emp.active);
      
      const performApproval = async (linkChoice: boolean) => {
        let parsedId = "";
        
        if (hasWorks || disabledEmp) {
          if (linkChoice) {
            if (disabledEmp) {
              parsedId = disabledEmp.id;
            } else {
              parsedId = Math.floor(1000 + Math.random() * 9000).toString();
              while (dbEmployees.some(emp => emp.id === parsedId)) {
                parsedId = Math.floor(1000 + Math.random() * 9000).toString();
              }
            }
          } else {
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

        try {
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
            gender: (req as any).gender || "MALE",
            isProfileComplete: false
          };

          await updateFirebaseEmp(parsedId, payload);
          await deleteJoinRequest(req.id);
          
          setConfirmDialog({
            isOpen: true,
            title: "تم بنجاح",
            message: \`تمت الموافقة بنجاح وتم توليد رقم وظيفي للموظف: \${parsedId}\`,
            confirmText: "حسناً",
            isAlert: true,
            onConfirm: () => setConfirmDialog(null)
          });
        } catch (error) {
          console.error("Approval error:", error);
          setConfirmDialog({
            isOpen: true,
            title: "خطأ",
            message: "حدث خطأ أثناء محاولة الاعتماد.",
            confirmText: "حسناً",
            isAlert: true,
            onConfirm: () => setConfirmDialog(null)
          });
        }
      };

      if (hasWorks || disabledEmp) {
        setConfirmDialog({
          isOpen: true,
          title: "ارتباطات سابقة للموظف",
          message: \`هناك أعمال سابقة (مهام أو توصيات) مسجلة باسم الموظف (\${req.name}) أو حساب معطل.\\n\\nهل تريد ربط الموظف الجديد بهذه الأعمال واستعادة حسابه القديم؟\\n\\n(تأكيد = ربط واستعادة، إلغاء = اعتماد كمعرف جديد)\`,
          confirmText: "ربط واستعادة",
          cancelText: "معرف جديد",
          onConfirm: () => {
            setConfirmDialog(null);
            performApproval(true);
          },
          onCancel: () => {
            setConfirmDialog(null);
            performApproval(false);
          }
        });
      } else {
        performApproval(false);
      }
    } catch (error) {`;

code = splitCode[0] + newLogic + splitPart2[1];
fs.writeFileSync('src/pages/OrgChart.tsx', code);
console.log("Done");
