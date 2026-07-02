import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query } from '../lib/firebase';
import { db } from '../lib/firebase';
import { 
  CheckSquare, Search, Plus, X, Trash2, Edit2, LayoutGrid, List, AlertTriangle, Check, BookOpen, Clock, AlignLeft, Send, Filter, Users, Settings, Copy, ChevronDown, ChevronUp, Sparkles, Sliders, ArrowLeftRight, Archive, CheckCircle2, AlertCircle, FileSpreadsheet, Paperclip, ChevronLeft, Calendar
} from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  sourceType?: "جديدة" | "بريد إلكتروني" | "بوابة الموظفين" | string;
  sourceDetails?: string;
  additionalNotes?: string;
  priority: "عادية" | "عاجلة";
  dueDate: string;
  assignedBy: string;
  assignedTo: string;
  status: "جديدة" | "جاري العمل عليها" | "متأخرة" | "منجزة";
  achievementNotes?: string;
  attachments: Array<{ name: string; url: string; date: string }>;
  escalationLevel: "لا يوجد" | "رئيس قسم" | "مدير الإدارة" | "الأمين العام";
}



export default function CommitteesTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TaskItem[];
      setTasks(dbTasks);
    });
    return () => unsubscribe();
  }, []);

  const [employeesList, setEmployeesList] = useState<string[]>([
    "مدير النظام"
  ]);
  const [allEmployeesData, setAllEmployeesData] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "employees"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        let emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        // Unconditionally hide sys admin and root users from all employee lists, regardless of current user role
        emps = emps.filter(e => 
          e && 
          e.role !== "SYS_ADMIN" &&
          e.id !== "01" && 
          e.name !== "شهاب الدين" && 
          e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
          e.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
        );
        setAllEmployeesData(emps);
        setEmployeesList(emps.map(e => e.name).filter(Boolean));
      }
    });
    return () => unsubscribe();
  }, []);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserName, setCurrentUserName] = useState("مدير النظام");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          setCurrentUserName(parsed.name);
        }
      }
    } catch(e) {}
  }, []);
  const [filterQuery, setFilterQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [currentTask, setCurrentTask] = useState<TaskItem | null>(null);

  // Field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState<string>("جديدة");
  const [sourceDetails, setSourceDetails] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [priority, setPriority] = useState<"عادية" | "عاجلة">("عادية");
  const [dueDate, setDueDate] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [selectedAssignDept, setSelectedAssignDept] = useState("إدارة اللجان");
  const [status, setStatus] = useState<"جديدة" | "جاري العمل عليها" | "متأخرة" | "منجزة">("جديدة");
  const [achievementNotes, setAchievementNotes] = useState("");
  const [tempAttachments, setTempAttachments] = useState<Array<{ name: string; url: string; date: string }>>([]);
  const [dragActive, setDragActive] = useState(false);

  // Helper calculation: Delay Days & automatic escalation notification
  const calculateDelayInfo = (task: TaskItem) => {
    if (task.status === "منجزة") return { isDelayed: false, days: 0 };
    
    const due = new Date(task.dueDate);
    const today = new Date();
    // Clear time portions for perfect days comparison
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diffTime = today.getTime() - due.getTime();
    if (diffTime > 0) {
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { isDelayed: true, days: diffDays };
    }
    return { isDelayed: false, days: 0 };
  };

  const openAddModal = () => {
    setTitle("");
    setDescription("");
    setSourceType("جديدة");
    setSourceDetails("");
    setAdditionalNotes("");
    setPriority("عادية");
    setDueDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)); // 5 days from now
    setAssignedBy(currentUserName);
    setSelectedAssignDept("إدارة اللجان");
    const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === "إدارة اللجان" || emp.orgLevel2 === "إدارة اللجان" || emp.orgLevel1 === "إدارة اللجان");
    setAssignedTo(deptEmps.length > 0 ? deptEmps[0].name : (employeesList[0] || ""));
    setStatus("جديدة");
    setAchievementNotes("");
    setTempAttachments([]);
    setIsAddOpen(true);
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // determine initial escalation level automatically based on priority
    const escLevel = priority === "عاجلة" ? "رئيس قسم" : "لا يوجد";

    const newTask: Omit<TaskItem, 'id'> = {
      title,
      description,
      sourceType,
      sourceDetails,
      additionalNotes,
      priority,
      dueDate,
      assignedBy,
      assignedTo,
      status,
      achievementNotes,
      attachments: tempAttachments,
      escalationLevel: escLevel as any
    };

    try {
      await addDoc(collection(db, "tasks"), newTask);
      setIsAddOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (task: TaskItem) => {
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setSourceType(task.sourceType || "جديدة");
    setSourceDetails(task.sourceDetails || "");
    setAdditionalNotes(task.additionalNotes || "");
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setAssignedBy(task.assignedBy);
    setAssignedTo(task.assignedTo);
    
    // Find department of assignedTo
    const emp = allEmployeesData.find(e => e.name === task.assignedTo);
    if (emp && (emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1)) {
      setSelectedAssignDept((emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1) as string);
    } else {
      setSelectedAssignDept("إدارة اللجان");
    }

    setStatus(task.status);
    setAchievementNotes(task.achievementNotes || "");
    setTempAttachments(task.attachments);
    setIsEditOpen(true);
  };

  const handleEditTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentTask || !title.trim()) return;

    let calculatedStatus = status;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    if (status !== "منجزة" && today.getTime() > due.getTime()) {
      calculatedStatus = "متأخرة";
    }

    try {
      await updateDoc(doc(db, "tasks", currentTask.id), {
        title,
        description,
        sourceType,
        sourceDetails,
        additionalNotes,
        priority,
        dueDate,
        assignedBy,
        assignedTo,
        status: calculatedStatus,
        achievementNotes,
        attachments: tempAttachments
      });
      setIsEditOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const openActionModal = (task: TaskItem) => {
    setCurrentTask(task);
    setStatus(task.status);
    setAchievementNotes(task.achievementNotes || "");
    setIsActionOpen(true);
  };

  const handleSaveAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    // Trigger escalation logically if user approves or escalates
    let newEscLevel = currentTask.escalationLevel;
    if (status === "متأخرة" && newEscLevel === "لا يوجد") {
      newEscLevel = "رئيس قسم";
    } else if (status === "متأخرة" && newEscLevel === "رئيس قسم") {
      newEscLevel = "مدير الإدارة";
    } else if (status === "منجزة") {
      newEscLevel = "لا يوجد";
    }
    
    try {
      await updateDoc(doc(db, "tasks", currentTask.id), {
        status,
        achievementNotes,
        escalationLevel: newEscLevel
      });
      setIsActionOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Action triggers
  const handleImmediateEscalate = async (task: TaskItem) => {
    const levels: Array<"لا يوجد" | "رئيس قسم" | "مدير الإدارة" | "الأمين العام"> = ["لا يوجد", "رئيس قسم", "مدير الإدارة", "الأمين العام"];
    const currentIdx = levels.indexOf(task.escalationLevel);
    const nextIdx = Math.min(currentIdx + 1, levels.length - 1);
    const nextLevel = levels[nextIdx];

    try {
      await updateDoc(doc(db, "tasks", task.id), {
        escalationLevel: nextLevel
      });
      alert(`تم تصعيد المتابعة الإدارية للرتبة الأعلى: (${nextLevel}) بنجاح`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTaskToDeleteId(id);
    setDeleteReason("");
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskToDeleteId) return;
    if (!deleteReason.trim()) return;

    try {
      const savedLogs = localStorage.getItem("app_system_logs");
      let currentLogs = [];
      if (savedLogs) {
        try {
          currentLogs = JSON.parse(savedLogs);
        } catch (ex) {}
      }

      const timestamp = new Date().toISOString().substring(0, 19).replace('T', ' ');
      const deletedItem = tasks.find(t => t.id === taskToDeleteId);
      const deletedTitle = deletedItem ? deletedItem.title : "مهمة إدارية منوعة";

      const logEntry = {
        id: Date.now(),
        employeeName: currentUserName,
        time: timestamp,
        operationType: "حذف مهمة",
        status: "ناجحة",
        details: `تم حذف مهمة عمل [${deletedTitle}]. سبب الحذف والمبرر الإداري: ${deleteReason.trim()}`
      };

      localStorage.setItem("app_system_logs", JSON.stringify([logEntry, ...currentLogs]));
      
      await deleteDoc(doc(db, "tasks", taskToDeleteId));
    } catch (err) {
      console.error(err);
    }

    setIsConfirmDeleteOpen(false);
    setTaskToDeleteId(null);
    setDeleteReason("");
  };

  // Drag Drop attachments logic
  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      const mapped = filesArray.map(f => ({
        name: f.name,
        url: `https://drive.google.com/drive/folders/uploaded_task_${Date.now()}`,
        date: new Date().toISOString().substring(0, 10)
      }));
      setTempAttachments([...tempAttachments, ...mapped]);
    }
  };

  const handleAddLinkAttachment = () => {
    const linkName = prompt("أدخل اسم ملف المهمة:");
    const linkUrl = prompt("أدخل رابط مستند جوجل:", "https://docs.google.com/...");
    if (linkName && linkUrl) {
      setTempAttachments([
        ...tempAttachments,
        { name: linkName, url: linkUrl, date: new Date().toISOString().substring(0, 10) }
      ]);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setTempAttachments(tempAttachments.filter((_, i) => i !== idx));
  };

  const handleSendEmail = (task: TaskItem) => {
    const textMsg = `مهمة معينة إليكم في نظام الغرفة التجارية بمكة المكرمة:\n\nعنوان المهمة: ${task.title}\nشرح المسؤولية: ${task.description}\nالحالة الحالية: ${task.status}\nتاريخ التسليم الأقصى: ${task.dueDate}\nالمُنسّق: ${task.assignedBy}\n\nنأمل متابعتها والانتهاء ضمن الجدول الزمني منعا للتصعيد الهيكلي.`;
    const mailto = `mailto:?subject=${encodeURIComponent("مهمة معلقة بالنظام: " + task.title)}&body=${encodeURIComponent(textMsg)}`;
    window.location.href = mailto;
  };

  // Filter computation
  const filteredTasks = tasks.filter(t => {
    const term = (filterQuery || searchQuery).trim().toLowerCase();
    const matchesSearch = !term ||
      t.title.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "all" || t.assignedTo === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 text-right">
      
      {/* Dynamic Printing CSS for A4 physical sheets alignment */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; background: white !important; }
          #printable-tasks-area, #printable-tasks-area * { visibility: visible !important; }
          #printable-tasks-area { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 1.5cm !important; }
          .print-hidden, .print\\:hidden { display: none !important; }
        }
      `}} />

      {/* -------------------- Page Action Header -------------------- */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-brand rounded-xl">
              <CheckSquare className="w-7 h-7 text-brand" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-sans">بوابة المهام الإدارية الداخلية</h1>
          </div>
          <p className="text-gray-600 text-sm font-medium mt-1">إسناد ومتابعة الأعمال الإدارية واليومية بين منسوبي الغرفة وإحصاء مستحقاتها تلقائياً</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
          
          {/* Toggleable Search with Input */}
          <div className="flex items-center gap-2 relative">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 170, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFilterQuery(searchQuery);
                    setIsSearchExpanded(false);
                  }}
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
                    placeholder="ابحث عن مهمة..."
                    autoFocus
                    className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold placeholder-gray-400 text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterQuery("");
                        setIsSearchExpanded(false);
                      }}
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
                isSearchExpanded || filterQuery || searchQuery
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm animate-pulse-subtle"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="البحث عن المهام الإدارية"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Option dropdown popover & View Toggles */}
          <div className="relative flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm gap-1">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isFilterOpen || assigneeFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>فرز</span>
              {(assigneeFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all") && (
                <span className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setIsFilterOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 space-y-4 text-right font-sans"
                    style={{ transformOrigin: "top left" }}
                  >
                    {/* Assignee Selector */}
                    <div className="space-y-1.5 text-right">
                      <div className="flex items-center gap-1.5 text-gray-800 justify-start">
                        <span className="w-1 h-3 bg-indigo-600 rounded-full" />
                        <span className="text-[11px] font-black text-gray-800">مسؤول المهمة:</span>
                      </div>
                      <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="w-full h-8.5 bg-slate-50 border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none rounded-lg px-2 text-[11px] font-black text-right text-gray-700"
                      >
                        <option value="all">كل الموظفين</option>
                        {employeesList.map((e, i) => (
                          <option key={i} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Selector */}
                    <div className="space-y-1.5 text-right">
                      <div className="flex items-center gap-1.5 text-gray-800 justify-start">
                        <span className="w-1 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-[11px] font-black text-gray-800">أولوية المهمة:</span>
                      </div>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full h-8.5 bg-slate-50 border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none rounded-lg px-2 text-[11px] font-black text-right text-gray-700"
                      >
                        <option value="all">كل الأولويات</option>
                        <option value="عادية">عادية</option>
                        <option value="عاجلة">عاجلة جداً</option>
                      </select>
                    </div>

                    {/* Status Selector */}
                    <div className="space-y-1.5 text-right">
                      <div className="flex items-center gap-1.5 text-gray-800 justify-start">
                        <span className="w-1 h-3 bg-green-600 rounded-full" />
                        <span className="text-[11px] font-black text-gray-800">حالة المهمة:</span>
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-8.5 bg-slate-50 border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none rounded-lg px-2 text-[11px] font-black text-right text-gray-700"
                      >
                        <option value="all">كل الحالات</option>
                        <option value="جديدة">جديدة</option>
                        <option value="جاري العمل عليها">جاري العمل عليها</option>
                        <option value="متأخرة">متأخرة</option>
                        <option value="منجزة">منجزة</option>
                      </select>
                    </div>

                    <div className="h-px bg-gray-150" />

                    {/* Reset Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeFilter("all");
                        setPriorityFilter("all");
                        setStatusFilter("all");
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-center text-[10px] font-black text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-1.5 rounded-lg cursor-pointer"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="w-[1px] bg-gray-200 my-1 mx-0.5" />

            {/* View Toggles */}
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "cards" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print A4 Sheet - Icon only without text */}
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 w-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
            title="طباعة سجل المهام A4"
          >
            <FileSpreadsheet className="w-5 h-5 text-blue-605" />
          </button>

          {/* Create custom Task button */}
          <button
            type="button"
            onClick={openAddModal}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إنشاء مهمة جديدة</span>
          </button>
          
          <div className="h-8 w-px bg-gray-300 hidden sm:block mx-0.5"></div>

          {/* Quick Statistic Badge */}
          <div className="flex gap-1 shrink-0">
            <div className="bg-white px-3 py-1.5 rounded-xl text-center shadow-inner">
              <span className="text-[9px] font-black text-gray-400 block leading-tight">العدد</span>
              <span className="text-sm font-black text-brand leading-none font-mono">{tasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- CORE DATA DISPLAYER ----------------- */}
      <div id="printable-tasks-area" className="w-full">
        {/* Print only banner view */}
        <div className="hidden print:block border-b-2 border-blue-800 pb-4 mb-6 text-center text-right" dir="rtl">
          <h1 className="text-2xl font-black text-blue-900">كشف وجرد المهام الإدارية الداخلية</h1>
          <p className="text-xs text-gray-500 mt-2">مستخرج آلياً من الغرفة التجارية بمكة المكرمة - تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</p>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center">
              <Archive className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-black text-gray-900">لا توجد مهام إدارية للخيارات المحددة</p>
              <p className="text-xs text-gray-400">ابدأ بـ "إنشاء مهمة جديدة" لإسناد أعمال ومتابعتها.</p>
            </div>
          </div>
        ) : viewMode === "cards" ? (
          /* Cards Bento Visualizer */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t) => {
              const delayInfo = calculateDelayInfo(t);
              
              // Map color states
              const statusBadgeStyles = {
                "جديدة": "bg-blue-50 border-blue-200 text-blue-700",
                "جاري العمل عليها": "bg-amber-50 border-amber-200 text-amber-800",
                "متأخرة": "bg-red-50 border-red-200 text-red-700 animate-pulse",
                "منجزة": "bg-emerald-50 border-emerald-200 text-emerald-800"
              };

              const priorityStyles = t.priority === "عاجلة" ? "bg-red-650 text-white animate-pulse" : "bg-[#dfdada] text-slate-800 border border-gray-300";

              return (
                <div
                  key={t.id}
                  className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-all duration-300 rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Left hand status vertical bar */}
                  <span className={`absolute top-0 right-0 w-1.5 h-full ${
                    t.status === "جديدة" ? "bg-blue-600" :
                    t.status === "جاري العمل عليها" ? "bg-amber-500" :
                    t.status === "متأخرة" || delayInfo.isDelayed ? "bg-red-650" : "bg-emerald-600"
                  }`} />

                  {/* Header metadata row */}
                  <div className="flex items-start justify-between gap-1.5 mb-3 pr-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${priorityStyles}`}>
                          {t.priority}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${statusBadgeStyles[t.status]}`}>
                          ● {t.status}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs text-gray-950 leading-snug mt-2 line-clamp-2" title={t.title}>
                        {t.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-white border border-gray-150 rounded-xl p-3.5 mb-4 space-y-2 text-[11px]">
                    <p className="text-gray-600 leading-relaxed font-semibold line-clamp-3">
                      {t.description}
                    </p>
                    {t.achievementNotes && (
                      <div className="border-t border-gray-100 pt-2 text-indigo-700">
                        <strong className="block text-indigo-800">منجزات المسؤول:</strong>
                        <p className="line-clamp-2 italic font-bold text-gray-600">{t.achievementNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Computed delay & escalation alert block */}
                  {delayInfo.isDelayed && t.status !== "منجزة" && (
                    <div className="p-2.5 bg-red-50 border border-red-150 rounded-xl mb-3 flex items-center gap-2 text-[10px] text-red-650 font-black">
                      <AlertCircle className="w-4 h-4 shrink-0 animate-bounce text-red-600" />
                      <div>
                        <span>تأخير مستحق بمقدار: <strong className="font-mono">{delayInfo.days} أيام</strong></span>
                        <span className="block text-[8px] text-red-500 bg-red-100 px-1 py-0.5 rounded mt-0.5">
                          توجيه: تصعيد آلي لمرحلة ({t.escalationLevel !== "لا يوجد" ? t.escalationLevel : "رئيس قسم"})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Assignees metadata */}
                  <div className="border-t border-gray-300/60 pt-3 space-y-2 mb-3 text-[11px] font-semibold text-gray-500">
                    <div className="grid grid-cols-2 gap-2 text-right">
                      <div>
                        المُكلَف: <strong className="text-gray-900 block truncate">{t.assignedTo}</strong>
                      </div>
                      <div>
                        المنسق: <strong className="text-gray-950 block truncate">{t.assignedBy}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#b59410]" />
                      <span>موعد التسليم: <strong className="text-gray-950 font-mono">{t.dueDate}</strong></span>
                    </div>
                  </div>

                  {/* Task Attachments */}
                  <div className="mb-4">
                    {t.attachments.length === 0 ? (
                      <p className="text-[10px] text-gray-400 font-bold italic">لا توجد ملفات مرفقة.</p>
                    ) : (
                      <div className="space-y-1">
                        {t.attachments.map((file, fileIdx) => (
                          <a
                            key={fileIdx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-blue-700 bg-blue-50/70 hover:bg-blue-100/85 py-1 px-2.5 rounded-lg border border-blue-150 text-[10px] truncate"
                          >
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <Paperclip className="w-3 h-3 text-blue-600" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer control actions */}
                  <div className="border-t border-gray-300/60 pt-2.5 flex items-center justify-between mt-auto print:hidden">
                    {/* Progress action button */}
                    <button
                      type="button"
                      onClick={() => openActionModal(t)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span>تحديث الإنجاز</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Intermedate escalation */}
                      {t.status === "متأخرة" && (
                        <button
                          type="button"
                          onClick={() => handleImmediateEscalate(t)}
                          title="تصعيد فوري للمتابعة الإدارية"
                          className="p-1 hover:bg-slate-200 rounded text-red-650 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Email */}
                      <button
                        type="button"
                        onClick={() => handleSendEmail(t)}
                        title="إرسال تذكير إلكتروني للمسؤول"
                        className="p-1 hover:bg-blue-100 rounded text-blue-600 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(t)}
                        title="تعديل تفاصيل المهمة وتاريخ التسليم"
                        className="p-1 hover:bg-amber-100 rounded text-amber-600 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(t.id)}
                        title="مسح المهمة من السجلات"
                        className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-650 border border-red-200 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Table Standard Layout */
          <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto text-right">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#dfdada] border-b border-gray-300 text-gray-900 text-xs font-black">
                  <th className="px-4 py-3.5 text-right">المهمة</th>
                  <th className="px-4 py-3.5 text-right">الموظف المكلف</th>
                  <th className="px-4 py-3.5 text-right">موعد التسليم</th>
                  <th className="px-4 py-3.5 text-right">الأولوية</th>
                  <th className="px-4 py-3.5 text-right">الحالة والتصعيد</th>
                  <th className="px-4 py-3.5 text-right">المرفقات</th>
                  <th className="px-4 py-3.5 print:hidden text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs font-bold text-gray-750">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-[#e2dede] transition-colors bg-[#e8e4e4]/85">
                    <td className="px-4 py-3.5 max-w-sm text-right">
                      <p className="font-extrabold text-[#246fff] text-xs">{t.title}</p>
                      <p className="text-gray-500 text-[10px] font-bold line-clamp-1 mt-0.5">{t.description}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-900 font-extrabold text-right">{t.assignedTo}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-900 text-right">{t.dueDate}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black ${t.priority === "عاجلة" ? "bg-red-100 text-red-800 border border-red-200" : "bg-gray-100 text-gray-800 border border-gray-250"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black inline-block text-center w-24 ${
                          t.status === "جديدة" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                          t.status === "جاري العمل عليها" ? "bg-amber-100 text-amber-800 border border-amber-250" :
                          t.status === "متأخرة" ? "bg-red-100 text-red-800 border border-red-200" :
                          "bg-emerald-100 text-emerald-800 border border-emerald-250"
                        }`}>
                          {t.status}
                        </span>
                        {t.status === "متأخرة" && (
                          <span className="text-[8px] text-red-650 bg-red-50 border border-red-100 p-0.5 rounded block text-center w-24 font-black">
                            تصعيد: {t.escalationLevel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-800 text-right">
                      <span className="text-gray-700 text-[10px] font-mono">{t.attachments.length} مرفقات</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap print:hidden text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openActionModal(t)}
                          className="px-2.5 py-1 bg-[#246fff] hover:bg-blue-700 text-white rounded text-[10px] font-black transition-all cursor-pointer"
                        >
                          تحديث الحالة
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(t)}
                          className="p-1 hover:bg-amber-100/80 text-amber-600 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1 bg-red-50 hover:bg-red-100 rounded text-red-650 border border-red-200 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. Modal: CREATE INTERNAL TASK */}
      {/* ========================================================================= */}
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
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">إسناد وتكليف مهمة إدارية داخلية جديدة</h3>
                    <p className="text-xs text-gray-500 font-medium">املأ معايير المهمة لتوزيع الأعمال والمسؤوليات وتتبعها آلياً</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-750 mb-1">اسم المهمة الرئيسي *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: مطابقة اشتراكات الغرفة واللجان للشركات المنتسبة"
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-750 mb-1">تفاصيل وصياغة المسؤولية (وصف المهمة) *</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="اكتب المعيار المطلوب الوصول إليه وأي موجهات لازمة لحسن تنفيذ العمل..."
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Source Type */}
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-xs font-black text-gray-750 mb-1">مصدر المهمة *</label>
                    <select
                      value={sourceType}
                      onChange={(e) => {
                        setSourceType(e.target.value);
                        setSourceDetails("");
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="جديدة">جديدة</option>
                      <option value="بريد إلكتروني">بريد إلكتروني</option>
                      <option value="بوابة الموظفين">بوابة الموظفين</option>
                    </select>
                  </div>

                  {/* Source Details */}
                  {sourceType !== "جديدة" && (
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-xs font-black text-gray-750 mb-1">
                        {sourceType === "بريد إلكتروني" ? "عنوان البريد الإلكتروني *" : "رقم المعاملة *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={sourceDetails}
                        onChange={(e) => setSourceDetails(e.target.value)}
                        placeholder={sourceType === "بريد إلكتروني" ? "اكتب عنوان البريد..." : "أدخل رقم المعاملة..."}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  )}
                  {sourceType === "جديدة" && <div className="hidden md:block col-span-1 md:col-span-1"></div>}

                  {/* Assigned to */}
                  <div className="space-y-2 lg:col-span-1">
                    <label className="block text-xs font-black text-gray-750 mb-1">مسندة إلى (الموظف المكلف) *</label>
                    <div className="flex flex-col gap-2">
                      <select
                        value={selectedAssignDept}
                        onChange={(e) => {
                          setSelectedAssignDept(e.target.value);
                          const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === e.target.value || emp.orgLevel2 === e.target.value || emp.orgLevel1 === e.target.value);
                          if (deptEmps.length > 0) {
                            setAssignedTo(deptEmps[0].name);
                          } else {
                            setAssignedTo("");
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                          <option key={i} value={dept as string}>{dept as string}</option>
                        ))}
                      </select>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {allEmployeesData.filter(emp => emp.orgLevel3 === selectedAssignDept || emp.orgLevel2 === selectedAssignDept || emp.orgLevel1 === selectedAssignDept).map((e, i) => (
                          <option key={i} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Coordinator (Assigned by) */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">تم إنشاء المهمة بواسطة الموظف *</label>
                    <input
                      type="text"
                      required
                      readOnly
                      disabled
                      value={assignedBy}
                      className="w-full p-2.5 bg-slate-100 border border-gray-300 rounded-xl text-xs font-black text-gray-500 cursor-not-allowed outline-none transition-all"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">موعد التسليم *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Priority level */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">الأولوية *</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="عادية">عادية</option>
                      <option value="عاجلة">عاجلة</option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-750 mb-1">ملاحظات إضافية</label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="أي ملاحظات أو إرشادات إضافية للمهمة..."
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Achievement initial notes (optional) */}
                <div>
                  <label className="block text-xs font-black text-gray-750 mb-1">ملاحظات أولية عن الإنجاز والتقدم</label>
                  <input
                    type="text"
                    value={achievementNotes}
                    onChange={(e) => setAchievementNotes(e.target.value)}
                    placeholder="متروك للمستجدات..."
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* File attachments - Drag and drop */}
                <div className="space-y-1">
                  <label className="block text-xs font-black text-gray-750">مرفقات تكميلية بالملفات أو رابط Google Drive</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-4 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                      dragActive ? "border-blue-650 bg-blue-50" : "border-gray-200 bg-slate-50"
                    }`}
                  >
                    <Paperclip className="w-5 h-5 text-blue-600 mb-1 animate-bounce" />
                    <p className="text-[10px] font-bold text-gray-500">قم بسحب ملفات الأرشفة والتقارير هنا مباشرة</p>
                    <button
                      type="button"
                      onClick={handleAddLinkAttachment}
                      className="mt-2.5 px-3 py-1 bg-blue-105 hover:bg-blue-110 text-blue-750 rounded-lg text-[9px] font-black"
                    >
                      أو الصق رابط مجلد جوجل درايف يدوياً
                    </button>
                  </div>

                  {tempAttachments.length > 0 && (
                    <div className="pt-2 text-[10px] text-gray-600 font-bold space-y-1">
                      {tempAttachments.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between py-0.5 bg-slate-50 px-2 rounded">
                          <span className="truncate max-w-xs">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="text-red-500 hover:text-red-750 font-extrabold"
                          >
                            إلغاء المرفق
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 text-xs font-black bg-slate-100 hover:bg-slate-205 text-gray-650 rounded-xl transition-all"
                  >
                    تراجع وإلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                  >
                    إسناد المهمة للموظف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. Modal: EDIT TASK */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsEditOpen(false)}
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
                    <Edit2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">تعديل تفاصيل المهمة والجدول الزمني</h3>
                    <p className="text-xs text-gray-500 font-medium">تعديل وصياغة بيانات إسناد المهمة والمسؤوليات الحالية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditTask} className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-750 mb-1">اسم المهمة *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-750 mb-1">تفاصيل وصياغة المسؤولية (وصف المهمة) *</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Source Type */}
                  <div className="col-span-1 md:col-span-1">
                    <label className="block text-xs font-black text-gray-750 mb-1">مصدر المهمة *</label>
                    <select
                      value={sourceType}
                      onChange={(e) => {
                        setSourceType(e.target.value);
                        setSourceDetails("");
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="جديدة">جديدة</option>
                      <option value="بريد إلكتروني">بريد إلكتروني</option>
                      <option value="بوابة الموظفين">بوابة الموظفين</option>
                    </select>
                  </div>

                  {/* Source Details */}
                  {sourceType !== "جديدة" && (
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-xs font-black text-gray-750 mb-1">
                        {sourceType === "بريد إلكتروني" ? "عنوان البريد الإلكتروني *" : "رقم المعاملة *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={sourceDetails}
                        onChange={(e) => setSourceDetails(e.target.value)}
                        placeholder={sourceType === "بريد إلكتروني" ? "اكتب عنوان البريد..." : "أدخل رقم المعاملة..."}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  )}
                  {sourceType === "جديدة" && <div className="hidden md:block col-span-1 md:col-span-1"></div>}

                  {/* Due date */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">موعد التسليم الأقصى *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">الأولوية</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="عادية">عادية</option>
                      <option value="عاجلة">عاجلة جداً</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2 lg:col-span-1">
                    <label className="block text-xs font-black text-gray-750 mb-1">الموظف المكلف</label>
                    <div className="flex flex-col gap-2">
                      <select
                        value={selectedAssignDept}
                        onChange={(e) => {
                          setSelectedAssignDept(e.target.value);
                          const deptEmps = allEmployeesData.filter(emp => emp.orgLevel3 === e.target.value || emp.orgLevel2 === e.target.value || emp.orgLevel1 === e.target.value);
                          if (deptEmps.length > 0) {
                            setAssignedTo(deptEmps[0].name);
                          } else {
                            setAssignedTo("");
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {Array.from(new Set(allEmployeesData.map(e => e.orgLevel3 || e.orgLevel2 || e.orgLevel1).filter(Boolean))).map((dept, i) => (
                          <option key={i} value={dept as string}>{dept as string}</option>
                        ))}
                      </select>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {allEmployeesData.filter(emp => emp.orgLevel3 === selectedAssignDept || emp.orgLevel2 === selectedAssignDept || emp.orgLevel1 === selectedAssignDept).map((e, i) => (
                          <option key={i} value={e.name}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Coordinator (Assigned by) */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">منسق العمل (المُسنِد)</label>
                    <input
                      type="text"
                      required
                      readOnly
                      disabled
                      value={assignedBy}
                      className="w-full p-2.5 bg-slate-100 border border-gray-300 rounded-xl text-xs font-black text-gray-500 cursor-not-allowed outline-none transition-all"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-gray-750 mb-1">حالة المهمة الحالية</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="جديدة">جديدة</option>
                      <option value="جاري العمل عليها">جاري العمل عليها</option>
                      <option value="متأخرة">متأخرة</option>
                      <option value="منجزة">منجزة</option>
                    </select>
                  </div>

                  {/* Additional Notes */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-gray-750 mb-1">ملاحظات إضافية</label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 text-xs font-black bg-slate-100 hover:bg-slate-200 text-gray-650 rounded-xl transition-all"
                  >
                    إلغاء التعديل
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. Modal: UPDATE ACHIEVEMENT AND PROGRESS */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isActionOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsActionOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">تحديث إنجاز المهمة الإدارية</h3>
                    <p className="text-xs text-gray-500 font-medium font-sans">تحديث نسب الإكمال والإنجاز الفوري للموظف</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActionOpen(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAction} className="overflow-y-auto p-6 space-y-4">
                {/* Select status */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">تعديل الحالة التنفيذية للمهمة</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="جديدة">جديدة (أزرق)</option>
                    <option value="جاري العمل عليها">جاري العمل عليها (أصفر)</option>
                    <option value="متأخرة">متأخرة (أحمر)</option>
                    <option value="منجزة">منجزة مكتملة (أخضر)</option>
                  </select>
                </div>

                {/* Achievement progress notes */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">كتابة المنجز والتفاصيل المستكشفة *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="مثال: تم إرسال 12 كتاب رسمي للدعوات للجهات، وبانتظار الإفادة بممثليهم الأبجديين."
                    value={achievementNotes}
                    onChange={(e) => setAchievementNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="border-t pt-4 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsActionOpen(false)}
                    className="px-4 py-2 text-xs font-black bg-slate-100 hover:bg-slate-200 text-gray-650 rounded-xl transition-all"
                  >
                    إلغاء وفصل
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                  >
                    تأكيد وحفظ حالة الإنجاز
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. Modal: DOUBLE CONFIRM TASK DELETION WITH AUDIT LOG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/65 backdrop-blur-xs"
              onClick={() => setIsConfirmDeleteOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right flex flex-col"
            >
              <div className="bg-red-50 p-5 border-b border-red-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 text-white rounded-xl">
                    <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-red-950 text-base leading-tight">طلب إداري: تأكيد حذف مهمة العمل</h3>
                    <p className="text-xs text-red-700 font-medium font-sans">هذا الإجراء يتطلب تدوين سبب الحذف في المراقبة الأمنية للرصد والشفافية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="p-1.5 hover:bg-red-100 rounded-full text-red-800 hover:text-red-950 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmDeleteTask} className="p-6 space-y-4">
                <div className="text-xs text-gray-600 font-bold leading-relaxed bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
                  تنبيه بقواعد النظام: عند مسح المهمة القطاعية، سيتم رصد العملية باسمك وتوقيتها وصور الحذف لأرشفتها في شاشة الرقابة الأمنية. الرجاء كتابة المبرر والسبب الرسمي.
                </div>

                <div>
                  <label className="block text-xs font-black text-red-650 mb-1">المبرر الإداري لحذف المهمة *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="اكتب هنا سبب المسح الإداري (مثال: تم إقرار دمج المهمة مع بنود توصية ورشة العمل السادسة)"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs font-black leading-relaxed focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="border-t pt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(false)}
                    className="px-4 py-2 text-xs font-black bg-slate-100 hover:bg-slate-200 text-gray-650 rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء وتراجع
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    تأكيد المسح النهائي للرصد
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
