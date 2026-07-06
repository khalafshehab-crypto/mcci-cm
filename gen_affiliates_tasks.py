import os

content = """import React, { useState, useMemo } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useFirestoreCollection } from "../lib/firebaseUtils";
import { 
  CheckSquare, Search, Plus, Calendar, AlertCircle, 
  Clock, Edit2, Trash2, X, ListTodo, User, Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AffiliateTask {
  id?: string;
  title: string;
  description: string;
  targetSector: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  priority: string;
  importedFrom?: string;
}

const SECTORS = ["الدرجة الممتازة", "الدرجة الأولى", "الدرجة الثانية", "الدرجة الثالثة", "الشباب ورواد الأعمال", "تجار التجزئة", "المقاولات", "أخرى"];
const STATUSES = ["قيد التنفيذ", "متأخرة", "مكتملة"];
const PRIORITIES = ["عالية", "متوسطة", "عادية"];

export default function AffiliatesTasks() {
  const { data: tasks } = useFirestoreCollection<AffiliateTask>("affiliates_tasks", []);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AffiliateTask | null>(null);
  
  const [formData, setFormData] = useState<Partial<AffiliateTask>>({
    title: "",
    description: "",
    targetSector: SECTORS[0],
    assignedTo: "",
    dueDate: "",
    status: "قيد التنفيذ",
    priority: "متوسطة"
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title?.includes(searchQuery) || t.assignedTo?.includes(searchQuery);
      const matchesSector = sectorFilter === "all" || t.targetSector === sectorFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesSector && matchesStatus;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, searchQuery, sectorFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      active: tasks.filter(t => t.status === "قيد التنفيذ").length,
      completed: tasks.filter(t => t.status === "مكتملة").length,
      late: tasks.filter(t => t.status === "متأخرة").length
    };
  }, [tasks]);

  const handleOpenModal = (t?: AffiliateTask) => {
    if (t) {
      setEditingTask(t);
      setFormData(t);
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        targetSector: SECTORS[0],
        assignedTo: "",
        dueDate: "",
        status: "قيد التنفيذ",
        priority: "متوسطة"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask?.id) {
        await updateDoc(doc(db, "affiliates_tasks", editingTask.id), formData);
      } else {
        await addDoc(collection(db, "affiliates_tasks"), formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      alert("حدث خطأ أثناء حفظ المهمة");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
      try {
        await deleteDoc(doc(db, "affiliates_tasks", id));
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "قيد التنفيذ": return "bg-blue-100 text-blue-800 border-blue-200";
      case "مكتملة": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "متأخرة": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "عالية": return "text-rose-600 bg-rose-50 border-rose-200";
      case "متوسطة": return "text-amber-600 bg-amber-50 border-amber-200";
      case "عادية": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-brand" />
            مهام إدارة المنتسبين
          </h1>
          <p className="text-gray-500 text-sm mt-1">متابعة تنفيذ الخدمات والمهام الخاصة بالمنتسبين</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand/90 transition-all shadow-sm font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          تكليف بمهمة جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">إجمالي المهام</p>
            <p className="text-xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">قيد التنفيذ</p>
            <p className="text-xl font-black text-gray-900">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">متأخرة</p>
            <p className="text-xl font-black text-gray-900">{stats.late}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">مكتملة</p>
            <p className="text-xl font-black text-gray-900">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في المهام..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="flex-1 md:w-48 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-bold"
          >
            <option value="all">كل القطاعات</option>
            {SECTORS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:w-48 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-bold"
          >
            <option value="all">كل الحالات</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(t => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={t.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand/30 transition-all flex flex-col group relative"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${getStatusColor(t.status)}`}>
                {t.status}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(t)} className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => t.id && handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1">{t.title}</h3>
            <p className="text-xs text-gray-500 font-medium mb-3 line-clamp-2">{t.description}</p>
            
            <div className="flex items-center gap-1.5 mb-4 text-brand bg-brand/5 w-fit px-2 py-0.5 rounded text-[10px] font-bold">
              <Users className="w-3 h-3" />
              <span>قطاع: {t.targetSector}</span>
            </div>
            
            <div className="mt-auto space-y-2 pt-2 border-t border-gray-50">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-bold">{t.assignedTo || "غير محدد"}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${getPriorityColor(t.priority)}`}>
                  أهمية {t.priority}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-mono" dir="ltr">{t.dueDate}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد مهام مسجلة أو مطابقة لبحثك</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-black text-gray-900 text-lg">
                  {editingTask ? "تعديل المهمة" : "تكليف بمهمة جديدة"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان المهمة</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">التفاصيل</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">القطاع المعني</label>
                    <select
                      value={formData.targetSector}
                      onChange={e => setFormData({...formData, targetSector: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                    >
                      {SECTORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">المكلف بالتنفيذ</label>
                    <input
                      required
                      type="text"
                      value={formData.assignedTo}
                      onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ التسليم</label>
                    <input
                      required
                      type="date"
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">الأهمية</label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                    >
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-bold text-white bg-brand hover:bg-brand/90 rounded-xl transition-all shadow-sm"
                  >
                    حفظ المهمة
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
"""
with open('src/pages/AffiliatesTasks.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
