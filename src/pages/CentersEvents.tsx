import React, { useState } from "react";
import { Calendar, Plus, Search, Trash2, MapPin, Building2, Clock, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFirestoreCollection } from "../lib/firebaseUtils";

export default function CentersEvents() {
  const { data: events, addDocument, deleteDocument } = useFirestoreCollection<any>("centers_events", []);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newCenter, setNewCenter] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCenter || !newDate || !newTime || !newLocation) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }
    await addDocument({
      title: newTitle,
      centerName: newCenter,
      date: newDate,
      time: newTime,
      location: newLocation,
      status: "مجدول"
    });
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewCenter("");
    setNewDate("");
    setNewTime("");
    setNewLocation("");
  };

  const filtered = events.filter(e => e.title.includes(searchTerm) || e.centerName?.includes(searchTerm));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-brand" />
            فعاليات إدارة المراكز
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-bold">إدارة وتنظيم الفعاليات والبرامج الخاصة بالمراكز التابعة</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> فعالية جديدة
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
        <Search className="absolute right-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن فعالية مركز..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 font-bold text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(evt => (
          <motion.div key={evt.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black bg-brand/10 text-brand px-2 py-1 rounded-md">{evt.centerName}</span>
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{evt.status}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-3">{evt.title}</h3>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold"><Calendar className="w-3.5 h-3.5 text-brand" /> {evt.date}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold"><Clock className="w-3.5 h-3.5 text-brand" /> {evt.time}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold"><MapPin className="w-3.5 h-3.5 text-brand" /> {evt.location}</div>
            </div>
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => deleteDocument(evt.id)} className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
              <div className="p-4 border-b flex justify-between"><h3 className="font-black text-gray-800">فعالية جديدة</h3><button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5" /></button></div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div><label className="text-xs font-bold block mb-1">المركز</label><input required className="w-full border p-2 rounded-xl text-sm" value={newCenter} onChange={e => setNewCenter(e.target.value)} placeholder="مثال: مركز التدريب" /></div>
                <div><label className="text-xs font-bold block mb-1">اسم الفعالية</label><input required className="w-full border p-2 rounded-xl text-sm" value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold block mb-1">التاريخ</label><input type="date" required className="w-full border p-2 rounded-xl text-sm" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
                  <div><label className="text-xs font-bold block mb-1">الوقت</label><input type="time" required className="w-full border p-2 rounded-xl text-sm" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
                </div>
                <div><label className="text-xs font-bold block mb-1">المكان</label><input required className="w-full border p-2 rounded-xl text-sm" value={newLocation} onChange={e => setNewLocation(e.target.value)} /></div>
                <div className="pt-4 flex justify-end"><button type="submit" className="px-5 py-2 bg-brand text-white font-bold rounded-xl text-sm flex gap-2"><CheckCircle className="w-4 h-4"/> حفظ</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
