import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // متابعة حالة جلسة المستخدم لحظياً
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // دالة تسجيل الدخول عبر النافذة المنبثقة (متوافقة 100% مع الموبايل والويب)
  const handleLogin = async () => {
    try {
      setSigningIn(true);
      setError(null);
      
      googleProvider.setCustomParameters({ 
        prompt: 'select_account' 
      });

      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
      }
    } catch (err: any) {
      console.error("فشل تسجيل الدخول:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("المتصفح قام بحظر النافذة المنبثقة، يُرجى السماح بالنوافذ المنبثقة في هاتفك.");
      } else {
        setError(err.message || "تعذر تسجيل الدخول، يُرجى المحاولة مرة أخرى.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  // شاشة التحميل الأولية
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white font-sans" dir="rtl">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-300 text-sm font-medium">جاري التحقق من الجلسة والصلاحيات...</p>
      </div>
    );
  }

  // في حال تسجيل الدخول بنجاح، يتم فتح صفحات النظام مباشرة
  if (user) {
    return <>{children}</>;
  }

  // شاشة تسجيل الدخول المخصصة (بهوية غرفة مكة المكرمة)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        {/* لمسة إضاءة تجميلية */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* أيقونة وهوية النظام */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-amber-600 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
          <svg className="w-10 h-10 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">منظومة إدارة اللجان الذكية</h1>
        <p className="text-slate-400 text-sm mb-8">غرفة مكة المكرمة - إدارة اللجان والقطاعات</p>

        {/* رسالة الخطأ إن وجدت */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs leading-relaxed text-right">
            ⚠️ {error}
          </div>
        )}

        {/* زر تسجيل الدخول عبر Google */}
        <button
          onClick={handleLogin}
          disabled={signingIn}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
        >
          {signingIn ? (
            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
          )}
          <span>{signingIn ? "جاري الاتصال بحسابك..." : "الدخول باستخدام حساب Google"}</span>
        </button>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
          دخول مقتصر على موظفي وأعضاء لجان غرفة مكة المكرمة
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
