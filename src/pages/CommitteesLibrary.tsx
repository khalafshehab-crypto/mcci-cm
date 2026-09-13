import jsPDF from "jspdf";
import { toJpeg, toPng } from 'html-to-image';
import { analyzeDocumentClient } from "../lib/geminiClient";
import { showGlobalToast } from "../lib/toastUtils";
import { createGoogleDoc, resolveDrivePath, uploadFileToDriveByPath, moveDriveFile, uploadBinaryFileToDrive } from "../lib/googleApi";
import { logoBase64 } from "../lib/logoBase64";
import React, { useState, useEffect, FormEvent, useRef } from "react";
import {
  Paperclip,
  Printer,
  ChevronRight,
  Clock,
  Check,
  CheckSquare,
  AlertTriangle,
  ChevronLeft,
  Presentation,
  Download,
  Edit2,
  Wand2,
  MessageSquare,
  ExternalLink,
  Calendar,
  Video,
  Trash2,
  Reply,
  FileJson,
  Library as LibraryIcon,
  ClipboardList,
  X,
  LayoutGrid,
  MoreHorizontal,
  Upload,
  Mail,
  Plus,
  Send,
  BookOpen,
  Share2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
  List,
  FileSpreadsheet,
  Sparkles,
  FileText,
  Loader2, Info,
  CheckCircle2,
  Search,
  Copy, Edit
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import GoogleWorkspaceCenter from "../components/GoogleWorkspaceCenter";
import { AttachmentInput } from "../components/AttachmentInput";

export interface TemplateItem {
  committeeUrls?: Record<string, string>;
  circularDetails?: any;
  attachments?: any[];
  targetCommittees?: string[];
  targetCommitteesList?: any[];
  id: string;
  title: string;
  description: string;
  templateText?: string;
  type: "مستندات" | "عروض تقديمية" | "جداول بيانات" | "بريد إلكتروني" | "أخرى" | "خطاب ذكي" | "تعميم" | string;
  creator: string;
  cloudUrl: string;
  downloadUrl: string;
  lastUpdated: string;
  isFavorite: boolean;
  category?: string;
  committeeName?: string;
}



export default function CommitteesLibrary() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [committees, setCommittees] = useState<any[]>([]);
  const [showWorkspaceCenter, setShowWorkspaceCenter] = useState(false);

  useEffect(() => {
    const qComms = query(collection(db, "committees"));
    const unsubscribeComms = onSnapshot(qComms, (snapshot) => {
      const dbComms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommittees(dbComms);
    });
    return () => unsubscribeComms();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "templates"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTemplates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TemplateItem[];
      setTemplates(dbTemplates);
      setIsLoadingTemplates(false);
    });
    const qEmp = query(collection(db, "employees"));
    const unsubEmp = onSnapshot(qEmp, (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubscribe(); unsubEmp(); };
  }, []);

  const fallbackTemplates: TemplateItem[] = [
    {
      id: "doc-1",
      title: "قالب الرد الرسمي على المخاطبات الدورية",
      description: "صيغة معتمدة من الإدارة للرد على المطالبات والتوصيات من اللجان.",
      type: "مستندات",
      creator: "مدير النظام",
      cloudUrl: "https://docs.google.com/document/d/example",
      downloadUrl: "#",
      lastUpdated: "2026-06-12",
      isFavorite: true,
    },
    {
      id: "pres-1",
      title: "عرض إنجازات الربع الأول للجنة القطاعية",
      description: "قالب عرض تقديمي يتضمن تصاميم إحصائية للمؤشرات والمعايير المتفق عليها.",
      type: "عروض تقديمية",
      creator: "مدير النظام",
      cloudUrl: "https://docs.google.com/presentation/d/example",
      downloadUrl: "#",
      lastUpdated: "2026-06-10",
      isFavorite: false,
    },
    {
      id: "sheet-1",
      title: "سجل حصر مهام وتوصيات اللجان",
      description: "جداول لتتبع أعمال الأخصائيين متصلة بمنظومة مؤشرات الأداء الأساسية.",
      type: "جداول بيانات",
      creator: "مدير النظام",
      cloudUrl: "https://docs.google.com/spreadsheets/d/example",
      downloadUrl: "#",
      lastUpdated: "2026-06-05",
      isFavorite: true,
    },
    {
      id: "email-1",
      title: "إشعار دعوة أعضاء اللجنة للاجتماع الأول",
      description: "نص البريد السريع لإشعار الأعضاء باللقاء الأول، يتضمن جدول الأعمال.",
      type: "بريد إلكتروني",
      creator: "مدير النظام",
      cloudUrl: "https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1",
      downloadUrl: "#",
      lastUpdated: "2026-06-14",
      isFavorite: false,
    },
  ];

  const [deletedTemplateIds, setDeletedTemplateIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("app_deleted_templates");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const displayedTemplates = (
    templates.length > 0
      ? templates
      : isLoadingTemplates
        ? []
        : fallbackTemplates
  ).filter((t) => !deletedTemplateIds.includes(t.id)).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.lastUpdated || 0).getTime();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.lastUpdated || 0).getTime();
    return timeB - timeA;
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredTemplates = displayedTemplates.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (
      searchQuery &&
      !(t.title || "").includes(searchQuery) &&
      !(t.description || "").includes(searchQuery) &&
      !(t.creator || "").includes(searchQuery) &&
      !(t.type || "").includes(searchQuery) &&
      !(t.category || "").includes(searchQuery) &&
      !(t.committeeName || "").includes(searchQuery)
    )
      return false;
    return true;
  });

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [isAIOpen, setIsAIOpen] = useState(false);

  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [analyzedTasks, setAnalyzedTasks] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [analyzeUploadedFile, setAnalyzeUploadedFile] = useState<File | null>(null);
  const [analyzeUploadedDataUrl, setAnalyzeUploadedDataUrl] = useState<string>("");
    
  const [aiTemplate, setAiTemplate] = useState<TemplateItem | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleOpenAI = (t: TemplateItem) => {
    setAiTemplate(t);
    setAiResult("");
    setAiPrompt("");
    setIsAIOpen(true);
  };

  const [templateToShare, setTemplateToShare] = useState<TemplateItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTemplateText, setFormTemplateText] = useState("");
  const [formType, setFormType] = useState<TemplateItem["type"]>("مستندات");
  const [formCloudUrl, setFormCloudUrl] = useState("");
  const [formIsSaving, setFormIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");


  const [isAnalyzeTasksOpen, setIsAnalyzeTasksOpen] = useState(false);
  const [analyzeTarget, setAnalyzeTarget] = useState<TemplateItem | null>(null);
    
  const handleAnalyzeTasks = async (t: TemplateItem) => {
      setAnalyzeTarget(t);
      setAnalyzedTasks([]);
      setIsAnalyzeTasksOpen(true);
      setIsAnalyzing(true);
      
      try {
          let textToAnalyze = t.templateText || "";
          if (!textToAnalyze && t.downloadUrl && t.downloadUrl.startsWith('data:')) {
              const mime = t.downloadUrl.split(';')[0].split(':')[1];
              const b64 = t.downloadUrl.split(',')[1];
              textToAnalyze = await analyzeDocumentClient("استخرج النص الكامل من هذا المستند.", b64, mime);
          }
          
          if (!textToAnalyze) {
              showGlobalToast("لم يتم العثور على نص لتحليله في هذا المستند.", "error");
              setIsAnalyzing(false);
              return;
          }

          const prompt = "اقرأ النص التالي المستخرج من مستند رسمي (خطاب أو قرار أو تعميم)، واستخرج منه أي مهام (Tasks) أو توجيهات أو قرارات تتطلب تنفيذاً. أرجع النتيجة على شكل مصفوفة JSON تحتوي على كائنات بالصيغة التالية: [{\"title\": \"عنوان المهمة\", \"description\": \"وصف تفصيلي\", \"deadline\": \"تاريخ أو مدة التنفيذ إن وجدت\"}] (وإذا لم يكن هناك توجيهات أرجع []). لا ترجع أي نص آخر سوى الـ JSON.\n\nالنص:\n" + textToAnalyze;
          
          const result = await analyzeDocumentClient(prompt, null, null);
          let parsed = [];
          try {
              const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
              parsed = JSON.parse(clean);
          } catch(e) {
              console.error(e);
              parsed = [];
          }
          
          setAnalyzedTasks(parsed);
      } catch(e) {
          console.error(e);
          showGlobalToast("حدث خطأ أثناء تحليل المستند.", "error");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleCreateTaskFromAnalysis = async (taskObj: any) => {
      try {
          await addDoc(collection(db, "tasks"), {
              title: taskObj.title,
              description: taskObj.description + "\n\nالمرجع: " + (analyzeTarget?.title || ""),
              assignedTo: "غير محدد",
              priority: "عادية",
              dueDate: new Date().toISOString().split('T')[0],
              status: "جديدة",
              timestamp: new Date().toISOString()
          });
          
          await addDoc(collection(db, "system_logs"), {
              type: "إضافة مهمة",
              details: `تم توليد مهمة من مستند المرجعي [${analyzeTarget?.title}] عبر الذكاء الاصطناعي.`,
              status: "ناجحة",
              timestamp: new Date().toISOString(),
          });
          
          showGlobalToast("تم إنشاء المهمة بنجاح وإحالتها لسجل المهام.", "success");
          setAnalyzedTasks(prev => prev.filter(p => p !== taskObj));
      } catch(e) {
          showGlobalToast("حدث خطأ أثناء إنشاء المهمة", "error");
      }
  };

  // Share form state
  const [shareEmail, setShareEmail] = useState("");

  // Import / Export advanced state additions
  const [modalTab, setModalTab] = useState<"import" | "export">("import");
  const [importSource, setImportSource] = useState<"drive" | "computer">("drive");
  const [uploadedFile, setUploadedFile] = useState<File | string | null>(null);
  
  // Smart Letter State
  const [isSmartLetterOpen, setIsSmartLetterOpen] = useState(false);
  const [smartLetterMode, setSmartLetterMode] = useState<"create_new" | "create_reply" | "fill">("create_new");

  // AI Generator States
  const [isAIGenOpen, setIsAIGenOpen] = useState(false);
  const [editAIGenTargetId, setEditAIGenTargetId] = useState<string | null>(null);
  const [aiGenStep, setAiGenStep] = useState(1);
  const [workspaceService, setWorkspaceService] = useState("docs");
  const [aiGenCommittees, setAiGenCommittees] = useState<string[]>([]);
  const [circularViaEmail, setCircularViaEmail] = useState(false);
  const [circularViaWhatsApp, setCircularViaWhatsApp] = useState(false);
  const [circularMainFile, setCircularMainFile] = useState<File | string | null>(null);
  const [circularAtt1, setCircularAtt1] = useState<File | string | null>(null);
  const [circularAtt2, setCircularAtt2] = useState<File | string | null>(null);
  const [circularAtt3, setCircularAtt3] = useState<File | string | null>(null);
  
  // Circular Variables (مطابقة لمعايير الهوية الرسمية)
  const [circularIncomingFrom, setCircularIncomingFrom] = useState("");
  const [circularIncomingNumber, setCircularIncomingNumber] = useState("");
  const [circularIncomingDate, setCircularIncomingDate] = useState("");
  const [circularSubject, setCircularSubject] = useState("");
  const [circularContactName, setCircularContactName] = useState("");
  const [circularContactPhone, setCircularContactPhone] = useState("");
  const [circularContactEmail, setCircularContactEmail] = useState("");
  const [circularDistribution, setCircularDistribution] = useState("كلاهما");
  const [circularAttachmentName, setCircularAttachmentName] = useState("");
  
  const [circularOutNumber, setCircularOutNumber] = useState("");
  const [circularOutDate, setCircularOutDate] = useState("");
  const [circularTypes, setCircularTypes] = useState<string[]>([]);
  const circularPrintRef = useRef<HTMLDivElement>(null);

  const getAttachmentUrl = (att: File | string | null): string => {
    if (!att) return '#';
    if (typeof att === 'string') return att;
    try {
      return URL.createObjectURL(att);
    } catch (e) {
      return '#';
    }
  };
  
  const getPdfBlob = async (attachmentDriveUrls?: Record<string, string>): Promise<Blob | null> => {
    if (!circularPrintRef.current) return null;
    try {
      const el = circularPrintRef.current;
      const dataUrl = await toJpeg(el, { 
        cacheBust: true, 
        backgroundColor: '#FFFFFF', 
        pixelRatio: 1.5,
        quality: 0.85,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (el.offsetHeight * pdfWidth) / el.offsetWidth;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const yOffset = pdfHeight < pageHeight ? (pageHeight - pdfHeight) / 2 : 0;
      
      pdf.addImage(dataUrl, 'JPEG', 0, yOffset, pdfWidth, pdfHeight);

      const links = el.querySelectorAll('[data-pdf-link]');
      const containerRect = el.getBoundingClientRect();
      
      links.forEach((link) => {
        let url = link.getAttribute('data-pdf-link');
        const attId = link.getAttribute('data-pdf-link-id');
        if (attId && attachmentDriveUrls && attachmentDriveUrls[attId]) {
            url = attachmentDriveUrls[attId];
        }
        if (!url || url === '#') return;
        
        const rect = link.getBoundingClientRect();
        
        const rx = (rect.left - containerRect.left) / containerRect.width;
        const ry = (rect.top - containerRect.top) / containerRect.height;
        const rw = rect.width / containerRect.width;
        const rh = rect.height / containerRect.height;
        
        const pdfX = rx * pdfWidth;
        const pdfY = yOffset + (ry * pdfHeight);
        const pdfW = rw * pdfWidth;
        const pdfH = rh * pdfHeight;
        
        pdf.link(pdfX, pdfY, pdfW, pdfH, { url });
      });

      return pdf.output('blob');
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    showGlobalToast("جاري تحضير ملف PDF عالي الجودة...", "loading");
    const blob = await getPdfBlob();
    if (blob) {
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `تعميم_${circularOutNumber.replace(/[\\/\\]/g, '-')}.pdf`;
       link.click();
       URL.revokeObjectURL(url);
       showGlobalToast("تم تحميل التعميم بصيغة PDF بنجاح", "success");
    } else {
       showGlobalToast("حدث خطأ أثناء التصدير", "error");
    }
  };

  const [aiGenRecipientName, setAiGenRecipientName] = useState("");
  const [aiGenRecipientPosition, setAiGenRecipientPosition] = useState("");
  const [aiGenSubject, setAiGenSubject] = useState("");
  const [aiGenDetails, setAiGenDetails] = useState("");
  const [aiGenContact, setAiGenContact] = useState("");
  const [aiGenSignatory, setAiGenSignatory] = useState("");
  const [aiGenGeneratedText, setAiGenGeneratedText] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [aiGenMode, setAiGenMode] = useState<"new" | "reply">("new");
  const [aiGenTemplateType, setAiGenTemplateType] = useState("مستندات (Google Docs)");
  const [aiGenPreamble, setAiGenPreamble] = useState("");
  const [aiGenReplyContent, setAiGenReplyContent] = useState("");
  const [aiGenReplyFile, setAiGenReplyFile] = useState<File | string | null>(null);
  const [isAIGenGenerating, setIsAIGenGenerating] = useState(false);
  const [isSavingAIGen, setIsSavingAIGen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{id: string, name: string, status: 'pending' | 'syncing' | 'completed' | 'error'}[]>([]);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);

  const openGenerateWizard = () => {
    setIsTemplateMenuOpen(false);
    setAiGenStep(1);
    setWorkspaceService("docs");
    setAiGenCommittees([]);
    setCircularViaEmail(false);
    setCircularViaWhatsApp(false);
    setCircularMainFile(null);
    setCircularAtt1(null);
    setCircularAtt2(null);
    setCircularAtt3(null);
    setCircularIncomingFrom("");
    setCircularIncomingNumber("");
    setCircularIncomingDate("");
    setCircularSubject("");
    setCircularContactName("");
    setCircularContactPhone("");
    setCircularContactEmail("");
    setCircularAttachmentName("");
    setAiGenTemplateType("مستندات (Google Docs)");
    setAiGenMode("new");
    setAiGenRecipientName("");
    setAiGenRecipientPosition("");
    setAiGenPreamble("");
    setAiGenSubject("");
    setAiGenDetails("");
    setAiGenContact("");
    setAiGenSignatory("");
    setAiGenReplyContent("");
    setAiGenReplyFile(null);
    setAiGenGeneratedText("");
    setIsAIGenOpen(true);
  };

  const handleGenerateNewLetter = async () => {
    setIsAIGenGenerating(true);
    try {
      const contactEmp = employees.find(e => e.id === aiGenContact);
      const signatoryEmp = employees.find(e => e.id === aiGenSignatory);
      
      let replyFileBase64 = undefined;
      let replyFileMimeType = undefined;
      
      if (aiGenMode === "reply" && aiGenReplyFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(aiGenReplyFile);
        replyFileBase64 = await base64Promise;
        replyFileMimeType = aiGenReplyFile.type || "application/pdf";
      } else if (workspaceService === "circular" && circularMainFile && typeof circularMainFile === 'object') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        });
        reader.readAsDataURL(circularMainFile as File);
        replyFileBase64 = await base64Promise;
        replyFileMimeType = circularMainFile.type || "application/pdf";
      }

      const contactInfo = contactEmp ? `${contactEmp.jobTitle ? contactEmp.jobTitle + ' / ' : ''}${contactEmp.name} (جوال: ${contactEmp.phone || ''}, بريد: ${contactEmp.email || ''})` : aiGenContact;
      const signatoryInfo = signatoryEmp ? `${signatoryEmp.name} (${signatoryEmp.jobTitle})` : aiGenSignatory;
      const commName = aiGenCommittees.map(id => committees.find(c => String(c.id) === id)?.name || id).join("، ");

      let systemPrompt = "";

      if (workspaceService === "circular") {
        systemPrompt = `أنت خبير أتمتة التعاميم والقرارات الإدارية بغرفة مكة المكرمة.
المطلوب قراءة المعاملة أو الخطاب المرفق (والذي قد يحتوي على ملصق/استيكر وارد الخاص بغرفة مكة المكرمة) واستخراج البيانات وتنسيق بطاقة التعميم الرسمية بدقة تامة.

تعليمات هامة:
1. استبدل القيم المطلوبة بالبيانات الحقيقية المستخرجة من المرفق.
2. هناك نوعان من الأرقام والتواريخ يجب استخراجها:
   - بيانات ملصق/استيكر "الوارد" الخاص بغرفة مكة (الرقم غالباً يبدأ بـ ACS أو رقم تسلسلي).
   - بيانات الخطاب الأساسي نفسه (رقم الخطاب وتاريخه المكتوب في خطاب الجهة المرسلة).
3. لا تقم بكتابة أي أقواس مربعة [] أو نجوم ** في النتيجة النهائية أبداً.

يرجى إخراج النتيجة بالصيغة المحددة التالية بالضبط سطراً بسطر:
التعميم وارد من: اسم الجهة الوارد منها
رقم خطاب الجهة: رقم الخطاب الأساسي المكتوب في خطاب الجهة المرسلة
تاريخ خطاب الجهة: تاريخ الخطاب الأساسي للجهة المرسلة
رقم ملصق الغرفة: رقم الاستيكر/الملصق المضاف من الغرفة 
تاريخ ملصق الغرفة: تاريخ الاستيكر/الملصق المضاف من الغرفة
الموضوع: موضوع التعميم الرئيسي بصياغة رسمية واضحة ومباشرة
مسؤول التواصل: اسم مسؤول التواصل ومسماه الوظيفي تماماً كما ورد في الخطاب (وإن لم يوجد اتركه فارغاً)
هاتف التواصل: رقم الجوال إن وجد (وإن لم يوجد اتركه فارغاً)
بريد التواصل: البريد الإلكتروني إن وجد (وإن لم يوجد اتركه فارغاً)
اسم المرفق: اسم مقترح للمرفق بناءً على الجهة المرسلة 
نوع التعميم: استخرج أو استنتج نوع/أهمية التعميم من الكلمات التالية إذا وجدت (عادي، هام، عاجل، سري). يمكن اختيار أكثر من واحد، افصل بينها بفاصلة. إذا لم يُذكر شيء اعتبره (عادي).
عرض التعميم:
نص التعميم التوجيهي أو ملخص فحوى التعميم الموجه للجان`;
      } else if (aiGenMode === "new") {
        systemPrompt = `أنت خبير صياغة خطابات رسمية سعودية في الغرفة التجارية (غرفة مكة المكرمة).
يرجى صياغة خطاب رسمي احترافي بناءً على المعطيات التالية:
المرسل إليه: ${aiGenRecipientPosition ? aiGenRecipientPosition + ' / ' : ''}${aiGenRecipientName}
الديباجة: ${aiGenPreamble || 'سلمه الله'}
موضوع الخطاب: ${aiGenSubject}
التفاصيل والنقاط المطلوبة في الخطاب: ${aiGenDetails}
لجنة: ${commName}
جهة التوقيع: ${signatoryInfo}
معلومات التواصل: ${contactInfo || 'لا يوجد'}`;
      } else {
        systemPrompt = `أنت خبير صياغة خطابات رسمية سعودية في الغرفة التجارية (غرفة مكة المكرمة).
المطلوب صياغة "خطاب رد رسمي" احترافي على معاملة / خطاب وارد إلينا.
${replyFileBase64 ? 'تم إرفاق ملف المعاملة الواردة، يرجى استخراج الجهة والموضوع وصياغة الرد.' : `نص المعاملة الواردة:\n${aiGenReplyContent}`}
التوجيهات ونقاط الرد المطلوبة: ${aiPrompt}
الجهة المصدرة للرد: ${commName}
جهة التوقيع: ${signatoryInfo}`;
      }

      const response = await fetch((window.location.hostname.includes("vercel.app") ? "https://ais-pre-fsjjcsf7evn4v2avd7xc54-774050524447.europe-west2.run.app/api/" : "/api/") + "gemini/generate-new-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userApiKey: localStorage.getItem('BYOK_GEMINI_API_KEY') || undefined, mode: aiGenMode,
          prompt: systemPrompt,
          replyFileBase64,
          replyFileMimeType,
          committeeName: commName,
          workspaceService,
          recipientName: aiGenRecipientName,
          recipientPosition: aiGenRecipientPosition,
          subject: aiGenSubject,
          details: aiGenDetails,
          replyContent: aiGenReplyContent,
          contact: contactInfo,
          signatory: signatoryInfo
        })
      });

      if (response.ok) {
        const data = (await response.text().then(t => t ? JSON.parse(t) : {}));
        const text = data.result || "";
        setAiGenGeneratedText(text);
        
        if (workspaceService === "circular") {
          const fromMatch = text.match(/التعميم وارد من:\s*(.*)/);
          const inNumMatch = text.match(/رقم خطاب الجهة:\s*(.*)/);
          const inDateMatch = text.match(/تاريخ خطاب الجهة:\s*(.*)/);
          const stickerNumMatch = text.match(/رقم ملصق الغرفة:\s*(.*)/);
          const stickerDateMatch = text.match(/تاريخ ملصق الغرفة:\s*(.*)/);
          const subMatch = text.match(/الموضوع:\s*(.*)/);
          const contactMatch = text.match(/مسؤول التواصل:\s*(.*)/);
          const phoneMatch = text.match(/هاتف التواصل:\s*(.*)/);
          const emailMatch = text.match(/بريد التواصل:\s*(.*)/);
          const attMatch = text.match(/اسم المرفق:\s*(.*)/);
          const typeMatch = text.match(/نوع التعميم:\s*(.*)/);
          const textMatch = text.match(/عرض التعميم:\s*([\s\S]*)/);
          
          if (fromMatch && fromMatch[1]) setCircularIncomingFrom(fromMatch[1].replace(/[*\[\]]/g, '').trim());
          if (inNumMatch && inNumMatch[1]) {
            setCircularIncomingNumber(inNumMatch[1].replace(/[*\[\]]/g, '').trim());
          }
          if (inDateMatch && inDateMatch[1]) {
            setCircularIncomingDate(inDateMatch[1].replace(/[*\[\]]/g, '').trim());
          }
          if (stickerNumMatch && stickerNumMatch[1]) {
            setCircularOutNumber(stickerNumMatch[1].replace(/[*\[\]]/g, '').trim());
          }
          if (stickerDateMatch && stickerDateMatch[1]) {
            setCircularOutDate(stickerDateMatch[1].replace(/[*\[\]]/g, '').trim());
          }
          
          if (subMatch && subMatch[1]) setCircularSubject(subMatch[1].replace(/[*\[\]]/g, '').trim());
          if (contactMatch && contactMatch[1]) setCircularContactName(contactMatch[1].replace(/[*\[\]]/g, '').trim());
          if (phoneMatch && phoneMatch[1]) setCircularContactPhone(phoneMatch[1].replace(/[*\[\]]/g, '').trim());
          if (emailMatch && emailMatch[1]) setCircularContactEmail(emailMatch[1].replace(/[*\[\]]/g, '').trim());
          if (attMatch && attMatch[1]) setCircularAttachmentName(attMatch[1].replace(/[*\[\]]/g, '').trim());
          if (textMatch && textMatch[1]) setAiGenGeneratedText(textMatch[1].replace(/[*\[\]]/g, '').trim());
        }
        setAiGenStep(3);
      } else {
        const errData = await response.text().then(t => t ? JSON.parse(t) : null).catch(() => null);
        showGlobalToast("عذراً، الخادم يواجه ضغطاً حالياً. الرجاء المحاولة مرة أخرى.\n" + (errData?.error || ""), "error");
      }
    } catch (e) {
      console.error(e);
      showGlobalToast("حدث خطأ أثناء الاتصال بالخادم. الرجاء التأكد من اتصالك بالإنترنت والمحاولة مجدداً.", "error");
    } finally {
      setIsAIGenGenerating(false);
    }
  };

  const saveAIGeneratedLetter = async () => {
    if (isSavingAIGen) return;
    setIsSavingAIGen(true);
    try {
      const stored = localStorage.getItem("current_user");
      let currentUser = null;
      if (stored) currentUser = JSON.parse(stored);
      
      const creatorName = currentUser ? currentUser.name : "الأخصائي";
      const targetCommittees = committees.filter(c => aiGenCommittees.includes(String(c.id)));
      if (targetCommittees.length === 0) {
        alert("لم يتم العثور على لجان للحفظ فيها.");
        setIsSavingAIGen(false);
        return;
      }
      setUploadProgress(targetCommittees.map(c => ({ id: String(c.id), name: c.name, status: 'pending' })));
      setShowUploadOverlay(true);
      
      const isCircular = workspaceService === "circular";
      const finalType = isCircular ? "تعميم" : aiGenTemplateType.replace(/\s*\(.*\)/, "").trim();
      const subjectName = aiGenSubject || circularSubject || "تعميم جديد";
      
      const uploadToFolder = async (f: File, parent: string) => {
                  const b64 = await new Promise<string>((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = () => res((reader.result as string).split(',')[1]);
                    reader.onerror = rej;
                    reader.readAsDataURL(f);
                  });
                  const uploaded = await uploadBinaryFileToDrive(f.name, b64, f.type, parent);
                  return uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
               };

      let pdfBlob: Blob | null = null;
      let pdfGenerated = false;
      const committeeUrls: any[] = [];
      let lastCloudUrl = "#";
      let lastTemplateText = "";
      
      for (let i = 0; i < targetCommittees.length; i++) {
        const committee = targetCommittees[i];
        const nextCommitteeName = targetCommittees[i + 1]?.name;
        let progressMsg = `جاري مزامنة الملفات وأرشفتها في جوجل درايف... جاري حالياً أرشفة الملفات في ${committee.name}`;
        if (nextCommitteeName) progressMsg += ` والتالي أرشفة الملفات في ${nextCommitteeName}`;
        // showGlobalToast(progressMsg, "loading", 10000); // UI overlay takes over
        setUploadProgress(prev => prev.map(p => p.id === String(committee.id) ? { ...p, status: 'syncing' } : p));
        const committeeName = committee.name;
        
        let finalDocumentText = aiGenGeneratedText;
        if (isCircular) {
            const circularBody = aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText;
            finalDocumentText = `تعميم إداري\nاللجنة: ${committeeName}\nرقم التعميم: ${circularOutNumber}\nالتاريخ: ${circularOutDate}\nالوارد من: ${circularIncomingFrom || "—"}\nبرقم: ${circularIncomingNumber || "—"} وتاريخ: ${circularIncomingDate || "—"}\nالموضوع: ${circularSubject || "—"}\n\n${circularBody}\n\nللتواصل: ${circularContactName || "—"}\nجوال: ${circularContactPhone || "—"}\nبريد: ${circularContactEmail || "—"}`;
        }
        
        let finalCloudUrl = "#";
        let folderCloudUrl = "#";
        if (finalType === "مستندات" || isCircular) {
          try {
            const folderPath = isCircular ? `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/التعاميم/${subjectName}` : `تقرير اللجان للدورة الـ 22/اللجان المعتمدة/${committeeName}/الخطابات/مسودات/${subjectName}`;
            const folderId = await resolveDrivePath(folderPath);
            folderCloudUrl = `https://drive.google.com/drive/folders/${folderId}`;
            
            const { documentId, documentUrl } = await createGoogleDoc(subjectName, finalDocumentText);
            await moveDriveFile(documentId, folderId);
            finalCloudUrl = documentUrl;
            
            if (isCircular) {
               let mainUrl = "", att1Url = "", att2Url = "", att3Url = "";
               if (circularMainFile && typeof circularMainFile === 'object') mainUrl = await uploadToFolder(circularMainFile as File, folderId);
               if (circularAtt1 && typeof circularAtt1 === 'object') att1Url = await uploadToFolder(circularAtt1 as File, folderId);
               if (circularAtt2 && typeof circularAtt2 === 'object') att2Url = await uploadToFolder(circularAtt2 as File, folderId);
               if (circularAtt3 && typeof circularAtt3 === 'object') att3Url = await uploadToFolder(circularAtt3 as File, folderId);
               
               if (!pdfGenerated) {
                  const overrideUrls: Record<string, string> = {};
                  if (mainUrl) overrideUrls.main = mainUrl;
                  if (att1Url) overrideUrls.att1 = att1Url;
                  if (att2Url) overrideUrls.att2 = att2Url;
                  if (att3Url) overrideUrls.att3 = att3Url;
                  pdfBlob = await getPdfBlob(overrideUrls);
                  pdfGenerated = true;
               }
               
               if (pdfBlob) {
                   const pdfFile = new File([pdfBlob], `تعميم_${circularOutNumber.replace(/[\\/\\]/g, '-')}.pdf`, { type: 'application/pdf' });
                   const uploadedPdfUrl = await uploadToFolder(pdfFile, folderId);
                   if (uploadedPdfUrl) finalCloudUrl = uploadedPdfUrl;
               }
            }
          } catch (apiError) {
            console.error("Google API Error:", apiError);
            setUploadProgress(prev => prev.map(p => p.id === String(committee.id) ? { ...p, status: 'error' } : p));
          }
        }
        
        lastCloudUrl = finalCloudUrl;
        lastTemplateText = finalDocumentText;
        
        committeeUrls.push({
            committeeId: committee.id,
            committeeName: committee.name,
            documentUrl: finalCloudUrl,
            folderUrl: folderCloudUrl
        });
        
        setUploadProgress(prev => prev.map(p => p.id === String(committee.id) && p.status !== 'error' ? { ...p, status: 'completed' } : p));
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      const urlAttachments = [];
      if (typeof circularMainFile === 'string') urlAttachments.push(circularMainFile);
      if (typeof circularAtt1 === 'string') urlAttachments.push(circularAtt1);
      const combinedCommitteesName = targetCommittees.map(c => c.name).join(' و ');
      
      const sanitize = (val) => val === undefined ? "" : val;
      const newDoc = {
        title: sanitize(subjectName),
        description: sanitize(isCircular ? `مجلد تعاميم | لجان: ${combinedCommitteesName} | موضوع: ${circularSubject || ""}` : `مجلد خطابات - مجلد مسودات | لجان: ${combinedCommitteesName} | صادر إلى: ${aiGenRecipientName}`),
        type: sanitize(finalType),
        creator: sanitize(currentUser?.name || "الأخصائي"),
        cloudUrl: sanitize(lastCloudUrl), // For download button
        downloadUrl: sanitize(lastCloudUrl), // For download button
        lastUpdated: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isFavorite: false,
        templateText: sanitize(lastTemplateText),
        committeeId: sanitize(targetCommittees[0]?.id || ""), // legacy
        targetCommitteesList: targetCommittees.map(c => ({id: sanitize(c.id), name: sanitize(c.name)})),
        committeeUrls: committeeUrls.map(cu => ({
            committeeId: sanitize(cu.committeeId),
            committeeName: sanitize(cu.committeeName),
            documentUrl: sanitize(cu.documentUrl),
            folderUrl: sanitize(cu.folderUrl)
        })),
        attachments: urlAttachments,
        circularDetails: isCircular ? {
            outNumber: sanitize(circularOutNumber),
            outDate: sanitize(circularOutDate),
            incomingFrom: sanitize(circularIncomingFrom),
            incomingNumber: sanitize(circularIncomingNumber),
            incomingDate: sanitize(circularIncomingDate),
            subject: sanitize(circularSubject),
            contactName: sanitize(circularContactName),
            contactPhone: sanitize(circularContactPhone),
            contactEmail: sanitize(circularContactEmail),
            distributionMethod: sanitize((circularViaEmail && circularViaWhatsApp) ? "البريد الإلكتروني والواتس آب" : circularViaEmail ? "البريد الإلكتروني" : circularViaWhatsApp ? "الواتس آب" : "غير محدد"),
            body: sanitize(aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText),
        } : null
      };
      
      if (editAIGenTargetId) {
        await updateDoc(doc(db, "templates", editAIGenTargetId), newDoc);
      } else {
        await addDoc(collection(db, "templates"), newDoc);
      }
      
      setIsAIGenOpen(false);
      setEditAIGenTargetId(null);
      setTimeout(() => setShowUploadOverlay(false), 5000);
    } catch (e) {
      console.error(e);
      showGlobalToast("حدث خطأ أثناء الحفظ. الرجاء المحاولة مجدداً.", "error");
      setShowUploadOverlay(false);
    } finally {
      setIsSavingAIGen(false);
    }
  };

  const [activeSmartLetter, setActiveSmartLetter] = useState<TemplateItem | null>(null);
  const [slTitle, setSlTitle] = useState("");
  const [slContent, setSlContent] = useState("");
  const [slValues, setSlValues] = useState<Record<string, string>>({});
  
  const openFillSmartLetter = (t: TemplateItem) => {
    setSmartLetterMode("fill");
    setActiveSmartLetter(t);
    setSlTitle(t.title);
    setSlContent(t.templateText || "");
    setSlValues({});
    setIsSmartLetterOpen(true);
  };

  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState("");
  const [exportSelectedIds, setExportSelectedIds] = useState<string[]>([]);
  const [cloudSelectOpen, setCloudSelectOpen] = useState<string | null>(null);
  const [circularDetailsOpen, setCircularDetailsOpen] = useState<any>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);

    if (!formTitle) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setFormTitle(nameWithoutExt);
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "docx" || ext === "doc" || ext === "pdf") {
      setFormType("مستندات");
    } else if (ext === "xlsx" || ext === "xls" || ext === "csv") {
      setFormType("جداول بيانات");
    } else if (ext === "pptx" || ext === "ppt") {
      setFormType("عروض تقديمية");
    } else {
      setFormType("أخرى");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadTemplate = (t: TemplateItem) => {
    if (t.type === "تعميم") {
      let urlToOpen = t.downloadUrl && t.downloadUrl !== "#" ? t.downloadUrl :
                      (t.cloudUrl && t.cloudUrl !== "#" ? t.cloudUrl :
                      (t.committeeUrls && Object.values(t.committeeUrls).length > 0 && Object.values(t.committeeUrls)[0] && Object.values(t.committeeUrls)[0] !== "#" ? Object.values(t.committeeUrls)[0] : null));
      
      if (urlToOpen) {
          // If it's a drive file link, try to make it direct download if possible
          let match = urlToOpen.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (!match) match = urlToOpen.match(/id=([a-zA-Z0-9_-]+)/);
          
          if (match && match[1]) {
              window.open(`https://drive.google.com/uc?export=download&id=${match[1]}`, '_blank');
          } else {
              window.open(urlToOpen, '_blank');
          }
      } else {
        alert("لا يوجد ملف متاح للتحميل.");
      }
      return;
    }

    if (t.downloadUrl && t.downloadUrl.startsWith("data:")) {
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", t.downloadUrl);
      downloadAnchor.setAttribute(
        "download",
        t.title +
          (t.type === "جداول بيانات"
            ? ".xlsx"
            : t.type === "عروض تقديمية"
              ? ".pptx"
              : ".docx"),
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.removeChild(downloadAnchor);
      return;
    }

    const content = `===========================================
غرفة مكة المكرمة - إدارة اللجان والقطاعات
قالب مرجعي معتمد: ${t.title}
===========================================
- تصنيف القالب: ${t.type}
- موثق ومعد بواسطة: ${t.creator}
- تاريخ آخر تحديث: ${t.lastUpdated}
- رابط الاستعراض والتعديل السحابي: ${t.cloudUrl}

وصف القالب السريع:
${t.description}

-------------------------------------------
تم تصدير هذا الملف آلياً من المكتبة الرقمية لغرفة مكة المكرمة بنجاح.
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${(t.title || "").replace(/\s+/g, "_")}_قالب_مرجعي.txt`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const targets =
      exportSelectedIds.length > 0
        ? displayedTemplates.filter((t) => exportSelectedIds.includes(t.id))
        : displayedTemplates;

    if (targets.length === 0) {
      alert("الرجاء اختيار النماذج المراد تصديرها أولاً.");
      return;
    }

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(targets, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `makkah_chamber_templates_export_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  const handleExportCSV = () => {
    const targets =
      exportSelectedIds.length > 0
        ? displayedTemplates.filter((t) => exportSelectedIds.includes(t.id))
        : displayedTemplates;

    if (targets.length === 0) {
      alert("الرجاء اختيار النماذج المراد تصديرها أولاً.");
      return;
    }

    let csvContent = "\uFEFF";
    csvContent +=
      "المسلسل,اسم القالب المرجعي,الوصف,التصنيف,المنشئ,الرابط السحابي,آخر تحديث\n";

    targets.forEach((t, index) => {
      const cleanTitle = (t.title || "").replace(/"/g, '""');
      const cleanDesc = (t.description || "").replace(/"/g, '""');
      const cleanCreator = (t.creator || "").replace(/"/g, '""');
      csvContent += `${index + 1},"${cleanTitle}","${cleanDesc}","${t.type}","${cleanCreator}","${t.cloudUrl}","${t.lastUpdated}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute(
      "download",
      `makkah_chamber_templates_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
  };

  const handleImportTemplate = async (
    title: string,
    desc: string,
    type: any,
    url: string,
  ) => {
    try {
      const newDoc = {
        title,
        description: desc,
        type,
        creator: "أخصائي الحوكمة السحابية",
        cloudUrl: url,
        downloadUrl: url,
        lastUpdated: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };
      await addDoc(collection(db, "templates"), newDoc);
      await addDoc(collection(db, "system_logs"), {
        type: "استيراد قالب",
        details: `تم استيراد القالب '${title}' من Google Drive وتوثيقه في المكتبة الرقمية.`,
        status: "ناجحة",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error importing template:", err);
      throw err;
    }
  };

  const wsStatsData = {
    committeesCount: committees.length,
    activeCommitteesCount: committees.filter((c) => c.status === "فعالة").length,
    membersCount: 0,
    recommendationsCount: 0,
    tasksCount: 0,
    committees: committees.map((c) => ({
      id: c.id,
      name: c.name,
      president: c.president || "أ. خالد الزهراني",
      specialist: c.specialist || "أخصائي حوكمة اللجان",
      strategicPlan: c.strategicPlan || "الخطة التشغيلية المعتمدة لتمكين الأعمال",
      membersCount: c.membersCount || 8,
      meetingsCount: c.meetingsCount || 3,
      eventsCount: c.eventsCount || 2,
      recommendationsCount: c.recommendationsCount || 5,
    })),
    members: [],
    events: [],
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormIsSaving(true);
    try {
      const isComputer = importSource === "computer" && uploadedFile;
      const finalCloudUrl = isComputer
        ? `https://storage.makkahchamber.sa/templates/${uploadedFile?.name || "file"}`
        : formCloudUrl || "https://docs.google.com/document/d/example";
      const finalDownloadUrl = isComputer ? uploadedFileDataUrl : "#";
      let autoExtractedText = formTemplateText;
      
      if (isComputer && uploadedFileDataUrl && !formTemplateText) {
         try {
           showGlobalToast("جاري فحص المستند وقراءة محتواه (OCR) عبر الذكاء الاصطناعي...", "error");
           const mime = uploadedFile?.type || "application/pdf";
           const b64 = uploadedFileDataUrl.split(',')[1];
           autoExtractedText = await analyzeDocumentClient("استخرج النص الكامل من هذا المستند بدقة.", b64, mime);
           showGlobalToast("تم تفريغ النص بنجاح للحفظ في المكتبة.", "success");
         } catch (e) {
           console.error("OCR failed", e);
         }
      }

      await addDoc(collection(db, "templates"), {
        title: formTitle,
        description: formDesc,
        templateText: autoExtractedText || formTemplateText,
        type: formType,
        creator: "أخصائي الحوكمة",
        cloudUrl: finalCloudUrl,
        downloadUrl: finalDownloadUrl,
        lastUpdated: new Date().toISOString().split("T")[0],
        isFavorite: false,
        source: importSource,
        fileName: isComputer ? uploadedFile?.name : null,
        fileSize: isComputer
          ? `${(uploadedFile!.size / 1024).toFixed(1)} KB`
          : null,
      });

      await addDoc(collection(db, "system_logs"), {
        type: "إضافة نموذج",
        details: isComputer
          ? `تم رفع نموذج من جهاز الكمبيوتر باسم [${uploadedFile?.name}] وتصنيفه كـ [${formType}].`
          : `تم تسجيل قالب سحابي جديد [${formTitle}] من مساحة Google Drive.`,
        status: "ناجحة",
        timestamp: new Date().toISOString(),
      });

      setIsAddOpen(false);
      setFormTitle("");
      setFormDesc("");
      setFormType("مستندات");
      setFormCloudUrl("");
      setUploadedFile(null);
      setUploadedFileDataUrl("");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء حفظ النموذج الرقمي.");
    } finally {
      setFormIsSaving(false);
    }
  };

  const handleEditTemplate = (item: TemplateItem) => {
    setEditAIGenTargetId(item.id);
    if (item.type === "تعميم" && item.circularDetails) {
      setWorkspaceService("circular");
      setCircularIncomingFrom(item.circularDetails.incomingFrom || "");
      setCircularOutNumber(item.circularDetails.outNumber || "");
      setCircularOutDate(item.circularDetails.outDate || "");
      
      if (item.attachments && item.attachments.length > 0) {
          setCircularMainFile(item.attachments[0] || null);
          setCircularAtt1(item.attachments[1] || null);
          setCircularAtt2(item.attachments[2] || null);
          setCircularAtt3(item.attachments[3] || null);
      }

      setCircularIncomingNumber(item.circularDetails.incomingNumber || "");
      setCircularIncomingDate(item.circularDetails.incomingDate || "");
      setCircularSubject(item.circularDetails.subject || item.title || "");
      setCircularContactName(item.circularDetails.contactName || "");
      setCircularContactPhone(item.circularDetails.contactPhone || "");
      setCircularContactEmail(item.circularDetails.contactEmail || "");
      setAiGenGeneratedText(item.circularDetails.body || "");
      setAiGenSubject(item.title);
      
      const distribution = item.circularDetails.distributionMethod || "";
      setCircularViaEmail(distribution.includes("البريد") || distribution.includes("الايميل") || distribution.includes("كلاهما") || distribution.includes("الكتروني"));
      setCircularViaWhatsApp(distribution.includes("واتس") || distribution.includes("كلاهما"));
      
      setAiGenCommittees(item.targetCommittees?.map(c => String((c as any).id || c)) || []);
      
      setIsAIGenOpen(true);
      setAiGenStep(2);
    } else {
      showGlobalToast("عذراً، ميزة التعديل متاحة حالياً للتعاميم فقط.", "error");
    }
  };

  const handleDeleteTemplate = (item: TemplateItem) => {
    setDeleteTarget(item);
    setDeleteReason("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteReason.trim()) {
      alert("يجب إدخال سبب الحذف لإتمام العملية.");
      return;
    }
    setFormIsSaving(true);
    try {
      await deleteDoc(doc(db, "templates", deleteTarget.id));

      const newDeletedIds = [...deletedTemplateIds, deleteTarget.id];
      setDeletedTemplateIds(newDeletedIds);
      try {
        localStorage.setItem(
          "app_deleted_templates",
          JSON.stringify(newDeletedIds),
        );
      } catch (e) {}

      await addDoc(collection(db, "system_logs"), {
        type: "حذف قالب",
        details: `تم حذف قالب '${deleteTarget.title}' بواسطة المستخدم. السبب: ${deleteReason}`,
        status: "ناجحة",
        timestamp: new Date().toISOString(),
      });
      setDeleteTarget(null);
      setDeleteReason("");
    } catch (err) {
      console.error(err);
    } finally {
      setFormIsSaving(false);
    }
  };

  const handleShareSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsShareOpen(false);
    setShareEmail("");
    alert("تم إرسال القالب عبر البريد السريع بنجاح!");
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "مستندات":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "عروض تقديمية":
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case "جداول بيانات":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "بريد إلكتروني":
        return <Mail className="w-5 h-5 text-red-500" />;
      case "تعميم":
        return <BookOpen className="w-5 h-5 text-[#133E87]" />;
      case "مهام Google":
        return <CheckSquare className="w-5 h-5 text-indigo-600" />;
      case "تقويم Google":
        return <Calendar className="w-5 h-5 text-cyan-600" />;
      case "محادثات Chat":
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case "اجتماعات Meet":
        return <Video className="w-5 h-5 text-teal-600" />;
      case "نماذج Forms":
        return <ClipboardList className="w-5 h-5 text-purple-600" />;
      case "خطاب ذكي":
        return <Wand2 className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileJson className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-16 text-right font-sans" dir="rtl">
      {/* -------------------- Page Action Header -------------------- */}
      <div className="bg-[#e8e4e4] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 md:gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/80 text-[#0ea5e9] rounded-xl border border-blue-200">
              <LibraryIcon className="w-7 h-7 text-[#0ea5e9]" />
            </div>
            <h1 className="text-sm sm:text-base md:text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
              المكتبة الرقمية للقوالب والتعاميم
            </h1>
          </div>
          <p className="text-gray-500 mt-2 text-sm font-medium pr-12">
            توفير قوالب مصنفة وبطاقات تعاميم رسمية متصلة بمساحة Google Workspace لتسهيل عمل الأخصائيين.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end shrink-0 w-full md:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 relative">
            <AnimatePresence>
              {isSearchVisible && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="ابحث عن قالب أو تعميم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsSearchVisible(false); }}
                    onBlur={() => setTimeout(() => setIsSearchVisible(false), 200)}
                    className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setIsSearchVisible(false); }} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                  if (searchQuery && isSearchVisible) {
                      setIsSearchVisible(false);
                  } else {
                      setIsSearchVisible(!isSearchVisible);
                  }
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer shadow-sm ${
                isSearchVisible || searchQuery ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="بحث"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm gap-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="الكل"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("مستندات")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "مستندات"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="مستندات"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("تعميم")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "تعميم"
                  ? "bg-[#133E87] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="التعاميم"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("عروض تقديمية")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "عروض تقديمية"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="عروض تقديمية"
            >
              <Presentation className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("جداول بيانات")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "جداول بيانات"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="جداول بيانات"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("بريد إلكتروني")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "بريد إلكتروني"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="بريد إلكتروني"
            >
              <Mail className="w-4 h-4" />
            </button>

            <div className="w-[1px] bg-gray-200 my-1 mx-0.5" />

            {/* View Toggles */}
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="بطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="سجل"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowWorkspaceCenter(!showWorkspaceCenter)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all duration-200 cursor-pointer shrink-0 ${
              showWorkspaceCenter
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          </button>

          <div className="relative dropdown-container">
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>إجراءات المكتبة</span>
              <ChevronDown className="w-4 h-4 mr-1 opacity-70" />
            </button>
            <AnimatePresence>
              {isTemplateMenuOpen && (
                <div key="animate-wrapper-template-actions-comm">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={() => setIsTemplateMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-20 flex flex-col gap-1"
                  >
                    <button
                      type="button"
                      onClick={openGenerateWizard}
                      className="w-full h-10 px-3 bg-white hover:bg-blue-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                        <Wand2 className="w-3.5 h-3.5" />
                      </div>
                      <span>إنشاء قالب / بطاقة تعميم</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTemplateMenuOpen(false);
                        setModalTab("import");
                        setIsAddOpen(true);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-blue-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                        <Download className="w-3.5 h-3.5" />
                      </div>
                      <span>استيراد قالب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTemplateMenuOpen(false);
                        setModalTab("export");
                        setIsAddOpen(true);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-blue-50 text-gray-800 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group"
                    >
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                        <Upload className="w-3.5 h-3.5" />
                      </div>
                      <span>تصدير قوالب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnalyzeModalOpen(true);
                        setAnalyzeUploadedFile(null);
                        setAnalyzeUploadedDataUrl("");
                        setAnalyzedTasks([]);
                        setIsTemplateMenuOpen(false);
                      }}
                      className="w-full h-10 px-3 bg-white hover:bg-purple-50 text-gray-800 hover:text-purple-700 font-bold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-right group border-t border-gray-50 mt-1 pt-1"
                    >
                      <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-100">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span>تحليل واستخراج البيانات</span>
                    </button>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      
      {/* -------------------- Analyze Tasks Modal -------------------- */}
      <AnimatePresence>
        {isAnalyzeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isAnalyzing && setIsAnalyzeModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-l from-purple-900 to-indigo-800 p-3 sm:p-4 md:p-6 text-white shrink-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/30">
                      <Sparkles className="w-5 h-5 text-purple-100" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white">تحليل واستخراج البيانات</h2>
                      <p className="text-purple-200 text-xs mt-1">الذكاء الاصطناعي لاستخراج المهام من المستندات</p>
                    </div>
                  </div>
                  <button onClick={() => !isAnalyzing && setIsAnalyzeModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-6 overflow-y-auto font-sans" dir="rtl">
                {!analyzeUploadedFile && analyzedTasks.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 font-bold mb-2">الخطوة الأولى: أرفق المستند (نفس آلية إرفاق خطاب التشكيل)</p>
                    <AttachmentInput 
                        label="اسحب وأفلت المستند هنا أو اضغط للتصفح (PDF, Image, Word)" 
                        value={analyzeUploadedFile} 
                        onChange={async (file) => {
                            setAnalyzeUploadedFile(file as File);
                            if (file && typeof file === 'object') {
                                const reader = new FileReader();
                                reader.onload = () => setAnalyzeUploadedDataUrl(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} 
                        id="analyze-upload" 
                    />
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!analyzeUploadedFile) {
                              showGlobalToast("الرجاء إرفاق المستند أولاً", "error");
                              return;
                          }
                          setIsAnalyzing(true);
                          try {
                            const b64 = analyzeUploadedDataUrl.split(',')[1];
                            const mime = analyzeUploadedDataUrl.split(';')[0].split(':')[1];
                            
                            const prompt = `اقرأ النص في هذا المستند الرسمي واستخرج منه أي مهام (Tasks) أو توجيهات تتطلب تنفيذاً. أرجع النتيجة كـ JSON: [{"title": "عنوان المهمة", "description": "وصف تفصيلي", "deadline": "تاريخ أو مدة التنفيذ إن وجدت"}] (لا ترجع أي نص آخر سوى הJSON).`;
                            
                            const result = await analyzeDocumentClient(prompt, b64, mime);
                            let parsed = [];
                            try {
                                const clean = result.replace(/\x60\x60\x60json/g, '').replace(/\x60\x60\x60/g, '').trim();
                                parsed = JSON.parse(clean);
                            } catch(e) {
                                console.error(e);
                                parsed = [];
                            }
                            setAnalyzedTasks(parsed);
                          } catch(e) {
                            console.error(e);
                            showGlobalToast("حدث خطأ أثناء تحليل المستند.", "error");
                          } finally {
                            setIsAnalyzing(false);
                          }
                        }}
                        disabled={!analyzeUploadedFile || isAnalyzing}
                        className="h-10 px-3 sm:px-4 md:px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-70"
                      >
                        {isAnalyzing ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> جاري التحليل...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> بدء الاستخراج والتحليل</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-800 font-extrabold">جاري تحليل المستند...</p>
                    <p className="text-gray-500 text-xs mt-2">يتم الآن قراءة المحتوى واستخلاص التوجيهات والمهام</p>
                  </div>
                ) : analyzedTasks.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            تم استخراج ({analyzedTasks.length}) مهام/توجيهات
                        </h4>
                        <button onClick={() => {
                            setAnalyzeUploadedFile(null);
                            setAnalyzeUploadedDataUrl("");
                            setAnalyzedTasks([]);
                        }} className="text-xs text-purple-600 hover:underline font-bold">
                            تحليل مستند آخر
                        </button>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                      {analyzedTasks.map((task, idx) => (
                        <div key={idx} className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative group">
                          <h5 className="font-extrabold text-gray-900 text-sm mb-1">{task.title}</h5>
                          <p className="text-xs text-gray-600 leading-relaxed mb-3">{task.description}</p>
                          {task.deadline && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded inline-flex mb-3">
                              <Calendar className="w-3 h-3" />
                              <span>{task.deadline}</span>
                            </div>
                          )}
                          <div className="border-t border-purple-50 pt-3">
                             <button
                               onClick={() => handleCreateTaskFromAnalysis({ ...task, title: task.title + ' (مستخرجة آلياً)' })}
                               className="w-full h-8 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                             >
                               <Plus className="w-3.5 h-3.5" />
                               إحالة إلى سجل المهام
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                        </div>
                        <h4 className="font-bold text-gray-800">لم يتم العثور على مهام</h4>
                        <p className="text-sm text-gray-500 mt-1 mb-4">لم يتعرف الذكاء الاصطناعي على أي توجيهات صريحة أو مهام في هذا المستند.</p>
                        <button onClick={() => {
                            setAnalyzeUploadedFile(null);
                            setAnalyzeUploadedDataUrl("");
                            setAnalyzedTasks([]);
                        }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors">
                            المحاولة بملف آخر
                        </button>
                    </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- Unified Google Workspace Integration Center -------------------- */}
      <AnimatePresence>
        {showWorkspaceCenter && (
          <motion.div key="workspace-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-250 shadow-lg p-3 sm:p-4 md:p-5 print:hidden space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  البوابة السحابية الموحدة وتكامل قوالب اللجان
                </h3>
                <p className="text-[10.5px] text-gray-400 mt-0.5">
                  تتبع الاتصال بجميع قنوات Google العشرة وإدارة أرشفة واعتلاء المستندات الرقمية
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkspaceCenter(false)}
                className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg"
              >
                إخفاء
              </button>
            </div>

            <GoogleWorkspaceCenter
              statsData={wsStatsData}
              templates={displayedTemplates}
              onImportTemplate={handleImportTemplate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[400px]">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#e8e4e4] rounded-xl sm:rounded-2xl border border-dashed border-gray-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-4 transform -rotate-2">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-gray-800">
              لا توجد قوالب أو تعاميم متطابقة
            </h3>
            <p className="text-gray-500 mt-1 max-w-md font-medium text-sm">
              جرّب تغيير كلمات البحث أو فئة الفلترة للعثور على العناصر.
            </p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {filteredTemplates.map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Indicator */}
                <div
                  className={`absolute top-0 right-0 w-1.5 h-full ${
                    t.type === "مستندات"
                      ? "bg-blue-500"
                      : t.type === "تعميم"
                        ? "bg-[#133E87]"
                        : t.type === "عروض تقديمية"
                          ? "bg-amber-400"
                          : t.type === "جداول بيانات"
                            ? "bg-emerald-500"
                            : t.type === "بريد إلكتروني"
                              ? "bg-red-400"
                              : t.type === "خطاب ذكي"
                                ? "bg-indigo-500"
                                : "bg-gray-500"
                  }`}
                ></div>

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                      {getIconForType(t.type)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                            onClick={() => handleEditTemplate(t)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-green-100 shadow-sm hover:shadow"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(t)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm hover:shadow"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                                            
                      <button
                        onClick={() => {
                          setIsShareOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                        title="مشاركة سريعة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base md:text-lg mb-1.5 line-clamp-2">
                    {t.title}
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {t.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/60 p-2 rounded-lg border border-gray-200/50">
                    <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] uppercase font-black tracking-wider shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]">
                      {(t.creator || "  ").substring(0, 2)}
                    </span>
                    صانع القالب: {t.creator}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-gray-200/60">
                    <div className="relative">
                      {t.committeeUrls && t.committeeUrls.length > 1 ? (
                        <>
                            <button
                                onClick={() => setCloudSelectOpen(cloudSelectOpen === t.id ? null : t.id)}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                            >
                                فتح سحابي
                                <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            {cloudSelectOpen === t.id && (
                                <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-1 flex flex-col gap-1">
                                    {t.committeeUrls.map((cu: any) => (
                                        <a key={cu.committeeId} href={cu.documentUrl || cu.folderUrl} target="_blank" rel="noopener noreferrer" className="block px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded text-right whitespace-nowrap overflow-hidden text-ellipsis font-bold" onClick={() => setCloudSelectOpen(null)}>
                                            {cu.committeeName}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </>
                      ) : (
                        <a
                          href={t.committeeUrls?.[0]?.documentUrl || t.cloudUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                        >
                          فتح سحابي
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                         e.preventDefault();
                         handleDownloadTemplate(t);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-750 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                      title="تحميل مباشرة"
                    >
                      تحميل
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => t.type === "خطاب ذكي" ? openFillSmartLetter(t) : (t.type === "تعميم" ? setCircularDetailsOpen(t) : handleOpenAI(t))}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white hover:brightness-110 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                      title={t.type === "خطاب ذكي" ? "تعبئة المتغيرات وطباعة الخطاب" : (t.type === "تعميم" ? "تفاصيل التعميم" : "المولد الذكي للخطابات والتعاميم")}
                    >
                      {t.type === "خطاب ذكي" ? "تعبئة وطباعة" : (t.type === "تعميم" ? "التفاصيل" : "توليد ذكي")}
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="box-border border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden bg-[#e8e4e4] shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead className="bg-[#dfdada] text-gray-700 font-extrabold text-sm border-b border-gray-300">
                  <tr>
                    <th className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5 w-12">النوع</th>
                    <th className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5">اسم القالب المرجعي</th>
                    <th className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5">الوصف</th>
                    <th className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5">المنشئ</th>
                    <th className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {filteredTemplates.map((t, i) => (
                    <tr
                      key={`${t.id}-${i}`}
                      className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800"
                    >
                      <td className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5 font-bold">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 inline-flex items-center justify-center">
                          {getIconForType(t.type)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5 font-bold text-gray-900">
                        {t.title}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5 text-gray-500 text-xs w-1/3 leading-relaxed">
                        <span className="line-clamp-1">{t.description}</span>
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5 font-black text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] uppercase font-black tracking-wider">
                            {(t.creator || "  ").substring(0, 2)}
                          </span>
                          {t.creator}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 sm:px-4 md:px-5">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={t.cloudUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                            title="فتح سحابي"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDownloadTemplate(t)}
                            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors border border-transparent shadow-sm hover:shadow"
                            title="تحميل مباشر"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => t.type === "خطاب ذكي" ? openFillSmartLetter(t) : handleOpenAI(t)}
                            className="p-1.5 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-600/20 shadow-sm hover:shadow"
                            title={t.type === "خطاب ذكي" ? "تعبئة وطباعة" : "تعبئة بالذكاء الاصطناعي"}
                          >
                            <Wand2 className="w-4 h-4" />
                          </button>
                                                
                      <button
                        onClick={() => {
                              setIsShareOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                            title="مشاركة سريعة"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(t)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-green-100 shadow-sm hover:shadow"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(t)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm hover:shadow"
                            title="حذف القالب"
                          >
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

      
      {/* Upload Progress Overlay */}
      <AnimatePresence>
        {showUploadOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-[99999] max-w-sm w-full bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden font-sans"
            dir="rtl"
          >
            <div className="bg-gray-50/80 backdrop-blur border-b border-gray-100 px-3 sm:px-4 md:px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Upload className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="font-extrabold text-sm text-gray-900">مزامنة وأرشفة سحابية</h3>
                   <p className="text-[11px] font-bold text-gray-500 mt-0.5">{!isSavingAIGen ? "تم نقل وحفظ الملفات بنجاح" : "جاري نقل وحفظ الملفات"}</p>
                 </div>
              </div>
              {!isSavingAIGen && (
                <button onClick={() => setShowUploadOverlay(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              <ul className="space-y-1">
                {uploadProgress.map((p, idx) => (
                  <li key={p.id + idx} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                     <span className="text-xs font-bold text-gray-700">{p.name}</span>
                     <div>
                       {p.status === 'pending' && <Clock className="w-4 h-4 text-gray-300" />}
                       {p.status === 'syncing' && <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />}
                       {p.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                       {p.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                     </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Import / Export Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div key="comm-isAddOpen-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 pb-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  إدارة واستيراد وتصدير النماذج والتعاميم
                </h2>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
                <button
                  type="button"
                  onClick={() => setModalTab("import")}
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-lg transition-all ${
                    modalTab === "import"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-black/5"
                  }`}
                >
                  📥 استيراد وإضافة قالب جديد
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalTab("export");
                    setExportSelectedIds(displayedTemplates.map((t) => t.id));
                  }}
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-lg transition-all ${
                    modalTab === "export"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800 hover:bg-black/5"
                  }`}
                >
                  📤 تصدير القوالب مجمعة وبأرشفة
                </button>
              </div>

              {modalTab === "import" ? (
                <form
                  onSubmit={handleSave}
                  className="p-3 sm:p-4 md:p-6 overflow-y-auto space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      اسم القالب أو التعميم المرجعي
                    </label>
                    <input
                      required
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all placeholder:text-gray-400 font-medium"
                      placeholder="مثال: مسودة محضر اللجان أو بطاقة تعميم"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>هيكل القالب (للمولد الذكي) <span className="text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full mr-2">اختياري</span></span>
                    </label>
                    <textarea
                      rows={5}
                      value={formTemplateText}
                      onChange={(e) => setFormTemplateText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all resize-none font-medium text-sm text-gray-600"
                      placeholder="انسخ محتوى الخطاب أو التعميم هنا لتمكين الذكاء الاصطناعي من تعبئته لاحقاً..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      وصف القالب السريع
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all resize-none font-medium text-sm"
                      placeholder="استخدام هذا القالب لتوحيد كتابة المحاضر أو التعاميم..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      تصنيف نوعيات القالب
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all font-semibold text-gray-700"
                    >
                      <option value="مستندات">مستندات Google Docs / Word</option>
                      <option value="تعميم">بطاقة تعميم رسمي (Circular)</option>
                      <option value="عروض تقديمية">عروض تقديمية Slides / PPT</option>
                      <option value="جداول بيانات">جداول تفاعلية Sheets / Excel</option>
                      <option value="بريد إلكتروني">مراسلات إلكترونية Email</option>
                      <option value="مهام Google">مهام Google Tasks</option>
                      <option value="تقويم Google">تقويم Google Calendar</option>
                      <option value="محادثات Chat">محادثات Google Chat</option>
                      <option value="اجتماعات Meet">اجتماعات Google Meet</option>
                      <option value="نماذج Forms">نماذج Google Forms</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-3 sm:px-4 md:px-5 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      disabled={formIsSaving}
                      type="submit"
                      className="px-3 sm:px-4 md:px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#121212] hover:bg-black flex items-center gap-2 shadow-sm transition-all disabled:opacity-70"
                    >
                      {formIsSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      تأكيد حفظ المعيار
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 sm:p-4 md:p-6 overflow-y-auto space-y-4">
                  <p className="text-xs text-gray-500 font-bold leading-relaxed border-r-2 border-blue-500 pr-2.5 text-right">
                    حدد النماذج التي تود تصديرها من القائمة أدناه:
                  </p>

                  <div className="border border-gray-200 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-gray-100 bg-slate-50 p-1.5 text-right">
                    {templates.map((t, i) => {
                      const isChecked = exportSelectedIds.includes(t.id);
                      return (
                        <div
                          key={`${t.id}-${i}`}
                          onClick={() => {
                            if (isChecked) setExportSelectedIds(exportSelectedIds.filter((id) => id !== t.id));
                            else setExportSelectedIds([...exportSelectedIds, t.id]);
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 pointer-events-none"
                          />
                          <div className="text-right flex-1">
                            <p className="text-xs font-black text-gray-900">{t.title}</p>
                            <p className="text-[10px] text-gray-400">التصنيف: {t.type} • الكاتب: {t.creator}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-right">
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center text-center shadow gap-1.5 transition-all text-xs font-bold"
                    >
                      <FileJson className="w-5 h-5 text-yellow-400" />
                      <span>تصدير كأرشيف JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex flex-col items-center justify-center text-center shadow gap-1.5 transition-all text-xs font-bold"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
                      <span>تصدير جدول بيانات CSV</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteReason("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-gray-900">تأكيد حذف النموذج</h3>
                    <p className="text-sm font-medium text-red-600 mt-1">هذا الإجراء لا يمكن التراجع عنه</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteReason("");
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 md:p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 font-medium">هل أنت متأكد من حذف النموذج:</p>
                  <p className="text-base text-gray-900 font-bold mt-1">{deleteTarget.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    سبب الحذف (إلزامي للتوثيق) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-medium text-gray-700 resize-none h-24"
                    placeholder="اكتب سبب حذف النموذج..."
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-5 border-t border-gray-100 bg-gray-50 flex items-center gap-3 justify-end shrink-0">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteReason("");
                  }}
                  className="px-3 sm:px-4 md:px-5 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={formIsSaving || !deleteReason.trim()}
                  className="px-3 sm:px-4 md:px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {formIsSaving ? "جاري الحذف..." : "تأكيد الحذف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
      {/* Circular Details Modal */}
      <AnimatePresence>
        {circularDetailsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl sm:rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                    تفاصيل التعميم
                  </h2>
                </div>
                <button
                  onClick={() => setCircularDetailsOpen(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {circularDetailsOpen.circularDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الموضوع</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.subject || circularDetailsOpen.title}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">رقم التعميم</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.outNumber || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">تاريخ التعميم</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.outDate || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الوارد من</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.incomingFrom || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">طريقة التعميم</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.distributionMethod === "كلاهما" ? "البريد الإلكتروني والواتس آب" : circularDetailsOpen.circularDetails.distributionMethod || "—"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">نص التعميم</label>
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                        {circularDetailsOpen.circularDetails.body}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الموضوع:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">
                      {circularDetailsOpen.title}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    تم التعميم على اللجان التالية:
                  </label>
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap gap-2">
                    {circularDetailsOpen.targetCommitteesList?.map((c: any) => (
                      <span key={c.id} className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-bold shadow-sm">
                        {c.name}
                      </span>
                    ))}
                    {(!circularDetailsOpen.targetCommitteesList || circularDetailsOpen.targetCommitteesList.length === 0) && (
                      <span className="text-gray-500 text-sm">
                        {circularDetailsOpen.committeeName || "غير محدد"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    روابط الأرشفة السحابية للجان:
                  </label>
                  <div className="space-y-2">
                    {circularDetailsOpen.committeeUrls?.map((cu: any) => (
                      <div key={cu.committeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-700 text-sm">{cu.committeeName}</span>
                        <div className="flex items-center gap-3">
                        {circularDetailsOpen.circularDetails?.distributionMethod && circularDetailsOpen.circularDetails.distributionMethod !== "غير محدد" && (
                          <span className="text-[11px] text-gray-500">
                             (تم التعميم عن طريق {circularDetailsOpen.circularDetails.distributionMethod === "كلاهما" ? "البريد الإلكتروني والواتس آب" : circularDetailsOpen.circularDetails.distributionMethod})
                          </span>
                        )}
                        <a
                          href={cu.folderUrl || cu.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          المجلد السحابي
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <button
                  onClick={() => setCircularDetailsOpen(null)}
                  className="px-3 sm:px-4 md:px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareOpen && templateToShare && (
          <div key="share-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 pb-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm relative z-10 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  إرسال قالب عبر البريد السريع
                </h2>
                <button
                  onClick={() => setIsShareOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleShareSubmit} className="p-3 sm:p-4 md:p-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 text-center mb-1">القالب المحدد:</p>
                  <p className="text-sm font-extrabold text-gray-800 text-center">{templateToShare.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني للزميل</label>
                  <input
                    required
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 text-left font-sans outline-none transition-all"
                    placeholder="name@makkahchamber.sa"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
                >
                  <Send className="w-4 h-4" /> إرسال سريع للموظف
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------- AI Generator Wizard Modal (مع بطاقة التعميم المعتمدة) -------------------- */}
      <AnimatePresence>
        {isAIGenOpen && (
          <div key="comm-isAIGenOpen-modal" className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAIGenOpen(false)} />
            <motion.div
              key="ai-generator-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl sm:rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden w-full max-w-5xl z-10 flex flex-col max-h-[95vh]"
            >
              <div className="p-3 sm:p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-[#133E87]/10 via-white to-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#133E87]/10 text-[#133E87] flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-900">
                      {workspaceService === "circular" ? "إنشاء وتوليد بطاقة تعميم رسمية" : "إنشاء نموذج مخصص للمهام"}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      الخطوة {aiGenStep} من {workspaceService === "circular" ? 4 : 3}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIGenOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50/50">
                
                {/* STEP 1: اختيار النوع واللجان */}
                {aiGenStep === 1 && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-800 mb-2">نوع النموذج / الإجراء</label>
                           <select 
                             value={workspaceService} 
                             onChange={e => {
                               setWorkspaceService(e.target.value);
                               const val = e.target.value;
                               if (val !== "docs" && val !== "gmail") {
                                 setAiGenMode("new");
                               }
                               if(val === "docs") setAiGenTemplateType("مستندات (Google Docs)");
                               else if(val === "slides") setAiGenTemplateType("عروض تقديمية (Google Slides)");
                               else if(val === "sheets") setAiGenTemplateType("جداول بيانات (Google Sheets)");
                               else if(val === "gmail") setAiGenTemplateType("بريد إلكتروني (Gmail)");
                               else if(val === "circular") { setAiGenTemplateType("تعميم"); setAiGenMode("new"); }
                             }}
                             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#133E87] font-bold text-sm"
                           >
                             <option value="circular">بطاقة تعميم رسمي (Circular Card)</option>
                             <option value="docs">مستندات (Google Docs)</option>
                             <option value="slides">عروض تقديمية (Google Slides)</option>
                             <option value="sheets">جداول بيانات (Google Sheets)</option>
                             <option value="gmail">بريد إلكتروني (Gmail)</option>
                           </select>
                        </div>

                        {workspaceService !== "circular" && <div>
                           <label className="block text-sm font-bold text-gray-800 mb-2">حالة النموذج</label>
                           <select 
                             value={aiGenMode} 
                             onChange={e => setAiGenMode(e.target.value as any)}
                             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#133E87] font-bold text-sm"
                           >
                             {workspaceService === "docs" ? (
                               <>
                                 <option value="new">إنشاء خطاب/مستند جديد</option>
                                 <option value="reply">رد على خطاب/مستند وارد</option>
                               </>
                             ) : (
                               <option value="new">إنشاء نموذج جديد</option>
                             )}
                           </select>
                        </div>}

                        <div>
                           <label className="block text-sm font-bold text-gray-800 mb-2">اختر اللجان للربط والأرشفة</label>
                           <div className="w-full border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-48 bg-white">
                             <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                               <input 
                                  type="checkbox"
                                  checked={aiGenCommittees.length > 0 && aiGenCommittees.length === committees.length}
                                  onChange={(e) => {
                                     if (e.target.checked) setAiGenCommittees(committees.map(c => String(c.id)));
                                     else setAiGenCommittees([]);
                                  }}
                                  className="w-4 h-4 text-[#133E87] rounded border-gray-300"
                               />
                               <span className="text-sm font-bold text-gray-700">تحديد جميع اللجان</span>
                             </div>
                             <div className="overflow-y-auto p-2 space-y-1">
                               {committees.map((c, i) => (
                                 <label key={`${c.id}-${i}`} className="flex items-center gap-3 p-2 hover:bg-blue-50/50 rounded-lg cursor-pointer transition-colors">
                                    <input 
                                       type="checkbox"
                                       checked={aiGenCommittees.includes(String(c.id))}
                                       onChange={(e) => {
                                         if (e.target.checked) setAiGenCommittees([...aiGenCommittees, String(c.id)]);
                                         else setAiGenCommittees(aiGenCommittees.filter(id => id !== String(c.id)));
                                       }}
                                       className="w-4 h-4 text-[#133E87] rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                                 </label>
                               ))}
                             </div>
                           </div>
                        </div>

                        {workspaceService === "circular" && (
                          <div>
                             <label className="block text-sm font-bold text-gray-800 mb-2">وسيلة إرسال وتوجيه التعميم</label>
                             <div className="flex gap-2.5 sm:gap-3 md:gap-4 items-center mt-2">
                               <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={circularViaEmail} onChange={e => setCircularViaEmail(e.target.checked)} className="w-4 h-4 text-[#133E87] rounded border-gray-300" />
                                 <span className="text-sm font-bold text-gray-700">البريد الإلكتروني</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={circularViaWhatsApp} onChange={e => setCircularViaWhatsApp(e.target.checked)} className="w-4 h-4 text-[#133E87] rounded border-gray-300" />
                                 <span className="text-sm font-bold text-gray-700">واتس آب</span>
                               </label>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (aiGenCommittees.length === 0) {
                             showGlobalToast("الرجاء اختيار اللجنة للربط والأرشفة", "error");
                             return;
                          }
                          setAiGenStep(2);
                        }}
                        className="px-8 py-3 bg-[#0B2545] text-white rounded-xl text-sm font-bold hover:bg-[#133E87] transition-colors flex items-center gap-2"
                      >
                        متابعة <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: رفع الخطاب والمعطيات */}
                {aiGenStep === 2 && (
                  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
                    <div className="flex-1 space-y-5">
                      {workspaceService === "circular" ? (
                        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-4">
                          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-[#133E87]" />
                            مرفقات المعاملة أو الخطاب الوارد
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <AttachmentInput
                              id="circularMain"
                              label="الخطاب / المعاملة الأساسية *"
                              value={circularMainFile}
                              onChange={setCircularMainFile}
                            />
                            <AttachmentInput
                              id="circularAtt1"
                              label="مرفق إضافي 1"
                              value={circularAtt1}
                              onChange={setCircularAtt1}
                            />
                            <AttachmentInput
                              id="circularAtt2"
                              label="مرفق إضافي 2"
                              value={circularAtt2}
                              onChange={setCircularAtt2}
                            />
                            <AttachmentInput
                              id="circularAtt3"
                              label="مرفق إضافي 3"
                              value={circularAtt3}
                              onChange={setCircularAtt3}
                            />
                          </div>
                        </div>
                      ) : aiGenMode === "new" ? (
                        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-4">
                          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-emerald-600" />
                            بيانات الخطاب الجديد
                          </h3>
                          <input
                            type="text"
                            value={aiGenSubject}
                            placeholder="موضوع الخطاب الرئيسي..."
                            onChange={(e) => setAiGenSubject(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                          />
                          <textarea
                            value={aiGenDetails}
                            onChange={(e) => setAiGenDetails(e.target.value)}
                            className="w-full h-28 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                            placeholder="النقاط المطلوبة..."
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="lg:w-1/3 flex flex-col gap-2.5 sm:gap-3 md:gap-4">
                      <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-gray-400" />
                          إعدادات التواصل والتوقيع
                        </h3>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">ضابط الاتصال (للاستفسارات)</label>
                          <select
                            value={aiGenContact}
                            onChange={(e) => setAiGenContact(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value="">-- اختياري من قائمة الموظفين --</option>
                            {employees.map((emp, i) => (
                              <option key={`contact-${emp.id}-${i}`} value={emp.id}>{emp.jobTitle ? `${emp.jobTitle} / ` : ''}{emp.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-auto bg-blue-50/50 p-4 rounded-xl sm:rounded-2xl border border-blue-100 text-center">
                        <button
                          onClick={handleGenerateNewLetter}
                          disabled={isAIGenGenerating || (workspaceService === 'circular' ? !circularMainFile : (!aiGenSubject && !aiGenDetails))}
                          className="w-full py-3.5 bg-[#133E87] text-white rounded-xl text-sm font-black hover:bg-[#0B2545] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isAIGenGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              جاري تحليل الخطاب واستخراج البيانات...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-5 h-5" />
                              توليد وتنسيق بطاقة التعميم الذكية
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: التدقيق والتعديل التفاعلي المباشر للبطاقة */}
                {aiGenStep === 3 && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {workspaceService === "circular" ? "تدقيق وتعديل بيانات بطاقة التعميم الرسمية" : "الخطاب المولد"}
                      </h3>
                      {workspaceService !== "circular" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiGenGeneratedText);
                            showGlobalToast("تم نسخ الخطاب للمسودة", "success");
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> نسخ النص
                        </button>
                      )}
                    </div>
                    
                    {workspaceService === "circular" ? (
                      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 h-full">
                        {/* لوحة تحرير الحقول على اليمين */}
                        <div className="lg:w-1/3 flex flex-col gap-2.5 sm:gap-3 md:gap-4 overflow-y-auto pr-1 max-h-[70vh]">
                          <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm space-y-3">
                            <h4 className="font-bold text-[#133E87] border-b border-gray-100 pb-2 text-sm flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#C5A880]" />
                              بيانات التعميم المستخرجة
                            </h4>
                            
                            {/* أنواع التعميم */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">أهمية / نوع التعميم</label>
                              <div className="flex flex-wrap gap-2">
                                {["عادي", "هام", "عاجل", "سري"].map(t => (
                                  <button
                                    key={t}
                                    onClick={() => {
                                      if (circularTypes.includes(t)) {
                                        setCircularTypes(circularTypes.filter(x => x !== t));
                                      } else {
                                        setCircularTypes([...circularTypes, t]);
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${circularTypes.includes(t) ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">رقم تعميم الغرفة</label>
                                <input type="text" value={circularOutNumber} onChange={e => setCircularOutNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">تاريخ تعميم الغرفة</label>
                                <input type="text" value={circularOutDate} onChange={e => setCircularOutDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">التعميم وارد من</label>
                              <input type="text" value={circularIncomingFrom} onChange={e => setCircularIncomingFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">رقم خطاب الجهة</label>
                                <input type="text" value={circularIncomingNumber} onChange={e => setCircularIncomingNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-600 mb-1">تاريخ خطاب الجهة</label>
                                <input type="text" value={circularIncomingDate} onChange={e => setCircularIncomingDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">موضوع التعميم الرئيسي</label>
                              <textarea rows={3} value={circularSubject} onChange={e => setCircularSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs resize-none" />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-1">اسم المرفق</label>
                              <input type="text" value={circularAttachmentName} onChange={e => setCircularAttachmentName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                            </div>

                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              <label className="block text-[11px] font-bold text-gray-600">بيانات مسؤول التواصل</label>
                              <input type="text" value={circularContactName} onChange={e => setCircularContactName(e.target.value)} placeholder="اسم المسؤول" className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={circularContactPhone} onChange={e => setCircularContactPhone(e.target.value)} placeholder="الجوال" className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                                <input type="text" value={circularContactEmail} onChange={e => setCircularContactEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-3 py-2 border border-gray-200 rounded-lg font-bold text-xs" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* بطاقة المعاينة الفورية بالنمط الهجين الفاخر */}
                        <div className="lg:w-2/3 bg-slate-300/80 rounded-xl sm:rounded-2xl overflow-hidden flex justify-center items-center min-h-[70vh] max-h-[70vh] border border-gray-300 relative">
                          <div className="scale-[0.50] xl:scale-[0.60] origin-center">
                            <div 
                              className="w-[1123px] h-[794px] min-w-[1123px] min-h-[794px] max-h-[794px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200/90 relative transition-all flex flex-col justify-between shrink-0"
                              style={{ 
                                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #FAF8F5 100%)',
                                boxShadow: '0 20px 40px -15px rgba(11, 37, 69, 0.08), 0 0 0 1px rgba(197, 168, 128, 0.25)' 
                              }}
                            >
                            
                            {/* الشريط العلوي الجمالي المتدرج */}
                            <div className="h-2 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B2545 0%, #133E87 35%, #C5A880 50%, #133E87 65%, #0B2545 100%)' }}></div>

                            {/* منطقة الترويسة الزجاجية المغلفة بشريط كامل */}
                            <div className="px-8 py-3 sm:py-4 md:py-5 shrink-0">
                              <div 
                                className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-4 rounded-xl sm:rounded-2xl sm:rounded-3xl text-right text-xs shadow-sm border border-slate-200/90"
                                style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)' }}
                              >
                                <div className="text-right">
                                  <div className="font-extrabold text-[#133E87] flex items-center gap-1.5 mb-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                    <span>رقم التعميم:</span>
                                    <span className="text-gray-900 font-black tracking-wider text-[13px] border-b border-dashed border-gray-400 pb-0.5">{circularOutNumber}</span>
                                  </div>
                                  <div className="font-extrabold text-[#133E87] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                    <span>تاريـــــــخه:</span>
                                    <span className="text-gray-900 font-black tracking-wider text-[13px] border-b border-dashed border-gray-400 pb-0.5">{circularOutDate}</span>
                                  </div>
                                </div>

                                <div className="text-center relative">
                                  <h1 className="text-sm sm:text-base md:text-lg sm:text-xl md:text-2xl sm:text-3xl md:text-4xl text-[#133E87] tracking-widest leading-none font-black" >
                                    تـعـمـيـم
                                  </h1>
                                  <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-2.5 rounded-full"></div>
                                  
                                  {circularTypes.length > 0 && circularTypes.some(t => t !== "عادي") && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-1.5 w-full">
                                      {circularTypes.filter(t => t !== "عادي").map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded-md border border-red-600 text-red-600 text-[10px] font-black tracking-widest bg-white">
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-end">
                                  <div className="w-20 h-16 flex items-center justify-center shrink-0">
                                    <img src={logoBase64} alt="شعار غرفة مكة" className="w-full h-full object-contain scale-125" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* شريط الوارد والمرجعية */}
                            <div className="mx-8 my-2 shrink-0 mt-6">
                              <div className="px-3 sm:px-4 md:px-6 py-2.5 rounded-xl flex justify-between items-center text-xs font-bold shadow-sm border border-[#133E87]/20 bg-[#133E87]/10 text-[#133E87]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-[#C5A880]"></span>
                                  <strong className="text-[#133E87]">الوارد من:</strong> 
                                  <span className="text-[#133E87] font-black border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingFrom || "—"}</span>
                                </span>
                                <span><strong className="text-[#133E87]">برقم:</strong> <span className="text-[#133E87] font-black border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingNumber || "—"}</span></span>
                                <span><strong className="text-[#133E87]">بتاريخ:</strong> <span className="text-[#133E87] font-black border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingDate || "—"}</span></span>
                              </div>
                            </div>

                            {/* متن التعميم / الموضوع الرئيسي - بطاقة زجاجية عائمة */}
                            <div 
                              className="mx-8 my-3 py-8 px-8 text-center flex-1 flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden"
                              style={{ 
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
                                backdropFilter: 'blur(12px)'
                              }}
                            >
                              <div className="text-sm sm:text-base md:text-lg sm:text-xl md:text-2xl font-black text-[#0B2545] leading-relaxed max-w-[700px] mx-auto z-10">
                                {circularSubject || "—"}
                              </div>
                            </div>

                            {/* 5. التذييل: المرفقات أعلى بيانات التواصل */}
                            <div className="mx-8 mb-4 mt-1 pt-3 border-t border-slate-200/80 flex flex-col gap-2.5 sm:gap-3 md:gap-4 shrink-0">
                              {/* المرفقات (بالأعلى) */}
                              <div className="flex items-center gap-2.5 w-full">
                                <span className="text-[11px] font-black text-[#133E87] uppercase tracking-wider bg-[#133E87]/10 px-3 py-1.5 rounded-lg border border-[#133E87]/20">
                                  المرفقات
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a 
                                    href={getAttachmentUrl(circularMainFile)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                  >
                                    📎 {circularAttachmentName || "المرفق الأساسي"}
                                  </a>
                                  {circularAtt1 && (
                                    <a 
                                      href={getAttachmentUrl(circularAtt1)} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 hover:bg-blue-100 transition-all shadow-sm"
                                    >
                                      📎 مرفق 1
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* بيانات التواصل (بالأسفل) */}
                              <div className="flex items-center justify-between w-full bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-full bg-[#133E87]/10 flex items-center justify-center text-[#133E87]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                  </span>
                                  <div>
                                    <span className="text-[10px] font-bold text-gray-500 block mb-0.5">للاستفسار والتواصل</span>
                                    <span className="text-xs font-black text-gray-900">{circularContactName || "—"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5" dir="ltr">
                                  {circularContactEmail && (
                                    <a 
                                      href={`mailto:${circularContactEmail}`} 
                                      className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#133E87] flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                      ✉️ {circularContactEmail}
                                    </a>
                                  )}
                                  {circularContactPhone && (
                                    <a 
                                      href={`tel:${circularContactPhone}`} 
                                      className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#133E87] flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                      📞 {circularContactPhone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* شريط سفلي نحيف */}
                            <div className="h-1 w-full bg-[#133E87] shrink-0"></div>
                            </div>

                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-gray-200/80 p-4 sm:p-8 rounded-xl overflow-y-auto flex justify-center h-[70vh]">
                        <div className="bg-white shadow-xl border border-gray-300 w-full max-w-[21cm] min-h-[29.7cm] flex flex-col mx-auto shrink-0 transition-all">
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setAiGenGeneratedText(e.currentTarget.innerText)}
                            className="flex-1 w-full p-12 sm:p-16 text-[16px] leading-[2.2] text-justify font-sans focus:outline-none bg-transparent whitespace-pre-wrap outline-none"
                          >
                            {aiGenGeneratedText}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: المعاينة النهائية والتصدير المباشر لبطاقة التعميم (A4 Landscape الدقيقة) */}
                {aiGenStep === 4 && workspaceService === "circular" && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        المعاينة النهائية لبطاقة التعميم (جاهزة للطباعة والتصدير كـ PDF بالنمط الملكي الزجاجي)
                      </h3>
                    </div>
                    
                    <div className="flex-1 bg-slate-300/80 rounded-xl sm:rounded-2xl overflow-hidden flex justify-center items-center min-h-[75vh] border border-gray-300 relative">
                      <div className="scale-[0.55] xl:scale-[0.65] 2xl:scale-[0.80] origin-center">
                        <div 
                          ref={circularPrintRef}
                          className="w-[1123px] h-[794px] min-w-[1123px] min-h-[794px] max-h-[794px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden relative shrink-0 flex flex-col justify-between font-sans"
                        style={{ 
                          boxSizing: 'border-box',
                          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #FAF8F5 100%)',
                          border: '1px solid rgba(197, 168, 128, 0.35)',
                          boxShadow: '0 25px 50px -12px rgba(11, 37, 69, 0.15)'
                        }}
                        dir="rtl"
                      >
                        {/* 1. الشريط العلوي الفخم المتدرج */}
                        <div className="h-3 w-full shrink-0" style={{ background: 'linear-gradient(90deg, #0B2545 0%, #133E87 35%, #C5A880 50%, #133E87 65%, #0B2545 100%)' }}></div>

                        {/* 2. الترويسة الرسمية المغلفة بشريط كامل */}
                        <div className="px-12 pt-7 pb-3 shrink-0">
                          <div 
                            className="flex justify-between items-center px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/90"
                            style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}
                          >
                            {/* اليمين: ملصق تعميم الغرفة */}
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-[#133E87] mb-2 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                                <span>رقم التعميم:</span>
                                <span className="text-gray-900 font-black tracking-wider text-base border-b border-dashed border-gray-400 pb-0.5">{circularOutNumber || "—"}</span>
                              </div>
                              <div className="text-sm font-extrabold text-[#133E87] flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A880]"></span>
                                <span>تاريـــــــخه:</span>
                                <span className="text-gray-900 font-black tracking-wider text-base border-b border-dashed border-gray-400 pb-0.5">{circularOutDate || "—"}</span>
                              </div>
                            </div>

                            {/* الوسط: كلمة تـعـمـيـم بخط الصفحة */}
                            <div className="text-center relative">
                              <h1 className="text-6xl text-[#133E87] font-black tracking-widest leading-none">
                                تـعـمـيـم
                              </h1>
                              <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#C5A880] to-transparent mx-auto mt-4 rounded-full"></div>
                              
                              {circularTypes.length > 0 && circularTypes.some(t => t !== "عادي") && (
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex justify-center gap-2 w-full">
                                  {circularTypes.filter(t => t !== "عادي").map(t => (
                                    <span key={t} className="px-3 py-1 rounded-md border-2 border-red-600 text-red-600 text-[13px] font-black tracking-widest bg-white">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* اليسار: شعار غرفة مكة المكرمة (الشعار فقط) */}
                            <div className="flex items-center justify-end">
                              <div className="w-28 h-24 flex items-center justify-center shrink-0">
                                <img
                                  src={logoBase64}
                                  alt="شعار غرفة مكة"
                                  className="w-full h-full object-contain scale-125"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. شريط الوارد والمرجعية */}
                        <div className="mx-12 my-2 shrink-0 mt-8">
                          <div className="px-8 py-3.5 rounded-xl sm:rounded-2xl flex justify-between items-center text-sm shadow-sm border border-[#133E87]/20 bg-[#133E87]/10 text-[#133E87]">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-[#C5A880] bg-[#133E87]/10 px-2.5 py-1 rounded-lg">وارد من</span>
                              <span className="font-black text-[#133E87] border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingFrom || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">برقم:</span>
                              <span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingNumber || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500">بتاريخ:</span>
                              <span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-[#133E87]/40 pb-0.5">{circularIncomingDate || "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. متن التعميم / الموضوع الرئيسي - بطاقة زجاجية فخمة */}
                        <div 
                          className="flex-1 flex flex-col justify-center items-center px-16 py-3 sm:py-4 md:py-6 mx-12 my-2 rounded-xl sm:rounded-2xl relative overflow-hidden shrink-0 border border-slate-200/90 shadow-sm"
                          style={{ 
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%)',
                            backdropFilter: 'blur(16px)'
                          }}
                        >
                          <div className="text-center text-base sm:text-lg md:text-xl sm:text-2xl md:text-3xl font-black text-[#0B2545] leading-relaxed max-w-[920px] z-10">
                            {circularSubject || "—"}
                          </div>
                        </div>

                        {/* 5. التذييل: المرفقات أعلى بيانات التواصل */}
                        <div className="mx-12 mb-6 mt-2 pt-4 border-t border-slate-200/80 flex flex-col gap-2.5 sm:gap-4 md:gap-5 shrink-0">
                          {/* المرفقات (بالأعلى) */}
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-sm font-black text-[#133E87] uppercase tracking-wider bg-[#133E87]/10 px-4 py-2 rounded-xl border border-[#133E87]/20">
                              المرفقات
                            </span>
                            <div className="flex items-center gap-3 flex-wrap">
                              <a 
                                href={getAttachmentUrl(circularMainFile)} 
                                data-pdf-link={getAttachmentUrl(circularMainFile)} data-pdf-link-id="main" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                              >
                                📎 {circularAttachmentName || "المرفق الأساسي"}
                              </a>
                              {circularAtt1 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt1)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt1)} data-pdf-link-id="att1" 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 1
                                </a>
                              )}
                              {circularAtt2 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt2)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt2)} data-pdf-link-id="att2" 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 2
                                </a>
                              )}
                              {circularAtt3 && (
                                <a 
                                  href={getAttachmentUrl(circularAtt3)} 
                                  data-pdf-link={getAttachmentUrl(circularAtt3)} data-pdf-link-id="att3" 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] px-4 py-2 rounded-xl text-sm font-extrabold flex items-center gap-2 hover:bg-blue-100 transition-all shadow-sm"
                                >
                                  📎 مرفق إضافي 3
                                </a>
                              )}
                            </div>
                          </div>

                          {/* بيانات التواصل (بالأسفل) */}
                          <div className="flex items-center justify-between w-full bg-slate-50/80 p-4 rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-full bg-[#133E87]/10 flex items-center justify-center text-[#133E87]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              </span>
                              <div>
                                <span className="text-xs font-bold text-gray-500 block mb-0.5">للاستفسار والتواصل</span>
                                <span className="text-sm font-black text-gray-900">{circularContactName || "—"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3" dir="ltr">
                              {circularContactEmail && (
                                <a 
                                  href={`mailto:${circularContactEmail}`} 
                                  data-pdf-link={`mailto:${circularContactEmail}`} 
                                  className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-[#133E87] flex items-center gap-2 shadow-sm transition-all"
                                >
                                  ✉️ {circularContactEmail}
                                </a>
                              )}
                              {circularContactPhone && (
                                <a 
                                  href={`tel:${circularContactPhone}`} 
                                  data-pdf-link={`tel:${circularContactPhone}`} 
                                  className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-[#133E87] flex items-center gap-2 shadow-sm transition-all"
                                >
                                  📞 {circularContactPhone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 6. شريط سفلي نحيف */}
                        <div className="h-1.5 w-full bg-[#133E87] shrink-0"></div>

                      </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* أزرار التحكم السفلية بالمعالج */}
              <div className="p-3 sm:p-4 md:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0 rounded-b-3xl">
                <div>
                  {aiGenStep > 1 && !isAIGenGenerating && (
                    <button
                      onClick={() => setAiGenStep(aiGenStep - 1)}
                      className="px-3 sm:px-4 md:px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" /> رجوع
                    </button>
                  )}
                </div>

                {aiGenStep === 2 && !isAIGenGenerating && (
                  <button
                    onClick={() => setAiGenStep(3)}
                    className="px-3 sm:px-4 md:px-6 py-2.5 bg-white border border-gray-200 text-[#133E87] rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    التالي (تعبئة يدوية) <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                
                {aiGenStep === 3 && workspaceService === "circular" && (
                  <button
                    onClick={() => setAiGenStep(4)}
                    className="px-7 py-2.5 bg-[#133E87] text-white rounded-xl text-sm font-bold hover:bg-[#0B2545] transition-colors flex items-center gap-2 shadow-md"
                  >
                    معاينة التصميم النهائي المعتمد <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {aiGenStep === 4 && workspaceService === "circular" && (
                  <div className="flex flex-col md:flex-row items-center gap-2.5 sm:gap-3 md:gap-4 w-full">                    <div className="flex-1"></div>
                    <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-3 sm:px-4 md:px-6 py-2.5 bg-[#133E87] text-white rounded-xl text-sm font-bold hover:bg-[#0B2545] transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Download className="w-4 h-4" /> تصدير PDF
                    </button>
                    <button
                      onClick={saveAIGeneratedLetter} disabled={isSavingAIGen} className={`px-3 sm:px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md ${isSavingAIGen ? "bg-gray-400 text-white cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                     
                    >
                      <Check className="w-4 h-4" /> حفظ وأرشفة بالدرايف
                    </button>
                  </div>
                  </div>
                )}

                {aiGenStep === 3 && workspaceService !== "circular" && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveAIGeneratedLetter} disabled={isSavingAIGen} className={`px-3 sm:px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-md ${isSavingAIGen ? "bg-gray-400 text-white cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                     
                    >
                      <Check className="w-4 h-4" /> حفظ وأرشفة بالدرايف
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}