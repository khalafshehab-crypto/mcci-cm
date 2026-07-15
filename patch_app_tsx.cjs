const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importInjection = `import { connectGoogleWorkspace, resolveAuthModal, rejectAuthModal } from "./lib/googleApi";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function GoogleSyncModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    window.addEventListener("show-google-auth-modal", handleShow);
    return () => window.removeEventListener("show-google-auth-modal", handleShow);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const token = await connectGoogleWorkspace();
      resolveAuthModal(token);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      rejectAuthModal(err);
      setIsOpen(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCancel = () => {
    rejectAuthModal(new Error("User cancelled sync"));
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10 text-right font-sans border border-rose-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-950 text-base leading-tight">تجديد المزامنة مع جوجل</h3>
                <p className="text-xs font-semibold text-gray-500 mt-1">انتهت صلاحية جلسة جوجل درايف للرفع التلقائي. يرجى تجديد الاتصال لاستكمال الرفع.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5 text-xs text-gray-600 leading-relaxed font-medium">
              لحماية بياناتك، تقوم خدمات جوجل بإنهاء الجلسة برمجياً كل ساعة. بمجرد الضغط على تأكيد، ستتم مصادقة الحساب وسيستكمل النظام الرفع تلقائياً من حيث توقف.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> جاري المزامنة...</>
                ) : (
                  "تأكيد وتجديد المزامنة"
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSyncing}
                className="px-5 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm rounded-xl transition-all cursor-pointer"
              >
                إلغاء الرفع
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
`;

if (!content.includes("GoogleSyncModal")) {
    content = content.replace(`import ErrorBoundary from "./components/ErrorBoundary";`, `import ErrorBoundary from "./components/ErrorBoundary";\n${importInjection}`);
}

const renderInjection = `<Router>
        <GoogleSyncModal />`;

content = content.replace("<Router>", renderInjection);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
