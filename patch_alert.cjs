const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf-8');

const targetAlert = `      } catch (err) {
        console.error("Failed to upload files to Drive:", err);
        alert("فشل إنشاء أو رفع الملفات في جوجل درايف، يرجى التحقق من تسجيل الدخول (Integration) والمحاولة مرة أخرى.");
      }`;
      
const replaceAlert = `      } catch (err: any) {
        console.error("Failed to upload files to Drive:", err);
        if (err.message && err.message.includes("انتهت صلاحية")) {
          alert(err.message);
        } else {
          alert("فشل إنشاء أو رفع الملفات في جوجل درايف، يرجى التحقق من تسجيل الدخول والمحاولة مرة أخرى.");
        }
      }`;

content = content.replace(targetAlert, replaceAlert);
fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
