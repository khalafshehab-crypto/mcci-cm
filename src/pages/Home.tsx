import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  BarChart3, 
  PieChart, 
  ChevronDown, 
  Clock, 
  Users2, 
  CheckCircle2, 
  LayoutDashboard,
  MapPin,
  ListTodo,
  ClipboardCheck,
  Briefcase,
  Target,
  Gavel,
  Zap,
  Sparkles,
  AlertTriangle,
  Trophy,
  MessageSquare,
  XCircle,
  User,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Check,
  AlertCircle,
  Bell,
  UserCheck,
  Printer,
  Send,
  Eye,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

const COLORS = ["#246fff", "#0ea5e9", "#6366f1", "#8b5cf6", "#a855f7"];

const DEFAULT_PREPARATIONS = [
  "التنسيق مع الأمن لسيارات الأعضاء للوقوف بمواقف السيارات العليا",
  "فتح البوابة الرئيسية للقاعات (بوابة الرام)",
  "تأمين الضيافة الأساسية (ماء، عصير، تمر، قهوة وشاي)",
  "تجهيز وحجز القاعة والترتيبات المتكاملة",
  "تحضير ملفات اللقاء (ملف لكل عضو يحتوي على ورقتين وقلم)",
  "الدعم الإعلامي والتغطية (تصوير فوتوغرافي، توثيق، نشر تغريدات)",
  "تأمين الأجهزة الفنية والشبكة (لابتوب، مايكات، الشاشة الترحيبية)",
  "مركز المسؤولية الاجتماعية (رابط تسجيل ساعات تطوعية للأعضاء)"
];

const CustomModernBar = (props: any) => {
  const { x, y, width, height, fill, value, payload, isActive } = props;
  if (!height) return null;
  
  const name = payload?.name || "";
  const rx = Math.min(width / 2, 8); // clean rounded radius cap on top
  
  // Safe unique stable IDs for gradients based on name hash
  const safeName = encodeURIComponent(name).replace(/%/g, "_");
  const glowId = `glow-modern-${safeName}`;
  const highlightGradId = `highlight-modern-${safeName}`;
  
  return (
    <g 
      className="transition-all duration-300 ease-out" 
      style={{ 
        transform: isActive ? 'translateY(-6px)' : 'none',
        transformOrigin: 'bottom center'
      }}
    >
      <defs>
        {/* Glow behind active bar */}
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={fill} stopOpacity={0.3} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </radialGradient>
        
        {/* Subtle sleek top highlight */}
        <linearGradient id={highlightGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
          <stop offset="100%" stopColor={fill} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Pulsing glow background for active/hovered bar */}
      {isActive && (
        <rect
          x={x - 8}
          y={y - 8}
          width={width + 16}
          height={height + 12}
          fill={`url(#${glowId})`}
          rx={rx + 8}
          className="animate-pulse pointer-events-none"
        />
      )}

      {/* Main Bar with crisp top-rounded path */}
      <path
        d={`
          M ${x}, ${y + rx}
          A ${rx},${rx} 0 0 1 ${x + rx},${y}
          L ${x + width - rx},${y}
          A ${rx},${rx} 0 0 1 ${x + width},${y + rx}
          L ${x + width},${y + height}
          L ${x},${y + height}
          Z
        `}
        fill={fill}
        opacity={isActive ? 1.0 : 0.8}
        className="transition-all duration-300 cursor-pointer"
      />

      {/* Sleek, glossy front glass highlight overlay */}
      <path
        d={`
          M ${x + 1}, ${y + rx + 1}
          A ${rx - 1},${rx - 1} 0 0 1 ${x + rx},${y + 1}
          L ${x + width - rx},${y + 1}
          A ${rx - 1},${rx - 1} 0 0 1 ${x + width - 1},${y + rx + 1}
          L ${x + width - 1}, ${y + (height / 2)}
          L ${x + 1}, ${y + (height / 2)}
          Z
        `}
        fill={`url(#${highlightGradId})`}
        className="pointer-events-none"
        opacity={0.2}
      />

      {/* Balloon with clean value badge on hover */}
      {isActive && (
        <g transform={`translate(${x + width/2}, ${y - 12})`}>
          <motion.g
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          >
            <path
              d="M -4 -3 L 0 1 L 4 -3 Z"
              fill="#1e293b"
            />
            <rect
              x={-24}
              y={-23}
              width={48}
              height={20}
              rx={6}
              fill="#1e293b"
            />
            <text
              x={0}
              y={-10}
              fill="#ffffff"
              fontSize="11px"
              fontWeight="900"
              textAnchor="middle"
              className="font-mono select-none"
            >
              {value}
            </text>
          </motion.g>
        </g>
      )}

      {/* Passive small label above columns */}
      {!isActive && (
        <text
          x={x + width / 2}
          y={y - 6}
          fill="#475569"
          fontSize="10px"
          fontWeight="800"
          textAnchor="middle"
          className="font-mono transition-opacity duration-300 select-none"
        >
          {value}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-brand/20 p-3 rounded-xl shadow-xl text-right font-sans min-w-[170px] relative z-50">
        <div className="flex items-center gap-2 justify-end mb-1 border-b border-white/10 pb-1">
          <span className="text-[10px] font-black text-brand-gold bg-brand/10 text-brand px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(36, 111, 255, 0.15)', color: '#63b3ff' }}>
            {data.name}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 mt-1">
          <span className="text-[10px] text-gray-400 font-bold">القيمة الحالية</span>
          <span className="text-xs font-black text-white font-mono">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export interface Meeting {
  id?: number;
  day: string;
  date: string;
  time: string;
  dept: string;
  section: string;
  responsible: string;
  room: string;
  desc: string;
  status: string;
  event: string;
  notes: string;
  category: "event" | "recommendation" | "task";
  dateObj: Date;
  monthName: string;
  checklist: Array<{ label: string; completed: boolean }>;
}

const ArabicDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ArabicMonths = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const getRelativeDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d;
};

const isDateInCurrentWeek = (d: Date) => {
  const today = new Date();
  const currentSunday = new Date(today);
  currentSunday.setDate(today.getDate() - today.getDay());
  currentSunday.setHours(0, 0, 0, 0);

  const currentSaturday = new Date(currentSunday);
  currentSaturday.setDate(currentSunday.getDate() + 6);
  currentSaturday.setHours(23, 59, 59, 999);

  return d >= currentSunday && d <= currentSaturday;
};

const isDateInNextWeek = (d: Date) => {
  const today = new Date();
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() - today.getDay() + 7);
  nextSunday.setHours(0, 0, 0, 0);

  const nextSaturday = new Date(nextSunday);
  nextSaturday.setDate(nextSunday.getDate() + 6);
  nextSaturday.setHours(23, 59, 59, 999);

  return d >= nextSunday && d <= nextSaturday;
};

const getWeekTimeframe = (dateStr: string): "current" | "next" | "other" => {
  if (!dateStr) return "other";
  try {
    const parts = dateStr.replace(/\//g, "-").split("-");
    if (parts.length === 3) {
      let year = parseInt(parts[0]);
      let month = parseInt(parts[1]) - 1;
      let day = parseInt(parts[2]);

      // If formatted as DD-MM-YYYY
      if (parts[0].length < 4 && parts[2].length === 4) {
        year = parseInt(parts[2]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[0]);
      }

      const testDate = new Date(year, month, day);
      if (!isNaN(testDate.getTime())) {
        if (isDateInCurrentWeek(testDate)) return "current";
        if (isDateInNextWeek(testDate)) return "next";
      }
    }
  } catch (err) {
    console.error("Error calculating timeframe for alarm", err);
  }
  return "other";
};


export interface Alarm {
  id: string;
  type: "event" | "recommendation" | "task";
  title: string;
  description: string;
  dept: string;
  committee: string;
  responsible: string;
  isUrgent: boolean;
  dateStr: string;
  status: string;
  timeframe: "current" | "next" | "other";
}

import { useFirestoreCollection } from '../lib/firebaseUtils';
import { formatCommitteeNameArabic } from '../lib/arabicUtils';
import { doc, updateDoc } from '../lib/firebase';
import { db } from '../lib/firebase';

const getStepsForEventAlarm = (e: any) => {
  const s1Done = !!e.committeeConfirmed;
  const s2Done = !!e.invitationSent;
  const s3Done = !!e.attendanceConfirmed;
  const s4Done = !!e.preparationsConfirmed;
  const s5Done = !!(e.agendaTransferred || (e.agenda && e.agenda.length > 0));
  const s6Done = !!e.minutesSaved;

  return [
    {
      id: 1,
      labelDone: "تم تأكيد الموعد",
      labelActive: "جاري تأكيد الموعد",
      labelPending: "الموعد قادم",
      isDone: s1Done,
      isActive: !s1Done,
      stepIndex: 1,
    },
    {
      id: 2,
      labelDone: "تم إرسال الدعوات",
      labelActive: "جاري إرسال الدعوات",
      labelPending: "إرسال الدعوات قادم",
      isDone: s2Done,
      isActive: !s2Done && s1Done,
      stepIndex: 2,
    },
    {
      id: 3,
      labelDone: "تم تأكيد حضور الأعضاء",
      labelActive: "جاري تأكيد حضور الأعضاء",
      labelPending: "تأكيد الحضور قادم",
      isDone: s3Done,
      isActive: !s3Done && s2Done,
      stepIndex: 3,
    },
    {
      id: 4,
      labelDone: "تم اكتمال التجهيزات والضيافة",
      labelActive: "جاري اكتمال التجهيزات والضيافة",
      labelPending: "التجهيزات والضيافة قادمة",
      isDone: s4Done,
      isActive: !s4Done && s3Done,
      stepIndex: 4,
    },
    {
      id: 5,
      labelDone: "تم اعتماد جدول الأعمال",
      labelActive: "جاري اعتماد جدول الأعمال",
      labelPending: "جدول الأعمال قادم",
      isDone: s5Done,
      isActive: !s5Done && s4Done,
      stepIndex: 5, // index 5 of workflow tabs corresponds to minutes / agenda
    },
    {
      id: 6,
      labelDone: "تم تدوين المحضر",
      labelActive: "جاري تدوين المحضر",
      labelPending: "تدوين المحضر قادم",
      isDone: s6Done,
      isActive: !s6Done && s5Done,
      stepIndex: 5, // index 5 is minutes draft 
    }
  ];
};

export default function Home() {
  const navigate = useNavigate();
  const { data: dbCommittees } = useFirestoreCollection<any>("committees", []);
  const { data: dbEvents } = useFirestoreCollection<any>("events", []);
  const { data: dbMembers } = useFirestoreCollection<any>("members", []);
  const { data: dbRecs } = useFirestoreCollection<any>("recommendations", []);
  const { data: dbTasks } = useFirestoreCollection<any>("tasks", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("employees", []);

  const [currentUserRole, setCurrentUserRole] = useState("SPECIALIST");
  const [currentUserName, setCurrentUserName] = useState("مدير النظام");
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          if (parsed.name) setCurrentUserName(parsed.name);
          if (parsed.role) setCurrentUserRole(parsed.role);
        }
      }
    } catch(e) {}
  }, []);

  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    meetings: true,
    charts: false,
    stats: true,
    notifications: true,
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeTypes, setActiveTypes] = useState<string[]>(["event", "recommendation", "task"]);
  const [activeTimeframes, setActiveTimeframes] = useState<string[]>(["current", "next"]);
  const [meetingsViewMode, setMeetingsViewMode] = useState<"cards" | "table">("cards");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const meetings = React.useMemo(() => {
    const list: Meeting[] = [];
    
    if (Array.isArray(dbEvents)) {
      dbEvents.forEach((evt) => {
        const dateObj = evt.date ? new Date(evt.date) : new Date();
        
        // Dynamic checklists of preparations
        const hasAgenda = !!evt.agendaTransferred || !!evt.minutesSaved;
        const hasAttendance = !!evt.attendanceConfirmed;
        
        const checklistItems = (evt.preparationsChecklist !== undefined && Array.isArray(evt.preparationsChecklist)) ? evt.preparationsChecklist : DEFAULT_PREPARATIONS;
        const hasGreeting = !!evt.preparationsConfirmed || !checklistItems.some((p: string) => p.includes("الأجهزة") || p.includes("الترحيبية"));
        const hasHospitality = !!evt.preparationsConfirmed || !checklistItems.some((p: string) => p.includes("الضيافة") || p.includes("ماء"));
        const hasSetup = !!evt.preparationsConfirmed || !checklistItems.some((p: string) => p.includes("تجهيز وحجز") || p.includes("فتح البوابة"));
        const hasMedia = !!evt.preparationsConfirmed || !checklistItems.some((p: string) => p.includes("الإعلامي") || p.includes("تصوير"));

        const dynamicChecklist = [
          { label: "جدول الأعمال", completed: hasAgenda },
          { label: "كشف توقيع الحضور", completed: hasAttendance },
          { label: "الشاشة الترحيبية", completed: hasGreeting },
          { label: "الضيافة", completed: hasHospitality },
          { label: "التجهيزات", completed: hasSetup },
          { label: "التغطية الإعلامية", completed: hasMedia }
        ];

        let calculatedStatus = "جديد";
        if (evt.minutesSaved && evt.exportedRecommendationsToPage) {
          calculatedStatus = "مؤكد";
        } else if (!evt.committeeConfirmed) {
          calculatedStatus = "جاري تأكيد الموعد";
        } else if (!evt.invitationSent) {
          calculatedStatus = "جاري إرسال الدعوات";
        } else if (!evt.attendanceConfirmed) {
          calculatedStatus = "جاري تأكيد الحضور";
        } else if (!evt.preparationsConfirmed) {
          calculatedStatus = "جاري تجهيز اللقاء";
        } else if (!evt.agenda || evt.agenda.length === 0 || !evt.agendaTransferred) {
          calculatedStatus = "جاري كتابة جدول الأعمال";
        } else if (!evt.minutesSaved) {
          calculatedStatus = "جاري كتابة محضر الاجتماع";
        } else if (!evt.exportedRecommendationsToPage) {
          calculatedStatus = "جاري كتابة التوصيات";
        } else {
          calculatedStatus = "مؤكد";
        }

        list.push({
          id: evt.id,
          day: ArabicDays[dateObj.getDay()] || "الأحد",
          date: evt.date || "2026/06/11",
          time: evt.time || "10:00 AM",
          dept: "إدارة الفعاليات",
          section: evt.committeeName || "العامة",
          responsible: (Array.isArray(evt.employees) && evt.employees[0]) || "أخصائي اللجنة",
          room: evt.location || "حضوري",
          desc: evt.type || "فعالية",
          status: calculatedStatus,
          event: evt.title || "عنوان الفعالية",
          notes: evt.notes || "",
          category: "event",
          dateObj: dateObj,
          monthName: ArabicMonths[dateObj.getMonth()] || "يناير",
          checklist: dynamicChecklist
        });
      });
    }

    list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    return list;
  }, [dbEvents]);

  // Real-time Database computations - completely dynamic based on actual data in the system
  const { liveDb, chartData } = React.useMemo(() => {
    let committeesTotal = 0;
    let activeCommittees = 0;
    let inactiveCommittees = 0;
    let approvedPlans = 0;
    let ratingIssuesCount = 0;
    
    let totalMembers = 0;
    let activeMembers = 0;
    let menCount = 0;
    let womenCount = 0;

    let totalRecommendations = 0;
    let completedRecommendations = 0;
    let activeRecommendations = 0;
    let inactiveRecommendations = 0;
    let impactRecommendations = 0;

    let totalTasks = 0;
    let completedTasks = 0;
    let activeTasks = 0;
    let delayedTasks = 0;

    let eventsCount = 0;
    let meetingsCount = 0;
    let apprecCases = 0;

    try {
      // 1. Committees
      const comms = dbCommittees;
      if (Array.isArray(comms) && comms.length > 0) {
        committeesTotal = comms.length;
        activeCommittees = comms.filter((c: any) => c && c.active !== false).length;
        inactiveCommittees = committeesTotal - activeCommittees;
        approvedPlans = comms.filter((c: any) => c && (c.duration || c.strategyAppr === "معتمد" || (c.strategicPlan && c.strategicPlan !== "غير مدرجة"))).length;
        ratingIssuesCount = comms.filter((c: any) => c && c.ratingIssues && c.ratingIssues.trim().length > 0 && c.ratingIssues !== "لا يوجد قضايا تقدير").length;
        apprecCases = ratingIssuesCount;
      }
      
      // 2. Events & Meetings
      const evts = dbEvents;
      if (Array.isArray(evts)) {
        eventsCount = evts.length;
        meetingsCount = evts.filter((e: any) => e.type === "اجتماع" || e.type === "لقاء" || e.category === "event").length;
      }

      // 3. Members
      let mbrs = dbMembers;
      if (Array.isArray(mbrs) && mbrs.length > 0) {
        totalMembers = mbrs.length;
        activeMembers = mbrs.filter((m: any) => m.active === true || m.active === "true" || m.status === "نشط" || m.status === "فعال" || m.active !== false).length;
        
        const femaleCount = mbrs.filter((m: any) => {
          const title = m.title || "";
          const name = m.name || "";
          return title === "الأستاذة" || title === "الدكتورة" || title === "المهندسة" || 
                 name.includes("سمر") || name.includes("فاطمة") || name.includes("المهندسة") || 
                 name.includes("الدكتورة") || name.includes("أمل") || name.includes("سارة") || name.includes("خديجة");
        }).length;
        
        womenCount = femaleCount;
        menCount = totalMembers - womenCount;
      }

      // 4. Recommendations
      const recs = dbRecs;
      if (Array.isArray(recs) && recs.length > 0) {
        totalRecommendations = recs.length;
        completedRecommendations = recs.filter((r: any) => r.status === "منجزة" || r.approvalStage === "مكتملة").length;
        activeRecommendations = recs.filter((r: any) => r.status === "جاري العمل عليها").length;
        inactiveRecommendations = recs.filter((r: any) => r.status === "متأخرة" || r.status === "جديدة").length;
        impactRecommendations = recs.filter((r: any) => r.duration || r.attachments?.length > 0).length || 2;
      }

      // 5. Tasks
      const tasks = dbTasks;
      if (Array.isArray(tasks) && tasks.length > 0) {
        totalTasks = tasks.length;
        completedTasks = tasks.filter((t: any) => t.status === "منجزة").length;
        activeTasks = tasks.filter((t: any) => t.status === "جاري العمل عليها" || t.status === "جديدة").length;
        delayedTasks = tasks.filter((t: any) => t.status === "متأخرة").length;
      }
    } catch(e) {}

    const calculatedLiveDb = {
      totalComms: committeesTotal,
      activeComms: activeCommittees,
      inactiveComms: inactiveCommittees,
      approvedPlans: approvedPlans,
      totalMbrs: totalMembers,
      activeMbrs: activeMembers,
      menMbrs: menCount,
      womenMbrs: womenCount,
      totalRecs: totalRecommendations,
      completedRecs: completedRecommendations,
      activeRecs: activeRecommendations,
      delayedRecs: inactiveRecommendations,
      totalTsks: totalTasks,
      completedTsks: completedTasks,
      activeTsks: activeTasks,
      totalEvts: eventsCount,
      meetingsEvts: meetingsCount,
      apprecCases: apprecCases
    };

    const calculatedChartData = [
      { name: "المهام غير منجزة", value: totalTasks - completedTasks, color: "#4f46e5", icon: ListTodo },
      { name: "المهام المنجزة", value: completedTasks, color: "#f87171", icon: ClipboardCheck },
      { name: "إجمالي المهام", value: totalTasks, color: "#22c55e", icon: Briefcase },
      { name: "الخطط الإستراتيجية", value: approvedPlans, color: "#6366f1", icon: Target },
      { name: "قضايا التقدير", value: apprecCases, color: "#475569", icon: Gavel },
      { name: "الفعاليات", value: eventsCount, color: "#eab308", icon: Zap },
      { name: "الاجتماعات", value: meetingsCount, color: "#22c55e", icon: Calendar },
      { name: "التوصيات ذات الأثر", value: impactRecommendations, color: "#1e293b", icon: Sparkles },
      { name: "غير فعالة", value: inactiveRecommendations, color: "#eab308", icon: AlertTriangle },
      { name: "تحت الإجراء", value: activeRecommendations, color: "#ec4899", icon: Clock },
      { name: "التوصيات الفعالة", value: completedRecommendations, color: "#22c55e", icon: Trophy },
      { name: "التوصيات", value: totalRecommendations, color: "#3b82f6", icon: MessageSquare },
      { name: "الأعضاء", value: totalMembers, color: "#f59e0b", icon: User },
      { name: "اللجان غير الفعالة", value: inactiveCommittees, color: "#ef4444", icon: XCircle },
      { name: "اللجان الفعالة", value: activeCommittees, color: "#22c55e", icon: CheckCircle2 },
      { name: "إجمالي اللجان", value: committeesTotal, color: "#3b82f6", icon: LayoutDashboard },
      { name: "عدد السيدات", value: womenCount, color: "#ec4899", icon: Users2 },
      { name: "عدد الرجال", value: menCount, color: "#6366f1", icon: Users2 },
      { name: "الأعضاء النشطون", value: activeMembers, color: "#22c55e", icon: UserCheck }
    ];

    return { liveDb: calculatedLiveDb, chartData: calculatedChartData };
  }, [dbCommittees, dbEvents, dbMembers, dbRecs, dbTasks]);

  // Load ignored alerts state from localStorage
  const [ignoredAlarms, setIgnoredAlarms] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem("app_ignored_alarms_timestamps");
      return saved ? JSON.parse(saved) : {};
    } catch(e) {
      return {};
    }
  });

  const [snoozeAlarmId, setSnoozeAlarmId] = useState<string | null>(null);
  const [snoozeHours, setSnoozeHours] = useState<number>(24);

  const [manuallyUrgentAlarms, setManuallyUrgentAlarms] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("app_urgent_alarms_override");
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Active alarms list dynamic generator
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  useEffect(() => {
    const list: Alarm[] = [];

    // 1. Core Dynamic Recommendations
    try {
      const recs = dbRecs;
      if (Array.isArray(recs)) {
        // Exclude completed recommendations
        const activeRecs = recs.filter((r: any) => r.status !== "منجزة" && r.status !== "مكتملة");
        activeRecs.forEach((r: any) => {
          const alarmId = r.id || `rec-${Math.random()}`;
          // Default is normal (false) unless manually marked urgent
          const isUrgent = !!manuallyUrgentAlarms[alarmId];

          const normalStatus = r.status === "متأخرة" ? "متأخر" : r.status === "منجزة" ? "تمت الإحالة" : r.status === "جاري العمل عليها" ? "قيد الانتظار" : "جديد";

          list.push({
            id: alarmId,
            type: "recommendation",
            title: `توصية البند: ${r.title}`,
            description: r.description || "",
            dept: r.committeeName || "إدارة اللجان",
            committee: r.committeeName || "العامة",
            responsible: r.assignedTo || "أخصائي اللجنة",
            isUrgent: isUrgent,
            dateStr: r.date || "2026/06/11",
            status: isUrgent ? "عاجل جداً" : normalStatus,
            timeframe: getWeekTimeframe(r.date || "2026/06/11")
          });
        });
      }
    } catch (e) {}

    // 2. Core Dynamic Tasks
    try {
      const parsedTasks = dbTasks;
      if (Array.isArray(parsedTasks)) {
        // Exclude completed tasks
        const activeTasks = parsedTasks.filter((t: any) => t.status !== "منجزة" && t.status !== "مكتملة" && t.status !== "منجز");
        activeTasks.forEach((t: any) => {
          const alarmId = t.id || `task-${Math.random()}`;
          // Default is normal (false) unless manually marked urgent
          const isUrgent = !!manuallyUrgentAlarms[alarmId];

          const normalStatus = t.status === "متأخرة" ? "متأخر" : t.status === "منجزة" ? "تمت الإحالة" : t.status === "جاري العمل عليها" ? "قيد الانتظار" : "جديد";

          list.push({
            id: alarmId,
            type: "task",
            title: t.title,
            description: t.description || "",
            dept: "إدارة اللجان والفعاليات",
            committee: "العامة واللوائح التنظيمية",
            responsible: t.assignedTo || "مدير النظام",
            isUrgent: isUrgent,
            dateStr: t.dueDate || "2026/06/11",
            status: isUrgent ? "عاجل جداً" : normalStatus,
            timeframe: getWeekTimeframe(t.dueDate || "2026/06/11")
          });
        });
      }
    } catch (e) {}

    // 3. Core Dynamic Events
    try {
      const evts = dbEvents;
      if (Array.isArray(evts)) {
        // Exclude completed events
        const activeEvts = evts.filter((evt: any) => 
          evt.status !== "منتهية" && 
          evt.status !== "مكتملة" && 
          !(evt.minutesSaved && evt.exportedRecommendationsToPage)
        );
        activeEvts.forEach((evt: any) => {
          const alarmId = `evt-${evt.id || Math.random()}`;
          // Default is normal (false) unless manually marked urgent
          const isUrgent = !!manuallyUrgentAlarms[alarmId];

          const currentPreps = evt.preparationsChecklist !== undefined ? evt.preparationsChecklist : [];
          let prepStatus: "جديد" | "قيد الانتظار" | "تمت الإحالة" | "متأخر" = "جديد";
          if (evt.preparationsConfirmed) {
            prepStatus = "تمت الإحالة";
          } else if (currentPreps.length > 0) {
            prepStatus = "قيد الانتظار";
          } else if (evt.status === "متأخر" || evt.status === "متأخرة") {
            prepStatus = "متأخر";
          }

          const stepsStatus: string[] = [];
          stepsStatus.push(evt.committeeConfirmed ? "تم تأكيد الموعد" : "جاري تأكيد الموعد");
          stepsStatus.push(evt.invitationSent ? "تم إرسال الدعوات" : "جاري إرسال الدعوات");
          stepsStatus.push(evt.attendanceConfirmed ? "تم تأكيد حضور الأعضاء" : "جاري تأكيد الحضور");
          stepsStatus.push(evt.preparationsConfirmed ? "تم اكتمال التجهيزات والضيافة" : "جاري تجهيز اللقاء");
          if (evt.agendaTransferred || (evt.agenda && evt.agenda.length > 0)) {
            stepsStatus.push("تم اعتماد جدول الأعمال");
          }
          if (evt.minutesSaved) {
            stepsStatus.push("تم تدوين المحضر");
          }
          if (evt.exportedRecommendationsToPage) {
            stepsStatus.push("تم ترحيل التوصيات");
          }
          const dynamicDescription = stepsStatus.join(" - ");

          list.push({
            id: alarmId,
            type: "event",
            title: `تجهيز فعالية: ${evt.title}`,
            description: dynamicDescription || evt.notes || "تجهيز وحصر نصاب الحضور والورقة الترحيبية وتنسيق الضيافة",
            dept: "إدارة الفعاليات",
            committee: evt.committeeName || "العامة",
            responsible: (Array.isArray(evt.employees) && evt.employees[0]) || "أخصائي اللجنة",
            isUrgent: isUrgent,
            dateStr: evt.date || "2026/06/11",
            status: isUrgent ? "عاجل جداً" : prepStatus,
            timeframe: getWeekTimeframe(evt.date || "2026/06/11")
          });
        });
      }
    } catch (e) {}

    setAlarms(list);
  }, [dbRecs, dbTasks, dbEvents, manuallyUrgentAlarms]);

  // Dynamic Online Staff loaded directly from the database of employees
  const [onlineStaff, setOnlineStaff] = useState<any[]>([]);

  useEffect(() => {
    try {
      const sourceList = (dbEmployees && dbEmployees.length > 0) ? dbEmployees : (() => {
        try {
          const saved = localStorage.getItem("app_employees");
          return saved ? JSON.parse(saved) : [];
        } catch (_) { return []; }
      })();

      if (Array.isArray(sourceList) && sourceList.length > 0) {
        // Filter out master administrator accounts unless logged-in user is the master administrator
        const storedUser = localStorage.getItem("current_user");
        let isMasterAdmin = false;
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && (parsed.email === "khalafshehab@gmail.com" || parsed.email === "khalafshehab-crypto@gmail.com" || parsed.id === "01")) {
              isMasterAdmin = true;
            }
          } catch (_) {}
        }
        
        const allowedEmps = sourceList.filter(emp => {
          if (!isMasterAdmin && (emp.role === "SYS_ADMIN" || emp.id === "01" || emp.email?.trim().toLowerCase() === "khalafshehab@gmail.com" || emp.email?.trim().toLowerCase() === "khalafshehab-crypto@gmail.com")) {
            return false;
          }
          return true;
        });

        // Filter out inactive ones
        const activeEmps = allowedEmps.filter(emp => emp.active !== false);
        const listToUse = activeEmps.length > 0 ? activeEmps : allowedEmps;

        const mapped = listToUse.slice(0, 7).map((emp, index) => {
          const nameStr = emp.name || "";
          const words = nameStr.split(" ");
          const avatar = words.length >= 2 ? (words[0][0] + " " + (words[1][0] || "")) : ((words[0] && words[0][0]) || "م");
          const colors = ["bg-blue-600", "bg-teal-600", "bg-indigo-600", "bg-purple-600", "bg-amber-500", "bg-rose-500", "bg-emerald-600"];
          const color = colors[index % colors.length];
          
          // Allocate realistic diverse statuses for active work simulation
          const possibleStatuses = ["متصل", "في اجتماع", "مشغول", "خارج المكتب", "متصل"];
          const status = possibleStatuses[index % possibleStatuses.length];

          const presetAvatars = [
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200", // Male 1
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", // Female 1
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200", // Male 2
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200", // Female 2
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", // Male 3
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", // Female 3
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" // Male 4
          ];
          const photo = emp.photo || presetAvatars[index % presetAvatars.length];

          return {
            name: emp.name,
            title: emp.jobTitle || emp.roleAr || "أخصائي لجان",
            avatar: avatar.trim(),
            photo,
            color,
            status
          };
        });
        setOnlineStaff(mapped);
      }
    } catch (e) {
      console.error("Error formatting online staff lists", e);
    }
  }, [dbEmployees, currentUserRole]);

  // Modals and Interactive Reference Form State
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [referStaff, setReferStaff] = useState<string>("");
  const [referDept, setReferDept] = useState<string>("");
  const [referNotes, setReferNotes] = useState<string>("");
  const [referToast, setReferToast] = useState<string | null>(null);

  // Quick internal messaging state for Connected Staff Panel
  const [chatTarget, setChatTarget] = useState<{name: string, jobTitle: string, photo?: string | null} | null>(null);
  const [chatMsg, setChatMsg] = useState("");
  const [chatToast, setChatToast] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, sender: string, text: string, isMine: boolean, time: string, photo?: string | null}>>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Filters for notifications center
  const [notifTypeFilter, setNotifTypeFilter] = useState<string>("all");
  const [notifUrgentFilter, setNotifUrgentFilter] = useState<boolean>(false);
  const [notifWeekFilter, setNotifWeekFilter] = useState<string>("all");

  // Helper to resolve all detailed audit fields of a notification (alarm)
  const resolvedDetails = React.useMemo(() => {
    if (!selectedAlarm) return null;
    
    let committeeName = formatCommitteeNameArabic(selectedAlarm.committee) || "غير محدد";
    let meetingSeq = "الاجتماع الأول"; // default
    let meetingDate = selectedAlarm.dateStr || "2026/06/15";
    let staffName = selectedAlarm.responsible || "أخصائي اللجنة";
    let itemNumber = "البند الأول"; // default
    let itemTitle = selectedAlarm.title || "غير محدد";
    let itemDiscussion = "تمت مناقشة محاور البند واستعراض كافة المستندات والتوصيات بموجب الصلاحيات واللوائح التنظيمية.";
    let recommendationText = selectedAlarm.description || "ـ";
    
    // Attempt parsing custom formatted ID "custom-rec-eventId-itemId" or equivalent
    let eventId: number | null = null;
    let itemId: string | null = null;
    
    const idStr = String(selectedAlarm.id);
    const customMatch = idStr.match(/^(?:custom-rec-|rec-|evt-)?(\d+)(?:-(.+))?$/);
    if (customMatch) {
      eventId = Number(customMatch[1]);
      if (customMatch[2]) {
        itemId = customMatch[2];
      }
    }
    
    // Fallback search by matching date, committee or title to find event
    const matchedEvent = dbEvents.find((e: any) => 
      (eventId && String(e.id) === String(eventId)) || 
      (e.committeeName === selectedAlarm.committee && e.date === selectedAlarm.dateStr) ||
      (idStr.includes(String(e.id)))
    );
    
    if (matchedEvent) {
      committeeName = formatCommitteeNameArabic(matchedEvent.committeeName) || committeeName;
      meetingDate = matchedEvent.date || meetingDate;
      staffName = (Array.isArray(matchedEvent.employees) && matchedEvent.employees[0]) || staffName;
      
      // Try to parse meeting sequence from event title
      const title = matchedEvent.title || "";
      if (title.includes("النشاط الأول") || title.includes("الأول")) {
        meetingSeq = "الاجتماع التأسيسي (الأول)";
      } else if (title.includes("الثاني")) {
        meetingSeq = "الاجتماع الثاني";
      } else if (title.includes("الثالث")) {
        meetingSeq = "الاجتماع الثالث";
      } else if (title.includes("الرابع")) {
        meetingSeq = "الاجتماع الرابع";
      } else if (title.includes("الخامس")) {
        meetingSeq = "الاجتماع الخامس";
      } else {
        const serialMatch = title.match(/(\d+)/);
        meetingSeq = serialMatch ? `الاجتماع رقم ${serialMatch[1]}` : "الاجتماع الدوري";
      }
      
      const agenda = matchedEvent.agenda || [];
      // Look up agenda item
      const matchedAgendaItem = agenda.find((item: any) => 
        (itemId && String(item.id) === String(itemId)) || 
        (selectedAlarm.title.includes(item.title)) ||
        (selectedAlarm.description === item.recommendation)
      );
      
      if (matchedAgendaItem) {
        const idx = agenda.indexOf(matchedAgendaItem) + 1;
        const arabicOrdinals = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
        const ordText = arabicOrdinals[idx - 1] || idx.toString();
        itemNumber = `البند ${ordText}`;
        itemTitle = matchedAgendaItem.title || itemTitle;
        itemDiscussion = matchedAgendaItem.discussion || itemDiscussion;
        recommendationText = matchedAgendaItem.recommendation || recommendationText;
      } else if (agenda.length > 0) {
        itemNumber = "البند الأول";
        itemTitle = agenda[0].title || itemTitle;
        itemDiscussion = agenda[0].discussion || itemDiscussion;
        recommendationText = agenda[0].recommendation || recommendationText;
      }
    }
    
    // Clean Title prefix if any
    if (itemTitle.startsWith("توصية البند:")) {
      itemTitle = itemTitle.replace("توصية البند:", "").trim();
    }
    
    return {
      committeeName,
      meetingSeq,
      meetingDate,
      staffName,
      itemNumber,
      itemTitle,
      itemDiscussion,
      recommendationText
    };
  }, [selectedAlarm, dbEvents]);

  const toggleCard = (id: string) => {
    setOpenCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Ignore / snooze for exactly 1 business day (24 hours in MS)
  const handleIgnoreAlarm = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedTimestamps = {
      ...ignoredAlarms,
      [id]: Date.now()
    };
    setIgnoredAlarms(updatedTimestamps);
    localStorage.setItem("app_ignored_alarms_timestamps", JSON.stringify(updatedTimestamps));
  };

  const confirmSnooze = (id: string) => {
    const hours = Math.max(1, Math.min(24, snoozeHours || 24));
    const wakeUpTime = Date.now() + (hours * 60 * 60 * 1000);
    const updatedTimestamps = {
      ...ignoredAlarms,
      [id]: { timestamp: Date.now(), durationHours: hours, wakeUpTime }
    };
    setIgnoredAlarms(updatedTimestamps);
    localStorage.setItem("app_ignored_alarms_timestamps", JSON.stringify(updatedTimestamps));
    setSnoozeAlarmId(null);
  };

  const handleResetIgnoredAlarms = () => {
    setIgnoredAlarms({});
    localStorage.removeItem("app_ignored_alarms_timestamps");
    setSnoozeAlarmId(null);
  };

  // Submit Referral
  const handleSubmitReferral = async () => {
    if (!selectedAlarm) return;
    
    // Choose status value
    const targetStatus = selectedAlarm.status; // wait, has already been updated in setAlarms/setSelectedAlarm from select dropdown, or we can use selectedAlarm.status
    const targetStaff = referStaff || selectedAlarm.responsible;
    
    try {
      if (selectedAlarm.type === "task") {
        const taskId = String(selectedAlarm.id).replace("task-", "");
        const matchedTask = dbTasks.find((t: any) => String(t.id) === taskId);
        
        let mappedStatus = "جديدة";
        if (targetStatus === "تمت الإحالة") mappedStatus = "منجزة";
        else if (targetStatus === "قيد الانتظار") mappedStatus = "جاري العمل عليها";
        else if (targetStatus === "متأخر") mappedStatus = "متأخرة";
        
        const docRef = doc(db, "tasks", taskId);
        await updateDoc(docRef, {
          status: mappedStatus,
          assignedTo: targetStaff,
          description: referNotes ? `${matchedTask?.description || ""}\n[تحديث من شاشة المتابعة - ${new Date().toLocaleDateString('ar-EG')}]: ${referNotes}` : (matchedTask?.description || "")
        });
      } else if (selectedAlarm.type === "recommendation") {
        const recId = String(selectedAlarm.id).replace("rec-", "");
        const matchedRec = dbRecs.find((r: any) => String(r.id) === recId);
        
        let mappedStatus = "جديدة";
        if (targetStatus === "تمت الإحالة") mappedStatus = "منجزة";
        else if (targetStatus === "قيد الانتظار") mappedStatus = "جاري العمل عليها";
        else if (targetStatus === "متأخر") mappedStatus = "متأخرة";
        
        const docRef = doc(db, "recommendations", recId);
        await updateDoc(docRef, {
          status: mappedStatus,
          assignedTo: targetStaff,
          description: referNotes ? `${matchedRec?.description || ""}\n[تحديث من شاشة المتابعة - ${new Date().toLocaleDateString('ar-EG')}]: ${referNotes}` : (matchedRec?.description || "")
        });
      } else if (selectedAlarm.type === "event") {
        const eventId = String(selectedAlarm.id).replace("evt-", "");
        const matchedEvent = dbEvents.find((evt: any) => String(evt.id) === eventId);
        
        if (matchedEvent) {
          const isConfirmed = targetStatus === "تمت الإحالة";
          const statusVal = targetStatus === "تمت الإحالة" ? "مؤكد" : matchedEvent.status;
          
          let employeesArray = [...(matchedEvent.employees || [])];
          if (targetStaff && !employeesArray.includes(targetStaff)) {
            employeesArray = [targetStaff, ...employeesArray];
          }
          
          // If we confirm, we also want to set preparationsChecklist containing default ones to make it look 100% complete
          const defaultPreps = ["التنسيق مع الأمن لسيارات الأعضاء للوقوف بمواقف السيارات العليا", "فتح البوابة الرئيسية للقاعات (بوابة الرام)", "تأمين الضيافة الأساسية (ماء، عصير، تمر، قهوة وشاي)", "تجهيز وحجز القاعة والترتيبات المتكاملة", "تحضير ملفات اللقاء (ملف لكل عضو يحتوي على ورقتين وقلم)", "الدعم الإعلامي والتغطية (تصوير فوتوغرافي، توثيق، نشر تغريدات)", "تأمين الأجهزة الفنية والشبكة (لابتوب، مايكات، الشاشة الترحيبية)", "مركز المسؤولية الاجتماعية (رابط تسجيل ساعات تطوعية للأعضاء)"];
          const docRef = doc(db, "events", String(matchedEvent.id));
          await updateDoc(docRef, {
            preparationsConfirmed: isConfirmed,
            status: statusVal,
            employees: employeesArray,
            preparationsChecklist: isConfirmed ? defaultPreps : (matchedEvent.preparationsChecklist || []),
            preparationsAdditional: referNotes || matchedEvent.preparationsAdditional || ""
          });
        }
      }
      
      setReferToast(`تم تحديث حالة التنبيه ومستجدات قاعدة البيانات بنجاح وجاري المزامنة الفورية.`);
    } catch (firebaseErr) {
      console.error("Failed to commit referral to db:", firebaseErr);
      setReferToast(`تم التحديث محلياً، تلميح: يرجى التحقق من اتصال قاعدة البيانات.`);
    }

    setTimeout(() => {
      setReferToast(null);
      setSelectedAlarm(null);
      // Reset fields
      setReferStaff("");
      setReferDept("");
      setReferNotes("");
    }, 3500);
  };

  // Close alarm Details
  const handleCloseDetails = () => {
    setSelectedAlarm(null);
    setReferStaff("");
    setReferDept("");
    setReferNotes("");
  };

  // Quick Chat Send
  const handleSendChat = () => {
    if (!chatMsg.trim() || !chatTarget) return;

    const userMsg = chatMsg.trim();
    const newMsgId = `msg-${Date.now()}`;
    const targetName = chatTarget.name;
    const targetPhoto = chatTarget.photo;

    // 1. Add user's message to the chat local history
    setChatMessages(prev => [...prev, {
      id: newMsgId,
      sender: "أنت (مدير النظام)",
      text: userMsg,
      isMine: true,
      time: "الآن"
    }]);

    setChatMsg("");

    // 2. Display a beautiful floating alert indicating that the target employee was alerted immediately on their control panel!
    setChatToast(`🔔 جاري الإرسال والتنبيه... ظهر إشعار عاجل للتو على لوحة التحكم وشاشة العمل الخاصة بـ ${targetName}.`);

    // 3. Set typing state to simulate the employee writing back
    setTimeout(() => {
      setIsTyping(true);
    }, 850);

    // 4. Employee sends a realistic response back!
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, {
        id: `reply-${Date.now()}`,
        sender: targetName,
        text: `وعليكم السلام ورحمة الله وبركاته، أهلاً بك يا فندم. لقد تلقيت للتو تنبيهاً فورياً عاجلاً على لوحتي السحابية 🔔 وبشأن استفسارك المعول: "${userMsg}"، جاري المباشرة بالتنسيق مع الأخصائيين واللجان والعمل على وجه السرعة والإفادة فوراً بالمنجز. شكراً على حرصكم ومتابعتكم الدائمة!`,
        isMine: false,
        time: "الآن",
        photo: targetPhoto
      }]);

      setChatToast(`🟢 تم بفضل الله إشعار وتأكيد استجابة الموظف ${targetName} بنجاح.`);
      
      setTimeout(() => {
        setChatToast(null);
      }, 5000);

    }, 2800);

    // 5. Inject a real notification (alarm) into the Dashboard notification center so the user can verify it in the alerts list!
    const newChatAlarm: Alarm = {
      id: `chat-alert-${Date.now()}`,
      type: "task",
      title: `مخاطبة عاجلة: تم تنبيه ${targetName} بنجاح`,
      description: `تم إرسال إشعار فوري للعمل والتنسيق: "${userMsg}" - والموظف متصل الآن وجاري التعامل.`,
      dept: "قنوات التنسيق الداخلي",
      committee: "الاتصال والتنسيق الفوري",
      responsible: targetName,
      isUrgent: true,
      dateStr: new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
      status: "قيد الانتظار", // Yellow badge -> Active!
      timeframe: "current"
    };

    setAlarms(prev => [newChatAlarm, ...prev]);
  };

  const handleMarkUrgent = async (alarm: Alarm, e: React.MouseEvent) => {
    e.stopPropagation();
    const isUrgentNow = !manuallyUrgentAlarms[alarm.id];
    const updated = { ...manuallyUrgentAlarms, [alarm.id]: isUrgentNow };
    setManuallyUrgentAlarms(updated);
    localStorage.setItem("app_urgent_alarms_override", JSON.stringify(updated));

    try {
      if (alarm.type === "event") {
        const rawId = alarm.id.replace("evt-", "");
        await updateDoc(doc(db, "events", rawId), {
          status: isUrgentNow ? "عاجل" : "دوري",
          isUrgentOverride: isUrgentNow
        });
      } else if (alarm.type === "task") {
        await updateDoc(doc(db, "tasks", alarm.id), {
          priority: isUrgentNow ? "عاجلة" : "عادية"
        });
      } else if (alarm.type === "recommendation") {
        await updateDoc(doc(db, "recommendations", alarm.id), {
          status: isUrgentNow ? "متأخرة" : "جديدة"
        });
      }
    } catch (err) {
      console.error("Error setting urgent status in database:", err);
    }
  };

  // Filtered Alarm calculations
  const filteredAlarms = alarms.filter(a => {
    // 1. Filter out if recently ignored
    const val = ignoredAlarms[a.id];
    if (val) {
      let wakeUpTime = 0;
      if (typeof val === "object" && val !== null && "wakeUpTime" in val) {
        wakeUpTime = val.wakeUpTime;
      } else if (typeof val === "number") {
        wakeUpTime = val + 24 * 60 * 60 * 1000;
      }
      
      if (Date.now() < wakeUpTime) {
        return false;
      }
    }

    // 2. Filter by category
    if (notifTypeFilter !== "all" && a.type !== notifTypeFilter) {
      return false;
    }

    // 3. Filter by urgency status
    if (notifUrgentFilter && !a.isUrgent) {
      return false;
    }

    // 4. Filter by week timeframe
    if (notifWeekFilter !== "all" && a.timeframe !== notifWeekFilter) {
      return false;
    }

    return true;
  });

  // Helper to parse dateStr and optional time to a numeric timestamp for sorting (ascending - nearest first in date and time)
  const getAlarmTimestamp = (alarm: Alarm) => {
    if (!alarm.dateStr) return 0;
    try {
      let timeStr = "12:00 PM";
      if (alarm.type === "event") {
        const rawId = alarm.id.replace("evt-", "");
        const matched = dbEvents?.find((e: any) => String(e.id) === rawId);
        if (matched && matched.time) {
          timeStr = matched.time;
        }
      }
      
      const dateParts = alarm.dateStr.replace(/\//g, "-").split("-");
      if (dateParts.length === 3) {
        let year = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]) - 1;
        let day = parseInt(dateParts[2]);
        
        if (dateParts[0].length < 4 && dateParts[2].length === 4) {
          year = parseInt(dateParts[2]);
          month = parseInt(dateParts[1]) - 1;
          day = parseInt(dateParts[0]);
        }
        
        const d = new Date(year, month, day);
        
        if (timeStr) {
          const tMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (tMatch) {
            let hrs = parseInt(tMatch[1]);
            const mins = parseInt(tMatch[2]);
            const ampm = tMatch[3];
            if (ampm) {
              if (ampm.toUpperCase() === "PM" && hrs < 12) hrs += 12;
              if (ampm.toUpperCase() === "AM" && hrs === 12) hrs = 0;
            }
            d.setHours(hrs, mins, 0, 0);
          }
        }
        return d.getTime();
      }
    } catch (e) {
      console.error("Error sorting alarm timestamp", e);
    }
    return 0;
  };

  // Sort: Urgent items come first (assigned "عاجل جداً" manually). 
  // Urgent items appear at the absolute top of the list without being bound by chronological order.
  // Normal/non-urgent items are sorted chronologically with nearest first in date & time.
  filteredAlarms.sort((a, b) => {
    // 1. First sort by isUrgent (urgent items float to the top)
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    
    // 2. If both are urgent, we do not restrict/bind them by chronological order (maintain original order or return 0)
    if (a.isUrgent && b.isUrgent) {
      return 0; 
    }
    
    // 3. If both are normal/non-urgent, they are sorted by nearest date and time first (chronological ascending)
    const timeA = getAlarmTimestamp(a);
    const timeB = getAlarmTimestamp(b);
    return timeA - timeB;
  });

  const handlePrintMeetings = () => {
    window.print();
  };

  const filteredMeetings = meetings.filter(mtg => {
    // Filter by timeframe
    const showCurrent = activeTimeframes.includes("current");
    const showNext = activeTimeframes.includes("next");
    const isInCurrent = isDateInCurrentWeek(mtg.dateObj);
    const isInNext = isDateInNextWeek(mtg.dateObj);

    if (showCurrent && isInCurrent) {
      return true;
    }
    if (showNext && isInNext) {
      return true;
    }
    return false;
  });

  return (
    <div className="space-y-4 pb-12 print:p-0 print:bg-white text-right">
      
      {/* 0. Print helper style injected for physical A4 layout fitting */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; background: white !important; }
          #printable-meetings-table, #printable-meetings-table * { visibility: visible !important; }
          #printable-meetings-table { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-hidden, .print\\:hidden { display: none !important; }
        }
      `}} />


      {/* -------------------- مركز الإشعارات والموظفين المتصلين -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 print:hidden">
        
        {/* أ) مركز التنبيهات - يغطي 3 أعمدة */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-250 shadow-sm overflow-hidden flex flex-col justify-between">
          
          {/* ترويسة مركز التنبيهات مع فلاتر سريعة */}
          <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-100 text-red-700 rounded-xl relative">
                <Bell className="w-5 h-5 animate-bounce" />
                {filteredAlarms.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-650 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {filteredAlarms.length}
                  </span>
                )}
              </div>
              <div className="text-right">
                <h3 className="font-extrabold text-gray-900 text-sm">مركز عمليات الإشعارات والتنبيهات المبرمجة</h3>
                <p style={{ width: '250px' }} className="text-[10px] text-gray-500 font-bold mt-0.5">تنبيهات مبرمجة لمتابعة استحقاق المهام والتوصيات وأعمال اللجان</p>
              </div>
            </div>

            {/* أدوات الفرز والتصفية المدمجة في مركز التنبيهات */}
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {/* تصنيف النوع */}
              <select 
                value={notifTypeFilter} 
                onChange={(e) => setNotifTypeFilter(e.target.value)}
                className="text-[10px] sm:text-xs font-black bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand"
              >
                <option value="all">كل الأنواع</option>
                <option value="task">المهام الإدارية</option>
                <option value="recommendation">المستجدات والتوصيات</option>
                <option value="event">الفعاليات المجدولة</option>
              </select>

              {/* فلترة الأسبوع */}
              <select 
                value={notifWeekFilter} 
                onChange={(e) => setNotifWeekFilter(e.target.value)}
                className="text-[10px] sm:text-xs font-black bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand"
              >
                <option value="all">كل الأسابيع</option>
                <option value="current">الأسبوع الحالي</option>
                <option value="next">الأسبوع القادم</option>
              </select>

              {/* مفتاح العاجل */}
              <button
                type="button"
                onClick={() => setNotifUrgentFilter(!notifUrgentFilter)}
                className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer select-none ${
                  notifUrgentFilter 
                    ? "bg-red-600 text-white border-red-600 shadow-sm" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-slate-50"
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                <span>عاجل فقط</span>
              </button>
            </div>
          </div>

          {/* قائمة التنبيهات النشطة بصرياً */}
          <div className="p-4 space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar">
            {filteredAlarms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 text-center w-full">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-emerald-900">سجل الإشعارات نظيف تماماً!</p>
                  <p className="text-[10px] text-gray-400">لا توجد تنبيهات عاجلة حالياً.</p>
                </div>
              </div>
            ) : (
              filteredAlarms.map((a) => {
                const isUrgentAndCritical = a.isUrgent;
                const evtObj = a.type === "event" ? dbEvents?.find((e: any) => `evt-${e.id}` === a.id) : null;
                return (
                  <motion.div
                    key={a.id}
                    layoutId={`alarm-card-${a.id}`}
                    onClick={() => {
                      if (a.type === "event") {
                        const rawId = a.id.replace("evt-", "");
                        navigate("/events", { state: { selectedEventId: rawId } });
                      } else if (a.type === "task") {
                        navigate("/tasks", { state: { selectedTaskId: a.id } });
                      } else if (a.type === "recommendation") {
                        navigate("/recommendations", { state: { selectedRecId: a.id } });
                      }
                    }}
                    className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors cursor-pointer duration-350 hover:shadow-md ${
                      isUrgentAndCritical
                        ? "bg-red-50/75 border-red-250 hover:border-red-350 shadow-sm"
                        : "bg-slate-50/75 border-gray-250 hover:border-brand/30"
                    }`}
                    title="انقر للانتقال السريع والتحكم الفوري بهذا البند"
                  >
                    {/* الجانب الأيمن: النص والمؤشر */}
                    <div className="flex items-start gap-3 flex-1">
                      {/* نقطة مضيئة باللون الأحمر للعاجل */}
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${isUrgentAndCritical ? 'bg-red-600 animate-ping' : 'bg-brand'}`} />
                      <div className="space-y-1 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                            a.type === 'task' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            a.type === 'recommendation' ? 'bg-purple-100 text-purple-850 border border-purple-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {a.type === 'task' ? 'مهمة عمل' : a.type === 'recommendation' ? 'مستجد التوصية' : 'الفعالية المجدولة'}
                          </span>
                          
                          {a.isUrgent && (
                            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black animate-pulse flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>عاجل جداً</span>
                            </span>
                          )}

                          <span className="text-[9px] text-gray-400 font-mono">الاستحقاق: {a.dateStr}</span>
                          <span className="text-[9px] text-indigo-700 font-black">({a.committee})</span>
                        </div>
                        <h4 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">{a.title}</h4>
                        
                        {evtObj ? (
                          <div className="pt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                            <div className="text-[9px] font-black text-gray-400 mb-1">الإجراءات التفاعلية للفعالية (انقر للانتقال مباشرة):</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {getStepsForEventAlarm(evtObj).map((step) => {
                                const statusColor = step.isDone
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                                  : step.isActive
                                  ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse font-black"
                                  : "bg-gray-50 text-gray-400 border-gray-150 cursor-not-allowed opacity-60";
                                
                                const displayText = step.isDone
                                  ? step.labelDone
                                  : step.isActive
                                  ? step.labelActive
                                  : step.labelPending;

                                return (
                                  <button
                                    type="button"
                                    key={step.id}
                                    onClick={() => {
                                      navigate("/events", { state: { selectedEventId: evtObj.id, selectedStepIndex: step.stepIndex } });
                                    }}
                                    className={`px-2 py-1.5 rounded-lg text-[9px] font-bold text-center border transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${statusColor}`}
                                    title={`انتقل مباشرة إلى خطوة: ${displayText}`}
                                  >
                                    {step.isDone ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    ) : step.isActive ? (
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                    )}
                                    <span className="truncate">{displayText}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 leading-normal font-bold line-clamp-1">{a.description}</p>
                        )}
                      </div>
                    </div>

                    {/* الجانب الأيسر: أزرار التحكم بالتنبيه */}
                    <div className="flex items-center gap-1.5 shrink-0 justify-end" onClick={(e) => e.stopPropagation()}>
                      {/* زر عرض التفاصيل للتوجيه والإحالة */}
                      <button
                        type="button"
                        onClick={() => setSelectedAlarm(a)}
                        className="px-2.5 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض التفاصيل للتوجيه</span>
                      </button>

                      {/* زر الإهمال (يخفي التنبيه مؤقتا للمدة المحددة بالساعات) */}
                      {snoozeAlarmId === a.id ? (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg p-1 animate-pulse" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[9px] text-amber-900 font-extrabold px-1">المدة (1-24 س):</span>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={snoozeHours}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setSnoozeHours(Math.max(1, Math.min(24, val)));
                            }}
                            className="w-12 px-1 py-0.5 text-center text-xs font-black border border-amber-300 rounded bg-white text-gray-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmSnooze(a.id);
                            }}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] rounded transition-all select-none cursor-pointer"
                          >
                            تأكيد
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSnoozeAlarmId(null);
                            }}
                            className="px-1.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 font-extrabold text-[9px] rounded transition-all select-none cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleMarkUrgent(a, e)}
                            title="تحديد هذا التنبيه بشكل عاجل جداً وفوري وبثه في قواعد البيانات"
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 border ${
                              manuallyUrgentAlarms[a.id]
                                ? "bg-red-600 text-white border-red-650 hover:bg-red-700"
                                : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>عاجل جداً</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSnoozeAlarmId(a.id);
                              setSnoozeHours(24);
                            }}
                            title="إهمال مخصص للمدة المطلوبة بالساعات (الحد الأقصى 24 ساعة)"
                            className="px-2 py-1.5 bg-slate-200 hover:bg-amber-100 hover:text-amber-800 text-gray-600 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                          >
                            <span>إهمال مؤقت</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>

          {/* شريط الإحصاءات السريع بالتذييل لمركز التنبيهات */}
          <div className="bg-slate-50 p-2.5 border-t border-gray-150 text-[10px] font-bold text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-right">
            <button
              type="button"
              onClick={handleResetIgnoredAlarms}
              title="إعادة إظهار كافة التنبيهات المهملة والمسكوتة فوراً دون انتظار المدة المحددة"
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-brand hover:text-white text-gray-600 rounded-lg border border-gray-255 transition-all font-black select-none cursor-pointer shadow-sm group"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand group-hover:text-white shrink-0" />
              <span>إجمالي تنبيهات النظام المبرمجة:</span>
              <strong className="text-brand font-black group-hover:text-white bg-brand/5 px-2 py-0.5 rounded-md border border-brand/20 group-hover:border-white/30">
                {alarms.length}
              </strong>
              <span className="text-[9px] text-gray-400 group-hover:text-white font-normal mr-1 select-none">(انقر لإعادة إظهار الكل)</span>
            </button>
            <span>بانتظار الإجراء الفوري: <strong className="text-red-650 font-black">{alarms.filter(a => a.status !== "تمت الإحالة").length} تنبيه</strong></span>
            <span>تمت معالجتها بالإحالة: <strong className="text-emerald-700 font-black">{alarms.filter(a => a.status === "تمت الإحالة").length} تنبيه</strong></span>
          </div>

        </div>

        {/* ب) الموظفون المتصلون حالياً بالنظام */}
        <div className="bg-white rounded-2xl border border-gray-250 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-3 bg-slate-50 border-b border-gray-200 text-right">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shrink-0" />
              <span className="font-extrabold text-gray-900 text-xs">قنوات العمل الداخلي النشطة</span>
            </div>
            <p className="text-[9px] text-gray-400 mt-0.5">موظفي نظام اللجان متصلون الآن</p>
          </div>

          <div className="p-3 divide-y divide-gray-100 max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
            {onlineStaff.map((staff, sIdx) => {
              const status = staff.status || "متصل";
              const statusDotColor = 
                status === "متصل" ? "bg-green-500" :
                status === "في اجتماع" ? "bg-amber-500 animate-pulse" :
                status === "مشغول" ? "bg-red-500" :
                status === "خارج المكتب" ? "bg-indigo-400" :
                "bg-gray-400";

              const statusBadgeStyle = 
                status === "متصل" ? "text-emerald-700 bg-emerald-50 border-emerald-150" :
                status === "في اجتماع" ? "text-amber-700 bg-amber-55 border-amber-200" :
                status === "مشغول" ? "text-rose-700 bg-rose-50 border-rose-150" :
                status === "خارج المكتب" ? "text-indigo-700 bg-indigo-50 border-indigo-150" :
                "text-gray-500 bg-gray-100 border-gray-200";

              return (
                <div 
                  key={sIdx} 
                  className="flex items-center justify-between gap-2.5 pt-2 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-all"
                  onClick={() => {
                    setChatTarget({ name: staff.name, jobTitle: staff.title, photo: staff.photo });
                    setChatMsg("");
                    setChatToast(null);
                    setChatMessages([
                      {
                        id: "initial-welcome",
                        sender: staff.name,
                        text: `السلام عليكم ورحمة الله وبركاته، أنا متصل الآن بنظام اللجان 🟢 كيف يمكنني خدمتكم ومتابعة المعاملات والتنبيهات المستهدفة؟ قنوات العمل النشطة تعمل بشكل كامل.`,
                        isMine: false,
                        time: "الآن",
                        photo: staff.photo
                      }
                    ]);
                    setIsTyping(false);
                  }}
                >
                  <div className="flex items-center gap-2 text-right">
                    {/* صورة الموظف (أو رمز بديل احترافي في حال الغياب) وبجانبه حالة الاتصال */}
                    <div className="relative shrink-0">
                      {staff.photo ? (
                        <img 
                          src={staff.photo} 
                          alt={staff.name} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-gray-250 select-none shadow-sm"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full ${staff.color} text-white font-black text-xs flex items-center justify-center select-none shadow-sm`}>
                          {staff.avatar}
                        </div>
                      )}
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusDotColor} border-2 border-white rounded-full`} />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-gray-900 text-[11px] leading-tight">{staff.name}</h5>
                      <p className="text-[9px] text-gray-400 font-bold">{staff.title}</p>
                    </div>
                  </div>
                  
                  {/* مؤشر الربط */}
                  <div className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${statusBadgeStyle}`}>
                    {status}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-gray-150 text-center">
            <span className="text-[9px] text-[#b59410] font-black">اضغط على بطاقة الموظف للمخاطبة الفورية</span>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------------------------------------- */}

      {/* 1. Meetings Schedule Card */}
      <div className="group bg-[#e8e4e4] rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300 print:border-none print:shadow-none">
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#e8e4e4] transition-colors duration-300 print:hidden">
          
          {/* قسم العنوان وقابلية الطي */}
          <div 
            onClick={() => toggleCard('meetings')}
            className="flex items-center justify-between lg:justify-start gap-3 cursor-pointer select-none group/title py-1 flex-1"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors duration-300 ${openCards.meetings ? 'bg-brand text-white' : 'bg-brand/10 text-brand'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-[#111] group-hover/title:text-brand transition-colors text-base">جدول الفعاليات والاجتماعات القادمة</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-all duration-300 ${openCards.meetings ? 'rotate-180 text-brand' : ''}`} />
          </div>

          {/* أزرار الإجراءات: الطباعة A4 المباشرة وتبديل العرض */}
          <div className="flex items-center gap-2 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
            {/* زر طباعة A4 المطلوبة لتصدير الجدول المفرز */}
            <button
              type="button"
              onClick={handlePrintMeetings}
              title="طباعة على ورقة A4 متوافقة مع الأرشفة الورقية"
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-slate-55 rounded-xl font-black text-xs text-gray-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-[#b59410]" />
              <span>طباعة ورقة A4</span>
            </button>

            {/* سلايدر تبديل العرض (بطائق - سجل - فرز) على غرار سجل اللجان والأعضاء */}
            <div className="relative flex bg-white p-1 rounded-xl border border-gray-300 select-none shadow-sm gap-0.5">
              <button
                type="button"
                onClick={() => {
                  setMeetingsViewMode("cards");
                  setIsFilterOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                  meetingsViewMode === "cards"
                    ? "bg-brand text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>بطائق</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMeetingsViewMode("table");
                  setIsFilterOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                  meetingsViewMode === "table"
                    ? "bg-brand text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>سجل</span>
              </button>

              {/* زر خيار الفرز مع قائمة منبثقة */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                    isFilterOpen
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>فرز</span>
                </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3.5 space-y-3.5 text-right font-sans"
                      style={{ transformOrigin: "top left" }}
                    >
                      {/* الفلتر: الفترة الزمنية */}
                      <div className="space-y-2 text-right">
                        <div className="flex items-center gap-1.5 text-gray-800 justify-start">
                          <span className="w-1.5 h-3 bg-indigo-600 rounded-full" />
                          <span className="text-[11px] font-black">الفترة الزمنية:</span>
                        </div>
                        <div className="space-y-0.5">
                          {[
                            {
                              id: "all",
                              label: "الكل",
                              checkboxActive: "bg-gray-800 border-gray-800 text-white",
                              checkboxInactive: "border-gray-300 text-transparent",
                              textColor: "text-gray-800",
                              isSelected: activeTimeframes.length === 2,
                            },
                            {
                              id: "current",
                              label: "الأسبوع الحالي",
                              checkboxActive: "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10",
                              checkboxInactive: "border-indigo-300 text-transparent",
                              textColor: "text-indigo-600",
                              isSelected: activeTimeframes.includes("current"),
                            },
                            {
                              id: "next",
                              label: "الأسبوع القادم",
                              checkboxActive: "bg-indigo-800 border-indigo-800 text-white shadow-sm shadow-indigo-800/10",
                              checkboxInactive: "border-indigo-300 text-transparent",
                              textColor: "text-indigo-850",
                              isSelected: activeTimeframes.includes("next"),
                            }
                          ].map((item) => {
                            const handleToggle = () => {
                              if (item.id === "all") {
                                if (activeTimeframes.length === 2) {
                                  setActiveTimeframes([]);
                                } else {
                                  setActiveTimeframes(["current", "next"]);
                                }
                              } else {
                                setActiveTimeframes(prev => {
                                  if (prev.includes(item.id)) {
                                    return prev.filter(x => x !== item.id);
                                  } else {
                                    return [...prev, item.id];
                                  }
                                });
                              }
                            };

                            return (
                              <button
                                key={item.id}
                                onClick={handleToggle}
                                className="w-full flex items-center justify-between text-right px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                                    item.isSelected ? item.checkboxActive : item.checkboxInactive
                                  }`}>
                                    {item.isSelected && <Check className="w-2.5 h-2.5 stroke-[4.5]" />}
                                  </div>
                                  <span className={`text-[11px] font-black transition-colors ${
                                    item.isSelected ? item.textColor : "text-gray-500 group-hover:text-gray-700"
                                  }`}>
                                    {item.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

        <AnimatePresence>
          {openCards.meetings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-[#e8e4e4]"
            >
              <div className="p-4 md:p-6 space-y-6">
                {filteredMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-gray-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-sm text-gray-800">لا توجد اجتماعات متوافقة</h5>
                      <p className="text-xs text-gray-400 leading-normal max-w-xs mx-auto">
                        لم يتم العثور على اجتماعات قادمة تطابق خيارات الفرز المحددة حالياً.
                      </p>
                    </div>
                  </div>
                ) : meetingsViewMode === "table" ? (
                  /* 2. عرض سجل الاجتماعات (Table Register Layout) */
                  <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
                    <div className="overflow-x-auto font-sans">
                      <table className="w-full text-xs font-semibold text-gray-700 select-none border-collapse text-right">
                        <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900">
                          <tr className="divide-x divide-x-reverse divide-gray-300">
                            <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">اليوم والتاريخ</th>
                            <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">الوقت</th>
                            <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">اللجنة / الجهة القطاعية</th>
                            <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs max-w-sm">الموضوع / الفعالية</th>
                            <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">المسؤول</th>
                            <th className="px-4 py-3 font-black text-center text-gray-800 tracking-tight text-xs">الموقع والقاعة</th>
                            <th className="px-4 py-3 font-black text-center text-gray-850 tracking-tight text-xs">الحالة</th>
                            <th className="px-4 py-3 font-black text-center text-gray-850 tracking-tight text-xs">تجهيزات الاجتماع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                          {filteredMeetings.map((mtg, i) => (
                            <tr key={i} className="hover:bg-[#e2dede] transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700">
                              
                              {/* 2. اليوم والتاريخ */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className="font-black text-gray-900 block">{mtg.day}</span>
                                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{mtg.date}</span>
                              </td>

                              {/* 3. الوقت */}
                              <td className="px-4 py-3.5 font-mono text-gray-800 whitespace-nowrap">{mtg.time}</td>
                              
                              {/* 4. اللجنة / الجهة */}
                              <td className="px-4 py-3.5">
                                <span className="font-black text-brand bg-brand/10 px-2 py-0.5 rounded text-[10px] block w-fit">
                                  {mtg.section}
                                </span>
                                <span className="text-[10px] text-gray-500 block mt-0.5">{mtg.dept}</span>
                              </td>

                              {/* 5. الموضوع / الفعالية */}
                              <td className="px-4 py-3.5 text-gray-900 font-semibold text-xs max-w-sm leading-relaxed">
                                {mtg.category === "event" && mtg.id ? (
                                  <span 
                                    onClick={() => {
                                      navigate("/events", { state: { selectedEventId: mtg.id } });
                                    }}
                                    className="font-black hover:text-brand cursor-pointer hover:underline transition-colors block text-right"
                                  >
                                    {mtg.event}
                                  </span>
                                ) : (
                                  <span className="font-black block text-right">{mtg.event}</span>
                                )}
                                {mtg.notes !== "-" && (
                                  <span className="block text-[9px] text-amber-700 mt-1 font-sans font-medium">ملاحظة: {mtg.notes}</span>
                                )}
                              </td>

                              {/* 6. المسؤول */}
                              <td className="px-4 py-3.5 text-gray-800 font-bold whitespace-nowrap">{mtg.responsible}</td>
                              
                              {/* 7. الموقع والقاعة */}
                              <td className="px-4 py-3.5 text-red-700 font-black text-center whitespace-nowrap">{mtg.room}</td>
                              
                              {/* 8. الحالة */}
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${mtg.status === 'مؤكد' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                  {mtg.status}
                                </span>
                              </td>

                              {/* 9. تجهيزات الاجتماع */}
                              <td className="px-4 py-3.5 text-center">
                                <div className="flex flex-col items-center gap-1.5 justify-center w-full min-w-[100px]">
                                  <span className="text-[10px] text-gray-600 font-extrabold whitespace-nowrap">
                                    {mtg.checklist.filter(c => c.completed).length} من {mtg.checklist.length} جهزت
                                  </span>
                                  <div className="flex gap-1">
                                    {mtg.checklist.map((c, idx) => (
                                      <div
                                        key={idx}
                                        title={c.label}
                                        className={`w-1.5 h-1.5 rounded-full ${c.completed ? 'bg-green-600 shadow-[0_0_6px_rgba(22,163,74,0.35)]' : 'bg-gray-400'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* 3. عرض البطائق العادي (Cards Layout) - للوضعين: "cards" أو "sorting" */
                  filteredMeetings.map((mtg, i) => (
                    <div key={i} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-300 overflow-hidden">
                      <div className="flex flex-col lg:flex-row items-stretch min-h-[100px]">
                        
                        {/* القسم الأول: الفعالية والوقت (50%) - في أقصى اليمين */}
                        <div className="lg:w-1/2 p-4 flex items-center gap-5 border-l border-gray-100 bg-white">
                          {/* كتلة التاريخ */}
                          <div className="w-16 h-16 shrink-0 bg-brand/5 rounded-xl flex flex-col items-center justify-center border border-brand/5 group-hover:bg-brand/10 transition-colors">
                            <span className="text-xs font-black text-brand/60 uppercase" style={{ fontSize: '12px', marginBottom: '0px' }}>{mtg.day}</span>
                            <span className="text-2xl font-black text-brand leading-none">{mtg.date.split('/')[2]}</span>
                            <span className="text-xs font-black text-gray-400 font-sans" style={{ fontSize: '11px' }}>{mtg.monthName}</span>
                          </div>
                          
                          {/* اسم الفعالية والوقت */}
                          <div className="flex-1 min-w-0 space-y-1.5 text-right">
                            <span className="text-[10px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded-full mb-1 inline-block">
                              {mtg.section}
                            </span>
                            <h4 className="text-[15px] font-black text-gray-900 group-hover:text-brand transition-colors leading-tight line-clamp-1">
                              {mtg.category === "event" && mtg.id ? (
                                <span 
                                  onClick={() => {
                                    navigate("/events", { state: { selectedEventId: mtg.id } });
                                  }}
                                  className="cursor-pointer hover:underline"
                                >
                                  {mtg.event}
                                </span>
                              ) : (
                                <span>{mtg.event}</span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 text-gray-400">
                               <Clock className="w-5 h-5 text-brand/40" style={{ fontSize: '20px' }} />
                               <span className="text-base font-black text-gray-600 font-mono tracking-tight" style={{ fontSize: '16px' }}>{mtg.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* القسم الثاني: بيانات وحالة الاجتماع (25%) - في المنتصف */}
                        <div className="lg:w-1/4 p-4 border-l border-gray-100 flex flex-col justify-center gap-3 bg-white text-right">
                          <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 text-[8px] font-black rounded border ${mtg.status === 'مؤكد' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {mtg.status}
                             </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                               <Users2 className="w-3.5 h-3.5 text-brand/40" />
                               <span className="text-[11px] font-bold text-gray-700 truncate">{mtg.responsible}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <MapPin className="w-3.5 h-3.5 text-red-300" />
                               <span className="text-[11px] font-black text-gray-500">{mtg.room}</span>
                            </div>
                          </div>
                        </div>

                        {/* القسم الثالث: تجهيزات الاجتماع (25%) - في أقصى اليسار */}
                        <div className="lg:w-1/4 p-4 flex flex-col justify-center text-right bg-white">
                          <div className="flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand/40" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">تجهيزات الاجتماع</span>
                          </div>
                          <div className="grid grid-cols-1 gap-y-1">
                            {mtg.checklist.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${item.completed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`} />
                                <span className={`text-[10px] font-bold transition-colors ${item.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                      
                      {/* Footnote Notes */}
                      {mtg.notes !== "-" && (
                        <div className="bg-amber-50/30 border-t border-amber-100/10 px-4 py-1 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <p className="text-[9px] font-bold text-amber-700 italic">ملاحظة: {mtg.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Charts Card */}
      <div className="group bg-[#e8e4e4] rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300">
        <button 
          onClick={() => toggleCard('charts')}
          className="w-full flex items-center justify-between p-4 bg-[#e8e4e4] transition-colors duration-300 group/title select-none"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${openCards.charts ? 'bg-brand text-white' : 'bg-brand/10 text-brand'}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#111] group-hover/title:text-brand transition-colors text-base">الرسم البياني</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-all duration-300 ${openCards.charts ? 'rotate-180 text-brand' : ''}`} />
        </button>
        <AnimatePresence>
          {openCards.charts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 px-4 py-8 bg-[#e8e4e4]"
            >
              <div className="h-[460px] w-full overflow-x-auto custom-scrollbar bg-white rounded-xl border border-gray-150 p-4 shadow-inner">
                <ResponsiveContainer width="100%" height="100%" minWidth={800}>
                  <BarChart 
                    data={chartData} 
                    margin={{ top: 25, right: 30, left: 10, bottom: 25 }}
                    onMouseMove={(state) => {
                      if (state.activeTooltipIndex !== undefined) {
                        setActiveIndex(state.activeTooltipIndex);
                      }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      hide={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#334155', fontSize: 10, fontWeight: 900, fontFamily: 'Cairo' }}
                      interval={0}
                      height={50}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      width={40}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(36, 111, 255, 0.04)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      shape={(props: any) => <CustomModernBar {...props} isActive={props.index === activeIndex} />}
                      barSize={55}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={(entry as any).color || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Stats Card */}
      <div className="group bg-[#e8e4e4] rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300">
        <button 
          onClick={() => toggleCard('stats')}
          className="w-full flex items-center justify-between p-4 bg-[#e8e4e4] transition-colors duration-300 group/title select-none"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors duration-300 ${openCards.stats ? 'bg-brand text-white' : 'bg-brand/10 text-brand'}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-[#111] group-hover/title:text-brand transition-colors text-base">اللجان في أرقام</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-all duration-300 ${openCards.stats ? 'rotate-180 text-brand' : ''}`} />
        </button>
        <AnimatePresence>
          {openCards.stats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-[#e8e4e4]"
            >
              <div className="p-4 bg-[#e8e4e4]">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[...chartData].reverse().map((stat, i) => {
                    const originalIndex = chartData.length - 1 - i;
                    const isActive = activeIndex === originalIndex;
                    const Icon = stat.icon;
                    
                    return (
                      <div 
                        key={i} 
                        className={`flex flex-col h-24 rounded-xl overflow-hidden border transition-all duration-300 transform ${isActive ? 'scale-105 shadow-xl border-gray-300 ring-2 ring-brand/20 z-10' : 'shadow-sm border-gray-200 hover:border-brand/30'}`}
                        style={{ borderRightColor: stat.color, borderRightWidth: '4px' }}
                        onMouseEnter={() => setActiveIndex(originalIndex)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {/* Label Part (Dynamic color on hover) */}
                        <div 
                          className={`h-1/2 flex flex-col items-center justify-center px-1 text-center transition-colors ${isActive ? '' : 'bg-white'}`}
                          style={{ backgroundColor: isActive ? stat.color : undefined }}
                        >
                          <div className={`mb-0.5 transition-colors ${isActive ? 'text-white' : ''}`} style={{ color: isActive ? 'white' : stat.color }}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[8px] font-black leading-tight line-clamp-2 transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                            {stat.name}
                          </span>
                        </div>
                        {/* Value Part (Lighter) */}
                        <div className={`h-1/2 flex items-center justify-center transition-colors ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
                          <span className="text-xl font-black transition-colors" style={{ color: stat.color }}>
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================== */}
      {/* 4. MODAL: UNIFIED DETAILED VIEW & RECOMMENDATION UPDATES (مستجدات التوصيات) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {selectedAlarm && resolvedDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-150 relative overflow-hidden z-10 text-right font-sans flex flex-col max-h-[90vh]"
            >
              {/* Header block (Matched exact style of Committees Details) */}
              <div className="bg-[#e8e4e4] p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    selectedAlarm.type === "task" ? "bg-blue-100 text-blue-700" :
                    selectedAlarm.type === "recommendation" ? "bg-amber-100 text-amber-700" :
                    "bg-teal-100 text-teal-700"
                  }`}>
                    {selectedAlarm.type === "task" ? <ClipboardCheck className="w-6 h-6" /> : 
                     selectedAlarm.type === "recommendation" ? <Gavel className="w-6 h-6" /> : 
                     <Calendar className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                        متابعة الإجراء: {resolvedDetails.itemNumber}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        selectedAlarm.status === "متأخر" ? "bg-rose-100 text-rose-800" :
                        selectedAlarm.status === "تمت الإحالة" ? "bg-emerald-100 text-emerald-800" :
                        selectedAlarm.status === "قيد الانتظار" ? "bg-amber-100 text-amber-900" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedAlarm.status === "متأخر" ? "bg-rose-500" :
                          selectedAlarm.status === "تمت الإحالة" ? "bg-emerald-500" :
                          selectedAlarm.status === "قيد الانتظار" ? "bg-amber-500" :
                          "bg-blue-500"
                        }`}></span>
                        {selectedAlarm.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">مركز العمليات وسجل المتابعة للفعاليات واللجان</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseDetails}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer text-gray-500 hover:text-black"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Content Body (Matched exact layout gap and color choices) */}
              <div className="p-6 space-y-6 overflow-y-auto text-right">
                
                {/* 1. Header Metadata Section */}
                <div className="bg-[#fcfbfb] border border-[#d2cece] rounded-2xl p-4 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-gray-400 tracking-wider">البيانات الإدارية والتنظيمية</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
                        <Users2 className="w-5 h-5 text-brand" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">اللجنة</span>
                        <span className="text-xs font-bold text-gray-900">{resolvedDetails.committeeName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">رقم اللقاء</span>
                        <span className="text-xs font-bold text-gray-900">{resolvedDetails.meetingSeq}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">تاريخ الاجتماع</span>
                        <span className="text-xs font-bold text-gray-900">{resolvedDetails.meetingDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-black block">الأخصائي المسؤول</span>
                        <span className="text-xs font-bold text-gray-900">{resolvedDetails.staffName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Agenda Item & recommendation text section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 tracking-wider">تفاصيل وقائع ومقررات البند</h4>
                  
                  <div className="bg-[#fcfbfb] border border-[#d2cece] rounded-2xl p-4 shadow-inner space-y-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-black block mb-1">موضوع البند:</span>
                      <p className="text-xs font-extrabold text-blue-900 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        {resolvedDetails.itemTitle}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-black block mb-1">تدوين وقائع المناقشة:</span>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-150">
                        {resolvedDetails.itemDiscussion}
                      </p>
                    </div>

                    <div className="border-t border-gray-200/80 pt-3">
                      <span className="text-[10px] text-[#b59410] font-black block mb-1">نص التوصية المعتمدة:</span>
                      <p className="text-xs font-bold text-gray-950 bg-[#fffdf5] p-3 rounded-xl border border-[#e8d284] leading-relaxed">
                        {resolvedDetails.recommendationText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Operational Update Form (مستجدات التوصية والإفادة) */}
                <div className="border-t border-gray-150 pt-4 space-y-4 text-right">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-brand" />
                    <span>تسجيل مستجدات التوصية وشرح الإفادة ونسبة الإنجاز</span>
                  </h4>

                  {referToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3 rounded-xl text-xs font-extrabold flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 stroke-[3] shrink-0 text-emerald-600" />
                      <span>{referToast}</span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status update selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 block">
                        تحديث حالة التوصية بالعملية <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedAlarm.status}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setAlarms(prev => prev.map(a => a.id === selectedAlarm.id ? { ...a, status: val } : a));
                          setSelectedAlarm(prev => prev ? { ...prev, status: val } : null);
                        }}
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-950 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                      >
                        <option value="جديد">جديد - بانتظار اتخاذ الإجراء الإداري</option>
                        <option value="قيد الانتظار">قيد الانتظار - جاري التنسيق والمتابعة</option>
                        <option value="تمت الإحالة">تم الإنجاز - تم تنفيذ التوصية والإفادة</option>
                        <option value="متأخر">متأخر - تجاوزت المدة المقررة للتنفيذ</option>
                      </select>
                    </div>

                    {/* Employee writing the update */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 block">
                        منسق الإفادة / الموظف المستجِد <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={referStaff}
                        onChange={(e) => setReferStaff(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-950 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                      >
                        <option value="">-- اختر الموظف كاتب الإفادة --</option>
                        {onlineStaff.map((staff, sIdx) => (
                          <option key={sIdx} value={staff.name}>
                            {staff.name} ({staff.title})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Recommendation updates / comments */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 block text-right">
                      شرح مستجدات التوصية وتفاصيل العمل المنجز
                    </label>
                    <textarea
                      value={referNotes}
                      onChange={(e) => setReferNotes(e.target.value)}
                      placeholder="اكتب هنا الشرح التفصيلي للمستجدات مثل: 'تمت إحالة الملف للجنة ومخاطبة غرفة مكة وبانتظار رد الغرفة خلال يوم عمل...'"
                      rows={3}
                      className="w-full bg-slate-50 border border-gray-300 rounded-xl p-3 text-xs font-medium text-gray-950 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 p-4 border-t border-gray-200 flex items-center justify-between shrink-0 font-sans w-full">
                {resolvedDetails.eventId ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseDetails();
                      navigate("/events", { state: { selectedEventId: resolvedDetails.eventId } });
                    }}
                    className="text-xs font-black text-brand transition-all hover:translate-x-[-2px] inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    عرض التفاصيل ←
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCloseDetails}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                  >
                    إغلاق التنبيه
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReferral}
                    disabled={!referStaff}
                    className={`px-5 py-2 text-xs font-extrabold text-white rounded-xl flex items-center gap-1.5 transition-all outline-none ${
                      referStaff 
                        ? "bg-brand hover:shadow-md hover:brightness-105 cursor-pointer" 
                        : "bg-gray-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>حفظ المستجدات والإفادة</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* 5. MODAL: QUICK CHAT INTERACTIVE PANEL (المخاطبة الفورية) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {chatTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white border-2 border-[#b59410]/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#b59410] text-white p-4 flex items-center justify-between border-b border-[#a4840d]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-white text-sm">
                    {chatTarget.name.split(" ").slice(0, 2).map(w => w[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-white leading-tight">
                      مخاطبة داخلية فورية
                    </h3>
                    <p className="text-[10px] text-yellow-50 font-bold">
                      {chatTarget.name} - {chatTarget.jobTitle}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatTarget(null)}
                  className="text-yellow-100 hover:text-white transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Body - Interactive simulation context */}
              <div className="p-4 bg-slate-50 flex-1 overflow-y-auto min-h-[180px] max-h-[300px] flex flex-col justify-end text-right space-y-3">
                <div className="text-center my-1">
                  <span className="text-[8px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black font-mono">
                    تواصل آمن ومحمي ومحفوظ بنظام الدعم
                  </span>
                </div>

                {/* Received message simulation */}
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 font-black text-[9px] flex items-center justify-center shrink-0">
                    م س
                  </span>
                  <div className="bg-white border border-gray-150 p-2.5 rounded-2xl rounded-tr-none text-xs text-slate-800 leading-snug shadow-sm max-w-[80%]">
                    <p className="font-extrabold mb-0.5 text-slate-500 text-[9px]">أخصائي النظام المعاون:</p>
                    السلام عليكم، حياكم الله أستاذ باسم. نأمل العمل والتواصل بشأن المعاملات وتوصيات اللجان المعلقة بالنظام والمحالة اليوم.
                  </div>
                </div>

                {/* Sent confirmation notification */}
                {chatToast && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-[10px] font-black text-center"
                  >
                    {chatToast}
                  </motion.div>
                )}
              </div>

              {/* Message Entry footer block */}
              <div className="p-3 bg-white border-t border-gray-150 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="اكتب المعاملة أو الرسالة الداخلية الفورية هنا..."
                    className="flex-1 bg-slate-100 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-950 focus:bg-white focus:border-[#b59410] focus:ring-1 focus:ring-[#b59410] outline-none"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatMsg.trim()}
                    className={`p-2.5 rounded-xl text-white flex items-center justify-center transition-all ${
                      chatMsg.trim() 
                        ? "bg-[#b59410] hover:bg-[#a4840d] cursor-pointer" 
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center">
                  <span className="text-[8px] text-[#b59410] font-extrabold">
                    تنبيه: سيتم إشعار الموظف بالبريد وجوال العمل فور الإرسال.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}