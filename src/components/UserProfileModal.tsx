import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Building2, Shield, Users, Save, Lock, Plus } from 'lucide-react';
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const compressImage = (base64Str: string, callback: (compressed: string) => void) => {
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    const MAX_DIMENSION = 200;
    if (width > height) {
      if (width > MAX_DIMENSION) {
        height *= MAX_DIMENSION / width;
        width = MAX_DIMENSION;
      }
    } else {
      if (height > MAX_DIMENSION) {
        width *= MAX_DIMENSION / height;
        height = MAX_DIMENSION;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    }
  };
};

export default function UserProfileModal({ user, onClose, onUpdate }: { user: any, onClose: () => void, onUpdate: (user: any) => void }) {
  const [formId, setFormId] = useState(user?.id || "");
  const [formName, setFormName] = useState(user?.name || "");
  const [formPrefix, setFormPrefix] = useState(user?.prefix || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [formExtension, setFormExtension] = useState(user?.extension || "");
  const [formPhoto, setFormPhoto] = useState(user?.photo || "");
  const [formGoogleConsent, setFormGoogleConsent] = useState(user?.googleSyncConsent ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formPhone.trim()) {
      setError("يرجى تعبئة الحقول الأساسية.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...user,
        id: formId.trim(),
        name: formName.trim(),
        prefix: formPrefix.trim(),
        phone: formPhone.trim(),
        extension: formExtension.trim(),
        photo: formPhoto,
        googleSyncConsent: formGoogleConsent,
        isProfileComplete: true
      };

      if (formId.trim() !== String(user.id)) {
        // Check if new ID is taken
        const snap = await getDocs(query(collection(db, "employees"), where("id", "==", formId.trim())));
        if (!snap.empty && snap.docs[0].id !== String(user.id)) {
           setError("الرقم الوظيفي مسجل مسبقاً لموظف آخر.");
           setLoading(false);
           return;
        }
        
        // Create new doc and delete old
        await setDoc(doc(db, "employees", formId.trim()), payload);
        await deleteDoc(doc(db, "employees", String(user.id)));

        // Update committees if necessary (specialistId) - wrapped in try/catch to avoid permission blocking
        try {
          const commsQ = query(collection(db, "committees"), where("specialistId", "==", String(user.id)));
          const commsSnap = await getDocs(commsQ);
          for (const c of commsSnap.docs) {
             await updateDoc(doc(db, "committees", c.id), { specialistId: formId.trim(), specialist: formName.trim() });
          }
        } catch (e) {
          console.warn("Could not update committees with new ID due to permissions", e);
        }
      } else {
        // Just update
        await updateDoc(doc(db, "employees", String(user.id)), payload);
      }

      localStorage.setItem("current_user", JSON.stringify(payload));
      onUpdate(payload);
      onClose();
      window.dispatchEvent(new Event("storage"));
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right font-sans" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base md:text-lg">بياناتي الشخصية</h3>
              <p className="text-xs font-semibold text-gray-500">يرجى استكمال البيانات الرئيسية للبطاقة الوظيفية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-650 px-4 py-3 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Photo Upload */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2">
              <div className="w-full h-full rounded-xl sm:rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
                {formPhoto ? <img src={formPhoto} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-gray-300" />}
              </div>
              <label className="absolute bottom-[-8px] right-[-8px] w-8 h-8 bg-brand rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => { if (reader.result) compressImage(reader.result.toString(), setFormPhoto); };
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 md:gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الرقم الوظيفي</label>
                <input type="text" required disabled={user?.isProfileComplete} value={formId} onChange={(e) => setFormId(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-sm font-bold outline-none focus:border-brand disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">اللقب</label>
                <input type="text" placeholder="مثال: م.، د." value={formPrefix} onChange={(e) => setFormPrefix(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-sm font-bold outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الاسم كاملاً</label>
                <input type="text" required disabled={user?.isProfileComplete} value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-sm font-bold outline-none focus:border-brand disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم الجوال</label>
                <input type="text" required disabled={user?.isProfileComplete} value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-sm font-bold outline-none focus:border-brand disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">التحويلة</label>
                <input type="text" value={formExtension} onChange={(e) => setFormExtension(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-sm font-bold outline-none focus:border-brand" />
              </div>
              {!user?.isProfileComplete && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        checked={formGoogleConsent} 
                        onChange={(e) => setFormGoogleConsent(e.target.checked)}
                        className="w-4 h-4 text-brand bg-white border-gray-300 rounded focus:ring-brand"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 mb-1">المزامنة التلقائية مع حساب Google</p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                        أوافق على ربط حسابي للمزامنة التلقائية مع تقويم ومهام Google (Google Workspace) لإرسال الإشعارات والفعاليات إلى حسابي الشخصي تلقائياً.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Read Only Sections */}
              <div>
                <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">البريد الإلكتروني (المعرف الأساسي)</label>
                <div className="w-full h-10 bg-gray-100 border border-gray-200 rounded-xl px-3 text-sm font-bold text-gray-500 flex items-center justify-between cursor-not-allowed">
                  <span>{user.email}</span>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3">
                <h4 className="text-[11px] font-black text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand" /> التسكين في الهيكل التنظيمي المعتمد
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase">القطاع</label>
                    <div className="text-xs font-bold text-gray-900">{user.orgLevel2 || "-"}</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase">الإدارة</label>
                    <div className="text-xs font-bold text-gray-900">{user.orgLevel3 || "-"}</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase">القسم</label>
                    <div className="text-xs font-bold text-gray-900">{user.orgLevel4 || "-"}</div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase">التخصص الدقيق</label>
                    <div className="text-xs font-bold text-gray-900">{user.orgLevel5 || "-"}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-[11px] font-black text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand" /> صلاحيات الموظف بالنظام
                </h4>
                <div className="text-xs font-bold text-gray-900 mb-2">الدور الوظيفي: {user.roleAr || "-"}</div>
                {user.allowedPages && user.allowedPages.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.allowedPages.map((p: string, i: number) => (
                      <span key={i} className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md" dir="ltr">{p}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-500">لا توجد صلاحيات مخصصة</div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="text-[11px] font-black text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand" /> اللجان المرتبطة
                </h4>
                {user.committees && user.committees.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.committees.map((c: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-1 rounded-lg">{c}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 font-medium">غير مرتبط بأي لجنة حالياً</div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-4 md:px-6 py-2.5 bg-brand hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>جاري الحفظ...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ البيانات الشخصية
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
