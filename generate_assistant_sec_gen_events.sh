cat << 'INNER_EOF' > src/pages/AssistantSecGenEvents.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, CheckCircle, Search, Plus, X, Trash2, Edit2, Clock, MapPin, Download, CheckSquare
} from "lucide-react";
import { useFirestoreCollection } from "../lib/firebaseUtils";

interface AssistantEvent {
  id: string;
  title: string;
  eventType: "داخلية" | "خارجية" | "الإدارات التابعة" | "قطاعات أخرى";
  date: string;
  time: string;
  location: string;
  status: "مجدول" | "قيد التحضير" | "منتهي" | "ملغى";
  notes?: string;
  importedFrom?: string;
  originalEventId?: string;
}

export default function AssistantSecGenEvents() {
  const { data: myEvents, addDocument, updateDocument, deleteDocument } = useFirestoreCollection<AssistantEvent>("assistant_sec_gen_events", []);
  
  // Data for import
  const { data: committeesEvents } = useFirestoreCollection<any>("events", []);
  const { data: centersEvents } = useFirestoreCollection<any>("centers_events", []);
  const { data: affiliatesEvents } = useFirestoreCollection<any>("affiliates_events", []);

  const [currentUserObj, setCurrentUserObj] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // New Event Form
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<AssistantEvent["eventType"]>("داخلية");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Import Modal State
  const [importSearch, setImportSearch] = useState("");
  const [selectedImports, setSelectedImports] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        setCurrentUserObj(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const isSecretary = currentUserObj?.role === "SECRETARY" || currentUserObj?.role === "SYS_ADMIN";

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime || !newLocation) {
      alert("الرجاء تعبئة جميع الحقول الإلزامية");
      return;
    }

    await addDocument({
      title: newTitle,
      eventType: newType,
      date: newDate,
      time: newTime,
      location: newLocation,
      status: "مجدول",
      notes: newNotes,
    });

    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setNewLocation("");
    setNewNotes("");
  };

  const handleToggleImportSelection = (evt: any, source: string) => {
    const exists = selectedImports.find(s => s.originalId === evt.id);
    if (exists) {
      setSelectedImports(prev => prev.filter(s => s.originalId !== evt.id));
    } else {
      setSelectedImports(prev => [...prev, { ...evt, originalId: evt.id, source }]);
    }
  };

  const handleConfirmImport = async () => {
    for (const item of selectedImports) {
      await addDocument({
        title: item.title,
        eventType: "الإدارات التابعة",
        date: item.date || "",
        time: item.time || "",
        location: item.location || "",
        status: "مجدول",
        importedFrom: item.source,
        originalEventId: item.originalId,
      });
    }
    setIsImportModalOpen(false);
    setSelectedImports([]);
    alert("تم استيراد الفعاليات بنجاح");
  };

  const filteredEvents = myEvents.filter(e => e.title.includes(searchTerm) || e.location.includes(searchTerm));

  // Build combined events for import
  const allImportableEvents = [
    ...committeesEvents.map(e => ({ ...e, source: "إدارة اللجان" })),
    ...centersEvents.map(e => ({ ...e, source: "إدارة المراكز" })),
    ...affiliatesEvents.map(e => ({ ...e, source: "إدارة المنتسبين" }))
  ].filter(e => !myEvents.find(my => my.originalEventId === e.id)); // exclude already imported

  const filteredImportableEvents = allImportableEvents.filter(e => 
    e.title?.includes(importSearch) || e.source?.includes(importSearch)
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-brand" />
            فعاليات ومواعيد مساعد الأمين العام
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-bold">
            إدارة المواعيد الداخلية والخارجية والفعاليات المستوردة من الإدارات الأخرى
          </p>
        </div>
        {isSecretary && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-white border border-brand text-brand font-bold text-sm rounded-xl hover:bg-brand/5 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              استيراد فعاليات
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand/90 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              موعد جديد
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن موعد أو فعالية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(evt => (
          <motion.div key={evt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black bg-brand/10 text-brand px-2 py-1 rounded-md">
                {evt.eventType}
              </span>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                evt.status === "مجدول" ? "bg-blue-50 text-blue-600" : 
                evt.status === "قيد التحضير" ? "bg-yellow-50 text-yellow-600" :
                evt.status === "منتهي" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {evt.status}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-3 leading-tight">{evt.title}</h3>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <Calendar className="w-3.5 h-3.5 text-brand" /> {evt.date}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <Clock className="w-3.5 h-3.5 text-brand" /> {evt.time}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <MapPin className="w-3.5 h-3.5 text-brand" /> {evt.location}
              </div>
            </div>
            
            {evt.importedFrom && (
              <div className="text-[10px] bg-slate-50 text-slate-500 p-2 rounded-lg font-bold">
                مستوردة من: {evt.importedFrom}
              </div>
            )}

            {isSecretary && (
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                  onClick={() => deleteDocument(evt.id)}
                  className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {filteredEvents.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">
            لا توجد مواعيد أو فعاليات
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
            >
              <div className="bg-slate-50 p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand" /> إضافة موعد جديد
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddEvent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عنوان الموعد / الفعالية</label>
                  <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">النوع</label>
                    <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-bold">
                      <option value="داخلية">داخلية</option>
                      <option value="خارجية">خارجية</option>
                      <option value="الإدارات التابعة">الإدارات التابعة</option>
                      <option value="قطاعات أخرى">قطاعات أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">المكان</label>
                    <input required type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">التاريخ</label>
                    <input required type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">الوقت</label>
                    <input required type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات</label>
                  <textarea rows={3} value={newNotes} onChange={e => setNewNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-bold resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                    إلغاء
                  </button>
                  <button type="submit" className="px-5 py-2 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> حفظ الموعد
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-xl flex flex-col"
            >
              <div className="bg-brand/5 p-4 border-b border-brand/10 flex items-center justify-between shrink-0">
                <h3 className="font-black text-brand flex items-center gap-2">
                  <Download className="w-5 h-5" /> استيراد فعاليات ومواعيد من الإدارات الأخرى
                </h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100 shrink-0 relative">
                <Search className="absolute right-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث في فعاليات النظام..."
                  value={importSearch}
                  onChange={e => setImportSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-2">
                {filteredImportableEvents.map((evt: any) => {
                  const isSelected = selectedImports.some(s => s.originalId === evt.id);
                  return (
                    <div 
                      key={evt.id} 
                      onClick={() => handleToggleImportSelection(evt, evt.source)}
                      className={`p-3 rounded-xl border flex items-center gap-4 cursor-pointer transition-colors ${
                        isSelected ? "bg-brand/5 border-brand" : "bg-white border-gray-200 hover:border-brand/50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? "bg-brand border-brand" : "bg-white border-gray-300"}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-bold text-sm text-gray-900">{evt.title}</h4>
                          <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {evt.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {evt.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location || "غير محدد"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredImportableEvents.length === 0 && (
                  <div className="text-center py-10 text-gray-400 font-bold">
                    لا توجد فعاليات قابلة للاستيراد
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <span className="text-sm font-bold text-gray-600">
                  تم تحديد <span className="text-brand font-black mx-1">{selectedImports.length}</span> فعالية
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    إلغاء
                  </button>
                  <button 
                    onClick={handleConfirmImport}
                    disabled={selectedImports.length === 0}
                    className={`px-5 py-2 font-bold rounded-xl transition-colors text-sm flex items-center gap-2 ${
                      selectedImports.length > 0 ? "bg-brand text-white hover:bg-brand/90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Download className="w-4 h-4" /> تأكيد الاستيراد
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
INNER_EOF
