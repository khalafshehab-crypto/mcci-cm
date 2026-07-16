import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function GlobalToast() {
  const [toast, setToast] = useState<{ message: string; type: "loading" | "success" | "error" } | null>(null);

  useEffect(() => {
    const handleEvent = (e: any) => {
      const { message, type, duration } = e.detail;
      setToast({ message, type });
      if (type !== "loading" && duration !== 0) {
        if (duration !== -1) {
          setTimeout(() => {
            setToast(null);
          }, duration || (type === "error" ? 15000 : 5000));
        }
      }
    };
    
    const handleClear = () => setToast(null);

    window.addEventListener("show-global-toast", handleEvent);
    window.addEventListener("clear-global-toast", handleClear);

    return () => {
      window.removeEventListener("show-global-toast", handleEvent);
      window.removeEventListener("clear-global-toast", handleClear);
    };
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-[99999] max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden font-sans"
        >
          <div className="p-4 flex items-start gap-3 relative">
            {toast.type === "error" && (
              <button onClick={() => setToast(null)} className="absolute top-2 left-2 p-1 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
                <XCircle className="w-4 h-4" />
              </button>
            )}
            <div className="shrink-0 mt-0.5">
              {toast.type === "loading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${toast.type === "error" ? "text-red-700" : "text-gray-900"}`}>
                {toast.type === "loading" ? "جاري المعالجة والمزامنة..." : toast.type === "success" ? "تمت العملية بنجاح" : "حدث خطأ"}
              </h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </div>
          {toast.type === "loading" && (
            <div className="h-1 w-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse w-full"></div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
