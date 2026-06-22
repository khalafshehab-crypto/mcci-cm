import { useState, useEffect, ReactNode } from "react";
import { 
  Settings, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Menu,
  Users2,
  Calendar,
  CheckCircle2,
  BookOpen,
  Library
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { subscribeToFirestoreBlocked } from "../lib/firebaseUtils";
 
interface LayoutProps {
  children: ReactNode;
}
 
export default function Layout({ children }: LayoutProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDatabaseBlocked, setIsDatabaseBlocked] = useState(false);
  const location = useLocation();
 
  const [userName, setUserName] = useState("مدير النظام");
  const [userRoleAr, setUserRoleAr] = useState("مدير النظام");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [currentUserObj, setCurrentUserObj] = useState<any>(null);

  useEffect(() => {
    return subscribeToFirestoreBlocked((blocked) => {
      setIsDatabaseBlocked(blocked);
    });
  }, []);
 
  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          setCurrentUserObj(parsed);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.roleAr) setUserRoleAr(parsed.roleAr || "أخصائي اللجان");
          if (parsed.photo) setUserPhoto(parsed.photo);
        }
      }
    } catch (e) { /* ignore */ }
  }, [location.pathname]);
 
  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, []);
 
  // Sync menu close on path change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);
 
  // Dates formatting (English numbers/names)
  const lang = 'en-GB';
  const dayNameEnglish = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentTime);
  const arabicDaysMap: Record<string, string> = {
    "Sunday": "الأحد",
    "Monday": "الإثنين",
    "Tuesday": "الثلاثاء",
    "Wednesday": "الأربعاء",
    "Thursday": "الخميس",
    "Friday": "الجمعة",
    "Saturday": "السبت"
  };
  const dayName = arabicDaysMap[dayNameEnglish] || dayNameEnglish;
  const timeStr = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(currentTime).toUpperCase();
  
  // Function to format date parts into "DD Month YYYY" with Western digits
  const formatDate = (date: Date, calendar?: string) => {
    const locale = calendar ? `ar-SA-u-ca-${calendar}-nu-latn` : `ar-SA-u-nu-latn`;
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
    
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    
    return `${day} ${month} ${year}`;
  };
 
  const gregorianDate = formatDate(currentTime);
  const hijriDate = formatDate(currentTime, 'islamic-umalqura');
 
  const pages = [
    { name: "الرئيسية", nameAr: "شاشة المتابعة", path: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "تشكيل اللجان", nameAr: "تشكيل اللجان", path: "/committees", icon: <Users2 className="w-4 h-4" /> },
    { name: "سجل الأعضاء", nameAr: "سجل الأعضاء", path: "/members", icon: <Library className="w-4 h-4" /> },
    { name: "سجل الفعاليات", nameAr: "الفعاليات", path: "/events", icon: <Calendar className="w-4 h-4" /> },
    { name: "Recommendations", nameAr: "التوصيات القطاعية", path: "/recommendations", icon: <CheckCircle2 className="w-4 h-4" /> },
    { name: "Tasks", nameAr: "المهام الإدارية", path: "/tasks", icon: <CheckSquare className="w-4 h-4" /> },
    { name: "Reports", nameAr: "التقارير", path: "/reports", icon: <FileText className="w-4 h-4" /> },
    { name: "Library", nameAr: "المكتبة الرقمية", path: "/library", icon: <BookOpen className="w-4 h-4" /> },
    { name: "System Admin", nameAr: "الهيكل الإداري", path: "/org-chart", icon: <Settings className="w-4 h-4" /> },
  ];

  const filteredPages = pages.filter(page => {
    if (!currentUserObj) return true;
    // Always let sysadmins see everything
    if (currentUserObj.role === "SYS_ADMIN") return true;
    
    // If user has allowedPages restriction
    if (currentUserObj.allowedPages && Array.isArray(currentUserObj.allowedPages)) {
      if (currentUserObj.allowedPages.length === 0) return true;
      return currentUserObj.allowedPages.includes(page.path);
    }
    return true;
  });
 
  const currentPage = filteredPages.find(p => p.path === location.pathname) || filteredPages[0] || pages[0];

  return (
    <div dir="rtl" className="min-h-screen bg-[#cccccc] p-4 md:p-6 text-gray-800 font-sans">
      
      {/* تنبيه قواعد حماية البيانات الفائقة سحابياً */}
      {isDatabaseBlocked && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm animate-fadeIn text-sm">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-amber-100 rounded-xl text-amber-600 font-black shrink-0 text-base">⚠️</span>
            <div>
              <p className="font-extrabold text-amber-900 leading-tight">تنبيه حوكمة الحماية السحابية (Firestore Security Rules)</p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                تفشل حالياً قراءة أو كتابة البيانات في مشروع Firebase السحابي الخاص بك (<span className="font-mono bg-amber-150/50 px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-900">mcci-cm</span>) بسبب قواعد الحماية الافتراضية للشبكة.
                تم تفعيل <strong>قاعدة البيانات المحلية الموازية (Local Sandbox)</strong> تلقائياً وبنجاح لضمان استمرارية استخدام وتجربة كافة وظائف النظام بنسبة 100%.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              alert(
                `لتفعيل قاعدة البيانات السحابية الحقيقية:\n\n` +
                `1. اذهب لمجلد قواعد البيانات بقسم Firestore Database بكونسول Firebase.\n` +
                `2. اختر التبويب "Rules" (القواعد).\n` +
                `3. استبدل القواعد بالكامل لتسمح بالوصول الفوري:\n\n` +
                `rules_version = '2';\n` +
                `service cloud.firestore {\n` +
                `  match /databases/{database}/documents {\n` +
                `    match /{document=**} {\n` +
                `      allow read, write: if true;\n` +
                `    }\n` +
                `  }\n` +
                `}`
              );
            }}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4.5 py-2 rounded-xl transition-all shadow-md shadow-amber-650/10 cursor-pointer text-center md:self-auto self-start"
          >
            كيف أقوم بضبطها سحابياً؟
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-[#e8e4e4] rounded-2xl shadow-sm border border-gray-200 p-2 flex items-stretch justify-between gap-4">
        
        {/* RIGHT: Logo & Page Section (Dropdown) */}
        <div className="relative flex-shrink-0 dropdown-container" style={{ width: '280px' }}>
          <button 
            id="logo-card"
            onClick={() => toggleDropdown('menu')}
            className={`flex items-center gap-3 p-3 bg-white transition-all cursor-pointer w-full text-right ${activeDropdown === 'menu' ? 'rounded-t-2xl shadow-none' : 'rounded-2xl shadow-sm'}`}
          >
            <div className="w-11 h-11 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/d/1pAVRkqNXJmtVRpCl1fy3wuQS6hpmJPKt" 
                alt="شعار غرفة مكة"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://drive.google.com/thumbnail?id=1pAVRkqNXJmtVRpCl1fy3wuQS6hpmJPKt&sz=w500";
                }}
              />
            </div>
            <div className="flex-grow overflow-hidden text-right">
              <h1 className="font-extrabold text-base leading-tight truncate text-gray-900">إدارة اللجان</h1>
              <p className="text-gray-500 text-xs font-medium">{currentPage.nameAr}</p>
            </div>
            <ChevronDown className={`flex-shrink-0 w-4 h-4 text-gray-400 transition-transform duration-300 ${activeDropdown === 'menu' ? 'rotate-180' : ''}`} />
          </button>

          {/* Connected Dropdown Menu */}
          <AnimatePresence>
            {activeDropdown === 'menu' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute top-full right-0 w-full bg-white rounded-b-2xl shadow-xl border-x border-b border-gray-100 z-50 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">التنقل الرئيسي</p>
                  </div>
                  {filteredPages.map((page, idx) => (
                    <Link 
                      key={idx}
                      to={page.path}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-gray-50 rounded-xl transition-colors font-semibold text-sm group ${location.pathname === page.path ? 'text-brand bg-brand/5' : 'text-gray-700'}`}
                    >
                      <span className={`${location.pathname === page.path ? 'text-brand' : 'text-gray-400'} group-hover:text-brand group-hover:scale-110 transition-all`}>{page.icon}</span>
                      {page.nameAr}
                    </Link>
                  ))}
                </div>
                
                <div className="bg-gray-50 p-2 mt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3 px-4 py-3">
                    {userPhoto ? (
                      <img 
                        src={userPhoto} 
                        alt={userName} 
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold border border-brand/20 text-sm">
                        {userName ? userName.charAt(0) : "ب"}
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{userRoleAr}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <Link to="/org-chart" className="flex items-center justify-center gap-2 px-3 py-2 text-right hover:bg-white rounded-xl transition-all text-gray-600 text-xs font-bold border border-transparent hover:border-gray-200">
                      <Settings className="w-3.5 h-3.5" />
                      الإعدادات
                    </Link>
                    <button 
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("current_user");
                        window.location.href = "/";
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-right hover:bg-red-50 rounded-xl transition-all text-red-600 font-bold text-xs border border-transparent hover:border-red-100 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      خروج
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-grow"></div>

        <div className="flex flex-row-reverse items-center gap-2">
          
          {/* 1. Date Cards */}
          <div id="datetime-card" className="flex flex-col gap-1 pr-2 border-r border-gray-200">
            <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-[170px]">
              <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shadow-inner font-black">AD</span>
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{gregorianDate} </span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-brand/20 shadow-sm min-w-[170px]">
              <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded shadow-inner font-black">HI</span>
              <span className="text-[11px] font-bold text-brand uppercase tracking-tight">{hijriDate} </span>
            </div>
          </div>

          {/* 2. Time Card */}
          <div className="flex flex-col gap-1 pr-2 border-r border-gray-200">
            <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-[170px]">
              <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shadow-inner font-black">DAY</span>
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">{dayName}</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-[170px]">
              <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded shadow-inner font-black">TIME</span>
              <span className="text-[11px] font-bold text-brand uppercase tracking-tight font-mono">{timeStr}</span>
            </div>
          </div>

        </div>

      </header>

      {/* Main Content Area */}
      <main className="w-full mt-6 space-y-4">
        {pages.some(p => p.path === location.pathname) && !filteredPages.some(p => p.path === location.pathname) ? (
          <div className="bg-white rounded-3xl border border-red-150 p-10 text-center space-y-4 max-w-xl mx-auto shadow-xl my-10 animate-fadeIn">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto font-black shadow-inner border border-red-100">
              🚫
            </div>
            <h2 className="text-xl font-black text-gray-900">عذراً، هذه الصفحة غير مصرحة لحسابك</h2>
            <p className="text-gray-500 text-xs leading-relaxed max-w-md mx-auto">
              تلقينا توجيهاً إدارياً بتقييد وصول حسابك لورقة العمل الحالية. يرجى مراجعة <strong>مدير النظام الأعلى</strong> أو الأخصائي لتهيئة وإضافة علامة الصح الخاصة بملفك الشخصي.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link to="/" className="px-6 py-2.5 bg-brand text-white font-black text-xs rounded-xl hover:bg-brand/90 transition-all inline-block shadow-md">
                العودة للوحة الرئيسية
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
