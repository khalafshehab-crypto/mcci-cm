import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  FileText, Search, Plus, X, Trash2, Edit2, LayoutGrid, List, AlertTriangle, Check, BookOpen, Clock, Settings, Copy, ChevronDown, ChevronUp, CheckCircle2, FileSpreadsheet, Paperclip, ChevronLeft, Download, Library as LibraryIcon, ExternalLink, Share2, Mail, FileJson, Presentation, RefreshCw, Send
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

export default function Library() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "templates"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTemplates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
      description: "صيغة معتمدة من الإدارة للرد على المطالبات والتوصيات من اللجان.",
      type: "مستندات",
      creator: "باسم شهاب الدين",
      cloudUrl: "https://docs.google.com/document/d/example",
      downloadUrl: "#",
      lastUpdated: "2026-06-12",
      isFavorite: true
    },
    {
      id: "pres-1",
      title: "عرض إنجازات الربع الأول للجنة القطاعية",
      description: "قالب عرض تقديمي يتضمن تصاميم إحصائية للمؤشرات والمعايير المتفق عليها.",
      type: "عروض تقديمية",
      creator: "أ. هشام عريف",
      cloudUrl: "https://docs.google.com/presentation/d/example",
      downloadUrl: "#",
      lastUpdated: "2026-06-10",
      isFavorite: false
    },
    {
      id: "sheet-1",
      title: "سجل حصر مهام وتوصيات اللجان",
      description: "جداول لتتبع أعمال الأخصائيين متصلة بمنظومة مؤشرات الأداء الأساسية.",
      type: "جداول بيانات",
      creator: "موفق سندي",
      cloudUrl: "https://docs.google.com/spreadsheets/d/example",
      downloadUrl: "#",
      lastUpdated: "2026-06-05",
      isFavorite: true
    },
    {
      id: "email-1",
      title: "إشعار دعوة أعضاء اللجنة للاجتماع الأول",
      description: "نص البريد السريع لإشعار الأعضاء باللقاء الأول، يتضمن جدول الأعمال.",
      type: "بريد إلكتروني",
      creator: "أ. عمار العمودي",
      cloudUrl: "https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1",
      downloadUrl: "#",
      lastUpdated: "2026-06-14",
      isFavorite: false
    }
  ];

  const [deletedTemplateIds, setDeletedTemplateIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("app_deleted_templates");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const displayedTemplates = (templates.length > 0 ? templates : (isLoadingTemplates ? [] : fallbackTemplates))
    .filter(t => !deletedTemplateIds.includes(t.id));

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filteredTemplates = displayedTemplates.filter(t => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (searchQuery && !t.title.includes(searchQuery) && !t.description.includes(searchQuery) && !t.creator.includes(searchQuery)) return false;
    return true;
  });

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<TemplateItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<TemplateItem["type"]>("مستندات");
  const [formCloudUrl, setFormCloudUrl] = useState("");
  const [formIsSaving, setFormIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TemplateItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Share form state
  const [shareEmail, setShareEmail] = useState("");

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormIsSaving(true);
    try {
      await addDoc(collection(db, "templates"), {
        title: formTitle,
        description: formDesc,
        type: formType,
        creator: "أخصائي الحوكمة",
        cloudUrl: formCloudUrl,
        downloadUrl: "#",
        lastUpdated: new Date().toISOString().split("T")[0],
        isFavorite: false
      });
      setIsAddOpen(false);
      setFormTitle("");
      setFormDesc("");
      setFormType("مستندات");
      setFormCloudUrl("");
    } catch (e) {
      console.error(e);
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
        localStorage.setItem("app_deleted_templates", JSON.stringify(newDeletedIds));
      } catch (e) {}

      await addDoc(collection(db, "system_logs"), {
        type: "حذف قالب",
        details: `تم حذف قالب '${deleteTarget.title}' بواسطة المستخدم. السبب: ${deleteReason}`,
        status: "ناجحة",
        timestamp: new Date().toISOString()
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
      case "مستندات": return <FileText className="w-5 h-5 text-blue-600" />;
      case "عروض تقديمية": return <Presentation className="w-5 h-5 text-amber-500" />;
      case "جداول بيانات": return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "بريد إلكتروني": return <Mail className="w-5 h-5 text-red-500" />;
      default: return <FileJson className="w-5 h-5 text-gray-600" />;
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
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans">المكتبة الرقمية للقوالب</h1>
          </div>
          <p className="text-gray-500 mt-2 text-sm font-medium pr-12">
            توفير قوالب مصنفة ومتصلة بمساحة Google Workspace لتسهيل عمل الأخصائيين وتسريع الإنجاز.
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
                typeFilter === "all" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="الكل"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("مستندات")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "مستندات" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="مستندات"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("عروض تقديمية")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "عروض تقديمية" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="عروض تقديمية"
            >
              <Presentation className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("جداول بيانات")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "جداول بيانات" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="جداول بيانات"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTypeFilter("بريد إلكتروني")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                typeFilter === "بريد إلكتروني" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                viewMode === "cards" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="بطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="سجل"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button 
            type="button"
            onClick={() => setIsAddOpen(true)}
             className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
             <Plus className="w-4 h-4 stroke-[2.5]" />
             <span>تكوين قالب جديد</span>
          </button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {filteredTemplates.length === 0 ? (
           <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#e8e4e4] rounded-2xl border border-dashed border-gray-300">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-4 transform -rotate-2">
               <Search className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-extrabold text-gray-800">لا توجد قوالب متطابقة</h3>
             <p className="text-gray-500 mt-1 max-w-md font-medium text-sm">جرّب تغيير كلمات البحث أو فئة الفلترة للعثور على القوالب.</p>
           </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map(t => (
              <div
                key={t.id}
                className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Indicator */}
                <div className={`absolute top-0 right-0 w-1.5 h-full ${
                  t.type === "مستندات" ? "bg-blue-500" :
                  t.type === "عروض تقديمية" ? "bg-amber-400" :
                  t.type === "جداول بيانات" ? "bg-emerald-500" :
                  t.type === "بريد إلكتروني" ? "bg-red-400" : "bg-gray-500"
                }`}></div>

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
                        onClick={() => { setTemplateToShare(t); setIsShareOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow"
                        title="مشاركة سريعة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-lg mb-1.5 line-clamp-2">{t.title}</h3>
                  <p className="text-xs font-semibold text-gray-500 line-clamp-2 leading-relaxed mb-4">{t.description}</p>
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
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
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
                    <th className="py-4 px-5 whitespace-nowrap">اسم القالب المرجعي</th>
                    <th className="py-4 px-5 whitespace-nowrap">الوصف</th>
                    <th className="py-4 px-5 whitespace-nowrap">المنشئ</th>
                    <th className="py-4 px-5 text-center whitespace-nowrap">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {filteredTemplates.map((t) => (
                    <tr key={t.id} className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800">
                      <td className="py-4 px-5 font-bold">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-100 inline-flex items-center justify-center">
                          {getIconForType(t.type)}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-gray-900">{t.title}</td>
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
                             className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors border border-transparent shadow-sm hover:shadow"
                             title="تحميل مباشر"
                           >
                             <Download className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => { setTemplateToShare(t); setIsShareOpen(true); }}
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
               className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
             >
               <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                 <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                   تأصيل قالب رقمي
                 </h2>
                 <button 
                   onClick={() => setIsAddOpen(false)}
                   className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">اسم القالب المرجعي</label>
                   <input required type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all placeholder:text-gray-400 font-medium" placeholder="مثال: مسودة محضر اللجان" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">وصف القالب السريع</label>
                   <textarea rows={2} required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all resize-none font-medium text-sm" placeholder="استخدام هذا القالب لتوحيد كتابة المحاضر..." />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">تصنيف نوعيات القالب</label>
                   <select value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all font-semibold text-gray-700">
                     <option value="مستندات">مستندات Google Docs / Word</option>
                     <option value="عروض تقديمية">عروض تقديمية Slides / PPT</option>
                     <option value="جداول بيانات">جداول تفاعلية Sheets / Excel</option>
                     <option value="بريد إلكتروني">مراسلات إلكترونية Email</option>
                     <option value="أخرى">أخرى</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">رابط الارتباط السحابي (Google Workspace)</label>
                   <input required type="url" value={formCloudUrl} onChange={e => setFormCloudUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0ea5e9] text-left font-sans focus:ring-1 focus:ring-[#0ea5e9] outline-none transition-all" placeholder="https://docs.google.com/..." dir="ltr" />
                 </div>

                 <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                   <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">إلغاء</button>
                   <button disabled={formIsSaving} type="submit" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#121212] hover:bg-black flex items-center gap-2 shadow-sm transition-all disabled:opacity-70">
                     {formIsSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                     تأكيد حفظ المعيار
                   </button>
                 </div>
               </form>
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
                   <p className="text-xs font-bold text-gray-500 text-center mb-1">القالب المحدد:</p>
                   <p className="text-sm font-extrabold text-gray-800 text-center">{templateToShare.title}</p>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني للزميل</label>
                   <input required type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 text-left font-sans focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400" placeholder="name@makkahchamber.sa" dir="ltr" />
                 </div>

                 <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all mt-2">
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
               <p className="text-sm text-slate-500 mb-4">الرجاء إدخال سبب الحذف لتأكيد العملية:</p>
               
               <input 
                 autoFocus
                 type="text" 
                 value={deleteReason}
                 onChange={(e) => setDeleteReason(e.target.value)}
                 onKeyDown={(e) => { 
                   if (e.key === 'Enter') confirmDelete();
                   if (e.key === 'Escape') setDeleteTarget(null);
                 }}
                 className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all mb-5 text-sm"
                 placeholder="سبب الحذف مطلوب..."
               />
               
               <div className="flex justify-end gap-3">
                 <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">إلغاء</button>
                 <button disabled={formIsSaving || !deleteReason.trim()} onClick={confirmDelete} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                   {formIsSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
