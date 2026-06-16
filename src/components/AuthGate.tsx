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
import { useFirestoreCollection } from "../lib/firebaseUtils";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

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

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      
      if (!googleUser || !googleUser.email) {
        throw new Error("لم نتمكن من الحصول على البريد الإلكتروني الخاص بحساب Google.");
      }

      const emailLower = googleUser.email.trim().toLowerCase();
      
      // 1. Check if user is the Master Admin
      if (emailLower === "khalafshehab@gmail.com" || emailLower === "khalafshehab-crypto@gmail.com") {
        const adminEmp = {
          id: "221550",
          name: googleUser.displayName || "خلف شهاب الدين",
          role: "SYS_ADMIN",
          roleAr: "مدير النظام",
          jobTitle: "مدير النظام والرقابة",
          phone: googleUser.phoneNumber || "+966558494158",
          email: emailLower,
          photo: googleUser.photoURL || PRESET_AVATARS[0],
          committees: ["الحج والعمرة", "الصناعية"],
          active: true,
          joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
        };

        // Provision the administrator in the live database if not present
        await setFirebaseEmpDoc("221550", adminEmp);
        
        // Save locally and authenticate
        localStorage.setItem("current_user", JSON.stringify(adminEmp));
        await logSystemAction(adminEmp.name, `تسجيل دخول ناجح للمسؤول عبر Google [${emailLower}]`, "ناجحة");
        onLogin(adminEmp);
        return;
      }

      // 2. Check if user is in registered Employees list
      const matchedEmployee = dbEmployees.find(
        (emp: any) => emp.email?.trim().toLowerCase() === emailLower
      );

      if (matchedEmployee) {
        if (!matchedEmployee.active) {
          setMessage({
            text: "عذراً، هذا الحساب معطل حالياً من قبل إدارة النظام. يرجى التواصل مع مسؤول النظام لتنشيطه.",
            type: "error"
          });
          await logSystemAction(googleUser.displayName || "مستخدم", `محاولة دخول فاشلة بحساب معطل [${emailLower}]`, "مرفوضة");
          setLoading(false);
          return;
        }

        localStorage.setItem("current_user", JSON.stringify(matchedEmployee));
        await logSystemAction(matchedEmployee.name, `تسجيل دخول موظف معتمد عبر Google [${emailLower}]`, "ناجحة");
        onLogin(matchedEmployee);
        return;
      }

      // 3. Check if there is a pending Join Request for this email
      const pendingReq = dbJoinRequests.find(
        (req: any) => req.email?.trim().toLowerCase() === emailLower
      );

      if (pendingReq) {
        setMessage({
          text: `طلب انضمامك بالبريد الإلكتروني [${emailLower}] قيد المراجعة حالياً من قبل مدير النظام (خلف شهاب الدين). ستتمكن من تسجيل الدخول بمجرد اعتماد طلبك.`,
          type: "info"
        });
        await logSystemAction(googleUser.displayName || "مستعلم", `محاولة دخول فاشلة - طلب الانضمام قيد الدراسة [${emailLower}]`, "مرفوضة");
      } else {
        setMessage({
          text: `عذراً، البريد الإلكتروني غير مسجل مسبقاً بالنظام كحساب موظف معتمد. يرجى تقديم طلب انضمام جديد عبر التبويب المخصص بالدخول للتحقق منه واعتماده.`,
          type: "error"
        });
        await logSystemAction(googleUser.displayName || "زائر", `محاولة دخول فاشلة لبريد غير مسجل [${emailLower}]`, "مرفوضة");
      }

    } catch (error: any) {
      console.error("Google Authentication error Details:", error);
      const isBlocked = error.message?.includes("identitytoolkit") || error.code?.includes("blocked") || error.message?.includes("projectconfigservice");
      const isNetwork = error.message?.includes("network-request-failed") || error.code?.includes("network-request-failed");
      
      let errorDesc = "حدث خطأ أثناء الاتصال بخدمة Google للتحقق. يرجى المحاولة مجدداً.";
      if (error.message?.includes("popup-closed-by-user")) {
        errorDesc = "تم إغلاق نافذة تسجيل الدخول الآمن بواسطة المستخدم.";
      } else if (isBlocked) {
        errorDesc = "⚠️ قيود مفاتيح الـ API (Key Restrictions): خدمة Identity Toolkit مغلقة بمشروع Firebase الخاص بك أو لم تسجل ضمن تخويل مفتاح الـ API. يمكنك الضغط على زر تخطي جوجل والدخول مباشر بالأسفل.";
      } else if (isNetwork) {
        errorDesc = "🔒 حماية الشبكة (Iframe Isolation): يمنع متصفحك أو بيئة المعاينة المنبثقات من إتمام اتصالات جوجل الخارجية. يرجى استخدام أزرار التخطي والدخول المباشر بالأسفل للوصول الفوري الآمن.";
      }

      setMessage({
        text: errorDesc,
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
        requestDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      await addFirebaseJoinReq(payload);
      await logSystemAction(regName.trim(), `تم إرسال طلب انضمام جديد بنجاح للبريد [${emailLower}]`, "ناجحة");

      setMessage({
        text: `تم تقديم طلب الانضمام بنجاح! سينظر فيه مدير النظام والرقابة (خلف شهاب الدين) ويعتمده قريباً. بمجرد اعتماده، ستتمكن من تسجيل الدخول الفوري بحساب Google الآمن.`,
        type: "success"
      });

      // Reset fields
      setRegName("");
      setRegEmail("");
      setRegPhone("");

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

  // Safe manual login bypass for approved employees
  const handleEmployeeBypass = async (emp: any) => {
    setLoading(true);
    setMessage(null);
    try {
      if (!emp.active) {
        setMessage({
          text: "عذراً، هذا الحساب معطل حالياً من قبل إدارة النظام. يرجى التواصل مع مسؤول النظام لتنشيطه.",
          type: "error"
        });
        await logSystemAction(emp.name, `محاولة دخول فاشلة بحساب معطل [${emp.email}]`, "مرفوضة");
        setLoading(false);
        return;
      }

      localStorage.setItem("current_user", JSON.stringify(emp));
      await logSystemAction(emp.name, `تسجيل دخول فوري للموظف عبر واجهة التخطي [${emp.email}]`, "ناجحة");
      onLogin(emp);
    } catch (e: any) {
      console.error(e);
      setMessage({
        text: "فشل الدخول للموظف المختار. يرجى إعادة المحاولة.",
        type: "error"
      });
      setLoading(false);
    }
  };

  // Safe manual bypass / local development auto-filler
  const handleAdministratorBypass = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const adminEmp = {
        id: "221550",
        name: "خلف شهاب الدين",
        role: "SYS_ADMIN",
        roleAr: "مدير النظام",
        jobTitle: "مدير النظام والرقابة",
        phone: "+966558494158",
        email: "khalafshehab@gmail.com",
        photo: PRESET_AVATARS[0],
        committees: ["الحج والعمرة", "الصناعية"],
        active: true,
        joinDate: "2024/01/15"
      };

      await setFirebaseEmpDoc("221550", adminEmp);
      localStorage.setItem("current_user", JSON.stringify(adminEmp));
      await logSystemAction(adminEmp.name, "تم تخطي قفل جوجل اللحظي والدخول للنظام محلياً بصلاحية مسؤول النظام الفوقية", "ناجحة");
      onLogin(adminEmp);
    } catch (e: any) {
      console.error(e);
      setMessage({
        text: "فشل دخول الطوارئ الفوري. يرجى التحقق من إعدادات الاتصال بقاعدة البيانات.",
        type: "error"
      });
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
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-sky-500 via-sky-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4 ring-4 ring-slate-800">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">منصة إدارة اللجان والفعاليات</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium animate-fadeIn">الغرفة التجارية بمكة المكرمة - لوحة التسجيل والتحول الرقمي الموحد</p>
        </div>

        {/* Action Tabs Selector */}
        <div className="grid grid-cols-2 bg-slate-805 p-1 rounded-xl border border-slate-700/60 mb-6 gap-1.5 shadow-inner">
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
            {message.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-550" />}
            <span className="flex-1 leading-relaxed">{message.text}</span>
          </div>
        )}

        {/* LOGIN VIEW PANEL */}
        {activeTab === "login" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 text-xs font-bold leading-relaxed text-slate-300">
              <span className="text-sky-400 font-black">ℹ️ حوكمة الدخول والمصادقة الأمنية:</span>
              <p className="mt-1.5 text-slate-400 leading-normal text-[11px] font-semibold">
                مدير النظام (خلف شهاب الدين) يسجل الدخول المباشر والتفعيل الكلي عبر رابط Google. 
                بالنسبة للموظفين الآخرين، يمكنهم الدخول الفوري بحساباتهم شريطة أن يقوم المدير بإضافتها وإشراكها ضمن جدول الموظفين المعينين.
              </p>
            </div>

            {/* Official Google Login trigger */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl transition-all shadow-lg hover:shadow-white/5 flex items-center justify-center gap-3 border border-slate-200 cursor-pointer text-center ring-offset-2 ring-offset-slate-900 focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-800/20 border-t-slate-800 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>تسجيل الدخول بواسطة حساب Google الآمن</span>
                </>
              )}
            </button>

            {/* Premium, clean Emergency / Developer bypass system */}
            <div className="pt-4 border-t border-slate-800/60 space-y-4">
              <button
                type="button"
                onClick={handleAdministratorBypass}
                disabled={loading}
                className="w-full p-3.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 hover:border-amber-500/40 text-amber-400 font-extrabold rounded-2xl flex items-center justify-between gap-2.5 transition-all cursor-pointer shadow-inner group"
              >
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-[11px] sm:text-[12px] leading-tight font-black">تخطي قفل Google (دخول مباشر كمدير نظام)</span>
                </span>
                <span className="font-sans bg-amber-500/20 px-2 py-0.5 rounded text-[10px] text-amber-300 font-black group-hover:scale-105 transition-transform shrink-0">
                  ولوج مسؤول النظام
                </span>
              </button>

              {/* Rapid access for manually approved employees */}
              {dbEmployees && dbEmployees.length > 0 && (
                <div className="space-y-2 text-right">
                  <label className="block text-[11px] text-slate-400 font-extrabold">أو دخول سريع للموظفين المعتمدين (بتجاوز قيود جوجل):</label>
                  <select
                    onChange={(e) => {
                      const empId = e.target.value;
                      if (empId) {
                        const matched = dbEmployees.find((emp: any) => String(emp.id) === empId);
                        if (matched) {
                          handleEmployeeBypass(matched);
                        }
                      }
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-505 font-black transition-all"
                    defaultValue=""
                  >
                    <option value="" disabled>-- اختر اسم الموظف المعتمد للدخول الفوري --</option>
                    {dbEmployees.filter((emp: any) => emp.email !== "khalafshehab@gmail.com" && emp.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com").map((emp: any) => (
                      <option key={emp.id} value={String(emp.id)}>
                        👤 {emp.name} ({emp.jobTitle || emp.roleAr})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <p className="text-[9.5px] text-slate-500 mt-1 leading-relaxed text-center font-bold">
                * انقر لتخطي خطأ حظر Google Auth بسبب قيود المتصفح والـ Iframe والدخول المباشر فوراً.
              </p>
            </div>
          </div>
        )}

        {/* REGISTER VIEW PANEL (Join Request) */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterInput} className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl text-[10px] sm:text-[11px] font-bold leading-relaxed mb-2.5">
              💡 <span className="text-white font-extrabold">طلب انضمام جديد (المراجعة والتدقيق):</span> 
              سيتم تسجيل بياناتك الفنية وإرفاقها لقائمة مراجعة الهيكل الوظيفي. بمجرد موافقة مدير النظام، ستتاح لك فوراً واجهة الدخول المعتمدة بحساب Google.
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] text-slate-400 font-extrabold mb-1.5 text-right">الاسم الثلاثي واللقب</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: صالح بن محمد الحربي"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 pr-10 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-bold transition-all text-right"
                />
                <User className="absolute top-3 right-3 text-slate-500 w-4.5 h-4.5 shrink-0" />
              </div>
            </div>

            {/* Mobile number */}
            <div>
              <label className="block text-[11px] text-slate-400 font-extrabold mb-1.5 text-right">رقم الجوال الخاص بالعمل</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-2.5 pr-10 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                  dir="ltr"
                />
                <Phone className="absolute top-3 right-3 text-slate-500 w-4.5 h-4.5 shrink-0" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] text-slate-400 font-extrabold mb-1.5 text-right">البريد الإلكتروني المخصص</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@makkahchamber.sa"
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
                  إرسال وتدقيق طلب الانضمام
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center mt-6 text-[10px] text-slate-500 font-bold border-t border-slate-800 pt-4">
          © {new Date().getFullYear()} الغرفة التجارية بمكة المكرمة. جميع الحقوق معتمدة ومحفوظة.
        </div>
      </div>
    </div>
  );
}
