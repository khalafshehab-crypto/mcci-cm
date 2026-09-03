const fs = require('fs');
let code = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

// 1. Add toast dispatch to handlePurgeEntireSystem
const newPurgeFunction = `  const handlePurgeEntireSystem = async () => {
    setIsPurging(true);
    setPurgeError("");
    setShowPurgeConfirm(false);

    window.dispatchEvent(
      new CustomEvent("show-global-toast", {
        detail: { message: "جاري حذف جميع البيانات من الجداول المحددة...", type: "loading" },
      })
    );

    try {
      const collectionsToPurge = [
        "committees", "members", "events", "recommendations", "tasks",
        "system_logs", "templates", "kpis", "reports", "join_requests", "approved_emails", "org_structure"
      ];

      const { collection, getDocs, deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      for (const colName of collectionsToPurge) {
        window.dispatchEvent(
          new CustomEvent("show-global-toast", {
            detail: { message: "جاري تفريغ جدول: " + colName, type: "loading" },
          })
        );
        try {
          const snap = await getDocs(collection(db, colName));
          for (const docSnap of snap.docs) {
            await deleteDoc(doc(db, colName, docSnap.id));
          }
        } catch (err) {}
        localStorage.removeItem(\`mock_db_\${colName}\`);
        localStorage.removeItem(\`app_\${colName}\`);
      }

      window.dispatchEvent(
        new CustomEvent("show-global-toast", {
          detail: { message: "جاري تصفير بيانات الموظفين...", type: "loading" },
        })
      );
      try {
        const empSnap = await getDocs(collection(db, "employees"));
        for (const docSnap of empSnap.docs) {
          const d = docSnap.data();
          const lowerEmail = d?.email?.trim().toLowerCase();
          const isSysAdmin = lowerEmail === "khalafshehab@gmail.com" || docSnap.id === "01";
          if (!isSysAdmin) {
            await deleteDoc(doc(db, "employees", docSnap.id));
          }
        }
      } catch (err) {}

      localStorage.removeItem(\`mock_db_employees\`);
      localStorage.removeItem(\`app_employees\`);
      setPurgeSuccess(true);
      
      window.dispatchEvent(
        new CustomEvent("show-global-toast", {
          detail: { message: "اكتمل التصفير بنجاح! سيتم إعادة تحميل النظام.", type: "success" },
        })
      );

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (e: any) {
      setPurgeError("حدث خطأ أثناء محاولة تصفير قاعدة البيانات: " + (e.message || String(e)));
      window.dispatchEvent(
        new CustomEvent("show-global-toast", {
          detail: { message: "فشل التصفير: " + (e.message || String(e)), type: "error" },
        })
      );
    } finally {
      setIsPurging(false);
    }
  };`;

code = code.replace(/const handlePurgeEntireSystem = async \(\) => \{[\s\S]*?setIsPurging\(false\);\n    \}\n  \};/, newPurgeFunction);

const modalCode = `
        {/* Purge Confirm Modal */}
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right font-sans" dir="rtl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-red-100"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-center text-gray-900 mb-2">تأكيد تصفير النظام</h3>
                <p className="text-xs text-gray-500 font-bold text-center leading-relaxed mb-6">
                  هذا الإجراء سيقوم بحذف <span className="text-red-650">كافة البيانات</span> (لجان، أعضاء، فعاليات، مهام، تقارير، الخ) بشكل نهائي ولا يمكن التراجع عنه. هل أنت متأكد من رغبتك في الاستمرار؟
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePurgeEntireSystem}
                    disabled={isPurging}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isPurging ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> جاري التصفير...</>
                    ) : (
                      <><ShieldAlert className="w-4 h-4" /> نعم، قم بتصفير النظام</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPurgeConfirm(false)}
                    disabled={isPurging}
                    className="px-6 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
`;

code = code.replace(/<\/AnimatePresence>\s*<\/div>\s*\);\s*\}/, modalCode + '\n      </AnimatePresence>\n    </div>\n  );\n}');

fs.writeFileSync('src/pages/OrgChart.tsx', code);
