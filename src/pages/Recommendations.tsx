import React, { useState, useEffect, FormEvent } from "react";
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
  ArrowRightLeft
} from "lucide-react";

interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  notes?: string;
}

interface Attachment {
  name: string;
  url: string;
  date: string;
  type: "مرفق التوصية" | "إيميل اعتماد التوصية";
  approvalAuthority?: string; // جهة الاعتماد if email
  drivePath: string; // محلد الحفظ المختار في جوجل درايف
}

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  committeeName: string;
  eventName: string;
  date: string;
  status: "جديدة" | "جاري العمل عليها" | "متأخرة" | "منجزة";
  approvalStage: "أخصائي" | "رئيس قسم" | "مدير الإدارة" | "مساعد الأمين العام" | "المكتب التنفيذي" | "مكتملة";
  assignedTo: string;
  duration: string;
  attachments?: Attachment[];
  auditLogs?: AuditLogEntry[];
  hasImpact?: boolean;
  response?: "موافقة" | "رفض" | "";
  responseNotes?: string;
  implementationAction?: string;
}

const DEFAULT_EMPLOYEES = [
  "شهاب الدين"
];

const STAGES: Array<{ id: RecommendationItem["approvalStage"]; label: string; role: string }> = [
  { id: "أخصائي", label: "أخصائي اللجان", role: "إعداد ومطابقة" },
  { id: "رئيس قسم", label: "رئيس قسم اللجان", role: "مراجعة واعتماد أولى" },
  { id: "مدير الإدارة", label: "مدير الإدارة", role: "اعتماد إدارة اللجان" },
  { id: "مساعد الأمين العام", label: "مساعد الأمين العام", role: "تدقيق وتمكين استراتيجي" },
  { id: "المكتب التنفيذي", label: "المكتب التنفيذي", role: "الاعتماد النهائي والتفعيل" },
  { id: "مكتملة", label: "مكتملة ومفعّلة", role: "توصية سارية ومطبقة" }
];

const DRIVE_FOLDERS = [
  "/الغرفة التجارية/اللجان القطاعية/لجنة التدريب وتوطين الوظائف/التوصيات المعتمدة",
  "/الغرفة التجارية/اللجان القطاعية/لجنة السياحة والترفيه/مكتبة التوصيات الإجرائية",
  "/الغرفة التجارية/اللجان القطاعية/لجنة الاستثمار والتطوير العقاري/الأرشيف الإلكتروني",
  "/الغرفة التجارية/الملفات العامة/قسم اللجان/ملفات الاعتماد والتفعيل السريع",
  "/الغرفة التجارية/الأرشيف الرقمي/توصيات لجان الدورة الحالية"
];

export default function Recommendations() {
  const { data: rawRecs, loading: recsLoading, addDocument: addFirebaseRec, updateDocument: updateFirebaseRec, deleteDocument: deleteFirebaseRec } = useFirestoreCollection<RecommendationItem>("recommendations", []);
  const { data: rawCommittees } = useFirestoreCollection<any>("committees", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("employees", []);

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState({ name: "شهاب الدين", role: "مدير النظام" });

  // View style toggle: "grouped" (تجميع حسب الاجتماع) vs "individual" (سجل عام)
  const [viewType, setViewType] = useState<"grouped" | "individual">("grouped");

  // Filter & Search states
  const [searchWord, setSearchWord] = useState("");
  const [filterCommittee, setFilterCommittee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterImpact, setFilterImpact] = useState("all");

  // Interaction dropdowns & modals
  const [activeCommandMenuId, setActiveCommandMenuId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecommendationItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recToDeleteId, setRecToDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRec, setEmailRec] = useState<RecommendationItem | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailSentSuccess, setIsEmailSentSuccess] = useState(false);

  // Quick Referral Modal state
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralRec, setReferralRec] = useState<RecommendationItem | null>(null);
  const [referralTargetStage, setReferralTargetStage] = useState<RecommendationItem["approvalStage"]>("رئيس قسم");
  const [referralNotesInput, setReferralNotesInput] = useState("");

  // Attachments form state (Google Drive integration style)
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"مرفق التوصية" | "إيميل اعتماد التوصية">("مرفق التوصية");
  const [newFileAuthority, setNewFileAuthority] = useState("الأمين العام");
  const [newFileDrivePath, setNewFileDrivePath] = useState(DRIVE_FOLDERS[0]);
  const [archiveSuccessMessage, setArchiveSuccessMessage] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  // State to notify dynamic summaries copy
  const [isCopied, setIsCopied] = useState(false);

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

  // Seed default data if database is empty
  useEffect(() => {
    if (!recsLoading) {
      if (rawRecs.length === 0) {
        const mock1: Omit<RecommendationItem, "id"> = {
          title: "تفعيل منصة التدريب الافتراضية لأعضاء الجمعية العمومية",
          description: "توفير حقائب تدريبية تفاعلية تدعم تفعيل تقنيات الواقع المعزز في مسارات تنمية مهارات منسوبي الغرفة التجارية وتطبيقات سوق العمل.",
          committeeName: "لجنة التدريب وتوطين الوظائف",
          eventName: "الاجتماع الدوري الثاني للجنة التدريب والمهارات",
          date: "2026-06-11",
          status: "جديدة",
          approvalStage: "أخصائي",
          assignedTo: "شهاب الدين",
          duration: "شهر واحد",
          attachments: [
            {
              name: "خطة التدريب الرقمي المقترحة.pdf",
              url: "https://drive.google.com/open?id=1example_plan",
              date: "2026-06-12",
              type: "مرفق التوصية",
              drivePath: DRIVE_FOLDERS[0]
            }
          ],
          hasImpact: true,
          response: "",
          responseNotes: "",
          implementationAction: "",
          auditLogs: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: "تأسيس التوصية وتوثيقها بالنظام وتوجيهها للمستويات الإدارية",
              user: "نظام حوكمة اللجان"
            }
          ]
        };

        const mock2: Omit<RecommendationItem, "id"> = {
          title: "شراكة ممتدة لتطوير خدمات الضيافة الموسمية الفندقية",
          description: "عقد مذكرة تفاهم متبادلة مع مجموعة رائدة من الفنادق والمطاعم السياحية المؤهلة بغرض تسيير برامج ومبادرات سياحية متقدمة في مواسم الحج والصيف.",
          committeeName: "لجنة السياحة والترفيه",
          eventName: "لقاء ريادة الضيافة الموسمي الثالث",
          date: "2026-06-08",
          status: "جاري العمل عليها",
          approvalStage: "مدير الإدارة",
          assignedTo: "شهاب الدين",
          duration: "أسبوعين",
          attachments: [
            {
              name: "إيميل اعتماد مذكرة التفاهم.pdf",
              url: "https://drive.google.com/open?id=1example_email",
              date: "2026-06-09",
              type: "إيميل اعتماد التوصية",
              approvalAuthority: "مدير إدارة اللجان",
              drivePath: DRIVE_FOLDERS[1]
            }
          ],
          hasImpact: false,
          response: "موافقة",
          responseNotes: "تم تعضيد الدراسات المالية واللوجستية واعتماد الصيغة التنفيذية لمذكرة التفاهم.",
          implementationAction: "جاري تسيير الملف ومخاطبة الشؤون القانونية لصياغة المسودة المبدئية للاتفاقية.",
          auditLogs: [
            {
              timestamp: "2026-06-08 11:30",
              action: "ترحيل التوصية للمسابقة الإجرائية من محضر الاجتماع تلقائياً",
              user: "أخصائي اللجان"
            },
            {
              timestamp: "2026-06-09 14:15",
              action: "مراجعة وإحالة التوصية من رئيس القسم إلى مدير الإدارة",
              user: "رئيس قسم اللجان",
              notes: "معتمدة للاستمرارية الإجرائية والرفع لسعادة المدير."
            }
          ]
        };

        const seedData = async () => {
          await addFirebaseRec(mock1);
          await addFirebaseRec(mock2);
        };
        seedData();
      } else {
        setRecommendations(rawRecs);
        if (!selectedRecId && rawRecs.length > 0) {
          setSelectedRecId(rawRecs[0].id);
        }
      }
    }
  }, [rawRecs, recsLoading]);

  // Click outside to close layout drop menu
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

  const currentRec = recommendations.find(r => r.id === selectedRecId) || null;

  // Filter Logic
  const filteredRecs = recommendations.filter(rec => {
    const word = searchWord.trim().toLowerCase();
    const matchesWord = !word || 
      rec.title.toLowerCase().includes(word) ||
      rec.description.toLowerCase().includes(word) ||
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

  // Unique Events grouped data: Map of "(committee - event)" to RecommendationItem[]
  const groupedEvents: { [key: string]: { committeeName: string; eventName: string; items: RecommendationItem[] } } = {};
  filteredRecs.forEach(rec => {
    const key = `${rec.committeeName} || ${rec.eventName}`;
    if (!groupedEvents[key]) {
      groupedEvents[key] = {
        committeeName: rec.committeeName,
        eventName: rec.eventName,
        items: []
      };
    }
    groupedEvents[key].items.push(rec);
  });

  // Form input variables
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCommittee, setFormCommittee] = useState("");
  const [formEventName, setFormEventName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState<RecommendationItem["status"]>("جديدة");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formHasImpact, setFormHasImpact] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDesc("");
    setFormCommittee(rawCommittees[0]?.name || "لجنة الإعلام والتسويق");
    setFormEventName("الاجتماع الدوري الأول للعام المالي الجديد");
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormStatus("جديدة");
    setFormAssignedTo(dbEmployees[0]?.name || DEFAULT_EMPLOYEES[0]);
    setFormDuration("أسبوعين");
    setFormHasImpact(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: RecommendationItem) => {
    setEditingItem(rec);
    setFormTitle(rec.title);
    setFormDesc(rec.description);
    setFormCommittee(rec.committeeName);
    setFormEventName(rec.eventName);
    setFormDate(rec.date);
    setFormStatus(rec.status);
    setFormAssignedTo(rec.assignedTo);
    setFormDuration(rec.duration);
    setFormHasImpact(!!rec.hasImpact);
    setIsFormOpen(true);
  };

  const handleSaveRecommendation = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim() || !formCommittee || !formAssignedTo) {
      alert("يرجى ملء كافة الخلايا الأساسية لاستكمال الحفظ بنجاح.");
      return;
    }

    if (editingItem) {
      // Update
      const originalLogs = editingItem.auditLogs || [];
      const updatedLogs = [
        ...originalLogs,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: "تعديل محتوى التوصية وتحديث البيانات الأساسية",
          user: currentUser.name
        }
      ];

      const updatedItem: Partial<RecommendationItem> = {
        title: formTitle,
        description: formDesc,
        committeeName: formCommittee,
        eventName: formEventName,
        date: formDate,
        status: formStatus,
        assignedTo: formAssignedTo,
        duration: formDuration,
        hasImpact: formHasImpact,
        auditLogs: updatedLogs
      };

      await updateFirebaseRec(editingItem.id, updatedItem);
    } else {
      // Create new
      const newItem: Omit<RecommendationItem, "id"> = {
        title: formTitle,
        description: formDesc,
        committeeName: formCommittee,
        eventName: formEventName,
        date: formDate,
        status: formStatus,
        approvalStage: "أخصائي",
        assignedTo: formAssignedTo,
        duration: formDuration,
        hasImpact: formHasImpact,
        response: "",
        responseNotes: "",
        implementationAction: "",
        attachments: [],
        auditLogs: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: `تأسيس يدوي للتوصية بواسطة الأخصائي: ${currentUser.name}`,
            user: currentUser.name
          }
        ]
      };

      const newId = await addFirebaseRec(newItem);
      if (newId) setSelectedRecId(newId);
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
      alert("يرجى ذكر سبب حذف التوصية لتأمين السجل الرقابي والإداري.");
      return;
    }

    await deleteFirebaseRec(recToDeleteId);
    setIsDeleteConfirmOpen(false);
    setRecToDeleteId(null);
  };

  // Referral / Stage advancement in layout
  const handleProceedReferral = async (nextStage: RecommendationItem["approvalStage"], notes: string) => {
    const targetRec = referralRec || currentRec;
    if (!targetRec) return;

    let actionDescription = "";
    if (nextStage === "رئيس قسم") {
      actionDescription = `إحالة التوصية إلى رئيس قسم اللجان للتدقيق والمطابقة`;
    } else if (nextStage === "مدير الإدارة") {
      actionDescription = `رفع واعتماد التوصية وإحالتها لسعادة مدير إدارة اللجان القطاعية`;
    } else if (nextStage === "مساعد الأمين العام") {
      actionDescription = `مراجعة إدارة اللجان والرفع للتوجيه والاعتمادات الاستراتيجية بمكتب مساعد الأمين العام`;
    } else if (nextStage === "المكتب التنفيذي") {
      actionDescription = `إحالة التوصية للمكتب التنفيذي للدراسة والاعتماد النهائي المباشر`;
    } else if (nextStage === "مكتملة") {
      actionDescription = `الاعتماد النهائي وإقرار التوصية كحالة مكتملة ومطبق بنجاح`;
    }

    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: actionDescription,
      user: currentUser.name,
      notes: notes.trim() || undefined
    };

    const updatedLogs = [...(targetRec.auditLogs || []), newLog];
    const updates: Partial<RecommendationItem> = {
      approvalStage: nextStage,
      status: nextStage === "مكتملة" ? "منجزة" : "جاري العمل عليها",
      auditLogs: updatedLogs
    };

    await updateFirebaseRec(targetRec.id, updates);
    setIsReferralModalOpen(false);
    setReferralRec(null);
    setReferralNotesInput("");
  };

  const handleOpenQuickReferral = (rec: RecommendationItem) => {
    setReferralRec(rec);
    // Suggest the next logical stage
    const currentIndex = STAGES.findIndex(s => s.id === rec.approvalStage);
    const nextIndex = currentIndex < STAGES.length - 1 ? currentIndex + 1 : currentIndex;
    setReferralTargetStage(STAGES[nextIndex].id);
    setReferralNotesInput("");
    setIsReferralModalOpen(true);
  };

  // Email simulation composer
  const handleOpenEmailComposer = (rec: RecommendationItem) => {
    setEmailRec(rec);
    setEmailTo("khalafshehab@gmail.com, secretary@chamber.org.sa");
    setEmailSubject(`مظروف حوكمة إلكتروني: تنشيط وتطبيق توصية [${rec.title}]`);
    setEmailBody(`السادة منسقو اللجان القطاعية الكرام،

تجدون برفقه السجل والمستندات الخاصة بالتوصية المعتمدة الصادرة عن (${rec.committeeName}) في اللقاء الموسوم بـ [${rec.eventName}]:

• عنوان التوصية: ${rec.title}
• الوصف والمحتوى: ${rec.description}
• الموظف المكلف بالمتابعة والقياس: ${rec.assignedTo}
• تاريخ الاجتماع المحدد: ${rec.date}
• مدة العمل والإطار الزمني: ${rec.duration}

برجاء الاطلاع على التفاصيل واستكمال إجراءات الاعتماد التنفيذي والمطابقة في النظام.

مع التقدير،
مكتب أخصائي شؤون حوكمة اللجان - الغرفة التجارية`);
    setIsEmailModalOpen(true);
    setIsEmailSending(false);
    setIsEmailSentSuccess(false);
  };

  const handleSendEmailSimulate = () => {
    setIsEmailSending(true);
    setTimeout(() => {
      setIsEmailSending(false);
      setIsEmailSentSuccess(true);
      
      // Log this email transaction inside original recommendation's audit logs
      if (emailRec) {
        const originalLogs = emailRec.auditLogs || [];
        const updatedLogs = [
          ...originalLogs,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: `تصدير وإرسال إيميل رسمي لإخطار الأعضاء والمكلَّف ببنود التوصية`,
            user: currentUser.name,
            notes: `تم الإرسال بنجاح إلى: ${emailTo}`
          }
        ];
        updateFirebaseRec(emailRec.id, { auditLogs: updatedLogs });
      }

      setTimeout(() => {
        setIsEmailModalOpen(false);
        setEmailRec(null);
      }, 1500);
    }, 1200);
  };

  // Attachments archiving and manual saving in Google Drive path
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRec) return;
    if (!newFileName.trim()) {
      alert("يرجى تدوين اسم المرفق بشكل واضح.");
      return;
    }

    setIsArchiving(true);
    setArchiveSuccessMessage("");

    // Simulate upload and sync in 1 second
    setTimeout(async () => {
      const targetUrl = newFileUrl.trim() || `https://drive.google.com/drive/folders/rec_${currentRec.id}`;
      const newAttach: Attachment = {
        name: newFileName.trim(),
        url: targetUrl,
        date: new Date().toISOString().substring(0, 10),
        type: newFileType,
        drivePath: newFileDrivePath,
        approvalAuthority: newFileType === "إيميل اعتماد التوصية" ? newFileAuthority : undefined
      };

      const originalAttachments = currentRec.attachments || [];
      const updatedAttachments = [...originalAttachments, newAttach];

      const originalLogs = currentRec.auditLogs || [];
      const updatedLogs = [
        ...originalLogs,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: `إرفاق وأرشفة ملف [${newFileName}] وتخزينه المستندي في المسار المعتمد بجوجل درايف`,
          user: currentUser.name,
          notes: `نوع الملحق: ${newFileType} | مجلد جوجل درايف: ${newFileDrivePath}`
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
    }, 1000);
  };

  const handleUpdateResponse = async (resp: "موافقة" | "رفض", notes: string) => {
    if (!currentRec) return;

    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: `تسجيل قرار تفعيل التوصية من جهة الاختصاص: [${resp === "موافقة" ? "موافقة واعتماد تفعيل" : "رفض وتعديل"}]`,
      user: currentUser.name,
      notes: notes.trim() ? `صيغة الرد: ${notes}` : undefined
    };

    const updatedLogs = [...(currentRec.auditLogs || []), newLog];

    await updateFirebaseRec(currentRec.id, {
      response: resp,
      responseNotes: notes,
      auditLogs: updatedLogs
    });
  };

  const handleSaveImplementationAction = async (actionText: string) => {
    if (!currentRec) return;

    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: `تحديث مسار الإجراء التنفيذي الفعلي المطبق لدعم وحوكمة المخرج`,
      user: currentUser.name,
      notes: actionText.trim() ? `المجرى الفعلي: ${actionText}` : undefined
    };

    const updatedLogs = [...(currentRec.auditLogs || []), newLog];

    await updateFirebaseRec(currentRec.id, {
      implementationAction: actionText,
      auditLogs: updatedLogs
    });
  };

  const getSmartAISummary = (rec: RecommendationItem) => {
    return `بناءً على التداول الإداري والمخرجات الفنية للمحور المطروح في "${rec.eventName}" التابع لـ (${rec.committeeName}) المنعقد بتاريخ [${rec.date}]، فقد تبلورت هذه التوصية الهادفة لـ [${rec.title}] - تفصيلاً بـ: [${rec.description}]، وقد تَقَرّرَ الرفع بها لتسير في مسارات الاعتماد المنهجية تحت إشراف سعادة المكلّف وتوجيهه الأستاذ/ [${rec.assignedTo}] وبمدّة عمل تنفيذية تُقَدّر بـ (${rec.duration}) كَحَدّ أَقْصَى.`;
  };

  const handleCopySmartSummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStatusColorClass = (status: RecommendationItem["status"]) => {
    switch (status) {
      case "جديدة": return "bg-blue-100 text-blue-800 border-blue-200";
      case "جاري العمل عليها": return "bg-amber-100 text-amber-800 border-amber-200";
      case "متأخرة": return "bg-red-100 text-red-800 border-red-200";
      case "منجزة": return "bg-emerald-100 text-emerald-850 border-emerald-200";
    }
  };

  const getStatusDotColor = (status: RecommendationItem["status"]) => {
    switch (status) {
      case "جديدة": return "bg-blue-500 ring-blue-100";
      case "جاري العمل عليها": return "bg-amber-500 ring-amber-100";
      case "متأخرة": return "bg-red-500 ring-red-100";
      case "منجزة": return "bg-emerald-500 ring-emerald-100";
    }
  };

  const getStageBadgeClass = (stage: RecommendationItem["approvalStage"]) => {
    switch (stage) {
      case "أخصائي": return "bg-slate-100 text-slate-700 hover:bg-slate-200";
      case "رئيس قسم": return "bg-purple-100 text-purple-700 border border-purple-200";
      case "مدير الإدارة": return "bg-indigo-100 text-indigo-700 border border-indigo-200";
      case "مساعد الأمين العام": return "bg-pink-100 text-pink-700 border border-pink-200";
      case "المكتب التنفيذي": return "bg-cyan-100 text-cyan-700 border border-cyan-200";
      case "مكتملة": return "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold";
    }
  };

  const listEmployees = dbEmployees.length > 0 ? dbEmployees.map((e: any) => e.name) : DEFAULT_EMPLOYEES;
  const listCommittees = rawCommittees.length > 0 ? rawCommittees.map((c: any) => c.name) : [
    "لجنة الاستثمار والتطوير العقاري", "لجنة التدريب وتوطين الوظائف", "لجنة السياحة والترفيه", "لجنة الصناعة والطاقة", "لجنة شباب الأعمال", "لجنة الإعلام والتسويق"
  ];

  return (
    <div className="space-y-6 pb-12 text-right" dir="rtl">
      
      {/* Premium Sub-Header Title & Stats */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 font-Cairo">
            <div className="bg-brand p-2 rounded-xl text-white shadow-lg shadow-brand/25">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span>إدارة وحوكمة التوصيات القطاعية</span>
          </h2>
          <p className="text-gray-600 text-xs font-bold mt-1">
            متابعة وإقرار التوصيات المرحلة تلقائياً من الفعاليات ومحاضر الاجتماعات واختبار مسارات الحوكمة الإجرائية والاعتمادات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center">
          {/* Quick Stats Widget */}
          <div className="flex gap-2 bg-white/70 p-1 rounded-xl border border-gray-200">
            <div className="px-3 py-1 rounded-lg text-center">
              <span className="text-[9px] font-black text-gray-500 block leading-tight">إجمالي التوصيات</span>
              <span className="text-sm font-black text-gray-900 font-mono">{recommendations.length}</span>
            </div>
            <div className="border-r border-gray-200 my-1"></div>
            <div className="px-3 py-1 rounded-lg text-center">
              <span className="text-[9px] font-black text-blue-600 block leading-tight">جديدة</span>
              <span className="text-sm font-black text-blue-700 font-mono">{recommendations.filter(r => r.status === "جديدة").length}</span>
            </div>
            <div className="border-r border-gray-200 my-1"></div>
            <div className="px-3 py-1 rounded-lg text-center font-Cairo">
              <span className="text-[9px] font-black text-emerald-600 block leading-tight">منجزة ومعتمدة</span>
              <span className="text-sm font-black text-emerald-700 font-mono">{recommendations.filter(r => r.status === "منجزة").length}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-5 bg-brand hover:bg-brand/90 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>تأسيس توصية يدوية</span>
          </button>
        </div>
      </div>

      {recsLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <RefreshCw className="w-10 h-10 text-brand animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-black">جاري تحديث واستيراد التوصيات المرحّلة من قاعدة البيانات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Right Panel: Recommendations List & Grouping Controls (4 Columns) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            
            {/* Search, Filter and Groupings Workspace */}
            <div className="bg-[#f0ecec] border border-gray-300 rounded-2xl p-4 shadow-sm space-y-4">
              
              {/* Header inside Panel */}
              <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                <h3 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-brand" />
                  <span>لوحة التصفية والفهرسة</span>
                </h3>

                {(searchWord || filterCommittee !== "all" || filterStatus !== "all" || filterStage !== "all" || filterImpact !== "all") && (
                  <button
                    onClick={() => {
                      setSearchWord("");
                      setFilterCommittee("all");
                      setFilterStatus("all");
                      setFilterStage("all");
                      setFilterImpact("all");
                    }}
                    className="text-[10px] font-bold text-red-650 hover:underline"
                  >
                    إعادة تصفير الفلاتر
                  </button>
                )}
              </div>

              {/* View toggle (الجمع في بطاقة باسم الاجتماع vs سجل عام للتوصيات) */}
              <div className="bg-white/80 p-0.5 rounded-xl border border-gray-300 flex">
                <button
                  type="button"
                  onClick={() => setViewType("grouped")}
                  className={`flex-1 py-2 text-center font-extrabold text-[11px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    viewType === "grouped" ? "bg-brand text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>تجميع حسب الاجتماع</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewType("individual")}
                  className={`flex-1 py-2 text-center font-extrabold text-[11px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    viewType === "individual" ? "bg-brand text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>سجل عام مستقل</span>
                </button>
              </div>

              {/* Standard text search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="ابحث بالعنوان، اللجنة، المكلّف..."
                  className="w-full text-xs font-bold px-3 py-2 border border-gray-300 rounded-xl bg-white text-right focus:outline-none focus:ring-1 focus:ring-brand placeholder-gray-400 text-gray-850"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              </div>

              {/* Dropdowns */}
              <div className="grid grid-cols-2 gap-2 text-right">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600">اللجنة القطاعية:</label>
                  <select
                    value={filterCommittee}
                    onChange={(e) => setFilterCommittee(e.target.value)}
                    className="w-full text-[10px] font-bold p-1.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">كافة اللجان</option>
                    {listCommittees.map((comm, idx) => (
                      <option key={idx} value={comm}>{comm}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600">المسار الإداري:</label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="w-full text-[10px] font-bold p-1.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">كافة الرتب</option>
                    {STAGES.map((s, idx) => (
                      <option key={idx} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600">الحالة الإدارية:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full text-[10px] font-bold p-1.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">كافة الحالات</option>
                    <option value="جديدة">جديدة (أزرق)</option>
                    <option value="جاري العمل عليها">جاري العمل عليها (أصفر)</option>
                    <option value="متأخرة">متأخرة (أحمر)</option>
                    <option value="منجزة">منجزة (أخضر)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600">الأثر والمستوى:</label>
                  <select
                    value={filterImpact}
                    onChange={(e) => setFilterImpact(e.target.value)}
                    className="w-full text-[10px] font-bold p-1.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">الكل</option>
                    <option value="impact">ذات أثر استراتيجي ✨</option>
                    <option value="normal">عنصر اعتيادي</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List or Group Cards Area */}
            <div className="space-y-4 max-h-[660px] overflow-y-auto pr-1">
              
              {/* RENDER OPTION A: Grouped by Meeting (يتم جمع توصيات كل اجتماع في بطاقة باسم اللجنة والفعالية) */}
              {viewType === "grouped" && (
                Object.keys(groupedEvents).length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-gray-500 font-extrabold text-xs">لا يوجد تجميعات مطابقة لفلاتر البحث الحالية.</p>
                  </div>
                ) : (
                  Object.keys(groupedEvents).map((groupKey, groupIdx) => {
                    const group = groupedEvents[groupKey];
                    return (
                      <div key={groupIdx} className="bg-white border border-gray-250 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all relative">
                        {/* Group Card Header - Meeting / Event info */}
                        <div className="bg-[#f0ecec] border-b border-gray-200 p-4">
                          <span className="text-[10px] font-extrabold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full block w-fit mb-1 leading-tight">
                            {group.committeeName}
                          </span>
                          <h4 className="text-xs font-black text-gray-900 leading-snug flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500 select-none" />
                            <span>ارتباط الفعالية: {group.eventName}</span>
                          </h4>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] text-gray-500 font-bold block bg-white px-2 py-0.5 rounded border border-gray-150 shadow-inner">
                              إجمالي: <strong className="text-gray-800">{group.items.length} توصية</strong>
                            </span>
                            <span className="text-[9px] text-blue-600 font-bold block bg-white px-2 py-0.5 rounded border border-blue-100 shadow-inner">
                              جديدة: <strong className="text-blue-800 font-mono">{group.items.filter(i => i.status === "جديدة").length}</strong>
                            </span>
                          </div>
                        </div>

                        {/* List of recommendations in this meeting */}
                        <div className="p-3 divide-y divide-gray-100 space-y-2">
                          {group.items.map((rec) => {
                            const isSelected = rec.id === selectedRecId;
                            const borderCol = rec.status === "جديدة" ? "border-r-blue-500 border-r-4 animate-pulse-subtle" :
                                              rec.status === "جاري العمل عليها" ? "border-r-amber-500 border-r-4" :
                                              rec.status === "متأخرة" ? "border-r-red-500 border-r-4" :
                                              "border-r-emerald-500 border-r-4";

                            return (
                              <div
                                key={rec.id}
                                onClick={() => setSelectedRecId(rec.id)}
                                className={`p-3 rounded-xl transition-all cursor-pointer relative group/item border ${
                                  isSelected ? "bg-blue-50/50 border-brand ring-1 ring-brand/10 shadow-sm" : "bg-gray-50/50 border-transparent hover:bg-gray-50"
                                } ${borderCol} mt-1`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${getStatusColorClass(rec.status)}`}>
                                      {rec.status}
                                    </span>
                                    <span className="text-[9px] font-black bg-gray-200/80 text-gray-700 px-1.5 py-0.5 rounded">
                                      {rec.approvalStage}
                                    </span>
                                  </div>

                                  {/* Command Arrow Dropdown (سهم الأوامر) */}
                                  <div className="relative command-menu-container">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveCommandMenuId(activeCommandMenuId === rec.id ? null : rec.id);
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-0.5 border border-gray-200/60 shadow-inner bg-white"
                                    >
                                      <span className="text-[10px] font-extrabold text-blue-900 leading-none">خيارات</span>
                                      <ChevronDown className="w-3.5 h-3.5 text-blue-700" />
                                    </button>

                                    {/* Dropped popup list */}
                                    {activeCommandMenuId === rec.id && (
                                      <div className="absolute left-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 text-right">
                                        <div className="p-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveCommandMenuId(null);
                                              handleOpenEdit(rec);
                                            }}
                                            className="w-full text-right px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 rounded-lg cursor-pointer"
                                          >
                                            <Edit2 className="w-3.5 h-3.5 text-brand" />
                                            <span>تعديل التوصية</span>
                                          </button>
                                          
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveCommandMenuId(null);
                                              handleOpenQuickReferral(rec);
                                            }}
                                            className="w-full text-right px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 hover:text-brand flex items-center gap-2 rounded-lg cursor-pointer"
                                          >
                                            <Forward className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>الإحالة والاعتماد</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveCommandMenuId(null);
                                              handleOpenEmailComposer(rec);
                                            }}
                                            className="w-full text-right px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-2 rounded-lg cursor-pointer"
                                          >
                                            <Mail className="w-3.5 h-3.5 text-purple-600" />
                                            <span>إرسال بريد إلكتروني</span>
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
                                            className="w-full text-right px-3 py-2 text-xs font-black text-red-650 hover:bg-red-50 flex items-center gap-2 rounded-lg cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            <span>حذف التوصية</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <h5 className="text-xs font-black text-gray-900 mt-2 hover:text-brand transition-colors leading-relaxed">
                                  {rec.title}
                                </h5>
                                
                                <p className="text-gray-500 text-[11px] font-bold mt-1 line-clamp-1 leading-relaxed">
                                  {rec.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )
              )}

              {/* RENDER OPTION B: General Individual List View */}
              {viewType === "individual" && (
                filteredRecs.length === 0 ? (
                  <div className="bg-white border border-gray-250 rounded-2xl p-8 text-center shadow-sm">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-gray-500 font-extrabold text-xs">لم نجد توصيات قطاعية مسجلة للبحث الحالي.</p>
                  </div>
                ) : (
                  filteredRecs.map((rec) => {
                    const isSelected = rec.id === selectedRecId;
                    const borderCol = rec.status === "جديدة" ? "border-r-blue-500 border-r-4" :
                                      rec.status === "جاري العمل عليها" ? "border-r-amber-500 border-r-4" :
                                      rec.status === "متأخرة" ? "border-r-red-500 border-r-4" :
                                      "border-r-emerald-500 border-r-4";

                    return (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecId(rec.id)}
                        className={`bg-white rounded-xl p-4 border transition-all cursor-pointer relative ${
                          isSelected ? "border-brand ring-1 ring-brand shadow-md" : "border-gray-200 shadow-sm hover:border-gray-300"
                        } ${borderCol}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${getStatusColorClass(rec.status)}`}>
                            {rec.status}
                          </span>

                          {/* Command dropdown trigger */}
                          <div className="relative command-menu-container">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCommandMenuId(activeCommandMenuId === rec.id ? null : rec.id);
                              }}
                              className="p-1 hover:bg-gray-150 rounded-lg text-gray-550 transition-colors cursor-pointer"
                            >
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            </button>
                            {activeCommandMenuId === rec.id && (
                              <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 text-right">
                                <div className="p-1 text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCommandMenuId(null);
                                      handleOpenEdit(rec);
                                    }}
                                    className="w-full text-right px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>تعديل التوصية</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveCommandMenuId(null);
                                      handleOpenQuickReferral(rec);
                                    }}
                                    className="w-full text-right px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
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
                                    className="w-full text-right px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>إرسال بريد إلكتروني</span>
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
                                    className="w-full text-right px-3 py-1.5 text-xs font-black text-red-650 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    <span>حذف التوصية</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-gray-900 mt-2 leading-relaxed">
                          {rec.title}
                        </h4>
                        
                        <p className="text-gray-500 text-xs font-bold mt-1 line-clamp-2 leading-relaxed">
                          {rec.description}
                        </p>

                        <div className="border-t border-gray-150 my-2.5"></div>

                        <div className="flex flex-wrap items-center justify-between text-[10px] text-gray-500 font-black">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            {rec.committeeName}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-gray-800">
                            {rec.approvalStage}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              )}

            </div>
          </div>

          {/* Left Panel: Detailed Recommendation Workspace & Interactive Archiving (7-8 Columns) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AnimatePresence mode="wait">
              {!currentRec ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm space-y-4"
                >
                  <div className="w-20 h-20 bg-blue-50 border border-blue-100 text-brand rounded-full flex items-center justify-center mx-auto shadow-inner shadow-brand/5">
                    <CheckCircle2 className="w-10 h-10 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">مكتب ومعمل تدقيق التوصيات</h3>
                  <p className="text-gray-500 text-xs leading-relaxed max-w-md mx-auto">
                    يرجى تظليل أو اختيار إحدى التوصيات القطاعية من اللائحة الجانبية لتفعيل حوكمتها، إرفاق مستندات الاعتماد، أرشفة الملفات على Drive، واتخاذ قرارات ההתעצמות الإدارية.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={currentRec.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white border border-gray-250 rounded-2xl p-6 shadow-sm space-y-6"
                >
                  
                  {/* Title Bar with badges and specialist manager */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-200 pb-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${getStatusColorClass(currentRec.status)} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(currentRec.status)} ring-2`}></span>
                          <span>المطابقة: {currentRec.status}</span>
                        </span>
                        
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${getStageBadgeClass(currentRec.approvalStage)}`}>
                          طاقة الاعتماد: {currentRec.approvalStage}
                        </span>

                        {currentRec.hasImpact && (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-300" />
                            <span>مبادرة ذات أثر استراتيجي ✨</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-gray-950 mt-1 leading-relaxed">
                        {currentRec.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 font-bold pt-1">
                        <span className="flex items-center gap-1 text-slate-800">
                          <Calendar className="w-4 h-4 text-brand" />
                          <span>الاجتماع: {currentRec.eventName}</span>
                        </span>
                        <span className="text-gray-300 select-none">|</span>
                        <span>بتاريخ: {currentRec.date}</span>
                        <span className="text-gray-300 select-none">|</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-brand" />
                          <span>اللجنة: {currentRec.committeeName}</span>
                        </span>
                      </div>
                    </div>

                    {/* Specialist Badge */}
                    <div className="flex items-center gap-2 shrink-0 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
                      <div className="text-left">
                        <span className="text-[9px] font-black text-gray-400 block leading-none">المشرف المكلّف</span>
                        <span className="text-xs font-black text-gray-800 leading-normal">{currentRec.assignedTo}</span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-sm border border-brand/20 select-none">
                        {currentRec.assignedTo ? currentRec.assignedTo[0] : "م"}
                      </div>
                    </div>
                  </div>

                  {/* 1. Progress Steps Graphic (مسار غاية الاعتماد بالهيكل) */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 relative">
                    <h4 className="text-xs font-black text-gray-950 mb-4 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-brand" />
                      <span>مسار الحوكمة وسلسلة الاعتماد الإداري</span>
                    </h4>

                    {/* Stepper Pipeline */}
                    <div className="relative">
                      {/* Grey Line connecting steps */}
                      <div className="absolute top-4 right-8 left-8 h-0.5 bg-gray-200 z-0 hidden sm:block"></div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-4 relative z-10">
                        {STAGES.map((step, idx) => {
                          const currentIdx = STAGES.findIndex(s => s.id === currentRec.approvalStage);
                          const isCompleted = idx < currentIdx;
                          const isCurrentActive = step.id === currentRec.approvalStage;
                          const isFullyApproved = currentRec.approvalStage === "مكتملة" && step.id === "مكتملة";

                          let iconBox = "bg-white text-gray-400 border-gray-200";
                          let labelText = "text-gray-550 font-bold";
                          if (isCompleted) {
                            iconBox = "bg-brand text-white border-brand";
                            labelText = "text-brand font-extrabold";
                          } else if (isCurrentActive) {
                            if (step.id === "مكتملة") {
                              iconBox = "bg-emerald-600 text-white border-emerald-750 ring-4 ring-emerald-50";
                              labelText = "text-emerald-700 font-extrabold";
                            } else {
                              iconBox = "bg-brand text-white border-brand ring-4 ring-brand/10 animate-pulse-subtle";
                              labelText = "text-gray-900 font-black";
                            }
                          }

                          return (
                            <div key={idx} className="flex flex-col items-center px-1 text-center">
                              <div className={`w-8 h-8 rounded-full border-1.5 flex items-center justify-center transition-all font-black text-xs ${iconBox}`}>
                                {isFullyApproved ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : isCompleted ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-[10.5px] mt-1.5 block ${labelText} leading-tight`}>
                                {step.label}
                              </span>
                              <span className="text-[9px] text-gray-400 block font-bold leading-tight mt-0.5">
                                {step.role}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. Intelligent Smart Summary Generator Section */}
                  <div className="bg-[#f0f9ff]/75 rounded-2xl p-5 border border-blue-200/50 relative overflow-hidden">
                    <div className="absolute -top-4 -left-4 select-none">
                      <Sparkles className="w-16 h-16 text-blue-100 fill-blue-50/50" />
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                      <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5 font-Cairo">
                        <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                        <span>الصيغة الرسمية المعتمدة لحوكمة التوصية (توليد ذكي)</span>
                      </h4>

                      <button
                        type="button"
                        onClick={() => handleCopySmartSummary(getSmartAISummary(currentRec))}
                        className={`text-[10.5px] p-1 px-3 rounded-lg border font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCopied 
                            ? "bg-emerald-600 text-white border-emerald-650" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-xs"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم نسخ النص!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-blue-600" />
                            <span>نسخ الصيغة الحركية</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-gray-800 font-medium leading-relaxed bg-white/95 p-4 rounded-xl border border-blue-150/40 shadow-xs relative z-10">
                      {getSmartAISummary(currentRec)}
                    </p>
                  </div>

                  {/* 3. Attachments Archiving and Google Drive Upload box */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-250/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                        <FolderOpen className="w-4.5 h-4.5 text-brand" />
                        <span>أرشيف المرفقات والاعتمادات الرسمية (سحابي)</span>
                      </h4>
                      <span className="text-[10px] text-brand bg-brand/5 font-extrabold px-2.5 py-0.5 rounded border border-brand/10">أرشفة Google Drive</span>
                    </div>

                    {/* Drive upload simulation form according to guidelines */}
                    <form onSubmit={handleAddAttachment} className="bg-gray-50 rounded-xl p-3 border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      
                      <div className="md:col-span-12">
                        <p className="text-[10px] text-gray-500 font-extrabold block">
                          📂 دليل العمل الإلزامي: يتوجّب أرشفة أي مرفق بمسار مخصّص في Google Drive، وتأكيد مجلد الحفظ المعتمد.
                        </p>
                      </div>

                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[10px] font-black text-gray-700 block">اسم المرفق بالكامل مع اللاحقة:</label>
                        <input
                          type="text"
                          required
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="مثال: قرار وزارة الاقتصاد للضيافة.pdf"
                          className="w-full text-xs font-bold px-3 py-1.5 border border-gray-350 rounded-lg bg-white"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <label className="text-[10px] font-black text-gray-700 block">نوع الملحق الإداري:</label>
                        <select
                          value={newFileType}
                          onChange={(e) => setNewFileType(e.target.value as any)}
                          className="w-full text-xs font-semibold p-1.5 border border-gray-350 rounded-lg bg-white text-gray-800"
                        >
                          <option value="مرفق التوصية">مرفق التوصية (اللائحة/بيان)</option>
                          <option value="إيميل اعتماد التوصية">إيميل اعتماد التوصية (يوضح جهة الاعتماد)</option>
                        </select>
                      </div>

                      {newFileType === "إيميل اعتماد التوصية" && (
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] font-black text-gray-700 block">سلطة وجهة الاعتماد:</label>
                          <input
                            type="text"
                            required
                            value={newFileAuthority}
                            onChange={(e) => setNewFileAuthority(e.target.value)}
                            placeholder="مثال: الأمين العام للغرفة"
                            className="w-full text-xs font-bold px-3 py-1.5 border border-gray-350 rounded-lg bg-white"
                          />
                        </div>
                      )}

                      <div className="md:col-span-8 space-y-1">
                        <label className="text-[10px] font-black text-gray-700 block">تحديد المجلد السحابي المستهدف (مسار الأرشفة):</label>
                        <select
                          value={newFileDrivePath}
                          onChange={(e) => setNewFileDrivePath(e.target.value)}
                          className="w-full text-[10.5px] font-bold p-1.5 border border-gray-350 rounded-lg bg-white text-slate-800 leading-tight"
                        >
                          {DRIVE_FOLDERS.map((folder, idx) => (
                            <option key={idx} value={folder}>{folder}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-4">
                        <button
                          type="submit"
                          disabled={isArchiving}
                          className="w-full h-8 px-4 bg-brand hover:bg-brand/90 disabled:bg-gray-400 text-white font-extrabold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {isArchiving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>جاري الأرشفة...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>نقل وتخزين الملف</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Archive Success Path Notice Modal if and when file is successfully saved */}
                    {archiveSuccessMessage && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-900 text-xs font-bold flex items-start gap-2.5 shadow-inner">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold">تم حفظ المرفق وتخزينه سحابياً بنجاح في Google Drive!</p>
                          <p className="text-[10px] text-emerald-700 mt-1">
                            مجلد الحفظ الرسمي المعتمد: <strong className="font-mono text-emerald-950 underline">{archiveSuccessMessage}</strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Listing existing attachments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {(!currentRec.attachments || currentRec.attachments.length === 0) ? (
                        <div className="md:col-span-2 border border-dashed border-gray-200 rounded-xl p-6 text-center text-xs text-gray-400 font-extrabold">
                          لم يتم تأمين أو ربط ملفات معتمدة لهذه التوصية بعد.
                        </div>
                      ) : (
                        currentRec.attachments.map((file, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-3 flex items-start justify-between hover:border-gray-300 transition-colors">
                            <div className="flex items-start gap-2.5 overflow-hidden">
                              <div className={`p-2 rounded-lg shrink-0 ${file.type === "إيميل اعتماد التوصية" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="overflow-hidden">
                                <h5 className="text-[11px] font-black text-gray-900 truncate leading-snug" title={file.name}>
                                  {file.name}
                                </h5>
                                <p className="text-[10px] text-gray-450 font-bold block pt-0.5">
                                  {file.type} {file.approvalAuthority ? `[باعتماد: ${file.approvalAuthority}]` : ""}
                                </p>
                                <span className="text-[9px] text-slate-400 block truncate mt-1">
                                  الـ Drive: {file.drivePath}
                                </span>
                              </div>
                            </div>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-black text-brand hover:underline shrink-0 flex items-center gap-0.5 pr-2"
                            >
                              <span>استعراض</span>
                              <ChevronLeft className="w-3 h-3" />
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 4. Active implementation action plan by the specialist */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-250">
                    <h4 className="text-xs font-black text-gray-950 mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-4.5 h-4.5 text-brand" />
                      <span>الإجراء التنفيذي والمناورة الحالية المتبعة لتفعيل المخرج</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold pb-2">
                      وثق هنا الإنجازات والخطوات المتبعة على أرض الواقع لسير مخرجات اللجنة من مراسلات ومتابعات.
                    </p>
                    
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        defaultValue={currentRec.implementationAction || ""}
                        placeholder="مثال: الرفع بتفاصيل منصة التدريب للجنة الفنية بوزارة الاقتصاد وصناعة البرمجيات الوطنية، أو الرفع بتفاصيل الحوكمة لإدارة اللجان..."
                        onBlur={(e) => handleSaveImplementationAction(e.target.value)}
                        className="w-full text-xs font-bold p-3 border border-gray-250 rounded-xl bg-gray-50/50 text-right focus:ring-1 focus:ring-brand focus:bg-white text-gray-800 leading-relaxed placeholder-gray-400"
                      />
                      <p className="text-[9px] text-gray-400 font-bold select-none leading-none">
                        💡 يتم حفظ الإجراء وتحديث السجل تلقائياً بمجرد الانتقال لحقل أو زر آخر.
                      </p>
                    </div>
                  </div>

                  {/* 5. Reactions and status decision by general managers */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-gray-300 space-y-4">
                    <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-brand" />
                      <span>قرار وتوجيهات الحوكمة الرسمية (الاعتماد أو الرفض)</span>
                    </h4>

                    {/* Decisions buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateResponse("موافقة", currentRec.responseNotes || "")}
                        className={`flex-1 py-3 px-4 rounded-xl border font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          currentRec.response === "موافقة"
                            ? "bg-emerald-600 border-emerald-700 text-white shadow-sm"
                            : "bg-white hover:bg-emerald-50 text-emerald-800 border-gray-300"
                        }`}
                      >
                        <CheckSquare className="w-4.5 h-4.5" />
                        <span>موافقة على تفعيل التوصية</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateResponse("رفض", currentRec.responseNotes || "")}
                        className={`flex-1 py-3 px-4 rounded-xl border font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          currentRec.response === "رفض"
                            ? "bg-red-650 border-red-700 text-white shadow-sm"
                            : "bg-white hover:bg-red-50 text-red-650 border-gray-300"
                        }`}
                      >
                        <X className="w-4.5 h-4.5" />
                        <span>رفض وتعديل التوصية</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-black text-gray-700 block">شروحات ومبررات القرار الإداري الملحق:</label>
                      <input
                        type="text"
                        value={currentRec.responseNotes || ""}
                        placeholder="اضف مبررات الرفض لتصحيح التوجيه أو تفاصيل القرار الإجرائي..."
                        onChange={(e) => {
                          const val = e.target.value;
                          updateFirebaseRec(currentRec.id, { responseNotes: val });
                        }}
                        className="w-full text-xs font-bold p-2.5 border border-gray-250 rounded-xl bg-white text-right focus:outline-none focus:ring-1 focus:ring-brand text-gray-850 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* 6. Stepper actions and Quick stage progression */}
                  <div className="bg-[#f0f5fa] rounded-2xl p-5 border border-blue-200/50 space-y-3">
                    <h4 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <Forward className="w-4.5 h-4.5 text-brand" />
                      <span>اتخاذ الإحالة الإدارية وتمرير الملف (للأخصائي والمدير)</span>
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 pt-1.5">
                      {STAGES.map((s, idx) => {
                        const isCurrent = currentRec.approvalStage === s.id;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleProceedReferral(s.id, "")}
                            className={`px-3 py-1.5 text-[10.5px] font-black rounded-lg transition-all cursor-pointer border ${
                              isCurrent
                                ? "bg-brand text-white border-brand shadow-sm"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <span>إلى: {s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 7. Audit log trails */}
                  <div className="pt-2">
                    <h4 className="text-xs font-black text-gray-950 mb-3 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand" />
                      <span>سجل تتبع الترحيل والمراجعة التاريخية للحوكمة (Audit History)</span>
                    </h4>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden text-right">
                      {(!currentRec.auditLogs || currentRec.auditLogs.length === 0) ? (
                        <div className="p-4 text-center text-xs text-gray-400 font-bold">
                          لم يتم رصد حركات تاريخية على هذه التوصية بعد.
                        </div>
                      ) : (
                        currentRec.auditLogs.map((log, idx) => (
                          <div key={idx} className="p-3 text-xs flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5 ring-4 ring-brand/10"></div>
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <span className="font-extrabold text-gray-900 leading-tight">
                                  {log.action}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold font-mono">
                                  {log.timestamp}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
                                منَفّذ العملية: <strong className="text-slate-700">{log.user || "النظام"}</strong>
                              </p>
                              {log.notes && (
                                <p className="text-[10.5px] text-gray-600 bg-white border border-gray-150 p-2 rounded-lg mt-1 select-all font-semibold">
                                  💬 {log.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* MODAL 1: Add / Edit Recommendation Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right md:p-6" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-300 shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-[#f0ecec] border-b border-gray-300 px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-brand" />
                  <span>{editingItem ? "تعديل محتوى التوصية المنسقة" : "إضافة وحوكمة توصية يدوية جديدة"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-850 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRecommendation} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-705 block">عنوان التوصية / القرار المقترح بالتحديد:</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: ترقية قنوات البث ومواد النشر الإعلامية للغرفة..."
                    className="w-full text-xs font-black p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand text-gray-850 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-705 block">الوصف والتفصيل والمطولات الملحقة بالتوصية:</label>
                  <textarea
                    rows={3}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="اكتب المعطيات الكاملة، أهداف وبنود التوصية بشكل مفصّل ومكتمل..."
                    className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand text-gray-800 bg-white leading-relaxed text-right"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-705 block">اللجنة والقطاع المعني:</label>
                    <select
                      value={formCommittee}
                      onChange={(e) => setFormCommittee(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand bg-white text-gray-800"
                    >
                      {listCommittees.map((commName, i) => (
                        <option key={i} value={commName}>{commName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-705 block">اسم ورمز اللقاء المصدر:</label>
                    <input
                      type="text"
                      value={formEventName}
                      onChange={(e) => setFormEventName(e.target.value)}
                      placeholder="مثال: لقاء ريادة التوطين الدوري الثالث..."
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand text-gray-850 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-705 block">الموظف المكلّف بالمتابعة والرفع:</label>
                    <select
                      value={formAssignedTo}
                      onChange={(e) => setFormAssignedTo(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand bg-white text-gray-800"
                    >
                      {listEmployees.map((emp, i) => (
                        <option key={i} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-705 block">تاريخ الفعالية واللقاء:</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl bg-white text-gray-805"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-705 block">الحالة الحركية للعمل:</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand bg-white text-gray-800"
                    >
                      <option value="جديدة">جديدة (أزرق)</option>
                      <option value="جاري العمل عليها">جاري العمل عليها (أصفر)</option>
                      <option value="متأخرة">متأخرة (أحمر)</option>
                      <option value="منجزة">منجزة (أخضر)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-705 block">مدة وسقف التنفيذ المخرجة للتوصية:</label>
                    <input
                      type="text"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="مثال: أسبوعين، ثلاثة أسابيع، شهر واحد..."
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand text-gray-85 bg-white text-right"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-blue-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand" />
                      <span>هل هذه التوصية ذات أثر تنموي استراتيجي؟</span>
                    </label>
                    <span className="text-[10px] text-gray-500 block leading-tight">التوصيات الفريدة التي تدعم معايير التميز في الحوكمة وتوجيه الاستحقاقات للغرفة.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formHasImpact}
                    onChange={(e) => setFormHasImpact(e.target.checked)}
                    className="w-5 h-5 accent-brand cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="h-10 px-4 text-xs font-black text-gray-500 hover:text-gray-805 hover:bg-gray-100 border border-gray-300 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 bg-brand hover:bg-brand/90 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    {editingItem ? "حفظ التعديلات" : "إضافة التوصية والجدولة الفورية"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Delete Recommendation with Required Reason Tracker */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-350 w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4"
            >
              <h3 className="text-base font-black text-red-650 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>تأكيد حذف التوصية والقرار الإداري</span>
              </h3>

              <p className="text-xs text-slate-800 font-bold leading-relaxed">
                هل أنت متأكد من رغبتك في إتمام استئصال وحذف هذه التوصية نهائياً من قاعدة البيانات والسجلات؟ لا يمكن التراجع عن هذا الإتلاف بعد اعتماده.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700">الرجاء إبداء سبب الحذف وحفظ السجل التاريخي (إلزامي):</label>
                <input
                  type="text"
                  required
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="مثال: إلغاء القرار من رئيس القسم أو دمج الملفات..."
                  className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-805 bg-white text-right"
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="h-10 px-4 text-xs font-black text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl cursor-pointer"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRecommendation}
                  className="h-10 px-5 bg-red-650 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  نعم، احذف التوصية نهائياً
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Simulated Email Governance Composer */}
      <AnimatePresence>
        {isEmailModalOpen && emailRec && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right md:p-6" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-300 shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#f0ecec] border-b border-gray-300 px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-950 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <span>تصدير وإخطار الكتروني بمظروف الحوكمة والاعتماد للتوصية</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-850 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-gray-600 block">إرسال إلى (صيغة مراسلات المنسقين والمكلَّف):</label>
                    <input
                      type="text"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl bg-slate-50 text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-gray-600 block">الموضوع الرسمي للمظروف الإلكتروني:</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs font-black p-2.5 border border-gray-300 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-gray-600 block">محتوى البريد الإلكتروني (Draft Body):</label>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-gray-300 rounded-xl bg-white leading-relaxed text-right font-mono"
                  />
                </div>

                {isEmailSentSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-805 text-xs font-bold leading-normal text-center shadow-inner">
                    ✨ تم إرسال مظروف حوكمة التوصية بنجاح إلى المكلفين والمنسقين! وجاري تثبيت السجل الإداري للتوصية.
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-[10px] text-gray-400 font-bold select-none text-right block max-w-sm">
                    💼 يرسل مظروف البريد الإلكتروني عبر خوادم الغرفة المعتمدة تلقائياً.
                  </span>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(false)}
                      className="h-10 px-4 text-xs font-black text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-300 rounded-xl cursor-pointer"
                    >
                      إلغاء الأمر
                    </button>
                    <button
                      type="button"
                      onClick={handleSendEmailSimulate}
                      disabled={isEmailSending}
                      className="h-10 px-5 bg-brand hover:bg-brand/90 disabled:bg-gray-400 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      {isEmailSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري الإرسال الإلكتروني...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>إرسال البريد الآن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Interactive Quick Referral and Progress ADVANCEMENT */}
      <AnimatePresence>
        {isReferralModalOpen && referralRec && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-300 w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-4"
            >
              <div className="bg-[#f2f6fa] -mx-6 -mt-6 px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-black text-blue-950 flex items-center gap-2">
                  <ArrowRightLeft className="w-4.5 h-4.5 text-brand" />
                  <span>تسيير الإحالة والاعتماد الإداري للتوصية</span>
                </h3>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-black text-gray-700 block">عنوان التوصية المختارة:</label>
                  <p className="text-xs font-black text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    {referralRec.title}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-black text-gray-700 block">إرسال وإحالة التوصية إلى رتبة:</label>
                  <select
                    value={referralTargetStage}
                    onChange={(e) => setReferralTargetStage(e.target.value as any)}
                    className="w-full text-xs font-bold p-2 border border-gray-350 rounded-xl bg-white text-gray-800"
                  >
                    {STAGES.map((s, idx) => (
                      <option key={idx} value={s.id}>{s.label} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-black text-gray-700 block">ملاحظات مرافقة للإحالة (ستدون في السجل):</label>
                  <textarea
                    rows={2}
                    value={referralNotesInput}
                    onChange={(e) => setReferralNotesInput(e.target.value)}
                    placeholder="اكتب توجيهات المتابعة أو أية مبررات للإحالة لتقييد السجل التاريخي..."
                    className="w-full text-xs font-semibold p-2 border border-gray-350 rounded-xl bg-white text-right"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReferralModalOpen(false);
                      setReferralRec(null);
                    }}
                    className="h-10 px-4 text-xs font-black text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl cursor-pointer"
                  >
                    تراجع
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProceedReferral(referralTargetStage, referralNotesInput)}
                    className="h-10 px-5 bg-brand hover:bg-brand/90 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    تأكيد إحالة الملف
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
