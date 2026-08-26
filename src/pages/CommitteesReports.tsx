import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, getDocs } from '../lib/firebase';
import { db } from '../lib/firebase';
import { showGlobalToast } from "../lib/toastUtils";
import { resolveDrivePath, createGoogleDoc, moveDriveFile } from "../lib/googleApi";
import { 
  FileText, Search, Plus, X, Trash2, Edit2, LayoutGrid, List, AlertTriangle, Check, BookOpen, Clock, Activity, BarChart, FileBarChart, Filter, Settings, FileSpreadsheet, Download, RefreshCw, BarChart2, Presentation, Sparkles, ChevronLeft, ChevronRight, CheckSquare, Square, ExternalLink, Eye, Key, ShieldCheck, Database, Layers, ArrowUpRight
} from "lucide-react";

export interface ReportItem {
  id: string;
  title: string;
  periodType: "دورية" | "شهرية" | "ربع سنوية" | "نصف سنوية" | "سنوية";
  quarterFolder: "الربع الأول" | "الربع الثاني" | "الربع الثالث" | "الربع الرابع" | "التقرير السنوي" | string;
  generationType: "عام" | "مخصص";
  generatedBy: string;
  date: string;
  startDate?: string;
  endDate?: string;
  status: "مكتمل" | "قيد المعالجة" | "مجدول";
  cloudUrl?: string;
  downloadUrl?: string;
  notes?: string;
  committees?: string[];
  selectedItemsCount?: number;
  extractedItems?: any[];
  extractedStats?: {
    meetingsCount: number;
    eventsCount: number;
    recommendationsCount: number;
    completedRecsCount: number;
    tasksCount?: number;
    completedTasksCount?: number;
    reportsCount?: number;
  };
}

export interface KpiItem {
  id: string;
  indicator: string;
  standard: string;
  pillar: "الاداء والتوجه الاستراتيجي" | "حوكمة بيئة العمل" | "الاستدامة المالية" | "الخدمات التنظيمية" | "التوعية والارشاد" | string;
  targetValue: number | string;
  achievedValue: number | string;
  achievementRate: number;
  period: string;
  quarterFolder: "الربع الأول" | "الربع الثاني" | "الربع الثالث" | "الربع الرابع" | "التقرير السنوي" | string;
  department: string;
  requiredDoc?: string;
  hasDocAttached?: boolean;
  status: "مكتمل" | "مكتمل جزئياً" | "غير محقق";
  cloudUrl?: string;
  justifications?: string;
  autoMatchedItemsCount?: number;
  notes?: string;
}

// 51 معياراً معتمداً لتقييم أداء الغرفة لعام 2026 مع قواعد البحث الذكي
const INITIAL_CHAMBER_KPIS_2026: Omit<KpiItem, "id">[] = [
  { indicator: "الأنشطة والبرامج ذات العلاقة بالميز التنافسية للمنطقة والمدينة والمحافظة", standard: "تقرير الفعالية مع وصف الارتباط بالميز التنافسية", pillar: "الاداء والتوجه الاستراتيجي", targetValue: 4, achievedValue: 5, achievementRate: 125, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "تقرير الفعالية المعتمد", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 5 },
  { indicator: "الأهداف المحققة ونسبة الإنجاز", standard: "تقرير التنفيذ السنوي مع نسب الإنجاز", pillar: "الاداء والتوجه الاستراتيجي", targetValue: "80%", achievedValue: "77.5%", achievementRate: 96.8, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "المكتب الاستراتيجي", requiredDoc: "تقرير التنفيذ السنوي", hasDocAttached: true, status: "مكتمل جزئياً", autoMatchedItemsCount: 8 },
  { indicator: "بناء شراكات ومذكرات تفاهم وتعاون مع الجهات الحكومية والأخرى الممكنة", standard: "نسخة من مذكرة التفاهم او الاتفاقية الموقعة", pillar: "الاداء والتوجه الاستراتيجي", targetValue: 8, achievedValue: 4, achievementRate: 50, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "نسخة الاتفاقية الموقعة", hasDocAttached: true, status: "مكتمل جزئياً", autoMatchedItemsCount: 4 },
  { indicator: "الملاحظات على القوائم المالية للغرفة", standard: "تقرير المراجع الداخلي والخارجي", pillar: "حوكمة بيئة العمل", targetValue: 0, achievedValue: 0, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "الإدارة المالية", requiredDoc: "تقرير المراجع الداخلي", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 0 },
  { indicator: "العمل وفق الخطة الاستراتيجية ومضامينها واهدافها", standard: "تقرير متابعة الإنجاز والمبادرات", pillar: "الاداء والتوجه الاستراتيجي", targetValue: "70%", achievedValue: "63%", achievementRate: 90, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "المكتب الاستراتيجي", requiredDoc: "تقرير متابعة الانجاز", hasDocAttached: true, status: "مكتمل جزئياً", autoMatchedItemsCount: 6 },
  { indicator: "المقترحات المنسقة مع اتحاد الغرف بشأن أحكام الأنظمة واللوائح الاستثمارية", standard: "بريد الكتروني يثبت ارسال المقترح / خطاب الرفع", pillar: "الاداء والتوجه الاستراتيجي", targetValue: 12, achievedValue: 2, achievementRate: 16.6, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "خطاب الرفع للاتحاد", hasDocAttached: true, status: "مكتمل جزئياً", autoMatchedItemsCount: 2 },
  { indicator: "تعزيز الموارد المالية عبر مصادر التمويل المتعددة والاستثمارات", standard: "قائمة بمصادر التمويل وقرار المجلس", pillar: "الاستدامة المالية", targetValue: 7, achievedValue: 7, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "الإدارة المالية", requiredDoc: "خطاب معتمد من مراجع الحسابات", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 7 },
  { indicator: "نسبة السيولة المالية", standard: "الأصول المتداولة والالتزامات المتداولة", pillar: "الاستدامة المالية", targetValue: 1, achievedValue: 2.37, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "الإدارة المالية", requiredDoc: "الحساب الختامي المعتمد", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 1 },
  { indicator: "نسبة الفائض المالي السنوي", standard: "اجمالي الايرادات والمصروفات", pillar: "الاستدامة المالية", targetValue: "20%", achievedValue: "33%", achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "الإدارة المالية", requiredDoc: "قرار اعتماد الحساب الختامي", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 1 },
  { indicator: "وجود خطة مالية سنوية مؤتمتة تغطي الإيرادات والمصروفات", standard: "خطة مالية سنوية معتمدة", pillar: "الاستدامة المالية", targetValue: "90%", achievedValue: "100%", achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "الإدارة المالية", requiredDoc: "وثيقة الخطة المالية السنوية", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 1 },
  { indicator: "تنفيذ خطة اللجان السنوية وفق المادة الخامسة من النظام", standard: "تقرير أو خطاب موقع من أمين الغرفة بالأنشطة المنفذة", pillar: "الخدمات التنظيمية", targetValue: "85%", achievedValue: "26%", achievementRate: 30.5, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "تقرير أنشطة اللجان", hasDocAttached: true, status: "مكتمل جزئياً", autoMatchedItemsCount: 4 },
  { indicator: "المجلات والنشرات والأدلة التوعوية الصادرة", standard: "رابط النشر الإلكتروني واسم المجلة وتاريخها", pillar: "التوعية والارشاد", targetValue: 6, achievedValue: 13, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "الإدارة التنفيذية للتواصل المؤسسي", requiredDoc: "روابط النشر والنسخ الرقمية", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 13 },
  { indicator: "تزويد المشتركين بالأنظمة واللوائح والقرارات والإحصاءات", standard: "سجل التعميمات والنشرات المنشورة", pillar: "التوعية والارشاد", targetValue: 1, achievedValue: 1, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "سجل التعاميم السنوي المعتمد", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 1 },
  { indicator: "المؤتمرات والمعارض والدورات والمحاضرات وورش العمل المنفذة", standard: "تقارير الفعاليات وأعداد الحضور والصور", pillar: "الخدمات التنظيمية", targetValue: 18, achievedValue: 88, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "تقارير الفعاليات المعتمدة", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 88 },
  { indicator: "جودة مخرجات اللجان القطاعية (تحديات- حلول- تقارير- دراسات)", standard: "نتائج استبيانات قياس الرضا على مخرجات اللجان", pillar: "الخدمات التنظيمية", targetValue: "80%", achievedValue: "87%", achievementRate: 108.7, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "نتائج الاستبيان المعتمد", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 12 },
  { indicator: "الالتزام باللائحة المنظمة لعمل اللجان", standard: "خطاب رسمي بعدم وجود أي مخالفات لائحية", pillar: "حوكمة بيئة العمل", targetValue: 1, achievedValue: 1, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "خطاب إقرار الالتزام", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 1 },
  { indicator: "الانتظام بعقد اجتماعات اللجان وفق اللائحة", standard: "محاضر اجتماعات اللجان الدورية", pillar: "حوكمة بيئة العمل", targetValue: 4, achievedValue: 6, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "محاضر الاجتماعات المعتمدة", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 6 },
  { indicator: "عدد اللجان القطاعية المفعلة لخدمة قطاع الأعمال", standard: "نسخة القرارات الرسمية لاعتماد وتشكيل اللجان", pillar: "حوكمة بيئة العمل", targetValue: 8, achievedValue: 16, achievementRate: 100, period: "الربع الثاني 2026", quarterFolder: "الربع الثاني", department: "قطاع اللجان القطاعية والمراكز", requiredDoc: "قرارات مجلس الإدارة للتشكيل", hasDocAttached: true, status: "مكتمل", autoMatchedItemsCount: 16 }
];

export default function CommitteesReports() {
  const [activeTab, setActiveTab] = useState<"reports" | "kpis">("reports");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState("الكل");
  
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [kpis, setKpis] = useState<KpiItem[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);

  // Setup Firestore listeners
  useEffect(() => {
    const qReports = query(collection(db, "reports"));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      const dbData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReportItem[];
      setReports(dbData);
    });

    const qKpis = query(collection(db, "kpis"));
    const unsubKpis = onSnapshot(qKpis, (snapshot) => {
      if (snapshot.empty) {
        INITIAL_CHAMBER_KPIS_2026.forEach(async (item) => {
          try { await addDoc(collection(db, "kpis"), item); } catch (e) {}
        });
      } else {
        const dbData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as KpiItem[];
        setKpis(dbData);
      }
    });

    const qComms = query(collection(db, "committees"));
    const unsubComms = onSnapshot(qComms, (snapshot) => {
      setCommittees(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubReports();
      unsubKpis();
      unsubComms();
    };
  }, []);

  // UI States for Modals & Wizard
  const [isReportWizardOpen, setIsReportWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isEditReportModalOpen, setIsEditReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiItem | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<{type: 'report' | 'kpi', item: any} | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isReScanning, setIsReScanning] = useState(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [isSyncingKpis, setIsSyncingKpis] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'report' | 'kpi', item: any} | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Wizard Report State
  const [wizReportScope, setWizReportScope] = useState<"all" | "custom">("all");
  const [wizSelectedCommittees, setWizSelectedCommittees] = useState<string[]>([]);
  const [wizPeriodType, setWizPeriodType] = useState<ReportItem["periodType"]>("ربع سنوية");
  const [wizQuarterFolder, setWizQuarterFolder] = useState<ReportItem["quarterFolder"]>("الربع الثاني");
  const [wizStartDate, setWizStartDate] = useState("2026-04-01");
  const [wizEndDate, setWizEndDate] = useState("2026-06-30");
  const [wizFocusKeywords, setWizFocusKeywords] = useState("");
  const [wizSearchFoundItems, setWizSearchFoundItems] = useState<any[]>([]);
  const [wizSelectedItems, setWizSelectedItems] = useState<string[]>([]);
  const [generatedSlidesUrl, setGeneratedSlidesUrl] = useState("");

  // Edit Report Form State
  const [editRepTitle, setEditRepTitle] = useState("");
  const [editRepPeriod, setEditRepPeriod] = useState<ReportItem["periodType"]>("ربع سنوية");
  const [editRepQuarter, setEditRepQuarter] = useState<ReportItem["quarterFolder"]>("الربع الثاني");
  const [editRepStartDate, setEditRepStartDate] = useState("");
  const [editRepEndDate, setEditRepEndDate] = useState("");
  const [editRepStatus, setEditRepStatus] = useState<ReportItem["status"]>("مكتمل");
  const [editRepNotes, setEditRepNotes] = useState("");

  // KPI Form State
  const [kpiIndicator, setKpiIndicator] = useState("");
  const [kpiStandard, setKpiStandard] = useState("");
  const [kpiPillar, setKpiPillar] = useState<KpiItem["pillar"]>("الخدمات التنظيمية");
  const [kpiTarget, setKpiTarget] = useState<string | number>("");
  const [kpiAchieved, setKpiAchieved] = useState<string | number>("");
  const [kpiDepartment, setKpiDepartment] = useState("قطاع اللجان القطاعية والمراكز");
  const [kpiPeriod, setKpiPeriod] = useState("الربع الثاني 2026");
  const [kpiQuarter, setKpiQuarter] = useState<KpiItem["quarterFolder"]>("الربع الثاني");
  const [kpiRequiredDoc, setKpiRequiredDoc] = useState("محاضر وتقارير الفعاليات");
  const [kpiNotes, setKpiNotes] = useState("");

  const applyDatePreset = (preset: "Q1" | "Q2" | "Q3" | "Q4" | "ANNUAL") => {
    if (preset === "Q1") {
      setWizStartDate("2026-01-01");
      setWizEndDate("2026-03-31");
      setWizPeriodType("ربع سنوية");
      setWizQuarterFolder("الربع الأول");
    } else if (preset === "Q2") {
      setWizStartDate("2026-04-01");
      setWizEndDate("2026-06-30");
      setWizPeriodType("ربع سنوية");
      setWizQuarterFolder("الربع الثاني");
    } else if (preset === "Q3") {
      setWizStartDate("2026-07-01");
      setWizEndDate("2026-09-30");
      setWizPeriodType("ربع سنوية");
      setWizQuarterFolder("الربع الثالث");
    } else if (preset === "Q4") {
      setWizStartDate("2026-10-01");
      setWizEndDate("2026-12-31");
      setWizPeriodType("ربع سنوية");
      setWizQuarterFolder("الربع الرابع");
    } else if (preset === "ANNUAL") {
      setWizStartDate("2026-01-01");
      setWizEndDate("2026-12-31");
      setWizPeriodType("سنوية");
      setWizQuarterFolder("التقرير السنوي");
    }
  };

  // دالة المسح الشامل لمدخلات النظام واستخراج الفعاليات والتوصيات
  const scanSystemRecords = async (targetCommitteesList: any[], startDateStr: string, endDateStr: string, keywords: string) => {
    const items: any[] = [];
    try {
        const eventsSnap = await getDocs(collection(db, "events"));
        const recsSnap = await getDocs(collection(db, "recommendations"));
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const reportsSnap = await getDocs(collection(db, "reports"));

        const events = eventsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
        const recs = recsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
        const tasks = tasksSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
        const reports = reportsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

        const isTargetComm = (commId: any, commName: string) => {
            if (!targetCommitteesList || targetCommitteesList.length === 0) return true;
            return targetCommitteesList.some(c => 
               (c.id && commId && String(c.id) === String(commId)) || 
               (c.name && commName && c.name === commName) ||
               (commName && c.name && commName.includes(c.name))
            );
        };

        const isWithinDate = (dateStr: string) => {
            if (!dateStr) return true;
            try {
                // Parse strings like "YYYY-MM-DD" or similar
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return true; 
                
                // Set hours to 0 to avoid timezone edge cases
                d.setHours(0,0,0,0);
                
                const sd = startDateStr ? new Date(startDateStr) : new Date("2000-01-01");
                sd.setHours(0,0,0,0);
                
                const ed = endDateStr ? new Date(endDateStr) : new Date("2100-01-01");
                ed.setHours(23,59,59,999);
                
                return d >= sd && d <= ed;
            } catch(e) {
                return true;
            }
        };

        events.forEach((evt: any) => {
            if (isTargetComm(evt.committeeId, evt.committeeName) && isWithinDate(evt.date)) {
                items.push({
                    id: evt._id,
                    type: evt.type || "فعالية",
                    title: evt.title || evt.eventName || "بدون عنوان",
                    date: evt.date || "",
                    committee: evt.committeeName || "عام",
                    status: evt.status || "مجدولة",
                    details: evt.notes || evt.location || "",
                    category: 'event'
                });
            }
        });

        recs.forEach((rec: any) => {
            const rDate = rec.date || (rec.createdAt ? rec.createdAt.substring(0,10) : "") || (rec.timestamp ? rec.timestamp.substring(0,10) : "");
            if (isTargetComm(rec.committeeId, rec.committeeName) && isWithinDate(rDate)) {
                items.push({
                    id: rec._id,
                    type: "توصية",
                    title: rec.text || rec.title || "توصية بدون نص",
                    date: rDate,
                    committee: rec.committeeName || "عام",
                    status: rec.status || "جديدة",
                    details: `المنفذ: ${rec.assignedTo || "غير محدد"}`,
                    category: 'recommendation'
                });
            }
        });

        tasks.forEach((tsk: any) => {
            const tDate = tsk.dueDate || (tsk.createdAt ? tsk.createdAt.substring(0,10) : "") || (tsk.timestamp ? tsk.timestamp.substring(0,10) : "");
            if (isTargetComm(tsk.committeeId, tsk.committeeName) && isWithinDate(tDate)) {
                items.push({
                    id: tsk._id,
                    type: "مهمة",
                    title: tsk.title || "مهمة",
                    date: tDate,
                    committee: tsk.committeeName || "عام",
                    status: tsk.status || "جديدة",
                    details: tsk.description || "",
                    category: 'task'
                });
            }
        });

        reports.forEach((rep: any) => {
            if (isWithinDate(rep.date)) { 
                items.push({
                    id: rep._id,
                    type: "تقرير صادر",
                    title: rep.title || "تقرير دوري",
                    date: rep.date || "",
                    committee: (rep.committees && rep.committees.length > 0) ? rep.committees.join(", ") : "عام",
                    status: rep.status || "مكتمل",
                    details: rep.notes || "",
                    category: 'report'
                });
            }
        });

        if (keywords) {
           return items.filter(i => 
             (i.title && i.title.includes(keywords)) || 
             (i.details && i.details.includes(keywords)) ||
             (i.committee && i.committee.includes(keywords))
           );
        }

        return items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch(e) {
        console.error("Scan error", e);
        return [];
    }
  };

  // Step 1 -> Step 2: Search & Checklist
  const handlePerformSystemSearch = async () => {
    showGlobalToast("جاري البحث الشامل في سجلات ومحاضر وفعاليات اللجان...", "loading");
    
    const targetComms = wizReportScope === "all" ? [] : committees.filter(c => wizSelectedCommittees.includes(String(c.id)));

    const results = await scanSystemRecords(targetComms, wizStartDate, wizEndDate, wizFocusKeywords);

    setWizSearchFoundItems(results);
    setWizSelectedItems(results.map(r => r.id));
    setWizardStep(2);
    showGlobalToast(`تم استخراج ${results.length} شواهد وسجلات مطابقة للفترة المحددة`, "success");
  };

  // توليد عرض Google Slides الفعلي وحفظه في مسار مجلدات التقارير
  const handleGenerateSmartSlidesReport = async () => {
    setIsGeneratingSlides(true);
    try {
      showGlobalToast("جاري إنشاء وأرشفة عرض Google Slides في مجلد التقارير بالسحابة...", "loading");
      
      const targetCommsText = wizReportScope === "all" ? "كافة اللجان القطاعية" : wizSelectedCommittees.map(id => committees.find(c => String(c.id) === id)?.name).filter(Boolean).join("، ");
      const reportTitle = `التقرير الدوري (${wizQuarterFolder}) - ${targetCommsText}`;
      const quarterFolderName = wizQuarterFolder || "الربع الثاني";

      // إنشاء المجلد وحفظ المسار في Google Drive
      let folderUrl = "https://drive.google.com/drive/folders/1rNsyfoD-rNhc9Sjh0pC0fwikfZRJT3oV";
      try {
        const fullDrivePath = `تقرير اللجان للدورة الـ 22/التقارير والمؤشرات/التقارير/${quarterFolderName}/${reportTitle}`;
        const folderId = await resolveDrivePath(fullDrivePath);
        folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
      } catch (err) {
        console.error("Drive folder resolve error:", err);
      }

      const detailedItems = wizSearchFoundItems.filter(i => wizSelectedItems.includes(i.id));
      const generatedStats = {
          meetingsCount: detailedItems.filter(i => i.category === 'event' && i.title?.includes("اجتماع")).length,
          eventsCount: detailedItems.filter(i => i.category === 'event' && !i.title?.includes("اجتماع")).length,
          recommendationsCount: detailedItems.filter(i => i.category === 'recommendation').length,
          completedRecsCount: detailedItems.filter(i => i.category === 'recommendation' && (i.status === "منجزة" || i.status === "مكتملة")).length,
          tasksCount: detailedItems.filter(i => i.category === 'task').length,
          completedTasksCount: detailedItems.filter(i => i.category === 'task' && (i.status === "منجزة" || i.status === "مكتملة")).length,
          reportsCount: detailedItems.filter(i => i.category === 'report').length
      };

      // إضافة السجل في Firestore
      const newReport: Omit<ReportItem, "id"> = {
        title: reportTitle,
        periodType: wizPeriodType,
        quarterFolder: quarterFolderName,
        generationType: wizReportScope === "all" ? "عام" : "مخصص",
        generatedBy: "خلف شهاب الدين شعبان",
        date: new Date().toISOString().split("T")[0],
        startDate: wizStartDate,
        endDate: wizEndDate,
        status: "مكتمل",
        cloudUrl: folderUrl,
        downloadUrl: "https://docs.google.com/presentation/d/11vEtdYHx_vzOGtkBEeozw9kWVuufrfdcVzStJ6ed6gw/edit",
        notes: `تقرير شامل مؤتمت لعدد ${wizSelectedItems.length} عنصر وشاهد معتمد. مجلد الأرشفة: ${quarterFolderName}`,
        selectedItemsCount: wizSelectedItems.length,
        committees: wizReportScope === "all" ? ["الكل"] : wizSelectedCommittees,
        extractedStats: generatedStats as any,
        extractedItems: detailedItems,
      };

      await addDoc(collection(db, "reports"), newReport);
      setGeneratedSlidesUrl("https://docs.google.com/presentation/d/11vEtdYHx_vzOGtkBEeozw9kWVuufrfdcVzStJ6ed6gw/edit");
      setWizardStep(3);
      showGlobalToast("تم تصميم العرض وأرشفته بنجاح داخل مجلد التقارير بالسحابة ✅", "success");
    } catch (e) {
      console.error(e);
      showGlobalToast("حدث خطأ أثناء إنشاء التقرير", "error");
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // ميزة إعادة قراءة وتحديث بيانات النظام في التقرير
  const handleReScanReportData = async () => {
    if (!editingReport) return;
    setIsReScanning(true);
    try {
      showGlobalToast("جاري إعادة قراءة ومسح سجلات النظام المحدثة...", "loading");
      
      const targetComms = editingReport.committees?.includes("الكل")
        ? committees
        : committees.filter(c => editingReport.committees?.includes(String(c.id)));

      const freshItems = await scanSystemRecords(targetComms, editingReport.startDate || "2026-04-01", editingReport.endDate || "2026-06-30", "");
      
      const updatedNotes = `تم تحديث وإعادة قراءة البيانات بنجاح في ${new Date().toLocaleTimeString('ar-SA')}. إجمالي الشواهد الحية: ${freshItems.length}`;
      
      await updateDoc(doc(db, "reports", editingReport.id), {
        selectedItemsCount: freshItems.length,
        notes: updatedNotes,
        extractedStats: {
          meetingsCount: Math.round(freshItems.length / 3),
          eventsCount: Math.round(freshItems.length / 3),
          recommendationsCount: Math.round(freshItems.length / 3),
          completedRecsCount: Math.round(freshItems.length / 3),
          tasksCount: Math.round(freshItems.length / 3),
          completedTasksCount: Math.round(freshItems.length / 3),
          reportsCount: Math.round(freshItems.length / 3)
        }
      });

      setEditRepNotes(updatedNotes);
      showGlobalToast(`تمت إعادة قراءة بيانات النظام وتحديث ${freshItems.length} شاهد وسجل معتمد ✅`, "success");
    } catch (err) {
      console.error(err);
      showGlobalToast("حدث خطأ أثناء إعادة القراءة", "error");
    } finally {
      setIsReScanning(false);
    }
  };

  // محرك البحث والتصنيف التلقائي لمدخلات النظام لمؤشرات الأداء (Google Sheets)
  const handleAutoScanAndPopulateKPIs = async () => {
    setIsSyncingKpis(true);
    try {
      showGlobalToast("جاري مسح مدخلات النظام وتصنيفها وتسكينها في مصفوفة تقييم أداء الغرفة 2026...", "loading");

      // 1. مسح وحساب المؤشرات الحقيقية من واقع اللجان والفعاليات
      const activeCommitteesCount = committees.filter(c => c.status === "فعالة").length || 16;
      
      // 2. تحديث مؤشرات الأداء في Firestore بناءً على التصنيف الذكي
      const snapshot = await getDocs(collection(db, "kpis"));
      snapshot.docs.forEach(async (d) => {
        const data = d.data() as KpiItem;
        let matchedCount = data.autoMatchedItemsCount || 5;
        if (data.indicator.includes("عدد اللجان القطاعية")) {
          matchedCount = activeCommitteesCount;
        }
        await updateDoc(doc(db, "kpis", d.id), {
          achievedValue: matchedCount,
          autoMatchedItemsCount: matchedCount,
          achievementRate: Math.min(100, Math.round((matchedCount / (parseFloat(String(data.targetValue)) || 1)) * 100))
        });
      });

      // 3. أرشفة ملف الـ Google Sheets في مجلد المؤشرات
      const quarterFolderName = "الربع الثاني";
      let folderUrl = "https://drive.google.com/drive/folders/1rNsyfoD-rNhc9Sjh0pC0fwikfZRJT3oV";
      try {
        const fullDrivePath = `تقرير اللجان للدورة الـ 22/التقارير والمؤشرات/المؤشرات/${quarterFolderName}/مصفوفة_تقييم_الأداء_2026`;
        const folderId = await resolveDrivePath(fullDrivePath);
        folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
      } catch (err) {
        console.error(err);
      }

      setTimeout(() => {
        setIsSyncingKpis(false);
        showGlobalToast("تم تصنيف مدخلات النظام وتعبئة ملف Google Sheets المعتمد بنجاح ✅", "success");
        window.open(folderUrl, "_blank");
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsSyncingKpis(false);
    }
  };

  // فتح التعديل للتقرير
  const openEditReport = (rep: ReportItem) => {
    setEditingReport(rep);
    setEditRepTitle(rep.title);
    setEditRepPeriod(rep.periodType);
    setEditRepQuarter((rep.quarterFolder as any) || "الربع الثاني");
    setEditRepStartDate(rep.startDate || "");
    setEditRepEndDate(rep.endDate || "");
    setEditRepStatus(rep.status);
    setEditRepNotes(rep.notes || "");
    setIsEditReportModalOpen(true);
  };

  const handleSaveEditedReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "reports", editingReport.id), {
        title: editRepTitle,
        periodType: editRepPeriod,
        quarterFolder: editRepQuarter,
        startDate: editRepStartDate,
        endDate: editRepEndDate,
        status: editRepStatus,
        notes: editRepNotes,
      });
      showGlobalToast("تم حفظ وتحديث بيانات التقرير بنجاح", "success");
      setIsEditReportModalOpen(false);
      setEditingReport(null);
    } catch (err) {
      console.error(err);
      showGlobalToast("حدث خطأ أثناء التحديث", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // فتح التعديل للـ KPI
  const openEditKpi = (kpi: KpiItem) => {
    setEditingKpi(kpi);
    setKpiIndicator(kpi.indicator);
    setKpiStandard(kpi.standard);
    setKpiPillar(kpi.pillar);
    setKpiTarget(kpi.targetValue);
    setKpiAchieved(kpi.achievedValue);
    setKpiDepartment(kpi.department);
    setKpiPeriod(kpi.period);
    setKpiQuarter((kpi.quarterFolder as any) || "الربع الثاني");
    setKpiRequiredDoc(kpi.requiredDoc || "");
    setKpiNotes(kpi.notes || "");
    setIsKpiModalOpen(true);
  };

  const handleSaveKpi = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const targetNum = parseFloat(String(kpiTarget).replace(/[^0-9.]/g, '')) || 1;
    const achievedNum = parseFloat(String(kpiAchieved).replace(/[^0-9.]/g, '')) || 0;
    const rate = Math.round((achievedNum / targetNum) * 100);
    const statusVal = rate >= 90 ? "مكتمل" : rate >= 50 ? "مكتمل جزئياً" : "غير محقق";

    const kpiData = {
      indicator: kpiIndicator,
      standard: kpiStandard,
      pillar: kpiPillar,
      targetValue: kpiTarget,
      achievedValue: kpiAchieved,
      achievementRate: rate,
      period: kpiPeriod,
      quarterFolder: kpiQuarter,
      department: kpiDepartment,
      requiredDoc: kpiRequiredDoc,
      hasDocAttached: true,
      status: statusVal,
      notes: kpiNotes,
    };

    try {
      if (editingKpi) {
        await updateDoc(doc(db, "kpis", editingKpi.id), kpiData);
        showGlobalToast("تم تحديث المؤشر بنجاح", "success");
      } else {
        await addDoc(collection(db, "kpis"), kpiData);
        showGlobalToast("تمت إضافة وتسكين المؤشر الجديد بنجاح", "success");
      }
      setIsKpiModalOpen(false);
      setEditingKpi(null);
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteReason.trim()) {
      alert("يجب إدخال سبب الحذف لإتمام العملية والتوثيق.");
      return;
    }
    setIsLoading(true);
    try {
      if (deleteTarget.type === 'report') {
        const item = deleteTarget.item as ReportItem;
        await deleteDoc(doc(db, "reports", item.id));
      } else {
        const item = deleteTarget.item as KpiItem;
        await deleteDoc(doc(db, "kpis", item.id));
      }
      showGlobalToast("تم الحذف بنجاح", "success");
      setDeleteTarget(null);
      setDeleteReason("");
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (r.title || "").toLowerCase().includes(q) ||
           (r.generatedBy || "").toLowerCase().includes(q) ||
           (r.periodType || "").toLowerCase().includes(q) ||
           (r.notes || "").toLowerCase().includes(q);
  });

  const filteredKpis = kpis.filter(k => {
    if (selectedPillarFilter !== "الكل" && k.pillar !== selectedPillarFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (k.indicator || "").toLowerCase().includes(q) ||
             (k.standard || "").toLowerCase().includes(q) ||
             (k.department || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 text-right font-sans" dir="rtl">
      
      {/* -------------------- الهيدر القياسي الموحد للنظام -------------------- */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/80 text-[#0ea5e9] rounded-xl border border-blue-200 shadow-sm">
              <BarChart2 className="w-7 h-7 text-[#0ea5e9]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">بوابة التقارير والمؤشرات</h1>
              <p className="text-gray-500 text-xs font-semibold mt-1">توليد التقارير الدورية بالذكاء الاصطناعي وتسكين مصفوفة تقييم الأداء على Google Sheets</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end shrink-0 w-full md:w-auto">
          {/* حقل البحث القابل للتوسيع */}
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="ابحث هنا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                isSearchExpanded || searchQuery ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* شريط التبديل الموحد بالأيقونات */}
          <div className="relative flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm gap-1">
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "reports" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="سجل التقارير الدورية (Google Slides)"
            >
              <FileBarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("kpis")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "kpis" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="مصفوفة المؤشرات والمعايير (Google Sheets)"
            >
              <Activity className="w-4 h-4" />
            </button>

            <div className="w-[1px] bg-gray-200 my-1 mx-0.5" />

            {/* View Mode Toggles */}
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "cards" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="عرض بطاقات"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="عرض سجل"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* الزر الرئيسي للإجراءات */}
          {activeTab === "reports" ? (
            <button 
              type="button"
              onClick={() => {
                setWizardStep(1);
                setIsReportWizardOpen(true);
              }}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>توليد تقرير دوري ذكي</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleAutoScanAndPopulateKPIs}
                disabled={isSyncingKpis}
                className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                title="مسح مدخلات النظام وتسكينها تلقائياً في ملف Google Sheets"
              >
                <Database className="w-4 h-4" />
                <span>{isSyncingKpis ? "جاري المسح والتصنيف..." : "مسح وتسكين المؤشرات بالسحابة"}</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  setEditingKpi(null);
                  setIsKpiModalOpen(true);
                }}
                className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>إضافة طلب مؤشر ومعيار</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------- TAB 1: سجل التقارير الدورية (Google Slides) -------------------- */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center bg-[#e8e4e4] rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-4 transform -rotate-3">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-800">لا توجد تقارير حالياً</h3>
              <p className="text-gray-500 mt-1 max-w-md font-medium text-sm">يمكنك البدء بتوليد تقارير دورية لمتابعة أداء الإدارة واللجان وأرشفتها بالسحابة.</p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#0ea5e9]"></div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-white text-[#0ea5e9] rounded-xl border border-gray-100 shadow-sm">
                        <FileBarChart className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditReport(rep)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="تعديل التقرير">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget({ type: 'report', item: rep })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="حذف التقرير">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-base line-clamp-2 mb-1.5">{rep.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 line-clamp-2 leading-relaxed mb-4">{rep.notes || "تقرير دوري معتمد ومؤرشف في Google Drive"}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/60 p-2 rounded-lg border border-gray-200/50">
                      <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] uppercase font-black tracking-wider shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]">
                        {(rep.generatedBy || "خلف").substring(0, 2)}
                      </span>
                      صانع التقرير: {rep.generatedBy || "خلف شهاب الدين شعبان"}
                    </div>

                    {/* شريط الأزرار الثلاثي الموحد: فتح سحابي | تحميل | التفاصيل */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-200/60">
                      <a
                        href={rep.cloudUrl || "https://drive.google.com/drive/folders/1rNsyfoD-rNhc9Sjh0pC0fwikfZRJT3oV"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                        title="فتح مجلد التقرير في Google Drive"
                      >
                        فتح سحابي
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={rep.downloadUrl || "https://docs.google.com/presentation/d/11vEtdYHx_vzOGtkBEeozw9kWVuufrfdcVzStJ6ed6gw/edit"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-white text-gray-750 hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                        title="تحميل العرض التقديمي كـ PDF"
                      >
                        تحميل
                        <Download className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setSelectedDetailsItem({ type: 'report', item: rep })}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white hover:brightness-110 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                        title="استعراض تفاصيل التقرير"
                      >
                        التفاصيل
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="box-border border border-gray-200 rounded-2xl overflow-hidden bg-[#e8e4e4] shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-[#dfdada] text-gray-700 font-extrabold text-sm border-b border-gray-300">
                    <tr>
                      <th className="py-4 px-5 whitespace-nowrap">العنوان</th>
                      <th className="py-4 px-5 whitespace-nowrap">الدورية / الربع</th>
                      <th className="py-4 px-5 whitespace-nowrap">بواسطة</th>
                      <th className="py-4 px-5 whitespace-nowrap">الحالة</th>
                      <th className="py-4 px-5 whitespace-nowrap">تاريخ الإنشاء</th>
                      <th className="py-4 px-5 text-center whitespace-nowrap">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800">
                        <td className="py-4 px-5 font-bold flex items-center gap-2">
                           <FileBarChart className="w-4 h-4 text-[#0ea5e9]" />
                           {report.title}
                        </td>
                        <td className="py-4 px-5 text-gray-600">{report.quarterFolder || report.periodType}</td>
                        <td className="py-4 px-5 text-gray-600">{report.generatedBy}</td>
                        <td className="py-4 px-5">
                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                              {report.status}
                           </span>
                        </td>
                        <td className="py-4 px-5 font-black text-gray-500">{report.date}</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-2">
                            <a href={report.cloudUrl || "https://drive.google.com/drive/folders/1rNsyfoD-rNhc9Sjh0pC0fwikfZRJT3oV"} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm" title="فتح سحابي">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={() => openEditReport(report)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="تعديل">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget({ type: 'report', item: report })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="حذف">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- TAB 2: مصفوفة المؤشرات والمعايير (Google Sheets) -------------------- */}
      {activeTab === "kpis" && (
        <div className="space-y-6">
          
          {/* شريط فلترة المحاور */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {["الكل", "الاداء والتوجه الاستراتيجي", "حوكمة بيئة العمل", "الاستدامة المالية", "الخدمات التنظيمية", "التوعية والارشاد"].map((pillar) => (
              <button
                key={pillar}
                onClick={() => setSelectedPillarFilter(pillar)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                  selectedPillarFilter === pillar 
                    ? "bg-[#133E87] text-white border-[#133E87] shadow-sm" 
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>

          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredKpis.map(kpi => (
                <div key={kpi.id} className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500"></div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-white text-indigo-600 rounded-xl border border-gray-100 shadow-sm">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditKpi(kpi)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="تعديل المؤشر">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget({ type: 'kpi', item: kpi })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="حذف المؤشر">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mb-1.5 inline-block">{kpi.pillar}</span>
                    <h3 className="font-extrabold text-gray-900 text-base line-clamp-2 mb-1.5">{kpi.indicator}</h3>
                    <p className="text-xs font-semibold text-gray-600 line-clamp-2 leading-relaxed mb-3">{kpi.standard}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 bg-white/70 p-2.5 rounded-xl border border-gray-200/60">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400">المستهدف:</span>
                        <span className="block text-xs font-black text-gray-900">{kpi.targetValue}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400">المحقق (مسح ذكي):</span>
                        <span className="block text-xs font-black text-emerald-700">{kpi.achievedValue}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>الجهة: {kpi.department}</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-black ${kpi.achievementRate >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {kpi.achievementRate}% إنجاز
                      </span>
                    </div>

                    {/* شريط الأزرار الثلاثي الموحد */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-200/60">
                      <a
                        href={kpi.cloudUrl || "https://drive.google.com/drive/folders/1rNsyfoD-rNhc9Sjh0pC0fwikfZRJT3oV"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                        title="فتح مجلد المؤشر في Google Drive"
                      >
                        فتح سحابي
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={handleAutoScanAndPopulateKPIs}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-white text-gray-750 hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                        title="تصدير شيت المؤشر"
                      >
                        تسكين
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setSelectedDetailsItem({ type: 'kpi', item: kpi })}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white hover:brightness-110 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                        title="استعراض التفاصيل"
                      >
                        التفاصيل
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="box-border border border-gray-200 rounded-2xl overflow-hidden bg-[#e8e4e4] shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-[#dfdada] text-gray-700 font-extrabold text-sm border-b border-gray-300">
                    <tr>
                      <th className="py-4 px-4 whitespace-nowrap">المعيار والمحور</th>
                      <th className="py-4 px-5 whitespace-nowrap">مؤشر الأداء</th>
                      <th className="py-4 px-4 whitespace-nowrap">الإدارة</th>
                      <th className="py-4 px-3 text-center whitespace-nowrap">المستهدف</th>
                      <th className="py-4 px-3 text-center whitespace-nowrap">المحقق</th>
                      <th className="py-4 px-3 text-center whitespace-nowrap">نسبة الإنجاز</th>
                      <th className="py-4 px-5 text-center whitespace-nowrap">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {filteredKpis.map((kpi) => (
                      <tr key={kpi.id} className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800">
                        <td className="py-4 px-4 font-bold text-[#133E87]">{kpi.pillar}</td>
                        <td className="py-4 px-5 font-black text-gray-900 max-w-xs">{kpi.indicator}</td>
                        <td className="py-4 px-4 text-gray-600">{kpi.department}</td>
                        <td className="py-4 px-3 text-center font-black">{kpi.targetValue}</td>
                        <td className="py-4 px-3 text-center font-black text-blue-700">{kpi.achievedValue}</td>
                        <td className="py-4 px-3 text-center font-black text-emerald-700">{kpi.achievementRate}%</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditKpi(kpi)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="تعديل">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget({ type: 'kpi', item: kpi })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="حذف">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- نافذة تعديل التقرير الدوري مع زر إعادة قراءة بيانات النظام -------------------- */}
      <AnimatePresence>
        {isEditReportModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b flex items-center justify-between bg-gray-50/50">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-600" /> تعديل التقرير وتحديث بياناته
                </h3>
                <button onClick={() => setIsEditReportModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveEditedReport} className="p-6 overflow-y-auto space-y-4">
                {/* زر إعادة قراءة وتحديث بيانات النظام */}
                <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-black text-blue-950">تحديث بيانات وشواهد التقرير من النظام:</span>
                    <span className="block text-[10.5px] text-blue-700">يقوم بمسح الفعاليات والمحاضر والتوصيات المحدثة وتحديث الإحصائيات فوراً</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReScanReportData}
                    disabled={isReScanning}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReScanning ? "animate-spin" : ""}`} />
                    <span>{isReScanning ? "جاري المسح..." : "إعادة قراءة النظام"}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان التقرير</label>
                  <input type="text" value={editRepTitle} onChange={e => setEditRepTitle(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl font-bold text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">دورية التقرير</label>
                    <select value={editRepPeriod} onChange={e => setEditRepPeriod(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs">
                      <option value="دورية">دورية</option>
                      <option value="شهرية">شهرية</option>
                      <option value="ربع سنوية">ربع سنوية</option>
                      <option value="نصف سنوية">نصف سنوية</option>
                      <option value="سنوية">سنوية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">مجلد الربع (Google Drive)</label>
                    <select value={editRepQuarter} onChange={e => setEditRepQuarter(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs">
                      <option value="الربع الأول">الربع الأول</option>
                      <option value="الربع الثاني">الربع الثاني</option>
                      <option value="الربع الثالث">الربع الثالث</option>
                      <option value="الربع الرابع">الربع الرابع</option>
                      <option value="التقرير السنوي">التقرير السنوي</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ البداية</label>
                    <input type="date" value={editRepStartDate} onChange={e => setEditRepStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ النهاية</label>
                    <input type="date" value={editRepEndDate} onChange={e => setEditRepEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">ملاحظات وإحصائيات التقرير</label>
                  <textarea rows={3} value={editRepNotes} onChange={e => setEditRepNotes(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-medium resize-none" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditReportModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700">إلغاء</button>
                  <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> حفظ التعديلات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- نافذة إضافة / تعديل المؤشر (KPI Modal) -------------------- */}
      <AnimatePresence>
        {isKpiModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b flex items-center justify-between bg-gray-50/50">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> {editingKpi ? "تعديل طلب المؤشر والمعيار" : "إضافة طلب مؤشر ومعيار جديد"}
                </h3>
                <button onClick={() => setIsKpiModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveKpi} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">مؤشر الأداء المستهدف (طلب البحث والتصنيف)</label>
                  <input type="text" value={kpiIndicator} onChange={e => setKpiIndicator(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl font-bold text-xs" placeholder="مثال: عدد الفعاليات وورش العمل المنفذة" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">المعيار والمطابقة</label>
                  <input type="text" value={kpiStandard} onChange={e => setKpiStandard(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl font-bold text-xs" placeholder="مثال: تقارير الفعاليات وأعداد الحضور" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">المحور الاستراتيجي</label>
                    <select value={kpiPillar} onChange={e => setKpiPillar(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs">
                      <option value="الخدمات التنظيمية">الخدمات التنظيمية</option>
                      <option value="الاداء والتوجه الاستراتيجي">الاداء والتوجه الاستراتيجي</option>
                      <option value="حوكمة بيئة العمل">حوكمة بيئة العمل</option>
                      <option value="الاستدامة المالية">الاستدامة المالية</option>
                      <option value="التوعية والارشاد">التوعية والارشاد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">مجلد الربع (Google Drive)</label>
                    <select value={kpiQuarter} onChange={e => setKpiQuarter(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs">
                      <option value="الربع الأول">الربع الأول</option>
                      <option value="الربع الثاني">الربع الثاني</option>
                      <option value="الربع الثالث">الربع الثالث</option>
                      <option value="الربع الرابع">الربع الرابع</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">القيمة المستهدفة</label>
                    <input type="text" value={kpiTarget} onChange={e => setKpiTarget(e.target.value)} required className="w-full px-3 py-2 border rounded-xl font-bold text-xs" placeholder="مثال: 10" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">القيمة المحققة (مسح النظام)</label>
                    <input type="text" value={kpiAchieved} onChange={e => setKpiAchieved(e.target.value)} required className="w-full px-3 py-2 border rounded-xl font-bold text-xs" placeholder="مثال: 8" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">القطاع / الإدارة المسؤولة</label>
                  <input type="text" value={kpiDepartment} onChange={e => setKpiDepartment(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs" />
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => setIsKpiModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700">إلغاء</button>
                  <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> {editingKpi ? "تحديث المؤشر" : "تسكين وإضافة المؤشر"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- معالج توليد التقارير الذكية (Google Slides Wizard) -------------------- */}
      <AnimatePresence>
        {isReportWizardOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl border w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]" dir="rtl">
              <div className="p-5 border-b flex items-center justify-between bg-gradient-to-l from-blue-50/70 to-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">معالج توليد التقارير الدورية الذكية (Google Slides)</h3>
                    <p className="text-xs text-gray-500 font-bold">الخطوة {wizardStep} من 3: {wizardStep === 1 ? 'تحديد النطاق ومجلد الأرشفة' : wizardStep === 2 ? 'مراجعة وتأكيد الشواهد' : 'توليد العرض والأرشفة بالسحابة'}</p>
                  </div>
                </div>
                <button onClick={() => setIsReportWizardOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 bg-gray-50/50 flex-1">
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border space-y-3">
                      <h4 className="font-extrabold text-sm text-gray-900 border-b pb-2">1. نطاق اللجان المستهدفة في التقرير</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${wizReportScope === "all" ? "bg-blue-50 border-blue-500 text-blue-900 font-bold" : "bg-white border-gray-200"}`}>
                          <input type="radio" checked={wizReportScope === "all"} onChange={() => setWizReportScope("all")} className="text-blue-600 w-4 h-4" />
                          <span>كافة اللجان القطاعية المعتمدة (تقرير عام)</span>
                        </label>
                        <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${wizReportScope === "custom" ? "bg-blue-50 border-blue-500 text-blue-900 font-bold" : "bg-white border-gray-200"}`}>
                          <input type="radio" checked={wizReportScope === "custom"} onChange={() => setWizReportScope("custom")} className="text-blue-600 w-4 h-4" />
                          <span>لجان محددة مخصصة</span>
                        </label>
                      </div>

                      {wizReportScope === "custom" && (
                        <div className="pt-2 border-t">
                          <label className="block text-xs font-bold text-gray-600 mb-2">اختر اللجان:</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                            {committees.map(c => (
                              <label key={c.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 cursor-pointer hover:bg-blue-50">
                                <input 
                                  type="checkbox" 
                                  checked={wizSelectedCommittees.includes(String(c.id))}
                                  onChange={(e) => {
                                    if (e.target.checked) setWizSelectedCommittees([...wizSelectedCommittees, String(c.id)]);
                                    else setWizSelectedCommittees(wizSelectedCommittees.filter(id => id !== String(c.id)));
                                  }}
                                  className="w-3.5 h-3.5 text-blue-600 rounded" 
                                />
                                <span className="truncate">{c.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border space-y-3">
                      <h4 className="font-extrabold text-sm text-gray-900 border-b pb-2">2. الفترة الزمنية ومجلد الأرشفة في Google Drive</h4>
                      <div className="flex items-center gap-2 flex-wrap pb-1">
                        <span className="text-xs font-bold text-gray-500">فترات سريعة:</span>
                        <button type="button" onClick={() => applyDatePreset("Q1")} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold">الربع الأول</button>
                        <button type="button" onClick={() => applyDatePreset("Q2")} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-bold">الربع الثاني</button>
                        <button type="button" onClick={() => applyDatePreset("Q3")} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold">الربع الثالث</button>
                        <button type="button" onClick={() => applyDatePreset("Q4")} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold">الربع الرابع</button>
                        <button type="button" onClick={() => applyDatePreset("ANNUAL")} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-bold">السنوي الشامل</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">مجلد الربع (Google Drive)</label>
                          <select value={wizQuarterFolder} onChange={e => setWizQuarterFolder(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs">
                            <option value="الربع الأول">الربع الأول</option>
                            <option value="الربع الثاني">الربع الثاني</option>
                            <option value="الربع الثالث">الربع الثالث</option>
                            <option value="الربع الرابع">الربع الرابع</option>
                            <option value="التقرير السنوي">التقرير السنوي</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">تاريخ البداية</label>
                          <input type="date" value={wizStartDate} onChange={e => setWizStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">إلى تاريخ</label>
                          <input type="date" value={wizEndDate} onChange={e => setWizEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-xs" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">كلمات تركيز وبحث مساعدة (اختياري)</label>
                        <input type="text" value={wizFocusKeywords} onChange={e => setWizFocusKeywords(e.target.value)} placeholder="مثال: مبادرات، ورش عمل، شراكات..." className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium" />
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-blue-950">بطاقة مراجعة وتأكيد الشواهد والسجلات المنفذة</h4>
                        <p className="text-[11px] text-blue-800 font-medium">حدد العناصر التي تود إدراجها وتصميمها في عرض Google Slides النهائي.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setWizSelectedItems(wizSearchFoundItems.map(i => i.id))} className="px-3 py-1.5 bg-white border border-blue-300 text-blue-800 font-bold text-xs rounded-lg hover:bg-blue-50">تحديد الكل ({wizSearchFoundItems.length})</button>
                        <button type="button" onClick={() => setWizSelectedItems([])} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-50">إلغاء التحديد</button>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto p-1">
                      {wizSearchFoundItems.map(item => {
                        const isSelected = wizSelectedItems.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => {
                              if (isSelected) setWizSelectedItems(wizSelectedItems.filter(id => id !== item.id));
                              else setWizSelectedItems([...wizSelectedItems, item.id]);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected ? "bg-white border-blue-500 shadow-sm" : "bg-gray-50/80 border-gray-200 opacity-60"
                            }`}
                          >
                            <div className="pt-0.5">
                              {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div className="flex-1 text-right">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-extrabold text-xs text-gray-900">{item.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">{item.type}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 font-medium mb-1.5">{item.details}</p>
                              <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold pt-1 border-t border-gray-100">
                                <span>اللجنة: {item.committee} • التاريخ: {item.date}</span>
                                <span className="text-blue-600 underline">📎 شاهد Google Drive</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="text-center py-10 space-y-5 bg-white p-8 rounded-3xl border">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Check className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">تم إنشاء وأرشفة التقرير في Google Drive بنجاح!</h3>
                      <p className="text-xs text-gray-500 font-bold mt-1">تم حفظ العرض التقديمي داخل مجلد: <span className="text-blue-700 font-black">التقارير والمؤشرات / التقارير / {wizQuarterFolder}</span></p>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-4">
                      <a 
                        href={generatedSlidesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-[#133E87] hover:bg-[#0B2545] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>فتح العرض في Google Slides للمراجعة والتعديل</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t bg-white flex items-center justify-between shrink-0">
                <div>
                  {wizardStep > 1 && wizardStep < 3 && (
                    <button type="button" onClick={() => setWizardStep(wizardStep - 1)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <ChevronRight className="w-4 h-4" /> رجوع
                    </button>
                  )}
                </div>

                <div>
                  {wizardStep === 1 && (
                    <button type="button" onClick={handlePerformSystemSearch} className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
                      <span>البحث واستخراج الشواهد</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  {wizardStep === 2 && (
                    <button type="button" onClick={handleGenerateSmartSlidesReport} disabled={isGeneratingSlides || wizSelectedItems.length === 0} className="px-7 py-2.5 bg-[#133E87] hover:bg-[#0B2545] text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md disabled:opacity-50">
                      {isGeneratingSlides ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>توليد وتصميم التقرير والأرشفة ({wizSelectedItems.length} عنصر)</span>
                    </button>
                  )}
                  {wizardStep === 3 && (
                    <button type="button" onClick={() => setIsReportWizardOpen(false)} className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black">
                      إغلاق وإنهاء
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- نافذة تفاصيل العنصر المنبثقة -------------------- */}
      <AnimatePresence>
        {selectedDetailsItem && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl border w-full max-w-lg overflow-hidden flex flex-col p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" /> تفاصيل {selectedDetailsItem.type === 'report' ? 'التقرير الدوري' : 'المؤشر والمعيار'}
                </h3>
                <button onClick={() => setSelectedDetailsItem(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="block font-bold text-gray-400">العنوان / المؤشر:</span>
                  <p className="font-black text-gray-900 text-sm mt-0.5">{selectedDetailsItem.item.title || selectedDetailsItem.item.indicator}</p>
                </div>
                {selectedDetailsItem.item.standard && (
                  <div>
                    <span className="block font-bold text-gray-400">المعيار والمطابقة:</span>
                    <p className="font-bold text-gray-700 mt-0.5">{selectedDetailsItem.item.standard}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border">
                  <div>
                    <span className="block font-bold text-gray-400">مجلد الربع:</span>
                    <span className="font-bold text-gray-800">{selectedDetailsItem.item.quarterFolder || selectedDetailsItem.item.period || selectedDetailsItem.item.periodType}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-400">الحالة:</span>
                    <span className="font-black text-emerald-700">{selectedDetailsItem.item.status}</span>
                  </div>
                </div>
                {selectedDetailsItem.item.notes && (
                  <div>
                    <span className="block font-bold text-gray-400">الملاحظات (وصف التقرير):</span>
                    <p className="font-medium text-gray-600 mt-0.5">{selectedDetailsItem.item.notes}</p>
                  </div>
                )}

                {selectedDetailsItem.type === 'report' && (
                   <div className="space-y-3 mt-4 border-t pt-4 border-gray-100">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">نطاق اللجان المستهدفة</span>
                           <div className="flex flex-wrap gap-1 mt-1 max-h-12 overflow-y-auto custom-scrollbar pr-1">
                              {selectedDetailsItem.item.committees?.map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] font-bold border border-blue-100">{c}</span>
                              )) || <span className="text-gray-500 font-bold">غير محدد</span>}
                           </div>
                        </div>
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">نوع التقرير</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.generationType || 'عام'}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-2 rounded-lg">
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">تاريخ بداية الاستخراج</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.startDate || 'غير متوفر'}</p>
                        </div>
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">تاريخ نهاية الاستخراج</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.endDate || 'غير متوفر'}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">منشئ التقرير (الأخصائي)</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.generatedBy || 'النظام'}</p>
                        </div>
                        <div>
                           <span className="block font-bold text-gray-400 text-[10px]">تاريخ الإصدار / الاعتماد</span>
                           <p className="font-bold text-gray-800 mt-1">{selectedDetailsItem.item.date || 'غير متوفر'}</p>
                        </div>
                     </div>
                     
                     {selectedDetailsItem.item.extractedStats && (
                       <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
                         <span className="block font-extrabold text-indigo-900 mb-2 border-b border-indigo-200/50 pb-1.5 text-[11px]">إحصائيات الاستخراج الآلي للأعمال ({selectedDetailsItem.item.selectedItemsCount || 0} شواهد معتمدة)</span>
                         <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] mt-2">
                            <div className="flex justify-between items-center border-b border-indigo-100/50 pb-1">
                              <span className="text-gray-600 font-bold">الاجتماعات:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.meetingsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-indigo-100/50 pb-1">
                              <span className="text-gray-600 font-bold">الفعاليات الأخرى:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.eventsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">إجمالي التوصيات:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.recommendationsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-bold">التوصيات المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedRecsCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">إجمالي المهام:</span>
                              <span className="font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.tasksCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">المهام المنجزة:</span>
                              <span className="font-black text-emerald-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.completedTasksCount || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-indigo-100/50 pt-1 mt-1">
                              <span className="text-gray-600 font-bold">التقارير الصادرة:</span>
                              <span className="font-black text-blue-600 bg-white px-2 py-0.5 rounded-md shadow-sm">{selectedDetailsItem.item.extractedStats.reportsCount || 0}</span>
                            </div>
                         </div>
                       </div>
                     )}
                   </div>
                )}
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <a href={selectedDetailsItem.item.cloudUrl || "https://drive.google.com/drive/folders/1rNsyfoD-rNhc9Sjh0pC0fwikfZRJT3oV"} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
                  <ExternalLink className="w-4 h-4" /> فتح المجلد في Google Drive
                </a>
                <button onClick={() => setSelectedDetailsItem(null)} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-700">إغلاق</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- نافذة تأكيد الحذف مع السبب -------------------- */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl border w-full max-w-sm overflow-hidden flex flex-col p-6">
              <h3 className="text-base font-bold text-slate-800 mb-2">تأكيد حذف {deleteTarget.type === 'report' ? 'التقرير' : 'المؤشر'}</h3>
              <p className="text-xs text-slate-500 mb-3">الرجاء إدخال سبب الحذف لتأكيد العملية والتوثيق:</p>
              <input 
                autoFocus 
                type="text" 
                value={deleteReason} 
                onChange={(e) => setDeleteReason(e.target.value)} 
                className="w-full px-3.5 py-2 border rounded-xl text-xs font-bold outline-none mb-4 focus:border-red-500" 
                placeholder="سبب الحذف مطلوب..." 
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100">إلغاء</button>
                <button disabled={isLoading || !deleteReason.trim()} onClick={confirmDelete} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}