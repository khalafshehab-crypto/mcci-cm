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
  committeeId: number;
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
const EVENT_KINDS = ["اجتماع", "لقاء", "زيارة", "استضافة", "ورشة عمل", "ندوة", "حفل", "تدشين", "إطلاق مبادرة", "توقيع اتفاقية", "معرض", "دورة تدريبية"];
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

export default function Events() {
  const location = useLocation();
  const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("events", []);
  const { data: rawCommittees } = useFirestoreCollection<any>("committees", []);
  const { data: allMembers } = useFirestoreCollection<Member>("members", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("employees", []);
  const { data: allDbRecommendations, addDocument: addFirebaseRecommendation } = useFirestoreCollection<any>("recommendations", []);

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
        e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
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

  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
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
  const updateEventWorkflow = (eventId: number, updates: Partial<EventItem>) => {
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (targetEvent && !canUserEditCommittee(targetEvent.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لتعديل فعاليات هذه اللجنة. يمكنك فقط إدارة فعاليات اللجان المكلف بها.");
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
  const [newCommitteeId, setNewCommitteeId] = useState<number>(0);
  const availableAssignees = React.useMemo(() => {
    const comm = committees.find(c => c.id === newCommitteeId);
    const specialist = comm?.specialist || "";
    const members = allMembers.filter(m => m.committeeId === newCommitteeId).map(m => m.name);
    return Array.from(new Set([specialist, ...members].filter(Boolean)));
  }, [committees, allMembers, newCommitteeId]);
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
      const targetId = Number((location.state as any).selectedEventId);
      if (events && events.length > 0) {
        const found = events.find(e => Number(e.id) === targetId);
        if (found) {
          setViewMode("table");
          setExpandedEventId(targetId);
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
  const [importCommitteeId, setImportCommitteeId] = useState<number>(0);
  const [importSearchResults, setImportSearchResults] = useState<any[]>([]);
  const [selectedImportRecs, setSelectedImportRecs] = useState<string[]>([]);
  const [isImportSearched, setIsImportSearched] = useState(false);


  
  const handleSearchImport = () => {
    if (!importCommitteeId) return;
    
    // Find events for the selected committee
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
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
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

    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
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
      setEvents(events.map(ev => ev.id === editingEvent.id ? updatedRec : ev));
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

  const handleDelete = () => {
    if (deletingEvent) {
      setEvents(events.filter((e) => e.id !== deletingEvent.id));
      setDeletingEvent(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedEventIds.length > 0) {
      setEvents(events.filter((e) => !selectedEventIds.includes(e.id)));
      setSelectedEventIds([]);
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectEvent = (id: number) => {
    setSelectedEventIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllEvents = () => {
    if (selectedEventIds.length === filteredEvents.length && filteredEvents.length > 0) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(filteredEvents.map(e => e.id));
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

  const getEventKindStr = (title: string) => {
    if (title.startsWith("اجتماع")) return "اجتماع";
    if (title.startsWith("لقاء")) return "لقاء";
    if (title.startsWith("زيارة")) return "زيارة";
    if (title.startsWith("استضافة")) return "استضافة";
    if (title.startsWith("ورشة عمل")) return "ورشة عمل";
    if (title.startsWith("ندوة")) return "ندوة";
    if (title.startsWith("حفل")) return "حفل";
    if (title.startsWith("تدشين")) return "تدشين";
    if (title.startsWith("إطلاق مبادرة")) return "إطلاق مبادرة";
    if (title.startsWith("توقيع اتفاقية")) return "توقيع اتفاقية";
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
              <span>سجل وتصنيف التوصيات القطاعية</span>
            </h2>
            <p className="text-gray-650 text-xs font-semibold">
              حوكمة وتصنيف التوصيات الصادرة من اللجان والفعاليات والاجتماعات.
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
                    <span>لوحة اللجان القطاعية</span>
                  </h3>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    اختر أحد اللجان القطاعية التالية لاستعراض سجل اجتماعاتها وحصر التوصيات الصادرة عنها
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {committees.map((comm) => {
                  // Count events/meetings under this committee
                  const commSessions = events.filter((e) => e.committeeId === comm.id);
                  const sessionsCount = commSessions.length;

                  // Count recommendations under this committee
                  const commRecsCount = allDbRecommendations.filter((rec: any) => {
                    const matchedEvent = events.find((e) => e.title === rec.eventName || String(rec.id).includes(`custom-rec-${e.id}-`));
                    return matchedEvent?.committeeId === comm.id;
                  }).length + commSessions.reduce((acc, evt) => {
                    return acc + (evt.agenda || []).filter((g: any) => g.recommendation && g.recommendation.trim() !== "").length;
                  }, 0);

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
                            {comm.description || "لا يوجد وصف إضافي متوفر لهذه اللجنة القطاعية."}
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
            </div>
          ) : selectedEventIdForCards === null ? (
            /* Screen 2: List of Meetings/Events of the selected Committee */
            <div className="space-y-6 text-right" dir="rtl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#e8e4e4] p-5 rounded-3xl border border-gray-200 shadow-sm">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-5 bg-brand rounded-full inline-block animate-pulse"></span>
                    <span>تصفح اجتماعات وفعاليات: </span>
                    <span className="text-brand">
                      {committees.find((c) => c.id === selectedCommIdForCards)?.name || "اللجنة المحددة"}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    يرجى اختيار الاجتماع من السجل أدناه لعرض وبناء بطاقات التوصيات له
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCommIdForCards(null);
                    setSelectedEventIdForCards(null);
                  }}
                  className="px-4 py-2 text-xs bg-white text-slate-800 hover:bg-slate-100 font-black rounded-xl transition duration-205 flex items-center gap-1.5 cursor-pointer shadow-sm border border-gray-300/80"
                >
                  <span>الرجوع للوحة اللجان الرئيسية ↑</span>
                </button>
              </div>

              {(() => {
                const commEvents = filteredEvents.filter((e) => e.committeeId === selectedCommIdForCards);

                if (commEvents.length === 0) {
                  return (
                    <div className="bg-[#e8e4e4] border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                      <div className="w-16 h-16 rounded-full bg-white/70 border border-gray-300 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Calendar className="w-8 h-8" />
                      </div>
                      لا توجد أية اجتماعات مسجلة لهذه اللجنة حالياً تحتوي على توصيات.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commEvents.map((evt) => {
                      // Calculate recommendation count for this meeting/event
                      const dbRecommendationsCount = allDbRecommendations.filter((rec: any) =>
                        String(rec.id).startsWith(`custom-rec-${evt.id}-`) ||
                        (rec.eventName && rec.eventName === evt.title)
                      ).length;

                      const agendaCount = (evt.agenda || []).filter(
                        (g: any) => g.recommendation && g.recommendation.trim() !== ""
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
                    <div className="bg-white p-8 text-center rounded-3xl border text-gray-500 font-bold">
                      تعذر العثور على بيانات الفعالية المحددة.
                    </div>
                  );
                }

                // Gather recommendations
                const dbRecommendations = allDbRecommendations.filter((rec: any) =>
                  String(rec.id).startsWith(`custom-rec-${selectedEventIdForCards}-`) ||
                  (rec.eventName && rec.eventName === chosenEvent.title)
                );

                const agendaRecs = (chosenEvent.agenda || [])
                  .filter((g: any) => g.recommendation && g.recommendation.trim() !== "")
                  .map((g: any, idx: number) => {
                    const isAlreadyInDb = dbRecommendations.some((dr: any) => dr.title === g.title);
                    if (isAlreadyInDb) return null;
                    return {
                      id: `agenda-rec-${chosenEvent.id}-${idx}`,
                      title: g.title,
                      description: g.recommendation,
                      assignedTo: g.assignee || "غير حدد",
                      duration: g.durationRec || "أسبوعين",
                      status: "جديدة",
                      approvalStage: "أخصائي",
                      auditLogs: [],
                      isAgendaSource: true
                    };
                  })
                  .filter(Boolean);

                const combinedRecs = [...dbRecommendations, ...agendaRecs];

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
                          يمكنك إضافة توصيات، تتبع مسارات الاعتماد، وتحديث الحالات مع تسجيل الأرشيف التاريخي لكل حالة
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => setDirectAddRecOpen(true)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center gap-1 text-right"
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة توصية جديدة +</span>
                        </button>
                        <button
                          onClick={() => setSelectedEventIdForCards(null)}
                          className="px-4 py-2.5 bg-white text-slate-800 hover:bg-slate-100 font-black text-xs rounded-xl transition duration-200 shadow-sm cursor-pointer flex items-center gap-1.5 border border-gray-300/80"
                        >
                          <span>الرجوع لقائمة الاجتماعات ↑</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Form to Add Recommendation */}
                    {directAddRecOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-50 border border-blue-200/60 rounded-3xl p-6 shadow-md"
                      >
                        <form onSubmit={handleAddRecSubmitDirect} className="space-y-4">
                          <h4 className="text-sm font-black text-slate-800 border-b border-slate-200/60 pb-2">
                            نموذج بناء وإضافة توصية جديدة للفعالية
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                عنوان التوصية / بند جدول العمل
                              </label>
                              <input
                                type="text"
                                value={directRecTitle}
                                onChange={(e) => setDirectRecTitle(e.target.value)}
                                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-right"
                                required
                                placeholder="مثال: زيادة طاقة التخزين المبرد بالمستودعات"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                المسؤول المكلف بالتنفيذ
                              </label>
                              <input
                                type="text"
                                value={directRecAssignee}
                                onChange={(e) => setDirectRecAssignee(e.target.value)}
                                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-right"
                                placeholder="اسم العضو أو الموظف المسؤول"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-1">
                              نص وتفاصيل التوصية بالكامل
                            </label>
                            <textarea
                              rows={3}
                              value={directRecDesc}
                              onChange={(e) => setDirectRecDesc(e.target.value)}
                              className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-right"
                              required
                              placeholder="كتابة نص التوصية الإجرائية بشكل دقيق..."
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                مدة التنفيذ المقترحة
                              </label>
                              <input
                                type="text"
                                value={directRecDuration}
                                onChange={(e) => setDirectRecDuration(e.target.value)}
                                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-right"
                                placeholder="مثال: أسبوعين، شهر"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                حالة التوصية البدئية
                              </label>
                              <select
                                value={directRecStatus}
                                onChange={(e) => setDirectRecStatus(e.target.value)}
                                className="w-full text-xs font-semibold px-2 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-right"
                              >
                                <option value="جديدة">جديدة</option>
                                <option value="جاري العمل عليها">جاري العمل عليها</option>
                                <option value="توصية متأخرة">توصية متأخرة</option>
                                <option value="منجزة">منجزة</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                مسار الاعتماد البدئي
                              </label>
                              <select
                                value={directRecStage}
                                onChange={(e) => setDirectRecStage(e.target.value)}
                                className="w-full text-xs font-semibold px-2 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-right"
                              >
                                <option value="أخصائي">أخصائي</option>
                                <option value="رئيس قسم">رئيس قسم</option>
                                <option value="مدير إدارة">مدير إدارة</option>
                                <option value="مكتملة">مكتملة</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg cursor-pointer transition shadow-sm"
                            >
                              حفظ التوصية في النظام
                            </button>
                            <button
                              type="button"
                              onClick={() => setDirectAddRecOpen(false)}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition"
                            >
                              إلغاء الأمر
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {/* Recommendations Cards list */}
                    {combinedRecs.length === 0 ? (
                      <div className="bg-white border border-slate-150 rounded-3xl p-12 text-center text-gray-500 font-bold text-sm">
                        لا توجد حتى الآن أية توصيات مسجلة لهذا اللقاء. يمكنك النقر على الزر أعلاه لإضافة أول توصية.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {combinedRecs.map((rec: any, idx: number) => {
                          const statusStr = rec.status || "جديدة";
                          let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
                          let borderAccent = "border-blue-100 shadow-blue-50/5";
                          let statusTextLabel = "توصية جديدة";

                          if (statusStr.includes("منجز") || statusStr.includes("مكتمل") || statusStr === "منجزة") {
                            badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
                            borderAccent = "border-emerald-100 shadow-emerald-50/5";
                            statusTextLabel = "توصية منجزة";
                          } else if (statusStr.includes("متأخر")) {
                            badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
                            borderAccent = "border-rose-100 shadow-rose-100/5";
                            statusTextLabel = "توصية متأخرة";
                          } else if (statusStr.includes("جاري")) {
                            badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
                            borderAccent = "border-amber-100 shadow-amber-50/5";
                            statusTextLabel = "جاري العمل عليها";
                          }

                          // Tracker Stages
                          const approvalStagesList = ["أخصائي", "رئيس قسم", "مدير الإدارة", "مكتملة"];
                          const currentStageText = rec.approvalStage || "أخصائي";
                          // Normalize stage word
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
                                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-black rounded-lg border ${badgeBg}`}>
                                    {statusTextLabel}
                                  </span>
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
                                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
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

                                        {/* Connector line */}
                                        {i < approvalStagesList.length - 1 && (
                                          <div
                                            className={`absolute left-0 right-1/2 top-3 h-0.5 -translate-y-1/2 -z-10 ${
                                              i < mappedIdx ? "bg-[#dfba6b]" : "bg-gray-300"
                                            }`}
                                            style={{ width: "100%" }}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Interactive controls */}
                              <div className="pt-3 border-t border-gray-300/85 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2.5">
                                  {/* Update status select */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-600 font-bold whitespace-nowrap">تعديل الحالة:</span>
                                    <select
                                      value={statusStr}
                                      onChange={(e) => handleUpdateRecommendationStatus(rec.id, e.target.value)}
                                      className="text-[11px] font-black bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer text-slate-800 shadow-sm"
                                    >
                                      <option value="جديدة">جديدة</option>
                                      <option value="جاري العمل عليها">جاري العمل عليها</option>
                                      <option value="توصية متأخرة">توصية متأخرة</option>
                                      <option value="منجزة">منجزة</option>
                                    </select>
                                  </div>

                                  {/* Advance stage button */}
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
                                    <span>{expandedRecLogsId === rec.id ? "إخفاء السجل التاريخي" : "عرض السجل التاريخي لقنوات التتبع"}</span>
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
                  <th className="px-4 py-3 font-black text-xs text-right w-16">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded text-brand"
                        checked={selectedEventIds.length === filteredEvents.length && filteredEvents.length > 0} 
                        onChange={toggleSelectAllEvents}
                      />
                      <span>م</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 font-black text-xs text-center w-36">رقم التوصية</th>
                  <th className="px-4 py-3 font-black text-xs text-right">عنوان التوصية</th>
                  <th className="px-4 py-3 font-black text-xs text-right">اللجنة</th>
                  <th className="px-4 py-3 font-black text-xs text-center w-40">تاريخ التوصية</th>
                  <th className="px-4 py-3 font-black text-xs text-center w-36">الحالة</th>
                  <th className="px-4 py-3 font-black text-xs text-center w-36">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                {sortedTableEvents.map((evt, idx) => {
                  const isExpanded = expandedEventId === evt.id;
                  const nextStep = getCalculatedNextStep(evt);
                  return (
                    <React.Fragment key={evt.id}>
                      <tr 
                        id={`event-row-${evt.id}`}
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className={`hover:bg-slate-100/80 transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700 cursor-pointer ${isExpanded ? "bg-slate-50/90 border-r-2 border-r-brand shadow-inner" : ""}`}
                      >
                        <td className="px-4 py-3.5 whitespace-nowrap text-right text-gray-900 font-mono font-black" onClick={(e) => e.stopPropagation()}>
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
                        <td className="px-4 py-3.5 whitespace-nowrap text-center text-gray-900 font-mono font-black">
                          <span className="inline-block px-2 py-1 select-all font-mono font-black text-brand bg-brand/5 border border-brand/10 rounded text-[10.5px]">
                            REC-{String(evt.id || "").substring(0, 5).toUpperCase()}
                          </span>
                        </td>

                        {/* عنوان التوصية */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-black text-gray-900 group/row" title="انقر لتشغيل منصة التحضير">
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
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-gray-800 text-right">
                          <span className="block text-gray-900 font-bold mb-1">{evt.committeeName}</span>
                          <span className="block text-[9.5px] text-gray-500 font-bold">
                            رئيس اللجنة: {allMembers.find(m => m.committeeId === evt.committeeId && m.role === "رئيس")?.name || "غير محدد"}
                          </span>
                        </td>

                        {/* تاريخ التوصية */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span className="block text-gray-900 font-bold text-[11px] mb-0.5" dir="ltr">{evt.date}</span>
                          <span className="block text-gray-500 font-bold text-[10px]" dir="ltr">{formatTime12h(evt.time || "01:30")}</span>
                        </td>

                        {/* الحالة */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
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
                        <td className="px-4 py-3.5 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                            <button
                              type="button"
                              onClick={() => setActiveGearMenuId(activeGearMenuId === evt.id ? null : evt.id)}
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
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(evt)}
                                    className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>تعديل التوصية</span>
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
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
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDelete(evt)}
                                    className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>حذف التوصية</span>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
                                <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative text-right min-h-[300px]">
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
                                                    <>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          navigator.clipboard.writeText(evt.preparationsText || "");
                                                          alert("تم نسخ الصياغة الفنية الذكية للتوصية للمحافظة بنجاح!");
                                                        }}
                                                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-gray-200 font-sans"
                                                      >
                                                        <Copy className="w-3.5 h-3.5" />
                                                        نسخ القرار
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          window.location.href = `mailto:?subject=${encodeURIComponent("تفعيل توصية قطاعية دائرية")}&body=${encodeURIComponent(evt.preparationsText || "")}`;
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
const generatedProposal = isPassing 
                                                        ? `الموضوع: تفعيل التوصية رقم (001) الصادرة بالتمرير لـ ${evt.committeeName || "اللجنة"}

توصية ${rType} صادرة بالتمرير لـ ${evt.committeeName || "اللجنة"}
تم تمريرها بتاريخ ${dayArabic} ${evt.date || "12/12/2026م"} عبر ${evt.recommendationPassMethod || "البريد الإلكتروني"}

رقم التوصية: 001
البند الأول: ${evt.title || "موضوع التوصية"}
المناقشة: ${evt.recommendationDiscussion || "تمت مناقشة التوصية وإبداء الآراء والملاحظات من قبل الأعضاء"}
التوصية: ${evt.recommendationText || "يتم اعتماد التوصية والبدء بتنفيذها"}
المكلف: أخصائي اللجنة - ${evt.employees && evt.employees[0] ? evt.employees[0] : "خلف شعبان"}
مدة التنفيذ: 5 أيام عمل
المرفقات: ${attachmentsText}` 
                                                        : `الموضوع: تفعيل التوصية رقم (001) الصادرة عن ${meetingName}

توصية ${rType} صادرة عن ${meetingName}
المنعقد في تمام الساعة ${formatTime12h(evt.time || "01:30")} من ظهر يوم ${dayArabic} ${evt.date || "12/12/2026م"} بقاعة ${evt.location || "الاجتماعات"}

رقم التوصية: 001
البند الأول: ${evt.title || "موضوع التوصية"}
المناقشة: ${evt.recommendationDiscussion || "ناقشت اللجنة إمكانية تفعيل التوصيات"}
التوصية: ${evt.recommendationText || "يتم مراجعة التوصيات الغير مفعلة لإعادة تفعيلها"}
المكلف: أخصائي اللجنة - ${evt.employees && evt.employees[0] ? evt.employees[0] : "خلف شعبان"}
مدة التنفيذ: 5 أيام عمل
المرفقات: ${attachmentsText}`;
                                                      
                                                      updateEventWorkflow(evt.id, { preparationsText: generatedProposal });
                                                    }}
                                                    className="px-2.5 py-1.5 bg-slate-900 border-transparent hover:bg-slate-800 text-brand text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 shadow transition-all duration-200 animate-pulse font-sans"
                                                  >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    توليد الصياغة الفنية الذكية
                                                  </button>
                                                </div>
                                              </div>
                                              
                                              <textarea
                                                value={evt.preparationsText || ""}
                                                onChange={(e) => updateEventWorkflow(evt.id, { preparationsText: e.target.value })}
                                                placeholder="اكتب هنا النص التفصيلي للتوصية أو الصياغة الصادرة للهيكل التنفيذي..."
                                                className="w-full h-32 p-3 text-[10px] font-bold text-slate-800 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand resize-none bg-slate-50/70 leading-relaxed text-right font-sans"
                                                dir="rtl"
                                              />
                                              
                                              {/* Digital Library Drag & Drop Simulator */}
                                              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/20 text-center relative hover:border-brand/45 transition-colors font-sans">
                                                <p className="text-[9.5px] text-slate-600 font-extrabold font-sans">المكتبة الرقمية: اسحب وأفلت المرفق هنا أو اضغط لربطه بجوجل درايف</p>
                                                
                                                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 font-sans">
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
                                                  تم الانتهاء من صياغة مسودة التوصية الفنية وإرفاق المستندات المرجعية والداعمة كلياً
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
                                              وثق هنا الشروحات والتوجيهات المكتوبة لكل جهة بالهيكل الإداري لغرفة مكة؛ لدعم وتأطير قرار تفعيل التوصية رسمياً، ومزامنة مخرجات العمل:
                                            </p>
                                            
                                            <div className="space-y-3 font-sans overflow-y-auto max-h-[220px] pr-1">
                                              {/* Specialist Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">1. أخصائي اللجنة المسؤول (توثيق المبررات الفنية)</span>
                                                  <span className="text-[7.5px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold">الأخصائي</span>
                                                </div>
                                                <textarea 
                                                  value={evt.specialistExplanation || ""}
                                                  placeholder="يرجى كتابة شرح الأخصائي حول جدوى وصحة التوصية..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { specialistExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* President/Section President Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">2. رئيس القسم اللجان القطاعية (الموافقة المبدئية)</span>
                                                  <span className="text-[7.5px] bg-[#4ea0b0]/10 text-[#4ea0b0] px-1 py-0.5 rounded font-black">رئيس القسم</span>
                                                </div>
                                                <textarea 
                                                  value={evt.presidentExplanation || ""}
                                                  placeholder="يرجى كتابة مرئيات رئيس القسم تمهيداً للإرسال لمدير الإدارة..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { presidentExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* Director Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">3. مدير إدارة اللجان والوفود القطاعية</span>
                                                  <span className="text-[7.5px] bg-[#4ea0b0]/20 text-[#3d8391] px-1 py-0.5 rounded font-black">مدير الإدارة</span>
                                                </div>
                                                <textarea 
                                                  value={evt.directorExplanation || ""}
                                                  placeholder="يرجى تدوين توجيهات مدير الإدارة والأثر المتوقع لتسهيل الأرشفة..."
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
                                                  placeholder="تدوين توجيه أو شرح وتصديق مساعد الأمين العام للغرفة..."
                                                  onChange={(e) => updateEventWorkflow(evt.id, { assistantExplanation: e.target.value })}
                                                  className="w-full text-[9px] p-2 border border-gray-200 rounded text-right focus:ring-1 focus:ring-brand bg-white font-bold leading-normal resize-none h-10"
                                                />
                                              </div>

                                              {/* Executive Comment Box */}
                                              <div className="p-2.5 bg-slate-50 rounded-lg border border-gray-150 text-right">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="text-[9px] text-slate-800 font-black">5. المكتب التنفيذي المتكامل (صاحب القرار الفاصل)</span>
                                                  <span className="text-[7.5px] bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded font-bold">المكتب التنفيذي</span>
                                                </div>
                                                <textarea 
                                                  value={evt.executiveExplanation || ""}
                                                  placeholder="قرار المكتب التنفيذي النهائي المعني..."
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
                                                    ✓ موافقة واعتماد التفعيل القطاعي
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
                                                  اعتماد الشروحات وصياغة قرار تفعيل التوصية وإحالتها للمستوى الإداري النهائي
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
                                                مراجعة الاعتمادات وإصدار الإفادة والهيكل التنظيمي المكتمل
                                              </h3>
                                              <span className="text-[9px] text-[#4ea0b0] font-extrabold px-2 py-0.5 rounded bg-[#4ea0b0]/5">مرحلة 3 من 3</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold font-sans">
                                              استعرض هنا حالة وحيثيات الاعتماد الإدارية الصادرة، حيث يتم تثبيت القرار بالتفعيل أو الحفظ والإلغاء تلبية للأعراف المنصوص بها في الغرفة:
                                            </p>

                                            {/* Final Status Display Block */}
                                            <div className="rounded-xl p-3 border font-sans space-y-1.5 shadow-sm text-right bg-white">
                                              <span className="text-[8px] text-brand font-black block">إفادتنا الإدارية النهائية:</span>
                                              
                                              {evt.activationApproved === 'approved' ? (
                                                <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl">
                                                  <div className="flex items-center gap-1.5 font-black text-[10px] text-emerald-700">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    <span>موافق عليها قطاعياً وتم اعتماد التفعيل بنجاح!</span>
                                                  </div>
                                                  <p className="text-[9px] font-bold text-emerald-600 mt-1.5 leading-relaxed">
                                                    بناءً على اعتمادات الهيكل الإداري والمكتب التنفيذي، تقرر تفعيل التوصية رقم <span className="underline font-black">REC-{String(evt.id || "").substring(0, 5).toUpperCase()}</span> رسمياً وتكليف اللجان بمتابعة الأداء مع تسكين مؤشرات الرصد المطلوبة وتحديث لوحة المؤشرات الذكية.
                                                  </p>
                                                </div>
                                              ) : evt.activationApproved === 'rejected' ? (
                                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                                                  <div className="flex items-center gap-1.5 font-black text-[10px] text-amber-500">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                    <span>تقرر حفظ المعاملة غير مفعلة وإهمال تذكيراتها كلياً في مركز عمليات اللوحة كمسألة خاملة.</span>
                                                  </div>
                                                  <p className="text-[9px] font-bold text-amber-600 mt-1.5 leading-relaxed font-sans">
                                                    تقرر حفظ المعاملة غير مفعلة بنظام اللجان؛ نتيجة لانتفاء جدواها الفنية بالمحيط التنفيذي الحالي أو للتكرارية مع عينات قطاعية موازية.
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
                                                placeholder="اكتب هنا التوجيه الرسمي النهائي للتوثيق..."
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
                                                  تثبيت وإقفال وإصدار الإفادة الرسمية وإدراج التوصية بنظام الغرفة بشكل نهائي
                                                </span>
                                              </label>
                                              {evt.minutesSaved ? (
                                                <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> جاهز</span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-extrabold shrink-0">بانتظار تثبيت القرار</span>
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
                    <p className="text-xs text-gray-500 font-medium">سجل بيانات التوصية بدقة لربط وتحديث مؤشرات الأداء والمهام</p>
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
                      استعراض وإقرار جدول الفعاليات المتسلسلة ({generatedSchedules.length})
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
                              <th className="px-4 py-2 text-center w-12">
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
                              <th className="px-4 py-2 font-black">التاريخ</th>
                              <th className="px-4 py-2 font-black">الوقت</th>
                              <th className="px-4 py-2 font-black">عنوان السجل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {generatedSchedules.map((gen) => (
                              <tr key={gen.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-4 py-2 text-center">
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
                                <td className="px-4 py-2 font-mono" dir="ltr">{gen.date}</td>
                                <td className="px-4 py-2">{gen.time || "-"}</td>
                                <td className="px-4 py-2">{gen.title}</td>
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
                              onChange={(e) => setNewCommitteeId(Number(e.target.value))}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value={0} disabled>اختر اللجنة</option>
                              {committees.map(c => (
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
                              {availableAssignees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
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

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">نص التوصية</label>
                            <textarea
                              value={newRecText}
                              onChange={(e) => setNewRecText(e.target.value)}
                              rows={2}
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
                              <p className="text-[10px] font-bold text-gray-500">مرفقات تكميلية بالملفات أو رابط Google Drive</p>
                              <button
                                type="button"
                                onClick={handleAddLinkAttachment}
                                className="mt-2.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[9px] font-black"
                              >
                                أو الصق رابط جوجل درايف يدوياً
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
                                   onChange={(e) => setImportCommitteeId(Number(e.target.value))}
                                   className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                                 >
                                   <option value={0} disabled>اختر اللجنة لاستيراد التوصيات</option>
                                   {committees.map(c => (
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
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                 >
                   نعم، احذف
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
                 هل أنت متأكد من حذف الفعالية "{deletingEvent.title}"؟ 
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
    </div>
  );
}
