import React, { useState, useEffect, ReactNode } from "react";
import { 
  Settings, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Menu,
  Users,
  Building2,
  Users2,
  Calendar,
  CheckCircle2,
  BookOpen,
  Library,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { subscribeToFirestoreBlocked } from "../lib/firebaseUtils";
 
interface LayoutProps {
  children: ReactNode;
}
 
export default function Layout({ children }: LayoutProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "assistant-sec-gen": false,
    committees: false,
    centers: false,
    affiliates: false,
    admin: false
  });
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
 
  const toggleSection = (section: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
  let dayNameEnglish = "Sunday";
  try {
    dayNameEnglish = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentTime);
  } catch (e) {
    console.warn("Date name formatting failed:", e);
    const dayIndex = currentTime.getDay();
    const engDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    dayNameEnglish = engDays[dayIndex];
  }
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

  let timeStr = "";
  try {
    timeStr = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(currentTime).toUpperCase();
  } catch (e) {
    console.warn("Time formatting failed, using fallback:", e);
    timeStr = currentTime.toLocaleTimeString().toUpperCase();
  }
  
  // Function to format date parts into "DD Month YYYY" with Western digits
  const formatDate = (date: Date, calendar?: string) => {
    try {
      const locale = calendar ? `ar-SA-u-ca-${calendar}-nu-latn` : `ar-SA-u-nu-latn`;
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
      const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
      
      const day = parts.find(p => p.type === 'day')?.value || String(date.getDate()).padStart(2, '0');
      const month = parts.find(p => p.type === 'month')?.value || String(date.getMonth() + 1);
      const year = parts.find(p => p.type === 'year')?.value || String(date.getFullYear());
      
      return `${day} ${month} ${year}`;
    } catch (e) {
      console.warn("Intl date formatting failed, using fallback:", e);
      if (calendar === 'islamic-umalqura') {
        const approxHijriYear = date.getFullYear() - 579;
        const fallbackMonths = [
          "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
          "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
        ];
        const startOfHijriYear = new Date(date.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((date.getTime() - startOfHijriYear.getTime()) / 86400000);
        const approxMonthIndex = Math.min(11, Math.floor(dayOfYear / 30));
        const approxDay = Math.min(30, (dayOfYear % 30) + 1);
        return `${approxDay} ${fallbackMonths[approxMonthIndex]} ${approxHijriYear}`;
      }
      return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('ar-SA', { month: 'long' })} ${date.getFullYear()}`;
    }
  };
 
  const gregorianDate = formatDate(currentTime);
  const hijriDate = formatDate(currentTime, 'islamic-umalqura');
 
  const departments = [
        {
      id: "assistant-sec-gen",
      nameAr: "مساعد الأمين العام",
      icon: <UserCheck className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "مساعد الأمين العام", path: "/assistant-sec-gen", icon: <UserCheck className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/assistant-sec-gen/events", icon: <Calendar className="w-4 h-4" /> },
        
        
      ]
    },
        {
      id: "centers",
      nameAr: "إدارة المراكز",
      icon: <Building2 className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "إدارة المراكز", path: "/centers", icon: <Building2 className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/centers/events", icon: <Calendar className="w-4 h-4" /> },
        
        
      ]
    },
        {
      id: "affiliates",
      nameAr: "إدارة المنتسبين",
      icon: <Users className="w-4 h-4" />,
      pages: [
        { name: "Dashboard", nameAr: "إدارة المنتسبين", path: "/affiliates", icon: <Users className="w-4 h-4" /> },
        { name: "Events", nameAr: "الفعاليات", path: "/affiliates/events", icon: <Calendar className="w-4 h-4" /> },
        
        
      ]
    },
    {
      id: "committees",
      nameAr: "إدارة اللجان",
      icon: <Users2 className="w-4 h-4" />,
      pages: [
        { name: "الرئيسية", nameAr: "شاشة المتابعة", path: "/", icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: "تشكيل اللجان", nameAr: "تشكيل اللجان", path: "/committees", icon: <Users2 className="w-4 h-4" /> },
        { name: "سجل الأعضاء", nameAr: "سجل الأعضاء", path: "/members", icon: <Library className="w-4 h-4" /> },
        { name: "سجل الفعاليات", nameAr: "الفعاليات", path: "/events", icon: <Calendar className="w-4 h-4" /> },
        { name: "Recommendations", nameAr: "التوصيات", path: "/recommendations", icon: <CheckCircle2 className="w-4 h-4" /> },
        { name: "Tasks", nameAr: "المهام", path: "/tasks", icon: <CheckSquare className="w-4 h-4" /> },
        { name: "Reports", nameAr: "التقارير", path: "/reports", icon: <FileText className="w-4 h-4" /> },
        { name: "Library", nameAr: "المكتبة الرقمية", path: "/library", icon: <BookOpen className="w-4 h-4" /> },
      ]
    },
    {
      id: "admin",
      nameAr: "الهيكل الإداري",
      icon: <Settings className="w-4 h-4" />,
      pages: [
        { name: "System Admin", nameAr: "الهيكل الإداري", path: "/org-chart", icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  const allPages = departments.flatMap(dept => dept.pages);

  const filteredPages = allPages.filter(page => {
    if (!currentUserObj) return true;
    
    // Always let sysadmins see everything
    if (currentUserObj.role === "SYS_ADMIN") return true;

    // Admin permissions allows viewing the system admin page
    if (currentUserObj.adminPermissions && page.path === "/org-chart") return true;

    // If allowedPages is explicitly set, use it (even if empty)
    if (currentUserObj.allowedPages && Array.isArray(currentUserObj.allowedPages)) {
      return currentUserObj.allowedPages.includes(page.path);
    }
    
    // Fallback: Default to NO pages if allowedPages is undefined (Explicit opt-in required)
    return false;
  });

  const getFilteredDeptPages = (deptPages: any[]) => {
    return deptPages.filter(page => filteredPages.some(fp => fp.path === page.path));
  };
 
  const currentPage = filteredPages.find(p => p.path === location.pathname) || filteredPages[0] || allPages[0];

  let currentDeptName = "";
  let currentPageName = "";
  for (const dept of departments) {
    const page = dept.pages.find(p => p.path === location.pathname);
    if (page) {
      currentDeptName = dept.nameAr;
      currentPageName = page.nameAr;
      break;
    }
  }
  const headerSubtitle = currentDeptName && currentPageName
    ? `${currentDeptName} - ${currentPageName}`
    : "قطاع اللجان والمراكز";

  return (
    <div dir="rtl" className="min-h-screen bg-[#cccccc] p-4 md:p-6 text-gray-800 font-sans">
      
      {/* Header Bar */}
      <header className="bg-[#e8e4e4] rounded-2xl shadow-sm border border-gray-200 p-2 flex flex-col lg:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* RIGHT: Logo & Main Navigation */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="relative dropdown-container flex-shrink-0 z-50">
            <button 
              onClick={() => toggleDropdown('mainMenu')} 
              className="flex items-center gap-3 px-2 py-1.5 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-100 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center p-1">
                <img 
                  src="https://drive.google.com/thumbnail?id=1pAVRkqNXJmtVRpCl1fy3wuQS6hpmJPKt&sz=w500" 
                  alt="شعار غرفة مكة"
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
              <div className="hidden sm:block text-right pr-2">
                <h1 className="text-[13px] font-black text-gray-900 leading-tight">قطاع اللجان والمراكز</h1>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5 flex items-center gap-1">
                  {headerSubtitle} <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === 'mainMenu' ? 'rotate-180' : ''}`} />
                </p>
              </div>
            </button>
            
            <AnimatePresence>
              {activeDropdown === 'mainMenu' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full right-0 mt-2 w-[280px] sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col"
                  style={{ maxHeight: '80vh' }}
                >
                  <div className="p-1.5 space-y-1 overflow-y-auto flex-1">
                    {departments.map((dept) => {
                      const deptPages = getFilteredDeptPages(dept.pages);
                      if (deptPages.length === 0) return null;
                      
                      const hasSubPages = deptPages.length > 1;
                      const isExpanded = expandedSections[dept.id] || false;
                      
                      return (
                        <div key={dept.id} className="w-full">
                          {hasSubPages ? (
                            <>
                              <button 
                                onClick={(e) => toggleSection(dept.id, e)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-right hover:bg-gray-50 rounded-lg transition-colors font-bold text-sm group ${deptPages.some(p => p.path === location.pathname) ? 'text-brand bg-gray-50' : 'text-gray-700 hover:text-brand'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`${deptPages.some(p => p.path === location.pathname) ? 'text-brand' : 'text-gray-400'} group-hover:text-brand transition-colors`}>{dept.icon}</span>
                                  <span>{dept.nameAr}</span>
                                </div>
                                <div className={`p-1 rounded flex items-center justify-center transition-colors ${isExpanded ? 'bg-brand/10 border border-brand/20' : 'bg-gray-50/50 border border-gray-100/50 group-hover:bg-brand/5 group-hover:border-brand/10'}`}>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180 text-brand' : 'text-gray-400 group-hover:text-brand'}`} />
                                </div>
                              </button>
                              
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-1 pr-6 pl-2 space-y-0.5 border-r-2 border-gray-100 mr-4 my-1">
                                      {deptPages.map((page, idx) => (
                                        <Link 
                                          key={idx}
                                          to={page.path}
                                          className={`w-full flex items-center gap-3 px-3 py-2 text-right hover:bg-gray-50 rounded-lg transition-colors font-semibold text-sm group ${location.pathname === page.path ? 'text-brand bg-brand/5' : 'text-gray-600 hover:text-brand'}`}
                                        >
                                          <span className={`${location.pathname === page.path ? 'text-brand' : 'text-gray-300'} group-hover:text-brand transition-all`}>{page.icon}</span>
                                          {page.nameAr}
                                        </Link>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <Link 
                              to={deptPages[0].path}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-right hover:bg-gray-50 rounded-lg transition-colors font-bold text-sm group ${location.pathname === deptPages[0].path ? 'text-brand bg-brand/5' : 'text-gray-700 hover:text-brand'}`}
                            >
                              <span className={`${location.pathname === deptPages[0].path ? 'text-brand' : 'text-gray-400'} group-hover:text-brand transition-colors`}>{dept.icon}</span>
                              {dept.nameAr}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* User Profile Section inside the menu */}
                  <div className="border-t border-gray-100 bg-gray-50 p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {userPhoto ? (
                        <img src={userPhoto} alt={userName} className="w-10 h-10 rounded-full object-cover border border-gray-200" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold border border-brand/20 text-sm shrink-0">
                          {userName ? userName.charAt(0) : "ب"}
                        </div>
                      )}
                      <div className="overflow-hidden flex-1">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{userName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate mt-0.5">{userRoleAr}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("current_user");
                        localStorage.removeItem("google_access_token");
                        window.location.href = "/";
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all text-red-600 font-bold text-xs cursor-pointer shadow-sm"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      تسجيل الخروج
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* LEFT: Date/Time */}
        <div className="flex flex-col md:flex-row-reverse items-stretch md:items-center gap-2">
          {/* Date & Time */}
          <div className="flex flex-row-reverse items-center gap-2 pr-0 pt-2 md:pt-0">
            {/* 1. Date Cards */}
            <div id="datetime-card" className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-0 sm:min-w-[150px]">
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shadow-inner font-black">AD</span>
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">{gregorianDate} </span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-brand/20 shadow-sm min-w-0 sm:min-w-[150px]">
                <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded shadow-inner font-black">HI</span>
                <span className="text-[10px] font-bold text-brand uppercase tracking-tight">{hijriDate} </span>
              </div>
            </div>

            {/* 2. Time Card */}
            <div className="flex flex-col gap-1 hidden sm:flex">
              <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-0 sm:min-w-[150px]">
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shadow-inner font-black">DAY</span>
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tight">{dayName}</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm min-w-0 sm:min-w-[150px]">
                <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded shadow-inner font-black">TIME</span>
                <span className="text-[10px] font-bold text-brand uppercase tracking-tight font-mono">{timeStr}</span>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* Main Content Area */}
      <main className="w-full mt-6 space-y-4">
        {allPages.some(p => p.path === location.pathname) && !filteredPages.some(p => p.path === location.pathname) ? (
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
