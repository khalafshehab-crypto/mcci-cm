import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, Filter, Clock, Activity, User, FileText, Settings } from 'lucide-react';
import { useFirestoreCollection } from '../lib/firebaseUtils';

export default function SystemLogs() {
  const { data: logs, loading } = useFirestoreCollection<any>("system_logs", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState("الكل");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.details?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === "الكل" || log.moduleName === filterModule;
    return matchesSearch && matchesModule;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActionColor = (type: string) => {
    switch (type) {
      case "إنشاء": return "bg-emerald-100 text-emerald-700";
      case "تعديل": return "bg-blue-100 text-blue-700";
      case "حذف": return "bg-red-100 text-red-700";
      case "إحالة": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 font-sans pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#e8e4e4] p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute -left-24 -top-24 w-48 h-48 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">سجل الحركات الشامل</h2>
          </div>
          <p className="text-sm font-bold text-gray-500">مراقبة أمنية وتتبع لكافة العمليات التي تتم في النظام</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="ابحث في السجلات (حسب الموظف أو التفاصيل)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand outline-none"
          />
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand outline-none appearance-none"
          >
            <option value="الكل">جميع الأقسام</option>
            <option value="اللجان">اللجان</option>
            <option value="الفعاليات">الفعاليات</option>
            <option value="التوصيات">التوصيات</option>
            <option value="المهام">المهام</option>
            <option value="المحاضر">المحاضر</option>
            <option value="الإعدادات">الإعدادات</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-bold">جاري تحميل السجلات...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-bold">لا توجد حركات مسجلة تطابق بحثك.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600 font-black border-b border-gray-200 text-xs">
                <tr>
                  <th className="px-6 py-4">التاريخ والوقت</th>
                  <th className="px-6 py-4">الموظف (المستخدم)</th>
                  <th className="px-6 py-4">القسم (Module)</th>
                  <th className="px-6 py-4">نوع الإجراء</th>
                  <th className="px-6 py-4">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-gray-900">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {log.moduleName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${getActionColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
