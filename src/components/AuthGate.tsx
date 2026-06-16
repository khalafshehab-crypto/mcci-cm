import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  AlertCircle,
  Clock
} from "lucide-react";
import { useFirestoreCollection } from "../lib/firebaseUtils";
import { auth } from "../lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

interface AuthGateProps {
  onLogin: (user: any) => void;
}

// Initial default fallback lists if Firestore is still loading or empty
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
];

const DEFAULT_APPROVED_EMAILS = [
  { email: "khalid.sh@makkahchamber.sa", name: "خالد الشهري", roleAr: "أخصائي لجان قطاعية" },
  { email: "sara.f@makkahchamber.sa", name: "سارة الفضل", roleAr: "أخصائي لجان نسائية" },
];

export default function AuthGate({ onLogin }: AuthGateProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regJob, setRegJob] = useState("");
  const [regRole, setRegRole] = useState<"SPECIALIST" | "DEPT_HEAD" | "MANAG_DIR">("SPECIALIST");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load live DB data so that updates in OrgChart or registrations sync instantly
  const { data: dbEmployees, addDocument: addFirebaseEmp, updateDocument: updateFirebaseEmp } = useFirestoreCollection<any>("employees", []);
  const { data: dbJoinRequests, addDocument: addFirebaseReq } = useFirestoreCollection<any>("join_requests", []);
  const { data: dbApprovedEmails } = useFirestoreCollection<any>("approved_emails", []);
  const { data: dbSystemLogs, addDocument: addFirebaseLog } = useFirestoreCollection<any>("system_logs", []);

  // Helper to append system logs
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
      console.error(e);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      if (!googleUser || !googleUser.email) {
        throw new Error("لم نتمكن من الحصول على البريد الإلكتروني من حساب جوجل الخاص بك.");
      }

      let employeesList = dbEmployees;
      if (!employeesList || employeesList.length === 0) {
        try {
          const stored = localStorage.getItem("app_employees");
          if (stored) employeesList = JSON.parse(stored);
        } catch (err) {}
      }

      const inputEmail = googleUser.email.trim().toLowerCase();
      let userFound = employeesList.find((emp: any) => emp.email?.toLowerCase() === inputEmail);

      if (!userFound) {
        if (inputEmail === "khalafshehab@gmail.com") {
          userFound = {
            id: "221550",
            name: googleUser.displayName || "باسم شهاب الدين",
            role: "SYS_ADMIN",
            roleAr: "مدير النظام",
            jobTitle: "مدير النظام والرقابة",
            phone: googleUser.phoneNumber || "+966558494158",
            email: "khalafshehab@gmail.com",
            active: true,
            photo: googleUser.photoURL || PRESET_AVATARS[1],
            joinDate: "2024/01/15"
          };
          try {
            await addFirebaseEmp(userFound);
          } catch (e) {}
          const nextEmployeesList = employeesList ? [userFound, ...employeesList] : [userFound];
          localStorage.setItem("app_employees", JSON.stringify(nextEmployeesList));
        } else {
          let approvedList = dbApprovedEmails || [];
          if (approvedList.length === 0) {
            try {
              const stored = localStorage.getItem("app_approved_emails");
              if (stored) approvedList = JSON.parse(stored);
            } catch (e) {}
            if (approvedList.length === 0) approvedList = DEFAULT_APPROVED_EMAILS;
          }

          const isPreApproved = approvedList.some((approved: any) => approved.email?.toLowerCase() === inputEmail);
          if (isPreApproved) {
            userFound = {
              id: String(1000 + employeesList.length + 1),
              name: googleUser.displayName || "موظف معتمد",
              role: "SPECIALIST",
              roleAr: "أخصائي لجان",
              jobTitle: "أخصائي لجان قطاعية",
              phone: googleUser.phoneNumber || "+966500000000",
              email: inputEmail,
              photo: googleUser.photoURL || PRESET_AVATARS[0],
              committees: [],
              active: true,
              joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
            };
            try {
              await addFirebaseEmp(userFound);
            } catch (e) {}
            const nextEmployeesList = employeesList ? [userFound, ...employeesList] : [userFound];
            localStorage.setItem("app_employees", JSON.stringify(nextEmployeesList));
          } else {
            let reqList = dbJoinRequests || [];
            if (reqList.length === 0) {
              try {
                const storedReqs = localStorage.getItem("app_join_requests");
                if (storedReqs) reqList = JSON.parse(storedReqs);
              } catch (e) {}
            }
            const isPending = reqList && reqList.some((req: any) => req.email?.toLowerCase() === inputEmail);

            if (isPending) {
              setMessage({
                text: "طلب انضمامك قيد المراجعة والاعتماد حالياً من قبل مدير النظام (باسم شهاب الدين). لا يمكنك الدخول حتى يتم اعتماد حسابك رسميًا.",
                type: "info"
              });
            } else {
              setRegName(googleUser.displayName || "");
              setRegEmail(inputEmail);
              setRegPhone(googleUser.phoneNumber || "");
              setActiveTab("register");
              setMessage({
                text: "حساب جوجل هذا غير مسجل بالنظام كحساب موظف نشط. لقد قمنا بتعبئة بياناتك، يرجى استكمال الحقول لإرسال طلب انضمامك لمدير النظام.",
                type: "info"
              });
            }
            setLoading(false);
            return;
          }
        }
      }

      if (userFound) {
        if (!userFound.active) {
          setMessage({
            text: "حسابك معطل حالياً من قبل إدارة النظام. يرجى التواصل مع المدير الأعلى.",
            type: "error"
          });
          setLoading(false);
          return;
        }

        localStorage.setItem("current_user", JSON.stringify(userFound));
        await logSystemAction(userFound.name, `تسجيل دخول ناجح بواسطة حساب Google للبريد [${userFound.email}]`, "ناجحة");
        onLogin(userFound);
      }
    } catch (error: any) {
      console.error("Google Sign In Error:", error);
      setMessage({
        text: error.message?.includes("popup-closed-by-user")
          ? "تم إغلاق نافذة تسجيل الدخول بواسطة جوجل."
          : "حدث خطأ أثناء تسجيل الدخول بحساب جوجل. يرجى التحقق والتجربة مجدداً.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ text: "يرجى تعبئة جميع الحقول المطلوبة.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Give a small interval for database query sync if needed
    setTimeout(() => {
      // Find among DB employees or fallback localStorage
      let employeesList = dbEmployees;
      if (!employeesList || employeesList.length === 0) {
        try {
          const stored = localStorage.getItem("app_employees");
          if (stored) employeesList = JSON.parse(stored);
        } catch(err) {}
      }

      // If still empty, supply the absolute root administrator account specified by the user
      const listHasAdmin = employeesList && employeesList.some((emp: any) => emp.email?.toLowerCase() === "khalafshehab@gmail.com");
      if (!employeesList || employeesList.length === 0 || !listHasAdmin) {
        const rootAdmin = {
          id: "221550",
          name: "باسم شهاب الدين",
          role: "SYS_ADMIN",
          roleAr: "مدير النظام",
          jobTitle: "مدير النظام والرقابة",
          phone: "+966558494158",
          email: "khalafshehab@gmail.com",
          active: true,
          password: "password" // Default password
        };
        employeesList = employeesList ? [rootAdmin, ...employeesList] : [rootAdmin];
        // Save back so the list is updated
        localStorage.setItem("app_employees", JSON.stringify(employeesList));
      }

      const inputEmail = email.trim().toLowerCase();
      const userFound = employeesList.find((emp: any) => emp.email?.toLowerCase() === inputEmail);

      if (!userFound) {
        // Let's check if the email is in join requests to give a helpful message
        let reqList = dbJoinRequests;
        if (!reqList || reqList.length === 0) {
          try {
            const storedReqs = localStorage.getItem("app_join_requests");
            if (storedReqs) reqList = JSON.parse(storedReqs);
          } catch(e){}
        }
        const isPending = reqList && reqList.some((req: any) => req.email?.toLowerCase() === inputEmail);

        if (isPending) {
          setMessage({
            text: "طلب انضمامك قيد المراجعة والاعتماد حالياً من قبل مدير النظام (باسم شهاب الدين). لا يمكنك الدخول حتى يتم اعتماد حسابك رسميًا.",
            type: "info"
          });
          logSystemAction(inputEmail, `محاولة دخول فاشلة - الحساب قيد المراجعة`, "مرفوضة");
        } else {
          setMessage({
            text: "عذراً، هذا البريد الإلكتروني غير مسجل بالنظام ولا توجد به طلبات انضمام نشطة.",
            type: "error"
          });
          logSystemAction(inputEmail, `محاولة دخول فاشلة - البريد غير مسجل`, "مرفوضة");
        }
        setLoading(false);
        return;
      }

      if (!userFound.active) {
        setMessage({
          text: "حسابك معطل حالياً من قبل إدارة النظام. يرجى التواصل مع المدير الأعلى.",
          type: "error"
        });
        logSystemAction(userFound.name, `محاولة دخول فاشلة - حساب معطل وبانتظار تفعيل`, "مرفوضة");
        setLoading(false);
        return;
      }

      // Check simple password. For first login or matching password
      const userPass = userFound.password || "123456"; // Default standard
      if (password !== userPass) {
        setMessage({
          text: "كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.",
          type: "error"
        });
        logSystemAction(userFound.name, `محاولة دخول فاشلة - كلمة مرور خاطئة للبريد ${inputEmail}`, "مرفوضة");
        setLoading(false);
        return;
      }

      // Success
      localStorage.setItem("current_user", JSON.stringify(userFound));
      logSystemAction(userFound.name, `تسجيل دخول ناجح إلى النظام للبريد ${userFound.email}`, "ناجحة");
      onLogin(userFound);
      setLoading(false);
    }, 450);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setMessage({ text: "برجاء استكمال كافة البيانات الأساسية للتسجيل (الاسم، الجوال، والبريد الإلكتروني).", type: "error" });
      return;
    }

    const emailInput = regEmail.trim().toLowerCase();

    // 1. Check if email matches root administrator
    if (emailInput === "khalafshehab@gmail.com") {
      setMessage({ text: "بريد مدير النظام مسجل مسبقاً ولا يمكن تكراره.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Fetch lists
    let employeesList = dbEmployees || [];
    if (employeesList.length === 0) {
      try {
        const stored = localStorage.getItem("app_employees");
        if (stored) employeesList = JSON.parse(stored);
      } catch(e){}
    }

    // Check duplicate in employees
    const duplicateEmp = employeesList.find((emp: any) => emp.email?.toLowerCase() === emailInput);
    if (duplicateEmp) {
      setMessage({ text: "هذا البريد الإلكتروني مسجل بالفعل بالنظام كحساب موظف نشط.", type: "error" });
      setLoading(false);
      return;
    }

    // Get Approved Emails (pre-authorized by Admin)
    let approvedList = dbApprovedEmails || [];
    if (approvedList.length === 0) {
      try {
        const stored = localStorage.getItem("app_approved_emails");
        if (stored) approvedList = JSON.parse(stored);
      } catch(e) {}
      if (approvedList.length === 0) {
        approvedList = DEFAULT_APPROVED_EMAILS;
      }
    }

    // Is pre-approved?
    const isPreApproved = approvedList.some((approved: any) => approved.email?.toLowerCase() === emailInput);

    const finalPassword = regPassword.trim() || "123456";
    const finalJob = regJob.trim() || "أخصائي لجان قطاعية";
    const finalRole = regRole || "SPECIALIST";

    if (isPreApproved) {
      // Create and approve immediately
      const nextId = String(1000 + employeesList.length + 1);
      const roleMap: Record<string, string> = {
        SPECIALIST: "أخصائي لجان",
        DEPT_HEAD: "رئيس قسم اللجان",
        MANAG_DIR: "مدير إدارة اللجان",
      };

      const newEmployee = {
        id: nextId,
        name: regName.trim(),
        role: finalRole,
        roleAr: roleMap[finalRole] || "أخصائي لجان",
        jobTitle: finalJob,
        phone: regPhone.trim(),
        email: emailInput,
        photo: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        committees: [],
        active: true,
        password: finalPassword, // Dedicated custom password
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      try {
        // Safe DB add
        await addFirebaseEmp(newEmployee);
        // Sync local storage
        const nextEmployeesList = [newEmployee, ...employeesList];
        localStorage.setItem("app_employees", JSON.stringify(nextEmployeesList));

        await logSystemAction(newEmployee.name, `تسجيل فوري معتمد لوجود بريده بالقائمة المسبقة [${newEmployee.email}]`, "ناجحة");

        setMessage({
          text: "تم تسجيل حسابك وتفعيله فورياً! بريدك الإلكتروني مدرج بقائمة العناوين المعتمدة مسبقاً من الإدارة. يمكنك تسجيل الدخول الآن.",
          type: "success"
        });

        // Switch tab to login and populate
        setTimeout(() => {
          setEmail(emailInput);
          setPassword(finalPassword);
          setActiveTab("login");
        }, 1200);

      } catch (err) {
        setMessage({ text: "حدث خطأ أثناء الاتصال بقاعدة البيانات. حاول مرة أخرى.", type: "error" });
      }
    } else {
      // Must put to join quests! "ولا يتم تسجيل الموظف إلى بموجب ايميل مسجل له في النظام من قبل مدير النظام"
      let reqList = dbJoinRequests || [];
      if (reqList.length === 0) {
        try {
          const stored = localStorage.getItem("app_join_requests");
          if (stored) reqList = JSON.parse(stored);
        } catch(e){}
      }

      // Check if duplicate pending request
      const duplicateRequest = reqList.some((req: any) => req.email?.toLowerCase() === emailInput);
      if (duplicateRequest) {
        setMessage({
          text: "طلب انضمامك مسجل قيد المراجعة بالفعل وبانتظار اعتماد مدير النظام (باسم شهاب الدين).",
          type: "info"
        });
        setLoading(false);
        return;
      }

      const roleMap: Record<string, string> = {
        SPECIALIST: "أخصائي لجان",
        DEPT_HEAD: "رئيس قسم اللجان",
        MANAG_DIR: "مدير عام اللجان والفعاليات",
      };

      const newJoinRequest = {
        id: Date.now(),
        name: regName.trim(),
        email: emailInput,
        phone: regPhone.trim(),
        requestedRole: finalRole,
        requestedRoleAr: roleMap[finalRole] || "أخصائي",
        password: finalPassword, // Keep temporary password for when approved
        jobTitle: finalJob,
        requestDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      try {
        await addFirebaseReq(newJoinRequest);
        
        // Sync local storage
        const nextRequests = [newJoinRequest, ...reqList];
        localStorage.setItem("app_join_requests", JSON.stringify(nextRequests));

        await logSystemAction(regName.trim(), `تقديم طلب تسجيل جديد (غير مسبق البريد) للبريد [${emailInput}]`, "ناجحة");

        setMessage({
          text: "تم إرسال طلب انضمامك لمدير النظام بنجاح! نظراً لأن بريدك غير معتمد مسبقاً بالنظام، تم تحويل طلبك لمدير النظام (باسم شهاب الدين) لمراجعة الأوراق واعتماده وتفعيله يدوياً.",
          type: "success"
        });

        // Reset
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setRegPassword("");
        setRegJob("");
      } catch (err) {
        setMessage({ text: "عذراً، فشل إرسال طلب الانضمام لقاعدة البيانات.", type: "error" });
      }
    }

    setLoading(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="w-full max-w-lg bg-slate-850/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 text-right font-sans">
        
        {/* Crest/Logo Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand via-brand/80 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 mb-4 ring-4 ring-slate-800">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">منصة إدارة اللجان والفعاليات</h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">غرفة مكة المكرمة - نظام التسجيل والاعتماد الإجرائي المتقدم</p>
        </div>

        {/* Form Selection Tabs */}
        <div className="grid grid-cols-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700/60 mb-6 gap-1">
          <button
            type="button"
            onClick={() => { setActiveTab("login"); setMessage(null); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "login" ? "bg-brand text-white shadow-md shadow-brand/10" : "text-slate-400 hover:text-white"}`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("register"); setMessage(null); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "register" ? "bg-brand text-white shadow-md shadow-brand/10" : "text-slate-400 hover:text-white"}`}
          >
            طلب انضمام جديد
          </button>
        </div>

        {/* Notices & Message Display */}
        {message && (
          <div className={`p-4 rounded-xl border text-[11px] font-bold leading-relaxed mb-6 flex items-start gap-2 text-right ${
            message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
            message.type === "info" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
            "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {message.type === "success" && <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-400" />}
            {message.type === "info" && <Clock className="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-400" />}
            {message.type === "error" && <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-400" />}
            <span className="flex-1">{message.text}</span>
          </div>
        )}

        {/* 1. LOGIN TAB VIEW */}
        {activeTab === "login" && (
          <div className="space-y-4 font-sans text-right">
            {/* Primary Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 hover:text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-white/5 flex items-center justify-center gap-3 border border-slate-200 cursor-pointer text-center"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              تسجيل الدخول بواسطة حساب Google الآمن
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-700/50"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">أو الدخول اليدوي (قنوات الدعم)</span>
              <div className="flex-grow border-t border-slate-700/50"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-350 font-extrabold mb-1.5">البريد الإلكتروني الرسمي</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@makkahchamber.sa"
                    className="w-full bg-slate-800 border border-slate-750 rounded-xl px-4 py-3 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                    dir="ltr"
                  />
                  <Mail className="absolute top-3.5 right-4 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-350 font-extrabold mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-750 rounded-xl px-4 py-3 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                    dir="ltr"
                  />
                  <Lock className="absolute top-3.5 right-4 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between gap-2">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-350 shrink-0 font-bold">حساب الإدارة الإرشادي:</span>
                <span className="text-left font-mono text-amber-400 tracking-tighter shrink-0 select-all">khalafshehab@gmail.com / password</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    تسجيل الدخول للنظام
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 2. REGISTER TAB VIEW */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4 font-sans text-right">
            
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-bold leading-normal mb-1.5">
              💡 <span className="text-indigo-300">نظام التسجيل التلقائي المعزز:</span> إذا كان بريدك الإلكتروني مدرج ضمن العناوين المعتمدة من قبل مدير النظام مسبقاً، سيتم اعتمادك فوراً. بخلاف ذلك ستتحول المعاملة لطلب انضمام معلق ينتظر موافقة مدير النظام من لوحة تحكم الهيكل الإداري.
            </div>

            <div>
              <label className="block text-[11px] text-slate-350 font-extrabold mb-1.5">الاسم الثلاثي واللقب</label>
              <div className="relative">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: أ. أحمد الهاشمي"
                  className="w-full bg-slate-800 border border-slate-755 rounded-xl px-4 py-2.5 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                />
                <User className="absolute top-3 right-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-350 font-extrabold mb-1.5">رقم الجوال</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+9665xxxxxxxx"
                    className="w-full bg-slate-800 border border-slate-755 rounded-xl px-4 py-2.5 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                    dir="ltr"
                  />
                  <Phone className="absolute top-3 right-4 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-350 font-extrabold mb-1.5">البريد الإلكتروني الرسمي</label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@makkahchamber.sa"
                    className="w-full bg-slate-800 border border-slate-755 rounded-xl px-4 py-2.5 text-slate-100 text-xs text-left focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-medium"
                    dir="ltr"
                  />
                  <Mail className="absolute top-3 right-4 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  إرسال وتدقيق طلب التسجيل
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Credit */}
        <div className="text-center mt-6 text-[10px] text-slate-500 font-bold">
          © {new Date().getFullYear()} الغرفة التجارية بمكة المكرمة. جميع الحقوق محفوظة.
        </div>

      </div>
    </div>
  );
}
