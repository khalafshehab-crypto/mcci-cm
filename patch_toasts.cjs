const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

// 1. Remove initial loading toast
const startFind = `setIsSavingAIGen(true);\n    showGlobalToast("جاري التحضير لمزامنة الملفات وأرشفتها في جوجل درايف...", "loading");`;
const startReplace = `setIsSavingAIGen(true);`;
if (code.includes(startFind)) {
    code = code.replace(startFind, startReplace);
}

// 2. Remove loop error toast
const loopErrFind = `setUploadProgress(prev => prev.map(p => p.id === String(committee.id) ? { ...p, status: 'error' } : p));
            showGlobalToast(\`تنبيه: حدث خطأ أثناء إنشاء ملف درايف للجنة \${committeeName}\`, "error");`;
const loopErrReplace = `setUploadProgress(prev => prev.map(p => p.id === String(committee.id) ? { ...p, status: 'error' } : p));`;
if (code.includes(loopErrFind)) {
    code = code.replace(loopErrFind, loopErrReplace);
}

// 3. Remove success toast
const successFind = `      showGlobalToast(targetCommittees.length > 1 ? \`تم حفظ التعميم بنجاح لعدد \${targetCommittees.length} من اللجان.\` : "تم حفظ التعميم بنجاح.", "success");
      setIsAIGenOpen(false);`;
const successReplace = `      setIsAIGenOpen(false);`;
if (code.includes(successFind)) {
    code = code.replace(successFind, successReplace);
}

// 4. Update overlay UI text conditionally
const overlayFind = `<p className="text-[11px] font-bold text-gray-500 mt-0.5">جاري نقل وحفظ الملفات</p>`;
const overlayReplace = `<p className="text-[11px] font-bold text-gray-500 mt-0.5">{!isSavingAIGen ? "تم نقل وحفظ الملفات بنجاح" : "جاري نقل وحفظ الملفات"}</p>`;
if (code.includes(overlayFind)) {
    code = code.replace(overlayFind, overlayReplace);
}

// 5. Hide overlay if try block throws error
const catchFind = `    } catch (e) {
      console.error(e);
      showGlobalToast("حدث خطأ أثناء الحفظ. الرجاء المحاولة مجدداً.", "error");
    } finally {`;
const catchReplace = `    } catch (e) {
      console.error(e);
      showGlobalToast("حدث خطأ أثناء الحفظ. الرجاء المحاولة مجدداً.", "error");
      setShowUploadOverlay(false);
    } finally {`;
if (code.includes(catchFind)) {
    code = code.replace(catchFind, catchReplace);
}

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Patched overlapping toasts.");
