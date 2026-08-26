const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf-8');

// 1. Add State
const stateFind = 'const [isSavingAIGen, setIsSavingAIGen] = useState(false);';
const stateReplace = `const [isSavingAIGen, setIsSavingAIGen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{id: string, name: string, status: 'pending' | 'syncing' | 'completed' | 'error'}[]>([]);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);`;
if (code.includes(stateFind) && !code.includes('uploadProgress')) {
    code = code.replace(stateFind, stateReplace);
}

// 2. Add starting progress
const saveStartFind = `      const isCircular = workspaceService === "circular";
      const finalType = isCircular ? "تعميم" : aiGenTemplateType.replace(/\\s*\\(.*\\)/, "").trim();`;
const saveStartReplace = `      setUploadProgress(targetCommittees.map(c => ({ id: String(c.id), name: c.name, status: 'pending' })));
      setShowUploadOverlay(true);
      
      const isCircular = workspaceService === "circular";
      const finalType = isCircular ? "تعميم" : aiGenTemplateType.replace(/\\s*\\(.*\\)/, "").trim();`;
if (code.includes(saveStartFind)) {
    code = code.replace(saveStartFind, saveStartReplace);
}

// 3. Loop syncing state
const loopFind = `      for (let i = 0; i < targetCommittees.length; i++) {
        const committee = targetCommittees[i];
        const nextCommitteeName = targetCommittees[i + 1]?.name;
        let progressMsg = \`جاري مزامنة الملفات وأرشفتها في جوجل درايف... جاري حالياً أرشفة الملفات في \${committee.name}\`;
        if (nextCommitteeName) progressMsg += \` والتالي أرشفة الملفات في \${nextCommitteeName}\`;
        showGlobalToast(progressMsg, "loading", 10000);`;
const loopReplace = `      for (let i = 0; i < targetCommittees.length; i++) {
        const committee = targetCommittees[i];
        const nextCommitteeName = targetCommittees[i + 1]?.name;
        let progressMsg = \`جاري مزامنة الملفات وأرشفتها في جوجل درايف... جاري حالياً أرشفة الملفات في \${committee.name}\`;
        if (nextCommitteeName) progressMsg += \` والتالي أرشفة الملفات في \${nextCommitteeName}\`;
        // showGlobalToast(progressMsg, "loading", 10000); // UI overlay takes over
        setUploadProgress(prev => prev.map(p => p.id === String(committee.id) ? { ...p, status: 'syncing' } : p));`;
if (code.includes(loopFind)) {
    code = code.replace(loopFind, loopReplace);
}

// 4. Catch Error status
const catchFind = `          } catch (apiError) {
            console.error("Google API Error:", apiError);
            showGlobalToast(\`تنبيه: حدث خطأ أثناء إنشاء ملف درايف للجنة \${committeeName}\`, "error");
          }`;
const catchReplace = `          } catch (apiError) {
            console.error("Google API Error:", apiError);
            setUploadProgress(prev => prev.map(p => p.id === String(committee.id) ? { ...p, status: 'error' } : p));
            showGlobalToast(\`تنبيه: حدث خطأ أثناء إنشاء ملف درايف للجنة \${committeeName}\`, "error");
          }`;
if (code.includes(catchFind)) {
    code = code.replace(catchFind, catchReplace);
}

// 5. Success status
const loopEndFind = `        committeeUrls.push({
            committeeId: committee.id,
            committeeName: committee.name,
            documentUrl: finalCloudUrl,
            folderUrl: folderCloudUrl
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
      }`;
const loopEndReplace = `        committeeUrls.push({
            committeeId: committee.id,
            committeeName: committee.name,
            documentUrl: finalCloudUrl,
            folderUrl: folderCloudUrl
        });
        
        setUploadProgress(prev => prev.map(p => p.id === String(committee.id) && p.status !== 'error' ? { ...p, status: 'completed' } : p));
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }`;
if (code.includes(loopEndFind)) {
    code = code.replace(loopEndFind, loopEndReplace);
}

// 6. Close overlay at end
const finalBlockFind = `      showGlobalToast(targetCommittees.length > 1 ? \`تم حفظ التعميم بنجاح لعدد \${targetCommittees.length} من اللجان.\` : "تم حفظ التعميم بنجاح.", "success");
      setIsAIGenOpen(false);
      setEditAIGenTargetId(null);
    } catch (e) {`;
const finalBlockReplace = `      showGlobalToast(targetCommittees.length > 1 ? \`تم حفظ التعميم بنجاح لعدد \${targetCommittees.length} من اللجان.\` : "تم حفظ التعميم بنجاح.", "success");
      setIsAIGenOpen(false);
      setEditAIGenTargetId(null);
      setTimeout(() => setShowUploadOverlay(false), 5000);
    } catch (e) {`;
if (code.includes(finalBlockFind)) {
    code = code.replace(finalBlockFind, finalBlockReplace);
}

// 7. Inject UI Overlay
const uiInjectionPoint = '{/* Add / Import / Export Modal */}';
const overlayUI = `
      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {showUploadOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden"
            dir="rtl"
          >
            <div className="bg-gray-50/80 backdrop-blur border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Upload className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-extrabold text-sm text-gray-900">مزامنة وأرشفة سحابية</h3>
                   <p className="text-[11px] font-bold text-gray-500 mt-0.5">جاري نقل وحفظ الملفات</p>
                 </div>
              </div>
              {!isSavingAIGen && (
                <button onClick={() => setShowUploadOverlay(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              <ul className="space-y-1">
                {uploadProgress.map((p, idx) => (
                  <li key={p.id + idx} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                     <span className="text-xs font-bold text-gray-700">{p.name}</span>
                     <div>
                       {p.status === 'pending' && <Clock className="w-4 h-4 text-gray-300" />}
                       {p.status === 'syncing' && <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />}
                       {p.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                       {p.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                     </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      `;
if (code.includes(uiInjectionPoint) && !code.includes('Upload Progress Overlay')) {
    code = code.replace(uiInjectionPoint, overlayUI + uiInjectionPoint);
}

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', code);
console.log("Patched Multi Upload UI");
