import React, { useState, useEffect, FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, CheckCircle, RotateCcw, Search, Plus, X, Users2, Trash2, Edit2, LayoutGrid, List, AlertTriangle, Check, BookOpen, Clock, Presentation, MapPin, AlignLeft, Send, PlayCircle, Filter, Users, Settings, Copy, ChevronDown, ChevronUp, CheckSquare, Sparkles, Activity, Sliders, Lock, Loader2, Paperclip, Mail, UploadCloud, Upload
} from "lucide-react";
import { Member } from "../data/initialMembers";
import { formatCommitteeNameArabic } from "../lib/arabicUtils";
import { getSharedAccessToken, getOrCreateFolder, triggerAuthModal, uploadBinaryFileToDrive } from "../lib/googleApi";
import { showGlobalToast } from "../lib/toastUtils";

interface EventItem {
  id: number;
  title: string;
  type: "مفردة" | "متسلسلة";
  date: string; // ISO or Display format
  time?: string; // e.g. "10:00"
  committeeId: number | string;
  committeeName: string;
  status: "تجهيز التوصية" | string;
  location: "حضوري" | "عن بعد";
  employees: string[];
  members: number[]; // Array of member IDs
  notes: string;
  
  // New workflow step fields
  committeeConfirmed?: boolean;
  invitationSent?: boolean;
  invitationText?: string;
  confirmedAttendees?: number[];
  agenda?: Array<{
    id: string;
    title: string;
    duration: number;
    specialist: string;
    discussion?: string;
    recommendation?: string;
    assignee?: string;
    durationRec?: string;
    hasImpact?: boolean;
    workDays?: number;
  }>;
  minutesSaved?: boolean;
  minutesExportChecked?: boolean;
  recommendationType?: string;
  recommendationClassification?: string;
  recommendationPassMethod?: string;
  recommendationDiscussion?: string;
  recommendationText?: string;
  recommendationAssignee?: string;
  recommendationDuration?: string;
  recommendationAttachments?: string;
  exportedRecommendationsToPage?: boolean;
  attendanceConfirmed?: boolean;
  preparationsConfirmed?: boolean;
  preparationsText?: string;
  preparationsChecklist?: string[];
  preparationsAdditional?: string;
  agendaTransferred?: boolean;

  // Recommendation-specific 4-stage workflow states
  attachments?: Array<{ name: string; url: string; size?: string }>;
  specialistExplanation?: string;
  presidentExplanation?: string;
  directorExplanation?: string;
  assistantSecExplanation?: string;
  executiveOfficeExplanation?: string;
  activationApproved?: boolean | string;
  approvalFeedback?: string;
  assistantExplanation?: string;
  executiveExplanation?: string;
  finalExecutiveDecision?: string;
}

const DEFAULT_PREPARATIONS = [
  "التنسيق مع الأمن لدخول سيارات الأعضاء للمواقف العليا",
  "فتح بوابة القاعة مشعل الزايدي وتجهيز أجهزة تكييف الهواء قبل موعد الفعالية بـ 30 دقيقة",
  "تشغيل أجهزة العرض والشاشات والمايكروفونات وأجهزة الحاسب الآلي وتجهيز طاولة الإجتماع بالأوراق والمراسم",
  "تأمين ضيافة الإجتماع (ماء، قهوة، شاي، تمر)",
  "التنسيق مع الإعلام لتصوير وتغطية الفعالية والحدث لنشرها على وسائل التواصل الاجتماعي",
  "تأمين الأجهزة الفنية والشبكة (لاب توب - مايكات - الشاشة الترحيبية)",
  "مركز المسؤولية الاجتماعية (رابط تسجيل الساعات التطوعية للأعضاء)"
];

const EMPLOYEES = [
  "مدير النظام"
];

const ROOMS = ["G2", "G3", "G4", "المركاز", "رؤساء الغرفة", "سالم بن لادن", "مشعل الزايدي", "مصطفى رضا", "عادل كعكي", "يوسف الأحمدي", "المساندة", "مسرح صالح كامل", "خارج مقر الغرفة", "عن بعد", "مكتب مساعد الأمين العام", "مكتب الأمين"];
const EVENT_KINDS = ["اجتماع", "لقاء", "زيارة", "استضافة", "ورشة عمل", "ندوة", "حفل", "تدشين", "إطلاق مبادرة", "توقيع اتفاقية", "معرض", "دورة تدريبية", "ملتقى", "منتدى", "محاضرة"];
const CLASSIFICATIONS = ["دوري", "استثنائي", "فريق عمل", "طارئ"];
const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const WEEKSMap: Record<string, number> = {"الأول": 0, "الثاني": 1, "الثالث": 2, "الرابع": 3};
const DAYSMaps: Record<string, number> = {"الأحد": 0, "الإثنين": 1, "الثلاثاء": 2, "الأربعاء": 3, "الخميس": 4};

const exportRecommendationsToLocalStorage = async (evt: EventItem, selectedAgendaItemIds?: string[]) => {
  const agenda = evt.agenda || [];
  let recsToExport = agenda.filter(item => item.recommendation && item.recommendation.trim() !== "");
  if (selectedAgendaItemIds) {
    recsToExport = recsToExport.filter(item => selectedAgendaItemIds.includes(item.id));
  }
  
  if (recsToExport.length === 0) return 0;
  
  try {
    // 1. Write to app_custom_recommendations_alarms for compatibility / notifications
    const existingAlarmsRaw = localStorage.getItem("app_custom_recommendations_alarms");
    const existingAlarms = existingAlarmsRaw ? JSON.parse(existingAlarmsRaw) : [];
    
    const newAlarms = recsToExport.map((rec, index) => ({
      id: `custom-rec-${evt.id}-${rec.id || index}`,
      type: "recommendation" as const,
      title: `توصية البند: ${rec.title}`,
      description: rec.recommendation || "",
      dept: evt.committeeName,
      isUrgent: true,
      committee: evt.committeeName,
      dateStr: evt.date,
      status: "جديدة",
      responsible: rec.assignee || "غير محدد"
    }));
    
    const existingFiltered = existingAlarms.filter((a: any) => !a.id.startsWith(`custom-rec-${evt.id}-`));
    const mergedAlarms = [...existingFiltered, ...newAlarms];
    localStorage.setItem("app_custom_recommendations_alarms", JSON.stringify(mergedAlarms));
    
    // 2. Write directly to app_recommendations_custom for immediate sync inside the Recommendations page
    const existingCustomRaw = localStorage.getItem("app_recommendations_custom");
    let existingCustom = [];
    if (existingCustomRaw) {
      existingCustom = JSON.parse(existingCustomRaw);
    }
    if (!Array.isArray(existingCustom)) existingCustom = [];
    
    const newCustomRecs = recsToExport.map((rec, index) => {
      const recId = `custom-rec-${evt.id}-${rec.id || index}`;
      return {
        id: recId,
        title: rec.title,
        description: rec.recommendation || "",
        committeeName: evt.committeeName || "لجنة الإعلام والتسويق",
        eventName: evt.title || "مصدرة من جدول أعمال الفعاليات",
        date: evt.date || "2026-06-11",
        status: "جديدة",
        approvalStage: "أخصائي",
        assignedTo: rec.assignee || "غير محدد",
        duration: rec.durationRec || "أسبوعين",
        attachments: [],
        auditLogs: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: `تصدير تلقائي من فعالية: ${evt.title}`,
            user: "نظام حوكمة اللجان"
          }
        ],
        hasImpact: !!rec.hasImpact
      };
    });
    
    // Write directly to Firestore "recommendations" collection for dynamic load
    await Promise.all(
      newCustomRecs.map(async (rec) => {
        try {
          await setDoc(doc(db, "recommendations", rec.id), rec);
        } catch (dbErr) {
          console.error("Firestore setDoc failed for recommendation:", rec.id, dbErr);
        }
      })
    );
    
    const customFiltered = existingCustom.filter((item: any) => !item.id.startsWith(`custom-rec-${evt.id}-`));
    const mergedCustom = [...customFiltered, ...newCustomRecs];
    localStorage.setItem("app_recommendations_custom", JSON.stringify(mergedCustom));
    
    return recsToExport.length;
  } catch (e) {
    console.error("Error exporting recommendations", e);
    return 0;
  }
};

import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, setDoc } from '../lib/firebase';
import { db } from '../lib/firebase';
import { useFirestoreCollection } from '../lib/firebaseUtils';

const ordinalsToNumGlobal: Record<string, string> = {
  "التأسيسي": "1", "الأول": "1", "الثاني": "2", "الثالث": "3", "الرابع": "4", "الخامس": "5",
  "السادس": "6", "السابع": "7", "الثامن": "8", "التاسع": "9", "العاشر": "10",
  "الحادي عشر": "11", "الثاني عشر": "12", "الثالث عشر": "13", "الرابع عشر": "14", "الخامس عشر": "15",
  "السادس عشر": "16", "السابع عشر": "17", "الثامن عشر": "18", "التاسع عشر": "19", "العشرون": "20"
};

const getMeetingNumber = (title: string) => {
  if (!title) return "1";
  for (const [key, val] of Object.entries(ordinalsToNumGlobal)) {
    if (title.includes(` ${key} `) || title.endsWith(` ${key}`) || title.includes(`(${key})`) || title.includes(` ${key}`)) {
      return val;
    }
  }
  const match = title.match(/(\d+)/);
  if (match) return match[1];
  return "1";
};

const getCommitteeAbbrev = (name: string) => {
  if (!name) return "عام";
  const words = name.replace(/و/g, ' ').split(/\s+/).filter(w => w.trim() !== '' && !['في', 'من', 'عبر', 'على', 'لجنة', 'اللجنة', 'قطاع'].includes(w));
  return 'ل ' + words.map(w => w.replace(/^ال/, '')[0]).join(' ');
};

const getItemNumber = (recTitle: string) => {
    const match = recTitle.match(/توصية البند (.*?) "/);
    if (match && match[1]) {
        return ordinalsToNumGlobal[match[1]] || "1";
    }
    return "1";
};

const getYearStr = (dateStr: string) => {
    if (!dateStr) return "26";
    const year = new Date(dateStr).getFullYear();
    if (isNaN(year)) return "26";
    return year.toString().slice(-2);
};

const generateRecommendationRefNumber = (evt: any) => {
    // Check if it's already generated and stored, otherwise generate dynamically
    if (evt.refNumber) return evt.refNumber;
    
    // For manual/standalone recommendations without an eventName, fallback to a simple hash
    if (!evt.eventName || !String(evt.id).startsWith("custom-rec-")) {
        return `REC-${String(evt.id || "").substring(0, 5).toUpperCase()}`;
    }
    
    const cAbbrev = getCommitteeAbbrev(evt.committeeName || "");
    const mNum = getMeetingNumber(evt.eventName || "");
    const iNum = getItemNumber(evt.title || "");
    const yr = getYearStr(evt.date);
    return `${cAbbrev}-${mNum}-${iNum}-${yr}`;
};

const getArabicOrdinalGlobal = (n: number | string): string => {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return typeof n === "string" ? n : n.toString();
  const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
  if (num >= 0 && num <= 20) return ordinals[num];
  return num.toString();
};

export default function Events() {
  const location = useLocation();
  const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);
  const { data: rawCommittees } = useFirestoreCollection<any>("committees", []);
  const { data: allMembers } = useFirestoreCollection<Member>("members", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("employees", []);
  const { data: allDbRecommendations, addDocument: addFirebaseRecommendation, updateDocument: updateFirebaseRecommendation, deleteDocument: deleteFirebaseRecommendation } = useFirestoreCollection<any>("recommendations", []);

  const committees = rawCommittees.map(comm => {
     if (!comm) return comm;
     const assignedEmp = dbEmployees.find(emp => 
        emp && emp.active && emp.committees && emp.committees.includes(comm.name)
     );
     if (assignedEmp) return { ...comm, specialist: assignedEmp.name };
     return comm;
  }).filter(c => c && c.active !== false);

  const dynamicEmployees = React.useMemo(() => {
     const sourceList = dbEmployees.filter(e => 
        e && 
        e.role !== "SYS_ADMIN" &&
        e.id !== "01" && 
        e.name !== "شهاب الدين" && 
        e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com"
     );
     return sourceList.map(e => e.name).filter(Boolean);
  }, [dbEmployees]);


  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCommIdForCards, setSelectedCommIdForCards] = useState<number | null>(null);
  const [selectedEventKindForCards, setSelectedEventKindForCards] = useState<string | null>(null);
  const [selectedClassificationForCards, setSelectedClassificationForCards] = useState<string | null>(null);
  const [selectedEventIdForCards, setSelectedEventIdForCards] = useState<number | null>(null);

  const canUserEditCommittee = (committeeName: string): boolean => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return true;
      const user = JSON.parse(stored);
      if (!user) return true;
      const mgmtRoles = ["SYS_ADMIN", "MANAGER", "DEPT_HEAD", "MANAG_DIR", "EXECUTIVE_OFFICE", "ASSISTANT_SEC_GEN", "SECRETARY_GENERAL"];
      if (mgmtRoles.includes(user.role)) return true;
      if (user.committees && Array.isArray(user.committees)) {
        return user.committees.includes(committeeName) || user.committees.includes("عام") || committeeName === "عام" || committeeName === "الجميع";
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeletingLoading, setIsBulkDeletingLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [activeGearMenuId, setActiveGearMenuId] = useState<number | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventItem | null>(null);

  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [selectedAgendaRecsExport, setSelectedAgendaRecsExport] = useState<Record<string, boolean>>({});
  const [activeStepTab, setActiveStepTab] = useState<Record<number, number>>({});
  const [agendaFormTitle, setAgendaFormTitle] = useState("");
  const [agendaFormDuration, setAgendaFormDuration] = useState(15);
  const [agendaFormSpecialistId, setAgendaFormSpecialistId] = useState("");

  const [copiedEventId, setCopiedEventId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalEvent, setExportModalEvent] = useState<EventItem | null>(null);

  const getDayNameFromDate = (dateStr: string) => {
    try {
      const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const d = new Date(dateStr);
      return days[d.getDay()];
    } catch {
      return "اليوم المحدد";
    }
  };

  const formatDateArabicStyle = (dateStr?: string) => {
    if (!dateStr) return "غير محدد";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      const yearNum = d.getFullYear();
      return `${dayNum} ${monthName} ${yearNum}م`;
    } catch {
      return dateStr;
    }
  };

  const formatTimeArabicStyle = (timeStr?: string) => {
    if (!timeStr) return "غير محدد";
    try {
      const [h, m] = timeStr.split(':');
      let hours = parseInt(h, 10);
      if (isNaN(hours)) return timeStr;
      const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const paddedHour = hours.toString().padStart(2, '0');
      return `${paddedHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const calculateWorkingDaysDate = (startDateStr: string, workingDays: number): string => {
    if (!startDateStr || isNaN(workingDays) || workingDays <= 0) return "";
    let curr = new Date(startDateStr);
    let count = 0;
    while (count < workingDays) {
      curr.setDate(curr.getDate() + 1);
      const day = curr.getDay();
      if (day !== 5 && day !== 6) {
        count++;
      }
    }
    return curr.toISOString().split('T')[0];
  };

  const getCalculatedNextStep = (evt: EventItem) => {
    if (!evt.preparationsConfirmed) {
      return "تجهيز التوصية والمسودة";
    }
    if (!evt.agendaTransferred) {
      return "إحالة التوصية";
    }
    return "مراجعة الاعتمادات";
  };

  const getStepIndex = (nextStep: string) => {
    switch (nextStep) {
      case "تجهيز التوصية والمسودة": return 0;
      case "إحالة التوصية": return 1;
      case "مراجعة الاعتمادات": return 2;
      default: return 0;
    }
  };

  const getRecommendationStatus = (evt: EventItem) => {
    if (evt.status === "متأخرة" || evt.status === "متأخر 🔴" || evt.status?.toLowerCase().includes("overdue")) {
      return { text: "توصية متأخرة", colorClass: "text-red-700 bg-red-50 ring-1 ring-red-200 border-red-200" };
    }
    if (evt.minutesSaved || evt.status === "مكتملة" || evt.status === "منجزة") {
      return { text: "توصية منجزة", colorClass: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-250 border-emerald-250 font-black" };
    }
    if (evt.preparationsConfirmed) {
      return { text: "جاري العمل عليها", colorClass: "text-amber-700 bg-amber-50 ring-1 ring-amber-200 border-amber-200 font-bold" };
    }
    return { text: "توصية جديدة", colorClass: "text-blue-700 bg-blue-50 ring-1 ring-blue-200 border-blue-200" };
  };

  const updateEventWorkflow = (eventId: number, updates: Partial<EventItem>) => {
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (targetEvent && !canUserEditCommittee(targetEvent.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لتعديل فعاليات هذه اللجنة. يمكنك فقط إدارة فعاليات اللجان المكلف بها.");
      return;
    }
    const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {
        const updated = { ...evt, ...updates };
        
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => (String(m.committeeId) === String(updated.committeeId) || String(m.secondaryCommitteeId) === String(updated.committeeId)) && m.active !== false);
          const presentIds = updates.confirmedAttendees || [];
          const presentMems = commMems.filter(m => presentIds.includes(m.id));
          const ratioMet = commMems.length > 0 ? (presentMems.length >= (commMems.length / 2)) : false;
          const leadersPresent = presentMems.some(m => m.role === "رئيس" || m.role === "نائب" || m.role?.includes("رئيس") || m.role?.includes("نائب") || m.role?.includes("أمين"));
          const quorumMet = ratioMet && leadersPresent;
          
          if (quorumMet) {
            updated.status = "مؤكد";
          } else {
            updated.status = "تأكيد الحضور";
          }
        }
        if (updated.isAgendaSource) { updateFirebaseRecommendation(String(eventId), updated); } else { updateFirebaseEvent(String(eventId), updated); }
    }
  };

  const getGeneratedInvitation = (e: EventItem) => {
    if (e.invitationText) return e.invitationText;
    const day = getDayNameFromDate(e.date);
    const titleText = e.title || "اللقاء";
    const arabicDate = formatDateArabicStyle(e.date);
    const arabicTime = formatTimeArabicStyle(e.time);
    
    const agenda = e.agenda || [];
    const agendaText = agenda.length > 0 
      ? agenda.map(item => item.title).join(" - ") 
      : "بنود الاجتماع";

    return `أصحاب السعادة/ رئيس وأعضاء اللجنة المحترمين
السلام عليكم ورحمة الله وبركاته
نهديكم أطيب تحية وتقدير ..
يسرنا دعوتكم لحضور ${titleText} 
المقرر عقده بمشيئة الله يوم ${day} الموافق ${arabicDate} في تمام الساعة ${arabicTime} 
مكان الاجتماع: [${e.location || "مكتب الأمين"}]
وذلك لمناقشة: [${agendaText}].
نأمل من سعادتكم التكرم بتأكيد الحضور.

شاكرين ومقدرين لكم حرصكم`;
  };

  const getGeneratedPreparations = (e: EventItem) => {
    if (e.preparationsText) return e.preparationsText;
    
    const day = getDayNameFromDate(e.date);
    const titleText = e.title || "اللقاء";
    
    const arabicDate = formatDateArabicStyle(e.date);
    const arabicTime = formatTimeArabicStyle(e.time);
    
    const presentCount = e.confirmedAttendees ? e.confirmedAttendees.length : 0;
    const commMembersCount = allMembers.filter(m => String(m.committeeId) === String(e.committeeId) || String(m.secondaryCommitteeId) === String(e.committeeId)).length;
    const totalCount = presentCount || commMembersCount || 1;
    const membersWord = `${totalCount} أعضاء`;

    const currentPreps = e.preparationsChecklist !== undefined ? e.preparationsChecklist : DEFAULT_PREPARATIONS;
    
    let formattedItems = currentPreps.map(item => `- ${item}`).join("\n");
    
    if (e.preparationsAdditional && e.preparationsAdditional.trim() !== "") {
      const additionalLines = e.preparationsAdditional
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.startsWith("-") ? line : `- ${line}`);
      if (additionalLines.length > 0) {
        if (formattedItems) {
          formattedItems += "\n" + additionalLines.join("\n");
        } else {
          formattedItems = additionalLines.join("\n");
        }
      }
    }

    if (!formattedItems) {
      formattedItems = "- (الرجاء اختيار عناصر من قائمة التحقق أو إضافة طلب مخصص)";
    }

    return `سعادة الأستاذ/ محمد بن محسن السبيعي سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد

نظراً لقرب موعد ${titleText} يوم ${day} الموافق ${arabicDate} في تمام الساعة ${arabicTime} لعدد حضور (${membersWord}).

عليه نأمل منكم توجيه من يلزم بضرورة تأمين طلبات الاجتماع وهي على النحو التالي:

${formattedItems}

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،`;
  };

  const [newTitle, setNewTitle] = useState("");
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  const [newType, setNewType] = useState<"مفردة" | "متسلسلة">("مفردة");
  const [newRecType, setNewRecType] = useState("");
  const [newRecClassification, setNewRecClassification] = useState("");
  const [newRecEventId, setNewRecEventId] = useState("");
  const [newRecPassMethod, setNewRecPassMethod] = useState("عبر البريد الإلكتروني");
  const [newRecTitle, setNewRecTitle] = useState("");
  const [newRecDiscussion, setNewRecDiscussion] = useState("");
  const [newRecText, setNewRecText] = useState("");
  const [newRecAssignee, setNewRecAssignee] = useState("");
  const [newRecDuration, setNewRecDuration] = useState("");
  const [newRecAttachments, setNewRecAttachments] = useState<{name: string, url: string}[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newCommitteeId, setNewCommitteeId] = useState<number | string>(0);
  const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialist = comm?.specialist ? `أخصائي اللجنة - ${comm.specialist}` : "";
    const members = allMembers.filter(m => String(m.committeeId) === String(newCommitteeId) || String(m.secondaryCommitteeId) === String(newCommitteeId)).map(m => `${m.role} - ${m.title} ${m.name}`);
    return Array.from(new Set([specialist, ...members].filter(Boolean)));
  }, [allMembers, committees, newCommitteeId]);
  const [newStatus, setNewStatus] = useState<EventItem["status"]>("تجهيز الفعاليات");
  const [newLocation, setNewLocation] = useState<"حضوري" | "عن بعد">("حضوري");
  const [newEmployees, setNewEmployees] = useState<string[]>([]);
  const [newMembers, setNewMembers] = useState<number[]>([]);
  const [newNotes, setNewNotes] = useState("");

  const [singleKind, setSingleKind] = useState("");
  const [singleClassification, setSingleClassification] = useState("");
  const [singleEventNumber, setSingleEventNumber] = useState("الأول");
  const [isSeqManuallyEdited, setIsSeqManuallyEdited] = useState(false);
  const [singleTime, setSingleTime] = useState("");
  const [singleRoom, setSingleRoom] = useState("");
  const [singleEmployee, setSingleEmployee] = useState(dynamicEmployees[0] || "");

  useEffect(() => {
    setIsSeqManuallyEdited(false);
  }, [newCommitteeId, singleKind, singleClassification]);

  const getArabicOrdinal = (n: number | string): string => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return typeof n === "string" ? n : n.toString();
    const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
    if (num >= 0 && num <= 20) return ordinals[num];
    return num.toString();
  };

  useEffect(() => {
    if (isSeqManuallyEdited) return;
    if (newType === "مفردة" && newCommitteeId > 0) {
      const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
      const classifStr = singleClassification === "دوري" ? "الدوري" : singleClassification === "استثنائي" ? "الاستثنائي" : singleClassification === "طارئ" ? "الطارئ" : singleClassification === "فريق عمل" ? "فريق العمل" : singleClassification;
      const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
      const prefixToMatch = `${singleKind} ${formattedCommName} ${classifStr}`.trim();
      const count = events.filter(e => e.committeeId === newCommitteeId && e.title.startsWith(prefixToMatch)).length;
      setSingleEventNumber(getArabicOrdinal(count + 1));
    }
  }, [newType, singleKind, newCommitteeId, singleClassification, committees, events, isSeqManuallyEdited]);

  useEffect(() => {
    if (isTitleManuallyEdited) return;
    if (newType === "مفردة") {
      const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
      const classifStr = singleClassification === "دوري" ? "الدوري" : singleClassification === "استثنائي" ? "الاستثنائي" : singleClassification === "طارئ" ? "الطارئ" : singleClassification === "فريق عمل" ? "فريق العمل" : singleClassification;
      const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
      const numWord = getArabicOrdinal(singleEventNumber);
      let autoTitle = `${singleKind} ${formattedCommName} ${classifStr} ${numWord}`.trim();
      if (singleKind === "اجتماع" && singleClassification === "دوري" && numWord === "الأول") {
        autoTitle += " (التأسيسي)";
      }
      setNewTitle(autoTitle);
    }
  }, [newType, singleKind, newCommitteeId, singleClassification, singleEventNumber, committees, isTitleManuallyEdited]);

  useEffect(() => {
    if (location.state && (location.state as any).selectedEventId) {
      const targetId = String((location.state as any).selectedEventId);
      if (events && events.length > 0) {
        const found = events.find(e => String(e.id) === targetId);
        if (found) {
          setViewMode("table");
          setExpandedEventId(targetId as any);
          setTimeout(() => {
            const el = document.getElementById(`event-row-${targetId}`) || document.getElementById(`event-card-${targetId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }
    }
  }, [location.state, events]);

  const [seriesKind, setSeriesKind] = useState("");
  const [seriesClassification, setSeriesClassification] = useState("");
  const [seriesAssignedEmployee, setSeriesAssignedEmployee] = useState(dynamicEmployees[0] || "");
  const [seriesDayOfWeek, setSeriesDayOfWeek] = useState("الأحد");
  const [seriesStartDate, setSeriesStartDate] = useState("");
  const [seriesEndDate, setSeriesEndDate] = useState("");
  const [seriesWeekOfMonth, setSeriesWeekOfMonth] = useState("الأول");
  const [seriesTime, setSeriesTime] = useState("");
  const [seriesRooms, setSeriesRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  
  const [generatedSchedules, setGeneratedSchedules] = useState<{id: number, date: string, title: string, time: string}[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  const [importCommitteeId, setImportCommitteeId] = useState<number | string>(0);
  const [importSearchResults, setImportSearchResults] = useState<any[]>([]);
  const [selectedImportRecs, setSelectedImportRecs] = useState<string[]>([]);
  const [isImportSearched, setIsImportSearched] = useState(false);

  const handleSearchImport = () => {
    if (!importCommitteeId) return;
    
    const committeeEvents = events.filter(e => e.committeeId === importCommitteeId);
    let results: any[] = [];
    
    committeeEvents.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item, index) => {
          if (item.recommendation && item.recommendation.trim() !== "") {
            const isAdded = events.some(e => e.exportedRecommendationsToPage && e.title === item.title && e.committeeId === importCommitteeId);
            results.push({
              eventId: evt.id,
              eventTitle: evt.title,
              agendaId: item.id || String(index),
              title: item.title,
              recommendationText: item.recommendation,
              assignee: item.assignee || "",
              duration: item.durationRec || "",
              isAdded
            });
          }
        });
      }
    });
    
    setImportSearchResults(results);
    setIsImportSearched(true);
    setSelectedImportRecs([]);
  };

  const toggleImportRecSelection = (id: string) => {
    if (selectedImportRecs.includes(id)) {
      setSelectedImportRecs(selectedImportRecs.filter(r => r !== id));
    } else {
      setSelectedImportRecs([...selectedImportRecs, id]);
    }
  };

  const handleImportSelected = async () => {
    const selectedRecs = importSearchResults.filter(r => selectedImportRecs.includes(r.eventId + "-" + r.agendaId));
    
    if (selectedRecs.length === 0) return;
    
    const commName = committees.find(c => c.id === importCommitteeId)?.name || "";
    
    for (const rec of selectedRecs) {
      if (rec.isAdded) continue;
      
      const newRec: any = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: rec.title,
        type: "مفردة",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        committeeId: importCommitteeId,
        committeeName: commName,
        status: "تجهيز التوصية والمسودة",
        location: "حضوري",
        employees: [rec.assignee].filter(Boolean),
        members: [],
        notes: rec.recommendationText,
        exportedRecommendationsToPage: true,
        
        recommendationType: "عادية",
        recommendationClassification: "عادية",
        recommendationEventId: String(rec.eventId),
        recommendationDiscussion: "",
        recommendationText: rec.recommendationText,
        recommendationAssignee: rec.assignee,
        recommendationDuration: rec.duration,
        recommendationAttachments: "",
        
        preparationsText: rec.recommendationText,
        preparationsAttachments: []
      };
      
      await addFirebaseEvent(newRec);
    }
    
    setImportCommitteeId(0);
    setImportSearchResults([]);
    setSelectedImportRecs([]);
    setIsImportSearched(false);
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      const mapped = filesArray.map(f => ({
        name: f.name,
        url: `https://drive.google.com/drive/folders/uploaded_${Date.now()}`
      }));
      setNewRecAttachments([...newRecAttachments, ...mapped]);
    }
  };

  const handleAddLinkAttachment = () => {
    const linkName = prompt("أدخل اسم المرفق:");
    const linkUrl = prompt("أدخل رابط المرفق:", "https://...");
    if (linkName && linkUrl) {
      setNewRecAttachments([
        ...newRecAttachments,
        { name: linkName, url: linkUrl }
      ]);
    }
  };

  const handleSearchCommit = (e: FormEvent) => {
    e.preventDefault();
    setFilterQuery(searchQuery);
    setIsSearchExpanded(false);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setFilterQuery("");
    setIsSearchExpanded(false);
  };

  const filteredEvents = events.filter((e) => {
    if (!e.exportedRecommendationsToPage) return false;

    const term = filterQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      (e.title || "").toLowerCase().includes(term) ||
      (e.committeeName || "").toLowerCase().includes(term) ||
      (e.type || "").toLowerCase().includes(term) ||
      (e.location || "").toLowerCase().includes(term) ||
      (e.status || "").toLowerCase().includes(term) ||
      (e.date || "").toLowerCase().includes(term)
    );
  });

  const getEventTimeValue = (evt: EventItem) => {
    try {
      if (!evt.date) return 0;
      const dt = new Date(`${evt.date}T${evt.time || "00:00"}`);
      return isNaN(dt.getTime()) ? 0 : dt.getTime();
    } catch (_) {
      return 0;
    }
  };

  const isEventCompleted = (evt: EventItem): boolean => {
    const stepValues = [
      !!evt.committeeConfirmed,
      !!evt.invitationSent,
      !!evt.attendanceConfirmed,
      !!evt.preparationsConfirmed,
      !!(evt.agenda && evt.agenda.length > 0 && evt.agendaTransferred),
      !!evt.minutesSaved,
      !!evt.exportedRecommendationsToPage
    ];
    return stepValues.filter(Boolean).length === 7;
  };

  const getEventClassification = (title: string): string => {
    if (title.includes("الدوري") || title.includes("دوري")) return "دوري";
    if (title.includes("الاستثنائي") || title.includes("استثنائي")) return "استثنائي";
    if (title.includes("فريق العمل") || title.includes("فريق عمل")) return "فريق عمل";
    if (title.includes("الطارئ") || title.includes("طارئ")) return "طارئ";
    return "دوري";
  };

  const tableRecommendations = React.useMemo(() => {
    const term = filterQuery.trim().toLowerCase();
    
    let agendaRecs: any[] = [];
    events.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item: any, index: number) => {
          if (item.recommendation && item.recommendation.trim() !== "") {
            agendaRecs.push({
              id: `custom-rec-${evt.id}-${item.id || index}`,
              title: `توصية البند ${getArabicOrdinalGlobal(index + 1)} "${item.title}"`,
              description: item.recommendation,
              recommendationText: item.recommendation,
              committeeName: evt.committeeName || "لجنة غير محددة",
              eventName: evt.title,
              date: evt.date || "2026-06-11",
              status: "جديدة",
              approvalStage: "أخصائي",
              assignedTo: item.assignee || "غير محدد",
              duration: item.durationRec || "أسبوعين",
              isAgendaSource: true
            });
          }
        });
      }
    });

    let mappedDbMap = new Map();
    [...allDbRecommendations].forEach((rec: any) => {
      mappedDbMap.set(String(rec.id), {
        ...rec,
        id: rec.id,
        title: rec.title || rec.description || "توصية غير مسماة",
        committeeName: rec.committeeName || "غير محدد",
        date: rec.date || "2026-06-11",
        status: rec.status || "جديدة",
        recommendationAssignee: rec.assignedTo || "غير محدد",
        recommendationType: true,
        isRealEvent: false
      });
    });

    agendaRecs.forEach(ar => {
      if (mappedDbMap.has(ar.id)) {
        let existing = mappedDbMap.get(ar.id);
        if (!existing.title || existing.title.includes("غير مسماة") || existing.title === existing.description) {
           existing.title = ar.title;
        }
        if (!existing.recommendationAssignee || existing.recommendationAssignee === "غير محدد") {
           existing.recommendationAssignee = ar.assignedTo;
        }
      } else {
        mappedDbMap.set(ar.id, {
          ...ar,
          recommendationAssignee: ar.assignedTo,
          recommendationType: true,
          isRealEvent: false
        });
      }
    });

    let mappedDb = Array.from(mappedDbMap.values());

    let mappedStandalone = events
       .filter(e => !!e.recommendationType)
       .map(e => ({
          ...e,
          id: e.id,
          title: e.title || "توصية غير مسماة",
          committeeName: e.committeeName || "غير محدد",
          date: e.date || "2026-06-11",
          status: e.status || "جديدة",
          recommendationAssignee: e.employees && e.employees.length > 0 ? e.employees[0] : "غير محدد",
          recommendationType: e.recommendationType || true,
          isRealEvent: false
       }));

    let combined = [...mappedDb, ...mappedStandalone];

    if (term) {
       combined = combined.filter(r => 
         (r.title || "").toLowerCase().includes(term) ||
         (r.committeeName || "").toLowerCase().includes(term) ||
         (r.description || "").toLowerCase().includes(term) ||
         (r.recommendationText || "").toLowerCase().includes(term) ||
         (r.assignedTo || "").toLowerCase().includes(term) ||
         (r.recommendationAssignee || "").toLowerCase().includes(term) ||
         (r.eventName || "").toLowerCase().includes(term) ||
         (r.status || "").toLowerCase().includes(term)
       );
    }
    
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allDbRecommendations, events, filterQuery]);

  const sortedTableEvents = React.useMemo(() => {
    const list = [...filteredEvents];
    const nowTimestamp = Date.now();
    
    return list.sort((a, b) => {
      const timeValA = getEventTimeValue(a);
      const timeValB = getEventTimeValue(b);
      
      const aIsPast = timeValA > 0 && timeValA < nowTimestamp;
      const bIsPast = timeValB > 0 && timeValB < nowTimestamp;
      
      const aComp = isEventCompleted(a);
      const bComp = isEventCompleted(b);
      
      const aDone = aComp || aIsPast;
      const bDone = bComp || bIsPast;
      
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      
      if (aDone && bDone) {
        return timeValB - timeValA;
      }
      
      return timeValA - timeValB;
    });
  }, [filteredEvents]);

  const resetForm = () => {
    setNewTitle("");
    setIsTitleManuallyEdited(false);
    setNewType("مفردة");
    setNewDate(new Date().toISOString().split("T")[0]);
    setNewCommitteeId(0);
    setNewStatus("تجهيز الفعاليات");
    setNewLocation("حضوري");
    setNewEmployees([]);
    setNewMembers([]);
    setNewNotes("");
    
    setSingleKind("");
    setSingleClassification("");
    setSingleEventNumber("الأول");
    setSingleTime("");
    setSingleRoom("");
    setSingleEmployee(dynamicEmployees[0] || "");
    
    setSeriesKind("");
    setSeriesClassification("");
    setSeriesAssignedEmployee(dynamicEmployees[0] || "");
    setSeriesDayOfWeek("الأحد");
    setSeriesStartDate("");
    setSeriesEndDate("");
    setSeriesWeekOfMonth("الأول");
    setSeriesTime("");
    setSeriesRooms([]);
    setGeneratedSchedules([]);
    setSelectedSchedules([]);
    setIsConfirmingSeries(false);
    
    setEditingEvent(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    if (!canUserEditCommittee(evt.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لتعديل هذه الفعالية. يمكنك فقط تعديل فعاليات اللجان المكلف بها.");
      return;
    }
    setEditingEvent(evt);
    setNewTitle(evt.title);
    setIsTitleManuallyEdited(true);
    setNewType(evt.type);
    setNewDate(evt.date);
    setNewCommitteeId(evt.committeeId);
    setNewStatus(evt.status);
    setNewLocation(evt.location);
    setNewEmployees(evt.employees);
    setNewMembers(evt.members || []);
    setNewNotes(evt.notes);
    
    if (evt.type === "مفردة") {
      setSingleTime(evt.time || "");
      setSingleRoom(evt.location);
      setSingleEmployee(evt.employees[0] || "");
    } else {
      setSeriesTime(evt.time || "");
      setSeriesRooms(evt.location.split("،").map(s => s.trim()));
      setSeriesAssignedEmployee(evt.employees[0] || "");
    }

    setIsAddOpen(true);
  };

  const handleOpenDelete = (evt: EventItem) => {
    if (!canUserEditCommittee(evt.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لحذف هذه الفعالية. يمكنك فقط تعديل فعاليات اللجان المكلف بها.");
      return;
    }
    setDeletingEvent(evt);
  };

  const toggleSeriesRoom = (rm: string) => {
    if (seriesRooms.includes(rm)) {
      setSeriesRooms(seriesRooms.filter(r => r !== rm));
    } else {
      setSeriesRooms([...seriesRooms, rm]);
    }
  };

  const generateDates = () => {
    if (!seriesStartDate || !seriesEndDate) return;
    const start = new Date(seriesStartDate);
    const end = new Date(seriesEndDate);
    const targetDay = DAYSMaps[seriesDayOfWeek];
    const targetWeek = WEEKSMap[seriesWeekOfMonth];
    
    const results: {id: number, date: string, title: string, time: string}[] = [];
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    const classifStr = seriesClassification === "دوري" ? "الدوري" : seriesClassification === "استثنائي" ? "الاستثنائي" : seriesClassification === "طارئ" ? "الطارئ" : seriesClassification === "فريق عمل" ? "فريق العمل" : seriesClassification;
    const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
    const prefixToMatch = `${seriesKind} ${formattedCommName} ${classifStr}`.trim();
    let existingCount = events.filter(e => e.committeeId === newCommitteeId && e.title.startsWith(prefixToMatch)).length;
    
    const current = new Date(start);
    let tempId = 1;
    while (current <= end) {
      if (current.getDay() === targetDay) {
        const dateNo = current.getDate();
        const occurrence = Math.floor((dateNo - 1) / 7);
        if (occurrence === targetWeek) {
          existingCount++;
          const numWord = getArabicOrdinal(existingCount);
          let itemTitle = `${prefixToMatch} ${numWord}`.trim();
          if (seriesKind === "اجتماع" && seriesClassification === "دوري" && numWord === "الأول") {
            itemTitle += " (التأسيسي)";
          }
          results.push({
            id: tempId++,
            date: new Date(current).toISOString().split('T')[0],
            title: itemTitle,
            time: seriesTime
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    setGeneratedSchedules(results);
    setSelectedSchedules(results.map(r => r.id));
    setIsConfirmingSeries(true);
  };

  const [conflictWarning, setConflictWarning] = useState<{message: string, conflictingEventId: number} | null>(null);

  const checkConflict = (date: string, time: string, rooms: string[], employees: string[], excludeId?: number) => {
    for (const evt of events) {
      if (excludeId && evt.id === excludeId) continue;
      if (evt.date === date && evt.time === time) {
        const evtRooms = evt.location.split('、').map(r => r.trim());
        const overlappingRooms = rooms.filter(r => evtRooms.includes(r));
        if (overlappingRooms.length > 0) {
          return { message: `يوجد تعارض في القاعة (${overlappingRooms.join('، ')}) مع فعالية: ${evt.title}`, conflictingEventId: evt.id };
        }
        const overlappingEmps = employees.filter(e => evt.employees.includes(e));
        if (overlappingEmps.length > 0) {
          return { message: `يوجد تعارض للموظف (${overlappingEmps.join('، ')}) مع فعالية: ${evt.title}`, conflictingEventId: evt.id };
        }
      }
    }
    return null;
  };

  const handleInsertSeries = async () => {
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    const selectedGen = generatedSchedules.filter(s => selectedSchedules.includes(s.id));
    
    for (const gen of selectedGen) {
      const conflict = checkConflict(gen.date, gen.time, seriesRooms, [seriesAssignedEmployee].filter(Boolean));
      if (conflict) {
        setConflictWarning(conflict);
        return;
      }
    }

    const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx,
      title: gen.title,
      type: "مفردة",
      date: gen.date,
      time: gen.time,
      committeeId: newCommitteeId,
      committeeName: commName,
      status: "تجهيز التوصية والمسودة",
      location: seriesRooms.length > 0 ? seriesRooms.join("، ") : "حضوري",
      employees: [seriesAssignedEmployee].filter(Boolean),
      members: newMembers,
      notes: newNotes,
      exportedRecommendationsToPage: true,
    }));

    newEventsList.forEach(async (ev) => { await setDoc(doc(db, "events", String(ev.id)), ev); });
    setIsConfirmingSeries(false);
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setConflictWarning(null);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);
    
    if (newType === "متسلسلة") {
      return;
    }

    if (!newRecTitle.trim() || !newCommitteeId) return;

    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";

    if (editingEvent) {
      const updatedRec = {
        ...editingEvent,
        title: newRecTitle,
        committeeId: newCommitteeId,
        committeeName: commName,
        employees: [newRecAssignee].filter(Boolean),
        notes: newRecText,
        
        recommendationType: newRecType,
        recommendationClassification: newRecClassification,
        recommendationEventId: newRecEventId,
        recommendationPassMethod: newRecPassMethod,
        recommendationDiscussion: newRecDiscussion,
        recommendationText: newRecText,
        recommendationAssignee: newRecAssignee,
        recommendationDuration: newRecDuration,
        recommendationAttachments: newRecAttachments as any,
        
        preparationsText: newRecText,
        preparationsAttachments: newRecAttachments.length > 0 ? newRecAttachments.map((att, index) => ({ id: String(index + 1), name: att.name, url: att.url })) : (editingEvent.preparationsAttachments || [])
      };
      updateFirebaseEvent(String(editingEvent.id), updatedRec);
    } else {
      const recEventId = Date.now();
      const newRec: any = {
        id: recEventId,
        title: newRecTitle,
        type: "مفردة",
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        committeeId: newCommitteeId,
        committeeName: commName,
        status: "تجهيز التوصية والمسودة",
        location: "حضوري",
        employees: [newRecAssignee].filter(Boolean),
        members: [],
        notes: newRecText,
        exportedRecommendationsToPage: true,
        
        recommendationType: newRecType,
        recommendationClassification: newRecClassification,
        recommendationEventId: newRecEventId,
        recommendationPassMethod: newRecPassMethod,
        recommendationDiscussion: newRecDiscussion,
        recommendationText: newRecText,
        recommendationAssignee: newRecAssignee,
        recommendationDuration: newRecDuration,
        recommendationAttachments: newRecAttachments,
        
        preparationsText: newRecText,
        preparationsAttachments: newRecAttachments.length > 0 ? newRecAttachments.map((att, index) => ({ id: String(index + 1), name: att.name, url: att.url })) : []
      };

      addFirebaseEvent(newRec);
    }
    
    setNewRecTitle("");
    setNewRecDiscussion("");
    setNewRecText("");
    setNewRecAssignee("");
    setNewRecDuration("");
    setNewRecAttachments([]);
    setNewCommitteeId(0);
    
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleDelete = async () => {
    if (deletingEvent) {
      if (allDbRecommendations.some((r: any) => String(r.id) === String(deletingEvent.id))) {
        if (typeof deleteFirebaseRecommendation === "function") {
          await deleteFirebaseRecommendation(String(deletingEvent.id));
        }
      } else if (deletingEvent.isAgendaSource) {
        alert("هذه التوصية مستمدة من جدول أعمال فعالية. لا يمكن حذفها من هنا.");
        setDeletingEvent(null);
        return;
      } else {
        if (typeof deleteFirebaseEvent === "function") {
          await deleteFirebaseEvent(String(deletingEvent.id));
        }
      }
      
      try {
        await deleteDoc(doc(db, "events", String(deletingEvent.id)));
      } catch (err) {
        console.error(err);
      }
      setDeletingEvent(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEventIds.length > 0) {
      setIsBulkDeletingLoading(true);
      const itemsToDelete = events.filter((e) => selectedEventIds.includes(e.id));
      await Promise.all(itemsToDelete.map(e => deleteFirebaseEvent(String(e.id))));
      setSelectedEventIds([]);
      setIsBulkDeletingLoading(false);
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectEvent = (id: number) => {
    setSelectedEventIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllEvents = () => {
    if (viewMode === "table") {
      if (selectedEventIds.length === tableRecommendations.length && tableRecommendations.length > 0) {
        setSelectedEventIds([]);
      } else {
        setSelectedEventIds(tableRecommendations.map((e: any) => e.id));
      }
    } else {
      if (selectedEventIds.length === filteredEvents.length && filteredEvents.length > 0) {
        setSelectedEventIds([]);
      } else {
        setSelectedEventIds(filteredEvents.map(e => e.id));
      }
    }
  };

  const formatTime12h = (timeStr?: string) => {
    if (!timeStr) return "غير محدد";
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${m} ${ampm}`;
  };

  const getEventKindStr = (rawTitle: string) => {
    if (!rawTitle) return "فعالية";
    const title = rawTitle.trim();
    if (title.startsWith("اجتماع") || title.includes("اجتماع")) return "اجتماع";
    if (title.startsWith("لقاء") || title.includes("لقاء")) return "لقاء";
    if (title.startsWith("زيارة") || title.includes("زيارة")) return "زيارة";
    if (title.startsWith("استضافة") || title.includes("استضافة")) return "استضافة";
    if (title.startsWith("ورشة عمل") || title.includes("ورشة عمل")) return "ورشة عمل";
    if (title.startsWith("ندوة") || title.includes("ندوة")) return "ندوة";
    if (title.startsWith("حفل") || title.includes("حفل")) return "حفل";
    if (title.startsWith("تدشين") || title.includes("تدشين")) return "تدشين";
    if (title.startsWith("إطلاق مبادرة") || title.includes("إطلاق مبادرة")) return "إطلاق مبادرة";
    if (title.startsWith("توقيع اتفاقية") || title.includes("توقيع اتفاقية")) return "توقيع اتفاقية";
    if (title.startsWith("معرض") || title.includes("معرض")) return "معرض";
    if (title.startsWith("دورة تدريبية") || title.startsWith("دورة") || title.includes("دورة")) return "دورة تدريبية";
    if (title.startsWith("ملتقى") || title.includes("ملتقى")) return "ملتقى";
    if (title.startsWith("منتدى") || title.includes("منتدى")) return "منتدى";
    if (title.startsWith("محاضرة") || title.includes("محاضرة")) return "محاضرة";
    return "فعالية";
  };

  const getEventKindStyle = (title: string) => {
    const kind = getEventKindStr(title);
    switch (kind) {
      case "اجتماع": return "text-blue-800 bg-blue-100/80 border-blue-200";
      case "لقاء": return "text-emerald-800 bg-emerald-100/80 border-emerald-200";
      case "زيارة": return "text-indigo-800 bg-indigo-100/80 border-indigo-200";
      case "استضافة": return "text-pink-800 bg-pink-100/80 border-pink-200";
      case "ورشة عمل": return "text-amber-800 bg-amber-100/80 border-amber-200";
      case "ندوة": return "text-purple-800 bg-purple-100/80 border-purple-200";
      case "حفل": return "text-rose-800 bg-rose-100/80 border-rose-200";
      case "تدشين": return "text-cyan-800 bg-cyan-100/80 border-cyan-200";
      case "إطلاق مبادرة": return "text-lime-800 bg-lime-100/80 border-lime-200";
      case "توقيع اتفاقية": return "text-fuchsia-800 bg-fuchsia-100/80 border-fuchsia-200";
      default: return "text-gray-800 bg-gray-100 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تجهيز الفعاليات": return "text-blue-600 bg-blue-100 ring-blue-200";
      case "تأكيد الموعد مع رئيس اللجنة": return "text-indigo-600 bg-indigo-100 ring-indigo-200";
      case "إرسال الدعوات": return "text-blue-600 bg-blue-100 ring-blue-200";
      case "تأكيد الحضور": return "text-amber-600 bg-amber-100 ring-amber-200";
      case "محضر الاجتماع": return "text-purple-600 bg-purple-100 ring-purple-200";
      case "التوصيات": return "text-brand bg-brand/10 ring-brand/20";
      case "منتهية": return "text-emerald-600 bg-emerald-100 ring-emerald-200";
      default: return "text-gray-600 bg-gray-100 ring-gray-200";
    }
  };

  const [directAddRecOpen, setDirectAddRecOpen] = useState(false);
  const [directRecTitle, setDirectRecTitle] = useState("");
  const [directRecDesc, setDirectRecDesc] = useState("");
  const [directRecAssignee, setDirectRecAssignee] = useState("");
  const [directRecDuration, setDirectRecDuration] = useState("أسبوعين");
  const [directRecStatus, setDirectRecStatus] = useState("جديدة");
  const [directRecStage, setDirectRecStage] = useState("أخصائي");
  const [expandedRecLogsId, setExpandedRecLogsId] = useState<string | null>(null);

  const handleUpdateRecommendationStatus = async (recId: string, newStatus: string, newStage?: string) => {
    if (!recId) return;

    if (recId.startsWith("agenda-rec-")) {
      const parts = recId.split("-");
      const eventId = Number(parts[2]);
      const idx = Number(parts[3]);
      const chosenEvent = events.find(e => e.id === eventId);
      if (!chosenEvent) return;
      
      const agendaItem = chosenEvent.agenda?.[idx];
      if (!agendaItem) return;
      
      const realId = `custom-rec-${eventId}-${idx}-${Date.now()}`;
      const newRec = {
        id: realId,
        title: agendaItem.title,
        description: agendaItem.recommendation || "",
        committeeName: chosenEvent.committeeName || "غير حدد",
        eventName: chosenEvent.title || "توصية غير محددة",
        date: chosenEvent.date || new Date().toISOString().split("T")[0],
        status: newStatus,
        approvalStage: newStage || "أخصائي",
        assignedTo: agendaItem.assignee || "غير محدد",
        duration: agendaItem.durationRec || "أسبوعين",
        auditLogs: [
          {
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            action: `تنشيط وتصدير التوصية من بنود جدول الأعمال بحالة [${newStatus}] ومرحلة [${newStage || "أخصائي"}]`,
            user: "الأخصائي المسؤول"
          }
        ]
      };
      try {
        await setDoc(doc(db, "recommendations", realId), newRec);
        const existingCustomRaw = localStorage.getItem("app_recommendations_custom");
        let existingCustom = [];
        if (existingCustomRaw) {
          existingCustom = JSON.parse(existingCustomRaw);
        }
        if (!Array.isArray(existingCustom)) existingCustom = [];
        existingCustom.push(newRec);
        localStorage.setItem("app_recommendations_custom", JSON.stringify(existingCustom));
      } catch (err) {
        console.error("Failed to promote transient recommendation directly:", err);
      }
      return;
    }

    const rec = allDbRecommendations.find((r: any) => r.id === recId);
    let auditLogs = rec?.auditLogs || [];
    if (!Array.isArray(auditLogs)) auditLogs = [];

    const newLog = {
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      action: `تغيير الحالة إلى [${newStatus}]${newStage ? ` ومسار الاعتماد إلى [${newStage}]` : ""}`,
      user: "الأخصائي المسؤول"
    };

    const updatedLogs = [...auditLogs, newLog];
    const updates: any = {
      status: newStatus,
      auditLogs: updatedLogs
    };
    if (newStage) {
      updates.approvalStage = newStage;
    }

    try {
      await updateDoc(doc(db, "recommendations", recId), updates);
      const existingCustomRaw = localStorage.getItem("app_recommendations_custom");
      if (existingCustomRaw) {
        let existingCustom = JSON.parse(existingCustomRaw);
        if (Array.isArray(existingCustom)) {
          existingCustom = existingCustom.map((item: any) => {
            if (item.id === recId) {
              return { ...item, ...updates };
            }
            return item;
          });
          localStorage.setItem("app_recommendations_custom", JSON.stringify(existingCustom));
        }
      }
    } catch (err) {
      console.error("Failed to update recommendation status:", err);
    }
  };

  const handleAddRecSubmitDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEventIdForCards === null) return;
    const chosenEvent = events.find(e => e.id === selectedEventIdForCards);
    if (!chosenEvent) return;

    const recId = `custom-rec-${chosenEvent.id}-${Date.now()}`;
    const newRec = {
      id: recId,
      title: directRecTitle,
      description: directRecDesc,
      committeeName: chosenEvent.committeeName || "غير محدد",
      eventName: chosenEvent.title || "توصية غير محددة",
      date: chosenEvent.date || new Date().toISOString().split("T")[0],
      status: directRecStatus,
      approvalStage: directRecStage,
      assignedTo: directRecAssignee || "غير محدد",
      duration: directRecDuration || "أسبوعين",
      auditLogs: [
        {
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          action: "إنشاء توصية جديدة مخصصة باللقاء",
          user: "الأخصائي المسؤول"
        }
      ]
    };

    try {
      await setDoc(doc(db, "recommendations", recId), newRec);
      const existingCustomRaw = localStorage.getItem("app_recommendations_custom");
      let existingCustom = [];
      if (existingCustomRaw) {
        existingCustom = JSON.parse(existingCustomRaw);
      }
      if (!Array.isArray(existingCustom)) existingCustom = [];
      existingCustom.push(newRec);
      localStorage.setItem("app_recommendations_custom", JSON.stringify(existingCustom));

      setDirectAddRecOpen(false);
      setDirectRecTitle("");
      setDirectRecDesc("");
      setDirectRecAssignee("");
      setDirectRecDuration("أسبوعين");
    } catch (err) {
      console.error("Failed to add recommendation directly:", err);
    }
  };

  const handleFileUploads = async (files: File[], evt: any, existingAtts: any[]) => {
    let eventTitle = evt.eventName || evt.title || "بدون عنوان";
    let eventKind = "فعاليات أخرى";
    if (eventTitle.includes("اجتماع")) eventKind = "الاجتماعات";
    else if (eventTitle.includes("لقاء")) eventKind = "اللقاءات";
    else if (eventTitle.includes("زيارة")) eventKind = "الزيارات";
    else if (eventTitle.includes("ورشة عمل")) eventKind = "ورش العمل";

    const defaultPathStr = `/تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${evt.committeeName || "عام"}/الفعاليات/${eventKind}/${eventTitle}/التوصيات/${evt.title || "بدون عنوان"}`;

    const pathVal = defaultPathStr;
    if (pathVal) {
      const execUpload = async (pathVal: string) => {
        if (!pathVal) return;
        showGlobalToast("جاري الرفع والمزامنة مع أرشيف جوجل درايف...", "loading", 0);
        try {
          let token = await getSharedAccessToken();
          if (!token) {
            try {
              token = await triggerAuthModal();
            } catch (err) {
              console.warn("User cancelled auth", err);
              showGlobalToast("لا يمكن حفظ التوصية بدون المصادقة. يرجى تسجيل الدخول إلى جوجل درايف أولاً.", "error");
              return null;
            }
          }
          
          const newAtts: any[] = [];
          
          if (token) {
            const parts = pathVal.split('/').filter(p => p.trim());
            let currentFolderId: string | null = null;
            for (const part of parts) {
              if (!currentFolderId) {
                currentFolderId = await getOrCreateFolder(part);
              } else {
                currentFolderId = await getOrCreateFolder(part, currentFolderId);
              }
            }
            const itemFolderId = currentFolderId;
            
            for (const file of files) {
              const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              const res = await uploadBinaryFileToDrive(file.name, base64 as string, file.type || "application/octet-stream", itemFolderId);
              newAtts.push({
                name: file.name,
                url: res && res.id ? `https://drive.google.com/file/d/${res.id}/view` : "#",
                size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
                date: new Date().toLocaleDateString('ar-SA')
              });
            }
          } else {
            files.forEach(f => newAtts.push({
              name: f.name,
              url: "#",
              size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
              date: new Date().toLocaleDateString('ar-SA')
            }));
          }

          updateEventWorkflow(evt.id, { attachments: [...existingAtts, ...newAtts] });
          showGlobalToast(`تمت المزامنة وحفظ الملفات بنجاح في المسار: ${pathVal}`, "success");
        } catch (err: any) {
          console.error("Upload error:", err);
          const msg = err?.message?.includes("عفواً") ? err.message : "حدث خطأ أثناء رفع الملفات والمزامنة. تأكد من صلاحية الربط بحساب جوجل.";
          showGlobalToast(msg, "error");
        }
      };
      execUpload(pathVal);
    } else {
      showGlobalToast("تم إلغاء عملية الرفع", "error");
    }
  };

  const renderPreparationPlatform = (evt: any) => {
    const nextStep = getCalculatedNextStep(evt);
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }} 
        animate={{ opacity: 1, height: "auto" }} 
        exit={{ opacity: 0, height: 0 }}
        className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-y border-gray-200 text-right font-sans relative"
      >
        {!canUserEditCommittee(evt.committeeName) && (
          <div className="absolute inset-0 z-[60] bg-slate-50/40 cursor-not-allowed rounded-lg" title="ليس لديك صلاحية لتعديل هذه التوصية" />
        )}
        <div className={`flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 relative ${!canUserEditCommittee(evt.committeeName) ? "opacity-80 pointer-events-none grayscale-[10%]" : ""}`}>
          {/* Right Column: Steps Stepper / Timeline Sidebar */}
          <div className="w-full md:w-1/3 flex flex-col gap-2.5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#111] flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand" />
                مراحل الإجراءات وتفعيل التوصية
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-brand/10 text-brand font-black">
                خطوة {getStepIndex(nextStep) + 1} من 3
              </span>
            </div>
            
            {/* 3 recommendation timeline steps */}
            {(() => {
              const isStep0Unlocked = true;
              const isStep1Unlocked = !!evt.preparationsConfirmed;
              const isStep2Unlocked = isStep1Unlocked && !!evt.agendaTransferred;
              
              const isUnlockedByStepIndex = [
                isStep0Unlocked,
                isStep1Unlocked,
                isStep2Unlocked
              ];

              const stepList = [
                { title: "تجهيز التوصية والمسودة", desc: "المولد الذكي للمحتوى وإرفاق المرفقات الرسمية", done: !!evt.preparationsConfirmed },
                { title: "إحالة التوصية واعتماداتها", desc: "إضافة الشروحات وصياغة قرار تفعيل التوصية", done: !!evt.agendaTransferred },
                { title: "مراجعة الاعتمادات والقرار الهيكلي", desc: "تسجيل الملاحظات وحفظ التوصية غير مفعلة أو تفعيلها كلياً", done: !!evt.minutesSaved },
              ];

              return stepList.map((step, idx) => {
                const isCurrent = getStepIndex(nextStep) === idx;
                const isSelected = (activeStepTab[evt.id] ?? getStepIndex(nextStep)) === idx;
                const isUnlocked = isUnlockedByStepIndex[idx];
                
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      setActiveStepTab(prev => ({
                        ...prev,
                        [evt.id]: idx
                      }));
                    }}
                    className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? "bg-slate-900 border-transparent text-white shadow-md font-extrabold" 
                        : isUnlocked 
                          ? "bg-slate-50 border-gray-200 text-slate-800 hover:bg-slate-100" 
                          : "bg-slate-50/50 border-slate-100/50 text-slate-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${
                      step.done 
                        ? "bg-emerald-500 text-white" 
                        : isSelected 
                          ? "bg-brand text-slate-900" 
                          : "bg-gray-200 text-gray-600"
                    }`}>
                      {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[10.5px] font-black leading-tight flex items-center gap-1.5 justify-start">
                        {step.title}
                        {isCurrent && (
                          <span className={`text-[8px] px-1 py-0.5 rounded font-black ${isSelected ? "bg-brand text-slate-900 animate-pulse" : "bg-blue-100 text-blue-600"}`}>
                            الحالي
                          </span>
                        )}
                      </div>
                      <p className={`text-[8.5px] leading-normal font-bold mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-550"}`}>
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          {/* Left Column: Active Step Form Content */}
          <div className="flex-1 bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm relative text-right min-h-[300px]">
            {(() => {
              const currentTab = activeStepTab[evt.id] ?? getStepIndex(nextStep);
              switch (currentTab) {
                case 0: { // Step 0: Prep Recommendation
                  const sampleFiles = ["موافقة_اللجنة_الفنية.pdf", "دراسة_الجدوى_المبدئية.pdf", "سجل_الاجتماع_التحضيري.pdf", "أدلة_القطاع_الداعم.jpg"];
                  const attachmentsList = evt.attachments || [];
                  
                  return (
                    <div className="space-y-4 animate-fade-in text-right">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 font-sans">
                        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                          <Sparkles className="w-4 h-4 text-brand animate-bounce" />
                          تجهيز التوصية وصياغتها الفنية مع المرفقات
                        </h3>
                        <span className="text-[9px] text-[#4ea0b0] font-extrabold px-2 py-0.5 rounded bg-[#4ea0b0]/5 font-sans">مرحلة 1 من 3</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-550 leading-relaxed font-bold font-sans text-right">
                        صغ المسودة الفنية للتوصية في الصندوق أدناه، أو استخدم خيار التوليد الذكي المقرّن بمحتوى التوصية للتصحيح الهيكلي الموحد، ثم أرفق الوثائق الرسمية لدعم الموثوقية والأرشفة.
                      </p>
                      
                      <div className="space-y-3 font-sans">
                        <div className="flex justify-between items-center">
                          <label className="text-[9.5px] text-slate-900 font-extrabold font-sans">الصياغة الفنية المقترحة للتوصية:</label>
                          <div className="flex gap-1">
                            {evt.preparationsText && (
                              <div key="filter-popover-1784704070989-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(evt.preparationsText || "");
                                    alert("تم نسخ الصياغة الفنية الذكية للتوصية للمحافظة بنجاح!");
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-gray-200 font-sans"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>نسخ القرار</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    let mailSubject = `تفعيل ${evt.title || "توصية قطاعية"}`;
                                    let mailBody = evt.preparationsText || "";
                                    if (mailBody.includes("سعادة")) {
                                        mailBody = mailBody.substring(mailBody.indexOf("سعادة"));
                                    } else if (mailBody.startsWith("الموضوع: ")) {
                                        const firstLineEnd = mailBody.indexOf("\n");
                                        if (firstLineEnd !== -1) {
                                            mailBody = mailBody.substring(firstLineEnd + 1).trim();
                                        }
                                    }
                                    
                                    const atts = evt.attachments || [];
                                    
                                    let allAtts = [...atts];
                                    if (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') {
                                        if (!allAtts.some(a => a.url === evt.approvedMinutesUrl)) {
                                             allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl });
                                        }
                                    }
                                    if (evt.agendaMinutes && typeof evt.agendaMinutes === 'string') {
                                        if (!allAtts.some(a => a.url === evt.agendaMinutes)) {
                                             allAtts.push({ name: 'محضر الاجتماع المعتمد', url: evt.agendaMinutes });
                                        }
                                    }

                                    if (allAtts.length > 0) {
                                        mailBody += "\n\nالمرفقات:\n";
                                        allAtts.forEach((a, idx) => {
                                            mailBody += `${idx + 1}- ${a.name || "مرفق"}: ${a.url || ""}\n`;
                                        });
                                    }

                                    const fullUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
                                    
                                    const a = document.createElement('a');
                                    a.href = fullUrl;
                                    a.target = '_blank';
                                    a.rel = 'noopener noreferrer';
                                    a.click();
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer flex items-center justify-center transition-all border border-gray-200 w-8 h-8"
                                  title="إرسال بالإيميل"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const generatedProposal = evt.description || evt.recommendationText || evt.notes || "لا يوجد نص للتوصية";
                                updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
                                try { navigator.clipboard.writeText(generatedProposal); } catch(e) {}
                              }}
                              className="px-2.5 py-1.5 bg-slate-900 border-transparent hover:bg-slate-800 text-brand text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 shadow transition-all duration-200 animate-pulse font-sans"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>توليد الصياغة الفنية الذكية</span>
                            </button>
                          </div>
                        </div>
                        
                        <textarea
                          value={evt.preparationsText || evt.description || evt.recommendationText || ""}
                          onChange={(e) => updateEventWorkflow(evt.id, { preparationsText: e.target.value })}
                          placeholder="اكتب هنا النص التفصيلي للتوصية أو الصياغة الصادرة للهيكل التنفيذي..."
                          className="w-full h-32 p-3 text-[10px] font-bold text-slate-800 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand resize-none bg-slate-50/70 leading-relaxed text-right font-sans"
                          dir="rtl"
                        />
                        
                        {/* Digital Library Drag & Drop Selector */}


                      </div>
                    </div>
                  );
                } // End case 0
                default:
                  return null;
              }
            })()}
          </div>
        </div>
      </motion.div>
    );
  }; // end renderPreparationPlatform

  // The main component render ends here:
  return (
    <div className="space-y-6 pb-16 text-right" dir="rtl">
      {/* Dynamic Header Toolbar */}
      <div className="bg-[#e8e4e4] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 sm:gap-3 md:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4.5">
          <div className="w-13 h-13 rounded-2.5xl bg-brand/10 border border-[#dfba6b]/30 flex items-center justify-center text-brand shrink-0">
            <Sliders className="w-6.5 h-6.5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base md:text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
              <span>سجل التوصيات</span>
            </h2>
            <p className="text-gray-650 text-xs font-semibold">
              التوصيات الصادرة عن الاجتماعات أو بالتمرير.
            </p>
          </div>
        </div>

        {/* Actions & Stats Group Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
          
          {/* 1. Toggleable Search with Input */}
          <div className="flex items-center gap-2 relative">
            <AnimatePresence>
              {showSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 -top-12 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md z-10 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  تم إضافة التوصية بنجاح
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 170, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearchCommit}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value === "") {
                        setFilterQuery("");
                      }
                    }}
                    placeholder="ابحث عن توصية..."
                    autoFocus
                    className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold placeholder-gray-400 text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => {
                if (isSearchExpanded) {
                  setFilterQuery(searchQuery);
                  setIsSearchExpanded(false);
                } else {
                  setIsSearchExpanded(true);
                }
              }}
              className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                isSearchExpanded || filterQuery
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="البحث عن اللجان"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-250 select-none" style={{ borderWidth: '0px' }}>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطائق</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-550 hover:text-gray-750"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>سجل</span>
            </button>
          </div>
          
          {/* Add Event Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>إضافة توصية</span>
          </button>

          {selectedEventIds.length > 0 && viewMode === "table" && (
            <button
              type="button"
              onClick={() => setIsBulkDeleting(true)}
              className="h-10 px-4 bg-red-650 hover:bg-red-750 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
            >
              <Trash2 className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>حذف المحدد ({selectedEventIds.length})</span>
            </button>
          )}

          {/* Vertical divider */}
          <div className="h-8 w-px bg-gray-300 hidden sm:block mx-1"></div>

          {/* Brief Quick Statistic Badge */}
          <div className="flex gap-2">
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">إجمالي التوصيات</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-brand leading-none font-mono">{events.length}</span>
            </div>
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">منتهية</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 leading-none font-mono">
                {events.filter(e => isEventCompleted(e) || e.status === "منتهية").length}
              </span>
            </div>
          </div>

        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <p className="text-gray-500 font-extrabold text-base">لم يعثر على أية نتائج مخصصة لعملية البحث الحالية.</p>
          <button
            onClick={handleResetSearch}
            className="text-brand font-black text-xs hover:underline"
          >
            عرض كافة التوصيات المسجلة
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-6 text-right">
          {/* Intelligent Breadcrumbs Navigator */}
          <div className="bg-[#e8e4e4] border border-gray-200 rounded-xl sm:rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3 md:gap-4 font-sans">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black text-gray-700">
              <button
                onClick={() => {
                  setSelectedCommIdForCards(null);
                  setSelectedEventIdForCards(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedCommIdForCards === null
                    ? "bg-brand text-white shadow-sm"
                    : "bg-white/80 text-gray-700 hover:bg-white border border-gray-300/65"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>الرئيسية (لوحة اللجان)</span>
              </button>

              {selectedCommIdForCards !== null && (
                
<React.Fragment>
                  <span className="text-gray-400 font-bold font-mono">/</span>
                  <button
                    onClick={() => {
                      setSelectedEventIdForCards(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedEventIdForCards === null
                        ? "bg-[#dfba6b] text-[#1e293b] shadow-sm font-black animate-pulse"
                        : "bg-white/80 text-gray-750 hover:bg-white border border-gray-300/65"
                    }`}
                  >
                    <Users2 className="w-3.5 h-3.5" />
                    <span>
                      {committees.find((c) => c.id === selectedCommIdForCards)?.name || "التحميل..."}
                    </span>
                  </button>
                </React.Fragment>
              )}

              {selectedCommIdForCards !== null && selectedEventIdForCards !== null && (
                
<React.Fragment>
                  <span className="text-gray-400 font-bold font-mono">/</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm font-black animate-bounce">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>
                      {(() => {
                        const recEvt = events.find((e) => e.id === selectedEventIdForCards);
                        return recEvt ? recEvt.title : "تفاصيل التوصيات";
                      })()}
                    </span>
                  </div>
                </React.Fragment>
              )}
            </div>

            <div className="text-[11px] text-gray-600 font-bold">
              مجموع النتائج الحالية:{" "}
              <span className="text-brand font-black">
                {(() => {
                  if (selectedCommIdForCards === null) {
                    return committees.length;
                  }
                  if (selectedEventIdForCards === null) {
                    return filteredEvents.filter((e) => e.committeeId === selectedCommIdForCards).length;
                  }
                  const chosenEvent = events.find((e) => e.id === selectedEventIdForCards);
                  const dbRecommendationsCount = allDbRecommendations.filter((rec: any) =>
                    String(rec.id).startsWith(`custom-rec-${selectedEventIdForCards}-`) ||
                    (rec.eventName && rec.eventName === chosenEvent?.title)
                  ).length;

                  return dbRecommendationsCount;
                })()}
              </span>
            </div>
          </div>
          {selectedCommIdForCards === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {committees.map((comm) => {
                const commRecsCount = filteredEvents.filter(e => e.committeeId === comm.id).length;
                return (
                  <button
                    key={comm.id}
                    onClick={() => setSelectedCommIdForCards(comm.id as number)}
                    className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 bg-white border border-gray-200 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl hover:border-brand hover:shadow-md transition-all text-right group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-brand/5 group-hover:text-brand transition-colors text-slate-400">
                        <Users2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-gray-800 text-sm">{comm.name}</h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">فعاليات التوصيات: {commRecsCount}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCommIdForCards !== null && selectedEventIdForCards === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {filteredEvents.filter(e => e.committeeId === selectedCommIdForCards).map((evt) => {
                const recsCount = (evt.agenda || []).filter(item => item.recommendation && item.recommendation.trim() !== "").length;
                return (
                  <button
                    key={evt.id}
                    onClick={() => setSelectedEventIdForCards(evt.id)}
                    className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 bg-white border border-gray-200 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Presentation className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-gray-800 text-sm">{evt.title}</h3>
                        <p className="text-xs text-gray-500 font-bold mt-1">التوصيات: {recsCount}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedCommIdForCards !== null && selectedEventIdForCards !== null && (
            <div>
              {events.filter(e => e.id === selectedEventIdForCards).map(evt => (
                <div key={evt.id}>
                  {renderPreparationPlatform(evt)}
                </div>
              ))}
            </div>
          )}

        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right font-sans">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-black">
                  <th className="px-4 py-4 pr-6">#</th>
                  <th className="px-4 py-4 w-1/3">الموضوع / التوصية</th>
                  <th className="px-4 py-4">اللجنة والفعالية</th>
                  <th className="px-4 py-4">المسؤول</th>
                  <th className="px-4 py-4">المدة</th>
                  <th className="px-4 py-4 pl-6 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableRecommendations.map((rec: any, index: number) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 pr-6">
                      <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold text-gray-800 text-sm">{rec.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{rec.description}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold text-gray-700">{rec.committeeName}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{rec.eventName || rec.date}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{rec.assignedTo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-bold text-gray-500">{rec.duration}</span>
                    </td>
                    <td className="px-4 py-4 pl-6 text-left">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        rec.status === 'منتهية' || rec.status === 'مكتملة' ? 'bg-emerald-50 text-emerald-700' :
                        rec.status === 'متأخرة' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : null}
    </div>
  );
}

