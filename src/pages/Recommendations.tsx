import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFirestoreCollection } from "../lib/firebaseUtils";
import {
  CheckCircle2,
  Search,
  Plus,
  X,
  Trash2,
  Edit2,
  Check,
  BookOpen,
  Clock,
  Filter,
  Users,
  Settings,
  Copy,
  ChevronDown,
  Sparkles,
  Sliders,
  AlertCircle,
  FileText,
  Mail,
  Send,
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  CheckSquare,
  RefreshCw,
  FolderSync,
  AlertTriangle,
  Forward,
  ChevronLeft,
  Calendar,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  Activity,
  Briefcase,
  UserCheck,
  Building,
  ArrowUpRight,
  ShieldAlert,
  Inbox
} from "lucide-react";

interface Attachment {
  name: string;
  url: string;
  date: string;
  type: "مرفق التوصية" | "بريد اعتماد التوصية";
  approvalAuthority?: string; // جهة الاعتماد if email
  drivePath: string; // مجلد الحفظ المختار في جوجل درايف
}

interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  notes?: string;
}

interface RecommendationItem {
  id: string;
  title: string;              // نص التوصية
  description: string;        // تفاصيل أخرى
  committeeName: string;      // اللجنة المعنية
  eventName: string;          // اسم الفعالية
  date: string;               // تاريخ الفعالية
  status: "جديدة" | "جاري العمل عليها" | "متأخرة" | "منجزة";
  approvalStage: "الأخصائي" | "رئيس القسم" | "مدير الإدارة" | "مساعد الأمين العام" | "المكتب التنفيذي" | "مكتملة";
  assignedTo: string;         // المكلف بتفعيلها
  duration: string;           // مدة تفعيل التوصية
  attachments?: Attachment[];
  auditLogs?: AuditLogEntry[];
  hasImpact?: boolean;
  response?: "موافقة" | "رفض" | "";
  responseNotes?: string;
  implementationAction?: string;
  
  // Custom metadata
  itemNumber?: string;         // رقم البند
  itemTitle?: string;          // عنوان البند
  discussion?: string;         // المناقشة التي تمت
  addMethod?: "توصية مستقلة" | "توصية بالتمرير";
  linkedEventId?: string;      // ID of linked event if applicable
}

const DEFAULT_EMPLOYEES = ["شهاب الدين", "أحمد الحربي", "ياسر المحمادي", "مروان الأنصاري"];
const DEFAULT_COMMITTEES = [
  "لجنة الاستثمار والتمويل",
  "لجنة التغذية والإعاشة",
  "لجنة السياحة والفنادق",
  "لجنة الصناعة والطاقة",
  "لجنة التطوير العقاري"
];

const STAGES: Array<{ id: RecommendationItem["approvalStage"]; label: string; role: string }> = [
  { id: "الأخصائي", label: "الأخصائي", role: "مرحلة الدراسة والصياغة" },
  { id: "رئيس القسم", label: "رئيس القسم", role: "مراجعة ومطابقة المتطلبات" },
  { id: "مدير الإدارة", label: "مدير الإدارة", role: "اعتماد إدارة اللجان" },
  { id: "مساعد الأمين العام", label: "مساعد الأمين العام", role: "التدقيق والتفعيل الاستراتيجي" },
  { id: "المكتب التنفيذي", label: "المكتب التنفيذي", role: "المصادقة والاعتماد النهائي" }
];

const DEFAULT_DRIVE_FOLDERS = [
  "/غرفة مكة المكرمة/الملفات العامة/قسم اللجان/ملفات الاعتماد والتفعيل السريع",
  "/غرفة مكة المكرمة/الأرشيف الرقمي/توصيات لجان الدورة الحالية"
];

export default function Recommendations() {
  const { data: rawRecs, loading: recsLoading, addDocument: addFirebaseRec, updateDocument: updateFirebaseRec, deleteDocument: deleteFirebaseRec } = useFirestoreCollection<RecommendationItem>("recommendations", []);
  const { data: rawCommittees } = useFirestoreCollection<any>("committees", []);
  const { data: rawEvents } = useFirestoreCollection<any>("events", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("employees", []);
  const { addDocument: addFirebaseLog } = useFirestoreCollection<any>("system_logs", []);

  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState({ name: "شهاب الدين", role: "أخصائي اللجان" });

  // View mode toggle: "grouped" (تجميع باسم الفعالية) vs "individual" (سجل جدول شامل)
  const [viewType, setViewType] = useState<"grouped" | "individual">("grouped");

  // Filters state
  const [searchWord, setSearchWord] = useState("");
  const [filterCommittee, setFilterCommittee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterImpact, setFilterImpact] = useState("all");

  // Command menu & dropdowns
  const [activeCommandMenuId, setActiveCommandMenuId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecommendationItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recToDeleteId, setRecToDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Simulated Email Dialogue state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRec, setEmailRec] = useState<RecommendationItem | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailSentSuccess, setIsEmailSentSuccess] = useState(false);

  // Quick Stage change workflow drawer/overlay
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralRec, setReferralRec] = useState<RecommendationItem | null>(null);
  const [referralTargetStage, setReferralTargetStage] = useState<RecommendationItem["approvalStage"]>("رئيس القسم");
  const [referralNotesInput, setReferralNotesInput] = useState("");

  // Attachments & simulated directory save
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"مرفق التوصية" | "بريد اعتماد التوصية">("مرفق التوصية");
  const [newFileAuthority, setNewFileAuthority] = useState("الأمانة العامة");
  const [newFileDrivePath, setNewFileDrivePath] = useState("");
  const [archiveSuccessMessage, setArchiveSuccessMessage] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  // Visual success triggers
  const [isCopied, setIsCopied] = useState(false);

  // Form input variables
  const [formAddMethod, setFormAddMethod] = useState<"توصية مستقلة" | "توصية بالتمرير">("توصية مستقلة");
  const [formLinkedEventId, setFormLinkedEventId] = useState<string>("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCommittee, setFormCommittee] = useState("");
  const [formEventName, setFormEventName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState<RecommendationItem["status"]>("جديدة");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formHasImpact, setFormHasImpact] = useState(false);
  const [formItemNumber, setFormItemNumber] = useState("");
  const [formItemTitle, setFormItemTitle] = useState("");
  const [formDiscussion, setFormDiscussion] = useState("");

  // Resolve dynamic entities or fallbacks
  const listEmployees = useMemo(() => {
    let isSysAdmin = false;
    try {
      const savedUser = localStorage.getItem("current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.role === "SYS_ADMIN" || parsed.roleAr === "مدير النظام" || parsed.email === "khalafshehab@gmail.com")) {
          isSysAdmin = true;
        }
      }
    } catch (_) {}

    const sourceList = isSysAdmin ? dbEmployees : dbEmployees.filter((e: any) => e.role !== "SYS_ADMIN" && e.id !== "01");
    return sourceList.length > 0 ? sourceList.map((e: any) => e.name) : DEFAULT_EMPLOYEES;
  }, [dbEmployees]);

  const listCommittees = useMemo(() => {
    return rawCommittees.length > 0 ? rawCommittees.map((c: any) => c.name) : DEFAULT_COMMITTEES;
  }, [rawCommittees]);

  const confirmedEvents = useMemo(() => {
    return rawEvents || [];
  }, [rawEvents]);

  // Google Drive folders dynamically generated based on listed committees
  const driveFolders = useMemo(() => {
    const list = listCommittees.map((commName: string) => 
      `/غرفة مكة المكرمة/اللجان القطاعية/${commName}/التوصيات المعتمدة والأرشفة`
    );
    return [
      ...list,
      ...DEFAULT_DRIVE_FOLDERS
    ];
  }, [listCommittees]);

  // Sync default storage directory
  useEffect(() => {
    if (driveFolders.length > 0 && (!newFileDrivePath || !driveFolders.includes(newFileDrivePath))) {
      setNewFileDrivePath(driveFolders[0]);
    }
  }, [driveFolders, newFileDrivePath]);

  // Load current user context
  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          setCurrentUser({
            name: parsed.name,
            role: parsed.roleAr || parsed.role || "أخصائي اللجان"
          });
        }
      }
    } catch (e) {}
  }, []);

  // Sync selected recommendation on first load
  useEffect(() => {
    if (!recsLoading) {
      if (!selectedRecId && rawRecs.length > 0) {
        setSelectedRecId(rawRecs[0].id);
      }
    }
  }, [rawRecs, recsLoading, selectedRecId]);

  // Automatically close floating dropdown menu on outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.command-menu-container')) {
        setActiveCommandMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handler for select event changes in the setup wrapper
  const handleLinkedEventChange = (eventId: string) => {
    setFormLinkedEventId(eventId);
    if (!eventId) return;
    const evt = confirmedEvents.find((e: any) => String(e.id) === eventId);
    if (evt) {
      setFormEventName(evt.title);
      setFormCommittee(evt.committeeName || (listCommittees[0] || ""));
      setFormDate(evt.date || new Date().toISOString().substring(0, 10));
    }
  };

  const currentRec = useMemo(() => {
    return rawRecs.find(r => r.id === selectedRecId) || null;
  }, [rawRecs, selectedRecId]);

  // Filter recommendations matching the selected parameters
  const filteredRecs = useMemo(() => {
    return rawRecs.filter(rec => {
      const word = searchWord.trim().toLowerCase();
      const matchesWord = !word || 
        rec.title.toLowerCase().includes(word) ||
        (rec.description && rec.description.toLowerCase().includes(word)) ||
        rec.committeeName.toLowerCase().includes(word) ||
        rec.eventName.toLowerCase().includes(word) ||
        rec.assignedTo.toLowerCase().includes(word);
      
      const matchesCommittee = filterCommittee === "all" || rec.committeeName === filterCommittee;
      const matchesStatus = filterStatus === "all" || rec.status === filterStatus;
      const matchesStage = filterStage === "all" || rec.approvalStage === filterStage;
      const matchesImpact = filterImpact === "all" || 
        (filterImpact === "impact" && rec.hasImpact) || 
        (filterImpact === "normal" && !rec.hasImpact);

      return matchesWord && matchesCommittee && matchesStatus && matchesStage && matchesImpact;
    });
  }, [rawRecs, searchWord, filterCommittee, filterStatus, filterStage, filterImpact]);

  // Grouped by Event mapping for card-based presentations (اسم الفعالية يحمل التوصيات)
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: { committeeName: string; eventName: string; date: string; items: RecommendationItem[] } } = {};
    filteredRecs.forEach(rec => {
      const eventKey = rec.addMethod === "توصية بالتمرير" 
        ? `توصيات بالتمرير خارج إطار الاجتماعات الاعتيادية` 
        : `${rec.committeeName} || ${rec.eventName}`;

      if (!groups[eventKey]) {
        groups[eventKey] = {
          committeeName: rec.addMethod === "توصية بالتمرير" ? "إعفاء من الجلسة" : rec.committeeName,
          eventName: rec.addMethod === "توصية بالتمرير" ? "توصيات بطريقة التمرير المباشر" : rec.eventName,
          date: rec.date || "",
          items: []
        };
      }
      groups[eventKey].items.push(rec);
    });
    return groups;
  }, [filteredRecs]);

  // Layout triggers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormAddMethod("توصية مستقلة");
    setFormLinkedEventId("");
    setFormTitle("");
    setFormDesc("");
    setFormCommittee(listCommittees[0] || "");
    setFormEventName("");
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormStatus("جديدة");
    setFormAssignedTo(listEmployees[0] || "");
    setFormDuration("15 يوم عمل");
    setFormHasImpact(false);
    setFormItemNumber("البند الأول");
    setFormItemTitle("");
    setFormDiscussion("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: RecommendationItem) => {
    setEditingItem(rec);
    setFormAddMethod(rec.addMethod || "توصية مستقلة");
    setFormLinkedEventId(rec.linkedEventId || "");
    setFormTitle(rec.title);
    setFormDesc(rec.description);
    setFormCommittee(rec.committeeName);
    setFormEventName(rec.eventName);
    setFormDate(rec.date);
    setFormStatus(rec.status);
    setFormAssignedTo(rec.assignedTo);
    setFormDuration(rec.duration);
    setFormHasImpact(!!rec.hasImpact);
    setFormItemNumber(rec.itemNumber || "البند الأول");
    setFormItemTitle(rec.itemTitle || "");
    setFormDiscussion(rec.discussion || "");
    setIsFormOpen(true);
  };

  const handleSaveRecommendation = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCommittee || !formAssignedTo) {
      alert("يرجى التأكد من ملء حقول نص التوصية، اللجنة والمسؤول المتابع.");
      return;
    }

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (editingItem) {
      const originalLogs = editingItem.auditLogs || [];
      const updatedLogs = [
        ...originalLogs,
        {
          timestamp: currentTimestamp,
          action: "تعديل محتويات التوصية وبنية تفعيلها",
          user: currentUser.name
        }
      ];

      const updatePayload: Partial<RecommendationItem> = {
        title: formTitle,
        description: formDesc,
        committeeName: formCommittee,
        eventName: formAddMethod === "توصية بالتمرير" ? "توصية بالتمرير المباشر" : formEventName,
        date: formDate,
        status: formStatus,
        assignedTo: formAssignedTo,
        duration: formDuration,
        hasImpact: formHasImpact,
        itemNumber: formItemNumber,
        itemTitle: formItemTitle,
        discussion: formDiscussion,
        addMethod: formAddMethod,
        linkedEventId: formLinkedEventId || undefined,
        auditLogs: updatedLogs
      };

      await updateFirebaseRec(editingItem.id, updatePayload);
    } else {
      const newPayload: Omit<RecommendationItem, "id"> = {
        title: formTitle,
        description: formDesc,
        committeeName: formCommittee,
        eventName: formAddMethod === "توصية بالتمرير" ? "توصية بالتمرير المباشر" : formEventName,
        date: formDate,
        status: formStatus,
        approvalStage: "الأخصائي",
        assignedTo: formAssignedTo,
        duration: formDuration,
        hasImpact: formHasImpact,
        itemNumber: formItemNumber,
        itemTitle: formItemTitle,
        discussion: formDiscussion,
        addMethod: formAddMethod,
        linkedEventId: formLinkedEventId || undefined,
        response: "",
        responseNotes: "",
        implementationAction: "",
        attachments: [],
        auditLogs: [
          {
            timestamp: currentTimestamp,
            action: `تأسيس التوصية (${formAddMethod === "توصية مستقلة" ? "توصية مستقلة" : "توصية بالتمرير المباشر"}) بواسطة الأخصائي: ${currentUser.name}`,
            user: currentUser.name
          }
        ]
      };

      const docId = await addFirebaseRec(newPayload);
      if (docId) setSelectedRecId(docId);
    }

    setIsFormOpen(false);
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setRecToDeleteId(id);
    setDeleteReason("");
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteRecommendation = async () => {
    if (!recToDeleteId) return;
    if (!deleteReason.trim()) {
      alert("يرجى إدخال سبب الحذف.");
      return;
    }

    try {
      await deleteFirebaseRec(recToDeleteId);
      
      await addFirebaseLog({
        employeeName: currentUser.name,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        operationType: "حذف توصية قطاعية",
        status: "ناجحة",
        details: `تم الحذف للتوصية (${recToDeleteId}) مع توثيق سبب الحذف: ${deleteReason}`
      } as any);

      const remaining = rawRecs.filter(r => r.id !== recToDeleteId);
      if (selectedRecId === recToDeleteId) {
        setSelectedRecId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error(err);
    }

    setIsDeleteConfirmOpen(false);
    setRecToDeleteId(null);
    setDeleteReason("");
  };

  // Stepper Referral trigger
  const handleProceedReferral = async (nextStage: RecommendationItem["approvalStage"], notes: string) => {
    const targetRec = referralRec || currentRec;
    if (!targetRec) return;

    let actionDescription = "";
    if (nextStage === "رئيس القسم") {
      actionDescription = "إحالة التوصية إلى رئيس القسم";
    } else if (nextStage === "مدير الإدارة") {
      actionDescription = "رفع التوصية لمدير إدارة اللجان";
    } else if (nextStage === "مساعد الأمين العام") {
      actionDescription = "رفع التوصية للاعتماد من مساعد الأمين العام";
    } else if (nextStage === "المكتب التنفيذي") {
      actionDescription = "إحالة التوصية للمكتب التنفيذي للاعتماد";
    } else if (nextStage === "مكتملة") {
      actionDescription = "تأكيد تفعيل التوصية بنجاح واعتماد ترحيلها النهائي";
    } else {
      actionDescription = `إرجاع الملف الإجرائي للمرحلة: ${nextStage}`;
    }

    const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newLog: AuditLogEntry = {
      timestamp: currentTimestamp,
      action: actionDescription,
      user: currentUser.name,
      notes: notes.trim() || undefined
    };

    const updatedLogs = [...(targetRec.auditLogs || []), newLog];
    const updatePayload: Partial<RecommendationItem> = {
      approvalStage: nextStage,
      status: nextStage === "مكتملة" ? "منجزة" : "جاري العمل عليها",
      auditLogs: updatedLogs
    };

    await updateFirebaseRec(targetRec.id, updatePayload);
    setIsReferralModalOpen(false);
    setReferralRec(null);
    setReferralNotesInput("");
  };

  const handleOpenQuickReferral = (rec: RecommendationItem) => {
    setReferralRec(rec);
    const currentIndex = STAGES.findIndex(s => s.id === rec.approvalStage);
    const nextIndex = currentIndex < STAGES.length - 1 ? currentIndex + 1 : currentIndex;
    setReferralTargetStage(STAGES[nextIndex].id);
    setReferralNotesInput("");
    setIsReferralModalOpen(true);
  };

  // Smart Compiler compiler text compiler
  const getSmartAISummary = (rec: RecommendationItem) => {
    return `مقرر حوكمة وتفعيل التوصيات - غرفة مكة المكرمة:
------------------------------------------
• تصنيف الإجراء: ${rec.addMethod || "توصية مستقلة"}
• اللجنة والقطاع المعني: ${rec.committeeName}
• الفعالية التاريخية: ${rec.eventName || "تفعيل بالتمرير الدائم"} (${rec.date || "بدون تاريخ محدد"})
• معرّف البند والمحور: البند {${rec.itemNumber || "غير مرقم"}} - العنوان {${rec.itemTitle || "عام"}}
• وقائع ومناقشة الجلسة: "${rec.discussion || "لم يتم تدوين مناقشة تفصيلية"}"
• نص القرار الملتزم به: "${rec.title}"
• المسؤول المكلف بالمتابعة: الأستاذ / ${rec.assignedTo}
• الإطار الزمني للتنفيذ: خلال ${rec.duration || "الفترة النظامية"}
• مرحلة التتبع الإداري الحالية: [${rec.approvalStage}] (الحالة: ${rec.status})`;
  };

  const handleCopySmartSummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Email simulation container triggers
  const handleOpenEmailComposer = (rec: RecommendationItem) => {
    setEmailRec(rec);
    setEmailTo("committees.manager@makkahchamber.sa");
    setEmailSubject(`مخطط حوكمة وتصميم توصية: [${rec.committeeName}] - البند [${rec.itemNumber || "الرئيسي"}]`);
    setEmailBody(`المحترمين في إدارة اللجان بغرفة مكة المكرمة،

السلام عليكم ورحمة الله وبركاته،،

نرفع لكم مستند حوكمة التوصية المعتمدة رقم (${rec.id.substring(0, 6)})، والصادرة بمطالب من السادة أعضاء اللجنة:

• اللجنة والنشاط القطاعي: ${rec.committeeName}
• الفعالية التاريخية: ${rec.eventName} (${rec.date})
• رقم ومحور البند: ${rec.itemNumber || "الأول"} - ${rec.itemTitle || "غير محدد"}
• خلاصة المناقشة: ${rec.discussion || "تطوير الجودة وتفعيل برامج التعاون المشتركة"}
• صيغة التوصية المعمدة: "${rec.title}"
• منسق التمكين والمكلف: الأستاذ/ ${rec.assignedTo}
• سقف التنفيذ الزمني: ${rec.duration}

تم أرشفتها بمجلد جوجل درايف ومطابقتها من قبل إدارة اللجان.

أخصائي اللجان والاتصال بغرفة مكة المكرمة`);
    setIsEmailModalOpen(true);
    setIsEmailSending(false);
    setIsEmailSentSuccess(false);
  };

  const handleSendEmailSimulate = () => {
    if (!emailRec) return;
    setIsEmailSending(true);
    setTimeout(() => {
      setIsEmailSending(false);
      setIsEmailSentSuccess(true);
      
      const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const originalLogs = emailRec.auditLogs || [];
      const updatedLogs = [
        ...originalLogs,
        {
          timestamp: currentTimestamp,
          action: `إصدار وتصدير المظروف البريدي وحافظه العمل لوجهات المتابعة الحكومية والتجارية`,
          user: currentUser.name,
          notes: `البريد المرسل: ${emailTo}`
        }
      ];
      updateFirebaseRec(emailRec.id, { auditLogs: updatedLogs });

      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailRec(null);
      }, 1500);
    }, 1200);
  };

  // Custom attachment Google Drive archiver simulation with live warning
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRec) return;
    if (!newFileName.trim()) {
      alert("يرجى تدوين اسم الملحق بوضوح.");
      return;
    }

    setIsArchiving(true);
    setArchiveSuccessMessage("");

    setTimeout(async () => {
      const generatedUrl = newFileUrl.trim() || `https://drive.google.com/drive/folders/makkah_chamber_rec_${currentRec.id}`;
      const newAttach: Attachment = {
        name: newFileName.trim(),
        url: generatedUrl,
        date: new Date().toISOString().substring(0, 10),
        type: newFileType,
        drivePath: newFileDrivePath,
        approvalAuthority: newFileType === "بريد اعتماد التوصية" ? newFileAuthority : undefined
      };

      const originalAttachments = currentRec.attachments || [];
      const updatedAttachments = [...originalAttachments, newAttach];

      const currentTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const originalLogs = currentRec.auditLogs || [];
      const updatedLogs = [
        ...originalLogs,
        {
          timestamp: currentTimestamp,
          action: `إرفاق وتوثيق مخرج رقمي [${newFileName}] وحفظه في مساحة درايف المحددة`,
          user: currentUser.name,
          notes: `مسار جوجل درايف: ${newFileDrivePath}`
        }
      ];

      await updateFirebaseRec(currentRec.id, {
        attachments: updatedAttachments,
        auditLogs: updatedLogs
      });

      setIsArchiving(false);
      setArchiveSuccessMessage(newFileDrivePath);
      setNewFileName("");
      setNewFileUrl("");
    }, 1200);
  };

  // Colors & badges mapped to the requested guidelines (Navy & Gold vibe)
  const getStatusBadge = (status: RecommendationItem["status"]) => {
    switch (status) {
      case "جديدة":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "جاري العمل عليها":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "متأخرة":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "منجزة":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusBullet = (status: RecommendationItem["status"]) => {
    switch (status) {
      case "جديدة": return "bg-blue-500";
      case "جاري العمل عليها": return "bg-amber-500";
      case "متأخرة": return "bg-rose-500";
      case "منجزة": return "bg-emerald-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6 pb-20 text-right font-sans" dir="rtl">
      
      {/* Top Professional Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-[#246fff]/10 p-2.5 rounded-xl text-[#246fff] shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                إدارة وحوكمة التوصيات القطاعية
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-[#246fff] bg-[#246fff]/5 border border-[#246fff]/10 px-2 py-0.5 rounded-md">
                  غرفة مكة المكرمة
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-medium">
                  منصة الصياغة، الاعتماد، الربط بالفعاليات، والأرشفة الفورية على جوجل درايف
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full md:w-auto h-11 px-6 bg-[#246fff] hover:bg-[#2064e6] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>تأسيس وإضافة توصية</span>
        </button>
      </div>

      {/* Grid General Performance Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">إجمالي التوصيات</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{rawRecs.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-x-4">
          <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">جاري تفعيلها</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
              {rawRecs.filter(r => r.status === "جاري العمل عليها").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-x-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">منجزة ومعتمدة</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
              {rawRecs.filter(r => r.status === "منجزة").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-x-4">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500">توصيات متأخرة</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
              {rawRecs.filter(r => r.status === "متأخرة").length}
            </p>
          </div>
        </div>
      </div>

      {recsLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <RefreshCw className="w-10 h-10 text-[#246fff] animate-spin mx-auto mb-4" />
          <p className="text-slate-650 font-extrabold text-sm">جاري جلب بيانات التوصيات من قاعدة البيانات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main List Section (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filter controls tab */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black text-slate-700">تصفية التوصيات والفرز</span>
                </div>

                {/* Styled Switcher for View Modes */}
                <div className="bg-slate-100 p-0.5 rounded-lg flex self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewType("grouped")}
                    className={`px-3 py-1.5 text-center font-bold text-[11px] rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewType === "grouped" ? "bg-white text-[#246fff] shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>العرض كـ بطاقة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewType("individual")}
                    className={`px-3 py-1.5 text-center font-bold text-[11px] rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewType === "individual" ? "bg-white text-[#246fff] shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>العرض كـ سجل (جدول)</span>
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    placeholder="ابحث بالنص أو المسؤول..."
                    className="w-full text-[11px] font-bold px-3 py-2 pr-8 border border-slate-250 rounded-xl bg-slate-50/50 text-right focus:outline-none focus:ring-1 focus:ring-[#246fff] text-slate-800 placeholder-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>

                <div>
                  <select
                    value={filterCommittee}
                    onChange={(e) => setFilterCommittee(e.target.value)}
                    className="w-full text-[11px] font-bold p-2 border border-slate-200 rounded-xl bg-white text-slate-700"
                  >
                    <option value="all">كل اللجان القطاعية</option>
                    {listCommittees.map((comm, idx) => (
                      <option key={idx} value={comm}>{comm}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-[11px] font-bold p-2 border border-slate-200 rounded-xl bg-white text-slate-700"
                  >
                    <option value="all">كل حالات التفعيل</option>
                    <option value="جديدة">جديدة</option>
                    <option value="جاري العمل عليها">جاري العمل عليها</option>
                    <option value="متأخرة">متأخرة</option>
                    <option value="منجزة">منجزة</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="w-full text-[11px] font-bold p-2 border border-slate-200 rounded-xl bg-white text-slate-700"
                  >
                    <option value="all">كل مراحل الحوكمة</option>
                    {STAGES.map((s, idx) => (
                      <option key={idx} value={s.id}>{s.label}</option>
                    ))}
                    <option value="مكتملة">مكتملة</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Body Area */}
            {filteredRecs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-extrabold text-sm">لا تتوفر أي توصيات قطاعية مطابقة لخيارات الفرز الحالية.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchWord("");
                    setFilterCommittee("all");
                    setFilterStatus("all");
                    setFilterStage("all");
                    setFilterImpact("all");
                  }}
                  className="mt-3 text-xs text-[#246fff] font-bold hover:underline"
                >
                  إعادة تهيئة التصفية لجميع التوصيات
                </button>
              </div>
            ) : viewType === "grouped" ? (
              
              /* RENDER METHOD A: Grouped by activity/meeting (بطاقة باسم الفعالية وبداخلها التوصيات) */
              <div className="space-y-4">
                {Object.keys(groupedEvents).map((eventTitle, gIndex) => {
                  const groupObj = groupedEvents[eventTitle];
                  const isCirculation = eventTitle.includes("توصيات بطريقة التمرير");
                  return (
                    <div key={gIndex} className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                      
                      {/* Event Group Header */}
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            {isCirculation ? (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                أسلوب تفعيل سريع
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-[#246fff] bg-[#246fff]/5 border border-[#246fff]/10 px-2 py-0.5 rounded-md">
                                {groupObj.committeeName}
                              </span>
                            )}
                            {groupObj.date && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                تاريخ الفعالية: {groupObj.date}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs md:text-sm font-black text-slate-900 mt-1">
                            {groupObj.eventName}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          المقر المقيد: {groupObj.items.length} توصيات
                        </span>
                      </div>

                      {/* Nested group items */}
                      <div className="divide-y divide-slate-100">
                        {groupObj.items.map((rec) => {
                          const isSelected = rec.id === selectedRecId;
                          return (
                            <div
                              key={rec.id}
                              onClick={() => setSelectedRecId(rec.id)}
                              className={`p-4 hover:bg-slate-50/50 cursor-pointer transition-all flex flex-col gap-2 relative ${
                                isSelected ? "bg-[#246fff]/5 border-r-4 border-[#246fff]" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(rec.status)}`}>
                                    {rec.status}
                                  </span>
                                  {rec.hasImpact && (
                                    <span className="bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[9px] font-extrabold px-1.5 py-0.5 flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      أثر استراتيجي
                                    </span>
                                  )}
                                </div>

                                {/* Floating control action wheels */}
                                <div className="relative command-menu-container">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCommandMenuId(activeCommandMenuId === rec.id ? null : rec.id);
                                    }}
                                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>

                                  {activeCommandMenuId === rec.id && (
                                    <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 divide-y divide-slate-100">
                                      <div className="p-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveCommandMenuId(null);
                                            handleOpenEdit(rec);
                                          }}
                                          className="w-full text-right px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                          <span>تعديل التفاصيل</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveCommandMenuId(null);
                                            handleOpenQuickReferral(rec);
                                          }}
                                          className="w-full text-right px-3 py-1.5 text-xs font-bold text-[#246fff] hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                                        >
                                          <Forward className="w-3.5 h-3.5" />
                                          <span>خيارات الإحالة</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveCommandMenuId(null);
                                            handleOpenEmailComposer(rec);
                                          }}
                                          className="w-full text-right px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                                        >
                                          <Mail className="w-3.5 h-3.5" />
                                          <span>تصدير بالبريد</span>
                                        </button>
                                      </div>
                                      <div className="p-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveCommandMenuId(null);
                                            handleOpenDeleteConfirm(rec.id);
                                          }}
                                          className="w-full text-right px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>حذف التوصية</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <h5 className="text-[12px] md:text-[13px] font-extrabold text-slate-900 leading-normal pl-4">
                                {rec.title}
                              </h5>

                              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{rec.itemNumber || "البند الأول"} {rec.itemTitle ? `- ${rec.itemTitle}` : ""}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    مكتب: {rec.assignedTo}
                                  </span>
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    المرحلة: {rec.approvalStage}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              
              /* RENDER METHOD B: Comprehensive Individual Checklist Table (سجل) */
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3 text-right">عنوان التوصية</th>
                        <th className="p-3 text-right">اللجنة القطاعية</th>
                        <th className="p-3 text-right">رقم البند</th>
                        <th className="p-3 text-center">المسؤول المكلف</th>
                        <th className="p-3 text-center">المسار الحالي</th>
                        <th className="p-3 text-center">الحالة</th>
                        <th className="p-3 text-left">أوامر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecs.map((rec) => {
                        const isSelected = rec.id === selectedRecId;
                        return (
                          <tr
                            key={rec.id}
                            onClick={() => setSelectedRecId(rec.id)}
                            className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                              isSelected ? "bg-slate-50/90 font-semibold border-r-4 border-r-[#246fff]" : ""
                            }`}
                          >
                            <td className="p-3">
                              <p className="font-extrabold text-slate-900 leading-normal max-w-[200px] truncate">
                                {rec.title}
                              </p>
                              {rec.hasImpact && (
                                <span className="inline-flex mt-1 bg-amber-50 text-amber-700 text-[8.5px] font-extrabold px-1 rounded-sm">
                                  تمكين استراتيجي ✨
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-slate-650 max-w-[120px] truncate">{rec.committeeName}</td>
                            <td className="p-3 text-slate-500 font-mono">{rec.itemNumber || "الأول"}</td>
                            <td className="p-3 text-center text-slate-700 font-medium">{rec.assignedTo}</td>
                            <td className="p-3 text-center">
                              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {rec.approvalStage}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(rec.status)}`}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="p-3 text-left" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(rec)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  title="تعديل"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickReferral(rec)}
                                  className="p-1 hover:bg-slate-100 rounded text-[#246fff] transition-colors cursor-pointer"
                                  title="إحالة ومتابعة"
                                >
                                  <Forward className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteConfirm(rec.id)}
                                  className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Detail Panel Card & Interactive Actions (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            {currentRec ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100">
                
                {/* Visual Header card */}
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 tracking-wide block uppercase font-mono">
                      مظروف التوصية الإجرائي
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getStatusBadge(currentRec.status)}`}>
                      {currentRec.status}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-black text-slate-900 leading-normal">
                    {currentRec.title}
                  </h3>
                  
                  {currentRec.hasImpact && (
                    <div className="inline-flex gap-1 items-center px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-extrabold rounded-lg w-fit mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                      <span>توصية ذات بعد وأثر استراتيجي وطني</span>
                    </div>
                  )}
                </div>

                {/* Event Core Specifications Details */}
                <div className="p-5 space-y-3">
                  <h4 className="text-[11px] font-black text-slate-800 border-r-2 border-r-[#246fff] pr-2">
                    تفاصيل وقائع ومأثور الفعالية
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9.5px] font-black text-slate-400 block mb-0.5">اسم الفعالية المقيدة</span>
                      <span className="text-[10.5px] font-extrabold text-slate-800 block line-clamp-1">
                        {currentRec.eventName || "تفعيل بالتمرير المباشر"}
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9.5px] font-black text-slate-400 block mb-0.5">اللجنة القطاعية</span>
                      <span className="text-[10.5px] font-extrabold text-slate-800 block line-clamp-1">
                        {currentRec.committeeName}
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9.5px] font-black text-slate-400 block mb-0.5">الرقم المرجعي / التاريخ</span>
                      <span className="text-[10px] font-extrabold text-slate-800 block">
                        {currentRec.date || "غير مدرج"}
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9.5px] font-black text-slate-400 block mb-0.5">آلية التأسيس والإضافة</span>
                      <span className="text-[10px] font-extrabold text-slate-800 block">
                        {currentRec.addMethod || "توصية مستقلة"}
                      </span>
                    </div>
                  </div>

                  {/* Item credentials */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black">
                      <BookOpen className="w-3.5 h-3.5 text-[#246fff]" />
                      <span>{currentRec.itemNumber || "البند الأول"}: {currentRec.itemTitle || "غير مسمى"}</span>
                    </div>
                    {currentRec.discussion && (
                      <p className="text-[11px] font-bold text-slate-700 leading-normal pr-5 text-justify">
                        <span className="text-slate-400 font-medium">الواقعة والمناقشة: </span>
                        {currentRec.discussion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Assigned Person & expected Duration */}
                <div className="p-5 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block">المكلف بالتنفيذ والتمكين</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center text-[#246fff] text-[10px] font-bold">
                        {currentRec.assignedTo ? currentRec.assignedTo.substring(0, 2) : "أخ"}
                      </div>
                      <span className="text-[11.5px] font-extrabold text-slate-800">
                        {currentRec.assignedTo || "غير معين"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-slate-400 block">الإطار الزمني المستهدف</span>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-800">
                      <Clock className="w-4 h-4 text-[#246fff]" />
                      <span className="text-[11.5px] font-extrabold">
                        {currentRec.duration || "مباشر"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stages tracking Stepper widget (الأخصائي -> رئيس القسم -> مدير الإدارة -> مساعد الأمين العام -> المكتب التنفيذي) */}
                <div className="p-5 space-y-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-800">
                      مراحل وسلسلة مطابقة وحوكمة التوصية
                    </h4>
                    <span className="text-[10px] font-bold text-[#246fff]">
                      {currentRec.approvalStage === "مكتملة" ? "اعتماد كلي مكتمل" : `المرحلة: ${currentRec.approvalStage}`}
                    </span>
                  </div>

                  {/* Horizontal Stepper layout */}
                  <div className="relative pt-2 pb-5">
                    <div className="absolute top-5 left-2 right-2 h-0.5 bg-slate-200"></div>
                    <div className="relative flex justify-between">
                      {STAGES.map((s, stepIndex) => {
                        const currentIndex = STAGES.findIndex(x => x.id === currentRec.approvalStage);
                        const isCompleted = currentRec.approvalStage === "مكتملة" || stepIndex < currentIndex;
                        const isCurrent = currentRec.approvalStage === s.id;

                        return (
                          <div key={stepIndex} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                                isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : isCurrent
                                  ? "bg-[#246fff] text-white ring-4 ring-[#246fff]/20"
                                  : "bg-white border border-slate-300 text-slate-400"
                              }`}
                              title={s.role}
                            >
                              {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepIndex + 1}
                            </div>
                            <span className={`text-[9px] font-black mt-1.5 transition-colors ${
                              isCurrent ? "text-[#246fff]" : isCompleted ? "text-emerald-600" : "text-slate-400"
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action block for referring forwards or backwards in the hierarchy */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenQuickReferral(currentRec)}
                      className="flex-1 h-9 px-3 bg-slate-900 text-white hover:bg-slate-800 text-[10.5px] font-extrabold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Forward className="w-3.5 h-3.5 shrink-0" />
                      <span>إحالة للمرحلة التالية</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const originalLogs = currentRec.auditLogs || [];
                        const updatedLogs = [
                          ...originalLogs,
                          {
                            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            action: "تمت تصفية التوصية والتأكيد كلياً لتصبح منجزة ومحمية",
                            user: currentUser.name
                          }
                        ];
                        updateFirebaseRec(currentRec.id, { approvalStage: "مكتملة", status: "منجزة", auditLogs: updatedLogs });
                      }}
                      disabled={currentRec.approvalStage === "مكتملة"}
                      className={`h-9 px-4 text-[10.5px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer border ${
                        currentRec.approvalStage === "مكتملة"
                          ? "bg-slate-150 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>اعتماد مكتمل</span>
                    </button>
                  </div>
                </div>

                {/* Google Drive Archiving and Attachment Module */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                      <FolderOpen className="w-4 h-4 text-slate-400" />
                      <span>مرفقات التوصية (أرشيف Google Drive)</span>
                    </h4>
                    <span className="text-[9.5px] text-slate-400">
                      {currentRec.attachments?.length || 0} ملف مجدول
                    </span>
                  </div>

                  {/* Render listed attachments if any */}
                  {currentRec.attachments && currentRec.attachments.length > 0 ? (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {currentRec.attachments.map((attach, aIdx) => (
                        <div key={aIdx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center justify-between gap-3 text-right">
                          <div className="min-w-0">
                            <p className="text-[10.5px] font-black text-slate-800 truncate" title={attach.name}>
                              {attach.name}
                            </p>
                            <span className="text-[9px] text-slate-400 block leading-tight truncate" title={attach.drivePath}>
                              مجلد الحفظ: {attach.drivePath}
                            </span>
                            {attach.approvalAuthority && (
                              <span className="text-[8.5px] text-amber-700 font-extrabold bg-amber-50 px-1 rounded-sm">
                                المعتمد: {attach.approvalAuthority}
                              </span>
                            )}
                          </div>

                          <a
                            href={attach.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#246fff] hover:underline text-[10px] font-bold shrink-0 flex items-center gap-0.5 bg-white border px-2 py-1 rounded-md"
                          >
                            <span>فتح</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400 bg-slate-50 p-3 rounded-xl text-center">
                      لم ترفق مستندات رسمية أو بريد اعتماد لهذه التوصية بعد في أرشيف درايف.
                    </p>
                  )}

                  {/* Fast Archiving form simulating Google Workspace placement */}
                  <form onSubmit={handleAddAttachment} className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-3">
                    <span className="text-[10px] font-black text-slate-700 block">
                      رفع أو ربط مستند أرشفة جديد
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-right">
                      <div>
                        <label className="text-[9px] font-black text-slate-400">اسم المرفق:</label>
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="مثال: قرار مطابقة اللجنة"
                          className="w-full text-[10px] font-bold p-1 border border-slate-250 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400">التصنيف الإجرائي:</label>
                        <select
                          value={newFileType}
                          onChange={(e) => setNewFileType(e.target.value as any)}
                          className="w-full text-[10px] font-bold p-1 border border-slate-250 rounded-lg bg-white text-slate-600"
                        >
                          <option value="مرفق التوصية">مرفق التوصية</option>
                          <option value="بريد اعتماد التوصية">بريد اعتماد التوصية</option>
                        </select>
                      </div>
                    </div>

                    {newFileType === "بريد اعتماد التوصية" && (
                      <div>
                        <label className="text-[9px] font-black text-slate-400 block leading-tight">جهة الاعتماد والمصادقة:</label>
                        <input
                          type="text"
                          value={newFileAuthority}
                          onChange={(e) => setNewFileAuthority(e.target.value)}
                          placeholder="مثال: الأمين العام، رئيس الغرفة"
                          className="w-full text-[10px] font-bold p-1 border border-slate-250 rounded-lg bg-white mt-0.5"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 block mb-0.5">
                        مكان ومجلد الحفظ على Google Drive (قائد الأرشفة):
                      </label>
                      <select
                        value={newFileDrivePath}
                        onChange={(e) => setNewFileDrivePath(e.target.value)}
                        className="w-full text-[9.5px] font-bold p-1 border border-slate-250 rounded-lg bg-white text-slate-700"
                      >
                        {driveFolders.map((pathStr, pIdx) => (
                          <option key={pIdx} value={pathStr}>
                            {pathStr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 block leading-tight">رابط الملف بالجوجل درايف (إيجاز):</label>
                      <input
                        type="url"
                        value={newFileUrl}
                        onChange={(e) => setNewFileUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full text-[10px] font-bold p-1 border border-slate-250 rounded-lg bg-white focus:ring-1 focus:ring-[#246fff] mt-0.5L"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isArchiving}
                      className="w-full h-8 bg-[#246fff] text-white hover:bg-slate-800 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isArchiving ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>جاري الأرشفة على درايف...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>ربط وأرشفة المستند فوراً</span>
                        </>
                      )}
                    </button>

                    {archiveSuccessMessage && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-250 p-2 rounded-lg text-[9.5px] font-bold flex items-center gap-1 mt-2">
                        <Check className="w-3.5 h-3.5" />
                        <div className="min-w-0 flex-1">
                          تم الحفظ بنجاح وتوثيق مسار المجلد لتأكيد الأرشفة المباشرة:
                          <span className="block font-mono bg-white p-1 rounded border overflow-x-auto text-[8.5px] mt-1 text-slate-600 select-all font-bold">
                            {archiveSuccessMessage}
                          </span>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                {/* Smart Action Tools (AI Summary & Mail Sender) */}
                <div className="p-5 space-y-4">
                  <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>المنظومة الذكية للتصدير والمطابقة</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* AISmart copy button */}
                    <button
                      type="button"
                      onClick={() => handleCopySmartSummary(getSmartAISummary(currentRec))}
                      className="h-10 px-3 bg-amber-50 hover:bg-amber-100/80 text-amber-950 border border-amber-250 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                      <span>{isCopied ? "تم النسخ بنجاح!" : "نسخ المظروف الذكي"}</span>
                    </button>

                    {/* Quick email composer action */}
                    <button
                      type="button"
                      onClick={() => handleOpenEmailComposer(currentRec)}
                      className="h-10 px-3 bg-[#246fff]/5 hover:bg-[#246fff]/10 text-slate-850 border border-[#246fff]/20 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Mail className="w-4 h-4 text-[#246fff]" />
                      <span>تصدير فوري بالبريد</span>
                    </button>
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="p-5 space-y-2 bg-slate-50/20">
                  <h4 className="text-[11px] font-black text-slate-700">
                    السجل التاريخي للإجراءات وعمليات الفحص
                  </h4>
                  {currentRec.auditLogs && currentRec.auditLogs.length > 0 ? (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {currentRec.auditLogs.map((log, lIdx) => (
                        <div key={lIdx} className="bg-white p-2 rounded-lg border border-slate-100 text-[10px] leading-relaxed">
                          <div className="flex items-center justify-between text-slate-400 text-[9px] font-semibold">
                            <span>بواسطة: {log.user}</span>
                            <span className="font-mono">{log.timestamp}</span>
                          </div>
                          <p className="font-bold text-slate-800 mt-0.5">{log.action}</p>
                          {log.notes && (
                            <p className="text-slate-500 font-medium text-[9.5px] mt-0.5 bg-slate-50 p-1.5 rounded-md border-r-2 border-r-indigo-200">
                              ملاحظة الإحالة: {log.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-400">لا توجد سجلات تعديل ومطابقة حتى تاريخه.</p>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-extrabold text-xs">يرجى اختيار وتحديد أحد التوصيات المدرجة لاستعراض مظروفها الإجرائي وحوكمتها هنا.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* RETAIN FULL COMPLIANT MODALS AND OVERLAYS SECTION */}
      
      {/* 1. Modal creation / edit wrapper */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden text-right text-xs"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black">
                    {editingItem ? "تعديل وحوكمة توصية قائمة" : "تأسيس وتجليس توصية قطاعية جديدة"}
                  </h3>
                  <p className="text-slate-400 text-[10.5px]">
                    يرجى توفير خلاصة مداولات البند ونص التوصية لتقييدها في نظام غرفة مكة
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRecommendation} className="p-6 space-y-4">
                
                {/* Addition methodologies selection requested (توصية مستقلة vs توصية بالتمرير) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-800 block">أسلوب وتصنيف الإضافة والتفعيل:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormAddMethod("توصية مستقلة");
                        const initialEvt = confirmedEvents[0];
                        if (initialEvt) {
                          setFormLinkedEventId(initialEvt.id);
                          setFormEventName(initialEvt.title);
                          setFormCommittee(initialEvt.committeeName || listCommittees[0]);
                          setFormDate(initialEvt.date || new Date().toISOString().substring(0, 10));
                        }
                      }}
                      className={`py-2 px-3 border rounded-xl text-center font-extrabold text-[11px] cursor-pointer transition-all ${
                        formAddMethod === "توصية مستقلة"
                          ? "bg-[#246fff]/5 text-[#246fff] border-[#246fff] shadow-sm font-black"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      توصية مستقلة (مرتبطة بفعالية)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormAddMethod("توصية بالتمرير");
                        setFormLinkedEventId("");
                        setFormEventName("تأصيل بالتمرير المباشر");
                        setFormCommittee(listCommittees[0] || "");
                      }}
                      className={`py-2 px-3 border rounded-xl text-center font-extrabold text-[11px] cursor-pointer transition-all ${
                        formAddMethod === "توصية بالتمرير"
                          ? "bg-amber-500/10 text-amber-900 border-amber-600 shadow-sm font-black"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      توصية بالتمرير (خارج إطار الجلسات)
                    </button>
                  </div>
                </div>

                {/* Conditional Linked meeting select list requested */}
                {formAddMethod === "توصية مستقلة" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-800 block">اختر الفعالية / اللقاء المرجعي المصدر:</label>
                    <select
                      value={formLinkedEventId}
                      onChange={(e) => handleLinkedEventChange(e.target.value)}
                      className="w-full font-bold p-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#246fff]"
                    >
                      <option value="">-- حدد أحد اللقاءات والفعاليات المجدولة في غرفة مكة --</option>
                      {confirmedEvents.map((evt: any) => (
                        <option key={evt.id} value={evt.id}>
                          {evt.title} ({evt.committeeName}) - {evt.date}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Text Title of recommendations */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-800 block">نص التوصية الصريح والمعتمد:</label>
                  <textarea
                    rows={2}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثل: إعادة هيكلة شروط انضمام ريادي الأعمال لورشة التصنيع المتكاملة"
                    className="w-full font-bold px-3 py-2 border border-slate-300 rounded-xl text-right focus:outline-none focus:ring-1 focus:ring-[#246fff]"
                  />
                </div>

                {/* Grid attributes (Committee, assigned personnel, timing, status) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                  <div>
                    <label className="text-[11px] font-black text-slate-800 block mb-0.5">اللجنة القطاعية المعنية:</label>
                    <select
                      value={formCommittee}
                      onChange={(e) => setFormCommittee(e.target.value)}
                      className="w-full font-bold p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      {listCommittees.map((comm, idx) => (
                        <option key={idx} value={comm}>{comm}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-800 block mb-0.5">المسؤول المكلف بالمتابعة والتنسيق:</label>
                    <select
                      value={formAssignedTo}
                      onChange={(e) => setFormAssignedTo(e.target.value)}
                      className="w-full font-bold p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      {listEmployees.map((emp, idx) => (
                        <option key={idx} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-800 block mb-0.5">المهلة الزمنية المتاحة (التنفيذ):</label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="كتابة الأيام مثل: 15 يوم عمل"
                      className="w-full font-bold px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-800 block mb-0.5">حالة التفعيل الحالية:</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full font-bold p-2.5 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="جديدة">جديدة (لم تبدأ)</option>
                      <option value="جاري العمل عليها">جاري العمل عليها (منشطة)</option>
                      <option value="متأخرة">متأخرة (تجاوز المدة)</option>
                      <option value="منجزة">منجزة (محسومة)</option>
                    </select>
                  </div>
                </div>

                {/* Specific features requested checklist: رقم البند، عنوان البند، المداولة */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-[11px] font-black text-[#246fff] block">تفاصيل مداولات وموقع البند المقيد:</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div>
                      <label className="text-[10px] font-black text-slate-500">رقم البند والمحور:</label>
                      <input
                        type="text"
                        value={formItemNumber}
                        onChange={(e) => setFormItemNumber(e.target.value)}
                        placeholder="مثل: البند الثالث"
                        className="w-full font-bold px-3 py-1.5 border border-slate-300 rounded-xl mt-0.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500">عنوان وموضوع البند:</label>
                      <input
                        type="text"
                        value={formItemTitle}
                        onChange={(e) => setFormItemTitle(e.target.value)}
                        placeholder="كتابة البند مثل: مبادرة الاستثمار السياحي بمكة"
                        className="w-full font-bold px-3 py-1.5 border border-slate-300 rounded-xl mt-0.5 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block">وقائع ومداولات وقناعات الجلسة (المناقشة):</label>
                    <textarea
                      rows={2}
                      value={formDiscussion}
                      onChange={(e) => setFormDiscussion(e.target.value)}
                      placeholder="كتابة المناقشة والوقائع باختصار لوسم التفسير الفني واللوجيستي للقرار"
                      className="w-full font-bold px-3 py-2 border border-slate-300 rounded-xl mt-0.5 bg-white"
                    />
                  </div>
                </div>

                {/* Impact assessment */}
                <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black text-amber-900 block">تصنيف كـ "تمكين استراتيجي دولي"؟</span>
                    <span className="text-[9.5px] text-slate-500 block">سيتم تمييز التوصية لمنحها رتب فحص استثنائية وأولوية بالغة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formHasImpact}
                    onChange={(e) => setFormHasImpact(e.target.checked)}
                    className="w-5 h-5 rounded accent-amber-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-800 block">إضافة مذكّرة أو مبررات تعقيبية أولى:</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="ملاحظات توثيقية إضافية لإيضاح أسلوب حصر المتطلبات"
                    className="w-full font-bold px-3 py-2 border border-slate-300 rounded-xl text-right"
                  />
                </div>

                {/* Submissions action bar */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="h-10 px-4 bg-slate-100 font-bold hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer text-[11px]"
                  >
                    إلغاء الأمر
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 bg-[#246fff] hover:bg-[#2064e6] text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer text-[11px]"
                  >
                    حفظ الملف وتعميد القييد
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Referral Stage Transition Modal (سهم الأوامر وخطوات الإحالة) */}
      <AnimatePresence>
        {isReferralModalOpen && referralRec && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-5"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Forward className="w-5 h-5 text-[#246fff]" />
                  <span>تعديل وإحالة مسار المرحلة الإدارية</span>
                </h4>
                <button
                  type="button"
                  onClick={() => { setIsReferralModalOpen(false); setReferralRec(null); }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <p className="font-extrabold text-[#246fff]">التوصية المختارة:</p>
                  <p className="font-bold text-slate-800 leading-normal mt-1">{referralRec.title}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">المرحلة المقيدة حالياً: {referralRec.approvalStage}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">تعديل المسار والرتبة المستهدفة:</label>
                  <select
                    value={referralTargetStage}
                    onChange={(e) => setReferralTargetStage(e.target.value as any)}
                    className="w-full font-bold p-2 border border-slate-300 rounded-xl bg-white text-slate-800"
                  >
                    {STAGES.map((s, idx) => (
                      <option key={idx} value={s.id}>{s.label} ({s.role})</option>
                    ))}
                    <option value="مكتملة">مكتملة ومقفلة (معتمدة للتطوير)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">تدوين توجيه أو ملاحظة الإحالة (إلزامي):</label>
                  <textarea
                    rows={3}
                    value={referralNotesInput}
                    onChange={(e) => setReferralNotesInput(e.target.value)}
                    placeholder="يرجى كتابة ملاحظات مرافقة للإحالة أو توجيهات المراجعة..."
                    className="w-full font-bold px-3 py-2 border border-slate-300 rounded-xl text-right"
                  />
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => { setIsReferralModalOpen(false); setReferralRec(null); }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                  >
                    إلغاء الأمر
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProceedReferral(referralTargetStage, referralNotesInput)}
                    className="flex-1 py-2 bg-[#246fff] text-white hover:bg-slate-800 font-black rounded-lg"
                  >
                    تأكيد وإحالة المظروف
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Simulated smart email dialog (تصدير بالبريد) */}
      <AnimatePresence>
        {isEmailModalOpen && emailRec && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden text-xs"
            >
              <div className="bg-[#246fff] text-white p-5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black flex items-center gap-1.5">
                    <Mail className="w-5 h-5 text-white" />
                    <span>تصدير مظروف التوصية بالبريد الإلكتروني المباشر</span>
                  </h4>
                  <p className="text-[#246fff]/10 text-[10.5px]">
                    صياغة بريدية ذكية ومرحلة لإرسال تفاصيل التوصية للمتابعة والمطابقة
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsEmailModalOpen(false); setEmailRec(null); }}
                  className="p-1 hover:bg-[#246fff]/20 rounded text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {isEmailSentSuccess ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-xl">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <p className="text-emerald-800 font-black text-sm">تم إرسال الملف والبريد للتوصية بنجاح!</p>
                    <p className="text-slate-400 font-bold text-[11px]">تم تسجيل وتدوين حركة التصدير في السجل الأمني للنظام.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block">صندوق البريد المستهدف (المكلف):</label>
                      <input
                        type="text"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        className="w-full font-bold px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block">عنوان الرسالة البريدية:</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full font-bold px-3 py-1.5 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 block font-mono">تفاصيل الرسالة ومخرجات التوصية المقررة:</label>
                      <textarea
                        rows={7}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full font-bold p-3 border border-slate-300 bg-slate-50 rounded-xl font-mono text-[10px] leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => { setIsEmailModalOpen(false); setEmailRec(null); }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                      >
                        إلغاء الأمر
                      </button>
                      <button
                        type="button"
                        onClick={handleSendEmailSimulate}
                        disabled={isEmailSending}
                        className="flex-1 py-2 bg-[#246fff] text-white hover:bg-[#2064e6] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isEmailSending ? (
                          <>
                            <RefreshCw className="w-3 animate-spin" />
                            <span>جاري إرسال المظروف...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>تأكيد الإرسال بالبريد</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm border border-slate-200 shadow-2xl p-5"
            >
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">تأكيد عملية حذف التوصية القطاعية نهائياً</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    تحذير: هذا القرار نهائي ولا يمكن الرجوع عنه، وستحذف كافة السجلات والمستندات المرتبطة به.
                  </p>
                </div>

                <div className="space-y-1 mt-3 text-right">
                  <label className="text-[10px] font-black text-rose-850 block">يرجى كتابة سبب الحذف للمطابقة الأمنية (إلزامي):</label>
                  <input
                    type="text"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="مثل: إلغاء محضر البند، أو وجود دمج للتوصيات"
                    className="w-full text-xs font-bold px-3 py-1.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsDeleteConfirmOpen(false); setRecToDeleteId(null); }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    إلغاء الحذف
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteRecommendation}
                    className="flex-1 py-2 bg-rose-600 text-white hover:bg-rose-700 font-black rounded-lg text-xs"
                  >
                    تأكيد الحذف النهائي
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
