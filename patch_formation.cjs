const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const regexHasFiles = /    const hasFilesToUpload = [\s\S]*?\(guides && typeof guides === "object" && "name" in guides\);\n/;
content = content.replace(regexHasFiles, '');

const regexAuthBlock = /    if \(!token\) \{\n      try \{\n        token = await triggerAuthModal\(\);\n      \} catch \(err\) \{\n        console\.warn\("User cancelled auth", err\);\n        alert\("لا يمكن إنشاء مجلدات اللجنة بدون تسجيل الدخول بحساب جوجل\. يرجى المحاولة مرة أخرى وتأكيد المصادقة\."\);\n        return;\n      \}\n    \}/;

const replaceAuthBlock = `    showGlobalToast("جاري المعالجة والرفع إلى السحابة المركزية...", "loading", 0);
    if (!token) {
      try {
        token = await triggerAuthModal();
      } catch (err) {
        console.warn("User cancelled or failed to authenticate", err);
      }
    }`;
content = content.replace(regexAuthBlock, replaceAuthBlock);

const regexRootFolder = /const rootFolderId = await getOrCreateFolder\("تقرير اللجان القطاعية الـ 22"\);/;
const replaceRootFolder = `const rootFolderId = await getOrCreateFolder("تقرير اللجان للدورة الـ 22");`;
content = content.replace(regexRootFolder, replaceRootFolder);

const regexUploadCatch = /      \} catch \(err\) \{\n        console\.error\("Failed to create Drive folder or upload files:", err\);\n        alert\("فشل إنشاء مجلد اللجنة في جوجل درايف أو رفع الملفات، يرجى التأكد من تسجيل الدخول وإعادة المحاولة\."\);\n        return; \/\/ Stop saving if Drive operations fail\n      \}/;
const replaceUploadCatch = `      } catch (err: any) {
        console.error("Failed to create Drive folder or upload files:", err);
        if (err.message && err.message.includes("انتهت صلاحية")) {
          showGlobalToast(err.message, "error");
        } else {
          showGlobalToast("فشل إنشاء مجلد اللجنة في جوجل درايف أو رفع الملفات: " + err.message, "error");
        }
        return; // Stop saving if Drive operations fail
      }`;
content = content.replace(regexUploadCatch, replaceUploadCatch);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
