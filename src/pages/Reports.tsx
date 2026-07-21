import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from '../lib/firebase';
import { db } from '../lib/firebase';
import { 
  FileText, Search, Plus, X, Trash2, Edit2, LayoutGrid, List, AlertTriangle, Check, BookOpen, Clock, Activity, BarChart, FileBarChart, Filter, Settings, FileSpreadsheet, Download, RefreshCw, BarChart2
} from "lucide-react";

export interface ReportItem {
  id: string;
  title: string;
  periodType: "دورية" | "شهرية" | "ربع سنوية" | "نصف سنوية" | "سنوية";
  generationType: "عام" | "مخصص";
  generatedBy: string;
  date: string;
  startDate?: string;
  endDate?: string;
  status: "مكتمل" | "قيد المعالجة" | "مجدول";
  url?: string;
  notes?: string;
}

export interface KpiItem {
  id: string;
  indicator: string;
  standard: string;
  targetValue: string;
  achievedValue: string;
  period: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"reports" | "kpis">("reports");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [kpis, setKpis] = useState<KpiItem[]>([]);

  // Setup Firestore listeners
  useEffect(() => {
    const q = query(collection(db, "reports"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReportItem[];
      setReports(dbData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "kpis"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KpiItem[];
      setKpis(dbData);
    });
    return () => unsubscribe();
  }, []);

  // UI States for Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportItem | null>(null);
  const [editingKpi, setEditingKpi] = useState<KpiItem | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'report' | 'kpi', item: any} | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // Form State - Report
  const [repTitle, setRepTitle] = useState("");
  const [repPeriod, setRepPeriod] = useState<ReportItem["periodType"]>("شهرية");
  const [repGenType, setRepGenType] = useState<ReportItem["generationType"]>("عام");
  const [repStartDate, setRepStartDate] = useState("");
  const [repEndDate, setRepEndDate] = useState("");
  const [repNotes, setRepNotes] = useState("");

  // Form State - KPI
  const [kpiIndicator, setKpiIndicator] = useState("");
  const [kpiStandard, setKpiStandard] = useState("");
  const [kpiTarget, setKpiTarget] = useState("");
  const [kpiAchieved, setKpiAchieved] = useState("");
  const [kpiPeriod, setKpiPeriod] = useState("الربع الثاني 2026");
  const [kpiStartDate, setKpiStartDate] = useState("");
  const [kpiEndDate, setKpiEndDate] = useState("");
  const [kpiNotes, setKpiNotes] = useState("");

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (r.title || "").toLowerCase().includes(q) ||
           (r.generatedBy || "").toLowerCase().includes(q) ||
           (r.periodType || "").toLowerCase().includes(q) ||
           (r.generationType || "").toLowerCase().includes(q) ||
           (r.status || "").toLowerCase().includes(q) ||
           (r.notes || "").toLowerCase().includes(q) ||
           (r.date || "").toLowerCase().includes(q);
  });

  const filteredKpis = kpis.filter(k => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (k.indicator || "").toLowerCase().includes(q) ||
           (k.standard || "").toLowerCase().includes(q) ||
           (k.targetValue || "").toLowerCase().includes(q) ||
           (k.achievedValue || "").toLowerCase().includes(q) ||
           (k.period || "").toLowerCase().includes(q) ||
           (k.notes || "").toLowerCase().includes(q);
  });

  const resetReportForm = () => {
    setEditingReport(null);
    setRepTitle("");
    setRepPeriod("شهرية");
    setRepGenType("عام");
    setRepStartDate("");
    setRepEndDate("");
    setRepNotes("");
  };

  const resetKpiForm = () => {
    setEditingKpi(null);
    setKpiIndicator("");
    setKpiStandard("");
    setKpiTarget("");
    setKpiAchieved("");
    setKpiPeriod("الربع الثاني 2026");
    setKpiStartDate("");
    setKpiEndDate("");
    setKpiNotes("");
  };

  const handleReportEdit = (item: ReportItem) => {
    setEditingReport(item);
    setRepTitle(item.title);
    setRepPeriod(item.periodType);
    setRepGenType(item.generationType);
    setRepStartDate(item.startDate || "");
    setRepEndDate(item.endDate || "");
    setRepNotes(item.notes || "");
    setIsReportModalOpen(true);
  };

  const handleKpiEdit = (item: KpiItem) => {
    setEditingKpi(item);
    setKpiIndicator(item.indicator);
    setKpiStandard(item.standard);
    setKpiTarget(item.targetValue);
    setKpiAchieved(item.achievedValue);
    setKpiPeriod(item.period);
    setKpiStartDate(item.startDate || "");
    setKpiEndDate(item.endDate || "");
    setKpiNotes(item.notes || "");
    setIsKpiModalOpen(true);
  };

  const handleSaveReport = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const repData = {
      title: repTitle || "تقرير جديد",
      periodType: repPeriod,
      generationType: repGenType,
      generatedBy: "أخصائي الحوكمة", // Could be dynamic from user context
      date: new Date().toISOString().split("T")[0],
      startDate: repStartDate,
      endDate: repEndDate,
      status: "مكتمل",
      notes: repNotes,
    };
    try {
      if (editingReport) {
        await updateDoc(doc(db, "reports", editingReport.id), repData);
      } else {
        await addDoc(collection(db, "reports"), repData);
      }
      setIsReportModalOpen(false);
      resetReportForm();
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = (item: ReportItem) => {
    setDeleteTarget({ type: 'report', item });
    setDeleteReason("");
  };

  const handleSaveKpi = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      indicator: kpiIndicator,
      standard: kpiStandard,
      targetValue: kpiTarget,
      achievedValue: kpiAchieved,
      period: kpiPeriod,
      startDate: kpiStartDate,
      endDate: kpiEndDate,
      notes: kpiNotes,
    };
    try {
      if (editingKpi) {
        await updateDoc(doc(db, "kpis", editingKpi.id), data);
      } else {
        await addDoc(collection(db, "kpis"), data);
      }
      setIsKpiModalOpen(false);
      resetKpiForm();
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKpi = (item: KpiItem) => {
    setDeleteTarget({ type: 'kpi', item });
    setDeleteReason("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteReason.trim()) {
      alert("يجب إدخال سبب الحذف لإتمام العملية.");
      return;
    }

    setIsLoading(true);
    try {
      if (deleteTarget.type === 'report') {
        const item = deleteTarget.item as ReportItem;
        await deleteDoc(doc(db, "reports", item.id));
        await addDoc(collection(db, "system_logs"), {
          type: "حذف تقرير",
          details: `تم حذف تقرير '${item.title}' بواسطة المستخدم. السبب: ${deleteReason}`,
          status: "ناجحة",
          timestamp: new Date().toISOString()
        });
      } else {
        const item = deleteTarget.item as KpiItem;
        await deleteDoc(doc(db, "kpis", item.id));
        await addDoc(collection(db, "system_logs"), {
          type: "حذف مؤشر",
          details: `تم حذف مؤشر '${item.indicator}' بأمر من المستخدم. السبب: ${deleteReason}`,
          status: "ناجحة",
          timestamp: new Date().toISOString()
        });
      }
      setDeleteTarget(null);
      setDeleteReason("");
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "مكتمل") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "قيد المعالجة") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };
  
  return (
    <div className="space-y-6 pb-16 text-right">
      
      {/* -------------------- Page Action Header -------------------- */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-[#0ea5e9] rounded-xl border border-blue-200 shadow-sm">
              <BarChart2 className="w-7 h-7 text-[#0ea5e9]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans">بوابة التقارير والمؤشرات</h1>
          </div>
          <p className="text-gray-500 mt-2 text-sm font-medium pr-12">
            توليد التقارير الدورية وإدارة المؤشرات والمعايير بشكل متكامل
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end shrink-0 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="ابحث هنا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pr-10 pl-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                isSearchExpanded || searchQuery
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          <div className="relative flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm gap-1">
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "reports" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="سجل التقارير المستخرجة"
            >
              <FileBarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab("kpis")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "kpis" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="المؤشرات والمعايير المعتمدة"
            >
              <Activity className="w-4 h-4" />
            </button>

            <div className="w-[1px] bg-gray-200 my-1 mx-0.5" />

            {/* View Toggles */}
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "cards" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="عروض بطاقات"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              title="سجل"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            type="button"
            onClick={() => activeTab === "reports" ? setIsReportModalOpen(true) : setIsKpiModalOpen(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0 w-full lg:w-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{activeTab === "reports" ? "توليد تقرير جديد" : "إضافة مؤشر ومعيار"}</span>
          </button>
        </div>
      </div>

      <div className="min-h-[500px]">
        
        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {filteredReports.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center bg-[#e8e4e4] rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-4 transform -rotate-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-800">لا توجد تقارير حالياً</h3>
                <p className="text-gray-500 mt-1 max-w-md font-medium text-sm">يمكنك البدء بتوليد تقارير دورية أو مخصصة لمتابعة أداء الإدارة واللجان.</p>
              </div>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map(report => (
                  <div key={report.id} className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-[#0ea5e9]"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-white text-[#0ea5e9] rounded-xl border border-gray-100 shadow-sm">
                        <FileBarChart className="w-5 h-5" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleReportEdit(report)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteReport(report)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-extrabold text-gray-900 text-lg line-clamp-1">{report.title}</h3>
                    <p className="text-sm font-semibold text-gray-500 mt-1">بواسطة: {report.generatedBy}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-white text-gray-700 border border-gray-200 shadow-sm">
                        {report.periodType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                        {report.generationType}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      {report.startDate && report.endDate && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                          {report.startDate} - {report.endDate}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-200/60 flex items-center justify-between text-sm">
                      <div className="flex items-center font-bold text-gray-500 gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {report.date}
                      </div>
                      <button className="text-[#0ea5e9] font-black flex items-center gap-1.5 hover:text-blue-800 transition-colors bg-[#0ea5e9]/10 px-3 py-1.5 rounded-lg border border-[#0ea5e9]/20">
                        تحميل
                        <Download className="w-4 h-4" />
                      </button>
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
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">العنوان</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">الدورية</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">النوع</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">بواسطة</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">الحالة</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">تواريخ التقرير</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">تاريخ الإنشاء</th>
                        <th className="whitespace-nowrap py-4 px-5 text-center whitespace-nowrap">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800">
                          <td className="whitespace-nowrap py-4 px-5 font-bold flex items-center gap-2">
                             <FileBarChart className="w-4 h-4 text-[#0ea5e9]" />
                             {report.title}
                          </td>
                          <td className="whitespace-nowrap py-4 px-5 text-gray-600">{report.periodType}</td>
                          <td className="whitespace-nowrap py-4 px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                              {report.generationType}
                            </span>
                          </td>
                          <td className="whitespace-nowrap py-4 px-5 text-gray-600">{report.generatedBy}</td>
                          <td className="whitespace-nowrap py-4 px-5">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black border shadow-sm ${getStatusColor(report.status)}`}>
                                {report.status}
                             </span>
                          </td>
                          <td className="whitespace-nowrap py-4 px-5 text-gray-500 text-xs">
                             {report.startDate && report.endDate ? `${report.startDate} م الى ${report.endDate} م` : '-'}
                          </td>
                          <td className="whitespace-nowrap py-4 px-5 font-black text-gray-500">{report.date}</td>
                          <td className="whitespace-nowrap py-4 px-5">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1 text-[#0ea5e9] hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-transparent shadow-sm">
                                <Download className="w-4 h-4" />
                              </button>
                               <button onClick={() => handleReportEdit(report)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteReport(report)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm hover:shadow">
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

        {/* KPIs Tab */}
        {activeTab === "kpis" && (
          <div className="space-y-6">
            {filteredKpis.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center justify-center bg-[#e8e4e4] rounded-2xl border border-dashed border-gray-300">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-4 transform -rotate-3">
                 <Activity className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-extrabold text-gray-800">لا توجد مؤشرات حالياً</h3>
               <p className="text-gray-500 mt-1 max-w-md font-medium text-sm">قم بإضافة المعايير والمؤشرات للمطابقة والاعتماد عليها في التقارير الدورية.</p>
             </div>
            ) : viewMode === "table" ? (
              <div className="box-border border border-gray-200 rounded-2xl overflow-hidden bg-[#e8e4e4] shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-[#dfdada] text-gray-700 font-extrabold text-sm border-b border-gray-300">
                      <tr>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">المؤشر</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">المعيار</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">الفترة</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">التواريخ</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">المستهدف</th>
                        <th className="whitespace-nowrap py-4 px-5 whitespace-nowrap">المحقق</th>
                        <th className="whitespace-nowrap py-4 px-5 text-center whitespace-nowrap">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {filteredKpis.map((kpi) => (
                        <tr key={kpi.id} className="hover:bg-white/40 transition-colors text-sm font-semibold text-gray-800">
                          <td className="whitespace-nowrap py-4 px-5 font-bold">{kpi.indicator}</td>
                          <td className="whitespace-nowrap py-4 px-5 text-gray-600">{kpi.standard}</td>
                          <td className="whitespace-nowrap py-4 px-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black bg-white text-gray-700 border border-gray-200 shadow-sm">
                              {kpi.period}
                            </span>
                          </td>
                          <td className="whitespace-nowrap py-4 px-5 text-gray-500 text-xs">
                             {kpi.startDate && kpi.endDate ? `${kpi.startDate} الى ${kpi.endDate}` : '-'}
                          </td>
                          <td className="whitespace-nowrap py-4 px-5 font-black text-gray-500">{kpi.targetValue}</td>
                          <td className="whitespace-nowrap py-4 px-5 font-black text-emerald-600">{kpi.achievedValue}</td>
                          <td className="whitespace-nowrap py-4 px-5">
                            <div className="flex items-center justify-center gap-2">
                               <button onClick={() => handleKpiEdit(kpi)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm hover:shadow">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteKpi(kpi)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-red-100 shadow-sm hover:shadow">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKpis.map(kpi => (
                  <div key={kpi.id} className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-500"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-white text-indigo-500 rounded-xl border border-gray-100 shadow-sm">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleKpiEdit(kpi)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteKpi(kpi)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-extrabold text-gray-900 text-lg line-clamp-2 mb-2">{kpi.indicator}</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-4 line-clamp-2">{kpi.standard}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-white text-gray-700 border border-gray-200 shadow-sm">
                          {kpi.period}
                        </span>
                        {kpi.startDate && kpi.endDate && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
                            {kpi.startDate} - {kpi.endDate}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-3 border-t border-gray-200/60">
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                           <span className="block text-[10px] font-bold text-gray-500 mb-0.5">المستهدف</span>
                           <span className="block text-sm font-black text-gray-800">{kpi.targetValue}</span>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                           <span className="block text-[10px] font-bold text-emerald-600 mb-0.5">المحقق</span>
                           <span className="block text-sm font-black text-emerald-700">{kpi.achievedValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => { setIsReportModalOpen(false); resetReportForm(); }}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
             >
               <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                     <FileBarChart className="w-5 h-5" />
                   </div>
                   {editingReport ? "تعديل التقرير" : "توليد تقرير جديد"}
                 </h2>
                 <button 
                   onClick={() => { setIsReportModalOpen(false); resetReportForm(); }}
                   className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleSaveReport} className="p-6 overflow-y-auto space-y-5">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان التقرير</label>
                   <input required type="text" value={repTitle} onChange={(e) => setRepTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="مثال: تقرير الربع الأول لإنجازات اللجان" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">نوع التقرير</label>
                     <select value={repGenType} onChange={e => setRepGenType(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                       <option value="عام">عام</option>
                       <option value="مخصص">مخصص</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">دورية التقرير</label>
                     <select value={repPeriod} onChange={e => setRepPeriod(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                       <option value="دورية">دورية</option>
                       <option value="شهرية">شهرية</option>
                       <option value="ربع سنوية">ربع سنوية</option>
                       <option value="نصف سنوية">نصف سنوية</option>
                       <option value="سنوية">سنوية</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">تاريخ البداية</label>
                     <input required type="date" value={repStartDate} onChange={e => setRepStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">تاريخ النهاية</label>
                     <input required type="date" value={repEndDate} onChange={e => setRepEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">ملاحظات / محتوى מخصص (اختياري)</label>
                   <textarea rows={3} value={repNotes} onChange={(e) => setRepNotes(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="أي تفاصيل تود إضافتها للتقرير..." />
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                   <button type="button" onClick={() => { setIsReportModalOpen(false); resetReportForm(); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">إلغاء</button>
                   <button disabled={isLoading} type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all disabled:opacity-70">
                     {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart className="w-4 h-4" />}
                     {editingReport ? "تحديث التقرير" : "توليد التقرير"}
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      
      {/* KPI Form Modal */}
      <AnimatePresence>
        {isKpiModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => { setIsKpiModalOpen(false); resetKpiForm(); }}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
             >
               <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                     <Activity className="w-5 h-5" />
                   </div>
                   {editingKpi ? "تعديل المؤشر" : "إضافة مؤشر ومعيار جديد"}
                 </h2>
                 <button 
                   onClick={() => { setIsKpiModalOpen(false); resetKpiForm(); }}
                   className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <form onSubmit={handleSaveKpi} className="p-6 overflow-y-auto space-y-5">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">المؤشر</label>
                   <input required type="text" value={kpiIndicator} onChange={(e) => setKpiIndicator(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400" placeholder="مثال: عدد التوصيات المنفذة" />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">المعيار (المطابقة)</label>
                   <input required type="text" value={kpiStandard} onChange={(e) => setKpiStandard(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400" placeholder="مثال: ألا يقل نسبة الإنجاز في التوصيات عن 80%" />
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">المستوى المستهدف</label>
                     <input required type="text" value={kpiTarget} onChange={e => setKpiTarget(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="مثال: 80%" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">المستوى المحقق</label>
                     <input required type="text" value={kpiAchieved} onChange={e => setKpiAchieved(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="مثال: 85%" />
                   </div>
                 </div>

                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">الفترة الزمنية</label>
                    <input required type="text" value={kpiPeriod} onChange={e => setKpiPeriod(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="مثال: الربع الثاني 2026" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">تاريخ البداية</label>
                     <input required type="date" value={kpiStartDate} onChange={e => setKpiStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">تاريخ النهاية</label>
                     <input required type="date" value={kpiEndDate} onChange={e => setKpiEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                   </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                   <button type="button" onClick={() => { setIsKpiModalOpen(false); resetKpiForm(); }} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">إلغاء</button>
                   <button disabled={isLoading} type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all disabled:opacity-70">
                     {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                     {editingKpi ? "تحديث المؤشر" : "إضافة المؤشر"}
                   </button>
                 </div>
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
                 {deleteTarget.type === 'report' ? `حذف التقرير "${deleteTarget.item.title}"` : `حذف المؤشر "${deleteTarget.item.indicator}"`}
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
                 <button disabled={isLoading || !deleteReason.trim()} onClick={confirmDelete} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
                   {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
