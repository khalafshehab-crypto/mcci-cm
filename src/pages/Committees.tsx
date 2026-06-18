import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users2, 
  Search, 
  Plus, 
  X, 
  Users, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Trash2,
  Check,
  LayoutGrid,
  List,
  Settings,
  AlertTriangle,
  Upload,
  UserCheck,
  Edit2,
  FileSpreadsheet,
  Download
} from "lucide-react";


interface Committee {
  id: number;
  name: string;
  membersCount: number;
  meetingsCount: number;
  active: boolean;
  desc: string;
  specialist?: string;
  formationLetter?: string;
  president?: string;
  recommendationsCount?: number;
  eventsCount?: number;
  ratingIssues?: string;
  strategicPlan?: string;
}

const EMPLOYEES = [
  "شهاب الدين",
  ];

import { useFirestoreCollection } from '../lib/firebaseUtils';

export default function Committees() {
  const { data: dbCommittees, updateDocument: updateFirebaseComm, deleteDocument: deleteFirebaseComm } = useFirestoreCollection<Committee>("committees", []);
  const { data: dbMembers } = useFirestoreCollection<any>("members", []);
  const { data: dbEvents } = useFirestoreCollection<any>("events", []);
  const { data: dbRecs } = useFirestoreCollection<any>("recommendations", []);
  
  const setCommittees = (action: React.SetStateAction<Committee[]>) => {
    let nextItems = typeof action === 'function' ? action(dbCommittees) : action;
    dbCommittees.forEach(existing => {
       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseComm(String(existing.id));
       }
    });
    nextItems.forEach(nextI => {
       const existing = dbCommittees.find(e => e.id === nextI.id);
       if (!existing) {
          updateFirebaseComm(String(nextI.id), nextI);
       } else if (JSON.stringify(existing) !== JSON.stringify(nextI)) {
          updateFirebaseComm(String(nextI.id), nextI);
       }
    });
  };

  const committees = dbCommittees;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMtgError, setNewMtgError] = useState("");

  // Dynamic employees fetched from Org Chart database
  const [dynamicEmployees, setDynamicEmployees] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("app_employees");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: any) => e.name).filter(Boolean);
        }
      }
    } catch (e) {}
    return EMPLOYEES;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("app_employees");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDynamicEmployees(parsed.map((e: any) => e.name).filter(Boolean));
          
          // Sync committees' specialists based on employee assignments
          setCommittees(prev => {
            return prev.map(comm => {
              const matchedEmp = parsed.find((emp: any) => 
                emp && emp.active && emp.committees && emp.committees.includes(comm.name)
              );
              if (matchedEmp) {
                return { ...comm, specialist: matchedEmp.name };
              }
              return comm;
            });
          });
        }
      }
    } catch (e) {}
  }, []);

  // Form Fields for Add / Edit
  const [name, setName] = useState("");
  const [membersCount, setMembersCount] = useState(10);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [desc, setDesc] = useState("");
  const [specialist, setSpecialist] = useState("غير محدد");
  const [isActive, setIsActive] = useState(true);
  const [formationLetter, setFormationLetter] = useState("");
  
  // New Form Fields for Robust Committee Cards
  const [president, setPresident] = useState("");
  const [recommendationsCount, setRecommendationsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [ratingIssues, setRatingIssues] = useState("");
  const [strategicPlan, setStrategicPlan] = useState("");

  // Editing state
  const [editingComm, setEditingComm] = useState<Committee | null>(null);
  const [editReason, setEditReason] = useState("");

  // Deletion process states
  const [deletingComm, setDeletingComm] = useState<Committee | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  // Active Gear action menu state for dropdowns
  const [activeGearMenuId, setActiveGearMenuId] = useState<number | null>(null);

  // Details Modal State
  const [detailsComm, setDetailsComm] = useState<Committee | null>(null);

  // Google Sheets Export States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([
    "alphabetical", "president", "membersCount", "specialist", "meetingsCount", "recommendationsCount", "eventsCount", "strategicPlan", "status", "desc"
  ]);

  const toggleExportField = (key: string) => {
    setSelectedExportFields(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const EXPORT_FIELDS_META = [
    { key: "alphabetical", label: "مسلسل اللجنة أبجدياً" },
    { key: "president", label: "رئيس اللجنة" },
    { key: "membersCount", label: "عدد الأعضاء" },
    { key: "specialist", label: "أخصائي اللجنة" },
    { key: "meetingsCount", label: "عدد الاجتماعات" },
    { key: "recommendationsCount", label: "التوصيات" },
    { key: "eventsCount", label: "الفعاليات والأعمال" },
    { key: "ratingIssues", label: "قضايا التقدير" },
    { key: "strategicPlan", label: "الخطة الاستراتيجية المعتمدة" },
    { key: "status", label: "حالة اللجنة" },
    { key: "notes", label: "ملاحظات إضافية" },
    { key: "desc", label: "وصف اللجنة" },
  ];

  const handleExportToGoogleSheets = () => {
    const sorted = [...committees].sort((a, b) => a.name.localeCompare(b.name, "ar"));
    const activeHeaders = EXPORT_FIELDS_META.filter(f => selectedExportFields.includes(f.key));
    const csvHeaders = activeHeaders.map(h => h.label).join(",");

    const csvRows = sorted.map((comm, index) => {
      return activeHeaders.map(h => {
        let val = "";
        if (h.key === "alphabetical") {
          val = String(index + 1);
        } else if (h.key === "president") {
          val = comm.president || "غير محدد";
        } else if (h.key === "membersCount") {
          val = String(comm.membersCount);
        } else if (h.key === "specialist") {
          val = comm.specialist || "غير محدد";
        } else if (h.key === "meetingsCount") {
          val = String(comm.meetingsCount);
        } else if (h.key === "recommendationsCount") {
          val = String(comm.recommendationsCount || 0);
        } else if (h.key === "eventsCount") {
          val = String(comm.eventsCount || 0);
        } else if (h.key === "ratingIssues") {
          val = comm.ratingIssues || "لا يوجد قضايا تقدير";
        } else if (h.key === "strategicPlan") {
          val = comm.strategicPlan || "غير مدرجة";
        } else if (h.key === "status") {
          val = comm.active ? "فعالة / نشطة" : "غير فعالة";
        } else if (h.key === "notes") {
          val = "بيانات لجان قطاعية مستخرجة آلياً";
        } else if (h.key === "desc") {
          val = comm.desc || "";
        }
        const escaped = `"${val.replace(/"/g, '""')}"`;
        return escaped;
      }).join(",");
    });

    const csvContent = "\uFEFF" + [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `تصدير_اللجان_جوجل_شيت_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      const stored = localStorage.getItem("current_user");
      let activeUser = "شهاب الدين";
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) activeUser = parsed.name;
        } catch(ex) {}
      }
      const logsRaw = localStorage.getItem("app_logs");
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.unshift({
        id: Date.now().toString(),
        user: activeUser,
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: "تصدير اللجان إلى Google Sheets",
        status: "ناجح"
      });
      localStorage.setItem("app_logs", JSON.stringify(logs));
    } catch(e){}

    setIsExportOpen(false);
  };

  // Live Auto-Synchronization of Committee Statistics from custom pages
  useEffect(() => {
    try {
      // 1. Get exact members
      let allMembers = dbMembers || [];
      
      // 2. Get exact events
      let allEvents = dbEvents || [];

      // 3. Get exact recommendations
      let allRecs = dbRecs ? [...dbRecs] : [];

      // Advanced Arabic term containment algorithm for names matching
      const advancedMatch = (commName: string, targetName: string) => {
        if (!commName || !targetName) return false;
        const clean = (s: string) => s.replace(/لجنة/g, "").replace(/الـ/g, "").replace(/ال/g, "").replace(/\s+/g, " ").trim();
        const c1 = clean(commName);
        const c2 = clean(targetName);
        if (c1.includes(c2) || c2.includes(c1)) return true;
        
        const w1 = c1.split(" ").filter(w => w.length >= 3);
        const w2 = c2.split(" ").filter(w => w.length >= 3);
        return w1.some(word => w2.some(other => other.includes(word) || word.includes(other)));
      };

      setCommittees(prev => {
        let hasChanges = false;
        const updated = prev.map(comm => {
          // Count total members belonging to committee
          const myMbrs = allMembers.filter((m: any) => m && m.committeeId === comm.id);
          const realMembersCount = myMbrs.length;

          // Count meetings & events purely from app_events, since this is raw production readiness
          const myEvts = allEvents.filter((e: any) => e && e.committeeId === comm.id);
          const realMeetingsCount = myEvts.filter((e: any) => e && e.title && e.title.includes("اجتماع")).length;
          const realEventsCount = myEvts.filter((e: any) => e && e.title && !e.title.includes("اجتماع")).length;

          // Count recommendations purely from recommendations database
          const myRecs = allRecs.filter((r: any) => r && advancedMatch(r.committeeName || r.dept, comm.name));
          const realRecommendationsCount = myRecs.length;

          if (
            realMembersCount !== comm.membersCount ||
            realMeetingsCount !== comm.meetingsCount ||
            realEventsCount !== comm.eventsCount ||
            realRecommendationsCount !== comm.recommendationsCount
          ) {
            hasChanges = true;
            return {
              ...comm,
              membersCount: realMembersCount,
              meetingsCount: realMeetingsCount,
              eventsCount: realEventsCount,
              recommendationsCount: realRecommendationsCount
            };
          }
          return comm;
        });

        if (hasChanges) {
          localStorage.setItem("app_committees", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    } catch (e) {
      console.error("Auto Sync of Committees failed:", e);
    }
  }, [dbMembers, dbEvents, dbRecs]);

  useEffect(() => {
    try {
      localStorage.setItem("app_committees", JSON.stringify(committees));
    } catch (e) {
      console.error("Failed to store committees:", e);
    }

    try {
      const savedEmps = localStorage.getItem("app_employees");
      if (savedEmps) {
        const emps = JSON.parse(savedEmps);
        if (Array.isArray(emps)) {
          const synced = emps.map((emp: any) => {
            if (!emp) return emp;
            // Get all active committees where this employee is designated as the specialist
            const assignedCommNames = committees
              .filter((c: any) => c && c.active !== false && c.specialist === emp.name)
              .map((c: any) => c.name);
            return { ...emp, committees: assignedCommNames };
          });
          localStorage.setItem("app_employees", JSON.stringify(synced));
        }
      }
    } catch (e) {
      console.error("Error syncing employees with committees:", e);
    }
  }, [committees]);

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

  const handleOpenAdd = () => {
    setName("");
    setMembersCount(10);
    setMeetingsCount(0);
    setDesc("");
    setSpecialist("غير محدد");
    setIsActive(true);
    setFormationLetter("");
    setPresident("");
    setRecommendationsCount(0);
    setEventsCount(0);
    setRatingIssues("");
    setStrategicPlan("");
    setEditingComm(null);
    setEditReason("");
    setNewMtgError("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (comm: Committee) => {
    setEditingComm(comm);
    setName(comm.name);
    setMembersCount(comm.membersCount);
    setMeetingsCount(comm.meetingsCount);
    setDesc(comm.desc);
    setSpecialist(comm.specialist || "غير محدد");
    setIsActive(comm.active);
    setFormationLetter(comm.formationLetter || "");
    setPresident(comm.president || "");
    setRecommendationsCount(comm.recommendationsCount || 0);
    setEventsCount(comm.eventsCount || 0);
    setRatingIssues(comm.ratingIssues || "");
    setStrategicPlan(comm.strategicPlan || "");
    setEditReason("");
    setNewMtgError("");
    setIsAddOpen(true);
    setActiveGearMenuId(null);
  };

  const handleOpenDelete = (comm: Committee) => {
    setDeletingComm(comm);
    setDeleteReason("");
    setIsDeletingStep(false);
    setActiveGearMenuId(null);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNewMtgError("يرجى إدخال اسم اللجنة بالكامل");
      return;
    }
    if (!desc.trim()) {
      setNewMtgError("يرجى إدخال وصف مبسط لأعمال اللجنة");
      return;
    }
    if (editingComm && !editReason.trim()) {
      setNewMtgError("يرجى توضيح سبب التعديل");
      return;
    }

    if (editingComm) {
      // Modify
      setCommittees(prev => prev.map(c => {
        if (c.id === editingComm.id) {
          return {
            ...c,
            name: name.trim(),
            membersCount: Number(membersCount) || 5,
            meetingsCount: Number(meetingsCount) || 0,
            active: isActive,
            desc: desc.trim(),
            specialist: specialist,
            formationLetter: formationLetter || c.formationLetter || "قرار_تشكيل_معدل.pdf",
            president: president.trim(),
            recommendationsCount: Number(recommendationsCount) || 0,
            eventsCount: Number(eventsCount) || 0,
            ratingIssues: ratingIssues.trim(),
            strategicPlan: strategicPlan.trim()
          };
        }
        return c;
      }));
    } else {
      // Add
      const newComm: Committee = {
        id: Date.now(),
        name: name.trim(),
        membersCount: Number(membersCount) || 5,
        meetingsCount: Number(meetingsCount) || 0,
        active: isActive,
        desc: desc.trim(),
        specialist: specialist,
        formationLetter: formationLetter || "غير مرفق.pdf",
        president: president.trim(),
        recommendationsCount: Number(recommendationsCount) || 0,
        eventsCount: Number(eventsCount) || 0,
        ratingIssues: ratingIssues.trim(),
        strategicPlan: strategicPlan.trim()
      };
      setCommittees([newComm, ...committees]);
    }

    // Reset inputs
    setName("");
    setMembersCount(10);
    setMeetingsCount(0);
    setDesc("");
    setSpecialist("غير محدد");
    setIsActive(true);
    setFormationLetter("");
    setPresident("");
    setRecommendationsCount(0);
    setEventsCount(0);
    setRatingIssues("");
    setStrategicPlan("");
    setEditingComm(null);
    setEditReason("");
    setNewMtgError("");
    setIsAddOpen(false);
  };

  // We can load and memoize all exact counts so we have 100% accurate dynamic statistics on Committees page too!
  const synchronizedCommittees = useMemo(() => {
    // 1. Get exact members
    let allMembers = dbMembers || [];

    // 2. Get exact events
    let allEvents = dbEvents || [];

    // 3. Get exact recommendations
    let allRecs = dbRecs ? [...dbRecs] : [];

    const advancedMatch = (commName: string, targetName: string) => {
      if (!commName || !targetName) return false;
      const clean = (s: string) => s.replace(/لجنة/g, "").replace(/الـ/g, "").replace(/ال/g, "").replace(/\s+/g, " ").trim();
      const c1 = clean(commName);
      const c2 = clean(targetName);
      if (c1.includes(c2) || c2.includes(c1)) return true;
      
      const w1 = c1.split(" ").filter(w => w.length >= 3);
      const w2 = c2.split(" ").filter(w => w.length >= 3);
      return w1.some(word => w2.some(other => other.includes(word) || word.includes(other)));
    };

    return committees.map(comm => {
      // Calculate dynamic members count
      const myMbrs = allMembers.filter((m: any) => m && m.committeeId === comm.id);
      const realMembersCount = myMbrs.length;

      // Calculate dynamic president from members
      const presMbr = myMbrs.find((m: any) => m.role === "رئيس" || m.role?.includes("رئيس"));
      const dynamicPresidentName = presMbr 
        ? `${presMbr.customTitle || presMbr.title || ''} ${presMbr.name}`.trim().replace(/\s+/g, " ")
        : (comm.president || "غير محدد");

      // Calculate dynamic meetings and events
      const myEvts = allEvents.filter((e: any) => e && e.committeeId === comm.id);
      const realMeetingsCount = myEvts.filter((e: any) => e && e.title && e.title.includes("اجتماع")).length;
      const realEventsCount = myEvts.filter((e: any) => e && e.title && !e.title.includes("اجتماع")).length;

      // Calculate dynamic recommendations
      const myRecs = allRecs.filter((r: any) => r && advancedMatch(r.committeeName || r.dept, comm.name));
      const realRecommendationsCount = myRecs.length;

      return {
        ...comm,
        president: dynamicPresidentName,
        membersCount: realMembersCount,
        meetingsCount: realMeetingsCount,
        eventsCount: realEventsCount,
        recommendationsCount: realRecommendationsCount
      };
    });
  }, [committees]);

  const filteredCommittees = synchronizedCommittees.filter(c => {
    const term = filterQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      c.name.toLowerCase().includes(term) || 
      c.desc.toLowerCase().includes(term) ||
      (c.specialist && c.specialist.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header Area */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users2 className="w-7 h-7 text-brand" />
            <span>تشكيل اللجان</span>
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1">إنشاء لجان قطاعية ونوعية ومتابعة أعمالها وتحديثاتها</p>
        </div>
        
        {/* Actions & Stats Group Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
          
          {/* 1. Toggleable Search with Input */}
          <div className="flex items-center gap-2 relative">
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
                    placeholder="ابحث عن لجنة..."
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

          {/* View Mode Switcher (فرز العرض: بطائق أو سجل) */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-250 select-none" style={{ borderWidth: '0px' }}>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطائق</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>سجل</span>
            </button>
          </div>

          {/* 2. Add Committee Button - Elegant Blue Accent */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>إضافة لجنة</span>
          </button>

          {/* Google Sheets Export Button */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            title="تصدير كافة اللجان الحالية لجداول Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير لجداول Google Sheets</span>
          </button>

          {/* Vertical divider */}
          <div className="h-8 w-px bg-gray-300 hidden sm:block mx-1"></div>

          {/* 3. Brief Quick Statistic Badge */}
          <div className="flex gap-2">
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">إجمالي اللجان</span>
              <span className="text-lg font-black text-brand leading-none font-mono">{synchronizedCommittees.length}</span>
            </div>
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner" style={{ borderWidth: '0px' }}>
              <span className="text-[10px] font-black text-gray-400 block leading-tight">الأعضاء المشاركون</span>
              <span className="text-lg font-black text-emerald-600 leading-none font-mono">
                {synchronizedCommittees.reduce((acc, c) => acc + c.membersCount, 0)}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* COMMITTEES DISPLAY GRID OR TABLE (فرز العرض: بطائق أو سجل) */}
      {filteredCommittees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <p className="text-gray-500 font-extrabold text-base">لم يعثر على أية نتائج مخصصة لعملية البحث الحالية.</p>
          <button
            onClick={handleResetSearch}
            className="text-brand font-black text-xs hover:underline"
          >
            عرض كافة اللجان المسجلة
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCommittees.map((comm) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={comm.id}
                className={`bg-[#e8e4e4] hover:bg-[#e2dede] transition-colors duration-300 rounded-2xl p-5 border shadow-sm hover:shadow-md relative group flex flex-col justify-between ${!comm.active ? "opacity-50 grayscale-[30%] border-gray-300" : "border-gray-200"}`}
              >
                {/* ⚙️ Settings Gear Button with Dropdown logic */}
                <div className="absolute top-4 left-4 z-20">
                  <button
                    onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}
                    className="p-1.5 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-950 rounded-lg border border-gray-200/80 shadow-sm transition-all cursor-pointer"
                    title="التحكم باللجنة"
                  >
                    <Settings className="w-4 h-4 animate-hover-spin" />
                  </button>
                  
                  {activeGearMenuId === comm.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setActiveGearMenuId(null)} 
                      />
                      <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-40 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(comm)}
                          className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                        >
                          <span>تعديل</span>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(comm)}
                          className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                        >
                          <span>حذف</span>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Title & Badge */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide ${
                        comm.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${comm.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {comm.active ? "نشطة" : "غير نشطة"}
                      </span>
                      {comm.strategicPlan && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#e0f2fe] text-blue-800 border border-blue-200">
                          🎯 الخطة: {comm.strategicPlan}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-black text-gray-900 leading-tight pt-0.5 max-w-[85%]">
                      {comm.name}
                    </h3>

                    {comm.president && (
                      <p className="text-xs font-bold text-gray-600 flex items-center gap-1 mt-1 bg-white/50 px-2 py-1 rounded-lg border border-gray-200/40 w-fit">
                        <span className="text-[10px] text-blue-750 font-black bg-blue-50 px-1.5 py-0.5 rounded">الرئيس:</span>
                        <span className="text-gray-900 font-extrabold">{comm.president}</span>
                      </p>
                    )}
                  </div>

                  {/* Body description */}
                  <p className="text-gray-650 text-xs font-semibold leading-relaxed min-h-[48px] line-clamp-3 font-sans">
                    {comm.desc}
                  </p>

                  {/* Specialist & Formation letter details */}
                  <div className="space-y-1.5 py-2 border-y border-gray-200/50 text-[11px] font-bold text-gray-600">
                    {comm.specialist && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">الأخصائي:</span>
                        <span className="text-gray-800 font-extrabold">{comm.specialist}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Cards Row inside Committee Card */}
                  <div className="grid grid-cols-2 gap-2 text-right">
                    <div className="bg-white/60 rounded-xl p-2 border border-gray-100 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-black block leading-none">الأعضاء</span>
                        <span className="text-xs font-black text-gray-800 font-mono leading-none">{comm.membersCount}</span>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-2 border border-gray-100 flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-black block leading-none">الاجتماعات</span>
                        <span className="text-xs font-black text-gray-800 font-mono leading-none">{comm.meetingsCount}</span>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-2 border border-gray-100 flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-850 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-black block leading-none">التوصيات</span>
                        <span className="text-xs font-black text-gray-800 font-mono leading-none">{comm.recommendationsCount || 0}</span>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-xl p-2 border border-gray-100 flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-black block leading-none">الفعاليات</span>
                        <span className="text-xs font-black text-gray-800 font-mono leading-none">{comm.eventsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom interactive trace */}
                <div className="border-t border-gray-300 mt-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500">لجنة قطاعية منبثقة عن مجلس إدارة غرفة مكة المكرمة</span>
                  <button
                    type="button"
                    onClick={() => setDetailsComm(comm)}
                    className="text-xs font-black text-brand transition-all hover:translate-x-[-2px] inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    عرض التفاصيل ←
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* TABLE REGISTER VIEW LAYOUT (سجل اللجان) */
        <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
          <div className="overflow-x-auto font-sans pb-36">
            <table className="w-full text-xs font-semibold text-gray-700 select-none border-collapse text-right">
              <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900">
                <tr className="divide-x divide-x-reverse divide-gray-300">
                  <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">اسم اللجنة</th>
                  <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">رئيس اللجنة</th>
                  <th className="px-4 py-3 font-black text-right text-gray-850 tracking-tight text-xs">الأخصائي</th>
                  <th className="px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الأعضاء</th>
                  <th className="px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الاجتماعات</th>
                  <th className="px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">التوصيات</th>
                  <th className="px-3 py-3 font-black text-center text-gray-800 tracking-tight text-xs w-20">الفعاليات</th>
                  <th className="px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-32">الخطة الاستراتيجية</th>
                  <th className="px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-24">الحالة</th>
                  <th className="px-3 py-3 font-black text-center text-gray-850 tracking-tight text-xs w-20">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                {filteredCommittees.map((comm) => (
                  <tr key={comm.id} className={`hover:bg-[#e2dede] transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700 ${!comm.active ? "opacity-50 grayscale-[30%]" : ""}`}>
                    {/* Committee name with icon */}
                    <td 
                      onClick={() => setDetailsComm(comm)}
                      className="px-4 py-3.5 whitespace-nowrap font-black text-gray-900 border-none cursor-pointer group/row"
                      title="عرض المزيد من التفاصيل"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-black transition-all group-hover/row:bg-brand/20 shrink-0">
                          <Users2 className="w-4 h-4 text-brand" />
                        </div>
                        <div className="flex flex-col text-right truncate">
                          <span className="text-[11px] font-bold text-gray-900 leading-tight transition-colors group-hover/row:text-brand underline decoration-dotted decoration-brand/45 underline-offset-4 truncate">{comm.name}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* President */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-800">
                      {comm.president || "-"}
                    </td>

                    {/* Specialist */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-800">
                      {comm.specialist || "-"}
                    </td>

                    {/* Member Count */}
                    <td className="px-4 py-3.5 text-center text-gray-900 font-mono whitespace-nowrap">
                      {comm.membersCount}
                    </td>

                    {/* Meetings Count */}
                    <td className="px-4 py-3.5 text-center text-gray-950 font-mono whitespace-nowrap">
                      {comm.meetingsCount}
                    </td>

                    {/* Recommendations */}
                    <td className="px-4 py-3.5 text-center text-emerald-700 font-mono whitespace-nowrap">
                      {comm.recommendationsCount || 0}
                    </td>

                    {/* Events */}
                    <td className="px-4 py-3.5 text-center text-purple-700 font-mono whitespace-nowrap">
                      {comm.eventsCount || 0}
                    </td>

                    {/* Strategic Plan */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {comm.strategicPlan ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-150">
                          {comm.strategicPlan}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">غير مدرج</span>
                      )}
                    </td>

                    {/* Status badge representing Active vs Inactive */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        comm.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${comm.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {comm.active ? "نشطة" : "غير نشطة"}
                      </span>
                    </td>

                    {/* Action controls - ⚙️ Custom settings gear button with menu */}
                    <td className="px-4 py-3.5 text-center relative whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                        <button
                          onClick={() => setActiveGearMenuId(activeGearMenuId === comm.id ? null : comm.id)}
                          className="p-1.5 hover:bg-gray-150 text-gray-650 hover:text-gray-900 rounded-lg border border-transparent hover:border-gray-350 transition-all cursor-pointer"
                          title="الإجراءات"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        {activeGearMenuId === comm.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={() => setActiveGearMenuId(null)} 
                            />
                            <div className="absolute left-2 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-150 py-1 z-40 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailsComm(comm);
                                  setActiveGearMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-slate-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                              >
                                <span>عرض التفاصيل</span>
                                <FileText className="w-3.5 h-3.5 text-brand" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(comm)}
                                className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                              >
                                <span>تعديل التفاصيل</span>
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(comm)}
                                className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                              >
                                <span>حذف اللجنة</span>
                                <Trash2 className="w-3.5 h-3.5 text-red-650" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP BACKDROP & ADD/EDIT COMMITTEE MODAL WITH RICH FORM */}
      <AnimatePresence>
        {isAddOpen && (
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
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right"
            >
              {/* Header block with solid header representation */}
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {editingComm ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {editingComm ? `تعديل لجنة: ${editingComm.name}` : "تشكيل لجنة جديدة"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">يرجى التأكد من تسجيل البيانات بعناية لربطها بالنظام</p>
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
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
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
                <div className={editingComm ? "grid grid-cols-2 gap-4" : "w-full"}>
                  {editingComm && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-gray-700">رئيس اللجنة</label>
                      <input
                        type="text"
                        value={president}
                        onChange={(e) => setPresident(e.target.value)}
                        placeholder="يترك فارغاً"
                        className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-right"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الخطة الاستراتيجية</label>
                    <select
                      value={strategicPlan}
                      onChange={(e) => setStrategicPlan(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-2 text-xs font-black text-right focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="">غير مدرجة</option>
                      <option value="تم الاعتماد">تم الاعتماد</option>
                      <option value="قيد الدراسة">قيد الدراسة</option>
                    </select>
                  </div>
                </div>

                {/* Quantities Row */}
                {editingComm && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">عدد الأعضاء</label>
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={membersCount}
                      onChange={(e) => setMembersCount(Number(e.target.value))}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-black font-mono text-right focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Numeric Statistics Row */}
                {editingComm && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-700">عدد الاجتماعات</label>
                      <input
                        type="number"
                        min={0}
                        value={meetingsCount}
                        onChange={(e) => setMeetingsCount(Number(e.target.value))}
                        className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs font-bold font-mono text-center outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-700">عدد التوصيات</label>
                      <input
                        type="number"
                        min={0}
                        value={recommendationsCount}
                        onChange={(e) => setRecommendationsCount(Number(e.target.value))}
                        className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs font-bold font-mono text-center outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-gray-700">عدد الفعاليات</label>
                      <input
                        type="number"
                        min={0}
                        value={eventsCount}
                        onChange={(e) => setEventsCount(Number(e.target.value))}
                        className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs font-bold font-mono text-center outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Status Toggle Block (Active: Green, Inactive: Red) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700">حالة اللجنة</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className={`h-11 rounded-xl flex items-center justify-center gap-2 border font-black text-xs transition-all cursor-pointer ${
                        isActive 
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800 ring-2 ring-emerald-500/10" 
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>نشطة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={`h-11 rounded-xl flex items-center justify-center gap-2 border font-black text-xs transition-all cursor-pointer ${
                        !isActive 
                          ? "bg-rose-50 border-rose-250 text-rose-800 ring-2 ring-rose-500/10" 
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>غير نشطة</span>
                    </button>
                  </div>
                </div>

                {/* Formation Letter Link with computer upload emulation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700">خطاب التشكيل</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="formation-file-upload"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFormationLetter(e.target.files[0].name);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="formation-file-upload"
                      className="w-full h-11 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 flex items-center justify-between text-xs font-bold text-gray-600 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600 font-extrabold">ارفق خطاب التشكيل...</span>
                      </span>
                      <span className="text-gray-400 truncate max-w-[190px]">
                        {formationLetter ? formationLetter : "قرار_رسمي_متروك.pdf"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700">وصف اللجنة ومسؤولياتها الرئيسية <span className="text-red-500">*</span></label>
                  <textarea
                    rows={2.5}
                    required
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="اكتب هنا ملخصاً لأهداف اللجنة واختصاصاتها الرئيسية ومحاور تركيزها..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Buttons block */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingComm ? "حفظ التعديلات الحالية" : "إضافة وتشكيل اللجنة"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-6 h-11 bg-gray-100 hover:bg-gray-200 text-gray-750 font-extrabold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء الأمر
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP BACKDROP & DELETION PROCESS safeguarded modal */}
      <AnimatePresence>
        {deletingComm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingComm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10 text-right space-y-4 border border-red-100"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-base">إجراءات حذف وإلغاء اللجنة</h3>
                  <p className="text-[11px] text-gray-500 font-bold">{deletingComm.name}</p>
                </div>
              </div>

              {!isDeletingStep ? (
                /* STEP 1: Enter deletion reason */
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-semibold text-red-800 leading-relaxed">
                    نظام الموارد واللجان يتطلب توثيق سبب وإثبات حذف اللجنة أو سحب التشكيل لمطابقة معايير الحوكمة الاستراتيجية.
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">توضيح سبب الحذف أو الإلغاء <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      required
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="يرجى كتابة سبب الحذف أو الاستبعاد..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={!deleteReason.trim()}
                      onClick={() => setIsDeletingStep(true)}
                      className="flex-1 h-10 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>تحويل اللجنة لـ "غير نشطة" والتقدم</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingComm(null)}
                      className="px-4 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: Non-active setting indicator and double confirm deletion */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-850 font-black text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                      <span>تنبيه: تم تغيير حالة اللجنة بنجاح لتكون غير نشطة 🔴</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                      تم توثيق السبب وإلغاء فاعلية اللجنة في النظام. هل ترغب فعلاً بإنهاء هذه الخطوة وتأكيد الحذف الإلكتروني النهائي نهائياً من قاعدة البيانات وتصفية كافة سجلاتها؟
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCommittees(prev => prev.filter(c => c.id !== deletingComm.id));
                        setDeletingComm(null);
                        setIsDeletingStep(false);
                      }}
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>تأكيد الحذف النهائي التام</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCommittees(prev => prev.map(c => {
                          if (c.id === deletingComm.id) {
                            return { ...c, active: false };
                          }
                          return c;
                        }));
                        setDeletingComm(null);
                        setIsDeletingStep(false);
                      }}
                      className="w-full h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-250 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <span>الاحتفاظ باللجنة كـ "غير نشطة" دون حذفها</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeletingComm(null);
                        setIsDeletingStep(false);
                      }}
                      className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      تراجع وعودة
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP BACKDROP & DETAILS MODAL */}
      <AnimatePresence>
        {detailsComm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Dark glass backdrop with fade overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsComm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body Card with Zoom bounce */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-150 relative overflow-hidden z-10 text-right font-sans"
            >
              {/* Header block */}
              <div className="bg-[#e8e4e4] p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand/10 text-brand rounded-xl">
                    <Users2 className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                        {detailsComm.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        detailsComm.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${detailsComm.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {detailsComm.active ? "نشطة" : "غير نشطة"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">عرض جميع السجلات والمستندات والمسؤولين المرتبطين باللجنة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsComm(null)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details Content */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                
                {/* 1. Description Box */}
                <div className="space-y-2 text-right">
                  <h4 className="text-xs font-black text-gray-400 tracking-wider">وصف اللجنة ومسؤولياتها الرئيسية</h4>
                  <div className="bg-[#fcfbfb] border border-[#d2cece] rounded-2xl p-4 text-sm font-medium text-gray-800 leading-relaxed shadow-inner">
                    {detailsComm.desc || "لم يتم إدخال وصف تفصيلي للجنة بعد."}
                  </div>
                </div>

                {/* 2. Structured Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left Column: Management / Specialist / President */}
                  <div className="space-y-4">
                    <div className="bg-[#e8e4e4]/40 border border-gray-200 rounded-2xl p-4 space-y-3">
                      <h5 className="text-xs font-black text-gray-500 border-b border-gray-200/60 pb-1.5">هيكل اللجنة</h5>
                      
                      {detailsComm.president && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-black block">رئيس اللجنة</span>
                            <span className="text-xs font-extrabold text-blue-900">{detailsComm.president}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-gray-650 rounded-xl">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-black block">الموظف الأخصائي المسؤول</span>
                          <span className="text-xs font-extrabold text-gray-800">{detailsComm.specialist || "غير محدد"}</span>
                        </div>
                      </div>

                      {detailsComm.strategicPlan && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-black block">الخطة الاستراتيجية للجنة</span>
                            <span className="text-xs font-extrabold text-emerald-800">{detailsComm.strategicPlan}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Statistics Grid of 4 elements */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      
                      <div className="bg-[#e8e4e4]/40 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between text-right">
                        <div>
                          <Users className="w-5 h-5 text-blue-600 mb-2" />
                          <span className="text-[10px] text-gray-400 font-black block leading-tight">أعضاء اللجنة</span>
                        </div>
                        <span className="text-xl font-black text-gray-900 font-mono mt-2">{detailsComm.membersCount}</span>
                      </div>

                      <div className="bg-[#e8e4e4]/40 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between text-right">
                        <div>
                          <Calendar className="w-5 h-5 text-amber-600 mb-2" />
                          <span className="text-[10px] text-gray-400 font-black block leading-tight">الاجتماعات المنجزة</span>
                        </div>
                        <span className="text-xl font-black text-gray-900 font-mono mt-2">{detailsComm.meetingsCount}</span>
                      </div>

                      <div className="bg-[#e8e4e4]/40 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between text-right">
                        <div>
                          <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                          <span className="text-[10px] text-gray-400 font-black block leading-tight">التوصيات الصادرة</span>
                        </div>
                        <span className="text-xl font-black text-emerald-700 font-mono mt-2">{detailsComm.recommendationsCount || 0}</span>
                      </div>

                      <div className="bg-[#e8e4e4]/40 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between text-right">
                        <div>
                          <FileText className="w-5 h-5 text-purple-600 mb-2" />
                          <span className="text-[10px] text-gray-400 font-black block leading-tight">الفعاليات المنجزة</span>
                        </div>
                        <span className="text-xl font-black text-purple-700 font-mono mt-2">{detailsComm.eventsCount || 0}</span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* 3. Additional Details Box */}
                <div className="border border-gray-150 rounded-2xl p-4 bg-orange-50/20 text-right space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>مقر ومستوى الحوكمة للجنة</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                    تعقد اللجنة اجتماعاتها الدورية بشكل منتظم وفق لائحة اللجان الوطنية والقطاعية الصادرة من اتحاد الغرف التجارية السعودية.
                  </p>
                </div>

              </div>

              {/* Footer Block */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEdit(detailsComm);
                      setDetailsComm(null);
                    }}
                    className="h-10 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل التفاصيل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenDelete(detailsComm);
                      setDetailsComm(null);
                    }}
                    className="h-10 px-4 bg-red-50 text-red-650 hover:bg-red-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف اللجنة</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailsComm(null)}
                  className="px-5 h-10 bg-gray-200 hover:bg-gray-300 text-gray-750 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📊 GOOGLE SHEETS DYNAMIC EXPORT MODAL */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExportOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right text-slate-800"
            >
              {/* Header */}
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      تصدير اللجان إلى Google Sheets
                    </h3>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">اختر الحقول والبيانات المراد تصديرها بدقة عالية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold text-gray-650 leading-relaxed bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100">
                  سيتم فرز وتصدير اللجان المحددة أبجدياً مع جلب كافة الإحصائيات الفعالة (الأعضاء، الاجتماعات، التوصيات، والفعاليات) تلقائياً من النظام.
                </p>

                <div className="space-y-2">
                  <span className="block text-xs font-black text-gray-700">تحديد الحقول المراد تصديرها للتقرير:</span>
                  <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-1 border border-gray-100 rounded-xl bg-gray-50/50">
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

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                <button
                  type="button"
                  onClick={handleExportToGoogleSheets}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 hover:shadow-md text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>بدء تنزيل الملف وحفظه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(false)}
                  className="px-5 h-11 bg-gray-200 hover:bg-gray-300 text-gray-750 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
