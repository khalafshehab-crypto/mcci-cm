import { extractAgendaClient } from "../lib/geminiClient";
import { showGlobalToast } from "../lib/toastUtils";
import { autoCreateEventDriveFolders, createGoogleCalendarEvent, updateGoogleCalendarEvent, getOrCreateFolder, uploadBinaryFileToDrive, downloadDriveFileBase64, getCachedAccessToken, deleteGoogleCalendarEvent } from "../lib/googleApi";
import React, { useState, useEffect, FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  RefreshCw, Calendar, CheckCircle, Search, Plus, X, Users2, Trash2, Edit2, LayoutGrid, List, SlidersHorizontal, AlertTriangle, Check, BookOpen, Clock, Presentation, MapPin, AlignLeft, Send, PlayCircle, Filter, Users, Settings, Copy, ChevronDown, ChevronUp, CheckSquare, Sparkles, Activity, Sliders, Lock
, Upload, Paperclip, Wand2, Loader2 , CalendarDays, ChevronRight, ChevronLeft} from "lucide-react";
import { Member } from "../data/initialMembers";
import { formatCommitteeNameArabic } from "../lib/arabicUtils";

interface EventItem {
  id: number;
  title: string;
  type: "مفردة" | "متسلسلة";
  date: string; // ISO or Display format
  time?: string; // e.g. "10:00"
  committeeId: number | string;
  committeeName: string;
  status: "تجهيز الفعاليات" | "تأكيد الموعد مع المسؤول" | "إرسال الدعوات" | "تأكيد الحضور" | "محضر الاجتماع" | "التوصيات" | "منتهية" | string;
  location: "حضوري" | "عن بعد";
  employees: string[];
  externalInvitees?: string[];
  members: number[]; // Array of member IDs
  notes: string;
  googleEventIds?: Record<string, string>;
  
  // New workflow step fields
  committeeConfirmed?: boolean;
  invitationSent?: boolean;
  invitationText?: string;
  confirmedAttendees?: number[];
  agenda?: Array<{
    id: string;
    title: string;
    duration: number;
    specialist: string;
    discussion?: string;
    recommendation?: string;
    assignee?: string;
    durationRec?: string;
    hasImpact?: boolean;
    impactType?: "عادية" | "آجل" | "ذات أثر";
    isUrgent?: boolean;
    isImportant?: boolean;
    workDays?: number;
    inactiveRecommendation?: boolean;
  }>;
  minutesSaved?: boolean;
  minutesExportChecked?: boolean;
  exportedRecommendationsToPage?: boolean;
  attendanceConfirmed?: boolean;
  preparationsConfirmed?: boolean;
  preparationsText?: string;
  preparationsChecklist?: string[];
  preparationsAdditional?: string;
  agendaTransferred?: boolean;
  attendanceListUrl?: string | File | null;
  approvedMinutesUrl?: string | File | null;
  xLink?: string;
  linkedinLink?: string;
  instagramLink?: string;
  otherAttachmentsUrl?: string | File | null;
  evidencesSaved?: boolean;
}

const DEFAULT_PREPARATIONS = [
  "التنسيق مع الأمن لدخول سيارات الأعضاء للمواقف العليا",
  "فتح بوابة القاعة مشعل الزايدي وتجهيز أجهزة تكييف الهواء قبل موعد الفعالية بـ 30 دقيقة",
  "تشغيل أجهزة العرض والشاشات والمايكروفونات وأجهزة الحاسب الآلي وتجهيز طاولة الإجتماع بالأوراق والمراسم",
  "تأمين ضيافة الإجتماع (ماء، قهوة، شاي، تمر)",
  "التنسيق مع الإعلام لتصوير وتغطية الفعالية والحدث لنشرها على وسائل التواصل الاجتماعي",
  "تأمين الأجهزة الفنية والشبكة (لاب توب - مايكات - الشاشة الترحيبية)",
  "مركز المسؤولية الاجتماعية (رابط تسجيل الساعات التطوعية للأعضاء)"
];

const EMPLOYEES = [
  "مدير النظام"
];



const ROOMS = ["G2", "G3", "G4", "المركاز", "رؤساء الغرفة", "سالم بن لادن", "مشعل الزايدي", "مصطفى رضا", "عادل كعكي", "يوسف الأحمدي", "المساندة", "مسرح صالح كامل", "خارج مقر الغرفة", "عن بعد", "مكتب مساعد الأمين العام", "مكتب الأمين"];
const EVENT_KINDS = ["اجتماع", "لقاء", "زيارة", "استضافة", "ورشة عمل", "ندوة", "حفل", "تدشين", "إطلاق مبادرة", "توقيع اتفاقية", "معرض", "دورة تدريبية", "ملتقى", "منتدى", "محاضرة"];
const CLASSIFICATIONS = ["دوري", "طارئ"];
const isWeekend = (dateStr: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getDay() === 5 || d.getDay() === 6;
};
const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const WEEKSMap: Record<string, number> = {"الأول": 0, "الثاني": 1, "الثالث": 2, "الرابع": 3};


const ordinalsToNumGlobalRec: Record<string, string> = {
  "التأسيسي": "1", "الأول": "1", "الثاني": "2", "الثالث": "3", "الرابع": "4", "الخامس": "5",
  "السادس": "6", "السابع": "7", "الثامن": "8", "التاسع": "9", "العاشر": "10",
  "الحادي عشر": "11", "الثاني عشر": "12", "الثالث عشر": "13", "الرابع عشر": "14", "الخامس عشر": "15",
  "السادس عشر": "16", "السابع عشر": "17", "الثامن عشر": "18", "التاسع عشر": "19", "العشرون": "20"
};

const getMeetingNumberRec = (title: string) => {
  if (!title) return "1";
  for (const [key, val] of Object.entries(ordinalsToNumGlobalRec)) {
    if (title.includes(` ${key} `) || title.endsWith(` ${key}`) || title.includes(`(${key})`) || title.includes(` ${key}`)) {
      return val;
    }
  }
  const match = title.match(/(\d+)/);
  if (match) return match[1];
  return "1";
};

const getCommitteeAbbrevRec = (name: string) => {
  if (!name) return "عام";
  const words = name.replace(/و/g, ' ').split(/\s+/).filter(w => w.trim() !== '' && !['في', 'من', 'عبر', 'على', 'لجنة', 'اللجنة', 'قطاع'].includes(w));
  return 'ل ' + words.map(w => w.replace(/^ال/, '')[0]).join(' ');
};

const getItemNumberRec = (recTitle: string) => {
    const match = recTitle.match(/توصية البند (.*?) "/);
    if (match && match[1]) {
        return ordinalsToNumGlobalRec[match[1]] || "1";
    }
    return "1";
};

const getYearStrRec = (dateStr: string) => {
    if (!dateStr) return "26";
    const year = new Date(dateStr).getFullYear();
    if (isNaN(year)) return "26";
    return year.toString().slice(-2);
};

const generateRecommendationRefNumber = (evt: any) => {
    if (evt.refNumber) return evt.refNumber;
    
    if (!evt.eventName || !String(evt.id).startsWith("custom-rec-")) {
        return `REC-${String(evt.id || "").substring(0, 5).toUpperCase()}`;
    }
    
    const cAbbrev = getCommitteeAbbrevRec(evt.committeeName || "");
    const mNum = getMeetingNumberRec(evt.eventName || "");
    const iNum = getItemNumberRec(evt.title || "");
    const yr = getYearStrRec(evt.date);
    return `${cAbbrev}-${mNum}-${iNum}-${yr}`;
};

const getArabicOrdinalGlobal = (n: number | string): string => {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return typeof n === "string" ? n : n.toString();
  const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
  if (num >= 0 && num <= 20) return ordinals[num];
  return num.toString();
};

const DAYSMaps: Record<string, number> = {"الأحد": 0, "الإثنين": 1, "الثلاثاء": 2, "الأربعاء": 3, "الخميس": 4};

const exportRecommendationsToLocalStorage = async (evt: EventItem, selectedAgendaItemIds?: string[]) => {
  const agenda = evt.agenda || [];
  let recsToExport = agenda.filter(item => item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation);
  if (selectedAgendaItemIds) {
    recsToExport = recsToExport.filter(item => selectedAgendaItemIds.includes(item.id));
  }
  
  if (recsToExport.length === 0) return 0;
  
  try {
    // 1. Write to app_custom_recommendations_alarms for compatibility / notifications
    const existingAlarmsRaw = localStorage.getItem("app_custom_recommendations_alarms");
    const existingAlarms = existingAlarmsRaw ? JSON.parse(existingAlarmsRaw) : [];
    
    const newAlarms = recsToExport.map((rec, index) => {
      const agendaIdx = agenda.findIndex(a => a.id === rec.id);
      const displayNum = agendaIdx !== -1 ? agendaIdx + 1 : index + 1;
      return {
      id: `custom-rec-${evt.id}-${rec.id || index}`,
      type: "recommendation" as const,
      title: `توصية البند ${getArabicOrdinalGlobal(displayNum)} "${rec.title}"`,
      description: rec.recommendation || "",
        recommendationText: rec.recommendation || "",
        recommendationDiscussion: rec.discussion || "",
      dept: evt.committeeName,
      isUrgent: !!rec.isUrgent,
      committee: evt.committeeName,
      dateStr: evt.date,
      status: "جديدة",
      responsible: rec.assignee || "غير محدد"
    }});
    
    const existingFiltered = existingAlarms.filter((a: any) => !a.id.startsWith(`custom-rec-${evt.id}-`));
    const mergedAlarms = [...existingFiltered, ...newAlarms];
    localStorage.setItem("app_custom_recommendations_alarms", JSON.stringify(mergedAlarms));
    
    // 2. Write directly to app_recommendations_custom for immediate sync inside the Recommendations page
    const existingCustomRaw = localStorage.getItem("app_recommendations_custom");
    let existingCustom = [];
    if (existingCustomRaw) {
      existingCustom = JSON.parse(existingCustomRaw);
    }
    if (!Array.isArray(existingCustom)) existingCustom = [];
    
    const newCustomRecs = recsToExport.map((rec, index) => {
      const agendaIdx = agenda.findIndex(a => a.id === rec.id);
      const displayNum = agendaIdx !== -1 ? agendaIdx + 1 : index + 1;
      const recId = `custom-rec-${evt.id}-${rec.id || index}`;
      return {
        id: recId,
        title: `توصية البند ${getArabicOrdinalGlobal(displayNum)} "${rec.title}"`,
        description: rec.recommendation || "",
        recommendationText: rec.recommendation || "",
        recommendationDiscussion: rec.discussion || "",
        committeeName: evt.committeeName || "لجنة الإعلام والتسويق",
        eventName: evt.title || "مصدرة من جدول أعمال الفعاليات",
        date: evt.date || "2026-06-11",
        status: "جديدة",
        approvalStage: "أخصائي",
        assignedTo: rec.assignee || "غير محدد",
        duration: rec.durationRec || "أسبوعين",
        attachments: (evt.approvedMinutesUrl && typeof evt.approvedMinutesUrl === 'string') 
          ? [{ id: "1", name: 'محضر الاجتماع المعتمد', url: evt.approvedMinutesUrl }] 
          : [],
        auditLogs: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: `تصدير تلقائي من فعالية: ${evt.title}`,
            user: "نظام حوكمة اللجان"
          }
        ],
        hasImpact: !!rec.hasImpact,
        isUrgent: !!rec.isUrgent,
        isImportant: !!rec.isImportant,
        impactType: rec.impactType || "عادية"
      };
    });
    
    // Write directly to Firestore "recommendations" collection for dynamic load
    await Promise.all(
      newCustomRecs.map(async (rec) => {
        try {
          await setDoc(doc(db, "recommendations", rec.id), rec);
        } catch (dbErr) {
          console.error("Firestore setDoc failed for recommendation:", rec.id, dbErr);
        }
      })
    );
    
    const customFiltered = existingCustom.filter((item: any) => !item.id.startsWith(`custom-rec-${evt.id}-`));
    const mergedCustom = [...customFiltered, ...newCustomRecs];
    localStorage.setItem("app_recommendations_custom", JSON.stringify(mergedCustom));
    
    return recsToExport.length;
  } catch (e) {
    console.error("Error exporting recommendations", e);
    return 0;
  }
};

import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc, setDoc } from '../lib/firebase';
import { db } from '../lib/firebase';
import { useFirestoreCollection, sendSystemAlert } from '../lib/firebaseUtils';
import { AttachmentInput } from "../components/AttachmentInput";




const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


function Step8Attachments({ evt, updateEventWorkflow }: { evt: any, updateEventWorkflow: (id: number, updates: any) => void }) {
  const [attendanceFile, setAttendanceFile] = React.useState<File | string | null>(evt.attendanceListUrl || null);
  const [minutesFile, setMinutesFile] = React.useState<File | string | null>(evt.approvedMinutesUrl || null);
  const [otherFile, setOtherFile] = React.useState<File | string | null>(evt.otherAttachmentsUrl || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [xLink, setXLink] = React.useState(evt.xLink || "");
  const [linkedinLink, setLinkedinLink] = React.useState(evt.linkedinLink || "");
  const [instagramLink, setInstagramLink] = React.useState(evt.instagramLink || "");

  const isComplete = attendanceFile && minutesFile;

  const handleFinalSave = async () => {
    try {
      setIsUploading(true);
      let finalAttendance = evt.attendanceListUrl;
      let finalMinutes = evt.approvedMinutesUrl;
      let finalOthers = evt.otherAttachmentsUrl;

      const uploadAttachment = async (file: File | string | null, fileName: string, targetFolderId: string) => {
        if (file && typeof file === "object" && "name" in file) {
          const ext = (file as any).name.split('.').pop();
          const fullFileName = `${fileName}.${ext}`;
          const base64 = await readFileAsBase64(file as any);
          
          const { uploadBinaryFileToDrive } = await import("../lib/googleApi");
          const res = await uploadBinaryFileToDrive(fullFileName, base64 as string, (file as any).type || "application/octet-stream", targetFolderId);
          return res && res.id ? `https://drive.google.com/file/d/${res.id}/view` : fullFileName;
        }
        return typeof file === "string" ? file : "";
      };

      const hasFilesToUpload = (attendanceFile && typeof attendanceFile === "object") || 
                               (minutesFile && typeof minutesFile === "object") ||
                               (otherFile && typeof otherFile === "object");

      if (hasFilesToUpload) {
        showGlobalToast("جاري معالجة ورفع المرفقات إلى Google Drive...", "loading");
        
        const { getOrCreateFolder, getCachedAccessToken, triggerAuthModal } = await import("../lib/googleApi");
        
        let token = await getCachedAccessToken();
        if (!token) {
          token = await triggerAuthModal();
          if (!token) {
            throw new Error("لم يتم تسجيل الدخول بحساب جوجل");
          }
        }

        const rootFolderId = await getOrCreateFolder("تقرير اللجان للدورة الـ 22");
        const approvedFolderId = await getOrCreateFolder("اللجان المعتمدة", rootFolderId);
        const committeeFolderId = await getOrCreateFolder(evt.committeeName || "عام", approvedFolderId);
        const eventsFolderId = await getOrCreateFolder("الفعاليات", committeeFolderId);
        
        let eventTitle = evt.eventName || evt.title || "بدون عنوان";
        let eventKind = "فعاليات أخرى";
        if (eventTitle.includes("اجتماع")) eventKind = "الاجتماعات";
        else if (eventTitle.includes("لقاء")) eventKind = "اللقاءات";
        else if (eventTitle.includes("زيارة")) eventKind = "الزيارات";
        else if (eventTitle.includes("ورشة عمل")) eventKind = "ورش العمل";
        
        const kindFolderId = await getOrCreateFolder(eventKind, eventsFolderId);
        const eventFolderId = await getOrCreateFolder(eventTitle, kindFolderId);

        if (attendanceFile && typeof attendanceFile === "object") {
          finalAttendance = await uploadAttachment(attendanceFile, `كشف حضور ${eventTitle}`, eventFolderId);
        }
        if (minutesFile && typeof minutesFile === "object") {
          finalMinutes = await uploadAttachment(minutesFile, `محضر ${eventTitle} المعتمد`, eventFolderId);
        }
        if (otherFile && typeof otherFile === "object") {
          finalOthers = await uploadAttachment(otherFile, `مرفقات أخرى لـ ${eventTitle}`, eventFolderId);
        }
      }

      updateEventWorkflow(evt.id, { 
        evidencesSaved: true, 
        status: "منتهية",
        attendanceListUrl: finalAttendance,
        approvedMinutesUrl: finalMinutes,
        otherAttachmentsUrl: finalOthers,
        xLink,
        linkedinLink,
        instagramLink
      });
      showGlobalToast("تم حفظ المرفقات بنجاح! تم تحويل الفعالية إلى منجزة.", "success");
    } catch (error: any) {
      console.error("Upload failed", error);
      showGlobalToast("فشل رفع المرفقات: " + (error.message || "خطأ غير معروف"), "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-brand" />
          المرفقات والشواهد الختامية
        </h3>
        <span className="text-[9px] text-gray-500 font-bold">مرحلة 8 من 8</span>
      </div>

      <p className="text-[10px] text-gray-550 leading-relaxed font-bold">
        يرجى إرفاق روابط المستندات المطلوبة عبر جوجل درايف. (كشف الحضور ومحضر الاجتماع إلزامية).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 mt-4">
        <div className="space-y-1.5">
          <AttachmentInput
            id={`attendance-${evt.id}`}
            label="كشف الحضور (إلزامي) *"
            value={attendanceFile}
            onChange={(val) => setAttendanceFile(val)}
          />
        </div>
        <div className="space-y-1.5">
          <AttachmentInput
            id={`minutes-${evt.id}`}
            label="محضر الاجتماع المعتمد (إلزامي) *"
            value={minutesFile}
            onChange={(val) => setMinutesFile(val)}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-bold text-gray-700">رابط منصة X (اختياري)</label>
          <input
            type="url"
            value={xLink}
            onChange={e => setXLink(e.target.value)}
            placeholder="https://x.com/..."
            className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:ring-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-bold text-gray-700">رابط منصة Linkedin (اختياري)</label>
          <input
            type="url"
            value={linkedinLink}
            onChange={e => setLinkedinLink(e.target.value)}
            placeholder="https://linkedin.com/..."
            className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:ring-brand"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9.5px] font-bold text-gray-700">رابط منصة Instagram (اختياري)</label>
          <input
            type="url"
            value={instagramLink}
            onChange={e => setInstagramLink(e.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full text-[10px] p-2 border border-gray-200 rounded-lg focus:ring-brand"
          />
        </div>

        <div className="space-y-1.5">
          <AttachmentInput
            id={`other-${evt.id}`}
            label="مرفقات أخرى (اختياري)"
            value={otherFile}
            onChange={(val) => setOtherFile(val)}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          disabled={!isComplete || isUploading}
          onClick={handleFinalSave}
          className={`px-3 sm:px-4 md:px-5 py-2.5 rounded-lg text-[10.5px] font-black flex items-center gap-2 transition-all ${
            (isComplete && !isUploading)
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {isUploading ? "جاري الرفع..." : "حفظ وإحالة إلى منجز"}
        </button>
      </div>
    </div>
  );
}





const syncEventsToCalendar = async (eventsList: any[], dbEmployees: any[], collectionName: string) => {
  let stats = { created: 0, updated: 0, failed: 0 };
  for (const evt of eventsList) {
    if (!evt.employees || evt.employees.length === 0) continue;
    
    let updatedGoogleEventIds = { ...(evt.googleEventIds || {}) };
    let hasChanges = false;
    
    const mainEmpName = evt.employees[0];
    const targetEmp = dbEmployees.find((e: any) => e.name === mainEmpName);
    
    const uniqueEmails = new Set<string>();
    for (const name of evt.employees || []) {
      const emp = dbEmployees.find((e: any) => e.name === name);
      if (emp && emp.email) {
        uniqueEmails.add(emp.email);
      }
    }
    const attendees = Array.from(uniqueEmails).map(email => ({ email }));

    try {
      let startObj: any = { date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] };
      let endObj: any = { date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0] };
      
      if (evt.date && evt.time) {
         const dt = new Date(`${evt.date}T${evt.time}:00+03:00`);
         if (!isNaN(dt.getTime())) {
            startObj = { dateTime: dt.toISOString() };
            const endDt = new Date(dt.getTime() + 60*60*1000);
            endObj = { dateTime: endDt.toISOString() };
         }
      }

      const payload: any = {
        summary: evt.title,
        description: "وقت الاجتماع: " + (evt.time || 'غير محدد') + "\nالقاعة: " + (evt.location || 'غير محدد') + "\nملاحظات: " + (evt.notes || ''),
        start: startObj,
        end: endObj,
        attendees: attendees
      };

      const targetEmail = targetEmp?.email;
      
      const existingEventId = Object.values(updatedGoogleEventIds)[0] as string | undefined;

      if (existingEventId) {
         try {
           await updateGoogleCalendarEvent(existingEventId, payload, targetEmail);
           stats.updated++;
         } catch (updateErr: any) {
           console.warn("Failed to update calendar event:", updateErr);
           
           // Forcefully recreate to guarantee sync
           console.warn("Event update failed or was rejected. Attempting to forcefully recreate...");
           try {
             try { await deleteGoogleCalendarEvent(existingEventId); } catch (e) {}
             const response = await createGoogleCalendarEvent(payload, targetEmail);
             if (response && response.id) {
               updatedGoogleEventIds = { "event_id": response.id };
               hasChanges = true;
               stats.created++;
             } else {
               stats.failed++;
             }
           } catch (recreateErr) {
             console.error("Recreation also failed:", recreateErr);
             stats.failed++;
           }
         }
      } else {
         const response = await createGoogleCalendarEvent(payload, targetEmail);
         if (response && response.id) {
           updatedGoogleEventIds = { "event_id": response.id };
           hasChanges = true;
           stats.created++;
         }
      }
    } catch (err) {
      console.warn("Failed to sync calendar for event", evt.title, err);
      stats.failed++;
    }
    
    if (hasChanges && collectionName) {
      try {
        await updateDoc(doc(db, collectionName, String(evt.id)), { googleEventIds: updatedGoogleEventIds });
      } catch (e) {
        console.warn("Failed to save googleEventIds", e);
      }
    }
  }
  return stats;
};

export default function AssistantSecGenEvents() {
  const location = useLocation();
  const { data: events, addDocument: addFirebaseEvent, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<EventItem>("assistant_sec_gen_events", []);
  const { data: rawCommittees } = useFirestoreCollection<any>("assistant_sec_gen_departments", []);
  const { data: allMembers } = useFirestoreCollection<Member>("members", []);
  const { data: dbEmployees } = useFirestoreCollection<any>("employees", []);
  const { data: allDbRecommendations } = useFirestoreCollection<any>("recommendations", []);

  const committees = rawCommittees.map(comm => {
     if (!comm) return comm;
     const assignedEmp = dbEmployees.find(emp => 
        emp && emp.active && emp.committees && emp.committees.includes(comm.name)
     );
     if (assignedEmp) return { ...comm, specialist: assignedEmp.name };
     return comm;
  }).filter(c => c && c.active !== false);

  const dynamicEmployees = React.useMemo(() => {
     // Unconditionally hide sys admin and root users from all employee lists, regardless of current user role
     const sourceList = dbEmployees.filter(e => 
         e && 
         e.role !== "SYS_ADMIN" &&
         e.id !== "01" && 
         e.name !== "شهاب الدين" && 
         e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
         (["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel1) || ["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel2) || ["مساعد الأمين", "مساعد الأمين العام"].includes(e.orgLevel3) || (e.title && e.title.includes("سكرتير")))
     );
     return sourceList.map(e => e.name).filter(Boolean);
  }, [dbEmployees]);


  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilterCommittees, setSelectedFilterCommittees] = useState<string[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isSyncing, setIsSyncing] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [eventsToSync, setEventsToSync] = useState<any[]>([]);
  const [selectedEventsToSync, setSelectedEventsToSync] = useState<number[]>([]);

  const handleManualSync = () => {
    // Determine allowed events
    let allowedEvents = events;
    if (false) {
       // Make sure we have a safe fallback if canUserEditCommittee fails or rejects all
       allowedEvents = events.filter((e: any) => {
         try {
           return canUserEditCommittee(e.committeeName);
         } catch(err) { return true; }
       });
       // If empty for some reason, just show all for the current section to avoid getting stuck
       if (allowedEvents.length === 0 && JSON.parse(localStorage.getItem("current_user") || "{}")?.role === "مدير النظام") {
          allowedEvents = events;
       }
    }
    setEventsToSync(allowedEvents);
    setSelectedEventsToSync(allowedEvents.map((e: any) => e.id));
    setIsSyncModalOpen(true);
  };

  const confirmManualSync = async () => {
    setIsSyncing(true);
    const currentCollectionName = "assistant_sec_gen_events";
    const toSync = eventsToSync.filter(e => selectedEventsToSync.includes(e.id));
    showGlobalToast("جاري مزامنة التقويم، يرجى الانتظار...", "loading");
    const stats = await syncEventsToCalendar(toSync, dbEmployees, currentCollectionName);
    setIsSyncing(false);
    setIsSyncModalOpen(false);
    if (stats && (stats.created > 0 || stats.updated > 0 || stats.failed > 0)) {
      showGlobalToast(`اكتملت المزامنة! تمت إضافة: ${stats.created}، وتحديث: ${stats.updated}، وفشل: ${stats.failed}`, "success");
    } else {
      showGlobalToast("لا توجد مواعيد جديدة للمزامنة.", "success");
    }
  };
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', { month: 'long', year: 'numeric' }).format(date);
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
const [viewMode, setViewMode] = useState<"grid" | "table" | "calendar">("grid");
  const [selectedCommIdForCards, setSelectedCommIdForCards] = useState<number | null>(null);
  const [selectedEventKindForCards, setSelectedEventKindForCards] = useState<string | null>(null);
  const [selectedClassificationForCards, setSelectedClassificationForCards] = useState<string | null>(null);

    const canUserEditCommittee = (committeeName: string): boolean => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return true;
      const user = JSON.parse(stored);
      if (!user) return true;
      const mgmtRoles = ["SYS_ADMIN", "MANAGER", "DEPT_HEAD", "MANAG_DIR", "EXECUTIVE_OFFICE", "ASSISTANT_SEC_GEN", "SECRETARY_GENERAL"];
      if (mgmtRoles.includes(user.role)) return true;
      if (user.committees && Array.isArray(user.committees)) {
        return user.committees.includes(committeeName) || user.committees.includes("عام") || committeeName === "عام" || committeeName === "الجميع";
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeletingLoading, setIsBulkDeletingLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [activeGearMenuId, setActiveGearMenuId] = useState<number | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventItem | null>(null);

  // New States for Checklist & Workflow Management
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [selectedAgendaRecsExport, setSelectedAgendaRecsExport] = useState<Record<string, boolean>>({});
  const [activeStepTab, setActiveStepTab] = useState<Record<number, number>>({}); // Maps eventId -> step tab index
  const [agendaFormTitle, setAgendaFormTitle] = useState("");
  const [agendaFormDuration, setAgendaFormDuration] = useState(15);
  const [agendaFormSpecialistId, setAgendaFormSpecialistId] = useState("");
  const [editingAgendaItemId, setEditingAgendaItemId] = useState<string | null>(null);
  const [agendaMinutesFiles, setAgendaMinutesFiles] = useState<Record<string, File | string | null>>({});
  const [isReadingMinutes, setIsReadingMinutes] = useState(false);

  const [copiedEventId, setCopiedEventId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalEvent, setExportModalEvent] = useState<EventItem | null>(null);

  // Helper date-to-day name
  const getDayNameFromDate = (dateStr: string) => {
    try {
      const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const d = new Date(dateStr);
      return days[d.getDay()];
    } catch {
      return "اليوم المحدد";
    }
  };

  // Format date in Arabic (e.g. 14 يونيو 2026م)
  const formatDateArabicStyle = (dateStr?: string) => {
    if (!dateStr) return "غير محدد";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      const yearNum = d.getFullYear();
      return `${dayNum} ${monthName} ${yearNum}م`;
    } catch {
      return dateStr;
    }
  };

  const formatTimeArabicStyle = (timeStr?: string) => {
    if (!timeStr) return "غير محدد";
    try {
      const [h, m] = timeStr.split(':');
      let hours = parseInt(h, 10);
      if (isNaN(hours)) return timeStr;
      const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const paddedHour = hours.toString().padStart(2, '0');
      return `${paddedHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const calculateWorkingDaysDate = (startDateStr: string, workingDays: number): string => {
    if (!startDateStr || isNaN(workingDays) || workingDays <= 0) return "";
    let curr = new Date(startDateStr);
    let count = 0;
    while (count < workingDays) {
      curr.setDate(curr.getDate() + 1);
      const day = curr.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
      if (day !== 5 && day !== 6) { // Exclude Friday (5) and Saturday (6)
        count++;
      }
    }
    return curr.toISOString().split('T')[0];
  };

  // Helper to determine active next step
  const getCalculatedNextStep = (evt: EventItem) => {
    if (!evt.committeeConfirmed) {
      return "تأكيد الموعد مع المسؤول";
    }
    if (!evt.invitationSent) {
      return "إرسال الدعوات";
    }
    if (!evt.attendanceConfirmed) {
      return "تأكيد حضور الأعضاء";
    }
    if (!evt.preparationsConfirmed) {
      return "تجهيزات اللقاء";
    }
    if (!evt.agenda || evt.agenda.length === 0 || !evt.agendaTransferred) {
      return "جدول الأعمال";
    }
    if (!evt.minutesSaved) {
      return "محضر الاجتماع";
    }
    if (!evt.exportedRecommendationsToPage) {
      return "التوصيات";
    }
    if (!evt.evidencesSaved) {
      return "المرفقات والشواهد";
    }
    return "منتهية";
  };

  const getStepIndex = (nextStep: string) => {
    switch (nextStep) {
      case "تأكيد الموعد مع المسؤول": return 0;
      case "إرسال الدعوات": return 1;
      case "تأكيد حضور الأعضاء": return 2;
      case "تجهيزات اللقاء": return 3;
      case "جدول الأعمال": return 4;
      case "محضر الاجتماع": return 5;
      case "التوصيات": return 6;
      case "المرفقات والشواهد": return 7;
      default: return 6;
    }
  };

  // Helper to update specific event workflow fields and commit to parent and localStorage
  const updateEventWorkflow = (eventId: number, updates: Partial<EventItem>) => {
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (targetEvent && !canUserEditCommittee(targetEvent.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لتعديل فعاليات هذه اللجنة. يمكنك فقط إدارة فعاليات مساعد الأمين العام المكلف بها.");
      return;
    }
    const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {
        const updatesToSave = { ...updates };
        const updated = { ...evt, ...updates };
        
        // Dynamic Quorum side-effect
        if ('confirmedAttendees' in updates) {
          const commMems = allMembers.filter(m => (String(m.committeeId) === String(updated.committeeId) || String(m.secondaryCommitteeId) === String(updated.committeeId)) && m.active !== false);
          const presentIds = updates.confirmedAttendees || [];
          const presentMems = commMems.filter(m => presentIds.includes(m.id));
          const ratioMet = commMems.length > 0 ? (presentMems.length >= (commMems.length / 2)) : false;
          const leadersPresent = presentMems.some(m => m.role === "رئيس" || m.role === "نائب" || m.role?.includes("رئيس") || m.role?.includes("نائب") || m.role?.includes("أمين"));
          const quorumMet = ratioMet && leadersPresent;
          
          if (quorumMet) {
            updatesToSave.status = "مؤكد";
          } else {
            updatesToSave.status = "تأكيد الحضور";
          }
        }
        updateFirebaseEvent(String(eventId), updatesToSave);
    }
  };

  const [isAutoFillingMinutes, setIsAutoFillingMinutes] = useState<Record<string, boolean>>({});

  const handleAutoFillMinutesFromAgenda = async (evt: any, checked: boolean) => {
    updateEventWorkflow(evt.id, { agendaTransferred: checked });
    
    if (!checked) return;
    const agenda = evt.agenda || [];
    if (agenda.length === 0) return;

    const agendaMinutesFile = agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null);
    if (!agendaMinutesFile) return;

    setIsAutoFillingMinutes(prev => ({ ...prev, [evt.id]: true }));
    showGlobalToast("جاري استخراج المناقشات والتوصيات تلقائياً...", "success");

    try {
        let fileBase64 = null;
        let mimeType = null;
        let fileId = null;
        let accessToken = null;
        
        try {
            accessToken = await getCachedAccessToken();
        } catch(e) {}
        
        if (typeof agendaMinutesFile === 'string') {
            const match = agendaMinutesFile.match(/[-\w]{25,}/);
            if (match) {
                fileId = match[0];
                showGlobalToast("جاري جلب المحضر من جوجل درايف...", "success");
            } else {
                showGlobalToast("جاري تنزيل المحضر من جوجل درايف...", "success");
                const driveData = await downloadDriveFileBase64(agendaMinutesFile);
                fileBase64 = driveData.base64;
                mimeType = driveData.mimeType;
            }
        } else {
            let uploadedToDrive = false;
            let docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
            if (accessToken) {
                try {
                    const folderId = await autoCreateEventDriveFolders(evt, []);
                    if (folderId) {
                        const reader = new FileReader();
                        const b64 = await new Promise((resolve) => {
                            reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                            reader.readAsDataURL(agendaMinutesFile as File);
                        });
                        mimeType = (agendaMinutesFile as File).type;
                        const res = await uploadBinaryFileToDrive(docName, b64 as string, mimeType, folderId);
                        if (res && res.id) {
                            fileId = res.id;
                            uploadedToDrive = true;
                            const fileUrl = `https://drive.google.com/file/d/${res.id}/view`;
                            updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                            showGlobalToast("تم جلب الملف وأرشفته في جوجل درايف بنجاح", "success");
                        } else {
                            fileBase64 = b64;
                        }
                    }
                } catch (e) {
                    console.error("Drive auto-archive failed:", e);
                }
            }
            if (!uploadedToDrive) {
                if ((agendaMinutesFile as File).size > 15 * 1024 * 1024) {
                    throw new Error("حجم الملف كبير جداً للاستخراج المباشر (أكثر من 15 ميجا). يرجى التأكد من تسجيل الدخول بحساب جوجل ليتم أرشفته أولاً.");
                }
                const reader = new FileReader();
                fileBase64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                    reader.readAsDataURL(agendaMinutesFile as File);
                });
                mimeType = (agendaMinutesFile as File).type;
            }
        }

        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\nقائمة البنود الحالية:\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\n[{\"id\": \"id-1\", \"title\": \"عنوان البند\", \"discussion\": \"نص المناقشة\", \"recommendation\": \"نص التوصية\", \"assignee\": \"اسم المسؤول\", \"durationRec\": \"يومين\"}]\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";

        
        let aiText = "";
        try {
            aiText = await extractAgendaClient(prompt, fileBase64, mimeType, fileId, accessToken);
        } catch (e) {
            console.error(e);
            showGlobalToast("خطأ في قراءة المحضر: " + (e.message || "فشل غير معروف"), "error");
            setIsReadingMinutes(false);
            return;
        }
    
        const jsonMatch = aiText.match(/\[.*\]/s);
        if (jsonMatch) {
            const parsedItems = JSON.parse(jsonMatch[0]);
            const updatedAgenda = agenda.map((item: any) => {
                const filledData = parsedItems.find((p: any) => String(p.id) === String(item.id) || (p.title && item.title && p.title.trim() === item.title.trim()));
                if (filledData) {
                    return {
                        ...item,
                        discussion: filledData.discussion || item.discussion || "",
                        recommendation: filledData.recommendation || item.recommendation || "",
                        assignee: filledData.assignee || item.assignee || "",
                        durationRec: filledData.durationRec || item.durationRec || ""
                    };
                }
                return item;
            });
            updateEventWorkflow(evt.id, { agenda: updatedAgenda });
            showGlobalToast("تمت تعبئة المناقشات والتوصيات بنجاح", "success");
        } else {
            showGlobalToast("لم يتمكن النظام من استخراج المناقشات، يرجى تعبئتها يدوياً", "error");
        }
    } catch (error: any) {
        console.error(error);
        showGlobalToast(error.message || "حدث خطأ أثناء التعبئة التلقائية", "error");
    } finally {
        setIsAutoFillingMinutes(prev => ({ ...prev, [evt.id]: false }));
    }
  };

  // Generate dynamic invitation template text
  const getGeneratedInvitation = (e: EventItem) => {
    if (e.invitationText) return e.invitationText;
    const day = getDayNameFromDate(e.date);
    const titleText = e.title || "اللقاء";
    const arabicDate = formatDateArabicStyle(e.date);
    const arabicTime = formatTimeArabicStyle(e.time);
    
    const agenda = e.agenda || [];
    const agendaText = agenda.length > 0 
      ? agenda.map(item => item.title).join(" - ") 
      : "بنود الاجتماع";

    return `أصحاب السعادة/ رئيس وأعضاء اللجنة المحترمين
السلام عليكم ورحمة الله وبركاته
نهديكم أطيب تحية وتقدير ..
يسرنا دعوتكم لحضور ${titleText} 
المقرر عقده بمشيئة الله يوم ${day} الموافق ${arabicDate} في تمام الساعة ${arabicTime} 
مكان الاجتماع: [${e.location || "مكتب الأمين"}]
وذلك لمناقشة: [${agendaText}].
نأمل من سعادتكم التكرم بتأكيد الحضور.

شاكرين ومقدرين لكم حرصكم`;
  };

  // Generate dynamic preparations template text
  const getGeneratedPreparations = (e: EventItem) => {
    if (e.preparationsText) return e.preparationsText;
    
    const day = getDayNameFromDate(e.date);
    const titleText = e.title || "اللقاء";
    
    const arabicDate = formatDateArabicStyle(e.date);
    const arabicTime = formatTimeArabicStyle(e.time);
    
    const presentCount = e.confirmedAttendees ? e.confirmedAttendees.length : 0;
    const commMembersCount = allMembers.filter(m => String(m.committeeId) === String(e.committeeId) || String(m.secondaryCommitteeId) === String(e.committeeId)).length;
    const totalCount = presentCount || commMembersCount || 1;
    const membersWord = `${totalCount} أعضاء`;

    const currentPreps = e.preparationsChecklist !== undefined ? e.preparationsChecklist : DEFAULT_PREPARATIONS;
    
    // Format the items list dynamically
    let formattedItems = currentPreps.map(item => `- ${item}`).join("\n");
    
    if (e.preparationsAdditional && e.preparationsAdditional.trim() !== "") {
      const additionalLines = e.preparationsAdditional
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => line.startsWith("-") ? line : `- ${line}`);
      if (additionalLines.length > 0) {
        if (formattedItems) {
          formattedItems += "\n" + additionalLines.join("\n");
        } else {
          formattedItems = additionalLines.join("\n");
        }
      }
    }

    if (!formattedItems) {
      formattedItems = "- (الرجاء اختيار عناصر من قائمة التحقق أو إضافة طلب مخصص)";
    }

    return `سعادة الأستاذ/ محمد بن محسن السبيعي سلمه الله
رئيس قسم اللجان
السلام عليكم ورحمه الله وبركاته .. وبعد

نظراً لقرب موعد ${titleText} يوم ${day} الموافق ${arabicDate} في تمام الساعة ${arabicTime} لعدد حضور (${membersWord}).

عليه نأمل منكم توجيه من يلزم بضرورة تأمين طلبات الاجتماع وهي على النحو التالي:

${formattedItems}

شاكرين ومقدرين لسعادتكم حسن تعاونكم..
وتفضلوا بقبول وافر التحية والتقدير،،،`;
  };

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  const [newType, setNewType] = useState<"مفردة" | "متسلسلة">("مفردة");
  const [newDate, setNewDate] = useState("");
  const [newCommitteeId, setNewCommitteeId] = useState<number | string>(0);
  const [newStatus, setNewStatus] = useState<EventItem["status"]>("تجهيز الفعاليات");
  const [newLocation, setNewLocation] = useState<"حضوري" | "عن بعد">("حضوري");
  const [newEmployees, setNewEmployees] = useState<string[]>([]);
  const [newMembers, setNewMembers] = useState<number[]>([]);
  const [newNotes, setNewNotes] = useState("");

  // Single specific form state
  const [singleKind, setSingleKind] = useState("");
  const [singleClassification, setSingleClassification] = useState("");
  const [singleEventNumber, setSingleEventNumber] = useState("الأول");
  const [isSeqManuallyEdited, setIsSeqManuallyEdited] = useState(false);
  const [singleTime, setSingleTime] = useState("");
  const [singleRoom, setSingleRoom] = useState("");
  const [singleEmployee, setSingleEmployee] = useState(dynamicEmployees[0] || "");
  const [singleAdditionalInvitees, setSingleAdditionalInvitees] = useState<string[]>([]);
  const [seriesAdditionalInvitees, setSeriesAdditionalInvitees] = useState<string[]>([]);
  const [isSingleInviteesOpen, setIsSingleInviteesOpen] = useState(false);
  const [isSeriesInviteesOpen, setIsSeriesInviteesOpen] = useState(false);
  const [singleExternalInvitees, setSingleExternalInvitees] = useState<string[]>([]);
  const [seriesExternalInvitees, setSeriesExternalInvitees] = useState<string[]>([]);
  const [isSingleMembersOpen, setIsSingleMembersOpen] = useState(false);
  const [isSeriesMembersOpen, setIsSeriesMembersOpen] = useState(false);
  const [externalInput, setExternalInput] = useState("");
  const [seriesExternalInput, setSeriesExternalInput] = useState("");

  
  const allGroupedEmployees = React.useMemo(() => {
    const list = dbEmployees.filter((e: any) => 
      e && e.role !== "SYS_ADMIN" && e.id !== "01" && e.name !== "شهاب الدين" && e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && e.active
    );
    const grouped = list.reduce((acc: any, emp: any) => {
      const groupName = emp.orgLevel3 || emp.orgLevel2 || "أخرى";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push({ name: emp.name, email: emp.email });
      return acc;
    }, {});
    return grouped;
  }, [dbEmployees]);

  const allEmployeesNames = React.useMemo(() => {
    return dbEmployees.filter((e: any) => e && e.role !== "SYS_ADMIN" && e.id !== "01" && e.name !== "شهاب الدين" && e.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && e.active).map((e: any) => e.name);
  }, [dbEmployees]);

  useEffect(() => {
    setIsSeqManuallyEdited(false);
  }, [newCommitteeId, singleKind, singleClassification]);

  const getArabicOrdinal = (n: number | string): string => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return typeof n === "string" ? n : n.toString();
    const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
    if (num >= 0 && num <= 20) return ordinals[num];
    return num.toString();
  };

  useEffect(() => {
    if (isSeqManuallyEdited) return; // skip auto-calculating if user manually changed it
    if (newType === "مفردة" && newCommitteeId > 0) {
      const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { return; }
      const classifStr = singleClassification === "دوري" ? "الدوري" : singleClassification === "استثنائي" ? "الاستثنائي" : singleClassification === "طارئ" ? "الطارئ" : singleClassification === "فريق عمل" ? "فريق العمل" : singleClassification;
      const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
      const prefixToMatch = (singleKind === "اجتماع" ? `${singleKind} ${formattedCommName} ${classifStr}` : `${singleKind} ${formattedCommName}`).trim();
      const count = events.filter(e => e.committeeId === newCommitteeId && e.title.startsWith(prefixToMatch)).length;
      setSingleEventNumber(getArabicOrdinalGlobal(count + 1));
    }
  }, [newType, singleKind, newCommitteeId, singleClassification, committees, events, isSeqManuallyEdited]);

  useEffect(() => {
    if (isTitleManuallyEdited) return;
    if (newType === "مفردة") {
      const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { return; }
      const classifStr = singleClassification === "دوري" ? "الدوري" : singleClassification === "استثنائي" ? "الاستثنائي" : singleClassification === "طارئ" ? "الطارئ" : singleClassification === "فريق عمل" ? "فريق العمل" : singleClassification;
      const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
      const numWord = getArabicOrdinalGlobal(singleEventNumber);
      let autoTitle = (singleKind === "اجتماع" ? `${singleKind} ${formattedCommName} ${classifStr} ${numWord}` : `${singleKind} ${formattedCommName} ${numWord}`).trim();
      if (singleKind === "اجتماع" && singleClassification === "دوري" && numWord === "الأول") {
        autoTitle += " (التأسيسي)";
      }
      setNewTitle(autoTitle);
    }
  }, [newType, singleKind, newCommitteeId, singleClassification, singleEventNumber, committees, isTitleManuallyEdited]);

  useEffect(() => {
    if (location.state && (location.state as any).selectedEventId) {
      const targetId = String((location.state as any).selectedEventId);
      if (events && events.length > 0) {
        const found = events.find(e => String(e.id) === targetId);
        if (found) {
          setViewMode("table");
          setExpandedEventId(targetId as any);
          setTimeout(() => {
            const el = document.getElementById(`event-row-${targetId}`) || document.getElementById(`event-card-${targetId}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }
    }
  }, [location.state, events]);

  // Series specific form state
  const [seriesKind, setSeriesKind] = useState("");
  const [seriesClassification, setSeriesClassification] = useState("");
  const [seriesAssignedEmployee, setSeriesAssignedEmployee] = useState(dynamicEmployees[0] || "");
  const [seriesDayOfWeek, setSeriesDayOfWeek] = useState("الأحد");
  const [seriesStartDate, setSeriesStartDate] = useState("");
  const [seriesEndDate, setSeriesEndDate] = useState("");
  const [seriesWeekOfMonth, setSeriesWeekOfMonth] = useState("الأول");
  const [seriesTime, setSeriesTime] = useState("");
  const [seriesRooms, setSeriesRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  
  // Series generation state
  const [generatedSchedules, setGeneratedSchedules] = useState<{id: number, date: string, title: string, time: string}[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [isConfirmingSeries, setIsConfirmingSeries] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  const handleSearchCommit = (e: FormEvent) => {
    e.preventDefault();
    setFilterQuery(searchQuery);
    setIsSearchExpanded(false);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setFilterQuery("");
    setIsSearchExpanded(false);
  };

  const filteredEvents = events.filter((e) => {
    // Hide recommendation pseudo-events
    if (e.recommendationClassification) return false;

    if (selectedFilterCommittees.length > 0 && !selectedFilterCommittees.includes(String(e.committeeId))) return false;
    const term = filterQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      (e.title || "").toLowerCase().includes(term) ||
      (e.committeeName || "").toLowerCase().includes(term) ||
      (e.type || "").toLowerCase().includes(term) ||
      (e.location || "").toLowerCase().includes(term) ||
      (e.status || "").toLowerCase().includes(term) ||
      (e.date || "").toLowerCase().includes(term)
    );
  });

  const getEventTimeValue = (evt: EventItem) => {
    try {
      if (!evt.date) return 0;
      let dateStr = evt.date;
      if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts[0].length === 2 && parts[2].length === 4) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      let timeStr = evt.time || "00:00";
      timeStr = timeStr.replace(/[^\d:]/g, '').trim();
      if (!timeStr) timeStr = "00:00";
      if (timeStr.length === 4 && timeStr.indexOf(":") === 1) {
         timeStr = "0" + timeStr;
      }
      if (timeStr.split(":").length === 2) {
         timeStr += ":00"; // Safari support
      }
      let ts = new Date(`${dateStr}T${timeStr}`).getTime();
      if (isNaN(ts)) {
         ts = new Date(`${dateStr} ${timeStr}`).getTime();
      }
      if (isNaN(ts)) {
         ts = new Date(dateStr).getTime();
      }
      return isNaN(ts) ? 0 : ts;
    } catch (_) {
      return 0;
    }
  };

  const isEventCompleted = (evt: EventItem): boolean => {
    const stepValues = [
      !!evt.committeeConfirmed,
      !!evt.invitationSent,
      !!evt.attendanceConfirmed,
      !!evt.preparationsConfirmed,
      !!(evt.agenda && evt.agenda.length > 0 && evt.agendaTransferred),
      !!evt.minutesSaved,
      !!evt.exportedRecommendationsToPage
    ];
    return stepValues.filter(Boolean).length === 7;
  };

  const getEventClassification = (title: string): string => {
    if (title.includes("الدوري") || title.includes("دوري")) return "دوري";
    if (title.includes("الاستثنائي") || title.includes("استثنائي")) return "استثنائي";
    if (title.includes("فريق العمل") || title.includes("فريق عمل")) return "فريق عمل";
    if (title.includes("الطارئ") || title.includes("طارئ")) return "طارئ";
    return "دوري";
  };

  const sortedTableEvents = React.useMemo(() => {
    const list = [...filteredEvents];
    const nowTimestamp = Date.now();
    
    return list.sort((a, b) => {
      const timeValA = getEventTimeValue(a);
      const timeValB = getEventTimeValue(b);
      
      // Determine if event is past (before beginning of today for strictness, but exact time is fine too)
      const aIsPast = timeValA > 0 && timeValA < nowTimestamp;
      const bIsPast = timeValB > 0 && timeValB < nowTimestamp;
      
      const aComp = isEventCompleted(a);
      const bComp = isEventCompleted(b);
      
      const aDone = aComp || aIsPast;
      const bDone = bComp || bIsPast;
      
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      
      if (aDone && bDone) {
        // Both are past or completed, sort most recent first
        return timeValB - timeValA;
      }
      
      // Both are future, sort closest to now first
      return timeValA - timeValB;
    });
  }, [filteredEvents]);

  const resetForm = () => {
    setNewTitle("");
    setIsTitleManuallyEdited(false);
    setNewType("مفردة");
    setNewDate(new Date().toISOString().split("T")[0]);
    setNewCommitteeId(0);
    setNewStatus("تجهيز الفعاليات");
    setNewLocation("حضوري");
    setNewEmployees([]);
    setNewMembers([]);
    setNewNotes("");
    
    // reset single
    setSingleKind("");
    setSingleClassification("");
    setSingleEventNumber("الأول");
    setSingleTime("");
    setSingleRoom("");
    setSingleEmployee(dynamicEmployees[0] || "");
    setSingleExternalInvitees([]);
    
    // reset series
    setSeriesKind("");
    setSeriesClassification("");
    setSeriesAssignedEmployee(dynamicEmployees[0] || "");
    setSeriesDayOfWeek("الأحد");
    setSeriesStartDate("");
    setSeriesEndDate("");
    setSeriesWeekOfMonth("الأول");
    setSeriesTime("");
    setSeriesRooms([]);
    setGeneratedSchedules([]);
    setSelectedSchedules([]);
    setIsConfirmingSeries(false);
    
    setEditingEvent(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    if (!canUserEditCommittee(evt.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لتعديل هذه الفعالية. يمكنك فقط تعديل فعاليات مساعد الأمين العام المكلف بها.");
      return;
    }
    setEditingEvent(evt);
    setNewTitle(evt.title);
    setIsTitleManuallyEdited(true);
    setNewType("مفردة"); // Force editing to behave as a single occurrence
    setNewDate(evt.date);
    setNewCommitteeId(evt.committeeId);
    setNewStatus(evt.status);
    setNewLocation(evt.location);
    setNewEmployees(evt.employees);
    setNewMembers(evt.members || []);
    setNewNotes(evt.notes);
    
    setSingleTime(evt.time || "");
      setSingleExternalInvitees(evt.externalInvitees || []);
      setSingleRoom(evt.location || "");
      setSingleEmployee(evt.employees?.[0] || "");
      setSingleAdditionalInvitees(evt.employees?.slice(1) || []);
      let mKind = "";
    for (const k of ["اجتماع", "لقاء", "زيارة", "استضافة", "ورشة عمل", "ندوة", "حفل", "تدشين", "إطلاق مبادرة", "توقيع اتفاقية", "معرض", "دورة تدريبية", "ملتقى", "منتدى", "محاضرة"]) {
      if (evt.title.includes(k)) { mKind = k; break; }
    }
    setSingleKind(mKind || "اجتماع");

    let mClass = "";
    for (const c of ["دوري", "استثنائي", "طارئ", "فريق عمل"]) {
      if (evt.title.includes(c === "دوري" ? "الدوري" : c === "استثنائي" ? "الاستثنائي" : c === "طارئ" ? "الطارئ" : "فريق العمل")) {
        mClass = c; break;
      }
    }
    setSingleClassification(mClass || "دوري");

    let mNum = "";
    const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
    for (const ord of ordinals) {
      if (evt.title.includes(ord)) { mNum = ord; break; }
    }
    setSingleEventNumber(mNum);
    setIsSeqManuallyEdited(false);
    
    setIsAddOpen(true);
  };

  const handleOpenDelete = (evt: EventItem) => {
    if (!canUserEditCommittee(evt.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لحذف هذه الفعالية. يمكنك فقط تعديل فعاليات مساعد الأمين العام المكلف بها.");
      return;
    }
    setDeletingEvent(evt);
  };

  const toggleSeriesRoom = (rm: string) => {
    if (seriesRooms.includes(rm)) {
      setSeriesRooms(seriesRooms.filter(r => r !== rm));
    } else {
      setSeriesRooms([...seriesRooms, rm]);
    }
  };

  const generateDates = () => {
    if (!seriesStartDate || !seriesEndDate) return;
    const start = new Date(seriesStartDate);
    const end = new Date(seriesEndDate);
    const targetDay = DAYSMaps[seriesDayOfWeek];
    const targetWeek = WEEKSMap[seriesWeekOfMonth];
    
    const results: {id: number, date: string, title: string, time: string}[] = [];
    if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); return; }
    const classifStr = seriesClassification === "دوري" ? "الدوري" : seriesClassification === "استثنائي" ? "الاستثنائي" : seriesClassification === "طارئ" ? "الطارئ" : seriesClassification === "فريق عمل" ? "فريق العمل" : seriesClassification;
    const formattedCommName = commName ? formatCommitteeNameArabic(commName) : "";
    const prefixToMatch = (seriesKind === "اجتماع" ? `${seriesKind} ${formattedCommName} ${classifStr}` : `${seriesKind} ${formattedCommName}`).trim();
    let existingCount = events.filter(e => e.committeeId === newCommitteeId && e.title.startsWith(prefixToMatch)).length;
    
    const current = new Date(start);
    let tempId = 1;
    while (current <= end) {
      if (current.getDay() === targetDay) {
        // Occurrence is 0-indexed in month
        const dateNo = current.getDate();
        const occurrence = Math.floor((dateNo - 1) / 7);
        if (occurrence === targetWeek) {
          existingCount++;
          const numWord = getArabicOrdinalGlobal(existingCount);
          let itemTitle = `${prefixToMatch} ${numWord}`.trim();
          if (seriesKind === "اجتماع" && seriesClassification === "دوري" && numWord === "الأول") {
            itemTitle += " (التأسيسي)";
          }
          results.push({
            id: tempId++,
            date: new Date(current).toISOString().split('T')[0],
            title: itemTitle,
            time: seriesTime
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    setGeneratedSchedules(results);
    setSelectedSchedules(results.map(r => r.id));
    setIsConfirmingSeries(true);
  };

  const [conflictWarning, setConflictWarning] = useState<{message: string, conflictingEventId: number} | null>(null);

  const checkConflict = (date: string, time: string, rooms: string[], employees: string[], excludeId?: number) => {
    for (const evt of events) {
      if (excludeId && evt.id === excludeId) continue;
      if (evt.date === date && evt.time === time) {
        const evtRooms = evt.location.split('،').map(r => r.trim());
        const overlappingRooms = rooms.filter(r => evtRooms.includes(r));
        if (overlappingRooms.length > 0) {
          return { message: `يوجد تعارض في القاعة (${overlappingRooms.join('، ')}) مع فعالية: ${evt.title}`, conflictingEventId: evt.id };
        }
        const overlappingEmps = employees.filter(e => evt.employees.includes(e));
        if (overlappingEmps.length > 0) {
          return { message: `يوجد تعارض للموظف (${overlappingEmps.join('، ')}) مع فعالية: ${evt.title}`, conflictingEventId: evt.id };
        }
      }
    }
    return null;
  };

  const handleInsertSeries = async () => {
    if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); return; }
    const selectedGen = generatedSchedules.filter(s => selectedSchedules.includes(s.id));
    
    // Check conflicts
    for (const gen of selectedGen) {
      const conflict = checkConflict(gen.date, gen.time, seriesRooms, [seriesAssignedEmployee, ...seriesAdditionalInvitees].filter(Boolean));
      if (conflict) {
        setConflictWarning(conflict);
        return;
      }
    }

    const newEventsList: EventItem[] = selectedGen.map((gen, idx) => ({
      id: Date.now() + idx, // unique ID
      title: gen.title,
      type: "متسلسلة",
      date: gen.date,
      time: gen.time,
      committeeId: newCommitteeId,
      committeeName: commName,
      status: "تجهيز الفعاليات",
      location: seriesRooms.length > 0 ? seriesRooms.join("، ") : "حضوري",
      employees: Array.from(new Set([JSON.parse(localStorage.getItem("current_user") || "{}")?.name, seriesAssignedEmployee, ...seriesAdditionalInvitees].flat().filter(Boolean))),
      members: newMembers,
      externalInvitees: newType === "متسلسلة" ? seriesExternalInvitees : singleExternalInvitees,
      notes: newNotes,
    }));

    newEventsList.forEach(async (ev) => { await setDoc(doc(db, "assistant_sec_gen_events", String(ev.id)), ev); });
    const stats = await syncEventsToCalendar(newEventsList, dbEmployees, "assistant_sec_gen_events");
      if (stats.failed > 0) {
        showGlobalToast("تم الحفظ في النظام، لكن فشلت مزامنة بعض الفعاليات مع جوجل.", "error");
      } else {
        showGlobalToast("تم إنشاء الفعاليات المتسلسلة ومحاولة مزامنتها مع تقويم جوجل للموظف", "success");
      }
    setIsConfirmingSeries(false);
    setIsAddOpen(false);
    setShowSuccessMsg(true);
    setConflictWarning(null);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);
    
    if (newType === "متسلسلة") {
      generateDates();
      return;
    }

    if (!newTitle.trim() || !newDate || !newCommitteeId || !singleTime) return;

    if (!newCommitteeId || newCommitteeId === 0) { alert("يرجى اختيار اللجنة أولاً"); return; }
    const commName = committees.find(c => c.id === newCommitteeId)?.name || "";
    if (commName && !canUserEditCommittee(commName)) { alert("غير مصرح لك بجدولة فعاليات لهذه اللجنة"); return; }

    const conflict = checkConflict(newDate, singleTime, [singleRoom].filter(Boolean), [singleEmployee].filter(Boolean), editingEvent?.id);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    if (editingEvent) {
      const updatedEvent = {
        ...editingEvent,
        title: newTitle,
        type: newType,
        date: newDate,
        time: singleTime,
        committeeId: newCommitteeId,
        committeeName: commName,
        status: newStatus,
        location: singleRoom,
        employees: Array.from(new Set([JSON.parse(localStorage.getItem("current_user") || "{}")?.name, singleEmployee, ...singleAdditionalInvitees].flat().filter(Boolean))),
        members: newMembers,
      externalInvitees: newType === "متسلسلة" ? seriesExternalInvitees : singleExternalInvitees,
        notes: newNotes
       };
      try {
        await updateDoc(doc(db, "assistant_sec_gen_events", String(editingEvent.id)), updatedEvent);
      } catch (err) {
        console.error(err);
      }
      const stats = await syncEventsToCalendar([updatedEvent], dbEmployees, "assistant_sec_gen_events");
      if (stats.failed > 0) {
        showGlobalToast("تم تحديث الفعالية في النظام، لكن فشلت المزامنة مع جوجل (قد يكون بسبب تكرار إيميلات المدعوين أو خطأ في صيغة الوقت).", "error");
      } else {
        showGlobalToast("تم تحديث الفعالية ومحاولة مزامنتها مع تقويم جوجل للموظف", "success");
      }
    } else {
      const newEvent = {
          id: Date.now(),
          title: newTitle,
          type: newType,
          date: newDate,
          time: singleTime,
          committeeId: newCommitteeId,
          committeeName: commName,
          status: newStatus,
          location: singleRoom,
          employees: Array.from(new Set([JSON.parse(localStorage.getItem("current_user") || "{}")?.name, singleEmployee, ...singleAdditionalInvitees].flat().filter(Boolean))),
          members: newMembers,
      externalInvitees: newType === "متسلسلة" ? seriesExternalInvitees : singleExternalInvitees,
          notes: newNotes
        };
      try {
        await setDoc(doc(db, "assistant_sec_gen_events", String(newEvent.id)), newEvent);
      } catch (err) {
        console.error(err);
      }
      const stats = await syncEventsToCalendar([newEvent], dbEmployees, "assistant_sec_gen_events");
      if (stats.failed > 0) {
        showGlobalToast("تم إنشاء الفعالية في النظام، لكن فشلت المزامنة مع جوجل (قد يكون بسبب تكرار إيميلات المدعوين أو خطأ في صيغة الوقت).", "error");
      } else {
        showGlobalToast("تم إنشاء الفعالية ومحاولة مزامنتها مع تقويم جوجل للموظف", "success");
      }
    }
    setIsAddOpen(false);
  };

  const handleDelete = async () => {
    if (deletingEvent) {
      try {
        await deleteDoc(doc(db, "assistant_sec_gen_events", String(deletingEvent.id)));
      } catch (err) {
        console.error(err);
      }
      setDeletingEvent(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEventIds.length > 0) {
      setIsBulkDeletingLoading(true);
      const itemsToDelete = events.filter((e) => selectedEventIds.includes(e.id));
      await Promise.all(itemsToDelete.map(async (e) => {
        await deleteFirebaseEvent(String(e.id));
        if (e.googleEventIds) {
          const existingEventId = Object.values(e.googleEventIds)[0] || undefined;
          if (existingEventId) {
            try {
              await deleteGoogleCalendarEvent(existingEventId as string);
            } catch (err: any) {
              console.warn("Failed to delete Google Calendar event in bulk:", err);
              showGlobalToast("فشل حذف إحدى الفعاليات من تقويم جوجل: " + (err.message || ""), "error");
            }
          }
        }
        if (e.employees) {
          for (const emp of e.employees) {
            sendSystemAlert(emp, "إلغاء فعالية", `تم إلغاء فعالية "${e.title || e.eventName}"`, "event_delete", "/events");
          }
        }
      }));
      setSelectedEventIds([]);
      setIsBulkDeletingLoading(false);
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectEvent = (id: number) => {
    setSelectedEventIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllEvents = () => {
    if (selectedEventIds.length === filteredEvents.length && filteredEvents.length > 0) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(filteredEvents.map(e => e.id));
    }
  };

  const formatTime12h = (timeStr?: string) => {
    if (!timeStr) return "غير محدد";
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h, 10);
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${m} ${ampm}`;
  };

  const getEventKindStr = (rawTitle: string) => {
    if (!rawTitle) return "فعالية";
    const title = rawTitle.trim();
    if (title.startsWith("اجتماع") || title.includes("اجتماع")) return "اجتماع";
    if (title.startsWith("لقاء") || title.includes("لقاء")) return "لقاء";
    if (title.startsWith("زيارة") || title.includes("زيارة")) return "زيارة";
    if (title.startsWith("استضافة") || title.includes("استضافة")) return "استضافة";
    if (title.startsWith("ورشة عمل") || title.includes("ورشة عمل")) return "ورشة عمل";
    if (title.startsWith("ندوة") || title.includes("ندوة")) return "ندوة";
    if (title.startsWith("حفل") || title.includes("حفل")) return "حفل";
    if (title.startsWith("تدشين") || title.includes("تدشين")) return "تدشين";
    if (title.startsWith("إطلاق مبادرة") || title.includes("إطلاق مبادرة")) return "إطلاق مبادرة";
    if (title.startsWith("توقيع اتفاقية") || title.includes("توقيع اتفاقية")) return "توقيع اتفاقية";
    if (title.startsWith("معرض") || title.includes("معرض")) return "معرض";
    if (title.startsWith("دورة تدريبية") || title.startsWith("دورة") || title.includes("دورة")) return "دورة تدريبية";
    if (title.startsWith("ملتقى") || title.includes("ملتقى")) return "ملتقى";
    if (title.startsWith("منتدى") || title.includes("منتدى")) return "منتدى";
    if (title.startsWith("محاضرة") || title.includes("محاضرة")) return "محاضرة";
    return "فعالية";
  };

  const getEventKindStyle = (title: string) => {
    const kind = getEventKindStr(title);
    switch (kind) {
      case "اجتماع": return "text-blue-800 bg-blue-100/80 border-blue-200";
      case "لقاء": return "text-emerald-800 bg-emerald-100/80 border-emerald-200";
      case "زيارة": return "text-indigo-800 bg-indigo-100/80 border-indigo-200";
      case "استضافة": return "text-pink-800 bg-pink-100/80 border-pink-200";
      case "ورشة عمل": return "text-amber-800 bg-amber-100/80 border-amber-200";
      case "ندوة": return "text-purple-800 bg-purple-100/80 border-purple-200";
      case "حفل": return "text-rose-800 bg-rose-100/80 border-rose-200";
      case "تدشين": return "text-cyan-800 bg-cyan-100/80 border-cyan-200";
      case "إطلاق مبادرة": return "text-lime-800 bg-lime-100/80 border-lime-200";
      case "توقيع اتفاقية": return "text-fuchsia-800 bg-fuchsia-100/80 border-fuchsia-200";
      default: return "text-gray-800 bg-gray-100 border-gray-200";
    }
  };

  const getDisplayStatus = (evt: EventItem) => {
    if (isEventCompleted(evt)) return "منتهية";
    const timeVal = getEventTimeValue(evt);
    if (timeVal > 0 && timeVal < Date.now()) {
      return "فائت";
    }
    return evt.status || "جديدة";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "تجهيز الفعاليات": return "text-blue-600 bg-blue-100 ring-blue-200";
      case "تأكيد الموعد مع المسؤول": return "text-indigo-600 bg-indigo-100 ring-indigo-200";
      case "إرسال الدعوات": return "text-blue-600 bg-blue-100 ring-blue-200";
      case "تأكيد الحضور": return "text-amber-600 bg-amber-100 ring-amber-200";
      case "محضر الاجتماع": return "text-purple-600 bg-purple-100 ring-purple-200";
      case "التوصيات": return "text-brand bg-brand/10 ring-brand/20";
      case "منتهية": return "text-emerald-600 bg-emerald-100 ring-emerald-200";
      case "فائت": return "text-red-600 bg-red-100 ring-red-200";
      default: return "text-gray-600 bg-gray-100 ring-gray-200";
    }
  };

  const toggleEmployee = (emp: string) => {
    if (newEmployees.includes(emp)) {
      setNewEmployees(newEmployees.filter(e => e !== emp));
    } else {
      setNewEmployees([...newEmployees, emp]);
    }
  };

  const toggleMember = (mId: number) => {
    if (newMembers.includes(mId)) {
      setNewMembers(newMembers.filter(id => id !== mId));
    } else {
      setNewMembers([...newMembers, mId]);
    }
  };

  // Filter members by selected committee when picking
  const committeeMembers = allMembers.filter(m => String(m.committeeId) === String(newCommitteeId) || String(m.secondaryCommitteeId) === String(newCommitteeId));

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header Area */}
      <div className="bg-[#e8e4e4] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-2.5 sm:gap-3 md:gap-4">
        <div>
          <h2 className="text-sm sm:text-base md:text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-brand" />
            <span>سجل الفعاليات</span>
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1">
            إدارة وتنسيق الفعاليات والاجتماعات للجان والموظفين بكفاءة.
          </p>
        </div>

        {/* Actions & Stats Group Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
          
          {/* 1. Toggleable Search with Input */}
          <div className="flex items-center gap-2 relative">
            <AnimatePresence>
              {showSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 -top-12 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md z-10 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  تم إضافة الفعاليات بنجاح
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 170, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearchCommit}
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
                    placeholder="ابحث عن فعالية..."
                    autoFocus
                    className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold placeholder-gray-400 text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
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
                isSearchExpanded || filterQuery
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="البحث عن اللجان"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-250 select-none" style={{ borderWidth: '0px' }}>
            <button
              type="button"
              onClick={() => { setViewMode("grid"); setIsFilterOpen(false); }}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "grid" && !isFilterOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطائق</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode("table"); setIsFilterOpen(false); }}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table" && !isFilterOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>سجل</span>
            </button>\n            <button
              type="button"
              onClick={() => { setViewMode("calendar"); setIsFilterOpen(false); }}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "calendar" && !isFilterOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>تقويم</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                  isFilterOpen
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>فرز</span>
              </button>
              <AnimatePresence>
                {isFilterOpen && (
                  <div key="filter-popover">
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3.5 space-y-3.5 text-right font-sans max-h-[60vh] overflow-y-auto"
                      style={{ transformOrigin: "top left" }}
                    >
                      <div className="space-y-2 text-right">
                        <div className="flex items-center justify-between text-gray-800">
                           <div className="flex items-center gap-1.5">
                             <span className="w-1 h-3 bg-indigo-600 rounded-full" />
                             <span className="text-[11px] font-black">اللجان المعروضة:</span>
                           </div>
                           <button 
                             onClick={() => setSelectedFilterCommittees([])}
                             className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                           >
                             عرض الكل
                           </button>
                        </div>
                        <div className="space-y-1">
                          {committees.map((c: any) => (
                            <label key={c.id} className="flex items-center justify-end gap-2.5 p-1.5 rounded hover:bg-gray-50 cursor-pointer select-none">
                              <span className="text-[11px] font-bold text-gray-700 leading-none mt-0.5">{c.name}</span>
                              <input
                                type="checkbox"
                                checked={selectedFilterCommittees.includes(String(c.id))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFilterCommittees([...selectedFilterCommittees, String(c.id)]);
                                  } else {
                                    setSelectedFilterCommittees(selectedFilterCommittees.filter(id => id !== String(c.id)));
                                  }
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 w-3.5 h-3.5 cursor-pointer"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Add Event Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>إجراءات الفعاليات</span>
              <ChevronDown className="w-4 h-4 mr-1 stroke-[2.5]" />
            </button>

            {isActionsMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsActionsMenuOpen(false)}
                />
                <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      handleOpenAdd();
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-right text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-gray-500 stroke-[2.5]" />
                    <span>إضافة فعالية</span>
                  </button>
                  <div className="h-px w-full bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      handleManualSync();
                    }}
                    disabled={isSyncing}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-right text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>مزامنة التقويم</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {selectedEventIds.length > 0 && viewMode === "table" && (
            <button
              type="button"
              onClick={() => setIsBulkDeleting(true)}
              className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer shrink-0"
            >
              <Trash2 className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>حذف المحدد ({selectedEventIds.length})</span>
            </button>
          )}

          {/* Vertical divider */}
          <div className="h-8 w-px bg-gray-300 hidden sm:block mx-1"></div>

          {/* Brief Quick Statistic Badge */}
          <div className="flex gap-2">
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">إجمالي الفعاليات</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-brand leading-none font-mono">{events.length}</span>
            </div>
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">منتهية</span>
              <span className="text-sm sm:text-base md:text-lg font-black text-emerald-600 leading-none font-mono">
                {events.filter(e => getDisplayStatus(e) === "منتهية").length}
              </span>
            </div>
          </div>

        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <p className="text-gray-500 font-extrabold text-base">لم يعثر على أية نتائج مخصصة لعملية البحث الحالية.</p>
          <button
            onClick={handleResetSearch}
            className="text-brand font-black text-xs hover:underline"
          >
            عرض كافة الفعاليات المسجلة
          </button>
        </div>
            ) : viewMode === "calendar" ? (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 h-[700px]">
          <iframe
            src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(JSON.parse(localStorage.getItem("current_user") || "{}")?.email || "")}&ctz=Asia/Riyadh&hl=ar&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`}
            style={{ border: 0, width: "100%", height: "100%" }}
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          ></iframe>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-6 text-right">
          {/* Elegant Breadcrumbs Navigator */}
          <div className="bg-white border border-gray-150 rounded-xl sm:rounded-2xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3 md:gap-4 font-sans">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black text-gray-700">
              <button
                onClick={() => {
                  setSelectedCommIdForCards(null);
                  setSelectedEventKindForCards(null);
                  setSelectedClassificationForCards(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  selectedCommIdForCards === null
                    ? "bg-brand text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>الرئيسية (مساعد الأمين العام)</span>
              </button>

              {selectedCommIdForCards !== null && (
                
<React.Fragment>
                  <span className="text-gray-400 font-bold font-mono">/</span>
                  <button
                    onClick={() => {
                      setSelectedEventKindForCards(null);
                      setSelectedClassificationForCards(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      selectedEventKindForCards === null
                        ? "bg-[#dfba6b] text-[#1e293b] shadow-sm font-black"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Users2 className="w-3.5 h-3.5" />
                    <span>
                      {rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name || "الإدارة المحددة"}
                    </span>
                  </button>
                </React.Fragment>
              )}

              {selectedEventKindForCards !== null && (
                
<React.Fragment>
                  <span className="text-gray-400 font-bold font-mono">/</span>
                  <button
                    onClick={() => {
                      setSelectedClassificationForCards(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      selectedClassificationForCards === null
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>نوع الفعالية: {selectedEventKindForCards}</span>
                  </button>
                </React.Fragment>
              )}

              {selectedClassificationForCards !== null && (
                
<React.Fragment>
                  <span className="text-gray-400 font-bold font-mono">/</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm font-black">
                    <Sliders className="w-3.5 h-3.5 animate-pulse" />
                    <span>تصنيف الفعالية: {selectedClassificationForCards}</span>
                  </div>
                </React.Fragment>
              )}
            </div>

            <div className="text-[11px] text-gray-500 font-bold">
              مجموع النتائج الحالية:{" "}
              <span className="text-brand font-black">
                {(() => {
                  if (selectedCommIdForCards === null) {
                    return filteredEvents.length;
                  }
                  const commEvts = filteredEvents.filter((e) => e.committeeId === selectedCommIdForCards);
                  if (selectedEventKindForCards === null) {
                    return commEvts.length;
                  }
                  const kindEvts = commEvts.filter((e) => getEventKindStr(e.title) === selectedEventKindForCards);
                  if (selectedClassificationForCards === null) {
                    return kindEvts.length;
                  }
                  return kindEvts.filter((e) => getEventClassification(e.title) === selectedClassificationForCards).length;
                })()}
              </span>{" "}
              فعاليات مسجلة
            </div>
          </div>

          {/* Level 1: Committees List view */}
          {selectedCommIdForCards === null ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {committees.filter(c => selectedFilterCommittees.length === 0 || selectedFilterCommittees.includes(String(c.id))).map((comm) => {
                const commEvents = filteredEvents.filter((e) => String(e.committeeId) === String(comm.id));
                const president = allMembers.find((m) => String(m.committeeId) === String(comm.id) && m.active !== false && m.role === "رئيس")?.name || comm.president || "غير محدد";
                const specialist = comm.specialist || "غير محدد";

                return (
                  <motion.div
                    key={comm.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 relative group flex flex-col justify-between space-y-5"
                  >
                    {/* Committee Header & Icon */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand shrink-0">
                          <Users2 className="w-6 h-6 font-black" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-gray-900 leading-tight truncate group-hover:text-brand transition-colors">
                            {comm.name}
                          </h3>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] bg-brand/10 text-brand font-black mt-1">
                            {commEvents.length} فعاليات مسجلة
                          </span>
                        </div>
                      </div>

                      {/* Committee Info details */}
                      <div className="bg-slate-50/70 p-4 rounded-xl sm:rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-bold text-[10px]">المسؤول:</span>
                          <span className="text-gray-800 font-extrabold">{president}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-bold text-[10px]">الأخصائي المسؤول:</span>
                          <span className="text-gray-800 font-extrabold">{specialist}</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation triggering Button */}
                    <button
                      onClick={() => setSelectedCommIdForCards(comm.id)}
                      className="w-full py-3 bg-brand text-white hover:bg-[#dfba6b] hover:text-[#1e293b] font-black text-xs rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>المزيد من التفاصيل (حسب نوع الفعالية)</span>
                      <span>←</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : /* Level 2: Event Kinds inside selected Committee */
          selectedEventKindForCards === null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-800">تصفح فعاليات اللجنة حسب النوع</h3>
                <button
                  onClick={() => setSelectedCommIdForCards(null)}
                  className="text-xs text-brand font-black hover:underline"
                >
                  الرجوع لقائمة اللجان الرئيسية ↑
                </button>
              </div>

              {(() => {
                const commEvents = filteredEvents.filter((e) => e.committeeId === selectedCommIdForCards);
                const uniqueKinds = Array.from(new Set(commEvents.map((e) => getEventKindStr(e.title))));

                if (uniqueKinds.length === 0) {
                  return (
                    <div className="bg-white border border-gray-150 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 text-center text-gray-500 font-bold text-sm">
                      لا توجد أية فعاليات مسجلة لهذه اللجنة حالياً.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {uniqueKinds.map((kind) => {
                      const count = commEvents.filter((e) => getEventKindStr(e.title) === kind).length;
                      return (
                        <motion.div
                          key={kind}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 relative group flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-55/70 text-blue-800 border border-blue-100 flex items-center justify-center font-black">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800">{kind}</h4>
                              <p className="text-[10px] text-gray-400 font-bold">بناءً على تصنيف الفعاليات المجدولة</p>
                            </div>
                          </div>

                          <span className="inline-block self-start px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">
                            {count} فعاليات مسجلة
                          </span>

                          <button
                            onClick={() => setSelectedEventKindForCards(kind)}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>تصفح حسب التصنيف</span>
                            <span>←</span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : /* Level 3: Classifications inside selected Event Kind & Committee */
          selectedClassificationForCards === null && selectedEventKindForCards === "اجتماع" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-800">
                  فرز فعاليات النوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) حسب التصنيف
                </h3>
                <button
                  onClick={() => setSelectedEventKindForCards(null)}
                  className="text-xs text-brand font-black hover:underline"
                >
                  الرجوع خطوة للأعلى (عناوين أنواع الفعاليات) ↑
                </button>
              </div>
              {(() => {
                const kindEvents = filteredEvents.filter(
                  (e) => e.committeeId === selectedCommIdForCards && getEventKindStr(e.title) === selectedEventKindForCards
                );
                const activeClassifications = Array.from(new Set(kindEvents.map((e) => getEventClassification(e.title))));

                if (activeClassifications.length === 0) {
                  return (
                    <div className="bg-white border border-gray-150 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 text-center text-gray-500 font-bold text-sm">
                      لا يوجد أي تصنيف للفعاليات المدرجة حالياً.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {activeClassifications.map((cls) => {
                      const count = kindEvents.filter((e) => getEventClassification(e.title) === cls).length;
                      return (
                        <motion.div
                          key={cls}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border-2 border-slate-100 hover:border-[#dfba6b]/60 hover:shadow-lg transition-all duration-300 rounded-xl sm:rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 relative group flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-55/70 text-emerald-800 border border-emerald-100 flex items-center justify-center font-black animate-pulse">
                              <Sliders className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-800">{cls}</h4>
                              <p className="text-[10px] text-gray-400 font-bold">نمط الإضافة في الجداول المبرمجة</p>
                            </div>
                          </div>
                          <span className="inline-block self-start px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg">
                            {count} فعاليات مسجلة
                          </span>
                          <button
                            onClick={() => setSelectedClassificationForCards(cls)}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>عرض جميع الفعاليات الـ {cls}</span>
                            <span>←</span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Level 4: Show actual individual events */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-800">
                    {selectedEventKindForCards === "اجتماع" ? (
                    
<div key="filter-popover-1784704070964-4">قائمة الفعاليات الـ (<span className="text-emerald-600">{selectedClassificationForCards}</span>) من نوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (<span className="text-brand">{rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}</span>)</div>
                  ) : (
                    
<div key="filter-popover-1784704070964-5">قائمة فعاليات نوع (<span className="text-blue-600">{selectedEventKindForCards}</span>) لـ (<span className="text-brand">{rawCommittees.find((c) => c.id === selectedCommIdForCards)?.name}</span>)</div>
                  )}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (selectedEventKindForCards !== "اجتماع") {
                      setSelectedEventKindForCards(null);
                    } else {
                      setSelectedClassificationForCards(null);
                    }
                  }}
                  className="text-xs text-brand font-black hover:underline"
                >
                  {selectedEventKindForCards !== "اجتماع" ? "الرجوع خطوة للأعلى (عناوين أنواع الفعاليات) ↑" : "الرجوع خطوة للأعلى (الفرز والتصنيفات) ↑"}
                </button>
              </div>
              {(() => {
                const finalList = filteredEvents.filter(
                  (e) =>
                    e.committeeId === selectedCommIdForCards &&
                    getEventKindStr(e.title) === selectedEventKindForCards &&
                    (selectedEventKindForCards !== "اجتماع" || getEventClassification(e.title) === selectedClassificationForCards)
                );

                if (finalList.length === 0) {
                  return (
                    <div className="bg-white border border-gray-150 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 text-center text-gray-500 font-bold text-sm">
                      لا تتوفر أية فعاليات تطابق شروط الفرز الحالية.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                    <AnimatePresence mode="popLayout">
                      {finalList.map((evt) => (
                        <motion.div
                          key={evt.id}
                          id={`event-card-${evt.id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="bg-[#e8e4e4] hover:bg-[#e2dede] transition-colors duration-300 rounded-xl sm:rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md relative group flex flex-col justify-between"
                        >
                          {/* Title & Actions inside grid card */}
                          <div className="absolute top-4 left-4 z-20">
                            <button
                              onClick={() => setActiveGearMenuId(activeGearMenuId === evt.id ? null : evt.id)}
                              
                              className="p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-950 rounded-lg border border-gray-200/80 shadow-sm transition-all cursor-pointer"
                              title="التحكم بالفعالية"
                            >
                              <Settings className="w-4 h-4 animate-hover-spin" />
                            </button>

                            {activeGearMenuId === evt.id && (
                              
<div key="filter-popover-1784704070964-6">
                                <div className="fixed inset-0 z-30" onClick={() => setActiveGearMenuId(null)} />
                                <div className="absolute left-0 bottom-full mb-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-40 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(evt)}
                                    className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>تعديل</span>
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveGearMenuId(null);
                                      setViewMode("table");
                                      setExpandedEventId(evt.id);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>تجهيز الفعالية</span>
                                    <Activity className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDelete(evt)}
                                    className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>حذف</span>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ring-1 ${getStatusColor(getDisplayStatus(evt))}`}>
                                {getDisplayStatus(evt)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide border ${getEventKindStyle(
                                  evt.title
                                )}`}
                              >
                                {getEventKindStr(evt.title)}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide bg-[#e0f2fe] text-blue-800 border border-blue-200">
                                {evt.type}
                              </span>
                            </div>

                            <h3 className="text-base font-black text-gray-900 leading-tight pt-0.5 max-w-[85%]">
                              {evt.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mb-2">
                              <Users2 className="w-3.5 h-3.5" />
                              <span>{evt.committeeName}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                              <div className="flex items-center gap-1 text-right" dir="rtl">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[10px]">{evt.date} {evt.time || ""}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{evt.location}</span>
                              </div>
                            </div>

                            {evt.employees && evt.employees.length > 0 && (
                              <div className="text-[10px] text-gray-500 line-clamp-1 border-t border-dashed border-gray-300 pt-2 flex items-center gap-1">
                                <span className="font-black">الموظفين:</span> {evt.employees.join("، ")}
                              </div>
                            )}
                            {evt.members && evt.members.length > 0 && (
                              <div className="text-[10px] text-brand line-clamp-1 border-t border-dashed border-gray-300 pt-2 flex items-center gap-1 font-bold">
                                <Users className="w-3 h-3" />
                                <span>أعضاء ({evt.members.length})</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* TABLE REGISTER VIEW LAYOUT (سجل الفعاليات) */
        <div className="bg-[#e8e4e4] rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
          <div className="overflow-x-auto custom-scrollbar font-sans pb-36">
            <table className="w-full text-xs font-semibold text-gray-700 select-none border-collapse text-right">
              <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900">
                <tr className="divide-x divide-x-reverse divide-gray-300">
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-right w-16">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded text-brand"
                        checked={selectedEventIds.length === filteredEvents.length && filteredEvents.length > 0} 
                        onChange={toggleSelectAllEvents}
                      />
                      <span>م</span>
                    </div>
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center">النوع</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-right">عنوان الفعالية</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-right">اللجنة</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center">الوقت والتاريخ</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center">المقر</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center">الحالة</th>
                  <th className="whitespace-nowrap px-4 py-3 font-black text-xs text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                {sortedTableEvents.map((evt, idx) => {
                  const isExpanded = expandedEventId === evt.id;
                  const nextStep = getCalculatedNextStep(evt);
                  return (
                    <React.Fragment key={evt.id}>
                      <tr 
                        id={`event-row-${evt.id}`}
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className={`hover:bg-slate-100/80 transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700 cursor-pointer ${isExpanded ? "bg-slate-50/90 border-r-2 border-r-brand shadow-inner" : ""}`}
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-right text-gray-900 font-mono font-black" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              className="rounded text-brand"
                              checked={selectedEventIds.includes(evt.id)} 
                              onChange={() => toggleSelectEvent(evt.id)}
                            />
                            <span>{idx + 1}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center">
                           <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border tracking-wide mb-1 ${getEventKindStyle(evt.title)}`}>
                             {getEventKindStr(evt.title)}
                           </span>
                           <span className={`block text-[10px] font-black mx-auto mt-1 max-w-max px-1.5 py-0.5 rounded border ${
                             evt.type === "متسلسلة" 
                               ? "text-purple-700 bg-purple-100 border-purple-200" 
                               : "text-blue-700 bg-blue-100 border-blue-200"
                           }`}>
                             آلية الإضافة: {evt.type === "متسلسلة" ? "متسلسلة 🔁" : "مفردة 🎯"}
                           </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap font-black text-gray-900 group/row" title="انقر لتشغيل منصة التحضير">
                          <div className="flex flex-col text-right truncate">
                            <span className="text-[11px] font-bold text-gray-900 leading-tight transition-colors group-hover/row:text-brand underline decoration-dotted decoration-brand/45 underline-offset-4 truncate mb-1">
                              {evt.title}
                            </span>
                            <div className="text-[9.5px] text-gray-500 font-bold">
                              المسؤول: {allMembers.find(m => m.committeeId === evt.committeeId && m.role === "رئيس")?.name || "غير محدد"} - الموظف: {evt.employees[0] || "غير محدد"}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-xs font-bold text-gray-800 text-right">
                           <span className="block text-gray-900 font-bold mb-1">{evt.committeeName}</span>
                           <span className="block text-[9.5px] text-gray-500 font-bold">
                             حاضرون: {evt.confirmedAttendees?.length || 0} من {allMembers.filter(m => (String(m.committeeId) === String(evt.committeeId) || String(m.secondaryCommitteeId) === String(evt.committeeId)) && m.active !== false).length}
                           </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center">
                           <span className="block text-gray-900 font-bold text-[11px] mb-0.5" dir="ltr">{formatTime12h(evt.time)}</span>
                           <span className="block text-gray-500 font-bold text-[10px]" dir="ltr">{evt.date}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap font-bold text-gray-800 text-center">
                           <span className="block text-gray-900 font-bold text-[11px] mb-0.5">{evt.location}</span>
                           <span className="block text-gray-500 font-bold text-[9.5px]">
                             {evt.location === "عن بعد" ? "افتراضي" : (evt.location === "خارج مقر الغرفة" ? "خارج الغرفة" : "مقر غرفة مكة المكرمة")}
                           </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 whitespace-nowrap text-center">
                          {(() => {
                            const stepValues = [
                              !!evt.committeeConfirmed,
                              !!evt.invitationSent,
                              !!evt.attendanceConfirmed,
                              !!evt.preparationsConfirmed,
                              !!(evt.agenda && evt.agenda.length > 0 && evt.agendaTransferred),
                              !!evt.minutesSaved,
                              !!evt.exportedRecommendationsToPage
                            ];
                            
                            const completedCount = stepValues.filter(Boolean).length;
                            const activeIndex = stepValues.findIndex(val => !val); // 0 to 6, or -1 if all are complete
                            
                            const stepTitles = [
                              "تأكيد الموعد مع المسؤول",
                              "إرسال الدعوات للأعضاء",
                              "تأكيد حضور الأعضاء والنصاب",
                              "تجهيزات اللقاء",
                              "جدول الأعمال (الأجندة)",
                              "محضر الاجتماع وتدوين الوقائع",
                              "التوصيات واعتماد المحضر"
                            ];

                            const shortStepTitles = [
                              "تأكيد الموعد",
                              "إرسال الدعوات للأعضاء",
                              "تأكيد حضور الأعضاء",
                              "تجهيزات اللقاء",
                              "جدول الأعمال",
                              "محضر الاجتماع",
                              "تصدير التوصيات"
                            ];
                            
                            let overallStatusText = "جديد";
                            let overallStatusClass = "text-blue-600 bg-blue-50 ring-1 ring-blue-200 border-blue-200";
                            
                            if (completedCount === 7) {
                              overallStatusText = "منجزة";
                              overallStatusClass = "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-250 border-emerald-250 font-black";
                            } else {
                              const timeVal = getEventTimeValue(evt);
                              const isPast = timeVal > 0 && timeVal < Date.now();
                              
                              if (isPast) {
                                overallStatusText = "فائت";
                                overallStatusClass = "text-red-700 bg-red-50 ring-1 ring-red-250 border-red-250 font-black";
                              } else if (completedCount > 0) {
                                overallStatusText = `جاري العمل على ${shortStepTitles[activeIndex]}`;
                                overallStatusClass = "text-amber-700 bg-amber-50 ring-1 ring-amber-250 border-amber-250 font-black";
                              }
                            }

                            return (
                              <div className="flex flex-col items-center gap-1.5 justify-center">
                                <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ring-1 ${overallStatusClass}`}>
                                  {overallStatusText}
                                </span>
                                {/* Checklist mini indicators */}
                                <div className="flex items-center gap-[3px] mt-1">
                                  {stepValues.map((isStepDone, i) => {
                                    // Determine the color style of each dot
                                    let dotColorClass = "bg-gray-300";
                                    const isActive = i === activeIndex;

                                    if (overallStatusText === "فائت") {
                                      if (isStepDone) {
                                        dotColorClass = "bg-emerald-500";
                                      } else if (isActive) {
                                        dotColorClass = "bg-red-700 ring-[1px] ring-red-400 scale-125 z-10 font-bold shadow-sm";
                                      } else {
                                        dotColorClass = "bg-red-200/50";
                                      }
                                    } else if (completedCount === 0) {
                                      // All Blue as New
                                      dotColorClass = isActive ? "bg-blue-800 ring-[1px] ring-blue-400 scale-125 z-10 font-bold shadow-sm" : "bg-blue-300/60";
                                    } else if (completedCount === 7) {
                                      // All Completed (Green)
                                      dotColorClass = "bg-emerald-500";
                                    } else {
                                      // In Progress
                                      if (isStepDone) {
                                        dotColorClass = "bg-emerald-500";
                                      } else if (isActive) {
                                        dotColorClass = "bg-amber-700 ring-[1px] ring-amber-400 scale-125 z-10 font-bold shadow-sm";
                                      } else {
                                        dotColorClass = "bg-blue-200/50";
                                      }
                                    }

                                    return (
                                      <span 
                                        key={i}
                                        className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${dotColorClass}`}
                                        title={`${stepTitles[i]} (${isStepDone ? 'مكتمل' : (isActive ? 'جاري العمل عليه حالياً' : 'مجدول')})`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center relative whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                            <button
                              onClick={() => setActiveGearMenuId(activeGearMenuId === evt.id ? null : evt.id)}
                              
                              className="p-1.5 hover:bg-gray-150 text-gray-650 hover:text-gray-900 rounded-lg border border-transparent hover:border-gray-350 transition-all cursor-pointer"
                              title="الإجراءات"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            
                            {activeGearMenuId === evt.id && (
                              
<div key="filter-popover-1784704070964-7">
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={() => setActiveGearMenuId(null)} 
                                />
                                
                                <div className="absolute left-2 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1 z-40 text-right font-sans">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(evt)}
                                    className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>تعديل السجل</span>
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveGearMenuId(null);
                                      setExpandedEventId(expandedEventId === evt.id ? null : evt.id);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>تجهيز الفعالية</span>
                                    <Activity className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDelete(evt)}
                                    className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                                  >
                                    <span>حذف الفعالية</span>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0 bg-slate-50 border-t border-b border-gray-200 text-right font-sans">
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-y border-gray-200 text-right font-sans relative"
                            >
                              {!canUserEditCommittee(evt.committeeName) && (
                                <div className="absolute inset-0 z-[60] bg-slate-50/40 cursor-not-allowed rounded-lg" title="ليس لديك صلاحية لتعديل هذه الفعالية" />
                              )}
                              <div className={`flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 relative ${!canUserEditCommittee(evt.committeeName) ? "opacity-80 pointer-events-none grayscale-[10%]" : ""}`}>
                                
                                {/* Right Column: Steps Stepper / Timeline Sidebar */}
                                <div className="w-full md:w-1/3 flex flex-col gap-2.5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
                                  <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-[#111] flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-brand" />
                                      مراحل الإجراءات والتحضير للفعالية
                                    </span>
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-brand/10 text-brand font-black">
                                      خطوة {getStepIndex(nextStep) + 1} من 8
                                    </span>
                                  </div>
                                  
                                  {/* 7 timeline items */}
                                  {(() => {
                                    const isStep0Unlocked = true;
                                    const isStep1Unlocked = !!evt.committeeConfirmed;
                                    const isStep2Unlocked = isStep1Unlocked && !!evt.invitationSent;
                                    const isStep3Unlocked = isStep2Unlocked && !!evt.attendanceConfirmed;
                                    const isStep4Unlocked = isStep3Unlocked && !!evt.preparationsConfirmed;
                                    const isStep5Unlocked = isStep4Unlocked && !!(evt.agenda && evt.agenda.length > 0 && evt.agendaTransferred);
                                    const isStep6Unlocked = isStep5Unlocked && !!evt.minutesSaved;
                                    const isStep7Unlocked = isStep6Unlocked && !!evt.exportedRecommendationsToPage;
                                      
                                    const isUnlockedByStepIndex = [
                                      isStep0Unlocked,
                                      isStep1Unlocked,
                                      isStep2Unlocked,
                                      isStep3Unlocked,
                                      isStep4Unlocked,
                                      isStep5Unlocked,
                                      isStep6Unlocked,
                                      isStep7Unlocked
                                    ];

                                    const stepList = [
                                      { title: "تأكيد الموعد مع المسؤول", desc: "التنسيق وتأكيد موعد وقاعة الفعالية", done: !!evt.committeeConfirmed },
                                      { title: "إرسال الدعوات للأعضاء", desc: "توليد وتأكيد إرسال الدعوة للأعضاء", done: !!evt.invitationSent },
                                      { title: "تأكيد حضور الأعضاء والنصاب", desc: "تأكيد واستيفاء قائمة الحضور القانونية", done: !!evt.attendanceConfirmed },
                                      { title: "تجهيزات اللقاء", desc: "تأمين وتحضير وتجهيزات متطلبات الفعالية", done: !!evt.preparationsConfirmed },
                                      { title: "جدول الأعمال (الأجندة)", desc: "ترحيل بنود وجداول المناقشات والمدد", done: !!(evt.agenda && evt.agenda.length > 0 && evt.agendaTransferred) },
                                      { title: "محضر الاجتماع وتدوين الوقائع", desc: "صياغة المناقشة وتثبيت وقائع المحضر", done: !!evt.minutesSaved },
                                      { title: "التوصيات واعتماد المحضر", desc: "اعتماد وتصدير وحفظ وسجل الترحيل النهائي", done: !!evt.exportedRecommendationsToPage },
                                      { title: "المرفقات والشواهد", desc: "إرفاق كشف الحضور والمحضر والروابط", done: !!evt.evidencesSaved },
                                    ];

                                    return stepList.map((step, idx) => {
                                      const isCurrent = getStepIndex(nextStep) === idx;
                                      const isSelected = (activeStepTab[evt.id] ?? getStepIndex(nextStep)) === idx;
                                      const isUnlocked = isUnlockedByStepIndex[idx];
                                      
                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          disabled={!isUnlocked}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isUnlocked) return;
                                            setActiveStepTab(prev => ({ ...prev, [evt.id]: idx }));
                                          }}
                                          className={`w-full text-right p-2.5 rounded-lg border transition-all flex items-start gap-3 ${
                                            !isUnlocked 
                                              ? "opacity-55 bg-gray-100/55 border-gray-150 text-gray-400 cursor-not-allowed select-none"
                                              : isSelected 
                                                ? "bg-blue-600 text-white border-blue-600 shadow-md cursor-pointer"
                                                : isCurrent 
                                                  ? "bg-brand/5 border-brand/35 text-slate-800 hover:bg-blue-50/70 hover:text-blue-600 hover:border-blue-300 cursor-pointer" 
                                                  : "bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 hover:border-blue-200 cursor-pointer"
                                          }`}
                                        >
                                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                            !isUnlocked
                                              ? "bg-gray-200 text-gray-400"
                                              : isSelected
                                                ? "bg-white text-blue-600"
                                                : step.done
                                                  ? "bg-emerald-500 text-white"
                                                  : isCurrent
                                                    ? "bg-brand text-white"
                                                    : "bg-gray-200 text-gray-500"
                                          }`}>
                                            {step.done ? <Check className={`w-3 h-3 ${isSelected ? "text-blue-600" : ""}`} /> : (isUnlocked ? idx + 1 : <Lock className="w-3 h-3 text-gray-400" />)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-black truncate">{step.title}</span>
                                              {step.done && <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600"}`}>مكتمل</span>}
                                              {!step.done && isCurrent && <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600"}`}>الآن</span>}
                                              {!isUnlocked && <span className="text-[8.5px] bg-gray-150 font-extrabold text-gray-400 px-1 py-0.5 rounded flex items-center gap-0.5"><Lock className="w-3 h-3 text-gray-350 shrink-0" /> معلق</span>}
                                            </div>
                                            <p className={`text-[8.5px] mt-0.5 truncate ${isSelected ? "text-blue-100" : "text-gray-500"}`}>{step.desc}</p>
                                          </div>
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>

                                {/* Left Column: Interactive Workspace for selected Step */}
                                <div className="flex-1 bg-white p-3 sm:p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm min-w-0" onClick={(e) => e.stopPropagation()}>
                                  {(() => {
                                    const curTab = activeStepTab[evt.id] ?? getStepIndex(nextStep);
                                    
                                    switch (curTab) {
                                      case 0: { // Step 1: Confirm with President
                                        const president = allMembers.find(m => m.committeeId === evt.committeeId && m.active !== false && m.role === "رئيس");
                                        const vicePres = allMembers.find(m => m.committeeId === evt.committeeId && m.active !== false && m.role === "نائب");
                                        
                                        return (
                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                                <CheckSquare className="w-4 h-4 text-brand" />
                                                تنسيق وتأكيد موعد وقاعة الاجتماع مع المسؤول
                                              </h3>
                                              <span className="text-[9px] text-gray-500 font-bold leading-none">مرحلة 1 من 8</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold">
                                              يتعين على الأخصائي الاتصال تلفونياً أو عبر البريد الإلكتروني بالمسؤول (أو نائب الرئيس حال انشغال الرئيس) للتوافق على موعد الفعالية، واعتماده رسمياً قبل إتمام الدعوة للأعضاء.
                                            </p>
                                            
                                            {/* President Info Card */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-right font-sans">
                                              <div className="p-3 bg-slate-50/70 rounded-lg border border-gray-150">
                                                <span className="block text-[8px] text-brand font-black mb-1">بيانات المسؤول</span>
                                                {president ? (
                                                  <div>
                                                    <p className="text-[10px] text-gray-800 font-extrabold">{president.title} {president.name}</p>
                                                    <p className="text-[9px] text-gray-550 font-bold leading-relaxed mt-0.5">رقم الجوال: {president.phone} | البريد: {president.email}</p>
                                                  </div>
                                                ) : (
                                                  <p className="text-[9px] text-amber-600 font-bold">لم يتم إسناد رئيس لهذه اللجنة بعد في سجل الأعضاء.</p>
                                                )}
                                              </div>
                                              
                                              <div className="p-3 bg-slate-50/70 rounded-lg border border-gray-150 text-right">
                                                <span className="block text-[8px] text-[#4ea0b0] font-black mb-1 font-bold">نائب المسؤول</span>
                                                {vicePres ? (
                                                  <div>
                                                    <p className="text-[10px] text-gray-800 font-extrabold">{vicePres.title} {vicePres.name}</p>
                                                    <p className="text-[9px] text-gray-550 font-bold leading-relaxed mt-0.5">رقم الجوال: {vicePres.phone} | البريد: {vicePres.email}</p>
                                                  </div>
                                                ) : (
                                                  <p className="text-[9px] text-amber-600 font-bold">لم يتم إسناد نائب رئيس لهذه اللجنة بعد.</p>
                                                )}
                                              </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                              <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                  type="checkbox"
                                                  checked={!!evt.committeeConfirmed}
                                                  onChange={(e) => updateEventWorkflow(evt.id, { committeeConfirmed: e.target.checked })}
                                                  className="w-4.5 h-4.5 rounded border-gray-150 text-brand focus:ring-brand cursor-pointer"
                                                />
                                                <span className="text-[10px] text-slate-900 font-extrabold select-none">
                                                  تم التواصل واعتماد الموعد وتفاصيل القاعة لتأكيد الجدول مع المسؤول
                                                </span>
                                              </label>
                                              
                                              {evt.committeeConfirmed ? (
                                                <span className="text-[9px] text-emerald-600 font-black flex items-center gap-1">
                                                  <Check className="w-3.5 h-3.5" /> تم التأكيد وتخطي الخطوة بنجاح
                                                </span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-bold">بانتظار التأكيد للمتابعة</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      case 1: { // Step 2: Send Invitations
                                        const invText = getGeneratedInvitation(evt);
                                        
                                        return (
                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                                <Send className="w-4 h-4 text-brand" />
                                                توليد وتعديل وإرسال الدعوة لجميع أعضاء اللجنة الكرام
                                              </h3>
                                              <span className="text-[9px] text-gray-500 font-bold">مرحلة 2 من 8</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold">
                                              يقوم النظام بتوليد صيغة مسودة الدعوة بناءً على تفاصيل الفعالية (الاسم، التاريخ، الساعة، والموقع). يمكنك التعديل يدوياً في الخانة أدناه ونسخها مباشرة.
                                            </p>
                                            
                                            <div className="relative font-sans">
                                              <textarea
                                                value={invText}
                                                onChange={(e) => updateEventWorkflow(evt.id, { invitationText: e.target.value })}
                                                className="w-full h-32 p-3 text-[10px] font-bold text-gray-800 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand focus:border-brand/55 resize-none bg-slate-50 leading-relaxed text-right"
                                                dir="rtl"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(invText);
                                                  setCopiedEventId(evt.id);
                                                  setTimeout(() => setCopiedEventId(null), 2000);
                                                }}
                                                className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-[#4ea0b0] text-white hover:bg-[#3d8391] border-transparent rounded-md text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                              >
                                                <Copy className="w-3 h-3" />
                                                {copiedEventId === evt.id ? "تم النسخ!" : "نسخ نص مسودة الدعوة"}
                                              </button>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                              <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                  type="checkbox"
                                                  checked={!!evt.invitationSent}
                                                  onChange={(e) => updateEventWorkflow(evt.id, { invitationSent: e.target.checked })}
                                                  className="w-4.5 h-4.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                />
                                                <span className="text-[10px] text-slate-900 font-extrabold select-none">
                                                  وضع علامة صح لتأكيد نسخ وإرسال نص الدعوة للأعضاء بنجاح للفعالية
                                                </span>
                                              </label>
                                              
                                              {evt.invitationSent ? (
                                                <span className="text-[9px] text-emerald-600 font-black flex items-center gap-1">
                                                  <Check className="w-3.5 h-3.5" /> جاهز
                                                </span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-bold">يرجى تأكيد إرسال الدعوات المكتوبة</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      case 2: { // Step 3: Attendance Confirmation
                                        const commMems = allMembers.filter(m => (String(m.committeeId) === String(evt.committeeId) || String(m.secondaryCommitteeId) === String(evt.committeeId)) && m.active !== false);
                                        const totalCount = commMems.length;
                                        const presentIds = evt.confirmedAttendees || [];
                                        const presentMems = commMems.filter(m => presentIds.includes(m.id));
                                        const ratioMet = totalCount > 0 ? (presentMems.length >= (totalCount / 2)) : false;
                                        
                                        const headPresent = presentMems.some(m => m.role === "رئيس" || m.role?.includes("رئيس"));
                                        const vicePresent = presentMems.some(m => m.role === "نائب" || m.role?.includes("نائب") || m.role?.includes("أمين"));
                                        const leaderOk = headPresent || vicePresent;
                                        const quorumMet = ratioMet && leaderOk;
                                        
                                        return (
                                          <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 text-right">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 order-1">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-brand" />
                                                تأكيد حضور الأعضاء ورصد النصاب القانوني للاجتماع الحالي
                                              </h3>
                                              <span className="text-[9px] text-gray-500 font-bold">مرحلة 3 من 8</span>
                                            </div>
                                            
                                            {/* Live Quorum Display */}
                                            <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between gap-3 order-2 ${quorumMet ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                                              <div>
                                                <span className="block text-[8.5px] text-gray-500 font-bold mb-0.5">حالة النصاب القانوني المعتمد للاجتماع</span>
                                                <span className={`text-[10.5px] font-black flex items-center gap-1 ${quorumMet ? "text-emerald-700" : "text-amber-750"}`}>
                                                  {quorumMet 
                                                    ? "✓ اكتمل النصاب القانوني وتأكيد الاجتماع (تحول الحالة تلقائياً لـ \"مؤكد\")" 
                                                    : "⚠ لم يكتمل النصاب المطلوب (حضور نصف الأعضاء + رئيس أو نائب رئيس)"}
                                                </span>
                                              </div>
                                              
                                              <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-right">
                                                <div className="border-r border-gray-300 pr-4">
                                                  <span className="block text-[8px] text-gray-500 font-bold">نسبة حضور الأعضاء الكليين</span>
                                                  <span className="text-[10.5px] font-extrabold text-slate-800 block">
                                                    {presentMems.length} من {totalCount} ({totalCount > 0 ? Math.round((presentMems.length / totalCount) * 100) : 0}%)
                   								  </span>
                                                </div>
                                                <div className="border-r border-gray-300 pr-4">
                                                  <span className="block text-[8px] text-gray-500 font-bold">رئيس / نائب اللجنة حاضر؟</span>
                                                  <span className="text-[10.5px] font-extrabold block">
                                                    {leaderOk 
                                                      ? <span className="text-emerald-600 font-black">✓ حاضر</span> 
                                                      : <span className="text-amber-600 font-black">⚠ كلاهما غائب</span>}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="text-[9.5px] text-gray-500 leading-relaxed font-bold bg-slate-50 p-2.5 rounded-lg border border-gray-200 order-3">
                                              💡 <span className="text-slate-900">تعليمات الحضور:</span> يشترط حضور نصف الأعضاء المعينين على الأقل للجنة، شريطة وجود المسؤول أو نائب الرئيس لتسجيل اعتماد نصاب الفعالية القانوني.
                                             </div>

                                             {/* Members list */}
                                            <div>
                                              <span className="block text-[10.5px] text-slate-800 font-black mb-2">رصد الحاضرين من كشف توقيع الحضور الفعلي</span>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 border border-gray-200 rounded-lg bg-gray-50/45">
                                                {commMems.map(mem => {
                                                  const isPresent = presentIds.includes(mem.id);
                                                  return (
                                                    <button
                                                      key={mem.id}
                                                      type="button"
                                                      onClick={() => {
                                                        let nextAttendees = [...presentIds];
                                                        if (isPresent) {
                                                          nextAttendees = nextAttendees.filter(id => id !== mem.id);
                                                        } else {
                                                          nextAttendees.push(mem.id);
                                                        }
                                                        updateEventWorkflow(evt.id, { confirmedAttendees: nextAttendees });
                                                      }}
                                                      className={`text-right p-2 rounded border transition-all flex items-center gap-2 cursor-pointer ${
                                                        isPresent 
                                                          ? "bg-emerald-500/10 border-emerald-500/40 text-slate-900" 
                                                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                                                      }`}
                                                    >
                                                      <input 
                                                        type="checkbox"
                                                        checked={isPresent}
                                                        readOnly
                                                        className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                                                      />
                                                      <div className="min-w-0 flex-1 leading-snug">
                                                        <p className="text-[9.5px] font-black truncate text-slate-900">{mem.title} {mem.name}</p>
                                                        <p className="text-[8px] text-gray-500 font-extrabold">{mem.role}</p>
                                                      </div>
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>

                                             <div className="p-3 bg-emerald-50/70 border border-emerald-250 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right mt-3">
                                               <label className="flex items-center gap-2.5 cursor-pointer">
                                                 <input 
                                                   type="checkbox"
                                                   checked={!!evt.attendanceConfirmed}
                                                   onChange={(e) => updateEventWorkflow(evt.id, { attendanceConfirmed: e.target.checked })}
                                                   className="w-4.5 h-4.5 rounded border-gray-350 text-brand focus:ring-brand cursor-pointer focus:outline-none shrink-0"
                                                 />
                                                 <span className="text-[10px] text-slate-900 font-extrabold select-none">
                                                   تأكيد حضور الأعضاء والنصاب القانوني وتأكيد قائمة الحاضرين للسماح بالانتقال لتجهيزات اللقاء
                                                 </span>
                                               </label>
                                               {evt.attendanceConfirmed ? (
                                                 <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> تم التأكيد</span>
                                               ) : (
                                                 <span className="text-[9.5px] text-amber-600 font-extrabold shrink-0">بانتظار التأكيد</span>
                                               )}
                                             </div>
                                          </div>
                                        );
                                      }

                                      case 3: { // Step 4: Meeting Preparations
                                        const prepText = getGeneratedPreparations(evt);
                                        const currentPreps = evt.preparationsChecklist !== undefined ? evt.preparationsChecklist : DEFAULT_PREPARATIONS;
                                        
                                        return (
                                          <div className="space-y-4 text-right">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                                <Presentation className="w-4 h-4 text-brand" />
                                                تجهيزات اللقاء وتأمين المتطلبات والضيافة والتغطية الإعلامية
                                              </h3>
                                              <span className="text-[9px] text-gray-500 font-bold">مرحلة 4 من 8</span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-550 leading-relaxed font-bold font-sans">
                                              حدد المتطلبات والجاهزية المطلوبة للقاء من خلال قائمة التحقق التفاعلية، وسيتم توليد خطاب تأمين تجهيزات اللقاء الموجه للمختصين تلقائياً بالأسفل:
                                            </p>

                                            {/* Interactive Checklist of Preparations - At the TOP */}
                                            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 font-sans space-y-3">
                                              <div className="flex items-center justify-between">
                                                <span className="block text-[10px] font-black text-brand">قائمة التحقق المبرمجة لتجهيز اللقاء (تفاعلية):</span>
                                                <span className="text-[8.5px] font-bold text-gray-500">تم تحديد {currentPreps.length} من أصل {DEFAULT_PREPARATIONS.length}</span>
                                              </div>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                {DEFAULT_PREPARATIONS.map((prepItem) => {
                                                  const isChecked = currentPreps.includes(prepItem);
                                                  return (
                                                    <label 
                                                      key={prepItem} 
                                                      className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                                                        isChecked 
                                                          ? "bg-emerald-500/5 border-emerald-500/25 text-slate-900" 
                                                          : "bg-white border-gray-200 text-gray-400 hover:bg-gray-100/50"
                                                      }`}
                                                    >
                                                      <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                          let nextPreps;
                                                          if (e.target.checked) {
                                                            nextPreps = [...currentPreps, prepItem];
                                                          } else {
                                                            nextPreps = currentPreps.filter(item => item !== prepItem);
                                                          }
                                                          const updatedEvt = { 
                                                            ...evt, 
                                                            preparationsChecklist: nextPreps, 
                                                            preparationsText: undefined
                                                          };
                                                          const newText = getGeneratedPreparations(updatedEvt);
                                                          updateEventWorkflow(evt.id, { 
                                                            preparationsChecklist: nextPreps,
                                                            preparationsText: newText
                                                          });
                                                        }}
                                                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer focus:outline-none shrink-0"
                                                      />
                                                      <span className={`text-[10px] font-bold leading-snug ${isChecked ? "text-slate-800" : "text-gray-500"}`}>{prepItem}</span>
                                                    </label>
                                                  );
                                                })}
                                              </div>

                                              {/* Additional Special Request Inputs */}
                                              <div className="mt-3 pt-3 border-t border-gray-200/80 flex flex-col gap-1.5">
                                                <label className="text-[10.5px] font-black text-slate-800">تفاصيل إضافية / طلبات مخصصة للقاء (اكتب كل طلب في سطر جديد ليظهر كبند مستقل):</label>
                                                <textarea 
                                                  rows={3}
                                                  value={evt.preparationsAdditional || ""}
                                                  placeholder="اكتب أي متطلبات أو تجهيزات خاصة إضافية (يمكنك كتابة أكثر من سطر، وسيتم إدراج كل سطر كبند مستقل في الخطاب)..."
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    const updatedEvt = { 
                                                      ...evt, 
                                                      preparationsAdditional: val, 
                                                      preparationsText: undefined
                                                    };
                                                    const newText = getGeneratedPreparations(updatedEvt);
                                                    updateEventWorkflow(evt.id, { 
                                                      preparationsAdditional: val,
                                                      preparationsText: newText
                                                    });
                                                  }}
                                                  className="w-full text-[10px] font-bold p-2 border border-gray-200 rounded-lg bg-white text-right focus:ring-1 focus:ring-brand text-slate-800 placeholder-gray-400 leading-relaxed"
                                                />
                                              </div>
                                            </div>

                                            {/* Generated Letter / Textarea Block - At the BOTTOM */}
                                            <div className="flex flex-col gap-1.5 pt-1">
                                              <span className="block text-[10.5px] font-black text-slate-800">المولد الذكي لبريد التجهيزات الإلكتروني:</span>
                                              <div className="relative font-sans">
                                                <textarea
                                                  value={prepText}
                                                  onChange={(e) => updateEventWorkflow(evt.id, { preparationsText: e.target.value })}
                                                  rows={9}
                                                  className="w-full text-[9.5px] p-2.5 pb-10 border border-gray-200 rounded-lg text-right font-sans bg-amber-50/20 text-slate-800 focus:ring-1 focus:ring-brand leading-relaxed animate-none"
                                                  dir="rtl"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(prepText);
                                                     setCopiedEventId(evt.id);
                                                     setTimeout(() => setCopiedEventId(null), 2000);
                                                  }}
                                                  className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-[#4ea0b0] text-white hover:bg-[#3d8391] border-transparent rounded-md text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                                >
                                                  <Copy className="w-3 h-3" />
                                                  {copiedEventId === evt.id ? "تم النسخ!" : "نسخ بريد التجهيزات"}
                                                </button>
                                              </div>
                                            </div>

                                            {/* Confirmation */}
                                            <div className="p-3 bg-emerald-50/70 border border-emerald-250 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right">
                                              <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                  type="checkbox"
                                                  checked={!!evt.preparationsConfirmed}
                                                  onChange={(e) => updateEventWorkflow(evt.id, { preparationsConfirmed: e.target.checked })}
                                                  className="w-4.5 h-4.5 rounded border-gray-350 text-brand focus:ring-brand cursor-pointer focus:outline-none shrink-0"
                                                />
                                                <span className="text-[10px] text-slate-900 font-extrabold select-none">
                                                  تأكيد استلام وتأمين كافة التجهيزات اللوجستية والفنية والضيافة والتغطيات للقاء الحالي
                                                </span>
                                              </label>
                                              {evt.preparationsConfirmed ? (
                                                <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> تم تأكيد التجهيزات</span>
                                              ) : (
                                                <span className="text-[9.5px] text-amber-600 font-extrabold shrink-0">بانتظار التأكيد</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      
                                      case 4: { // Step 5: Agenda Builder
										const agenda = evt.agenda || [];
										const eventComm = committees.find(c => String(c.id) === String(evt.committeeId));
										const commSpecialist = eventComm?.specialist || "السكرتير";
										const commMembers = allMembers.filter(m => String(m.committeeId) === String(evt.committeeId) || String(m.secondaryCommitteeId) === String(evt.committeeId));
										
										const handleAddAgendaItem = () => {
											if (!agendaFormTitle.trim()) return;
											
											if (editingAgendaItemId) {
												const updatedAgenda = agenda.map(item => 
													item.id === editingAgendaItemId 
														? { ...item, title: agendaFormTitle.trim(), duration: Number(agendaFormDuration) || 15, specialist: agendaFormSpecialistId || commSpecialist }
														: item
												);
												updateEventWorkflow(evt.id, { agenda: updatedAgenda });
												setEditingAgendaItemId(null);
											} else {
												const newItem = {
													id: Math.random().toString(36).substring(2, 9),
													title: agendaFormTitle.trim(),
													duration: Number(agendaFormDuration) || 15,
													specialist: agendaFormSpecialistId || commSpecialist,
													discussion: "",
													recommendation: "",
													assignee: "",
													durationRec: ""
												};
												updateEventWorkflow(evt.id, { agenda: [...agenda, newItem] });
											}
											setAgendaFormTitle("");
											setAgendaFormSpecialistId("");
										};
										
										const handleRemoveAgendaItem = (itemId) => {
											updateEventWorkflow(evt.id, { agenda: agenda.filter(item => item.id !== itemId) });
										};
										
										return (
											<div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 font-sans text-right">
												<div className="flex items-center justify-between pb-2 border-b border-gray-100 order-1">
													<h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
														<Sliders className="w-4 h-4 text-brand" />
														بناء بنود جدول أعمال الفعالية وتحديد المدد مع المختصين
													</h3>
													<span className="text-[9px] text-gray-500 font-bold">مرحلة 5 من 8</span>
												</div>


												{/* Form block */}
												<div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200/80 space-y-3 order-2">
													{/* AI Agenda Reader */}
													<div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 mb-2 space-y-3">
														<div className="flex items-center gap-2 mb-2">
															<Paperclip className="w-4 h-4 text-emerald-600" />
															<h4 className="text-[10px] font-black text-slate-800">استيراد بنود الاجتماع من محضر معتمد</h4>
														</div>
														<div className="flex items-center gap-3">
															<div className="w-64">
																<AttachmentInput 
																	id={`agendaMinutesFile-${evt.id}`} 
																	label="إرفاق محضر الاجتماع" 
																	value={agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null)} 
																	onChange={(val) => setAgendaMinutesFiles(prev => ({ ...prev, [evt.id]: val }))} 
																/>
															</div>
															<div className="flex-1 flex flex-col items-start gap-2">
																<button
																	onClick={async () => {
																		const agendaMinutesFile = agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : (evt.approvedMinutesUrl || null);
																		if (!agendaMinutesFile) return;
																		setIsReadingMinutes(true);
																		try {
																			// Simulated API call for demo purposes, you could hook up real gemini here
																			let fileBase64 = null;
        let mimeType = null;
        let docName = "محضر_مستورد.pdf";
        let fileId = null;
        let accessToken = null;
        
        try {
            accessToken = await getCachedAccessToken();
        } catch(e) {}
        
        if (typeof agendaMinutesFile === 'string') {
            docName = "محضر_مستورد_من_رابط.pdf";
            const match = agendaMinutesFile.match(/[-\w]{25,}/);
            if (match) {
                fileId = match[0];
                showGlobalToast("جاري جلب المحضر من جوجل درايف...", "success");
            } else {
                try {
                    showGlobalToast("جاري تنزيل المحضر من جوجل درايف...", "success");
                    const driveData = await downloadDriveFileBase64(agendaMinutesFile);
                    fileBase64 = driveData.base64;
                    mimeType = driveData.mimeType;
                } catch (e) {
                    console.error(e);
                    showGlobalToast("خطأ: " + (e as Error).message, "error");
                    setIsReadingMinutes(false);
                    return;
                }
            }
        } else {
            let uploadedToDrive = false;
            docName = "محضر_مستورد_" + (agendaMinutesFile as File).name;
            if (accessToken) {
                try {
                    const folderId = await autoCreateEventDriveFolders(evt, []);
                    if (folderId) {
                        const reader = new FileReader();
                        const b64 = await new Promise((resolve) => {
                            reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                            reader.readAsDataURL(agendaMinutesFile as File);
                        });
                        mimeType = (agendaMinutesFile as File).type;
                        const res = await uploadBinaryFileToDrive(docName, b64 as string, mimeType, folderId);
                        if (res && res.id) {
                            fileId = res.id;
                            uploadedToDrive = true;
                            const fileUrl = `https://drive.google.com/file/d/${res.id}/view`;
                            updateEventWorkflow(evt.id, { approvedMinutesUrl: fileUrl });
                            showGlobalToast("تم جلب الملف وأرشفته في جوجل درايف بنجاح", "success");
                        } else {
                            fileBase64 = b64;
                        }
                    }
                } catch (e) {
                    console.error("Drive auto-archive failed:", e);
                }
            }
            if (!uploadedToDrive) {
                if ((agendaMinutesFile as File).size > 15 * 1024 * 1024) {
                    throw new Error("حجم الملف كبير جداً للاستخراج المباشر (أكثر من 15 ميجا). يرجى التأكد من تسجيل الدخول بحساب جوجل ليتم أرشفته أولاً.");
                }
                const reader = new FileReader();
                fileBase64 = await new Promise((resolve) => {
                    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                    reader.readAsDataURL(agendaMinutesFile as File);
                });
                mimeType = (agendaMinutesFile as File).type;
            }
        }

        
        const prompt = "استخرج المناقشة (discussion)، التوصية (recommendation)، المسؤول (assignee)، ومدة التنفيذ (durationRec) لكل بند من بنود جدول الأعمال التالية من المحضر المرفق.\nقائمة البنود الحالية:\n" + JSON.stringify(agenda.map((a) => ({ id: a.id, title: a.title }))) + "\nأرجع النتيجة كـ JSON Array بهذا الشكل بالضبط:\n[{\"id\": \"id-1\", \"title\": \"عنوان البند\", \"discussion\": \"نص المناقشة\", \"recommendation\": \"نص التوصية\", \"assignee\": \"اسم المسؤول\", \"durationRec\": \"يومين\"}]\nيجب أن تتطابق الـ id و الـ title مع المرسل. إذا لم تجد مناقشة أو توصية اتركها فارغة.";
        let aiText = "";
        try {
            aiText = await extractAgendaClient(prompt, fileBase64, mimeType, fileId, accessToken);
        } catch (e) {
            console.error(e);
            showGlobalToast("خطأ في قراءة المحضر: " + (e.message || "فشل غير معروف"), "error");
            setIsReadingMinutes(false);
            return;
        }
    
																			try {
																				const jsonMatch = aiText.match(/\[.*\]/s);
																				let parsedItems = [];
																				if (jsonMatch) {
																					parsedItems = JSON.parse(jsonMatch[0]);
																				}
																				
																				if (parsedItems && parsedItems.length > 0) {
																					const newAgenda = [...agenda];
																					let addedCount = 0;
																					let duplicateCount = 0;
																					parsedItems.forEach((item: any) => {
																						const itemTitle = (item.title || "بند مستخرج").trim();
																						const exists = newAgenda.some(existing => (existing.title || '').trim() === itemTitle);
																						if (!exists) {
																							newAgenda.push({
																								id: Math.random().toString(36).substring(2, 9),
																								title: itemTitle,
																								duration: item.duration || 15,
																								specialist: item.specialist || commSpecialist,
																								discussion: "",
																								recommendation: "",
																								assignee: "",
																								durationRec: ""
																							});
																							addedCount++;
																						} else {
																							duplicateCount++;
																						}
																					});
																					if (addedCount > 0) {
																						updateEventWorkflow(evt.id, { agenda: newAgenda });
																						showGlobalToast("تم استخراج " + addedCount + " بنود بنجاح" + (duplicateCount > 0 ? " (تم تجاهل " + duplicateCount + " مكررة)" : ""), "success");
																					} else {
																						showGlobalToast("لم يتم إضافة بنود جديدة (جميع البنود المستخرجة موجودة مسبقاً)", "error");
																					}
																				} else {
																					showGlobalToast("لم يتمكن النظام من استخراج بنود واضحة", "error");
																				}
																			} catch(e) {
																				showGlobalToast("حدث خطأ في فهم البنود المستخرجة", "error");
																			}
																		} catch (error: any) {
																			console.error(error);
																			showGlobalToast(error.message || "حدث خطأ أثناء القراءة", "error");
																		} finally {
																			setIsReadingMinutes(false);
																		}
																	}}
																	disabled={!(agendaMinutesFiles[evt.id] !== undefined ? agendaMinutesFiles[evt.id] : evt.approvedMinutesUrl) || isReadingMinutes}
																	className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-[10px] flex items-center gap-2 transition-all shadow-sm"
																>
																	{isReadingMinutes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
																	قراءة واستخراج البنود تلقائياً
																</button>
																<p className="text-[9px] text-gray-500 font-bold leading-relaxed">
																	سيقوم النظام الذكي بمسح المحضر المرفق واستخراج<br/>بنود جدول الأعمال وإضافتها بالأسفل تلقائياً.
																</p>
															</div>
														</div>
													</div>

													<span className="block text-[10px] font-black text-brand pt-2 border-t border-gray-100">إضافة بند إضافي جديد لجدول الأعمال يدوياً</span>

													<div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-right">
														
														<div className="md:col-span-6 flex flex-col gap-1">
															<label className="text-[8.5px] font-bold text-gray-750">موضوع بند جدول الأعمال</label>
															<input 
																type="text"
																placeholder="مثال: التصويت على اللائحة التنظيمية الجديدة"
																value={agendaFormTitle}
																onChange={(e) => setAgendaFormTitle(e.target.value)}
																className="w-full text-[10px] font-bold p-1.5 border border-gray-200 rounded text-right bg-white"
															/>
														</div>
														
														<div className="md:col-span-2 flex flex-col gap-1">
															<label className="text-[8.5px] font-bold text-gray-750">المدة الكلية (بالدقائق)</label>
															<input 
																type="number"
																min="1"
																value={agendaFormDuration}
																onChange={(e) => setAgendaFormDuration(Number(e.target.value))}
																className="w-full text-[10px] font-bold p-1.5 border border-gray-200 rounded text-center bg-white"
															/>
														</div>

														<div className="md:col-span-4 flex flex-col gap-1">
															<label className="text-[8.5px] font-bold text-gray-750">تحديد اسم المختص</label>
															<select
																value={agendaFormSpecialistId}
																onChange={(e) => setAgendaFormSpecialistId(e.target.value)}
																className="w-full text-[10px] font-bold p-1.5 border border-gray-200 rounded bg-white text-right"
															>
																<option value="">-- اختر المختص --</option>
																{commSpecialist && (
																	<optgroup label="السكرتير المسؤول">
																		<option value={commSpecialist}>{commSpecialist} (السكرتير)</option>
																	</optgroup>
																)}
																{commMembers.length > 0 && (
																	<optgroup label="أعضاء اللجنة">
																		{commMembers.map((m) => {
																			const displayName = `${m.title} ${m.name} (${m.role})`;
																			return (
																				<option key={m.id} value={displayName}>
																					{displayName}
																				</option>
																			);
																		})}
																	</optgroup>
																)}
															</select>
														</div>
													</div>
													
													<div className="flex justify-end pt-1">
														<button
															type="button"
															onClick={handleAddAgendaItem}
															className="px-4 py-2 bg-slate-900 border-transparent hover:bg-slate-800 text-white font-extrabold rounded text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
														>
															<Plus className="w-3.5 h-3.5" />
															{editingAgendaItemId ? "حفظ التعديلات" : "إدراج البند إلى جدول فعاليات الأعمال بالأسفل"}
														</button>
													</div>
												</div>

												{/* Agenda list table */}
												<div className="order-3">
													<span className="block text-[10px] text-slate-800 font-black mb-1.5">أجندة جدول الأعمال المسجلة للفعالية حتى الآن ({agenda.length})</span>
													{agenda.length === 0 ? (
														<div className="text-center p-3 sm:p-4 md:p-6 border rounded-lg bg-gray-50 text-gray-500 text-[10px] font-bold border-gray-200">
															لا يوجد بنود أعمال حالية في الفعالية. يرجى استخدام النموذج أعلاه لإدراج الأجندة وفتح المحضر.
														</div>
													) : (
														<div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
															<table className="w-full text-right font-sans text-[10.5px]">
																<thead>
																	<tr className="bg-slate-50 border-b border-gray-200 text-gray-700 font-bold text-[10px]">
																		<th className="whitespace-nowrap px-3 py-2 text-center w-12">م</th>
																		<th className="whitespace-nowrap px-3 py-2">البند / الموضوع الرئيسي</th>
																		<th className="whitespace-nowrap px-3 py-2 text-center w-28">المدة المحددة</th>
																		<th className="whitespace-nowrap px-3 py-2">المسؤول عن العرض/المناقشة</th>
																		<th className="whitespace-nowrap px-3 py-2 text-center w-24">الإجراء</th>
																	</tr>
																</thead>
																<tbody className="divide-y text-gray-850 font-bold">
																	{agenda.map((item, index) => (
																		<tr key={item.id || `item-${index}`} className="hover:bg-slate-50/50">
																			<td className="whitespace-nowrap px-3 py-2 text-center font-bold text-gray-400">{index + 1}</td>
																			<td className="whitespace-nowrap px-3 py-2 font-black text-slate-900">{item.title}</td>
																			<td className="whitespace-nowrap px-3 py-2 text-center text-brand font-black">{item.duration} دقيقة</td>
																			<td className="whitespace-nowrap px-3 py-2 text-gray-800 font-black">{item.specialist}</td>
																			<td className="whitespace-nowrap px-3 py-2 text-center">
																				<div className="flex items-center justify-center gap-2">
																					<button
																						type="button"
																						onClick={() => {
																							setAgendaFormTitle(item.title);
																							setAgendaFormDuration(item.duration);
																							setAgendaFormSpecialistId(item.specialist || "");
																							setEditingAgendaItemId(item.id);
																						}}
																						className="text-blue-600 hover:bg-blue-50 p-1 rounded cursor-pointer transition-colors"
																						title="تحرير البند"
																					>
																						<Settings className="w-3.5 h-3.5" />
																					</button>
																					<button
																						type="button"
																						onClick={() => handleRemoveAgendaItem(item.id)}
																						className="text-red-600 hover:bg-red-50 p-1 rounded cursor-pointer transition-colors"
																						title="حذف"
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

													{/* Bottom Confirmation Checkbox for Agenda is placed here at the absolute bottom */}
													<div className="p-3 bg-emerald-50/70 border border-emerald-250 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-right mt-3 mb-0">
														<label className="flex items-center gap-2.5 cursor-pointer">
															<input 
																type="checkbox"
																checked={!!evt.agendaTransferred}
																disabled={agenda.length === 0 || isAutoFillingMinutes[evt.id]}
																onChange={(e) => handleAutoFillMinutesFromAgenda(evt, e.target.checked)}
																className="w-4.5 h-4.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer focus:outline-none shrink-0"
															/>
															<span className="text-[10px] text-slate-900 font-extrabold select-none">
																ترحيل جدول الأعمال لمحضر الاجتماع وتأكيد الأجندة للانتقال لمحضر الاجتماع
															</span>
														</label>
														{isAutoFillingMinutes[evt.id] ? (
                                                            <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري التعبئة التلقائية...</span>
                                                        ) : evt.agendaTransferred ? (
															<span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 shrink-0"><Check className="w-3.5 h-3.5" /> تم الترحيل للمحضر</span>
														) : (
															<span className="text-[9.5px] text-amber-600 font-extrabold shrink-0">بانتظار تفعيل خيار الترحيل</span>
														)}
													</div>
												</div>
											</div>
										);
										}case 5: { // Step 6: Meeting Minutes
                                        const agenda = evt.agenda || [];
                                        
                                        const handleUpdateAgendaMinutes = (itemId: string, fields: Partial<typeof agenda[0]>) => {
                                          const updatedAgenda = agenda.map(item => {
                                            if (item.id === itemId) return { ...item, ...fields };
                                            return item;
                                          });
                                          updateEventWorkflow(evt.id, { agenda: updatedAgenda });
                                        };
                                        
                                        return (
                                          <div className="space-y-4 text-right font-sans">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                                <BookOpen className="w-4 h-4 text-brand" />
                                                تحرير بنود المحضر وكتابة التوصية والمسؤول والمدة (الوقائع الرسمية)
                                              </h3>
                                              <span className="text-[9px] text-gray-500 font-bold">مرحلة 6 من 8</span>
                                            </div>

                                            {agenda.length === 0 ? (
                                              <div className="text-center p-3 sm:p-4 md:p-6 border border-yellow-250 rounded-lg bg-yellow-50 text-amber-700 text-[10px] font-bold">
                                                ⚠ تنبيه: لم يتم تسجيل أي بنود في الأجندة بعد. يرجى ملء جدول الأعمال في (الخطوة 4) أولاً.
                                              </div>
                                            ) : (
                                              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                                {agenda.map((item, idx) => (
                                                  <div key={item.id || `item-${idx}`} className="p-3.5 border border-gray-200 rounded-lg bg-slate-50 space-y-3 shadow-inner">
                                                    <div className="flex items-center justify-between border-b pb-1.5 border-gray-200">
                                                      <span className="font-extrabold text-[10.5px] text-slate-900">
                                                        {idx + 1}. {item.title} ({item.specialist})
                                                      </span>
                                                      <span className="text-[8.5px] font-black text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded">
                                                        المدة الكلية المتاحة: {item.duration} دقيقة
                                                      </span>
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-3 text-right font-sans">
                                                      <div className="flex flex-col gap-1 w-full">
                                                        <label className="text-[8.5px] font-extrabold text-gray-750">المناقشة وتدوين مجريات الوقائع</label>
                                                        <textarea
                                                          value={item.discussion || ""}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { discussion: e.target.value })}
                                                          placeholder="تحدث الحضور حول البند وتم رصد الآتي..."
                                                          className="w-full text-[9.5px] font-bold p-2 border border-gray-200 rounded leading-relaxed bg-white h-18 resize-none text-right"
                                                        />
                                                      </div>

                                                      <div className="flex flex-col gap-1 w-full">
                                                        <label className="text-[8.5px] font-extrabold text-[#4ea0b0] flex items-center gap-2">التوصية المنبثقة من البند (الزر الذهبي) {item.inactiveRecommendation && <button type="button" onClick={() => handleUpdateAgendaMinutes(item.id, { inactiveRecommendation: false })} className="text-[9px] bg-red-100 text-red-600 hover:bg-emerald-100 hover:text-emerald-700 px-1.5 py-0.5 rounded transition-colors cursor-pointer border border-red-200 hover:border-emerald-200" title="إعادة تفعيل التوصية">غير فعالة (اضغط للتفعيل)</button>}</label>
                                                        <textarea
                                                          value={item.recommendation || ""}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { recommendation: e.target.value })}
                                                          placeholder="تمت التوصية بـ..."
                                                          className="w-full text-[9.5px] font-bold p-2 border border-[#4ea0b0]/40 focus:ring-[#4ea0b0] rounded leading-relaxed bg-white h-18 resize-none text-right"
                                                        />
                                                      </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-right pt-2.5 border-t border-dashed border-gray-200 font-sans items-end">
                                                      <div className="md:col-span-5 flex flex-col gap-1">
                                                        <label className="text-[8.5px] font-bold text-gray-750">المكلف بالتوصية</label>
                                                        <select
                                                          value={(item.assignee === "الأخصائي" && evt.employees?.[0]) ? `${evt.employees[0]} (السكرتير)` : (item.assignee === "الأخصائي" ? "السكرتير" : (item.assignee || ""))}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { assignee: e.target.value })}
                                                          className="w-full text-[9.5px] font-bold p-1.5 border border-gray-200 rounded bg-white text-right h-8.5 focus:ring-brand focus:border-brand focus:outline-none"
                                                        >
                                                          <option value="">-- كشف المكلفين المتاحين --</option>
                                                          <option value={evt.employees?.[0] ? `${evt.employees[0]} (السكرتير)` : "السكرتير"}>
                                                            {evt.employees?.[0] ? `${evt.employees[0]} (السكرتير)` : "السكرتير"}
                                                          </option>
                                                          {allMembers.filter(m => String(m.committeeId) === String(evt.committeeId) || String(m.secondaryCommitteeId) === String(evt.committeeId)).map(m => (
                                                            <option key={m.id} value={`${m.role} - ${m.title} ${m.name}`}>{m.title} {m.name} ({m.role})</option>
                                                          ))}
                                                          
                                                        </select>
                                                      </div>

                                                      <div className="md:col-span-4 flex flex-col gap-1 w-full">
                                                        <label className="text-[8.5px] font-bold text-gray-750">المهلة المحددة للتنفيذ (عدد أيام العمل، بدون الجمعة والسبت)</label>
                                                        <input
                                                          type="number"
                                                          min="1"
                                                          value={item.workDays || ""}
                                                          onChange={(e) => {
                                                            const dVal = parseInt(e.target.value) || 0;
                                                            const calcDate = calculateWorkingDaysDate(evt.date || new Date().toISOString().split('T')[0], dVal);
                                                            handleUpdateAgendaMinutes(item.id, { 
                                                              workDays: dVal,
                                                              durationRec: calcDate ? `تاريخ استحقاق: ${calcDate} (${dVal} أيام عمل)` : ""
                                                            });
                                                          }}
                                                          placeholder="مثال: 5، 10، 15 يوم عمل"
                                                          className="w-full text-[10px] font-bold p-1.5 border border-gray-200 rounded bg-white text-right focus:outline-none focus:border-brand h-8.5"
                                                        />
                                                      </div>

                                                      <div className="md:col-span-3 flex flex-col gap-1 min-h-[34px]">
                                                        <label className="text-[8.5px] font-bold text-gray-750">نوع التوصية</label>
                                                        <select
                                                          value={item.impactType || ""}
                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { impactType: e.target.value as any })}
                                                          className={`w-full text-[10px] font-bold p-1.5 border border-gray-200 rounded bg-white text-right focus:outline-none focus:border-brand h-8.5 ${!item.impactType ? 'text-gray-400' : 'text-slate-800'}`}
                                                        >
                                                          <option value="" disabled className="text-gray-400">اختر نوع التوصية</option>
                                                          <option value="عادية" className="text-slate-800">توصية عادية</option>
                                                          <option value="آجل" className="text-slate-800">توصية آجلة</option>
                                                          <option value="ذات أثر" className="text-slate-800">توصية ذات أثر</option>
                                                        </select>
                                                        {item.impactType === "ذات أثر" && (
                                                          <div className="flex items-center gap-3 mt-1 px-1">
                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                              <input
                                                                type="checkbox"
                                                                checked={!!item.isUrgent}
                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isUrgent: e.target.checked })}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                              />
                                                              <span className="text-[9px] text-slate-900 font-extrabold">عاجل</span>
                                                            </label>
                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                              <input
                                                                type="checkbox"
                                                                checked={!!item.isImportant}
                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isImportant: e.target.checked })}
                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                                                              />
                                                              <span className="text-[9px] text-slate-900 font-extrabold">مهم</span>
                                                            </label>
                                                          </div>
                                                        )}
                                                      </div>

                                                      {item.durationRec && (
                                                        <div className="md:col-span-12 text-[8.5px] text-emerald-600 font-extrabold mr-1 -mt-1.5">
                                                          {item.durationRec}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {agenda.length > 0 && (
                                              <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <button
                                                  type="button"
                                                  onClick={() => updateEventWorkflow(evt.id, { minutesSaved: true, minutesExportChecked: true })}
                                                  className="px-3 sm:px-4 md:px-5 py-2.5 bg-emerald-600 border-transparent hover:bg-emerald-555 text-white font-extrabold rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-emerald-500/10"
                                                >
                                                  <CheckCircle className="w-4 h-4" />
                                                  حفظ وتثبيت وقائع المحضر بالكامل
                                                </button>
                                                
                                                {evt.minutesSaved && (
                                                  <label className="flex items-center gap-2 bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-250 shadow-sm font-black">
                                                    <input 
                                                      type="checkbox"
                                                      checked={true} style={{ display: "none" }}
                                                      onChange={() => {}}
                                                      className="w-4.5 h-4.5 rounded border-gray-350 text-brand focus:ring-brand cursor-pointer"
                                                    />
                                                    <span className="text-[9.5px] text-emerald-700 font-extrabold select-none">
                                                      تم تأكيد وتثبيت وقائع المحضر بنجاح. يمكنك التقدّم الآن لمرحلة ترحيل التوصيات.
                                                    </span>
                                                  </label>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                      
                                      case 6: { // Step 7: Export & Confirm to Recommendations Page
                                        const agenda = evt.agenda || [];
                                        const recsToExport = agenda.filter(item => item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation);
                                        const existingMeetingRecs = allDbRecommendations.filter(rec => rec && rec.id && rec.id.startsWith(`custom-rec-${evt.id}-`));

                                        // Auto selection checklist initialization
                                        const nextSelections = { ...selectedAgendaRecsExport };
                                        let needsStateUpdate = false;
                                        recsToExport.forEach(item => {
                                          const key = `${evt.id}-${item.id}`;
                                          if (nextSelections[key] === undefined) {
                                            nextSelections[key] = true;
                                            needsStateUpdate = true;
                                          }
                                        });
                                        if (needsStateUpdate) {
                                          setTimeout(() => {
                                            setSelectedAgendaRecsExport(prev => {
                                              const updated = { ...prev };
                                              recsToExport.forEach(item => {
                                                const key = `${evt.id}-${item.id}`;
                                                if (updated[key] === undefined) updated[key] = true;
                                              });
                                              return updated;
                                            });
                                          }, 50);
                                        }

                                        const handleConfirmExportFinal = async () => {
                                          const selectedIds = recsToExport
                                            .filter(item => !!selectedAgendaRecsExport[`${evt.id}-${item.id}`])
                                            .map(item => item.id);

                                          const count = await exportRecommendationsToLocalStorage(evt, selectedIds);
                                          updateEventWorkflow(evt.id, { exportedRecommendationsToPage: true });

                                          showGlobalToast("جاري إنشاء ملفات الفعالية والتوصيات في جوجل درايف...", "loading", 0);
                                          const selectedRecs = recsToExport.filter(item => !!selectedAgendaRecsExport[`${evt.id}-${item.id}`]).map((rec, index) => {
                                            const agendaIdx = (evt.agenda || []).findIndex(a => a.id === rec.id);
                                            const displayNum = agendaIdx !== -1 ? agendaIdx + 1 : index + 1;
                                            return { ...rec, title: `توصية البند ${getArabicOrdinalGlobal(displayNum)} "${rec.title}"` };
                                          });
                                          const success = await autoCreateEventDriveFolders(evt, []); // Create only event folders, recommendation folders are created in Recommendations page
                                          if (success) showGlobalToast("تم المزامنة بنجاح مع درايف", "success");
                                          else showGlobalToast("تم الترحيل محلياً ولكن حدث خطأ في مزامنة درايف", "error");
                                        };
                                        
                                        return (
                                          <div className="space-y-4 text-right font-sans">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                              <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-brand" />
                                                سجل ترحيل التوصيات التلقائي المتقدم والموازنة
                                              </h3>
                                              <span className="text-[9px] text-gray-500 font-bold">مرحلة 7 من 8</span>
                                            </div>

                                            {!evt.minutesSaved ? (
                                              <div className="text-center p-3 sm:p-4 md:p-6 border border-orange-250 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold">
                                                ⚠ يرجى حفظ وتثبيت وقائع المحضر بالكامل أولاً في (الخطوة 5).
                                              </div>
                                            ) : (
                                              <div className="space-y-3">
                                                
                                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800">
                                                  <p className="text-[10px] font-black flex items-center gap-2 font-bold">
                                                    <CheckCircle className="w-4 h-4 shrink-0 rounded-full text-emerald-600" />
                                                    تم تأكيد جاهزية التوصيات المستخرجة تلقائياً من محضر الاجتماع. يمكنك اختيار بنود محددة للترحيل.
                                                  </p>
                                                </div>

                                                {/* Comparison History Panel */}
                                                {existingMeetingRecs.length > 0 && (
                                                  <div className="border border-slate-200 rounded-lg bg-slate-50 p-2.5 space-y-2">
                                                    <div className="flex items-center gap-1.5 pb-1 border-b border-gray-200">
                                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                      <span className="text-[10px] font-black text-slate-700">التوصيات المرحلة سابقاً في قاعدة البيانات لهذة الفعالية ({existingMeetingRecs.length})</span>
                                                    </div>
                                                    <div className="space-y-1 text-[9px]">
                                                      {existingMeetingRecs.map((dbRec) => (
                                                        <div key={dbRec.id} className="p-2 bg-white rounded border border-gray-150 flex items-center justify-between gap-2.5 sm:gap-3 md:gap-4 font-bold text-gray-600">
                                                          <div className="flex flex-col">
                                                            <span className="text-slate-800">توصية محفوظة: {dbRec.description}</span>
                                                            <span className="text-[8px] text-slate-400">المكلف: {dbRec.assignedTo} | المدة: {dbRec.duration}</span>
                                                          </div>
                                                          <span className="text-[7.5px] bg-slate-100 text-slate-500 px-1 rounded shrink-0">سارية بالنظام</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white shadow-sm">
                                                  <div className="p-2.5 bg-slate-100 border-b border-gray-200 flex items-center justify-between font-bold text-[10px]">
                                                    <span className="text-slate-800 font-black">سجل التوصيات النشطة للفعالية (تحديد ومزامنة)</span>
                                                    <span className="bg-slate-900 text-white font-black px-1.5 py-0.5 rounded text-[8.5px]">
                                                      عدد التوصيات الكلية بالمحضر: {recsToExport.length}
                                                    </span>
                                                  </div>
                                                  
                                                  {recsToExport.length === 0 ? (
                                                    <div className="p-3 sm:p-4 md:p-6 text-center space-y-4">
                                                      <div className="text-gray-500 text-[10px] font-bold">
                                                        لم يتم تدوين أي توصيات في بنود المحضر لهذا الاجتماع. هل ترغب في إقفال المحضر واعتماده مباشرة بدون توصيات لإنهاء الفعالية بالكامل وتحويل الحالة إلى مكتمل؟
                                                      </div>
                                                      <div className="pt-2 flex justify-center">
                                                        {evt.exportedRecommendationsToPage ? (
                                                          <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[10.5px] font-black rounded-lg flex items-center justify-between gap-2 font-bold w-full">
                                                            <span className="flex items-center gap-2">
                                                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                              تم إقفال واعتماد المحضر بدون توصيات بنجاح! الفعالية مكتملة الآن.
                                                            </span>
                                                          </div>
                                                        ) : (
                                                          <button
                                                            type="button"
                                                            onClick={async () => {
                                                              updateEventWorkflow(evt.id, { exportedRecommendationsToPage: true });
                                                              showGlobalToast("جاري إنشاء ملفات الفعالية في جوجل درايف...", "loading", 0);
                                                              const success = await autoCreateEventDriveFolders(evt, []);
                                                              if (success) showGlobalToast("تم إنشاء ملف الفعالية بنجاح في درايف", "success");
                                                              else showGlobalToast("حدث خطأ أثناء مزامنة درايف", "error");
                                                            }}
                                                            className="px-3 sm:px-4 md:px-5 py-2.5 bg-slate-900 border-transparent hover:bg-slate-800 text-white font-black rounded-lg text-[10.5px] flex items-center gap-2 cursor-pointer transition-all shadow-md"
                                                          >
                                                            <Lock className="w-4 h-4 text-brand shadow animate-pulse" />
                                                            إقفال المحضر واعتماده مباشرة بدون توصيات
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <div className="divide-y text-[10px] text-slate-800 font-sans border-t">
                                                      {recsToExport.map((rec, index) => {
                                                        const isSelected = !!selectedAgendaRecsExport[`${evt.id}-${rec.id}`];
                                                        const matchingDbRec = existingMeetingRecs.find(dbRec => dbRec.id === `custom-rec-${evt.id}-${rec.id}`);
                                                        const isIdExistInDb = !!matchingDbRec;
                                                        const hasDifference = matchingDbRec ? matchingDbRec.description !== rec.recommendation : false;

                                                        return (
                                                          <div key={rec.id || `rec-${index}`} className={`p-3 transition-colors ${isSelected ? "bg-white" : "bg-gray-50/50 opacity-60"} flex items-start gap-3`}>
                                                            <input 
                                                              type="checkbox"
                                                              checked={isSelected}
                                                              onChange={(e) => setSelectedAgendaRecsExport(prev => ({
                                                                ...prev,
                                                                [`${evt.id}-${rec.id}`]: e.target.checked
                                                              }))}
                                                              className="w-4.5 h-4.5 rounded border-gray-300 text-brand focus:ring-brand mt-0.5 cursor-pointer shrink-0"
                                                            />
                                                            <div className="flex-1 flex flex-col gap-1.5 leading-snug">
                                                              <div className="flex items-start justify-between gap-2.5 sm:gap-3 md:gap-4">
                                                                <span className="font-extrabold text-slate-950">توصية البند {getArabicOrdinalGlobal((evt.agenda || []).findIndex(a => a.id === rec.id) !== -1 ? (evt.agenda || []).findIndex(a => a.id === rec.id) + 1 : index + 1)} "{rec.title}"</span>
                                                                
                                                                {/* Status badges */}
                                                                {!isIdExistInDb ? (
                                                                  <span className="text-[7.5px] bg-blue-50 text-blue-600 border border-blue-200 font-black px-1.5 py-0.5 rounded shrink-0">جديدة كلياً</span>
                                                                ) : hasDifference ? (
                                                                  <span className="text-[7.5px] bg-amber-50 text-amber-700 border border-amber-200 font-black px-1.5 py-0.5 rounded shrink-0">تعديل مقترح (معدلة)</span>
                                                                ) : (
                                                                  <span className="text-[7.5px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-black px-1.5 py-0.5 rounded shrink-0">مرحلة ومطابقة</span>
                                                                )}
                                                              </div>
                                                              <div className="flex items-center gap-3 text-gray-500 font-bold text-[8.5px]">
                                                                <span>المكلف: {rec.assignee || "غير محدد"}</span>
                                                                <span>|</span>
                                                                <span>مدة أو تاريخ التنفيذ: {rec.durationRec || "غير محدد"}</span>
                                                              </div>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>

                                                {recsToExport.length > 0 && (
                                                  <div className="pt-2 flex justify-end">
                                                    {evt.exportedRecommendationsToPage ? (
                                                      <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[10.5px] font-black rounded-lg flex items-center justify-between gap-2 font-bold w-full">
                                                        <span className="flex items-center gap-2">
                                                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                          تم ترحيل وتأكيد مزامنة التوصيات المختارة بنجاح بصفحة اللجان والتوصيات!
                                                        </span>
                                                        <button
                                                          type="button"
                                                          onClick={handleConfirmExportFinal}
                                                          className="px-2.5 py-1 text-[8.5px] bg-white border border-emerald-300 text-emerald-700 hover:bg-slate-50 rounded transition-colors font-black cursor-pointer shadow-sm"
                                                        >
                                                          تحديث المزامنة الحالية
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <button
                                                        type="button"
                                                        onClick={handleConfirmExportFinal}
                                                        className="px-3 sm:px-4 md:px-5 py-2.5 bg-slate-900 border-transparent hover:bg-slate-800 text-white font-black rounded-lg text-[10.5px] flex items-center gap-2 cursor-pointer transition-all shadow-md"
                                                      >
                                                        <Sparkles className="w-4 h-4 text-brand shadow animate-pulse" />
                                                        تأكيد وإتمام ترحيل التوصيات المقترحة لصفحة التوصيات الرسمية
                                                      </button>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                                                            case 7: { // Step 8: Attachments and Evidences
                                        return <Step8Attachments evt={evt} updateEventWorkflow={updateEventWorkflow} />;
                                      }

                                      default: return null;
                                    }
                                  })()}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        
      {/* Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base md:text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                تأكيد مزامنة التقويم
              </h3>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
            
            <div className="p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">اللجان المشمولة بالمزامنة (حسب صلاحياتك):</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(eventsToSync.map(e => e.committeeName))).map((cName: any) => (
                        <span key={cName} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">{cName || 'عام'}</span>
                    ))}
                    {eventsToSync.length === 0 && (
                      <span className="text-xs text-gray-500">لا يوجد لجان مطابقة</span>
                    )}
                  </div>
              </div>
              
              <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-800 text-sm">الفعاليات التي سيتم مزامنتها ({eventsToSync.length}):</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-gray-600">تحديد الكل</span>
                      <input 
                        type="checkbox" 
                        checked={selectedEventsToSync.length === eventsToSync.length && eventsToSync.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEventsToSync(eventsToSync.map(ev => ev.id));
                          else setSelectedEventsToSync([]);
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    {eventsToSync.map(evt => (
                        <label key={evt.id} className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 rounded-xl flex justify-between items-center cursor-pointer">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={selectedEventsToSync.includes(evt.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedEventsToSync([...selectedEventsToSync, evt.id]);
                                else setSelectedEventsToSync(selectedEventsToSync.filter(id => id !== evt.id));
                              }}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-800">{evt.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{evt.date} | {evt.time}</p>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {evt.type}
                          </div>
                        </label>
                    ))}
                    {eventsToSync.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">لا توجد فعاليات ضمن صلاحياتك لمزامنتها.</p>
                    )}
                  </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex gap-3 justify-end">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="px-3 sm:px-4 md:px-5 py-2.5 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmManualSync}
                disabled={isSyncing || selectedEventsToSync.length === 0}
                className="px-3 sm:px-4 md:px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>تأكيد المزامنة ({selectedEventsToSync.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
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
              className="bg-white rounded-xl sm:rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#e8e4e4] p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {editingEvent ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {editingEvent ? `تعديل فعالية: ${editingEvent.title}` : "إضافة فعالية جديدة"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">سجل بيانات الفعالية بدقة لربط وتحديث مؤشرات الأداء والمهام</p>
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

              <div className="overflow-y-auto p-3 sm:p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                
                <AnimatePresence>
                  {conflictWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-right flex flex-col gap-3"
                      dir="rtl"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span>تنبيه: تعارض في الجدول</span>
                      </div>
                      <p className="text-sm font-medium">{conflictWarning.message}</p>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const confEvt = events.find(e => e.id === conflictWarning.conflictingEventId);
                            if (confEvt) {
                               setConflictWarning(null);
                               setIsConfirmingSeries(false);
                               handleOpenEdit(confEvt);
                            }
                          }}
                          className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-black hover:bg-red-200 transition-colors"
                        >
                          تعديل الفعالية المتعارضة
                        </button>
                        <button
                          type="button"
                          onClick={() => setConflictWarning(null)}
                          className="px-4 py-1.5 bg-white text-gray-600 rounded-lg text-xs font-black hover:bg-gray-50 border border-gray-200 transition-colors"
                        >
                          تجاهل ورجوع
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isConfirmingSeries ? (
                  <div className="space-y-4 text-right" dir="rtl">
                    <h4 className="text-sm font-black text-gray-800 border-b border-gray-200 pb-2">
                      استعراض وإقرار جدول الفعاليات المتسلسلة ({generatedSchedules.length})
                    </h4>
                    
                    {generatedSchedules.length === 0 ? (
                      <div className="text-center p-4 sm:p-6 md:p-8 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-bold text-gray-500">لا توجد فعاليات مطابقة ضمن النطاق الزمني المحدد.</p>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50/50">
                        <table className="w-full text-xs font-semibold text-gray-700 text-right">
                          <thead className="bg-[#dfdada] border-b border-gray-300">
                            <tr>
                              <th className="whitespace-nowrap px-4 py-2 text-center w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedSchedules.length === generatedSchedules.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSchedules(generatedSchedules.map(g => g.id));
                                    } else {
                                      setSelectedSchedules([]);
                                    }
                                  }}
                                  className="rounded text-brand"
                                />
                              </th>
                              <th className="whitespace-nowrap px-4 py-2 font-black">التاريخ</th>
                              <th className="whitespace-nowrap px-4 py-2 font-black">الوقت</th>
                              <th className="whitespace-nowrap px-4 py-2 font-black">عنوان السجل</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {generatedSchedules.map((gen) => (
                              <tr key={gen.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="whitespace-nowrap px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedSchedules.includes(gen.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedSchedules([...selectedSchedules, gen.id]);
                                      else setSelectedSchedules(selectedSchedules.filter(id => id !== gen.id));
                                    }}
                                    className="rounded text-brand"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 font-mono" dir="ltr">{gen.date}</td>
                                <td className="whitespace-nowrap px-4 py-2">{gen.time || "-"}</td>
                                <td className="whitespace-nowrap px-4 py-2">{gen.title}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end flex-row-reverse gap-3">
                      <button
                        type="button"
                        onClick={handleInsertSeries}
                        disabled={selectedSchedules.length === 0}
                        className="px-3 sm:px-4 md:px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 disabled:opacity-50"
                      >
                        إدراج ({selectedSchedules.length}) سجل
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingSeries(false)}
                        className="px-3 sm:px-4 md:px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                      >
                        تراجع للتعديل
                      </button>
                    </div>
                  </div>
                ) : (
                  
<div key="filter-popover-1784704070964-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 text-right mb-6" dir="rtl">
                      <div className="md:col-span-full flex justify-end">
                        <div className="bg-gray-100 p-1 rounded-xl flex shadow-inner">
                          <button
                            type="button"
                            onClick={() => setNewType("مفردة")}
                            className={`px-3 sm:px-4 md:px-6 py-2 rounded-lg font-black text-xs transition-all ${
                              newType === "مفردة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            فعالية مفردة
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewType("متسلسلة")}
                            className={`px-3 sm:px-4 md:px-6 py-2 rounded-lg font-black text-xs transition-all ${
                              newType === "متسلسلة" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            فعالية متسلسلة
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 text-right" dir="rtl">
                      
                      {newType === "مفردة" && (
                        
<div key="filter-popover-1784704070964-9" className="contents">
                          {/* Row 1 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">الإدارة *</label>
                            <select
                              value={newCommitteeId}
                              onChange={(e) => {
                                const val = e.target.value;
                                setIsTitleManuallyEdited(false);
                                setNewCommitteeId(val);
                                setNewMembers([]);
                                const matched = committees.find(c => String(c.id) === String(val));
                                if (matched && matched.specialist) {
                                  setSingleEmployee(matched.specialist);
                                  setSeriesAssignedEmployee(matched.specialist);
                                }
                              }}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value={0} disabled>اختر الإدارة</option>
                              {committees.filter(c => canUserEditCommittee(c.name)).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">النوع *</label>
                            <select
                              value={singleKind}
                              onChange={(e) => {
                                const newK = e.target.value;
                                setSingleKind(newK);
                                if (newK !== "اجتماع") {
                                  setSingleClassification("");
                                }
                                setIsTitleManuallyEdited(false);
                              }}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="" disabled>اختر نوع الفعالية</option>
                              {EVENT_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التصنيف *</label>
                            <select
                              value={singleClassification}
                              onChange={(e) => {
                                const newC = e.target.value;
                                setSingleClassification(newC);
                                setIsTitleManuallyEdited(false);
                              }}
                              disabled={singleKind !== "اجتماع"}
                              className={`w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand ${singleKind !== "اجتماع" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <option value="">اختر نوع التصنيف</option>
                              {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>

                          {/* Row 2 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">رقم الفعالية *</label>
                            <input
                              type="text"
                              value={singleEventNumber}
                              onChange={(e) => {
                                setSingleEventNumber(e.target.value);
                                setIsSeqManuallyEdited(true);
                              }}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="مثال: الأول، الثاني..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">الوقت *</label>
                            <input
                              type="time"
                              required
                              value={singleTime}
                              onChange={(e) => setSingleTime(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التاريخ *</label>
                            <input
                              type="date"
                              required
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                            {isWeekend(newDate) && <p className="text-red-500 text-[10px] font-bold mt-1">تنبيه: هذا التاريخ يوافق إجازة نهاية الأسبوع</p>}
                          </div>

                          {/* Row 3 */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[11px] font-black text-gray-500 block">الموظف المختص *</label>
                            <select
                              value={singleEmployee}
                              onChange={(e) => setSingleEmployee(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              {dynamicEmployees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[11px] font-black text-gray-500 block">القاعة *</label>
                            <select
                              value={singleRoom}
                              onChange={(e) => setSingleRoom(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="" disabled>اختر قاعة...</option>
                              {ROOMS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                            </select>
                          </div>
                                                    {/* Additional Invitees Single */}
                          <div className="md:col-span-full border-t border-gray-200 mt-2 pt-4 space-y-4">
                            <h4 className="text-xs font-bold text-gray-800">إدارة الدعوات</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                              {/* Internal Invitees */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات داخلية (إدارية)</label>
                                <div 
                                  onClick={() => setIsSingleInviteesOpen(!isSingleInviteesOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {singleAdditionalInvitees.length === 0 && <span className="text-gray-400">اختر موظفين...</span>}
                                  {singleAdditionalInvitees.map(name => (
                                    <span key={name} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {name}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setSingleAdditionalInvitees(prev => prev.filter(p => p !== name)); }} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSingleInviteesOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                      if (singleAdditionalInvitees.length === allEmployeesNames.length) {
                                        setSingleAdditionalInvitees([]);
                                      } else {
                                        setSingleAdditionalInvitees(allEmployeesNames);
                                      }
                                    }}>
                                      <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                      <input type="checkbox" checked={singleAdditionalInvitees.length === allEmployeesNames.length && allEmployeesNames.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                    </div>
                                    
                                    {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (
                                      <div key={group}>
                                        <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 border-y border-gray-200 sticky top-0 z-10">{group}</div>
                                        {emps.map((emp: any) => (
                                          <label key={emp.name} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                            <input type="checkbox" checked={singleAdditionalInvitees.includes(emp.name)} 
                                              onChange={(e) => {
                                                if (e.target.checked) setSingleAdditionalInvitees(prev => [...prev, emp.name]);
                                                else setSingleAdditionalInvitees(prev => prev.filter(p => p !== emp.name));
                                              }}
                                            className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                            <span className="text-xs font-semibold text-gray-800">{emp.name}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Committee Members */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات أعضاء اللجنة</label>
                                <div 
                                  onClick={() => setIsSingleMembersOpen(!isSingleMembersOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {newMembers.length === 0 && <span className="text-gray-400">اختر أعضاء...</span>}
                                  {newMembers.map(id => (
                                    <span key={id} className="px-2 py-0.5 bg-brand/10 text-brand rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {allMembers.find(m => m.id === id)?.name || id}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleMember(id); }} className="hover:text-brand-dark"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSingleMembersOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {committeeMembers.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة</div>}
                                    {committeeMembers.length > 0 && (
                                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                        if (newMembers.length === committeeMembers.length) {
                                          setNewMembers([]);
                                        } else {
                                          setNewMembers(committeeMembers.map((m: any) => m.id));
                                        }
                                      }}>
                                        <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                        <input type="checkbox" checked={newMembers.length === committeeMembers.length && committeeMembers.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                      </div>
                                    )}
                                    {committeeMembers.map((m: any) => (
                                      <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-brand/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                        <input type="checkbox" checked={newMembers.includes(m.id)} 
                                          onChange={() => toggleMember(m.id)}
                                        className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                        <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* External */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات خارجية (أشخاص / إيميلات)</label>
                                <input 
                                  type="text" 
                                  value={externalInput}
                                  onChange={(e) => setExternalInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && externalInput.trim()) {
                                      e.preventDefault();
                                      if (!singleExternalInvitees.includes(externalInput.trim())) {
                                        setSingleExternalInvitees(prev => [...prev, externalInput.trim()]);
                                      }
                                      setExternalInput("");
                                    }
                                  }}
                                  placeholder="اكتب واضغط Enter..."
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                                />
                                {singleExternalInvitees.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {singleExternalInvitees.map(ext => (
                                      <span key={ext} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold flex items-center gap-1">
                                        {ext} <button type="button" onClick={() => setSingleExternalInvitees(prev => prev.filter(p => p !== ext))} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 4 */}
                          <div className="md:col-span-full space-y-1 border-t border-gray-200 mt-2 pt-4">
                            <label className="text-[11px] font-black text-gray-500 block">عنوان الفعالية</label>
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => {
                                setNewTitle(e.target.value);
                                setIsTitleManuallyEdited(true);
                              }}
                              className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              placeholder="أدخل عنوان الفعالية أو قم بتعديله يدوياً..."
                            />
                          </div>
                        </div>
                      )}

                      {newType === "متسلسلة" && (
                        
<div key="filter-popover-1784704070964-10" className="contents">
                          {/* Row 1 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">النوع *</label>
                            <select
                              value={seriesKind}
                              onChange={(e) => {
                                setSeriesKind(e.target.value);
                                if (e.target.value !== "اجتماع") {
                                  setSeriesClassification("");
                                }
                              }}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="" disabled>اختر نوع الفعالية</option>
                              {EVENT_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">التصنيف *</label>
                            <select
                              value={seriesClassification}
                              onChange={(e) => setSeriesClassification(e.target.value)}
                              disabled={seriesKind !== "اجتماع"}
                              className={`w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand ${seriesKind !== "اجتماع" ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <option value="">اختر نوع التصنيف</option>
                              {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">اللجنة</label>
                            <select
                              value={newCommitteeId}
                              onChange={(e) => {
                                const val = e.target.value;
                                setIsTitleManuallyEdited(false);
                                setNewCommitteeId(val);
                                setNewMembers([]); // Reset members when committee changes
                                const matched = committees.find(c => String(c.id) === String(val));
                                if (matched && matched.specialist) {
                                  setSingleEmployee(matched.specialist);
                                  setSeriesAssignedEmployee(matched.specialist);
                                } else {
                                  setSeriesAssignedEmployee(dynamicEmployees[(val - 1) % dynamicEmployees.length] || dynamicEmployees[0] );
                                }
                              }}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value={0} disabled>اختر الإدارة</option>
                              {committees.filter(c => canUserEditCommittee(c.name)).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Row 2 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">الموظف المعني</label>
                            <select
                              value={seriesAssignedEmployee}
                              onChange={(e) => setSeriesAssignedEmployee(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              <option value="">تحديد الموظف...</option>
                              {dynamicEmployees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
                          </div>
                                                    {/* Additional Invitees Series */}
                          <div className="md:col-span-full border-t border-gray-200 mt-2 pt-4 space-y-4">
                            <h4 className="text-xs font-bold text-gray-800">إدارة الدعوات</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                              {/* Internal Invitees */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات داخلية (إدارية)</label>
                                <div 
                                  onClick={() => setIsSeriesInviteesOpen(!isSeriesInviteesOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {seriesAdditionalInvitees.length === 0 && <span className="text-gray-400">اختر موظفين...</span>}
                                  {seriesAdditionalInvitees.map(name => (
                                    <span key={name} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {name}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); setSeriesAdditionalInvitees(prev => prev.filter(p => p !== name)); }} className="hover:text-blue-900"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSeriesInviteesOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                      if (seriesAdditionalInvitees.length === allEmployeesNames.length) {
                                        setSeriesAdditionalInvitees([]);
                                      } else {
                                        setSeriesAdditionalInvitees(allEmployeesNames);
                                      }
                                    }}>
                                      <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                      <input type="checkbox" checked={seriesAdditionalInvitees.length === allEmployeesNames.length && allEmployeesNames.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                    </div>
                                    {Object.entries(allGroupedEmployees).map(([group, emps]: [string, any]) => (
                                      <div key={group}>
                                        <div className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 border-y border-gray-200 sticky top-0 z-10">{group}</div>
                                        {emps.map((emp: any) => (
                                          <label key={emp.name} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                            <input type="checkbox" checked={seriesAdditionalInvitees.includes(emp.name)} 
                                              onChange={(e) => {
                                                if (e.target.checked) setSeriesAdditionalInvitees(prev => [...prev, emp.name]);
                                                else setSeriesAdditionalInvitees(prev => prev.filter(p => p !== emp.name));
                                              }}
                                            className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                            <span className="text-xs font-semibold text-gray-800">{emp.name}</span>
                                          </label>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Committee Members */}
                              <div className="space-y-1 relative">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات أعضاء اللجنة</label>
                                <div 
                                  onClick={() => setIsSeriesMembersOpen(!isSeriesMembersOpen)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold cursor-pointer min-h-[44px] flex flex-wrap gap-1 items-center relative"
                                >
                                  {newMembers.length === 0 && <span className="text-gray-400">اختر أعضاء...</span>}
                                  {newMembers.map(id => (
                                    <span key={id} className="px-2 py-0.5 bg-brand/10 text-brand rounded-md text-xs font-bold flex items-center gap-1 z-10">
                                      {allMembers.find(m => m.id === id)?.name || id}
                                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleMember(id); }} className="hover:text-brand-dark"><X className="w-3 h-3"/></button>
                                    </span>
                                  ))}
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                {isSeriesMembersOpen && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
                                    {committeeMembers.length === 0 && <div className="p-3 text-xs text-gray-500 text-center">لا يوجد أعضاء مرتبطين بهذه اللجنة</div>}
                                    {committeeMembers.length > 0 && (
                                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-20 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => {
                                        if (newMembers.length === committeeMembers.length) {
                                          setNewMembers([]);
                                        } else {
                                          setNewMembers(committeeMembers.map((m: any) => m.id));
                                        }
                                      }}>
                                        <span className="text-[11px] font-bold text-gray-700">تحديد الكل</span>
                                        <input type="checkbox" checked={newMembers.length === committeeMembers.length && committeeMembers.length > 0} readOnly className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand pointer-events-none" />
                                      </div>
                                    )}
                                    {committeeMembers.map((m: any) => (
                                      <label key={m.id} className="flex items-center gap-2 px-3 py-2 hover:bg-brand/5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                                        <input type="checkbox" checked={newMembers.includes(m.id)} 
                                          onChange={() => toggleMember(m.id)}
                                        className="w-4 h-4 text-brand rounded border-gray-300 focus:ring-brand"/>
                                        <span className="text-xs font-semibold text-gray-800">{m.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* External */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-black text-gray-500 block">دعوات خارجية (أشخاص / إيميلات)</label>
                                <input 
                                  type="text" 
                                  value={seriesExternalInput}
                                  onChange={(e) => setSeriesExternalInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && seriesExternalInput.trim()) {
                                      e.preventDefault();
                                      if (!seriesExternalInvitees.includes(seriesExternalInput.trim())) {
                                        setSeriesExternalInvitees(prev => [...prev, seriesExternalInput.trim()]);
                                      }
                                      setSeriesExternalInput("");
                                    }
                                  }}
                                  placeholder="اكتب واضغط Enter..."
                                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                                />
                                {seriesExternalInvitees.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {seriesExternalInvitees.map(ext => (
                                      <span key={ext} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold flex items-center gap-1">
                                        {ext} <button type="button" onClick={() => setSeriesExternalInvitees(prev => prev.filter(p => p !== ext))} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                            <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">يوم الانعقاد *</label>
                            <select
                              value={seriesDayOfWeek}
                              onChange={(e) => setSeriesDayOfWeek(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">أسبوع الانعقاد *</label>
                            <select
                              value={seriesWeekOfMonth}
                              onChange={(e) => setSeriesWeekOfMonth(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                              {Object.keys(WEEKSMap).map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                          </div>

                          {/* Row 3 */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">تاريخ البداية *</label>
                            <input
                              type="date"
                              required
                              value={seriesStartDate}
                              onChange={(e) => setSeriesStartDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                            {isWeekend(seriesStartDate) && <p className="text-red-500 text-[10px] font-bold mt-1">تنبيه: هذا التاريخ يوافق إجازة نهاية الأسبوع</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">تاريخ النهاية *</label>
                            <input
                              type="date"
                              required
                              value={seriesEndDate}
                              onChange={(e) => setSeriesEndDate(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                            {isWeekend(seriesEndDate) && <p className="text-red-500 text-[10px] font-bold mt-1">تنبيه: هذا التاريخ يوافق إجازة نهاية الأسبوع</p>}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-500 block">الوقت</label>
                            <input
                              type="time"
                              value={seriesTime}
                              onChange={(e) => setSeriesTime(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                            />
                          </div>

                          {/* Row 4 */}
                          <div className="md:col-span-3 space-y-2 mt-2">
                            <label className="text-[11px] font-black text-gray-500 block">القاعة</label>
                            <div className="flex gap-2">
                              <select 
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"
                              >
                                <option value="" disabled>اختر قاعة...</option>
                                {ROOMS.map(rm => <option key={rm} value={rm}>{rm}</option>)}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedRoom && !seriesRooms.includes(selectedRoom)) {
                                     setSeriesRooms([...seriesRooms, selectedRoom]);
                                  }
                                  setSelectedRoom(""); // Reset after adding
                                }}
                                className="w-11 h-11 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-brand/90 transition-colors shadow-sm shrink-0"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                            {seriesRooms.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {seriesRooms.map(rm => (
                                  <span key={rm} className="px-3 py-1.5 text-xs font-black rounded-lg border bg-[#4ea0b0]/10 text-[#4ea0b0] border-[#4ea0b0]/30 shadow-sm flex items-center gap-2">
                                    {rm}
                                    <button
                                      type="button"
                                      onClick={() => setSeriesRooms(seriesRooms.filter(r => r !== rm))}
                                      className="text-[#4ea0b0] hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      

                  <div className="md:col-span-full space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">ملاحظات / تفاصيل</label>
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand resize-none"
                    ></textarea>
                  </div>

                </div>

                <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="px-3 sm:px-4 md:px-6 py-2.5 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20 active:scale-95"
                  >
                    {newType === "متسلسلة" ? "استعراض الجدول" : (editingEvent ? "حفظ التعديلات" : "إضافة الفعالية")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-3 sm:px-4 md:px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBulkDeleting && (
           <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => setIsBulkDeleting(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-xl sm:rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 w-full max-w-sm relative z-10 text-center border border-gray-100"
             >
               <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8" />
               </div>
               <h3 className="text-base sm:text-lg md:text-xl font-black text-gray-900 mb-2">تأكيد الحذف</h3>
               <p className="text-sm font-bold text-gray-500 mb-6">
                 هل أنت متأكد من حذف {selectedEventIds.length} فعالية؟
               </p>
               <div className="flex gap-3">
                 <button
                   onClick={handleBulkDelete}
                   disabled={isBulkDeletingLoading}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center"
                 >
                   {isBulkDeletingLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                      "نعم، احذف"
                   )}
                 </button>
                 <button
                   onClick={() => setIsBulkDeleting(false)}
                   className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-bold text-sm hover:bg-gray-200 transition-colors"
                 >
                   إلغاء
                 </button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingEvent && (
           <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => setDeletingEvent(null)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-xl sm:rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 w-full max-w-sm relative z-10 text-center border border-gray-100"
             >
               <div className="w-10 h-10 sm:w-12 sm:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8" />
               </div>
               <h3 className="text-base sm:text-lg md:text-xl font-black text-gray-900 mb-2">تأكيد الحذف</h3>
               <p className="text-sm font-bold text-gray-500 mb-6">
                 هل أنت متأكد من حذف الفعالية "{deletingEvent.title}"؟ 
               </p>
               <div className="flex gap-3">
                 <button
                   onClick={handleDelete}
                   className="flex-1 bg-rose-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                 >
                   نعم، احذف
                 </button>
                 <button
                   onClick={() => setDeletingEvent(null)}
                   className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 font-bold text-sm hover:bg-gray-200 transition-colors"
                 >
                   تراجع
                 </button>
               </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
