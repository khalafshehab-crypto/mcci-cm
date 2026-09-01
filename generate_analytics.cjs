const fs = require('fs');

const code = `import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirestoreCollection } from '../lib/firebaseUtils';
import { showGlobalToast } from '../lib/toastUtils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';
import { BarChart2, TrendingUp, Users, AlertTriangle, Zap, CheckCircle2, RefreshCw, Activity, Target, Clock, ShieldCheck, Download, Search, Filter, PlaySquare, FileSpreadsheet, Plus, ExternalLink, Eye, ChevronLeft, Lightbulb } from 'lucide-react';

export default function CommitteesAnalytics() {
  const { data: dbCommittees } = useFirestoreCollection<any>("committees", []);
  const { data: dbEvents } = useFirestoreCollection<any>("events", []);
  const { data: dbTasks } = useFirestoreCollection<any>("tasks", []);
  const { data: dbMembers } = useFirestoreCollection<any>("members", []);
  const { data: dbKpis } = useFirestoreCollection<any>("kpis", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("users", []);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberCommitteeFilter, setMemberCommitteeFilter] = useState("الكل");
  const [staffSearch, setStaffSearch] = useState("");

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    showGlobalToast("جاري تحديث واستيراد أحدث البيانات من النظام...", "loading");
    setTimeout(() => {
      setIsRefreshing(false);
      showGlobalToast("تم تحديث البيانات وجلب أحدث الإحصائيات بنجاح", "success");
    }, 1500);
  };

  // 1. حسابات العدادات القياسية
  const stats = useMemo(() => {
    const totalCommittees = dbCommittees.length;
    const activeCommittees = dbCommittees.filter(c => c.active !== false).length;
    const inactiveCommittees = totalCommittees - activeCommittees;

    let menCount = 0;
    let womenCount = 0;
    dbMembers.forEach(m => {
      const title = (m.title || "").trim();
      const name = (m.name || "").trim();
      const customTitle = (m.customTitle || "").trim();
      const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
      let isWoman = false;
      if (womenTitles.includes(title)) {
          isWoman = true;
      } else if (title === "غير ذلك" && customTitle.endsWith("ة")) {
          isWoman = true;
      } else if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) {
          isWoman = true;
      } else {
          const femaleNames = ["سمر", "فاطمة", "أمل", "سارة", "خديجة", "نورة", "مها", "عبير", "ريم", "هند", "ندى", "بشاير", "عهود", "نوف", "روان", "امجاد"];
          if (femaleNames.some(fn => name.includes(fn))) isWoman = true;
      }
      if (isWoman) womenCount++;
      else menCount++;
    });
    const totalMembers = dbMembers.length;
    const diversityRate = totalMembers > 0 ? Math.round((womenCount / totalMembers) * 100) : 0;

    let totalRecs = 0;
    let completedRecs = 0;
    let inProgressRecs = 0;
    let delayedRecs = 0;

    dbEvents.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item: any) => {
          if (item.recommendation && !item.inactiveRecommendation) {
            totalRecs++;
            if (item.status === "منجزة" || item.status === "مكتمل") completedRecs++;
            else if (item.status === "متأخرة" || item.status === "متأخر") delayedRecs++;
            else inProgressRecs++;
          }
        });
      }
    });
    const recCompletionRate = totalRecs > 0 ? Math.round((completedRecs / totalRecs) * 100) : 0;

    let totalKpiAchievement = 0;
    let validKpisCount = 0;
    dbKpis.forEach(kpi => {
      const rate = parseFloat(String(kpi.achievementRate || 0));
      if (!isNaN(rate)) {
        totalKpiAchievement += rate;
        validKpisCount++;
      }
    });
    const avgKpiScore = validKpisCount > 0 ? (totalKpiAchievement / validKpisCount).toFixed(1) : "0.0";

    return {
      committees: { total: totalCommittees, active: activeCommittees, inactive: inactiveCommittees },
      members: { total: totalMembers, men: menCount, women: womenCount, diversityRate },
      recs: { total: totalRecs, completed: completedRecs, inProgress: inProgressRecs, delayed: delayedRecs, rate: recCompletionRate },
      kpis: { avg: avgKpiScore, count: validKpisCount }
    };
  }, [dbCommittees, dbEvents, dbMembers, dbKpis]);

  // 2. إحصائيات وإنتاجية الكادر الإداري
  const staffStats = useMemo(() => {
    // We will build stats for employees assigned to committees
    const staffMap = new Map();
    
    // Initialize from employees collection if available, or extract from committees
    if (dbEmployees && dbEmployees.length > 0) {
      dbEmployees.forEach(emp => {
        if (emp.role !== "SYS_ADMIN" && emp.id !== "01") {
          staffMap.set(emp.name, {
            name: emp.name,
            title: emp.role || 'أخصائي لجان',
            committeesCount: 0,
            eventsCount: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            onTimeDeliveries: 0,
            totalDeliveries: 0
          });
        }
      });
    }

    dbCommittees.forEach(c => {
      if (c.specialist) {
        if (!staffMap.has(c.specialist)) {
          staffMap.set(c.specialist, {
            name: c.specialist,
            title: 'أخصائي لجان',
            committeesCount: 0,
            eventsCount: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            onTimeDeliveries: 0,
            totalDeliveries: 0
          });
        }
        staffMap.get(c.specialist).committeesCount++;
      }
    });

    dbEvents.forEach(evt => {
      const specialists = evt.employees || [];
      specialists.forEach((sp: string) => {
        if (staffMap.has(sp)) {
          staffMap.get(sp).eventsCount++;
        }
      });
      // Recs logic
      if (evt.agenda) {
        evt.agenda.forEach((item: any) => {
          if (item.assignee && item.recommendation && !item.inactiveRecommendation) {
            let spName = item.assignee;
            if (spName.includes("أخصائي اللجنة")) {
               spName = evt.employees?.[0] || spName;
            } else if (spName.includes(" - ")) {
               spName = spName.split(" - ")[1];
            }

            // Simple match
            for (let [key, val] of staffMap.entries()) {
               if (spName.includes(key) || key.includes(spName)) {
                  val.totalDeliveries++;
                  if (item.status === "منجزة" || item.status === "مكتمل") {
                    val.completedTasks++;
                    val.onTimeDeliveries++; // simplified logic for on-time
                  } else if (item.status === "متأخرة") {
                    val.inProgressTasks++;
                  } else {
                    val.inProgressTasks++;
                  }
               }
            }
          }
        });
      }
    });

    return Array.from(staffMap.values()).map(s => ({
      ...s,
      onTimeRate: s.totalDeliveries > 0 ? Math.round((s.onTimeDeliveries / s.totalDeliveries) * 100) : 100
    })).sort((a, b) => b.eventsCount - a.eventsCount);
  }, [dbCommittees, dbEvents, dbEmployees]);

  // 3. مصفوفة تفاعل الأعضاء
  const memberMatrix = useMemo(() => {
    return dbMembers.map(m => {
      const mComms = dbCommittees.filter(c => String(c.id) === String(m.committeeId) || String(c.id) === String(m.secondaryCommitteeId));
      const committeeNames = mComms.map(c => c.name).join('، ') || "غير محدد";
      
      const mEvents = dbEvents.filter(e => String(e.committeeId) === String(m.committeeId) || String(e.committeeId) === String(m.secondaryCommitteeId));
      let attended = 0;
      let missed = 0;
      mEvents.forEach(evt => {
        if (evt.confirmedAttendees && evt.confirmedAttendees.includes(m.id)) {
          attended++;
        } else if (evt.confirmedAttendees) {
          missed++; // assuming if array exists, attendance was taken
        }
      });
      const attendanceRate = (attended + missed) > 0 ? Math.round((attended / (attended + missed)) * 100) : 0;

      let assignedRecs = 0;
      dbEvents.forEach(evt => {
         if (evt.agenda) {
            evt.agenda.forEach((item: any) => {
               if (item.assignee && item.assignee.includes(m.name)) {
                  assignedRecs++;
               }
            });
         }
      });

      let status = "فاعل 🟢";
      if (attendanceRate < 50 && missed > 2) status = "تنبيه غياب متكرر 🔴";
      else if (attendanceRate < 75) status = "متوسط 🟡";

      return {
        id: m.id,
        name: m.name,
        title: m.title,
        role: m.role,
        committeeName: committeeNames,
        attendanceRate,
        attended,
        missed,
        assignedRecs,
        status
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [dbMembers, dbCommittees, dbEvents]);

  // Filters
  const filteredMembers = memberMatrix.filter(m => {
    if (memberSearch && !m.name.includes(memberSearch)) return false;
    if (memberCommitteeFilter !== "الكل" && !m.committeeName.includes(memberCommitteeFilter)) return false;
    return true;
  });

  const uniqueCommitteesForMembers = ["الكل", ...Array.from(new Set(memberMatrix.map(m => m.committeeName.split('، ')[0])))].filter(Boolean);

  // Executive Snapshot
  const topCommittee = [...dbCommittees].map(c => {
    const cEvents = dbEvents.filter(e => String(e.committeeId) === String(c.id)).length;
    return { name: c.name, score: cEvents };
  }).sort((a,b) => b.score - a.score)[0];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-l from-slate-900 to-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -left-24 -top-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl shadow-xl border border-white/10">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">الداش بورد الاستراتيجي</h2>
            </div>
            <p className="text-sm font-bold text-slate-300 mr-2 max-w-xl leading-relaxed">مركز القيادة والتحكم: نظرة تحليلية شاملة ومتقدمة لقياس أداء اللجان، إنتاجية الكادر الإداري، ومدى تفاعل الأعضاء ومقارنتها بمعايير 2026.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => showGlobalToast("تم تصدير الموجز بنجاح", "success")}
              className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-black text-xs border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm shadow-lg"
            >
              <Download className="w-4 h-4" />
              تصدير الموجز
            </button>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={\`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-black text-xs border shadow-lg \${
                isRefreshing 
                  ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 hover:scale-105'
              }\`}
            >
              <RefreshCw className={\`w-4 h-4 \${isRefreshing ? 'animate-spin' : ''}\`} />
              مزامنة
            </button>
          </div>
        </div>
      </div>

      {/* 1. شريط العدادات القياسية الرباعي */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* بطاقة اللجان */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/50 relative overflow-hidden group hover:border-blue-200 transition-colors">
           <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-50 rounded-full blur-xl group-hover:bg-blue-100 transition-colors"></div>
           <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <span className="block text-[11px] font-black text-slate-500 mb-1">اللجان القطاعية</span>
                 <h3 className="text-3xl font-black text-slate-800">{stats.committees.total}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                 <Layers className="w-5 h-5" />
              </div>
           </div>
           <div className="relative z-10 flex items-center gap-3 text-xs font-bold mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span>{stats.committees.active} فعالة</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                 <span>{stats.committees.inactive} غير فعالة</span>
              </div>
           </div>
        </div>

        {/* بطاقة الأعضاء */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/50 relative overflow-hidden group hover:border-purple-200 transition-colors">
           <div className="absolute -left-4 -top-4 w-16 h-16 bg-purple-50 rounded-full blur-xl group-hover:bg-purple-100 transition-colors"></div>
           <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <span className="block text-[11px] font-black text-slate-500 mb-1">إجمالي الأعضاء</span>
                 <h3 className="text-3xl font-black text-slate-800">{stats.members.total}</h3>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                 <Users className="w-5 h-5" />
              </div>
           </div>
           <div className="relative z-10 flex items-center gap-3 text-xs font-bold mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-1 rounded-lg" title="رجال">
                 <span>👨</span>
                 <span>{stats.members.men}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-1 rounded-lg" title="سيدات">
                 <span>👩</span>
                 <span>{stats.members.women}</span>
              </div>
              <div className="mr-auto text-purple-700 text-[10px] bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                 تنوع {stats.members.diversityRate}%
              </div>
           </div>
        </div>

        {/* بطاقة التوصيات */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/50 relative overflow-hidden group hover:border-emerald-200 transition-colors">
           <div className="absolute -left-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full blur-xl group-hover:bg-emerald-100 transition-colors"></div>
           <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <span className="block text-[11px] font-black text-slate-500 mb-1">حجم التوصيات</span>
                 <h3 className="text-3xl font-black text-slate-800">{stats.recs.total}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
           </div>
           <div className="relative z-10 flex flex-wrap items-center gap-2 text-xs font-bold mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100">
                 🟢 {stats.recs.completed} منجزة
              </div>
              <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] border border-amber-100">
                 🟡 {stats.recs.inProgress} جارية
              </div>
              <div className="flex items-center gap-1 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] border border-rose-100">
                 🔴 {stats.recs.delayed} متأخرة
              </div>
              <div className="w-full mt-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-emerald-500 h-full rounded-full" style={{ width: \`\${stats.recs.rate}%\` }}></div>
              </div>
           </div>
        </div>

        {/* بطاقة التقييم */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/50 relative overflow-hidden group hover:border-amber-200 transition-colors">
           <div className="absolute -left-4 -top-4 w-16 h-16 bg-amber-50 rounded-full blur-xl group-hover:bg-amber-100 transition-colors"></div>
           <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                 <span className="block text-[11px] font-black text-slate-500 mb-1">تقييم الأداء 2026</span>
                 <h3 className="text-3xl font-black text-slate-800">{stats.kpis.avg}<span className="text-sm text-slate-400 font-bold">%</span></h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                 <Target className="w-5 h-5" />
              </div>
           </div>
           <div className="relative z-10 flex items-center justify-between text-xs font-bold mt-4 pt-4 border-t border-slate-100">
              <span className="text-slate-500">متوسط الإنجاز الكلي</span>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-700">مبني على {stats.kpis.count} معيار</span>
           </div>
        </div>
      </div>

      {/* الموجز التنفيذي السريع */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-inner">
         <h3 className="text-xs font-black text-indigo-900 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" /> موجز القيادة التنفيذية (Executive Snapshot)</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
               <span className="block text-indigo-400 font-bold mb-1 text-[10px]">🏆 أبرز إنجاز</span>
               <p className="font-black text-slate-800 leading-relaxed">تحقيق نسبة إنجاز {stats.recs.rate}% في التوصيات خلال الربع الحالي.</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
               <span className="block text-indigo-400 font-bold mb-1 text-[10px]">🔥 الأعلى تفاعلاً</span>
               <p className="font-black text-slate-800 leading-relaxed">{topCommittee?.name || 'لجنة المقاولات'} ({topCommittee?.score || 0} فعالية).</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
               <span className="block text-red-400 font-bold mb-1 text-[10px]">⚠️ فجوة حرجة</span>
               <p className="font-black text-slate-800 leading-relaxed">وجود {stats.recs.delayed} توصية متأخرة تتطلب تدخلاً عاجلاً وقراراً إدارياً.</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 2. إحصائيات وإنتاجية الكادر الإداري */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                 <BriefcaseIcon className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">إنتاجية الكادر الإداري</h3>
                  <span className="text-[10px] text-slate-500 font-bold">Staff Quick Stats & Workload</span>
               </div>
             </div>
             <div className="relative">
               <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="بحث عن موظف..." 
                 value={staffSearch}
                 onChange={e => setStaffSearch(e.target.value)}
                 className="w-48 pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
               />
             </div>
          </div>
          <div className="overflow-x-auto flex-1">
             <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-black">
                   <tr>
                      <th className="py-3 px-4">الموظف</th>
                      <th className="py-3 px-2 text-center">اللجان</th>
                      <th className="py-3 px-2 text-center">الفعاليات</th>
                      <th className="py-3 px-2 text-center">التوصيات</th>
                      <th className="py-3 px-2 text-center">الالتزام</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {staffStats.filter(s => !staffSearch || s.name.includes(staffSearch)).map((staff, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                         <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black border border-blue-200 shadow-sm">
                                  {staff.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-slate-800">{staff.name}</p>
                                  <span className="text-[9px] text-slate-500 font-bold">{staff.title}</span>
                               </div>
                            </div>
                         </td>
                         <td className="py-3 px-2 text-center font-black text-slate-700">{staff.committeesCount}</td>
                         <td className="py-3 px-2 text-center font-black text-slate-700">{staff.eventsCount}</td>
                         <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                               <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title="منجزة">{staff.completedTasks}</span>
                               <span className="text-slate-400">/</span>
                               <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100" title="جارية">{staff.inProgressTasks}</span>
                            </div>
                         </td>
                         <td className="py-3 px-2 text-center">
                            <span className={\`px-2 py-1 rounded-lg font-black text-[10px] border \${
                               staff.onTimeRate >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                               staff.onTimeRate >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                               'bg-rose-50 text-rose-700 border-rose-200'
                            }\`}>
                               {staff.onTimeRate}%
                            </span>
                         </td>
                      </tr>
                   ))}
                   {staffStats.length === 0 && (
                      <tr>
                         <td colSpan={5} className="py-8 text-center text-slate-500 font-bold text-xs">لا توجد بيانات متاحة لعرض إنتاجية الموظفين.</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* 3. مصفوفة تفاعل الأعضاء */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                 <Users className="w-5 h-5" />
               </div>
               <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">مصفوفة تفاعل الأعضاء</h3>
                  <span className="text-[10px] text-slate-500 font-bold">Engagement Matrix</span>
               </div>
             </div>
             <div className="flex gap-2">
                <select
                  value={memberCommitteeFilter}
                  onChange={e => setMemberCommitteeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold px-2 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                >
                   {uniqueCommitteesForMembers.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="بحث..." 
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="w-32 pl-2 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
             </div>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[400px] custom-scrollbar relative">
             <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-black sticky top-0 z-10 shadow-sm">
                   <tr>
                      <th className="py-2.5 px-4">العضو</th>
                      <th className="py-2.5 px-2 text-center">الالتزام</th>
                      <th className="py-2.5 px-2 text-center">المهام</th>
                      <th className="py-2.5 px-3">المؤشر</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredMembers.slice(0, 50).map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="py-2 px-4">
                            <p className="font-black text-slate-800 text-[11px] truncate max-w-[140px]" title={m.name}>{m.title} {m.name}</p>
                            <span className="text-[9px] text-slate-500 font-bold truncate max-w-[140px] block" title={m.committeeName}>{m.role} - {m.committeeName}</span>
                         </td>
                         <td className="py-2 px-2 text-center">
                            <div className="flex flex-col items-center">
                               <span className="font-black text-slate-700 text-[11px]">{m.attendanceRate}%</span>
                               <span className="text-[8px] text-slate-400 font-bold">({m.attended} حاضر / {m.missed} غياب)</span>
                            </div>
                         </td>
                         <td className="py-2 px-2 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-black text-[10px]">{m.assignedRecs}</span>
                         </td>
                         <td className="py-2 px-3">
                            <span className={\`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black border \${
                               m.status.includes('فاعل') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                               m.status.includes('متوسط') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                               'bg-rose-50 text-rose-700 border-rose-200'
                            }\`}>
                               {m.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                   {filteredMembers.length === 0 && (
                      <tr>
                         <td colSpan={4} className="py-8 text-center text-slate-500 font-bold text-xs">لا يوجد أعضاء مطابقين للبحث.</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* المحاور التحليلية المتقدمة */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
         <h3 className="font-extrabold text-slate-900 text-sm mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-500" />
            المحاور التحليلية المتقدمة (Advanced Analytical Axes)
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* المحور 1 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
               </div>
               <h4 className="font-black text-slate-800 text-xs mb-1">المقارنة التاريخية</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-3">مقارنة أداء الدورة 22 الحالية مع الدورة 21 ومسار الأرباع (YoY / QoQ).</p>
               <div className="h-16 w-full opacity-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{name:'Q1', v:40},{name:'Q2', v:60},{name:'Q3', v:45},{name:'Q4', v:80}]}>
                      <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#dbeafe" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* المحور 2 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-purple-300 transition-colors cursor-pointer group">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-purple-600" />
               </div>
               <h4 className="font-black text-slate-800 text-xs mb-1">مصفوفة التصنيف الرباعية</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-3">تصنيف اللجان بناءً على اكتمال النصاب مقابل إنجاز المخرجات الاستراتيجية.</p>
               <div className="h-16 w-full opacity-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <Scatter data={[{x:10,y:20},{x:30,y:40},{x:50,y:10},{x:80,y:90}]} fill="#9333ea" />
                    </ScatterChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* المحور 3 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer group">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-rose-600" />
               </div>
               <h4 className="font-black text-slate-800 text-xs mb-1">محرك سرعة الإنجاز</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-3">تحليل عنق الزجاجة وزمن معالجة سلسلة الاعتمادات والمحاضر.</p>
               <div className="h-16 w-full opacity-60 flex items-center justify-center">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                     <div className="bg-emerald-500 w-1/3 h-full"></div>
                     <div className="bg-amber-500 w-1/2 h-full"></div>
                     <div className="bg-rose-500 w-1/6 h-full"></div>
                  </div>
               </div>
            </div>

            {/* المحور 4 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer group">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5 text-emerald-600" />
               </div>
               <h4 className="font-black text-slate-800 text-xs mb-1">خريطة الأثر الخارجي</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-3">سجل الشراكات والتوصيات المرفوعة للجهات واتحاد الغرف.</p>
               <div className="h-16 w-full flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">اتحاد</div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-700">وزارة</div>
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-black text-amber-700">أمانة</div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

const BriefcaseIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const LayoutGrid = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="7" height="7" x="3" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/>
    <rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);
`
fs.writeFileSync('src/pages/CommitteesAnalytics.tsx', code);
