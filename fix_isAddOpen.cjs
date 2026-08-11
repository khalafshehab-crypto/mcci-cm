const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const regex = /\{isAddOpen && \([\s\S]*?<\/form>\s*<\/motion\.div>\s*<\/div>\s*\)\}/;

const replacement = `{isAddOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Dark glass backdrop with fade overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body Card with Zoom bounce */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right flex flex-col max-h-[85vh]"
            >
              {/* Header block with solid header representation */}
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {editingComm ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : actionType === "إضافة" ? <Plus className="w-5 h-5 stroke-[2.5]" /> : <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {editingComm ? \`تعديل لجنة: \${editingComm.name}\` : actionType === "إضافة" ? "إجراءات اللجان" : actionType === "استيراد" ? "استيراد اللجان (CSV)" : "تصدير اللجان (Google Sheets)"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {editingComm || actionType === "إضافة" ? "يرجى التأكد من تسجيل البيانات بعناية لربطها بالنظام" : actionType === "استيراد" ? "اختر الحقول والبيانات المراد استيرادها" : "اختر الحقول والبيانات المراد تصديرها"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex flex-col h-full overflow-hidden">
                {!editingComm && (
                  <div className="px-6 pt-6 shrink-0">
                    <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner text-right" dir="rtl">
                      <button
                        type="button"
                        onClick={() => setActionType("إضافة")}
                        className={\`flex-1 py-2 rounded-lg font-black text-xs transition-all \${
                          actionType === "إضافة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                        }\`}
                      >
                        إضافة لجنة
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionType("استيراد")}
                        className={\`flex-1 py-2 rounded-lg font-black text-xs transition-all \${
                          actionType === "استيراد" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                        }\`}
                      >
                        استيراد اللجان
                      </button>
                      <button
                        type="button"
                        onClick={() => setActionType("تصدير")}
                        className={\`flex-1 py-2 rounded-lg font-black text-xs transition-all \${
                          actionType === "تصدير" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                        }\`}
                      >
                        تصدير اللجان
                      </button>
                    </div>
                  </div>
                )}

                {actionType === "إضافة" || editingComm ? (
                  <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                      {newMtgError && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-[11px] font-bold text-right flex items-center gap-2">
                          <span className="w-2 h-2 shrink-0 rounded-full bg-red-600 animate-pulse"></span>
                          <span className="flex-1">{newMtgError}</span>
                        </div>
                      )}

                      {/* Submitting context reason (ONLY required when editing) */}
                      {editingComm && (
                        <div className="space-y-1.5 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-right">
                          <label className="block text-xs font-black text-amber-800 mb-1">
                            سبب التعديل <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            placeholder="اكتب هنا سبب تغيير بيانات اللجنة (مثل: استبدال الأخصائي أو زيادة عدد الأعضاء)"
                            className="w-full h-11 bg-white border border-amber-350 rounded-xl px-4 text-xs font-bold text-right focus:ring-2 focus:ring-brand/20 outline-none transition-all placeholder-amber-600/55 text-amber-900"
                          />
                        </div>
                      )}

                      {/* Committee Name Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black text-gray-700">اسم اللجنة<span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="مثال: لجنة الاتصالات وتقنية المعلومات"
                          className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all"
                        />
                      </div>

                      {/* President & Strategic Plan Row */}
                      <div className={editingComm ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "w-full"}>
                        {editingComm && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-700">الرئيس<span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={president}
                              onChange={(e) => setPresident(e.target.value)}
                              placeholder="اسم الرئيس..."
                              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all"
                            />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-gray-700">الخطة الاستراتيجية<span className="text-red-500">*</span></label>
                          <select
                            value={strategicPlan}
                            onChange={(e) => setStrategicPlan(e.target.value)}
                            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all appearance-none"
                            dir="rtl"
                          >
                            <option value="قيد المراجعة">قيد المراجعة</option>
                            <option value="معتمدة">معتمدة</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Member Count Field */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-gray-700">عدد الأعضاء <span className="text-gray-400">(الافتراضي 10)</span></label>
                          <input
                            type="number"
                            min="1"
                            value={membersCount}
                            onChange={(e) => setMembersCount(parseInt(e.target.value) || 1)}
                            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all"
                          />
                        </div>

                        {/* Assign Specialist Field (Dynamic) */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-gray-700">أخصائي اللجنة</label>
                          <select
                            value={specialist}
                            onChange={(e) => setSpecialist(e.target.value)}
                            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all appearance-none"
                            dir="rtl"
                          >
                            <option value="غير محدد">غير محدد (لا يوجد أخصائي مكلف)</option>
                            {dynamicEmployees.filter(emp => emp !== "غير محدد").map(emp => (
                              <option key={emp} value={emp}>{emp}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Google Drive Library Link */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black text-gray-700 flex items-center justify-end gap-1.5">
                          <span>رابط المكتبة الرقمية للجنة (Google Drive)</span>
                          <FolderOutput className="w-3.5 h-3.5 text-blue-500" />
                        </label>
                        <input
                          type="url"
                          value={googleDriveUrl}
                          onChange={(e) => setGoogleDriveUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full h-11 bg-blue-50/30 border border-blue-100 rounded-xl px-4 text-xs font-mono font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all"
                        />
                      </div>

                      {/* Description Field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-black text-gray-700">وصف اللجنة (اختياري)</label>
                        <textarea
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          rows={3}
                          placeholder="اكتب أهداف اللجنة ومهامها باختصار..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    {/* Footer Actions (Submit / Cancel) */}
                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-row-reverse gap-3 shrink-0">
                      <button
                        type="submit"
                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                      >
                        {editingComm ? "حفظ التعديلات" : "اعتماد وتشكيل اللجنة"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddOpen(false)}
                        className="px-6 h-11 bg-white hover:bg-gray-100 border border-gray-200 text-gray-750 font-bold text-sm rounded-xl transition-all cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                      <p className="text-xs font-semibold text-gray-650 leading-relaxed bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                        {actionType === 'تصدير' ? 'سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات الفعالة تلقائياً.' : 'للاستيراد، يرجى اختيار ملف CSV مطابق للأعمدة المحددة.'}
                      </p>

                      <div className="space-y-2">
                        <span className="block text-xs font-black text-gray-700">{actionType === 'تصدير' ? 'تحديد الحقول المراد تصديرها:' : 'تحديد الحقول المراد استيرادها:'}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
                          {EXPORT_FIELDS_META.map(f => (
                            <label 
                              key={f.key} 
                              className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-150 hover:border-emerald-300 transition-colors cursor-pointer select-none"
                            >
                              <input 
                                type="checkbox"
                                checked={selectedExportFields.includes(f.key)}
                                onChange={() => toggleExportField(f.key)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                              />
                              <span className="text-xs font-extrabold text-gray-800">{f.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-row-reverse gap-3 shrink-0">
                      {actionType === 'تصدير' ? (
                        <button
                          type="button"
                          onClick={handleExportToGoogleSheets}
                          className="flex-1 min-w-[140px] h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                          <Upload className="w-4 h-4" />
                          <span>تصدير إلى Sheets</span>
                        </button>
                      ) : (
                        <label className="flex-1 min-w-[140px] h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95">
                          <Download className="w-4 h-4" />
                          <span>استيراد ملف CSV</span>
                          <input 
                            type="file" 
                            accept=".csv"
                            className="hidden" 
                            onChange={handleImportCSV}
                          />
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsAddOpen(false)}
                        className="px-6 h-11 bg-white hover:bg-gray-100 border border-gray-200 text-gray-750 font-bold text-sm rounded-xl transition-all cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
    console.log("Patched add modal successfully!");
} else {
    console.log("Could not find the target modal block. Regex failed.");
}
