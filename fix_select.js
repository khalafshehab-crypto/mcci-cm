const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

const targetStr = `<option value="new">إنشاء خطاب جديد</option>
                             <option value="reply">رد على خطاب وارد</option>`;

const replacementStr = `{workspaceService === "docs" ? (
                               <>
                                 <option value="new">إنشاء خطاب/مستند جديد</option>
                                 <option value="reply">رد على خطاب/مستند وارد</option>
                               </>
                             ) : workspaceService === "slides" ? (
                               <option value="new">إنشاء عرض تقديمي جديد</option>
                             ) : workspaceService === "sheets" ? (
                               <option value="new">إنشاء جدول بيانات جديد</option>
                             ) : workspaceService === "gmail" ? (
                               <>
                                 <option value="new">إنشاء بريد إلكتروني جديد</option>
                                 <option value="reply">رد على بريد إلكتروني</option>
                               </>
                             ) : workspaceService === "tasks" ? (
                               <option value="new">إنشاء مهمة جديدة</option>
                             ) : workspaceService === "calendar" ? (
                               <option value="new">إنشاء حدث جديد في التقويم</option>
                             ) : workspaceService === "chat" ? (
                               <option value="new">إنشاء رسالة محادثة جديدة</option>
                             ) : workspaceService === "meet" ? (
                               <option value="new">إنشاء رابط اجتماع جديد</option>
                             ) : workspaceService === "forms" ? (
                               <option value="new">إنشاء نموذج جديد</option>
                             ) : (
                               <option value="new">إنشاء نموذج جديد</option>
                             )}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find exact string. Here is the block:");
    const idx = content.indexOf('حالة النموذج');
    console.log(content.substring(idx, idx + 500));
}
