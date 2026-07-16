import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Detect Vite chunk loading errors and reload the page automatically to fetch new chunks
    if (
      error.message && 
      (error.message.includes("Failed to fetch dynamically imported module") || 
       error.message.includes("Importing a module script failed"))
    ) {
      window.location.reload();
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside the application core:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-right" dir="rtl">
          <div className="bg-slate-800 border border-red-500/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-100 text-center">حدثت مشكلة غير متوقعة في العرض</h2>
            <p className="text-xs text-slate-400 font-bold leading-relaxed text-center">
              تم اكتشاف خطأ برمجي طفيف في هذه الشاشة. لمساعدتك، لحسن الحظ جرى حصر المشكلة بنجاح عبر جدار الحماية التلقائي دون تعطل بقية النظام.
            </p>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 overflow-x-auto custom-scrollbar">
              <p className="font-mono text-[10.5px] text-red-450 leading-relaxed break-words whitespace-pre-wrap text-left">
                {this.state.error?.toString() || "Script error (استثناء برمجي خارجي)"}
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                تحديث الصفحة والمحاولة مجدداً 🔄
              </button>
              <button
                type="button"
                onClick={() => {
                  (this as any).setState({ hasError: false, error: null });
                  window.location.hash = "";
                  window.location.href = "/";
                }}
                className="w-full py-2 bg-slate-700 hover:bg-slate-650 text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-slate-650"
              >
                العودة للرئيسية 🏠
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
export default ErrorBoundary;
