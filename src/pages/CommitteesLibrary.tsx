import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import GoogleWorkspaceCenter from "../components/GoogleWorkspaceCenter";
import {
  FileText,
  Search,
  Plus,
  X,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  AlertTriangle,
  Check,
  BookOpen,
  Clock,
  Settings,
  Copy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileSpreadsheet,
  Paperclip,
  ChevronLeft,
  Download,
  Library as LibraryIcon,
  ExternalLink,
  Share2,
  Mail,
  FileJson,
  Presentation,
  RefreshCw,
  Send,
  Upload,
} from "lucide-react";

export interface TemplateItem {
  id: string;
  title: string;
  description: string;
  type: "مستندات" | "عروض تقديمية" | "جداول بيانات" | "بريد إلكتروني" | "أخرى";
  creator: string;
  cloudUrl: string;
  downloadUrl: string;
  lastUpdated: string;
  isFavorite: boolean;
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
    return () => unsubscribe();
  }, []);

  const fallbackTemplates: TemplateItem[] = [
    {
      id: "doc-1",
      title: "قالب الرد الرسمي على المخاطبات الدورية",
      description:
        "صيغة معتمدة من الإدارة للرد على المطالبات والتوصيات من اللجان.",
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
      description:
        "قالب عرض تقديمي يتضمن تصاميم إحصائية للمؤشرات والمعايير المتفق عليها.",
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
      description:
        "جداول لتتبع أعمال الأخصائيين متصلة بمنظومة مؤشرات الأداء الأساسية.",
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
      description:
        "نص البريد السريع لإشعار الأعضاء باللقاء الأول، يتضمن جدول الأعمال.",
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
  ).filter((t) => !deletedTemplateIds.includes(t.id));

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredTemplates = displayedTemplates.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (
      searchQuery &&
      !t.title.includes(searchQuery) &&
      !t.description.includes(searchQuery) &&
      !t.creator.includes(searchQuery)
    )
      return false;
    return true;
  });

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<TemplateItem | null>(
    null,
  );

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<TemplateItem["type"]>("مستندات");
  const [formCloudUrl, setFormCloudUrl] = useState("");
  const [formIsSaving, setFormIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Share form state
  const [shareEmail, setShareEmail] = useState("");

  // Import / Export advanced state additions
  const [modalTab, setModalTab] = useState<"import" | "export">("import");
  const [importSource, setImportSource] = useState<"drive" | "computer">(
    "drive",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState("");
  const [exportSelectedIds, setExportSelectedIds] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);

    // Fill title if empty
    if (!formTitle) {
      const nameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setFormTitle(nameWithoutExt);
    }

    // Guess type from extension
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

    // Read to Data URL for preservation / direct local download
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadTemplate = (t: TemplateItem) => {
    // If it's a real file we uploaded, it has a valid Data URL
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

    // Otherwise, generate an elegant text-based template file containing info
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
      `${t.title.replace(/\s+/g, "_")}_قالب_مرجعي.txt`,
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

    let csvContent = "\uFEFF"; // BOM for Arabic support
    csvContent +=
      "المسلسل,اسم القالب المرجعي,الوصف,التصنيف,المنشئ,الرابط السحابي,آخر تحديث\n";

    targets.forEach((t, index) => {
      const cleanTitle = t.title.replace(/"/g, '""');
      const cleanDesc = t.description.replace(/"/g, '""');
      const cleanCreator = t.creator.replace(/"/g, '""');
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
    activeCommitteesCount: committees.filter((c) => c.status === "فعالة")
      .length,
    membersCount: 0,
    recommendationsCount: 0,
    tasksCount: 0,
    committees: committees.map((c) => ({
      id: c.id,
      name: c.name,
      president: c.president || "أ. خالد الزهراني",
      specialist: c.specialist || "أخصائي حوكمة اللجان",
      strategicPlan:
        c.strategicPlan || "الخطة التشغيلية المعتمدة لتمكين الأعمال",
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

      await addDoc(collection(db, "templates"), {
        title: formTitle,
        description: formDesc,
        type: formType,
        creator: "أخصائي الحוكمة",
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
    // Simulate sending email
    console.log("Shared", templateToShare?.title, "with", shareEmail);
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
      default:
        return <FileJson className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-16 text-right">
      {/* -------------------- Page Action Header -------------------- */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/80 text-[#0ea5e9] rounded-xl border border-blue-200">
              <LibraryIcon className="w-7 h-7 text-[#0ea5e9]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans">
              المكتبة الرقمية للقوالب
            </h1>
          </div>
          <p className="text-gray-500 mt-2 text-sm font-medium pr-12">
            توفير قوالب مصنفة ومتصلة بمساحة Google Workspace لتسهيل عمل
            الأخصائيين وتسريع الإنجاز.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end shrink-0 w-full md:w-auto">
          {/* Search Input */}
          <div className="flex items-center gap-2 relative">
            <div className="relative w-full lg:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قالب..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold placeholder-gray-400 text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
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
            className={`h-10 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto ${
              showWorkspaceCenter
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${showWorkspaceCenter ? "animate-spin" : ""}`}
            />
            <span>
              {showWorkspaceCenter
                ? "إغلاق بوابة Google Workspace"
                : "ربط ومزامنة Google Workspace 🌐"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>زر استيراد وتصدير النماذج الجهازة</span>
          </button>
        </div>
      </div>

      {/* -------------------- Unified Google Workspace Integration Center -------------------- */}
      <AnimatePresence>
        {showWorkspaceCenter && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-gray-250 shadow-lg p-5 print:hidden space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  البوابة السحابية الموحدة وتكامل قوالب اللجان
                </h3>
                <p className="text-[10.5px] text-gray-400 mt-0.5">
                  تتبع الاتصال بجميع قنوات Google العشرة وإدارة أرشفة واعتلاء
                  المستندات الرقمية
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
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#e8e4e4] rounded-2xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-4 transform -rotate-2">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-800">
              لا توجد قوالب متطابقة
            </h3>
            <p className="text-gray-500 mt-1 max-w-md font-medium text-sm">
              جرّب تغيير كلمات البحث أو فئة الفلترة للعثور على القوالب.
            </p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Indicator */}
                <div
                  className={`absolute top-0 right-0 w-1.5 h-full ${
                    t.type === "مستندات"
                      ? "bg-blue-500"
                      : t.type === "عروض تقديمية"
                        ? "bg-amber-400"
                        : t.type === "جداول بيانات"
                          ? "bg-emerald-500"
                          : t.type === "بريد إلكتروني"
                            ? "bg-red-400"
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
                        onClick={() => handleDeleteTemplate(t)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm hover:shadow"
                        title="حذف القالب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTemplateToShare(t);
                          setIsShareOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                        title="مشاركة سريعة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-lg mb-1.5 line-clamp-2">
                    {t.title}
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {t.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white/60 p-2 rounded-lg border border-gray-200/50">
                    <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] uppercase font-black tracking-wider shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]">
                      {t.creator.substring(0, 2)}
                    </span>
                    صانع القالب: {t.creator}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                    <a
                      href={t.cloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-extrabold transition-colors border border-blue-200 shadow-sm"
                    >
                      فتح سحابي
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDownloadTemplate(t)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-750 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                      title="تحميل النموذج مباشرة"
                    >
                      تحميل
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="box-border border border-gray-200 rounded-2xl overflow-hidden bg-[#e8e4e4] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-[#dfdada] text-gray-700 font-extrabold text-sm border-b border-gray-300">
                  <tr>
                    <th className="py-4 px-5 whitespace-nowrap w-12">النوع</th>
                    <th className="py-4 px-5 whitespace-nowrap">
                      اسم القالب المرجعي
                    </th>
                    <th className="py-4 px-5 whitespace-nowrap">الوصف</th>
                    <th className="py-4 px-5 whitespace-nowrap">المنشئ</th>
                    <th className="py-4 px-5 text-center whitespace-nowrap">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {filteredTemplates.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800"
                    >
                      <td className="py-4 px-5 font-bold">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 inline-flex items-center justify-center">
                          {getIconForType(t.type)}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-gray-900">
                        {t.title}
                      </td>
                      <td className="py-4 px-5 text-gray-500 text-xs w-1/3 leading-relaxed">
                        <span className="line-clamp-1">{t.description}</span>
                      </td>
                      <td className="py-4 px-5 font-black text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] uppercase font-black tracking-wider">
                            {t.creator.substring(0, 2)}
                          </span>
                          {t.creator}
                        </div>
                      </td>
                      <td className="py-4 px-5">
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
                            onClick={() => {
                              setTemplateToShare(t);
                              setIsShareOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                            title="مشاركة سريعة"
                          >
                            <Share2 className="w-4 h-4" />
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

      {/* Add Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
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
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  إدارة واستيراد وتصدير النماذج الجاهزة
                </h2>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab selector */}
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
                  className="p-6 overflow-y-auto space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      اسم القالب المرجعي
                    </label>
                    <input
                      required
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all placeholder:text-gray-400 font-medium"
                      placeholder="مثال: مسودة محضر اللجان"
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
                      placeholder="استخدام هذا القالب لتوحيد كتابة المحاضر..."
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
                      <option value="مستندات">
                        مستندات Google Docs / Word
                      </option>
                      <option value="عروض تقديمية">
                        عروض تقديمية Slides / PPT
                      </option>
                      <option value="جداول بيانات">
                        جداول تفاعلية Sheets / Excel
                      </option>
                      <option value="بريد إلكتروني">
                        مراسلات إلكترونية Email
                      </option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div>
                    {importSource === "computer" ? (
                      <div className="space-y-4 text-right" dir="rtl">
                        <div className="border border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-500 transition-all text-center relative bg-slate-50 cursor-pointer">
                          <input
                            type="file"
                            required={!uploadedFile}
                            onChange={handleFileChange}
                            accept=".docx,.doc,.xls,.xlsx,.csv,.ppt,.pptx,.pdf,.txt"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[15]"
                          />
                          <div className="space-y-1">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mx-auto">
                              <Upload className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs font-bold text-gray-800">
                              اسحب ملف النموذج أو انقر لتصفح جهازك
                            </p>
                            <p className="text-[10px] text-gray-400">
                              يدعم ملفات Word, Excel, PowerPoint, PDF و CSV
                            </p>
                          </div>
                        </div>

                        {uploadedFile && (
                          <div className="bg-emerald-50 border border-emerald-150/60 rounded-xl p-2.5 flex justify-between items-center text-xs text-emerald-800 font-bold animate-fadeIn">
                            <div className="flex gap-2 items-center">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="line-clamp-1">
                                {uploadedFile.name} (
                                {(uploadedFile.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedFile(null);
                                setUploadedFileDataUrl("");
                              }}
                              className="p-1 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-[10px] cursor-pointer"
                            >
                              حذف القالب ✕
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <input
                          required
                          type="url"
                          value={formCloudUrl}
                          onChange={(e) => setFormCloudUrl(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] text-left font-sans focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all text-xs"
                          placeholder="https://docs.google.com/..."
                          dir="ltr"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-5 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      disabled={formIsSaving}
                      type="submit"
                      className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#121212] hover:bg-black flex items-center gap-2 shadow-sm transition-all disabled:opacity-70"
                    >
                      {formIsSaving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      تأكيد حفظ المعيار
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 overflow-y-auto space-y-4">
                  <p
                    className="text-xs text-gray-500 font-bold leading-relaxed border-r-2 border-blue-500 pr-2.5 text-right font-sans"
                    dir="rtl"
                  >
                    حدد النماذج التي تود تصديرها من القائمة أدناه، ثم اختر صيغة
                    الملف المناسبة لتحميلها مباشرة:
                  </p>

                  <div
                    className="border border-gray-200 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-gray-100 bg-slate-50 p-1.5 text-right font-sans"
                    dir="rtl"
                  >
                    {templates.map((t) => {
                      const isChecked = exportSelectedIds.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            if (isChecked) {
                              setExportSelectedIds(
                                exportSelectedIds.filter((id) => id !== t.id),
                              );
                            } else {
                              setExportSelectedIds([
                                ...exportSelectedIds,
                                t.id,
                              ]);
                            }
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
                            <p className="text-xs font-black text-gray-900">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              التصنيف: {t.type} • الكاتب: {t.creator}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="flex gap-2 justify-between items-center text-xs border-b border-gray-100 pb-2 text-right font-sans"
                    dir="rtl"
                  >
                    <span className="font-extrabold text-blue-700">
                      النماذج المختارة: {exportSelectedIds.length} من{" "}
                      {templates.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExportSelectedIds(templates.map((t) => t.id))
                        }
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportSelectedIds([])}
                        className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        تصفير التحديد
                      </button>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-2 gap-3 pt-1 text-right font-sans"
                    dir="rtl"
                  >
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center text-center shadow gap-1.5 transition-all text-xs font-bold group cursor-pointer"
                    >
                      <FileJson className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                      <span>تصدير كأرشيف JSON</span>
                      <span className="text-[9px] text-gray-400 font-normal">
                        للنسخ الاحتياطي العام للغرفة
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex flex-col items-center justify-center text-center shadow gap-1.5 transition-all text-xs font-bold group cursor-pointer"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
                      <span>تصدير جدول بيانات CSV</span>
                      <span className="text-[9px] text-emerald-200 font-normal font-sans">
                        لاستيراده ببرامج Excel و Numbers
                      </span>
                    </button>
                  </div>

                  <div
                    className="pt-2 flex justify-end text-right font-sans"
                    dir="rtl"
                  >
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(false)}
                      className="px-5 py-2 hover:bg-gray-100 rounded-xl text-xs font-extrabold text-gray-500 cursor-pointer"
                    >
                      إغلاق النافذة
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareOpen && templateToShare && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
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
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm relative z-10 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  إرسال قالب عبر البريد السريع
                </h2>
                <button
                  onClick={() => setIsShareOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleShareSubmit} className="p-5 space-y-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 text-center mb-1">
                    القالب المحدد:
                  </p>
                  <p className="text-sm font-extrabold text-gray-800 text-center">
                    {templateToShare.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    البريد الإلكتروني للزميل
                  </label>
                  <input
                    required
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 text-left font-sans focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="name@makkahchamber.sa"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
                >
                  <Send className="w-4 h-4" />
                  إرسال سريع للموظف
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm relative z-10 overflow-hidden flex flex-col p-6"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2 whitespace-normal break-words">
                حذف القالب "{deleteTarget.title}"
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                الرجاء إدخال سبب الحذف لتأكيد العملية:
              </p>

              <input
                autoFocus
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmDelete();
                  if (e.key === "Escape") setDeleteTarget(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all mb-5 text-sm"
                placeholder="سبب الحذف مطلوب..."
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  disabled={formIsSaving || !deleteReason.trim()}
                  onClick={confirmDelete}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {formIsSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
