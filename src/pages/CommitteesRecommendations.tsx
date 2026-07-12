import React, { useState, useEffect, FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, CheckCircle, Search, Plus, X, Users2, Trash2, Edit2, LayoutGrid, List, AlertTriangle, Check, BookOpen, Clock, Presentation, MapPin, AlignLeft, Send, PlayCircle, Filter, Users, Settings, Copy, ChevronDown, ChevronUp, CheckSquare, Sparkles, Activity, Sliders, Lock, Loader2, Paperclip, Mail, UploadCloud
} from "lucide-react";
import { Member } from "../data/initialMembers";
import { formatCommitteeNameArabic } from "../lib/arabicUtils";

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

export default function CommitteesRecommendations() {
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
     // Unconditionally hide sys admin and root users from all employee lists, regardless of current user role
     const sourceList = dbEmployees.filter(e => 
         e && 
         e.role !== "SYS_ADMIN" &&
         e.id !== "01" && 
         e.name !== "شهاب الدين" && 
         e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
         e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com" &&
         ((e.orgLevel1 && e.orgLevel1.match(/اللجان|لجان/)) || (e.orgLevel2 && e.orgLevel2.match(/اللجان|لجان/)) || (e.orgLevel3 && e.orgLevel3.match(/اللجان|لجان/)))
     );
     return sourceList.map(e => e.name).filter(Boolean);
  }, [dbEmployees]);



  const setEvents = (action: React.SetStateAction<EventItem[]>) => {
    let nextEvents = typeof action === 'function' ? action(events) : action;
    events.forEach(existing => {
       if (!nextEvents.find(e => String(e.id) === String(existing.id))) {
          deleteFirebaseEvent(String(existing.id));
       }
    });

    nextEvents.forEach(nextT => {
       const existing = events.find(e => String(e.id) === String(nextT.id));
       if (!existing) {
          updateFirebaseEvent(String(nextT.id), nextT); // Update actually creates if passing the explicit string ID using setDoc if we modify the helper. Let me modify useFirestoreCollection first!
       } else if (JSON.stringify(existing) !== JSON.stringify(nextT)) {
          updateFirebaseEvent(String(nextT.id), nextT);
       }
    });
  };

  const [searchQuery, setSearchQuery] = useState("");

const [promptState, setPromptState] = useState<{ isOpen: boolean; message: string; defaultValue: string; onConfirm: (val: string) => void; onCancel: () => void; }>({ isOpen: false, message: '', defaultValue: '', onConfirm: () => {}, onCancel: () => {} });
const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; onClose: () => void; }>({ isOpen: false, message: '', onClose: () => {} });
const [linkPromptState, setLinkPromptState] = useState<{ isOpen: boolean; eventId: number | null; }>({ isOpen: false, eventId: null });

const [newRecLinkPromptState, setNewRecLinkPromptState] = useState<{isOpen: boolean}>({isOpen: false});

const [linkName, setLinkName] = useState('');
const [linkUrl, setLinkUrl] = useState('https://');

const handleGlobalLinkPrompt = (eventId: number) => {
    setLinkName('');
    setLinkUrl('https://');
    setLinkPromptState({ isOpen: true, eventId });
};

const confirmAddLinkAttachment = () => {
    if (linkName && linkUrl && linkPromptState.eventId) {
        const evt = events.find(e => String(e.id) === String(linkPromptState.eventId));
        if (evt) {
            const existing = evt.attachments || [];
            updateEventWorkflow(evt.id, { attachments: [...existing, { name: linkName, size: "رابط خارجي", date: new Date().toLocaleDateString('ar-SA') }] });
        }
    }
    setLinkPromptState({ isOpen: false, eventId: null });
};

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
      if (user.role === "SYS_ADMIN") return true;
      if (user.committees && Array.isArray(user.committees)) {
        return user.committees.includes(committeeName);
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  const [selectedEventIds, setSelectedEventIds] = useState<any[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeletingLoading, setIsBulkDeletingLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [activeGearMenuId, setActiveGearMenuId] = useState<number | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventItem | null>(null);

  // New States for Checklist & Workflow Management
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [selectedAgendaRecsExport, setSelectedAgendaRecsExport] = useState<Record<string, boolean>>({});
  const [activeStepTab, setActiveStepTab] = useState<Record<number, number>>({}); // Maps eventId -> step tab index
  const [agendaFormTitle, setAgendaFormTitle] = useState("");
  const [agendaFormDuration, setAgendaFormDuration] = useState(15);
  const [agendaFormSpecialistId, setAgendaFormSpecialistId] = useState("");

  const [copiedEventId, setCopiedEventId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalEvent, setExportModalEvent] = useState<EventItem | null>(null);

  // Helper date-to-day name
  const getDayNameFromDate = (dateStr: string) => {
    try {
      const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const d = new Date(dateStr);
      return days[d.getDay()];
    } catch {
      return "اليوم المحدد";
    }
  };

  // Format date in Arabic (e.g. 14 يونيو 2026م)
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
      const day = curr.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
      if (day !== 5 && day !== 6) { // Exclude Friday (5) and Saturday (6)
        count++;
      }
    }
    return curr.toISOString().split('T')[0];
  };

  // Helper to determine active next step (3-step workflow: 1. تجهيز التوصية والمسودة, 2. إحالة التوصية, 3. مراجعة الاعتمادات)
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

  // Helper to update specific event workflow fields and commit to parent and localStorage
  const updateEventWorkflow = (eventId: any, updates: Partial<any>) => {
    if (String(eventId).startsWith("custom-rec-")) {
      const dbRec = allDbRecommendations.find(r => String(r.id) === String(eventId));
      if (dbRec) {
        updateFirebaseRecommendation(String(eventId), { ...dbRec, ...updates });
      }
      return;
    }
    
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (targetEvent && !canUserEditCommittee(targetEvent.committeeName)) {
      setAlertState({ isOpen: true, message: "عذراً، لا تملك الصلاحية لتعديل فعاليات هذه اللجنة. يمكنك فقط إدارة فعاليات اللجان المكلف بها.", onClose: () => {} });
      return;
    }
    setEvents(prev => prev.map(evt => {
      if (String(evt.id) === String(eventId)) {
        const updated = { ...evt, ...updates };
        
        // Dynamic Quorum side-effect: automatically check if quorum is met and update status
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => m.committeeId === updated.committeeId && m.active !== false);
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
        return updated;
      }
      return evt;
    }));
  };

  // Generate dynamic invitation template text
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

  // Generate dynamic preparations template text
  const getGeneratedPreparations = (e: EventItem) => {
    if (e.preparationsText) return e.preparationsText;
    
    const day = getDayNameFromDate(e.date);
    const titleText = e.title || "اللقاء";
    
    const arabicDate = formatDateArabicStyle(e.date);
    const arabicTime = formatTimeArabicStyle(e.time);
    
    const presentCount = e.confirmedAttendees ? e.confirmedAttendees.length : 0;
    const commMembersCount = allMembers.filter(m => String(m.committeeId) === String(e.committeeId)).length;
    const totalCount = presentCount || commMembersCount || 1;
    const membersWord = `${totalCount} أعضاء`;

    const currentPreps = e.preparationsChecklist !== undefined ? e.preparationsChecklist : DEFAULT_PREPARATIONS;
    
    // Format the items list dynamically
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

  // Form state
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
    const comm = committees.find(c => String(c.id) === String(newCommitteeId));
    const specialistValue = comm?.specialist ? `${comm.specialist} (أخصائي اللجنة)` : "أخصائي اللجنة";
    const options = [];
    options.push({ value: specialistValue, label: specialistValue });
    allMembers.filter(m => String(m.committeeId) === String(newCommitteeId)).forEach(m => {
      options.push({ value: `${m.role} - ${m.title} ${m.name}`, label: `${m.title} ${m.name} (${m.role})` });
    });
    
    if (newRecAssignee && !options.find(o => o.value === newRecAssignee)) {
      options.push({ value: newRecAssignee, label: newRecAssignee });
    }
    
    return options;
  }, [allMembers, committees, newCommitteeId, newRecAssignee]);
  const [newStatus, setNewStatus] = useState<EventItem["status"]>("تجهيز الفعاليات");
  const [newLocation, setNewLocation] = useState<"حضوري" | "عن بعد">("حضوري");
  const [newEmployees, setNewEmployees] = useState<string[]>([]);
  const [newMembers, setNewMembers] = useState<number[]>([]);
  const [newNotes, setNewNotes] = useState("");

  // Single specific form state
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
    if (isSeqManuallyEdited) return; // skip auto-calculating if user manually changed it
    if (newType === "مفردة" && newCommitteeId > 0) {
      const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { return; }
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
    if (commName && !canUserEditCommittee(commName)) { return; }
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

  // Series specific form state
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
  
  // Series generation state
  const [generatedSchedules, setGeneratedSchedules] = useState<{id: number, date: string, title: string, time: string}[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  // Import recommendations states
  const [importCommitteeId, setImportCommitteeId] = useState<number | string>(0);
  const [importSearchResults, setImportSearchResults] = useState<any[]>([]);
  const [selectedImportRecs, setSelectedImportRecs] = useState<string[]>([]);
  const [isImportSearched, setIsImportSearched] = useState(false);


  
  const getArabicOrdinalGlobal = (n: number | string): string => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return typeof n === "string" ? n : n.toString();
    const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
    if (num >= 0 && num <= 20) return ordinals[num];
    return num.toString();
  };

  const handleSearchImport = () => {
    if (!importCommitteeId) return;
    
    // Find events for the selected committee
    const committeeEvents = events.filter(e => e.committeeId === importCommitteeId);
    let results: any[] = [];
    
    committeeEvents.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item, index) => {
          if (item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation) {
            const isAdded = events.some(e => e.exportedRecommendationsToPage && e.title === item.title && e.committeeId === importCommitteeId);
            results.push({
              eventId: evt.id,
              eventTitle: evt.title,
              agendaId: item.id || String(index),
              title: `توصية البند ${getArabicOrdinalGlobal(index + 1)} "${item.title}"`,
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
    if (commName && !canUserEditCommittee(commName)) { setAlertState({ isOpen: true, message: "غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة", onClose: () => {} }); return; }
    
    for (const rec of selectedRecs) {
      if (rec.isAdded) continue; // Skip if already added
      
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
    setLinkName('');
    setLinkUrl('https://');
    setNewRecLinkPromptState({isOpen: true});
  };

  const confirmAddNewRecLinkAttachment = () => {
    if (linkName && linkUrl) {
      setNewRecAttachments([
        ...newRecAttachments,
        { name: linkName, url: linkUrl }
      ]);
    }
    setNewRecLinkPromptState({isOpen: false});
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
    // Only show events that have exported recommendations (independent Recommendations page)
    if (!e.exportedRecommendationsToPage) return false;

    const term = filterQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      e.title.toLowerCase().includes(term) ||
      e.committeeName.toLowerCase().includes(term)
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
    
    // 1. Gather all agenda items from all events to act as recommendations
    let agendaRecs: any[] = [];
    events.forEach(evt => {
      if (evt.agenda && Array.isArray(evt.agenda)) {
        evt.agenda.forEach((item: any, index: number) => {
          let resolvedAssignee = item.assignee || "غير محدد";
          if (resolvedAssignee === "الأخصائي" || resolvedAssignee === "أخصائي اللجنة") {
              const comm = committees.find(c => c.name === evt.committeeName || String(c.id) === String(evt.committeeId));
              if (comm && comm.specialist) {
                  resolvedAssignee = `أخصائي اللجنة: ${comm.specialist}`;
              }
          }
          if (item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation) {
            agendaRecs.push({
              id: `custom-rec-${evt.id}-${item.id || index}`,
              title: `توصية البند ${getArabicOrdinalGlobal(index + 1)} "${item.title}"`,
              description: item.recommendation,
              recommendationText: item.recommendation,
              committeeName: evt.committeeName || "لجنة غير محددة",
              eventName: evt.title,
              date: evt.date || "2026-06-11",
              time: evt.time || "",
              location: evt.location || "",
              recommendationEventId: evt.id,
              status: "جديدة",
              approvalStage: "أخصائي",
              assignedTo: resolvedAssignee,
              duration: item.durationRec || "أسبوعين",
              isAgendaSource: true
            });
          }
        });
      }
    });

    // 2. Map existing DB recommendations, and merge with agenda items
    let mappedDbMap = new Map();
        [...allDbRecommendations].forEach((rec: any) => {
      if (String(rec.id).startsWith("custom-rec-")) {
        const parts = String(rec.id).split('-');
        if (parts.length >= 4) {
          const evtId = parts[2];
          const itemId = parts.slice(3).join('-');
          const ev = events.find((e: any) => String(e.id) === String(evtId));
          if (ev && ev.agenda) {
            const agItem = ev.agenda.find((a: any, idx: number) => (a.id === itemId) || (String(idx) === itemId));
            if (agItem && agItem.inactiveRecommendation) {
              return; // Skip inactive
            }
          }
        }
      }

      let resolvedAssignee = rec.recommendationAssignee || rec.assignedTo || "غير محدد";
      if (resolvedAssignee === "الأخصائي" || resolvedAssignee === "أخصائي اللجنة") {
          const comm = committees.find(c => c.name === rec.committeeName || String(c.id) === String(rec.committeeId));
          if (comm && comm.specialist) {
              resolvedAssignee = `أخصائي اللجنة: ${comm.specialist}`;
          }
      }
      mappedDbMap.set(String(rec.id), {
        isAgendaSource: String(rec.id).startsWith("custom-rec-"),
        ...rec,
        recommendationAssignee: resolvedAssignee,
        assignedTo: resolvedAssignee,
        id: rec.id,
        title: rec.title || rec.description || "توصية غير مسماة",
        committeeName: rec.committeeName || "غير محدد",
        date: rec.date || "2026-06-11",
        status: rec.status || "جديدة",
        recommendationType: true,
        isRealEvent: false
      });
    });

    // Patch DB recs using agenda recs (fix missing titles, assignees) and add unexported ones
    agendaRecs.forEach(ar => {
      if (mappedDbMap.has(ar.id)) {
        let existing = mappedDbMap.get(ar.id);
        // Patch bad titles
        if (!existing.title || existing.title.includes("غير مسماة") || existing.title === existing.description) {
           existing.title = ar.title;
        }
        if (!existing.recommendationAssignee || existing.recommendationAssignee === "غير محدد") {
           existing.recommendationAssignee = ar.assignedTo;
        }
        if (!existing.time) existing.time = ar.time;
        if (!existing.location) existing.location = ar.location;
        if (!existing.recommendationEventId) existing.recommendationEventId = ar.recommendationEventId;
      } else {
        // Not exported to DB yet! Add it to the table view anyway.
        mappedDbMap.set(ar.id, {
          ...ar,
          recommendationAssignee: ar.assignedTo,
          recommendationType: true,
          isRealEvent: false
        });
      }
    });

    let mappedDb = Array.from(mappedDbMap.values());

    // Get standalone recommendations from events (they have recommendationType)
    let mappedStandalone = events
       .filter(e => !!e.recommendationType)
       .map(e => {
           let resolvedAssignee = e.employees && e.employees.length > 0 ? e.employees[0] : (e.recommendationAssignee || "غير محدد");
           if (resolvedAssignee === "الأخصائي" || resolvedAssignee === "أخصائي اللجنة") {
              const comm = committees.find(c => c.name === e.committeeName || String(c.id) === String(e.committeeId));
              if (comm && comm.specialist) {
                  resolvedAssignee = `أخصائي اللجنة: ${comm.specialist}`;
              }
           }
           return {
          ...e,
          id: e.id,
          title: e.title || "توصية غير مسماة",
          committeeName: e.committeeName || "غير محدد",
          date: e.date || "2026-06-11",
          status: e.status || "جديدة",
          recommendationAssignee: resolvedAssignee,
          recommendationEventId: e.id,
          time: e.time || "",
          location: e.location || "",
          recommendationType: e.recommendationType || true,
          isRealEvent: false
       }; });

    let combined = [...mappedDb, ...mappedStandalone];

    if (term) {
       combined = combined.filter(r => 
         (r.title && r.title.toLowerCase().includes(term)) ||
         (r.committeeName && r.committeeName.toLowerCase().includes(term))
       );
    }
    
    // Sort by date (descending)
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allDbRecommendations, events, filterQuery]);

  const sortedTableEvents = React.useMemo(() => {
    const list = [...filteredEvents];
    const nowTimestamp = Date.now();
    
    return list.sort((a, b) => {
      const aComp = isEventCompleted(a);
      const bComp = isEventCompleted(b);
      
      if (aComp && !bComp) return 1;
      if (!aComp && bComp) return -1;
      
      const timeValA = getEventTimeValue(a);
      const timeValB = getEventTimeValue(b);
      
      const diffA = Math.abs(timeValA - nowTimestamp);
      const diffB = Math.abs(timeValB - nowTimestamp);
      
      return diffA - diffB;
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
    
    // reset single
    setSingleKind("");
    setSingleClassification("");
    setSingleEventNumber("الأول");
    setSingleTime("");
    setSingleRoom("");
    setSingleEmployee(dynamicEmployees[0] || "");
    
    // reset series
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

  const handleOpenEdit = (evt: any) => {
    if (evt.committeeName && !canUserEditCommittee(evt.committeeName)) {
      setAlertState({ isOpen: true, message: "عذراً، لا تملك الصلاحية لتعديل هذه الفعالية. يمكنك فقط تعديل فعاليات اللجان المكلف بها.", onClose: () => {} });
      return;
    }
    setEditingEvent(evt);
    setNewTitle(evt.title || "");
    setIsTitleManuallyEdited(true);
    setNewType(evt.type || "مفردة");
    setNewDate(evt.date || "");
    setNewCommitteeId(evt.committeeId || 0);
    setNewStatus(evt.status || "");
    setNewLocation(evt.location || "");
    setNewEmployees(evt.employees || []);
    setNewMembers(evt.members || []);
    setNewNotes(evt.notes || "");
    
    // Set Recommendation specific fields
    const isAgendaSource = evt.isAgendaSource || String(evt.id).startsWith("custom-rec-");
    let derivedEventId = evt.recommendationEventId || "";
    if (isAgendaSource && !derivedEventId) {
      const parts = String(evt.id).split("-");
      if (parts.length >= 3) {
        derivedEventId = parts[2];
      }
    }
    
    // Find committeeId from committeeName if missing (often missing in exported recommendations)
    let derivedCommitteeId = evt.committeeId || 0;
    if (!derivedCommitteeId && evt.committeeName) {
      const comm = committees.find(c => c.name === evt.committeeName);
      if (comm) {
        derivedCommitteeId = comm.id;
        setNewCommitteeId(comm.id);
      }
    }

    setNewRecTitle(evt.title || "");
    setNewRecType(evt.recommendationType || (isAgendaSource ? "عادية" : ""));
    setNewRecClassification(evt.recommendationClassification || (isAgendaSource ? "عادية" : ""));
    setNewRecEventId(derivedEventId);
    setNewRecPassMethod(evt.recommendationPassMethod || "عبر البريد الإلكتروني");
    setNewRecDiscussion(evt.recommendationDiscussion || evt.discussion || "");
    setNewRecText(evt.recommendationText || evt.description || evt.notes || "");
    
    // Try to get assignee properly
    let assigned = evt.recommendationAssignee || evt.assignedTo || (evt.employees && evt.employees[0]) || "";
    if (assigned === "غير محدد") assigned = "";
    
    const commForAssignee = committees.find(c => String(c.id) === String(derivedCommitteeId));
    if (commForAssignee && commForAssignee.specialist) {
        if (assigned === "الأخصائي" || assigned === "أخصائي اللجنة" || (assigned.includes(commForAssignee.specialist) && assigned.includes("أخصائي"))) {
            assigned = `${commForAssignee.specialist} (أخصائي اللجنة)`;
        }
    }
    setNewRecAssignee(assigned);
    
    let duration = evt.recommendationDuration || evt.duration || "";
    if (duration === "غير محدد") duration = "";
    setNewRecDuration(duration);
    
    setNewRecAttachments(evt.recommendationAttachments || evt.attachments || "");

    if (evt.type === "مفردة") {
      setSingleTime(evt.time || "");
      setSingleRoom(evt.location || "");
      setSingleEmployee((evt.employees && evt.employees[0]) || "");
    } else if (evt.type === "متسلسلة") {
      setSeriesTime(evt.time || "");
      setSeriesRooms(evt.location ? evt.location.split("،").map((s: string) => s.trim()) : []);
      setSeriesAssignedEmployee((evt.employees && evt.employees[0]) || "");
    }

    setIsAddOpen(true);
  };

  const handleOpenDelete = (evt: EventItem) => {
    if (!canUserEditCommittee(evt.committeeName)) {
      setAlertState({ isOpen: true, message: "عذراً، لا تملك الصلاحية لحذف هذه الفعالية. يمكنك فقط تعديل فعاليات اللجان المكلف بها.", onClose: () => {} });
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
    if (!newCommitteeId || newCommitteeId === 0) { setAlertState({ isOpen: true, message: "يرجى اختيار اللجنة أولاً", onClose: () => {} }); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { setAlertState({ isOpen: true, message: "غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة", onClose: () => {} }); return; }
    const classifStr = seriesClassification === "دوري" ? "الدوري" : seriesClassification === "استثنائي" ? "الاستثنائي" : seriesClassification === "طارئ" ? "الطارئ" : seriesClassification === "فريق عمل" ? "فريق العمل" : seriesClassification;
    const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
    const prefixToMatch = `${seriesKind} ${formattedCommName} ${classifStr}`.trim();
    let existingCount = events.filter(e => e.committeeId === newCommitteeId && e.title.startsWith(prefixToMatch)).length;
    
    const current = new Date(start);
    let tempId = 1;
    while (current <= end) {
      if (current.getDay() === targetDay) {
        // Occurrence is 0-indexed in month
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
        const evtRooms = evt.location.split('،').map(r => r.trim());
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

  const handleInsertSeries = () => {
    if (!newCommitteeId || newCommitteeId === 0) { setAlertState({ isOpen: true, message: "يرجى اختيار اللجنة أولاً", onClose: () => {} }); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { setAlertState({ isOpen: true, message: "غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة", onClose: () => {} }); return; }
    const selectedGen = generatedSchedules.filter(s => selectedSchedules.includes(s.id));
    
    // Check conflicts
    for (const gen of selectedGen) {
      const conflict = checkConflict(gen.date, gen.time, seriesRooms, [seriesAssignedEmployee].filter(Boolean));
      if (conflict) {
        setConflictWarning(conflict);
        return;
      }
    }

    const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx, // unique ID
      title: gen.title,
      type: "م مفردة",
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
    // fix previously set wrong type
    newEventsList.forEach(e => e.type = "مفردة");

    setEvents([...newEventsList, ...events]);
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
      // This is handled by handleImportSelected now, but just in case
      return;
    }

    if (!newRecTitle.trim() || !newCommitteeId) return;

    if (!newCommitteeId || newCommitteeId === 0) { setAlertState({ isOpen: true, message: "يرجى اختيار اللجنة أولاً", onClose: () => {} }); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { setAlertState({ isOpen: true, message: "غير مصرح لك بجدولة فعاليات أو مهام لهذه اللجنة", onClose: () => {} }); return; }
    const eventName = events.find(ev => ev.id === Number(newRecEventId))?.title || "توصية بالتمرير";

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
        recommendationAttachments: newRecAttachments,
        
        preparationsText: newRecText,
        preparationsAttachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : (editingEvent.preparationsAttachments || [])
      };
      
      if (editingEvent.isAgendaSource || String(editingEvent.id).startsWith("custom-rec-")) {
        // Save to Firebase for agenda exported recommendations
        updateFirebaseRecommendation(editingEvent.id, updatedRec);
      } else {
        // Save to local context for standalone recommendations
        setEvents(events.map(ev => ev.id === editingEvent.id ? updatedRec : ev));
      }
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
        preparationsAttachments: newRecAttachments ? [{ id: '1', name: newRecAttachments, url: '#' }] : []
      };

      setEvents([newRec, ...events]);
    }
    
    // Clear form
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
    setIsAddOpen(false);
  };

    const handleDelete = async () => {
    if (deletingEvent) {
      if (allDbRecommendations.some((r: any) => String(r.id) === String(deletingEvent.id))) {
        if (typeof deleteFirebaseRecommendation === "function") {
          await deleteFirebaseRecommendation(String(deletingEvent.id));
        }
      }
      
      // Regardless if it was in DB or not, if it came from agenda, mark it as inactive!
      if (String(deletingEvent.id).startsWith("custom-rec-")) {
        const parts = String(deletingEvent.id).split('-');
        if (parts.length >= 4) {
          const evtId = parts[2];
          const itemId = parts.slice(3).join('-');
          const evtToUpdate = events.find(e => String(e.id) === String(evtId));
          if (evtToUpdate && evtToUpdate.agenda) {
             const newAgenda = [...evtToUpdate.agenda];
             const itemIndex = isNaN(Number(itemId)) ? newAgenda.findIndex((x: any) => String(x.id) === itemId) : Number(itemId);
             if (itemIndex >= 0 && itemIndex < newAgenda.length) {
                newAgenda[itemIndex] = { ...newAgenda[itemIndex], inactiveRecommendation: true };
                if (typeof updateFirebaseEvent === "function") {
                   await updateFirebaseEvent(String(evtId), { agenda: newAgenda });
                }
             }
          }
        }
      } else if (!allDbRecommendations.some((r: any) => String(r.id) === String(deletingEvent.id))) {
        if (typeof deleteFirebaseEvent === "function") {
          await deleteFirebaseEvent(String(deletingEvent.id));
        }
      }
      setDeletingEvent(null);
    }
  };

    const handleBulkDelete = async () => {
    if (selectedEventIds.length > 0) {
      setIsBulkDeletingLoading(true);
      
      const dbRecIdsToDelete = selectedEventIds.filter(id => allDbRecommendations.some((r: any) => String(r.id) === String(id)));
      const eventIdsToDelete = selectedEventIds.filter(id => events.some((e: any) => String(e.id) === String(id) && !!e.recommendationType));
      const agendaRecsIds = selectedEventIds.filter(id => String(id).startsWith("custom-rec-")); // Include all agenda-based recs!

      const agendaPromises: Promise<any>[] = [];
      if (agendaRecsIds.length > 0) {
         const agendaUpdatesByEvent = new Map<string, string[]>();
         agendaRecsIds.forEach(id => {
            const parts = String(id).split("-");
            if (parts.length >= 4) {
              const evtId = parts[2];
              const itemId = parts.slice(3).join("-");
              if (!agendaUpdatesByEvent.has(evtId)) {
                agendaUpdatesByEvent.set(evtId, []);
              }
              agendaUpdatesByEvent.get(evtId)!.push(itemId);
            }
         });
         
         for (const [evtId, itemIds] of agendaUpdatesByEvent.entries()) {
            const evtToUpdate = events.find(e => String(e.id) === String(evtId));
            if (evtToUpdate && evtToUpdate.agenda) {
               const newAgenda = [...evtToUpdate.agenda];
               let modified = false;
               for (const itemId of itemIds) {
                 const itemIndex = isNaN(Number(itemId)) ? newAgenda.findIndex((x: any) => String(x.id) === itemId) : Number(itemId);
                 if (itemIndex >= 0 && itemIndex < newAgenda.length) {
                    newAgenda[itemIndex] = { ...newAgenda[itemIndex], inactiveRecommendation: true };
                    modified = true;
                 }
               }
               if (modified && typeof updateFirebaseEvent === "function") {
                  agendaPromises.push(updateFirebaseEvent(String(evtId), { agenda: newAgenda }));
               }
            }
         }
      }

      await Promise.all([
        ...(typeof deleteFirebaseRecommendation === "function" ? dbRecIdsToDelete.map(id => deleteFirebaseRecommendation(String(id))) : []),
        ...(typeof deleteFirebaseEvent === "function" ? eventIdsToDelete.map(id => deleteFirebaseEvent(String(id))) : []),
        ...agendaPromises
      ]);

      setSelectedEventIds([]);
      setIsBulkDeletingLoading(false);
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectEvent = (id: any) => {
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

  // Direct card-view recommendation operations states and helper handlers
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

    // Check if transient agenda item
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
        committeeName: chosenEvent.committeeName || "غير محدد",
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

    // Update standard database recommendation
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


  const handleCustomLinkAttachment = (evtId: number, currentAttachments: any[]) => {
    setPromptState({
      isOpen: true,
      message: "الرجاء إدخال رابط جوجل درايف (Google Drive Link):",
      defaultValue: "https://drive.google.com/...",
      onConfirm: (val) => {
        if (!val || val.trim() === "" || val === "https://drive.google.com/...") return;
        setPromptState({
           isOpen: true,
           message: "تأكيد مسار الحفظ (اختياري):",
           defaultValue: "/Google Drive/Links",
           onConfirm: (pathVal) => {
              const newAtt = {
                 name: "رابط خارجي (جوجل درايف)",
                 size: "Link",
                 date: new Date().toLocaleDateString('ar-SA'),
                 link: val
              };
              updateEventWorkflow(evtId, { attachments: [...(currentAttachments || []), newAtt] });
              setAlertState({ isOpen: true, message: "تم إضافة الرابط بنجاح.", onClose: () => {} });
           },
           onCancel: () => {}
        });
      },
      onCancel: () => {}
    });
  };
  return (
    <div className="space-y-6 pb-16 text-right" dir="rtl">
      {/* Dynamic Header Toolbar */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-center gap-4.5">
          <div className="w-13 h-13 rounded-2.5xl bg-brand/10 border border-[#dfba6b]/30 flex items-center justify-center text-brand shrink-0">
            <Sliders className="w-6.5 h-6.5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
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
              <span className="text-lg font-black text-brand leading-none font-mono">{events.length}</span>
            </div>
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">منتهية</span>
              <span className="text-lg font-black text-emerald-600 leading-none font-mono">
                {events.filter(e => e.status === "منتهية").length}
              </span>
            </div>
          </div>

        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
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
          <div className="bg-[#e8e4e4] border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 font-sans">
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
                <>
                  <span className="text-gray-400 font-bold font-mono">/</span>
                  <button
                    onClick={() => {
                      setSelectedEventIdForCards(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedEventIdForCards === null
                        ? "bg-[#dfba6b] text-[#1e293b] shadow-sm font-black animate-pulse"
                        : "bg-white/80 text-gray-705 hover:bg-white border border-gray-300/65"
                    }`}
                  >
                    <Users2 className="w-3.5 h-3.5" />
                    <span>
                      {committees.find((c) => c.id === selectedCommIdForCards)?.name || "التحميل..."}
                    </span>
                  </button>
                </>
              )}

              {selectedCommIdForCards !== null && selectedEventIdForCards !== null && (
                <>
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
                </>
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
                  const agendaCount = (chosenEvent?.agenda || []).filter(
                    (g: any) => g.recommendation && g.recommendation.trim() !== ""
                  ).length;
                  return dbRecommendationsCount + agendaCount;
                })()}
              </span>{" "}
              عنصر ضمن التصفح الحالي
            </div>
          </div>
          {/* Main 3-Screen Drill-down Container */}
          {selectedCommIdForCards === null ? (
            /* Screen 1: Committees Grid (الرئيسية - لوحة اللجان) */
            <div className="space-y-6 text-right font-sans" dir="rtl">
              <div className="bg-[#e8e4e4] p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-5 bg-brand rounded-full inline-block animate-pulse"></span>
                    <span>لوحة اللجان</span>
                  </h3>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    اختر أحد اللجان التالية لاستعراض سجل اجتماعاتها وحصر التوصيات الصادرة عنها
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {committees.map((comm) => {
                  // Count events/meetings under this committee
                  const commSessions = events.filter((e) => String(e.committeeId) === String(comm.id) && (!e.recommendationType && !e.recommendationClassification));
                  const sessionsCount = commSessions.length;

                  // Count recommendations under this committee
                  const dbRecsCount = allDbRecommendations.filter((rec: any) => {
                    const matchedEvent = events.find((e) => e.title === rec.eventName || String(rec.id).includes(`custom-rec-${e.id}-`));
                    return matchedEvent?.committeeId === comm.id;
                  }).length;
                  
                  const standaloneRecsCount = events.filter((e) => String(e.committeeId) === String(comm.id) && !!e.recommendationType).length;
                  const commRecsCount = dbRecsCount + standaloneRecsCount;

                  return (
                    <motion.div
                      key={comm.id}
                      onClick={() => setSelectedCommIdForCards(comm.id)}
                      className="bg-[#e8e4e4] hover:bg-[#e2dede] border border-gray-200 hover:border-brand/40 hover:shadow-md transition-all duration-300 rounded-3xl p-6 relative flex flex-col justify-between space-y-6 cursor-pointer group"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="p-2.5 rounded-2xl bg-brand/10 text-brand group-hover:scale-110 transition-transform duration-200">
                            <BookOpen className="w-6 h-6" />
                          </span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-black border border-emerald-200">
                            نشط
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-black text-slate-800 leading-snug group-hover:text-brand transition-colors">
                            {comm.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-extrabold line-clamp-2 min-h-[32px] tracking-wide">
                            {comm.description || "لا يوجد وصف إضافي متوفر لهذه اللجنة."}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-300/80 flex items-center justify-between text-xs font-bold text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>الاجتماعات: {sessionsCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-brand font-black">التوصيات: {commRecsCount}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>) : selectedEventIdForCards === null ? (
            /* Screen 2: List of Meetings inside Selected Committee */
            <div className="space-y-6 text-right" dir="rtl">
              <div className="bg-[#e8e4e4] p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      الاجتماعات المسجلة
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">
                      اللجنة: {committees.find((c) => c.id === selectedCommIdForCards)?.name || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommIdForCards(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-slate-700 font-black text-xs rounded-xl border border-gray-300 transition duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <List className="w-4 h-4" />
                  <span>الرجوع للوحة اللجان</span>
                </button>
              </div>

              {(() => {
                let commEvents = events.filter((e) => e.committeeId === selectedCommIdForCards && (!e.recommendationType && !e.recommendationClassification));
                commEvents = commEvents.sort((a, b) => {
                  const dateA = new Date(a.date || "").getTime();
                  const dateB = new Date(b.date || "").getTime();
                  if (dateA !== dateB) {
                    return dateA - dateB; // Oldest first
                  }
                  const titleA = a.title || "";
                  const titleB = b.title || "";
                  return titleA.localeCompare(titleB, 'ar');
                });
                const standaloneRecs = events.filter((e) => e.committeeId === selectedCommIdForCards && !!e.recommendationType);

                if (commEvents.length === 0 && standaloneRecs.length === 0) {
                  return (
                    <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                      <div className="w-16 h-16 rounded-full bg-white/70 border border-gray-300 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Calendar className="w-8 h-8" />
                      </div>
                      لا توجد أية اجتماعات مسجلة لهذه اللجنة حالياً.
                
      {newRecLinkPromptState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] max-w-[90vw] font-sans border border-gray-100">
            <h3 className="text-sm font-black text-slate-800 mb-4">إضافة رابط مرفق</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المرفق</label>
                <input 
                  type="text" 
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-bold"
                  placeholder="مثال: المستند الفني"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">الرابط</label>
                <input 
                  type="url" 
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-bold text-left bg-slate-50"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setNewRecLinkPromptState({isOpen: false})}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmAddNewRecLinkAttachment}
                className="px-4 py-2 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

                return (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commEvents.map((evt) => {
                      // Calculate recommendation count for this meeting/event
                      const dbRecommendationsCount = allDbRecommendations.filter((rec: any) =>
                        String(rec.id).startsWith(`custom-rec-${evt.id}-`) ||
                        (rec.eventName && rec.eventName === evt.title)
                      ).length;
                      const agendaCount = (evt.agenda || []).filter(
                        (g: any) => g.recommendation && g.recommendation.trim() !== "" && !g.inactiveRecommendation
                      ).length;
                      const totalRecs = dbRecommendationsCount + agendaCount;

                      // Extract date and day details
                      const dayName = evt.date ? getDayNameFromDate(evt.date) : "غير محدد";
                      const dateStr = evt.date || "غير محدد";
                      const timeStr = evt.time ? formatTime12h(evt.time) : "";

                      return (
                        <motion.div
                          key={evt.id}
                          layoutId={`meet-card-${evt.id}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#e8e4e4] hover:bg-[#e2dede] border border-gray-200 hover:border-brand/40 hover:shadow-md transition-all duration-300 rounded-3xl p-6 relative flex flex-col justify-between space-y-5"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-block px-2.5 py-1 text-[10px] font-black rounded-lg bg-white/90 text-slate-700 border border-gray-305">
                                {evt.type || "رسمي"}
                              </span>
                              <span className="inline-block px-2.5 py-1 text-[10px] font-black rounded-lg bg-brand/20 text-slate-900 border border-brand/25">
                                {evt.status || "مؤكد"}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-slate-850 leading-snug shrink-0 min-h-[40px]">
                              {(() => {
                                if (evt.recommendationClassification === "بالتمرير") return evt.title;
                                if (evt.recommendationEventId && evt.recommendationEventId !== "unlinked") {
                                    const linkedEvent = events.find(e => String(e.id) === String(evt.recommendationEventId));
                                    if (linkedEvent) return linkedEvent.title;
                                }
                                return evt.title;
                              })()}
                            </h4>

                            <div className="space-y-2 text-xs font-bold text-gray-700 bg-white/75 p-4 rounded-2xl border border-gray-300/60 shadow-sm">
                              <div className="flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-gray-500" />
                                <span>اللجنة: {evt.committeeName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-brand">
                                <List className="w-3.5 h-3.5" />
                                <span>الاجتماع: {evt.eventName || "توصية مباشرة"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                <span>يوم {dayName} الموافق {dateStr}</span>
                              </div>
                              {timeStr && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                                  <span>الساعة {timeStr}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                <span>{evt.location || "القاعة الرئيسية"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-300/85 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-blue-800 bg-blue-50/90 border border-blue-200 px-3 py-1 rounded-lg">
                              {totalRecs} توصية مسجلة
                            </span>
                            <button
                              onClick={() => {
                                setSelectedEventIdForCards(evt.id);
                              }}
                              className="px-4 py-2 bg-brand text-white hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-xs rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center gap-1"
                            >
                              <span>تصفح التوصيات</span>
                              <span>←</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {standaloneRecs.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-black text-slate-800">التوصيات المباشرة (خارج الاجتماعات)</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {standaloneRecs.map((rec: any, idx: number) => {
                          const statusStr = rec.status || "جديدة";
                          let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
                          let statusTextLabel = "توصية جديدة";

                          if (statusStr.includes("منجز") || statusStr.includes("مكتمل") || statusStr === "منجزة") {
                            badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            statusTextLabel = "توصية منجزة";
                          } else if (statusStr.includes("متأخر")) {
                            badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
                            statusTextLabel = "توصية متأخرة";
                          } else if (statusStr.includes("جاري")) {
                            badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
                            statusTextLabel = "جاري العمل عليها";
                          }

                          const approvalStagesList = ["أخصائي", "رئيس قسم", "مدير الإدارة", "مكتملة"];
                          const currentStageText = rec.approvalStage || "أخصائي";
                          
                          let mappedIdx = 0;
                          if (currentStageText.includes("أخصائي")) mappedIdx = 0;
                          else if (currentStageText.includes("رئيس")) mappedIdx = 1;
                          else if (currentStageText.includes("مدير")) mappedIdx = 2;
                          else if (currentStageText.includes("مكتمل") || currentStageText.includes("منجز")) mappedIdx = 3;

                          return (
                            <motion.div
                              key={`standalone-${rec.id}`}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`bg-[#e8e4e4] hover:bg-[#e2dede] border border-gray-200 hover:border-brand/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-6 text-right relative`}
                            >
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-black rounded-lg border ${badgeBg}`}>
                                      {statusTextLabel}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold bg-white/50 px-2 py-0.5 rounded border border-gray-200 text-center">
                                      المكلف: {rec.assignedTo || rec.recommendationAssignee || (rec.employees && rec.employees[0]) || "غير محدد"}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-brand font-bold bg-[#dfba6b]/10 border border-[#dfba6b]/20 px-2 py-0.5 rounded-lg">
                                    توصية مباشرة
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-sm font-black text-slate-850 leading-snug">
                                    {rec.title}
                                  </h4>
                                  <p className="text-xs text-gray-700 font-semibold leading-relaxed bg-white/75 p-4 rounded-xl border border-gray-300/60 shadow-sm min-h-[50px]">
                                    {rec.notes || rec.recommendationText || "لا يوجد وصف"}
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm">
                                    <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span className="truncate">المسؤول: {rec.recommendationAssignee || (rec.employees && rec.employees[0]) || "غير محدد"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm font-sans">
                                    <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span>المدة: {rec.recommendationDuration || "غير محدد"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white/75 p-4 rounded-2.5xl border border-gray-300/60 shadow-sm space-y-3">
                                <div className="text-[10px] text-gray-500 font-extrabold flex items-center justify-between">
                                  <span>تتبع مسار الاعتماد الإداري للتوصية</span>
                                  <span className="text-brand font-black bg-[#dfba6b]/10 px-2 py-0.5 rounded-md border border-[#dfba6b]/20">
                                    المرحلة الحالية: {currentStageText}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between relative pt-1" dir="rtl">
                                  {approvalStagesList.map((st, i) => {
                                    const isPassed = i <= mappedIdx;
                                    const isCurrent = i === mappedIdx;
                                    return (
                                      <div key={st} className="flex flex-col items-center flex-1 relative z-10">
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                            isPassed
                                              ? "bg-brand text-[#1e293b] font-black scale-110 shadow-md ring-4 ring-brand/10"
                                              : "bg-gray-300 text-gray-500"
                                          }`}
                                        >
                                          {i + 1}
                                        </div>
                                        <span
                                          className={`text-[9px] font-extrabold mt-1.5 transition-colors ${
                                            isCurrent
                                              ? "text-brand font-black"
                                              : isPassed
                                              ? "text-slate-800 font-semibold"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {st}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  <div className="absolute top-[11px] right-[10%] left-[10%] h-0.5 bg-gray-200 -z-0 rounded-full" />
                                  <div
                                    className="absolute top-[11px] right-[10%] h-0.5 bg-brand -z-0 transition-all duration-500 rounded-full"
                                    style={{ width: `${(mappedIdx / 3) * 80}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  {mappedIdx < 3 ? (
                                    <button
                                      onClick={() => {
                                        // This page does not support standalone rec status update via same handler easily, 
                                        // but we can route it via handleUpdateStandaloneRecommendationStatus
                                      }}
                                      className="px-3 py-1.5 bg-brand hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-[10px] rounded-lg transition text-white shadow-sm opacity-50 cursor-not-allowed"
                                    >
                                      الترقية من الجدول فقط
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-800 font-black bg-emerald-50 px-2 py-1 rounded-md border border-emerald-250">
                                      ✓ معتمدة بالكامل
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
                );
              })()}
            </div>
          ) : (
            /* Screen 3: List of Recommendations inside Selected Event */
            <div className="space-y-6 text-right" dir="rtl">
              {(() => {
                const chosenEvent = events.find((e) => e.id === selectedEventIdForCards);
                if (!chosenEvent) {
                  return (
                    <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                      تعذر العثور على بيانات الفعالية المحددة.
                    </div>
                  );
                }

                // Gather recommendations
                const dbRecommendations = allDbRecommendations.filter((rec: any) =>
                  String(rec.id).startsWith(`custom-rec-${selectedEventIdForCards}-`) ||
                  (rec.eventName && rec.eventName === chosenEvent.title && rec.committeeName === chosenEvent.committeeName)
                );

                const agendaRecsForCards = (chosenEvent.agenda || [])
                  .filter((item: any) => item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation)
                  .map((item: any, index: number) => {
                    return {
                      id: `custom-rec-${chosenEvent.id}-${item.id || index}`,
                      title: `توصية البند ${getArabicOrdinalGlobal(index + 1)} "${item.title}"`,
                      description: item.recommendation,
                      recommendationText: item.recommendation,
                      committeeName: chosenEvent.committeeName || "لجنة غير محددة",
                      eventName: chosenEvent.title,
                      date: chosenEvent.date || "2026-06-11",
                      status: "جديدة",
                      approvalStage: "أخصائي",
                      assignedTo: item.assignee || "غير محدد",
                      duration: item.durationRec || "أسبوعين",
                      isAgendaSource: true
                    };
                  });
                  
                const standaloneLinkedRecs = events
                  .filter(e => !!e.recommendationType && String(e.recommendationEventId) === String(chosenEvent.id))
                  .map(e => ({
                      ...e,
                      id: e.id,
                      title: e.title || "توصية غير مسماة",
                      description: e.description || e.notes || "",
                      recommendationText: e.recommendationText || e.description || "",
                      committeeName: e.committeeName || "غير محدد",
                      eventName: chosenEvent.title,
                      date: e.date || "2026-06-11",
                      status: e.status || "جديدة",
                      approvalStage: e.approvalStage || "أخصائي",
                      assignedTo: e.recommendationAssignee || (e.employees && e.employees.length > 0 ? e.employees[0] : "غير محدد"),
                      duration: e.recommendationDuration || "غير محدد",
                      isRealEvent: false
                  }));
                
                const combinedRecsMap = new Map();
                // We'll also deduplicate by title or recommendation text to avoid old ghosts
                const seenKeys = new Set();
                
                dbRecommendations.forEach((dr: any) => {
                  combinedRecsMap.set(String(dr.id), { ...dr });
                  if (dr.title) seenKeys.add(dr.title);
                  if (dr.recommendationText) seenKeys.add(dr.recommendationText);
                  if (dr.description) seenKeys.add(dr.description);
                });
                
                standaloneLinkedRecs.forEach((sr: any) => {
                  if (!combinedRecsMap.has(String(sr.id))) {
                    combinedRecsMap.set(String(sr.id), sr);
                    if (sr.title) seenKeys.add(sr.title);
                    if (sr.recommendationText) seenKeys.add(sr.recommendationText);
                    if (sr.description) seenKeys.add(sr.description);
                  }
                });
                
                agendaRecsForCards.forEach((ar: any) => {
                  if (!combinedRecsMap.has(String(ar.id)) && !seenKeys.has(ar.title) && !seenKeys.has(ar.description) && !seenKeys.has(ar.recommendationText)) {
                    // It's nowhere to be found, add it
                    combinedRecsMap.set(String(ar.id), ar);
                    if (ar.title) seenKeys.add(ar.title);
                    if (ar.recommendationText) seenKeys.add(ar.recommendationText);
                    if (ar.description) seenKeys.add(ar.description);
                  } else {
                    // We found it by ID or by text. If it was by ID, let's update it with better info if it's lacking
                    if (combinedRecsMap.has(String(ar.id))) {
                      let existing = combinedRecsMap.get(String(ar.id));
                      if (!existing.title || existing.title.includes("غير مسماة") || existing.title === existing.description) {
                         existing.title = ar.title;
                      }
                      if (!existing.assignedTo || existing.assignedTo === "غير محدد") {
                         existing.assignedTo = ar.assignedTo;
                      }
                    } else {
                       // Try to find it by text to enrich it
                       for (const [key, val] of combinedRecsMap.entries()) {
                         if (val.title === ar.title || val.description === ar.description || val.recommendationText === ar.recommendationText) {
                            if (!val.title || val.title.includes("غير مسماة") || val.title === val.description) {
                              val.title = ar.title;
                            }
                            if (!val.assignedTo || val.assignedTo === "غير محدد") {
                              val.assignedTo = ar.assignedTo;
                            }
                            break;
                         }
                       }
                    }
                  }
                });
                
                let combinedRecs = Array.from(combinedRecsMap.values());
                
                // Final aggressive deduplication based on exact description or title matches just in case
                const finalUniqueRecs = [];
                const finalSeen = new Set();
                for (const r of combinedRecs) {
                   const key = r.description?.trim() || r.recommendationText?.trim() || r.title?.trim() || r.id;
                   if (!finalSeen.has(key)) {
                     finalSeen.add(key);
                     finalUniqueRecs.push(r);
                   }
                }
                combinedRecs = finalUniqueRecs;

                return (
                  <div className="space-y-6">
                    {/* Screen 3 Toolbar Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#e8e4e4] p-6 rounded-3xl border border-gray-200 shadow-sm">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-6 bg-brand rounded-full inline-block animate-pulse"></span>
                          <h3 className="text-base font-black text-slate-800 leading-snug">
                            توصيات: <span className="text-brand">{chosenEvent.title}</span>
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 font-bold mt-1">
                          يمكنك تتبع مسارات الاعتماد وتحديث الحالات والتواصل بشأن هذه التوصيات
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => setSelectedEventIdForCards(null)}
                          className="px-4 py-2.5 bg-white hover:bg-gray-50 text-slate-700 font-black text-xs rounded-xl border border-gray-300 transition duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <List className="w-4 h-4" />
                          <span>الرجوع للاجتماعات ↑</span>
                        </button>
                      </div>
                    </div>

                    {combinedRecs.length === 0 ? (
                      <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                        <div className="w-16 h-16 rounded-full bg-white/70 border border-gray-300 flex items-center justify-center mx-auto mb-4 text-slate-400">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        لا توجد توصيات مسجلة لهذا الاجتماع حالياً.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {combinedRecs.map((rec: any, idx: number) => {
                          const statusStr = rec.status || "جديدة";
                          let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
                          let statusTextLabel = "توصية جديدة";

                          if (statusStr.includes("منجز") || statusStr.includes("مكتمل") || statusStr === "منجزة") {
                            badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            statusTextLabel = "توصية منجزة";
                          } else if (statusStr.includes("متأخر")) {
                            badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
                            statusTextLabel = "توصية متأخرة";
                          } else if (statusStr.includes("جاري")) {
                            badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
                            statusTextLabel = "جاري العمل عليها";
                          }

                          // Tracker Stages
                          const approvalStagesList = ["أخصائي", "رئيس قسم", "مدير الإدارة", "مكتملة"];
                          const currentStageText = rec.approvalStage || "أخصائي";
                          
                          let mappedIdx = 0;
                          if (currentStageText.includes("أخصائي")) mappedIdx = 0;
                          else if (currentStageText.includes("رئيس")) mappedIdx = 1;
                          else if (currentStageText.includes("مدير")) mappedIdx = 2;
                          else if (currentStageText.includes("مكتمل") || currentStageText.includes("منجز")) mappedIdx = 3;

                          return (
                            <motion.div
                              key={rec.id || idx}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`bg-[#e8e4e4] hover:bg-[#e2dede] border border-gray-200 hover:border-brand/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between space-y-6 text-right relative`}
                            >
                              {/* Card Header & Badges */}
                              <div className="space-y-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-black rounded-lg border ${badgeBg}`}>
                                      {statusTextLabel}
                                    </span>
                                    <span className="text-[10px] text-gray-600 font-bold bg-white/50 px-2 py-0.5 rounded border border-gray-200 text-center">
                                      المكلف: {rec.assignedTo || rec.recommendationAssignee || (rec.employees && rec.employees[0]) || "غير محدد"}
                                    </span>
                                  </div>
                                  {rec.isAgendaSource && (
                                    <span className="text-[10px] text-brand font-bold bg-[#dfba6b]/10 border border-[#dfba6b]/20 px-2 py-0.5 rounded-lg animate-pulse">
                                      من جدول الأعمال
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-black text-slate-850 leading-snug">
                                    {rec.title}
                                  </h4>
                                  <p className="text-xs text-gray-700 font-semibold leading-relaxed bg-white/75 p-4 rounded-xl border border-gray-300/60 shadow-sm min-h-[50px]">
                                    {rec.description}
                                  </p>
                                </div>

                                {/* Assigned & Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm">
                                    <Users className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span className="truncate">المسؤول: {rec.assignedTo}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-extrabold text-gray-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-300/50 shadow-sm font-sans">
                                    <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                                    <span>المدة: {rec.duration}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Stepper Approval tracking */}
                              <div className="bg-white/75 p-4 rounded-2.5xl border border-gray-300/60 shadow-sm space-y-3">
                                <div className="text-[10px] text-gray-500 font-extrabold flex items-center justify-between">
                                  <span>تتبع مسار الاعتماد الإداري للتوصية</span>
                                  <span className="text-brand font-black bg-[#dfba6b]/10 px-2 py-0.5 rounded-md border border-[#dfba6b]/20">
                                    المرحلة الحالية: {currentStageText}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between relative pt-1" dir="rtl">
                                  {approvalStagesList.map((st, i) => {
                                    const isPassed = i <= mappedIdx;
                                    const isCurrent = i === mappedIdx;
                                    return (
                                      <div key={st} className="flex flex-col items-center flex-1 relative z-10">
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                            isPassed
                                              ? "bg-brand text-[#1e293b] font-black scale-110 shadow-md ring-4 ring-brand/10"
                                              : "bg-gray-300 text-gray-500"
                                          }`}
                                        >
                                          {i + 1}
                                        </div>
                                        <span
                                          className={`text-[9px] font-extrabold mt-1.5 transition-colors ${
                                            isCurrent
                                              ? "text-brand font-black"
                                              : isPassed
                                              ? "text-slate-800 font-semibold"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          {st}
                                        </span>
                                      </div>
                                    );
                                  })}
                                  {/* Connector line */}
                                  <div className="absolute top-[11px] right-[10%] left-[10%] h-0.5 bg-gray-200 -z-0 rounded-full" />
                                  <div
                                    className="absolute top-[11px] right-[10%] h-0.5 bg-brand -z-0 transition-all duration-500 rounded-full"
                                    style={{ width: `${(mappedIdx / 3) * 80}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                  {mappedIdx < 3 ? (
                                    <button
                                      onClick={() => {
                                        const nextStage = approvalStagesList[mappedIdx + 1];
                                        const nextStatus = nextStage === "مكتملة" ? "منجزة" : statusStr;
                                        handleUpdateRecommendationStatus(rec.id, nextStatus, nextStage);
                                      }}
                                      className="px-3 py-1.5 bg-brand hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-[10px] rounded-lg transition text-white cursor-pointer shadow-sm"
                                    >
                                      ترقية مسار الاعتماد ←
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-800 font-black bg-emerald-50 px-2 py-1 rounded-md border border-emerald-250">
                                      ✓ معتمدة بالكامل
                                    </span>
                                  )}
                                </div>
                                {/* Audit logs trigger */}
                                <div className="pt-2 border-t border-gray-300/85">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRecLogsId(expandedRecLogsId === rec.id ? null : rec.id)}
                                    className="text-[10px] text-gray-650 font-extrabold flex items-center gap-1 hover:text-brand"
                                  >
                                    <span>{expandedRecLogsId === rec.id ? "إخفاء السجل " : "عرض السجل  لقنوات التتبع"}</span>
                                    <Sliders className="w-3 h-3" />
                                    <span>({rec.auditLogs?.length || 0})</span>
                                  </button>
                                  {expandedRecLogsId === rec.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="bg-white border border-gray-300 rounded-xl p-3 mt-2 text-[10px] space-y-1.5 max-h-40 overflow-y-auto shadow-inner"
                                    >
                                      {(!rec.auditLogs || rec.auditLogs.length === 0) ? (
                                        <div className="text-gray-400 italic">لا توجد سجلات أرشفة بعد.</div>
                                      ) : (
                                        rec.auditLogs.map((log: any, logI: number) => (
                                          <div key={logI} className="border-b border-dashed border-gray-200 pb-1.5 last:border-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="text-slate-800 font-bold">{log.action}</div>
                                            <div className="text-gray-500 font-semibold">{log.timestamp} | {log.user}</div>
                                          </div>
                                        ))
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* TABLE REGISTER VIEW LAYOUT (سجل الفعاليات) */
        <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
          <div className="overflow-x-auto custom-scrollbar font-sans pb-36">
            <table className="w-full text-xs font-semibold text-gray-700 select-none border-collapse text-right">
              <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900">
                <tr className="divide-x divide-x-reverse divide-gray-300">
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-right w-16">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded text-brand"
                        checked={selectedEventIds.length === tableRecommendations.length && tableRecommendations.length > 0} 
                        onChange={toggleSelectAllEvents}
                      />
                      <span>م</span>
                    </div>
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-36">رقم التوصية</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-right">عنوان التوصية</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-right">اللجنة</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-40">تاريخ التوصية</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-36">الحالة</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center w-36">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                {tableRecommendations.map((evt: any, idx) => {
                  const isExpanded = expandedEventId === evt.id;
                  const nextStep = getCalculatedNextStep(evt);
                  return (
                    <React.Fragment key={evt.id}>
                      <tr 
                        id={`event-row-${evt.id}`}
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className={`hover:bg-slate-100/80 transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700 cursor-pointer ${isExpanded ? "bg-slate-50/90 border-r-2 border-r-brand shadow-inner" : ""}`}
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-right text-gray-900 font-mono font-black" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              className="rounded text-brand"
                              checked={selectedEventIds.includes(evt.id)} 
                              onChange={() => toggleSelectEvent(evt.id)}
                            />
                            <span>{idx + 1}</span>
                          </div>
                        </td>
                        
                        {/* رقم التوصية */}
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center text-gray-900 font-mono font-black">
                          <span className="inline-block px-2 py-1 select-all font-mono font-black text-brand bg-brand/5 border border-brand/10 rounded text-[10.5px]">
                            REC-{String(evt.id || "").substring(0, 5).toUpperCase()}
                          </span>
                        </td>

                        {/* عنوان التوصية */}
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap font-black text-gray-900 group/row" title="انقر لتشغيل منصة التحضير">
                          <div className="flex flex-col text-right truncate">
                            <span className="text-[11.5px] font-bold text-gray-900 leading-tight transition-colors group-hover/row:text-brand underline decoration-dotted decoration-brand/45 underline-offset-4 truncate mb-1">
                              {(() => {
                                if (evt.recommendationClassification === "بالتمرير") return evt.title;
                                if (evt.recommendationEventId && evt.recommendationEventId !== "unlinked") {
                                    const linkedEvent = events.find(e => String(e.id) === String(evt.recommendationEventId));
                                    if (linkedEvent) return linkedEvent.title;
                                }
                                return evt.title;
                              })()}
                            </span>
                            {evt.preparationsText ? (
                              <div className="text-[9.5px] text-brand font-bold truncate max-w-sm">
                                {evt.preparationsText.substring(0, 65).replace(/[\r\n]+/g, " ")}...
                              </div>
                            ) : (
                              <div className="text-[9px] text-gray-400 font-bold">
                                (اضغط على الإجراءات لتجهيز صياغة التوصية والمسودة)
                              </div>
                            )}
                          </div>
                        </td>

                        {/* اللجنة */}
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-xs font-bold text-gray-800 text-right">
                          <span className="block text-gray-900 font-bold mb-1">{evt.committeeName || (evt.committeeId ? committees.find(c => String(c.id) === String(evt.committeeId))?.name : "") || "لجنة غير محددة"}</span>
                          <span className="block text-[9.5px] text-gray-500 font-bold">
                            المكلف: {evt.recommendationAssignee || (evt.employees && evt.employees[0]) || "غير محدد"}
                          </span>
                        </td>

                        {/* تاريخ التوصية */}
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center">
                          <span className="block text-gray-900 font-bold text-[11px] mb-0.5" dir="ltr">{getDayNameFromDate(evt.date)} {evt.date}</span>
                          <span className="block text-gray-500 font-bold text-[10px]" dir="ltr">{formatTime12h(evt.time || "01:30")}</span>
                        </td>

                        {/* الحالة */}
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center">
                          {(() => {
                            const rStat = getRecommendationStatus(evt);
                            return (
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold ring-1 ${rStat.colorClass}`}>
                                {rStat.text}
                              </span>
                            );
                          })()}
                        </td>

                        {/* الإجراءات */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                            <button
                              type="button"
                              onClick={() => setActiveGearMenuId(activeGearMenuId === evt.id ? null : evt.id)}
                              style={{ display: canUserEditCommittee(evt.committeeName) ? 'flex' : 'none' }}
                              className="p-1.5 hover:bg-[#d6cfcf] text-gray-700 hover:text-gray-950 rounded-lg border border-transparent hover:border-gray-350 transition-all cursor-pointer"
                              title="الإجراءات"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            
                            {activeGearMenuId === evt.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={() => setActiveGearMenuId(null)} 
                                />
                                
                                <div className="absolute left-2 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-40 text-right font-sans">
                                  {!!evt.recommendationType && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(evt)}
                                      className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                    >
                                      <span>تعديل التوصية</span>
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveGearMenuId(null);
                                      setExpandedEventId(expandedEventId === evt.id ? null : evt.id);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>تجهيز التوصية والمسودة</span>
                                    <Activity className="w-3.5 h-3.5" />
                                  </button>
                                  {!!evt.recommendationType && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDelete(evt)}
                                      className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                    >
                                      <span>حذف التوصية</span>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-y border-gray-200 text-right font-sans"
                            >
                              <div className="flex flex-col md:flex-row gap-6">
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
                                      { title: "تجهيز التوصية والمسودة", desc: "المولد الذكي للمحتوى التوصية", done: !!evt.preparationsConfirmed },
                                      { title: "إحالة التوصية واعتماداتها", desc: "إضافة الشروحات وصياغة قرار تفعيل التوصية", done: !!evt.agendaTransferred },
                                      { title: "مراجعة الاعتمادات", desc: "تسجيل الملاحظات وحفظ التوصية غير مفعلة أو تفعيلها كلياً", done: !!evt.minutesSaved },
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
                                <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative text-right min-h-[300px]">
                                  {(() => {
                                    const currentTab = activeStepTab[evt.id] ?? getStepIndex(nextStep);
                                    switch (currentTab) {
                                      case 0: { // Step 0: Prep Recommendation
                                        const sampleFiles = ["مرفق 1.pdf", "مرفق 2.pdf", "مرفق 3.pdf"];
                                        const attachmentsList = evt.attachments || [];
                                        
                                        return (
                                          <div className="space-y-4 animate-fade-in text-right">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 font-sans">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                                <Sparkles className="w-4 h-4 text-brand animate-bounce" />
                                                تجهيز التوصية وصياغتها مع المرفقات
                                              </h3>
                                              <span className="text-[9px] text-[#4ea0b0] font-extrabold px-2 py-0.5 rounded bg-[#4ea0b0]/5 font-sans">مرحلة 1 من 3</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold font-sans text-right">
                                              صغ مسودة التوصية في المربع أدناه أو استخدم خيار التوليد الذكي، مع أرفق الوثائق المطلوبة.
                                            </p>
                                            
                                            <div className="space-y-3 font-sans">
                                              <div className="flex justify-between items-center">
                                                <label className="text-[9.5px] text-slate-900 font-extrabold font-sans">الصياغة المقترحة للتوصية:</label>
                                                <div className="flex gap-1">
                                                  {evt.preparationsText && (
                                                    <>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          navigator.clipboard.writeText(evt.preparationsText || "");
                                                          setAlertState({ isOpen: true, message: "تم نسخ الصياغة المقترحة بنجاح!", onClose: () => {} });
                                                        }}
                                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-gray-200 font-sans"
                                                      >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        نسخ نص التوصية
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          
const textBody = evt.preparationsText || "";
let mailSubject = "تفعيل توصية قطاعية دائرية";
let mailBody = textBody;

if (textBody.startsWith("الموضوع: ")) {
  const firstLineEnd = textBody.indexOf("\n");
  if (firstLineEnd !== -1) {
    mailSubject = textBody.substring("الموضوع: ".length, firstLineEnd).trim();
    mailBody = textBody.substring(firstLineEnd + 1).trim();
  }
}
window.location.href = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
                                                        }}
                                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-gray-200 font-sans"
                                                      >
                                                        <Mail className="w-3.5 h-3.5" />
                                                        إرسال بالإيميل
                                                      </button>
                                                    </>
                                                  )}

                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const dayArabic = getDayNameFromDate(evt.date) || "الاثنين";
                                                      const isPassing = evt.recommendationClassification === "بالتمرير";
                                                      const rType = evt.recommendationType === "عاجلة" ? "عاجلة" : "عادية";
                                                      const attachmentsText = attachmentsList && attachmentsList.length > 0 ? attachmentsList.map((a) => a.name).join(", ") : "لا يوجد مرفقات";
                                                      
const linkedEvent = events.find(e => String(e.id) === String(evt.recommendationEventId));
const meetingName = linkedEvent ? linkedEvent.title : (evt.eventName && evt.eventName !== "توصية غير محددة" ? evt.eventName : (evt.title.includes("اجتماع") ? evt.title : `اجتماع ${evt.committeeName || "اللجنة"}`));

const eventTime = linkedEvent?.time || evt.time || "……";
const eventLocation = linkedEvent?.location || evt.location || "……";
const dateStr = linkedEvent?.date || evt.date || "……";

let formattedTime = eventTime;
if (eventTime && eventTime !== "……") {
    const [hours, minutes] = eventTime.split(":");
    if (hours && minutes) {
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? "مساءً" : "صباحاً";
      h = h % 12;
      h = h ? h : 12;
      formattedTime = `${h}:${minutes} ${ampm}`;
    }
}

let formattedDate = dateStr;
if (dateStr && dateStr !== "……") {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        const dayStr = d.getDate().toString().padStart(2, '0');
        const monthStr = months[d.getMonth()];
        const yearStr = d.getFullYear();
        formattedDate = `${dayStr} ${monthStr} ${yearStr}م`;
    }
}

let itemTitle = "……";
let itemTitleFull = "البند: ……";
let itemDiscussion = evt.recommendationDiscussion || "……";
let itemRec = evt.description || evt.recommendationText || evt.notes || "لا يوجد نص للتوصية";

if (linkedEvent && linkedEvent.agenda) {
    const agendaIdx = linkedEvent.agenda.findIndex((a: any) => evt.title && evt.title.includes(a.title));
    if (agendaIdx !== -1) {
        const agendaItem = linkedEvent.agenda[agendaIdx];
        itemTitle = agendaItem.title;
        itemTitleFull = `البند ${getArabicOrdinalGlobal(agendaIdx + 1)}: ${itemTitle}`;
        itemDiscussion = agendaItem.discussion || "……";
        itemRec = agendaItem.recommendation || itemRec;
    } else {
       const match = evt.title?.match(/توصية البند (.*?) "(.*?)"/);
       if (match) {
           itemTitle = match[2];
           itemTitleFull = `البند ${match[1]}: ${match[2]}`;
       } else {
           itemTitle = evt.title || "……";
           itemTitleFull = `البند: ${itemTitle}`;
       }
    }
} else {
    const match = evt.title?.match(/توصية البند (.*?) "(.*?)"/);
    if (match) {
        itemTitle = match[2];
        itemTitleFull = `البند ${match[1]}: ${match[2]}`;
    } else {
        itemTitle = evt.title || "……";
        itemTitleFull = `البند: ${itemTitle}`;
    }
}

let assigneeText = evt.assignedTo || evt.recommendationAssignee || (evt.employees && evt.employees.length > 0 ? evt.employees[0] : "غير محدد");
if (assigneeText === "الأخصائي" || assigneeText === "أخصائي اللجنة") {
    const committeeIdMatch = evt.committeeId || (events.find(e => String(e.id) === String(evt.recommendationEventId))?.committeeId);
    const comm = committees.find(c => c.name === evt.committeeName || (committeeIdMatch && String(c.id) === String(committeeIdMatch)));
    if (comm && comm.specialist) {
        assigneeText = `أخصائي اللجنة: ${comm.specialist}`;
    }
}
let attachmentsLabel = attachmentsText;
if (attachmentsList && attachmentsList.length > 0) {
    attachmentsLabel = attachmentsList.map((a: any) => a.name).join("، ");
} else {
    attachmentsLabel = "لا يوجد مرفقات";
}

const subjectText = `تفعيل توصية ${itemTitleFull} ل${meetingName}`;

const generatedProposal = `الموضوع: ${subjectText}
سعادة الأستاذ/ محمد بن محسن السبيعي                 سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد
نهديكم أطيب تحية وتقدير.. ونشكر لسعادتكم تعاونكم الدائم والمستمر لإنجاح سير أعمال إدارة اللجان.
إشارة إلى ${meetingName} الذي تم عقده في تمام الساعة ${formattedTime} من ظهر يوم ${dayArabic} بتاريخ ${formattedDate} بقاعة/ ${eventLocation}  بمقر غرفة مكة المكرمة، وما ورد به من:
${itemTitleFull} .
المناقشة: ${itemDiscussion} .
التوصية: ${itemRec} .
المكلف: ${assigneeText} .
المرفقات: ${attachmentsLabel} .

آمل من سعادتكم التكرم بالاطلاع والتوجيه حتى يتسنى لنا إكمال اللازم.

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،`;
                                                      
                                                      updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
                                                    }}
                                                    className="px-2.5 py-1.5 bg-slate-900 border-transparent hover:bg-slate-800 text-brand text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 shadow transition-all duration-200 animate-pulse font-sans"
                                                  >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    توليد النص المقترح
                                                  </button>
                                                </div>
                                              </div>
                                              
                                              <textarea
                                                value={evt.preparationsText || evt.description || evt.recommendationText || ""}
                                                onChange={(e) => updateEventWorkflow(evt.id, { preparationsText: e.target.value })}
                                                placeholder="اكتب هنا نص التوصية..."
                                                className="w-full h-32 p-3 text-[10px] font-bold text-slate-800 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand resize-none bg-slate-50/70 leading-relaxed text-right font-sans"
                                                dir="rtl"
                                              />
                                              
                                              {/* Digital Library Drag & Drop Simulator */}
                                              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/20 text-center relative hover:border-brand/45 transition-colors font-sans">
                                                <div 
                                                  className="relative p-2 cursor-pointer group"
                                                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-brand', 'bg-brand/5'); }}
                                                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-brand', 'bg-brand/5'); }}
                                                  onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('border-brand', 'bg-brand/5');
                                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                      const files = Array.from(e.dataTransfer.files) as File[];
                                                      const newAtts = files.map(f => ({
                                                        name: f.name,
                                                        size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
                                                        date: new Date().toLocaleDateString('ar-SA')
                                                      }));
                                                      const existing = attachmentsList || [];
                                                      
                                                      setPromptState({
    isOpen: true,
    message: "الرجاء تأكيد مسار الحفظ والأرشفة في جوجل درايف:",
    defaultValue: "/Google Drive/Committees/" + (evt.committeeName || "General"),
    onConfirm: (drivePath) => {
        if (!drivePath) {
            setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
            return;
        }
        setAlertState({ 
            isOpen: true, 
            message: "تم حفظ الملفات بنجاح في المسار: " + drivePath, 
            onClose: () => {
                updateEventWorkflow(evt.id, { attachments: [...existing, ...newAtts] });
            }
        });
    },
    onCancel: () => {
        setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
    }
});
                                                    }
                                                  }}
                                                >
                                                  <input 
                                                    type="file" 
                                                    multiple
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => {
                                                      if (e.target.files && e.target.files.length > 0) {
                                                        const files = Array.from(e.target.files) as File[];
                                                        const newAtts = files.map(f => ({
                                                          name: f.name,
                                                          size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
                                                          date: new Date().toLocaleDateString('ar-SA')
                                                        }));
                                                        const existing = attachmentsList || [];
                                                        
                                                        setPromptState({
    isOpen: true,
    message: "الرجاء تأكيد مسار الحفظ والأرشفة في جوجل درايف:",
    defaultValue: "/Google Drive/Committees/" + (evt.committeeName || "General"),
    onConfirm: (drivePath) => {
        if (!drivePath) {
            setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
            return;
        }
        setAlertState({ 
            isOpen: true, 
            message: "تم حفظ الملفات بنجاح في المسار: " + drivePath, 
            onClose: () => {
                updateEventWorkflow(evt.id, { attachments: [...existing, ...newAtts] });
            }
        });
    },
    onCancel: () => {
        setAlertState({ isOpen: true, message: "تم إلغاء الحفظ.", onClose: () => {} });
    }
});
                                                      }
                                                      e.target.value = '';
                                                    }}
                                                  />
                                                  <p className="text-[9.5px] text-slate-600 font-extrabold font-sans group-hover:text-brand transition-colors">المكتبة الرقمية: اسحب وأفلت المرفق هنا أو اضغط لربطه بجوجل درايف</p>
                                                </div>
                                                
                                                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 font-sans relative z-20">
                                                  {sampleFiles.map((fn, idx) => (
                                                    <button
                                                      key={idx}
                                                      type="button"
                                                      onClick={() => {
                                                        const exists = attachmentsList.some((a: any) => a.name === fn);
                                                        if (!exists) {
                                                          const newAtt = { name: fn, size: "1.8 MB", date: new Date().toLocaleDateString('ar-SA') };
                                                          updateEventWorkflow(evt.id, { attachments: [...attachmentsList, newAtt] });
                                                        }
                                                      }}
                                                      className="px-2 py-1 bg-white hover:bg-gray-150 text-gray-700 text-[8px] font-bold border border-gray-200 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer font-sans"
                                                    >
                                                      <Paperclip className="w-2.5 h-2.5 text-[#4ea0b0]" />
                                                      إرفاق {fn}
                                                    </button>
                                                  ))}
                                                </div>
                                                
                                                {attachmentsList.length > 0 && (
                                                  <div className="mt-3.5 border-t border-slate-100 pt-2 text-right font-sans">
                                                    <span className="text-[8px] text-[#4ea0b0] font-black block mb-1">المستندات المرفقة بالتوصية حتى الآن ({attachmentsList.length}):</span>
                                                    <div className="space-y-1 font-sans">
                                                      {attachmentsList.map((att: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-150 text-[8.5px] text-slate-800 font-extrabold animate-fade-in font-sans">
                                                          <span className="flex items-center gap-1">
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                            {att.name}
                                                          </span>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              const filtered = attachmentsList.filter((_: any, i: number) => i !== index);
                                                              updateEventWorkflow(evt.id, { attachments: filtered });
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-bold px-1"
                                                          >
                                                            حذف
                                                          </button>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between font-sans">
                                              <label className="flex items-center gap-2.5 cursor-pointer font-sans">
                                                <input 
                                                  type="checkbox"
                                                  checked={!!evt.preparationsConfirmed}
                                                  onChange={(e) => updateEventWorkflow(evt.id, { preparationsConfirmed: e.target.checked })}
                                                  className="w-4.5 h-4.5 rounded border-gray-350 text-brand focus:ring-brand cursor-pointer focus:outline-none"
                                                />
                                                <span className="text-[10px] text-slate-900 font-extrabold select-none font-sans">
                                                  تم الانتهاء من صياغة مسودة التوصية وإرفاق المستندات المرجعية
                                                </span>
                                              </label>
                                              
                                              {evt.preparationsConfirmed ? (
                                                <span className="text-[9px] text-emerald-600 font-black flex items-center gap-1 shrink-0 font-sans">
                                                  <Check className="w-3.5 h-3.5" /> جاهز
                                                </span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-bold shrink-0 font-sans">بانتظار تجهيز التوصية</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      case 1: { // Step 2: Refer Recommendation (إحالة التوصية)
                                        return (
                                          <div className="space-y-4 animate-fade-in text-right">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                                <Users className="w-4 h-4 text-brand" />
                                                إحالة التوصية وشروحات سلسلة الاعتمادات
                                              </h3>
                                              <span className="text-[9px] text-[#4ea0b0] font-extrabold px-2 py-0.5 rounded bg-[#4ea0b0]/5">مرحلة 2 من 3</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold font-sans text-right">
                                              توصيق شرح التوصية:
                                            </p>
                                            
                                            <div className="space-y-3 font-sans overflow-y-auto max-h-[220px] pr-1">
                                              {/* Specialist Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">1. أخصائي اللجنة المسؤول</span>
                                                  <span className="text-[7.5px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold">الأخصائي</span>
                                                </div>
                                                <textarea 
                                                  value={evt.specialistExplanation || ""}
                                                  placeholder="يرجى كتابة الشرح..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { specialistExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* President/Section President Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">2. رئيس القسم اللجان (الموافقة المبدئية)</span>
                                                  <span className="text-[7.5px] bg-[#4ea0b0]/10 text-[#4ea0b0] px-1 py-0.5 rounded font-black">رئيس القسم</span>
                                                </div>
                                                <textarea 
                                                  value={evt.presidentExplanation || ""}
                                                  placeholder="شرح رئيس القسم لمدير الإدارة..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { presidentExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* Director Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">3. مدير إدارة اللجان</span>
                                                  <span className="text-[7.5px] bg-[#4ea0b0]/20 text-[#3d8391] px-1 py-0.5 rounded font-black">مدير الإدارة</span>
                                                </div>
                                                <textarea 
                                                  value={evt.directorExplanation || ""}
                                                  placeholder="شرح مدير الإدارة..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { directorExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* Assistant Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">4. مساعد الأمين العام لقطاع الأعمال</span>
                                                  <span className="text-[7.5px] bg-brand/10 text-brand px-1 py-0.5 rounded font-black">مساعد الأمين</span>
                                                </div>
                                                <textarea 
                                                  value={evt.assistantExplanation || ""}
                                                  placeholder="توجيه مساعد الأمين العام..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { assistantExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* Executive Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">5. توجيه المكتب التنفيذي</span>
                                                  <span className="text-[7.5px] bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-bold">المكتب التنفيذي</span>
                                                </div>
                                                <textarea 
                                                  value={evt.executiveExplanation || ""}
                                                  placeholder="قرار التوصية..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { executiveExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-indigo-500 bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* Approval Selector Buttons */}
                                              <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-200 text-right space-y-1.5">
                                                <span className="block text-[8.5px] text-slate-800 font-black">حالة قرار تفعيل التوصية (اعتماد أو حفظ):</span>
                                                <div className="flex items-center gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={() => updateEventWorkflow(evt.id, { activationApproved: "approved" })}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                                                      evt.activationApproved === "approved"
                                                        ? "bg-emerald-500 text-white border-transparent shadow-sm"
                                                        : "bg-white border-gray-200 text-emerald-600 hover:bg-emerald-50/20"
                                                    }`}
                                                  >
                                                    ✓ موافقة واعتماد التفعيل
                                                  </button>
                                                  
                                                  <button
                                                    type="button"
                                                    onClick={() => updateEventWorkflow(evt.id, { activationApproved: "rejected" })}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                                                      evt.activationApproved === "rejected"
                                                        ? "bg-amber-600 text-white border-transparent shadow-sm"
                                                        : "bg-white border-gray-200 text-amber-700 hover:bg-amber-50/20"
                                                    }`}
                                                  >
                                                    𐄂 رفض وحفظ التوصية غير مفعلة
                                                  </button>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                              <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                  type="checkbox"
                                                  checked={!!evt.agendaTransferred}
                                                  onChange={(e) => updateEventWorkflow(evt.id, { agendaTransferred: e.target.checked })}
                                                  className="w-4.5 h-4.5 rounded border-gray-150 text-brand focus:ring-brand cursor-pointer focus:outline-none shrink-0"
                                                />
                                                <span className="text-[10px] text-slate-900 font-extrabold select-none">
                                                  اعتماد الشروحات وصياغة قرار تفعيل التوصية وإحالتها
                                                </span>
                                              </label>
                                              {evt.agendaTransferred ? (
                                                <span className="text-[9px] text-emerald-600 font-black flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> جاهز</span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-bold shrink-0">بانتظار الإحالة</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }

                                      /* COMPLETED DUMMY STAGE */
                                      case 2: { // Step 3: Final Approvals Review (مراجعة الاعتمادات)
                                        return (
                                          <div className="space-y-4 text-right animate-fade-in font-sans">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                                <Presentation className="w-4 h-4 text-brand" />
                                                مراجعة الاعتمادات
                                              </h3>
                                              <span className="text-[9px] text-[#4ea0b0] font-extrabold px-2 py-0.5 rounded bg-[#4ea0b0]/5">مرحلة 3 من 3</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold font-sans">
                                             استعراض حالة التوصية:
                                            </p>

                                            {/* Final Status Display Block */}
                                            <div className="rounded-xl p-3 border font-sans space-y-1.5 shadow-sm text-right bg-white">
                                              <span className="text-[8px] text-brand font-black block">الإفادة:</span>
                                              
                                              {evt.activationApproved === 'approved' ? (
                                                <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl">
                                                  <div className="flex items-center gap-1.5 font-black text-[10px] text-emerald-700">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    <span>موافق عليها وتم اعتماد التفعيل بنجاح!</span>
                                                  </div>
                                                  <p className="text-[9px] font-bold text-emerald-600 mt-1.5 leading-relaxed">
                                                    بناءً على الاعتمادات، تقرر تفعيل التوصية رقم <span className="underline font-black">REC-{String(evt.id || "").substring(0, 5).toUpperCase()}</span> وتكليف أخصائي اللجان بالمتابعة.
                                                  </p>
                                                </div>
                                              ) : evt.activationApproved === 'rejected' ? (
                                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                                                  <div className="flex items-center gap-1.5 font-black text-[10px] text-amber-500">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                    <span>تقرر حفظ المعاملة غير مفعلة وإهمال تذكيراتها كلياً في مركز عمليات اللوحة كمسألة خاملة.</span>
                                                  </div>
                                                  <p className="text-[9px] font-bold text-amber-600 mt-1.5 leading-relaxed font-sans">
                                                    تقرر حفظ المعاملة غير مفعلة بنظام اللجان؛ نتيجة لانتفاء جدواها.
                                                  </p>
                                                </div>
                                              ) : (
                                                <div className="bg-blue-50 border border-blue-250 p-2.5 rounded-xl text-slate-800">
                                                  <div className="flex items-center gap-1.5 font-bold text-[9.5px]">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                                                    <span>القرار الإداري معلق حالياً بانتظار الإجراء في (الخطوة 2).</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Final Decree Input Textarea */}
                                            <div className="flex flex-col gap-1.5 pt-1">
                                              <span className="block text-[10px] font-black text-slate-800">بيان مسودة قرار تفعيل/حفظ التوصية الرسمي الصادر:</span>
                                              <textarea
                                                value={evt.finalExecutiveDecision || ''}
                                                onChange={(e) => updateEventWorkflow(evt.id, { finalExecutiveDecision: e.target.value })}
                                                rows={4}
                                                placeholder="كتابة التوجيه النهائي..."
                                                className="w-full text-[9.5px] p-2.5 border border-gray-200 rounded-lg text-right font-sans bg-slate-50/70 text-slate-800 focus:ring-1 focus:ring-brand leading-relaxed resize-none font-bold"
                                                dir="rtl"
                                              />
                                            </div>

                                            {/* Confirmation Checkbox */}
                                            <div className="p-3 bg-emerald-50/70 border border-emerald-250 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right font-sans">
                                              <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                  type="checkbox"
                                                  checked={!!evt.minutesSaved}
                                                  onChange={(e) => {
                                                    updateEventWorkflow(evt.id, { minutesSaved: e.target.checked });
                                                    // Automatically transition main event list status when fully completed
                                                    if (e.target.checked) {
                                                      const finalStatus = evt.activationApproved === 'rejected' ? 'غير فعالة' : 'مكتملة';
                                                      updateEventWorkflow(evt.id, { status: finalStatus });
                                                    }
                                                  }}
                                                  className="w-4.5 h-4.5 rounded border-gray-350 text-brand focus:ring-brand cursor-pointer focus:outline-none shrink-0"
                                                />
                                                <span className="text-[10px] text-slate-900 font-extrabold select-none">
                                                  تثبيت الإفادة
                                                </span>
                                              </label>
                                              {evt.minutesSaved ? (
                                                <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> جاهز</span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-extrabold shrink-0">بانتظار تثبيت الإفادة</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      default: return null;
                                    }
                                  })()}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {editingEvent ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {editingEvent ? `تعديل توصية: ${editingEvent.title}` : "إضافة توصية جديدة"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">يرجى مراعاة تسجيل البيانات بدقة ووضح لضمان ظهورها في مؤشر الأداء</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                
                <AnimatePresence>
                  {conflictWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-right flex flex-col gap-3"
                      dir="rtl"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span>تنبيه: تعارض في الجدول</span>
                      </div>
                      <p className="text-sm font-medium">{conflictWarning.message}</p>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const confEvt = events.find(e => e.id === conflictWarning.conflictingEventId);
                            if (confEvt) {
                               setConflictWarning(null);
                               setIsConfirmingSeries(false);
                               handleOpenEdit(confEvt);
                            }
                          }}
                          className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-black hover:bg-red-200 transition-colors"
                        >
                          تعديل الفعالية المتعارضة
                        </button>
                        <button
                          type="button"
                          onClick={() => setConflictWarning(null)}
                          className="px-4 py-1.5 bg-white text-gray-600 rounded-lg text-xs font-black hover:bg-gray-50 border border-gray-200 transition-colors"
                        >
                          تجاهل ورجوع
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isConfirmingSeries ? (
                  <div className="space-y-4 text-right" dir="rtl">
                    <h4 className="text-sm font-black text-gray-800 border-b border-gray-200 pb-2">
                      استعراض جدول الفعاليات المتسلسلة ({generatedSchedules.length})
                    </h4>
                    
                    {generatedSchedules.length === 0 ? (
                      <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-bold text-gray-500">لا توجد فعاليات مطابقة ضمن النطاق الزمني المحدد.</p>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50/50">
                        <table className="w-full text-xs font-semibold text-gray-700 text-right">
                          <thead className="bg-[#dfdada] border-b border-gray-300">
                            <tr>
                              <th className="whitespace-nowrap px-4 py-2 text-center w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedSchedules.length === generatedSchedules.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSchedules(generatedSchedules.map(g => g.id));
                                    } else {
                                      setSelectedSchedules([]);
                                    }
                                  }}
                                  className="rounded text-brand"
                                />
                              </th>
                              <th className="whitespace-nowrap px-4 py-2 font-black">التاريخ</th>
                              <th className="whitespace-nowrap px-4 py-2 font-black">الوقت</th>
                              <th className="whitespace-nowrap px-4 py-2 font-black">عنوان السجل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {generatedSchedules.map((gen) => (
                              <tr key={gen.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="whitespace-nowrap px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedSchedules.includes(gen.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedSchedules([...selectedSchedules, gen.id]);
                                      else setSelectedSchedules(selectedSchedules.filter(id => id !== gen.id));
                                    }}
                                    className="rounded text-brand"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-mono" dir="ltr">{gen.date}</td>
                                <td className="whitespace-nowrap px-4 py-2">{gen.time || "-"}</td>
                                <td className="whitespace-nowrap px-4 py-2">{gen.title}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end flex-row-reverse gap-3">
                      <button
                        type="button"
                        onClick={handleInsertSeries}
                        disabled={selectedSchedules.length === 0}
                        className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 disabled:opacity-50"
                      >
                        إدراج ({selectedSchedules.length}) سجل
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingSeries(false)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                      >
                        تراجع للتعديل
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-right mb-6" dir="rtl">
                      <div className="md:col-span-full flex justify-end">
                        <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
                          <button
                            type="button"
                            onClick={() => setNewType("مفردة")}
                            className={`px-6 py-2 rounded-lg font-black text-xs transition-all ${
                              newType === "مفردة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            توصية جديدة
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewType("متسلسلة")}
                            className={`px-6 py-2 rounded-lg font-black text-xs transition-all ${
                              newType === "متسلسلة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            استيراد التوصيات
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right" dir="rtl">
                      
                      {newType === "مفردة" && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">اللجنة *</label>
                            <select
                              value={newCommitteeId}
                              onChange={(e) => setNewCommitteeId(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value={0} disabled>اختر اللجنة</option>
                              {committees.filter(c => canUserEditCommittee(c.name)).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">النوع *</label>
                            <select
                              value={newRecType}
                              onChange={(e) => setNewRecType(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="" disabled>اختر النوع</option>
                              <option value="عادية">عادية</option>
                              <option value="عاجلة">عاجلة</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التصنيف *</label>
                            <select
                              value={newRecClassification}
                              onChange={(e) => setNewRecClassification(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="" disabled>اختر التصنيف</option>
                              <option value="عادية">عادية</option>
                              <option value="بالتمرير">بالتمرير</option>
                            </select>
                          </div>

                          {newRecClassification === "عادية" ? (
                            <div className="md:col-span-full space-y-1">
                              <label className="text-[11px] font-black text-gray-500 block">ارتباط التوصية بالمحضر (الاجتماع)</label>
                              <select
                                value={newRecEventId}
                                onChange={(e) => setNewRecEventId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              >
                                <option value="" disabled>اختر الاجتماع...</option>
                                {events.filter(e => e.committeeId === newCommitteeId && e.type !== "متسلسلة").map(ev => (
                                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                                ))}
                                <option value="unlinked">بدون ارتباط (تسجيل التوصية يدوياً)</option>
                              </select>
                            </div>
                          ) : (
                            <div className="md:col-span-full space-y-1">
                              <label className="text-[11px] font-black text-gray-500 block">طريقة التمرير</label>
                              <select
                                value={newRecPassMethod}
                                onChange={(e) => setNewRecPassMethod(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              >
                                <option value="عبر البريد الإلكتروني">عبر البريد الإلكتروني</option>
                                <option value="الواتس آب">الواتس آب</option>
                                <option value="غير ذلك">غير ذلك (أذكرها في الملاحظات)</option>
                              </select>
                            </div>
                          )}

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">عنوان التوصية *</label>
                            <input
                              type="text"
                              value={newRecTitle}
                              onChange={(e) => setNewRecTitle(e.target.value)}
                              className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="أدخل عنوان التوصية..."
                            />
                          </div>
                          <div className="md:col-span-1 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">المكلف *</label>
                            <select
                              value={newRecAssignee}
                              onChange={(e) => setNewRecAssignee(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">اختر المكلف</option>
                              {availableAssignees.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>

                          <div className="md:col-span-full space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">المناقشة</label>
                            <textarea
                              value={newRecDiscussion}
                              onChange={(e) => setNewRecDiscussion(e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                              placeholder="تفاصيل المناقشة..."
                            ></textarea>
                          </div>

                          <div className="md:col-span-2 space-y-1 relative">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-black text-gray-500 block">نص التوصية</label>
                            </div>
                            <textarea
                              value={newRecText}
                              onChange={(e) => setNewRecText(e.target.value)}
                              rows={3}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                              placeholder="نص التوصية هنا..."
                            ></textarea>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">مدة التنفيذ</label>
                            <input
                              type="text"
                              value={newRecDuration}
                              onChange={(e) => setNewRecDuration(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="مثال: أسبوعين، 5 أيام..."
                            />
                          </div>

                                                    <div className="md:col-span-full space-y-1">
                            <label className="block text-xs font-black text-gray-750">المرفقات</label>
                            <div
                              onDragEnter={handleDrag}
                              onDragOver={handleDrag}
                              onDragLeave={handleDrag}
                              onDrop={handleDrop}
                              className={`border-2 border-dashed p-4 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                                dragActive ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-slate-50"
                              }`}
                            >
                              <Paperclip className="w-5 h-5 text-blue-600 mb-1 animate-bounce" />
                              <p className="text-[10px] font-bold text-gray-500">رابط المرفقات Google Drive</p>
                              <button
                                type="button"
                                onClick={handleCustomLinkAttachment}
                                className="mt-2.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[9px] font-black"
                              >
                                لصق أو كتابة رابط المرفق
                              </button>
                            </div>
                            {newRecAttachments.length > 0 && (
                              <div className="pt-2 text-[10px] text-gray-600 font-bold space-y-1">
                                {newRecAttachments.map((f: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between py-1 bg-slate-50 px-2 rounded">
                                    <div className="flex items-center gap-2">
                                      <Paperclip className="w-3 h-3 text-blue-500" />
                                      <span>{f.name}</span>
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={() => setNewRecAttachments(newRecAttachments.filter((_, i) => i !== idx))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {newType === "متسلسلة" && (
                        <div className="md:col-span-full">
                           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                             <div className="flex gap-4 items-end">
                               <div className="flex-1 space-y-1">
                                 <label className="text-[11px] font-black text-gray-500 block">اختر اللجنة *</label>
                                 <select
                                   value={importCommitteeId}
                                   onChange={(e) => setImportCommitteeId(e.target.value)}
                                   className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                                 >
                                   <option value={0} disabled>اختر اللجنة لاستيراد التوصيات</option>
                                   {committees.filter(c => canUserEditCommittee(c.name)).map(c => (
                                     <option key={c.id} value={c.id}>{c.name}</option>
                                   ))}
                                 </select>
                               </div>
                               <button
                                 type="button"
                                 onClick={handleSearchImport}
                                 className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                               >
                                 البحث في المحاضر
                               </button>
                             </div>

                             {isImportSearched && (
                               <div className="mt-6">
                                 {importSearchResults.length === 0 ? (
                                   <div className="text-center py-8">
                                      <p className="text-sm font-bold text-gray-500">لا توجد توصيات متاحة للاستيراد من اجتماعات هذه اللجنة.</p>
                                   </div>
                                 ) : (
                                   <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pl-2">
                                     <p className="text-[11px] font-black text-gray-500 mb-3">نتائج البحث ({importSearchResults.length} توصية):</p>
                                     {importSearchResults.map((rec, idx) => {
                                       const uniqueId = rec.eventId + "-" + rec.agendaId;
                                       const isSelected = selectedImportRecs.includes(uniqueId);
                                       return (
                                         <div 
                                           key={uniqueId} 
                                           onClick={() => !rec.isAdded && toggleImportRecSelection(uniqueId)}
                                           className={`p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${rec.isAdded ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' : isSelected ? 'border-blue-500 bg-blue-50 cursor-pointer' : 'border-gray-200 bg-white cursor-pointer hover:border-blue-300'}`}
                                         >
                                           <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center shrink-0 ${rec.isAdded ? 'bg-gray-300 border-gray-400' : isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                             {(isSelected || rec.isAdded) && <Check className="w-3.5 h-3.5 text-white" />}
                                           </div>
                                           <div className="flex-1 space-y-1">
                                             <div className="flex items-center gap-2">
                                               <h4 className="text-sm font-bold text-gray-900">{rec.title}</h4>
                                               {rec.isAdded && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-black rounded-full">مضافة مسبقاً</span>}
                                             </div>
                                             <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{rec.recommendationText}</p>
                                             <div className="flex items-center gap-4 mt-2">
                                               <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded border border-gray-100">
                                                 <Calendar className="w-3 h-3" />
                                                 <span>محضر: {rec.eventTitle}</span>
                                               </div>
                                               {rec.assignee && (
                                                 <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded border border-gray-100">
                                                   <Users2 className="w-3 h-3" />
                                                   <span>المكلف: {rec.assignee}</span>
                                                 </div>
                                               )}
                                             </div>
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                        </div>
                      )}
                    </div>

                <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end flex-row-reverse gap-3">
                  {newType === "متسلسلة" ? (
                    <button
                      type="button"
                      onClick={handleImportSelected}
                      disabled={selectedImportRecs.length === 0}
                      className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      إدراج ({selectedImportRecs.length}) توصية
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 active:scale-95"
                    >
                      {editingEvent ? "حفظ التعديلات" : "إضافة التوصية"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBulkDeleting && (
           <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => setIsBulkDeleting(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center border border-gray-100"
             >
               <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2">تأكيد الحذف</h3>
               <p className="text-sm font-bold text-gray-500 mb-6">
                 هل أنت متأكد من حذف {selectedEventIds.length} فعالية؟
               </p>
               <div className="flex gap-3">
                 <button
                   onClick={handleBulkDelete}
                   disabled={isBulkDeletingLoading}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center"
                 >
                   {isBulkDeletingLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                      "نعم، احذف"
                   )}
                 </button>
                 <button
                   onClick={() => setIsBulkDeleting(false)}
                   className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-bold text-sm hover:bg-gray-200 transition-colors"
                 >
                   إلغاء
                 </button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingEvent && (
           <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => setDeletingEvent(null)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center border border-gray-100"
             >
               <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2">تأكيد الحذف</h3>
               <p className="text-sm font-bold text-gray-500 mb-6">
                 هل أنت متأكد من حذف التوصية "{deletingEvent.title}"؟ 
                 لن يتم حذف الفعالية الأصلية.
               </p>
               <div className="flex gap-3">
                 <button
                   onClick={handleDelete}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                 >
                   نعم، احذف
                 </button>
                 <button
                   onClick={() => setDeletingEvent(null)}
                   className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-bold text-sm hover:bg-gray-200 transition-colors"
                 >
                   تراجع
                 </button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Modals for replacing prompt/alert */}
      {promptState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] max-w-[90vw] font-sans border border-gray-100">
            <h3 className="text-sm font-black text-slate-800 mb-3">{promptState.message}</h3>
            <input 
              type="text" 
              defaultValue={promptState.defaultValue}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-bold text-left bg-slate-50 mb-5"
              dir="ltr"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptState.onConfirm(e.currentTarget.value);
                  setPromptState({ ...promptState, isOpen: false });
                }
              }}
              autoFocus
              id="prompt-input"
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => { promptState.onCancel(); setPromptState({ ...promptState, isOpen: false }); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={() => { 
                  const val = (document.getElementById('prompt-input') as HTMLInputElement).value;
                  promptState.onConfirm(val); 
                  setPromptState({ ...promptState, isOpen: false }); 
                }}
                className="px-4 py-2 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {alertState.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[350px] max-w-[90vw] font-sans border border-gray-100 text-center">
            <p className="text-sm font-black text-slate-800 mb-6">{alertState.message}</p>
            <button 
              onClick={() => { alertState.onClose(); setAlertState({ ...alertState, isOpen: false }); }}
              className="px-6 py-2 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors shadow-sm w-full"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {linkPromptState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[400px] max-w-[90vw] font-sans border border-gray-100">
            <h3 className="text-sm font-black text-slate-800 mb-4">إضافة رابط مرفق</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المرفق</label>
                <input 
                  type="text" 
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-bold"
                  placeholder="مثال: المستند المرفق"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">الرابط</label>
                <input 
                  type="url" 
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-bold text-left bg-slate-50"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setLinkPromptState({ isOpen: false, eventId: null })}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmAddLinkAttachment}
                className="px-4 py-2 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
