import os

content = """import React, { useState, useMemo } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useFirestoreCollection } from "../lib/firebaseUtils";
import { 
  Calendar, MapPin, Search, Plus, Filter, 
  Clock, Edit2, Trash2, X, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CenterEvent {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  centerName: string;
  status: string;
  type: string;
  importedFrom?: string;
}

const CENTERS = ["مركز التحكيم", "مركز التدريب", "مركز المعارض", "مركز ريادة الأعمال", "مركز الدراسات"];
const TYPES = ["دورة تدريبية", "ورشة عمل", "معرض", "جلسة استشارية", "لقاء مفتوح"];
const STATUSES = ["مجدول", "مكتمل", "ملغي"];

export default function CentersEvents() {
  const { data: events } = useFirestoreCollection<CenterEvent>("centers_events", []);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [centerFilter, setCenterFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CenterEvent | null>(null);
  
  const [formData, setFormData] = useState<Partial<CenterEvent>>({
    title: "",
    date: "",
    time: "",
    location: "",
    centerName: CENTERS[0],
    type: TYPES[0],
    status: "مجدول"
  });

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSearch = evt.title?.includes(searchQuery) || evt.location?.includes(searchQuery);
      const matchesCenter = centerFilter === "all" || evt.centerName === centerFilter;
      return matchesSearch && matchesCenter;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchQuery, centerFilter]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter(e => e.status === "مجدول").length,
      completed: events.filter(e => e.status === "مكتمل").length
    };
  }, [events]);

  const handleOpenModal = (evt?: CenterEvent) => {
    if (evt) {
      setEditingEvent(evt);
      setFormData(evt);
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        centerName: CENTERS[0],
        type: TYPES[0],
        status: "مجدول"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent?.id) {
        await updateDoc(doc(db, "centers_events", editingEvent.id), formData);
      } else {
        await addDoc(collection(db, "centers_events"), formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("حدث خطأ أثناء حفظ الفعالية");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفعالية؟")) {
      try {
        await deleteDoc(doc(db, "centers_events", id));
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "مجدول": return "bg-blue-100 text-blue-800 border-blue-200";
      case "مكتمل": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "ملغي": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand" />
            فعاليات المراكز التابعة
          </h1>
          <p className="text-gray-500 text-sm mt-1">إدارة فعاليات ودورات المراكز التابعة لغرفة مكة</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand/90 transition-all shadow-sm font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة فعالية مركز
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">إجمالي الفعاليات</p>
            <p className="text-xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">فعاليات قادمة (مجدولة)</p>
            <p className="text-xl font-black text-gray-900">{stats.upcoming}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">تم تنفيذها (مكتملة)</p>
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
            placeholder="بحث في الفعاليات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="flex-1 md:w-48 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-bold"
          >
            <option value="all">كل المراكز</option>
            {CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(evt => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={evt.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand/30 transition-all flex flex-col group relative"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${getStatusColor(evt.status)}`}>
                {evt.status}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(evt)} className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => evt.id && handleDelete(evt.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-1">{evt.title}</h3>
            <div className="flex items-center gap-1.5 mb-4 text-brand bg-brand/5 w-fit px-2 py-0.5 rounded text-xs font-bold">
              <Building2 className="w-3 h-3" />
              <span>{evt.centerName}</span>
            </div>
            
            <div className="mt-auto space-y-2 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-mono" dir="ltr">{evt.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono" dir="ltr">{evt.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
                <span className="font-bold px-1.5 py-0.5 bg-gray-100 rounded shrink-0">{evt.type}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد فعاليات مسجلة للمراكز أو مطابقة لبحثك</p>
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
                  {editingEvent ? "تعديل الفعالية" : "إضافة فعالية جديدة"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان الفعالية</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المركز</label>
                    <select
                      value={formData.centerName}
                      onChange={e => setFormData({...formData, centerName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                    >
                      {CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">نوع الفعالية</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                    >
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">التاريخ</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">الوقت</label>
                    <input
                      required
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">المكان / القاعة</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:bg-white transition-all text-sm font-bold"
                    />
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
                </div>

                <div className="flex justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
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
                    حفظ الفعالية
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
with open('src/pages/CentersEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
