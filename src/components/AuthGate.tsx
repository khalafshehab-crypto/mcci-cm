import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Clock,
  LogIn,
  UserPlus
} from "lucide-react";
import { useFirestoreCollection, setFirestoreBlocked } from "../lib/firebaseUtils";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

interface AuthGateProps {
  onLogin: (user: any) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
];

export default function AuthGate({ onLogin }: AuthGateProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Registration States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regGender, setRegGender] = useState<"MALE" | "FEMALE">("MALE");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Firestore Collections
  const { data: dbEmployees, setDocument: setFirebaseEmpDoc } = useFirestoreCollection<any>("employees", []);
  const { data: dbJoinRequests, addDocument: addFirebaseJoinReq } = useFirestoreCollection<any>("join_requests", []);
  const { addDocument: addFirebaseLog } = useFirestoreCollection<any>("system_logs", []);

  const logSystemAction = async (employeeName: string, details: string, status: "ناجحة" | "مرفوضة") => {
    try {
      await addFirebaseLog({
        employeeName,
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        operationType: "تسجيل دخول / انضمام",
        status,
        details
      });
    } catch (e) {
      console.error("Failed to write system log:", e);
    }
  };

  // معالجة التحقق والتوجيه بالبريد الإلكتروني المدخل بعد الحصول عليه
  const proceedWithEmailLogin = async (email: string) => {
    const emailLower = email.trim().toLowerCase();

    // 1. Is this the Master Administrator?
    if (emailLower === "khalafshehab@gmail.com" || emailLower === "khalafshehab-crypto@gmail.com") {
      // Check if there is an existing employee card in the database with this admin email
      const existingAdmin = dbEmployees.find(
        (emp: any) => emp.email?.trim().toLowerCase() === emailLower
      );

      if (existingAdmin) {
        // Use the existingAdmin (it has their custom ID, name, phone, etc.!)
        localStorage.setItem("current_user", JSON.stringify(existingAdmin));
        await logSystemAction(existingAdmin.name, `تسجيل دخول ناجح للمسؤول برمز بريدي معتمد [${emailLower}]`, "ناجحة");
        onLogin(existingAdmin);
        return true;
      }

      const adminEmp = {
        id: "01",
        name: "مدير النظام",
        role: "SYS_ADMIN",
        roleAr: "مدير النظام",
        jobTitle: "مشرف النظام",
        phone: "+966558494158",
        email: emailLower,
        photo: PRESET_AVATARS[0],
        committees: [],
        active: true,
        joinDate: "2024/01/15"
      };

      // Ensure provisioned in the local storage database
      await setFirebaseEmpDoc("01", adminEmp);
      localStorage.setItem("current_user", JSON.stringify(adminEmp));
      await logSystemAction(adminEmp.name, `تسجيل دخول ناجح للمسؤول برمز بريدي معتمد [${emailLower}]`, "ناجحة");
      onLogin(adminEmp);
      return true;
    }

    // 2. Is this a registered employee?
    const matchedEmployee = dbEmployees.find(
      (emp: any) => emp.email?.trim().toLowerCase() === emailLower
    );

    if (matchedEmployee) {
      if (matchedEmployee.loginEnabled === false) {
        setMessage({
          text: "عذراً، ميزة الدخول معطلة لهذا الحساب. يرجى التواصل مع مسؤول النظام لتنشيطها.",
          type: "error"
        });
        await logSystemAction(matchedEmployee.name, `محاولة دخول فاشلة بحساب تم تعطيل تسجيل الدخول الخاص به [${emailLower}]`, "مرفوضة");
        return false;
      }

      if (!matchedEmployee.active) {
        setMessage({
          text: "عذراً، هذا الحساب غير نشط حالياً من قبل إدارة النظام. يرجى التواصل مع مسؤول النظام.",
          type: "error"
        });
        await logSystemAction(matchedEmployee.name, `محاولة دخول فاشلة بحساب غير نشط [${emailLower}]`, "مرفوضة");
        return false;
      }

      localStorage.setItem("current_user", JSON.stringify(matchedEmployee));
      await logSystemAction(matchedEmployee.name, `تسجيل دخول موظف بالبريد الرقمي المعتمد [${emailLower}]`, "ناجحة");
      onLogin(matchedEmployee);
      return true;
    }

    // 3. Is there a pending join request?
    const pendingReq = dbJoinRequests.find(
      (req: any) => req.email?.trim().toLowerCase() === emailLower
    );

    if (pendingReq) {
      setMessage({
        text: `طلب انضمامك بالبريد الإلكتروني [${emailLower}] قيد المراجعة حالياً من قبل إدارة النظام والرقابة. ستتمكن من الدخول بمجرد اعتماد طلبك من لوحة الهيكل التنظيمي.`,
        type: "info"
      });
      await logSystemAction("مستعلم", `محاولة دخول فاشلة - طلب الانضمام قيد الدراسة [${emailLower}]`, "مرفوضة");
      return false;
    } else {
      setMessage({
        text: `عذراً، البريد الإلكتروني غير مسجل مسبقاً بالنظام كحساب موظف معتمد. يرجى تقديم طلب انضمام جديد عبر التبويب الآخر ليتم تفعيله من المدير.`,
        type: "error"
      });
      await logSystemAction("زائر", `محاولة دخول فاشلة لبريد غير مسجل [${emailLower}]`, "مرفوضة");
      return false;
    }
  };

  // تسجيل الدخول الآمن بحساب جوجل
  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Reset the global block state after a successful sign-in
      // This allows any hooks that fell back to local storage due to unauthenticated errors
      // to re-attempt establishing the real-time snapshot listeners.
      setFirestoreBlocked(false);

      if (user && user.email) {
        setLoginEmail(user.email);
        const success = await proceedWithEmailLogin(user.email);
        if (!success) {
          // If not registered or pending, we've already displayed the notice inside proceedWithEmailLogin
        }
      } else {
        throw new Error("لم نتمكن من العثور على بريد إلكتروني نشط لحساب جوجل هذا.");
      }
    } catch (err: any) {
      console.warn("Google sign-in popup blocked or failed inside sandboxed environment:", err);
      let friendlyError = "عذراً، فشلت عملية تسجيل الدخول بحساب جوجل.";
      if (err.code === "auth/popup-blocked") {
        friendlyError = "تم حظر النافذة المنبثقة من قبل متصفحك. يرجى السماح بالنوافذ المنبثقة لغرفة مكة، أو استخدم خيار الدخول المباشر بالبريد بالأسفل.";
      } else if (err.code === "auth/unauthorized-domain") {
        friendlyError = "اسم النطاق (domain) غير مصرح به في إعدادات OAuth بكونسول Firebase. يرجى إضافة هذا النطاق.";
      } else if (err.message) {
        friendlyError = `تنبيه: ${err.message}. يرجى محاولة استخدام تسجيل الدخول المباشر بالبريد بالأسفل.`;
      }
      
      setMessage({
        text: friendlyError,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // الدخول المباشر بالبريد الإلكتروني كبديل أو خيار مباشر
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setMessage({
        text: "يرجى إدخال البريد الإلكتروني الخاص بك للبدء.",
        type: "error"
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await proceedWithEmailLogin(loginEmail);
    } catch (err: any) {
      console.error(err);
      setMessage({
        text: "حدث خطأ غير متوقع أثناء معالجة تسجيل الدخول. يرجى المحاولة لاحقاً.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Join request submission
  const handleRegisterInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setMessage({
        text: "يرجى تعبئة كافة الحقول الأساسية لتقديم طلب الانضمام (الاسم الكامل، الجوال، والبريد).",
        type: "error"
      });
      return;
    }

    const emailLower = regEmail.trim().toLowerCase();

    if (emailLower === "khalafshehab@gmail.com" || emailLower === "khalafshehab-crypto@gmail.com") {
      setMessage({
        text: "هذا البريد الإلكتروني مخصص لمدير النظام الفعلي ومسجل لديه كافة الصلاحيات.",
        type: "error"
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Check if already registered
      const employeeExists = dbEmployees.find(
        (emp: any) => emp.email?.trim().toLowerCase() === emailLower
      );

      if (employeeExists) {
        setMessage({
          text: "البريد الإلكتروني المدخل مسجل بالفعل كحساب موظف نشط بالنظام. يرجى التوجه لتسجيل الدخول.",
          type: "error"
        });
        setLoading(false);
        return;
      }

      // Check if already requested
      const requestExists = dbJoinRequests.find(
        (req: any) => req.email?.trim().toLowerCase() === emailLower
      );

      if (requestExists) {
        setMessage({
          text: "لديك طلب انضمام نشط بالفعل قيد المراجعة المسبقة بالبريد هذا. لا داعي لإعادة التقديم.",
          type: "info"
        });
        setLoading(false);
        return;
      }

      // Build and write Join Request payload
      const payload = {
        name: regName.trim(),
        email: emailLower,
        phone: regPhone.trim(),
        requestedRole: "SPECIALIST",
        requestedRoleAr: "أخصائي لجان",
        requestDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        gender: regGender
      };

      await addFirebaseJoinReq(payload);
      await logSystemAction(regName.trim(), `تم إرسال طلب انضمام جديد بنجاح للبريد [${emailLower}]`, "ناجحة");

      setMessage({
        text: `تم تقديم طلب الانضمام بنجاح! سينظر فيه مشرف النظام والرقابة ويعتمده قريباً. بمجرد اعتماده، ستتمكن من تسجيل الدخول الفوري ببريدك الإلكتروني مباشرة.`,
        type: "success"
      });

      // Reset fields
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegGender("MALE");

    } catch (err: any) {
      console.error(err);
      setMessage({
        text: "عذراً، حدث خطأ غير متوقع أثناء إرسال طلبك. يرجى التحقق من الشبكة وإعادة التقديم.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-right">
      
      {/* Visual background atmospheric lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-25%] right-[-15%] w-[700px] h-[700px] bg-amber-500/5 rounded-full blur-[160px]"></div>
      </div>

      <div className="w-full max-w-lg bg-slate-850/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 font-sans">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 mb-4 ring-4 ring-slate-800 p-2.5 overflow-hidden">
            <img 
              src="https://drive.google.com/thumbnail?id=1pAVRkqNXJmtVRpCl1fy3wuQS6hpmJPKt&sz=w500" 
              alt="شعار غرفة مكة المكرمة"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('thumbnail')) {
                   target.src = "https://drive.google.com/thumbnail?id=1pAVRkqNXJmtVRpCl1fy3wuQS6hpmJPKt&sz=w500";
                }
              }}
            />
          </div>
          <h1 className="font-black text-white leading-tight" style={{ fontSize: "22px" }}>التقرير الذكي لإدارة اللجان القطاعية</h1>
          <p className="text-slate-400 mt-2 font-medium animate-fadeIn" style={{ fontSize: "18px" }}>غرفة مكة المكرمة</p>
        </div>

        {/* Action Tabs Selector */}
        <div className="grid grid-cols-2 bg-slate-800 p-1 rounded-xl border border-slate-700/60 mb-6 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setMessage(null); }}
            className={`py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "login" 
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span>تسجيل الدخول</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab("register"); setMessage(null); }}
            className={`py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "register" 
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>طلب انضمام موظف</span>
          </button>
        </div>

        {/* Alert Notifications Center */}
        {message && (
          <div className={`p-4 rounded-xl border text-[11px] font-bold leading-relaxed mb-6 flex items-start gap-2.5 transition-all animate-fadeIn ${
            message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
            message.type === "info" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
            "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {message.type === "success" && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
            {message.type === "info" && <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />}
            {message.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />}
            <span className="flex-1 leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* LOGIN VIEW PANEL (Email based registration matched) */}
        {activeTab === "login" && (
          <div className="space-y-6 animate-fadeIn">
            {/* زر تسجيل الدخول الرئيسي بحساب جوجل */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm rounded-xl transition-all shadow-lg hover:shadow-black/10 flex items-center justify-center gap-3 cursor-pointer text-center disabled:opacity-50 border border-slate-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></div>
              ) : (
                <>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                    alt="Google G logo" 
                    className="w-5 h-5 shrink-0" 
                  />
                  <span>تسجيل الدخول الآمن بحساب Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* REGISTER VIEW PANEL (Join Request) */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterInput} className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl text-[10px] sm:text-[11px] font-bold leading-relaxed mb-2.5">
              💡 <span className="text-white font-extrabold">تقديم طلب انضمام موظف جديد:</span> 
               سيتم إرسال طلب تسجيل حساب جديد إلى مدير النظام، وستتمكن من الدخول فور الموافقة على الطلب.
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] text-slate-400 font-extrabold mb-1.5 text-right">الاسم الثلاثي</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: خالد بن إبراهيم مدني"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 pr-10 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-bold transition-all text-right"
                />
                <User className="absolute top-3 right-3 text-slate-500 w-4.5 h-4.5 shrink-0" />
              </div>
            </div>

            {/* Mobile number */}
            <div>
              <label className="block text-[11px] text-slate-400 font-extrabold mb-1.5 text-right">رقم الجوال</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+9665xxxxxxxx"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 pr-10 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                  dir="ltr"
                />
                <Phone className="absolute top-3 right-3 text-slate-500 w-4.5 h-4.5 shrink-0" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] text-slate-400 font-extrabold mb-1.5 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="X.XXXX@makkahchamber.sa"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 pr-10 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                  dir="ltr"
                />
                <Mail className="absolute top-3 right-3 text-slate-500 w-4.5 h-4.5 shrink-0" />
              </div>
            </div>

            {/* Submit application */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  إرسال طلب الانضمام
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center mt-6 text-[10px] text-slate-500 font-bold border-t border-slate-800 pt-4">
          © {new Date().getFullYear()} جميع الحقوق محفوظة - غرفة مكة المكرمة
        </div>
      </div>
    </div>
  );
}
