import React, { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";

import { 
  Users, 
  Users2, 
  Search, 
  Plus, 
  X, 
  Calendar, 
  CheckCircle, 
  Mail, 
  Phone, 
  Trash2,
  Check,
  LayoutGrid,
  List,
  Settings,
  AlertTriangle,
  UserCheck,
  UserX,
  Edit2,
  FileText,
  Bookmark,
  Briefcase,
  Building2,
  Sparkles,
  ExternalLink,
  Upload,
  Paperclip,
  Fingerprint,
  FileCheck,
  FileDown,
  Shield,
  SlidersHorizontal
} from "lucide-react";

interface Member {
  id: number;
  title: string; // "الأستاذ" | "الأستاذة" | "المهندس" | "المهندسة" | "الدكتور" | "الدكتورة" | "غير ذلك"
  customTitle?: string;
  name: string; // الاسم الثلاثي
  role: string; // "رئيس" | "نائب" | "عضو" | "مشارك"
  committeeId: number;
  committeeName: string;
  joiningMechanism: string; // "مرشح" | "معين" | "مشارك" | "ممثل لجهة حكومية"
  govAgency?: string;
  entity?: string; // جهة التمثيل
  email: string;
  phone: string;
  nationalId: string; // رقم الهوية الوطنية / رقم الإقامة
  active: boolean; // حالة العضوية (نشط باللون الأخضر - غير نشط باللون الأحمر)
  joinedDate: string;
  note?: string;
  
  // Attachments filenames
  personalPhoto?: string;
  cv?: string;
  commercialRegister?: string;
  membershipCertificate?: string;
  authorization?: string;
}

interface CommitteeListItem {
  id: number;
  name: string;
}

const TITLES = [
  "الأستاذ",
  "الأستاذة",
  "المهندس",
  "المهندسة",
  "الدكتور",
  "الدكتورة",
  "غير ذلك"
];

const ROLE_CAPACITIES = [
  "رئيس",
  "نائب",
  "عضو",
  "مشارك"
];

const JOINING_MECHANISMS = [
  "مرشح",
  "معين",
  "مشارك",
  "ممثل لجهة حكومية"
];

const ENTITIES = [
  "غرفة مكة المكرمة",
  "أمانة العاصمة المقدسة",
  "وزارة الحج والعمرة",
  "وزارة الصناعة والثروة المعدنية",
  "الهيئة العامة للسياحة",
  "جامعة أم القرى",
  "حاضنات ومسرعات مكة",
  "القطاع الخاص المكي"
];

function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  let clean = phone.trim().replace(/\s+/g, "").replace(/\+/g, "");
  if (clean.startsWith("05") && clean.length === 10) {
    return "966" + clean.slice(1);
  }
  if (clean.startsWith("5") && clean.length === 9) {
    return "966" + clean;
  }
  if (clean.startsWith("9665") && clean.length === 12) {
    return clean;
  }
  return clean;
}

interface AttachmentInputProps {
  label: string;
  value: string;
  onChange: (fileName: string) => void;
  id: string;
}

function AttachmentInput({ label, value, onChange, id }: AttachmentInputProps) {
  const fileInputId = `file-input-${id}`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0].name);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-3.5 text-center transition-all relative ${
        value
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70"
      }`}
    >
      <input
        type="file"
        id={fileInputId}
        className="hidden"
        onChange={handleFileChange}
      />
      <label htmlFor={fileInputId} className="cursor-pointer block space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-gray-700">{label}</span>
          {value ? (
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>مرفق</span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 hover:text-brand">
              <Upload className="w-3.5 h-3.5" />
              <span>تحميل</span>
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-500 font-medium truncate text-right">
          {value ? value : "اسحب الملف هنا أو انقر للإدراج"}
        </p>
      </label>
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onChange("");
          }}
          className="absolute left-2.5 top-2.5 p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
          title="حذف الملف"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from '../lib/firebase';
import { db } from '../lib/firebase';
import { useFirestoreCollection } from '../lib/firebaseUtils';

export default function CommitteesMembers() {
  const { data: dbMembers, addDocument: addFirebaseMember, updateDocument: updateFirebaseMember, deleteDocument: deleteFirebaseMember } = useFirestoreCollection<Member>("members", []);
  const { data: dbCommittees } = useFirestoreCollection<any>("committees", []);

  const setMembers = (action: React.SetStateAction<Member[]>) => {
    let nextItems = typeof action === 'function' ? action(dbMembers) : action;
    dbMembers.forEach(existing => {
       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseMember(String(existing.id));
       }
    });

    nextItems.forEach(nextI => {
       const existing = dbMembers.find(e => e.id === nextI.id);
       if (!existing) {
          updateFirebaseMember(String(nextI.id), nextI);
       } else if (JSON.stringify(existing) !== JSON.stringify(nextI)) {
          updateFirebaseMember(String(nextI.id), nextI);
       }
    });
  };

  const members = dbMembers;
  
  const allCommittees = dbCommittees.length > 0 ? dbCommittees.map(c => ({ id: c.id, name: c.name })) : [
  ];

  const canUserEditCommittee = (committeeName: string): boolean => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return true;
      const user = JSON.parse(stored);
      if (!user) return true;
      if (user.role === "SYS_ADMIN") return true;
      if (user.committees && Array.isArray(user.committees)) {
        return user.committees.includes(committeeName);
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showSuccessPrompt, setShowSuccessPrompt] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());

  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("app_member_columns_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default
      }
    }
    return {
      index: true,
      name: true,
      committee: true,
      phone: true,
      email: true,
      nationalId: true,
      membership_type: true,
      joined_date: true,
      status: true,
      attachments: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("app_member_columns_v2", JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Form Fields for Add / Edit
  const [title, setTitle] = useState("الأستاذ");
  const [customTitle, setCustomTitle] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLE_CAPACITIES[2]); // Default: عضو
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number>(0);
  const [joiningMechanism, setJoiningMechanism] = useState("مرشح");
  const [govAgency, setGovAgency] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [joinedDate, setJoinedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [note, setNote] = useState("");

  // Attachments filenames state
  const [personalPhoto, setPersonalPhoto] = useState("");
  const [cv, setCv] = useState("");
  const [commercialRegister, setCommercialRegister] = useState("");
  const [membershipCertificate, setMembershipCertificate] = useState("");
  const [authorization, setAuthorization] = useState("");

  // Editing state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editReason, setEditReason] = useState("");

  // Deletion process states
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  // Active gear action dropdown state
  const [activeGearMenuId, setActiveGearMenuId] = useState<number | null>(null);

  // Details Modal State
  const [detailsMember, setDetailsMember] = useState<Member | null>(null);

  useEffect(() => {
    localStorage.setItem("app_members", JSON.stringify(members));
  }, [members]);

  const handleSearchMembers = (e: FormEvent) => {
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
    setTitle("الأستاذ");
    setCustomTitle("");
    setName("");
    setRole(ROLE_CAPACITIES[2]); // عضو
    setSelectedCommitteeId(0);
    setJoiningMechanism("مرشح");
    setGovAgency("");
    setEmail("");
    setPhone("");
    setNationalId("");
    setIsActive(true);
    setJoinedDate(new Date().toISOString().split('T')[0]);
    setNote("");
    setPersonalPhoto("");
    setCv("");
    setCommercialRegister("");
    setMembershipCertificate("");
    setAuthorization("");
    setEditingMember(null);
    setEditReason("");
    setFormError("");
    setShowSuccessPrompt(false);
    setIsAddOpen(true);
  };

  const handleAddNewMemberPrompt = () => {
    setName("");
    setEmail("");
    setPhone("");
    setNationalId("");
    setIsActive(true);
    setNote("");
    setPersonalPhoto("");
    setCv("");
    setCommercialRegister("");
    setMembershipCertificate("");
    setAuthorization("");
    setGovAgency("");
    setTitle("الأستاذ");
    setCustomTitle("");
    setRole(ROLE_CAPACITIES[2]);
    setSelectedCommitteeId(0);
    setFormError("");
    setShowSuccessPrompt(false);
  };

  const handleOpenEdit = (m: Member) => {
    if (!canUserEditCommittee(m.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لتعديل هذا العضو. يمكنك فقط تعديل وعمل اللجان المكلف بها.");
      return;
    }
    setEditingMember(m);
    setTitle(m.title || "الأستاذ");
    setCustomTitle(m.customTitle || "");
    setName(m.name);
    setRole(m.role || ROLE_CAPACITIES[2]);
    setSelectedCommitteeId(m.committeeId);
    setJoiningMechanism(m.joiningMechanism || "مرشح");
    setGovAgency(m.govAgency || "");
    setEmail(m.email);
    setPhone(m.phone);
    setNationalId(m.nationalId || "");
    setIsActive(m.active);
    setJoinedDate(m.joinedDate);
    setNote(m.note || "");
    setPersonalPhoto(m.personalPhoto || "");
    setCv(m.cv || "");
    setCommercialRegister(m.commercialRegister || "");
    setMembershipCertificate(m.membershipCertificate || "");
    setAuthorization(m.authorization || "");
    setEditReason("");
    setFormError("");
    setShowSuccessPrompt(false);
    setIsAddOpen(true);
    setActiveGearMenuId(null);
  };

  const handleOpenDelete = (m: Member) => {
    if (!canUserEditCommittee(m.committeeName)) {
      alert("عذراً، لا تملك الصلاحية لحذف هذا العضو. يمكنك فقط تعديل وعمل اللجان المكلف بها.");
      return;
    }
    setDeletingMember(m);
    setDeleteReason("");
    setIsDeletingStep(false);
    setActiveGearMenuId(null);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("يرجى إدخال الاسم الرباعي");
      return;
    }
    if (title === "غير ذلك" && !customTitle.trim()) {
      setFormError("يرجى تحديد اللقب يدويًا");
      return;
    }
    if (!selectedCommitteeId || Number(selectedCommitteeId) === 0) {
      setFormError("يرجى اختيار اللجنة");
      return;
    }
    if (joiningMechanism === "ممثل لجهة حكومية" && !govAgency.trim()) {
      setFormError("يرجى إدخال اسم الجهة الممثلة");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!phone.trim()) {
      setFormError("يرجى إدخال رقم الجوال");
      return;
    }
    if (!nationalId.trim()) {
      setFormError("يرجى إدخال رقم الهوية الوطنية أو الإقامة");
      return;
    }
    if (editingMember && !editReason.trim()) {
      setFormError("يرجى توضيح سبب التعديل");
      return;
    }

    const matchedComm = allCommittees.find(c => c.id === Number(selectedCommitteeId)) || { name: "لجنة" };

    if (!canUserEditCommittee(matchedComm.name)) {
      setFormError("عذراً، لا تملك الصلاحية لإضافة أو تعديل عضو في هذه اللجنة. يمكنك فقط إدارة لجانك المكلف بها.");
      return;
    }

    // Auto calculate membershipType
    const calculatedEntity = joiningMechanism === "ممثل لجهة حكومية" 
      ? govAgency.trim() 
      : "غرفة مكة المكرمة";

    if (editingMember) {
      // Edit
      setMembers(prev => prev.map(m => {
        if (m.id === editingMember.id) {
          return {
            ...m,
            title: title,
            customTitle: title === "غير ذلك" ? customTitle.trim() : "",
            name: name.trim(),
            role: role,
            committeeId: Number(selectedCommitteeId),
            committeeName: matchedComm.name,
            joiningMechanism: joiningMechanism,
            govAgency: joiningMechanism === "ممثل لجهة حكومية" ? govAgency.trim() : "",
            entity: calculatedEntity,
            email: email.trim(),
            phone: phone.trim(),
            nationalId: nationalId.trim(),
            active: isActive,
            joinedDate: joinedDate,
            note: note.trim(),
            personalPhoto: personalPhoto,
            cv: cv,
            commercialRegister: commercialRegister,
            membershipCertificate: membershipCertificate,
            authorization: authorization
          };
        }
        return m;
      }));
      // Reset fields (Edit mode closes modal)
      setName("");
      setRole(ROLE_CAPACITIES[2]);
      setFormError("");
      setIsAddOpen(false);
    } else {
      // Add
      const newMember: Member = {
        id: Date.now(),
        title: title,
        customTitle: title === "غير ذلك" ? customTitle.trim() : "",
        name: name.trim(),
        role: role,
        committeeId: Number(selectedCommitteeId),
        committeeName: matchedComm.name,
        joiningMechanism: joiningMechanism,
        govAgency: joiningMechanism === "ممثل لجهة حكومية" ? govAgency.trim() : "",
        entity: calculatedEntity,
        email: email.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        active: isActive,
        joinedDate: joinedDate,
        note: note.trim(),
        personalPhoto: personalPhoto,
        cv: cv,
        commercialRegister: commercialRegister,
        membershipCertificate: membershipCertificate,
        authorization: authorization
      };
      setMembers([newMember, ...members]);
      setShowSuccessPrompt(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteReason.trim()) {
      alert("يرجى كتابة سبب الحذف");
      return;
    }
    if (deletingMember) {
      setMembers(prev => prev.filter(m => m.id !== deletingMember.id));
      setDeletingMember(null);
      setDeleteReason("");
      setIsDeletingStep(false);
    }
  };

  // Filter and search logic
  const filteredMembers = members.filter(m => {
    const term = filterQuery.trim().toLowerCase();
    
    // Search query matches
    return !term ? true : (
      m.name.toLowerCase().includes(term) ||
      m.role.toLowerCase().includes(term) ||
      m.committeeName.toLowerCase().includes(term) ||
      (m.entity || "").toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term)
    );
  });

  // Calculate stats
  const totalCount = members.length;
  const activeCount = members.filter(m => m.active).length;
  const inactiveCount = totalCount - activeCount;

  const femaleTitles = ["الأستاذة", "المهندسة", "الدكتورة"];
  const femaleCount = members.filter(m => femaleTitles.includes(m.title) || (m.title === "غير ذلك" && m.customTitle?.trim().endsWith("ة"))).length;
  const maleCount = totalCount - femaleCount;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const toggleMemberSelection = (id: number) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getMemberFullName = (m: Member): string => {
    const memberTitle = m.title && m.title !== "غير ذلك" ? m.title : (m.customTitle || "");
    const cleanTitle = memberTitle.trim();
    return cleanTitle ? `${cleanTitle} ${m.name}` : m.name;
  };

  const getMemberInitials = (fullName: string) => {
    const parts = fullName.trim().replaceAll("أ.", "").replaceAll("د.", "").replaceAll("م.", "").trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
    }
    return (parts[0][0] || "ع").toUpperCase();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. Header block equivalent to Committee style */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-brand animate-pulse" />
            <span>سجل وأعضاء اللجان</span>
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1 w-[500px] max-w-full">
            إدارة بيانات أعضاء اللجان وتتبع مشاركتهم بمهنية عالية.
          </p>
        </div>

        {/* Action button triggers & controls */}
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
          
          {/* A. Dynamic Search Trigger matching the Committees page */}
          <div className="flex items-center gap-2 relative">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  onSubmit={handleSearchMembers}
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
                    placeholder="كلمة البحث..."
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
                  ? "bg-blue-55 bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              title="البحث السريع"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* C. View Mode (Cards, Table, or Sorter) with popup filter */}
          <div className="relative flex bg-white p-1 rounded-xl border border-gray-300 select-none shadow-sm gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                setViewMode("cards");
                setIsFilterOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                viewMode === "cards" && !isFilterOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطائق</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("table");
                setIsFilterOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer select-none ${
                viewMode === "table" && !isFilterOpen
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>سجل</span>
            </button>

            {/* زر خيار الفرز مع قائمة منبثقة */}
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
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3.5 space-y-3.5 text-right font-sans"
                      style={{ transformOrigin: "top left" }}
                    >
                      {/* الفلتر: تخصيص أعمدة الجدول */}
                      <div className="space-y-2 text-right">
                        <div className="flex items-center gap-1.5 text-gray-800 justify-start">
                          <span className="w-1 h-3 bg-indigo-600 rounded-full" />
                          <span className="text-[11px] font-black">أعمدة العرض:</span>
                        </div>
                        <div className="space-y-0.5">
                          {[
                            { id: "index", label: "تسلسل" },
                            { id: "name", label: "الاسم" },
                            { id: "committee", label: "اللجنة" },
                            { id: "phone", label: "رقم الجوال" },
                            { id: "email", label: "البريد الإلكتروني" },
                            { id: "nationalId", label: "رقم الهوية" },
                            { id: "membership_type", label: "آلية الانضمام" },
                            { id: "joined_date", label: "تاريخ الانضمام" },
                            { id: "status", label: "الحالة" },
                            { id: "attachments", label: "المرفقات" }
                          ].map((col) => {
                            const isSelected = visibleColumns[col.id];
                            
                            const handleToggle = () => {
                              setVisibleColumns(prev => ({
                                ...prev,
                                [col.id]: !prev[col.id]
                              }));
                            };

                            return (
                              <button
                                type="button"
                                key={col.id}
                                onClick={handleToggle}
                                className="w-full flex items-center justify-between text-right px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer group select-none"
                              >
                                <div className="flex items-center gap-2 font-sans">
                                  <div 
                                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                                      isSelected 
                                        ? "shadow-sm" 
                                        : "border-gray-300 text-transparent"
                                    }`}
                                    style={isSelected ? {
                                      backgroundColor: "#ffffff",
                                      color: "#000000",
                                      borderColor: "#003fe1"
                                    } : {}}
                                  >
                                    {isSelected && (
                                      <Check 
                                        className="w-2.5 h-2.5 stroke-[4.5]" 
                                        style={{ color: "#000000", borderColor: "#2c45b1" }} 
                                      />
                                    )}
                                  </div>
                                  <span 
                                    className={`text-[11px] font-black transition-colors ${
                                      isSelected ? "font-extrabold" : "text-gray-500 group-hover:text-gray-700"
                                    }`}
                                    style={isSelected ? { color: "#000000" } : {}}
                                  >
                                    {col.label}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="h-px bg-gray-150" />

                      {/* زر الإرجاع / الإعادة */}
                      <button
                        type="button"
                        onClick={() => {
                          setVisibleColumns({
                            index: true,
                            name: true,
                            committee: true,
                            phone: true,
                            email: true,
                            nationalId: true,
                            membership_type: true,
                            joined_date: true,
                            status: true,
                            attachments: true,
                          });
                        }}
                        className="w-full text-center text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 py-1.5 rounded-lg cursor-pointer"
                      >
                        عرض جميع الأعمدة
                      </button>

                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Add member button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>إضافة عضو</span>
          </button>

          {/* Vertical divider */}
          <div className="h-8 w-px bg-gray-300 hidden xl:block mx-1"></div>

          {/* Stats Badge counters */}
          <div className="flex gap-2">
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner flex items-center justify-center gap-3">
              <div>
                <span className="text-[10px] font-black text-emerald-600/80 block leading-tight">نشط</span>
                <span className="text-sm font-black text-emerald-600 leading-none font-mono">{activeCount}</span>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <span className="text-[10px] font-black text-rose-600/80 block leading-tight">غير نشط</span>
                <span className="text-sm font-black text-rose-600 leading-none font-mono">{inactiveCount}</span>
              </div>
            </div>
            <div className="bg-white px-3.5 py-1.5 rounded-xl text-center shadow-inner flex items-center justify-center gap-3">
              <div>
                <span className="text-[10px] font-black text-blue-600/80 block leading-tight">رجال الأعمال</span>
                <span className="text-sm font-black text-blue-600 leading-none font-mono">{maleCount}</span>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <span className="text-[10px] font-black text-pink-600/80 block leading-tight">سيدات الأعمال</span>
                <span className="text-sm font-black text-pink-600 leading-none font-mono">{femaleCount}</span>
              </div>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <span className="text-[10px] font-black text-gray-400 block leading-tight">الإجمالي</span>
                <span className="text-sm font-black text-brand leading-none font-mono">{totalCount}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 2. MAIN LAYOUT: Empty state, Cards view, or Table view */}
      {filteredMembers.length === 0 ? (
        <div className="bg-[#e8e4e4] rounded-3xl p-16 text-center border-2 border-dashed border-gray-300 space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-800">لا يوجد جهات اتصال مطابقة لبحثك</h3>
            <p className="text-gray-500 text-xs font-semibold mt-1 max-w-sm mx-auto">
              تأكد من كتابة الاسم أو المسمى بشكل صحيح في شريط البحث، أو اضبط عوامل التصفية للحصول على نتائج أوسع.
            </p>
          </div>
          <button
            onClick={handleResetSearch}
            className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            مسح عوامل التصفية
          </button>
        </div>
      ) : viewMode === "cards" ? (
        
        // --- 2A. CARDS VIEW (بطائق العرض التفاعلية) ---
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="bg-[#e8e4e4] hover:bg-[#e2dede] hover:shadow-lg rounded-3xl p-5 border border-gray-200 relative flex flex-col justify-between transition-all group duration-300 min-h-[300px]"
            >
              {/* Card top banner with initials avatar & status badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/90 to-[#4ea0b0]/90 text-white flex items-center justify-center font-black text-sm tracking-wide shadow-md shadow-brand/15 group-hover:scale-105 transition-transform">
                    {getMemberInitials(m.name)}
                  </div>
                  <div className="text-right">
                    <h3 
                      onClick={() => setDetailsMember(m)}
                      className="font-black text-gray-900 group-hover:text-brand transition-colors text-sm hover:underline decoration-dotted decoration-brand/50 cursor-pointer"
                    >
                      {getMemberFullName(m)}
                    </h3>
                    <span className="text-[10px] text-[#4ea0b0] font-black flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 block" />
                      {m.role}
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  m.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                  {m.active ? "نشط" : "غير نشط"}
                </span>
              </div>

              {/* Card Content parameters */}
              <div className="mt-5 space-y-2.5 text-right flex-grow">
                {/* Linked Committee */}
                <div className="bg-white/60 group-hover:bg-white p-3 rounded-2xl border border-gray-200/50 flex flex-col justify-center min-h-[55px] transition-colors">
                  <span className="text-[9px] text-gray-400 font-extrabold block">اللجنة</span>
                  <p className="text-[11px] font-black text-gray-800 flex items-center gap-1 mt-0.5">
                    <Users2 className="w-3.5 h-3.5 text-brand" />
                    <span>{m.committeeName}</span>
                  </p>
                </div>

                {/* Corporate Represented Entity */}
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-[10px] font-black text-gray-500">الجهة الممثلة:</span>
                  <span className="text-[10px] font-extrabold text-gray-800 truncate" title={m.entity || "غرفة مكة المكرمة"}>{m.entity || "غرفة مكة المكرمة"}</span>
                </div>

                {/* Core Contact Info */}
                <div className="grid grid-cols-1 gap-1 pt-1.5 border-t border-gray-300">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono text-[10px] group-hover:text-brand transition-colors truncate" title={m.email}>{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono text-[10px]">{formatPhoneNumber(m.phone)}</span>
                  </div>
                </div>

                {/* Short note descriptor */}
                {m.note && (
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-2 p-2 bg-black/5 rounded-xl block max-h-[48px] overflow-hidden truncate">
                    {m.note}
                  </p>
                )}
              </div>

              {/* Card Interactive Footer with Action menus */}
              <div className="border-t border-gray-300 mt-4 pt-3 flex items-center justify-between">
                
                {/* Left side actions: details trigger */}
                <button
                  type="button"
                  onClick={() => setDetailsMember(m)}
                  className="text-xs font-black text-brand transition-all hover:translate-x-[-2px] inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  عرض التفاصيل ←
                </button>

                {/* Right side actions dropdown menu */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setActiveGearMenuId(activeGearMenuId === m.id ? null : m.id)}
                    className="p-1.5 hover:bg-white text-gray-650 hover:text-gray-900 rounded-lg border border-transparent hover:border-gray-300 transition-all cursor-pointer"
                    title="التحكم بالإجراءات"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {activeGearMenuId === m.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setActiveGearMenuId(null)} 
                      />
                      <div className="absolute left-0 bottom-full mb-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-150 py-1 z-40 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailsMember(m);
                            setActiveGearMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-slate-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                        >
                          <span>الملف الكامل</span>
                          <FileText className="w-3.5 h-3.5 text-brand" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                        >
                          <span>تعديل العضو</span>
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(m)}
                          className="w-full px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                        >
                          <span>حذف العضو</span>
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
          <div className="overflow-x-auto font-sans pb-36">
            <table className="w-full text-xs font-semibold text-gray-700 select-none border-collapse text-right">
              <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900">
                <tr className="divide-x divide-x-reverse divide-gray-300">
                  <th className="px-2 py-2 font-black text-center text-gray-850 tracking-tight text-xs w-8">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                      checked={filteredMembers.length > 0 && selectedMembers.size === filteredMembers.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {visibleColumns.index && <th className="px-2 py-2 font-black text-center text-gray-850 tracking-tight text-xs w-8">م</th>}
                  {visibleColumns.name && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs w-[220px]">الاسم</th>}
                  {visibleColumns.committee && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs">اللجنة</th>}
                  {visibleColumns.phone && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs">رقم الجوال</th>}
                  {visibleColumns.email && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs">البريد الإلكتروني</th>}
                  {visibleColumns.nationalId && <th className="px-2 py-2 font-black text-right text-gray-850 tracking-tight text-xs">رقم الهوية</th>}
                  {visibleColumns.membership_type && <th className="px-2 py-2 font-black text-center text-gray-800 tracking-tight text-xs">آلية الانضمام</th>}
                  {visibleColumns.joined_date && <th className="px-2 py-2 font-black text-center text-gray-800 tracking-tight text-xs">تاريخ الانضمام</th>}
                  {visibleColumns.status && <th className="px-2 py-2 font-black text-center text-gray-800 tracking-tight text-xs">الحالة</th>}
                  {visibleColumns.attachments && <th className="px-2 py-2 font-black text-center text-gray-800 tracking-tight text-xs">المرفقات</th>}
                  <th className="px-2 py-2 font-black text-center text-gray-800 tracking-tight text-xs">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/85">
                {filteredMembers.map((m, idx) => {
                  const requiredDocs = [
                    { name: 'صورة شخصية', has: !!m.personalPhoto },
                    { name: 'السيرة الذاتية', has: !!m.cv },
                    { name: 'السجل التجاري', has: !!m.commercialRegister }
                  ];
                  const completedDocs = requiredDocs.filter(d => d.has).length;
                  const missingDocs = requiredDocs.length - completedDocs;

                  return (
                  <tr key={m.id} className="hover:bg-[#e2dede] transition-colors text-right divide-x divide-x-reverse divide-gray-200 text-[11px] font-bold text-gray-700">
                    <td className="px-2 py-2 whitespace-nowrap text-center border-none">
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                        checked={selectedMembers.has(m.id)}
                        onChange={() => toggleMemberSelection(m.id)}
                      />
                    </td>
                    {visibleColumns.index && (
                      <td className="px-2 py-2 whitespace-nowrap text-center text-gray-900 font-mono font-black border-none group/row">
                        {idx + 1}
                      </td>
                    )}

                    {/* الاسم */}
                    {visibleColumns.name && (
                      <td 
                        onClick={() => setDetailsMember(m)}
                        className="px-2 py-2 whitespace-nowrap font-black text-gray-900 border-none cursor-pointer group/row w-[220px]"
                        title="عرض الملف التفصيلي"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-col text-right">
                            <span className="text-xs font-black text-gray-900 leading-tight transition-colors group-hover/row:text-brand underline decoration-dotted decoration-brand/45 underline-offset-4">
                              {getMemberFullName(m)}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* اللجنة */}
                    {visibleColumns.committee && (
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-gray-700">
                        <div className="flex flex-col">
                          <span className="text-[#4ea0b0] font-black flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-[#4ea0b0]" />
                            {m.role}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 block truncate max-w-[150px]" title={m.committeeName}>
                            {m.committeeName}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* رقم الجوال */}
                    {visibleColumns.phone && (
                      <td className="px-2 py-2 whitespace-nowrap text-right">
                        <span className="flex items-center gap-1 font-semibold font-mono text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400 text-right" />
                          <span>{formatPhoneNumber(m.phone)}</span>
                        </span>
                      </td>
                    )}

                    {/* البريد الإلكتروني */}
                    {visibleColumns.email && (
                      <td className="px-2 py-2 whitespace-nowrap text-right">
                        <span className="flex items-center gap-1 font-semibold font-mono text-xs text-gray-500 max-w-[150px] truncate" title={m.email}>
                          <Mail className="w-3.5 h-3.5 text-gray-400 text-right" />
                          <span className="truncate">{m.email}</span>
                        </span>
                      </td>
                    )}

                    {/* رقم الهوية */}
                    {visibleColumns.nationalId && (
                      <td className="px-2 py-2 whitespace-nowrap text-right font-mono text-xs text-gray-600 font-bold">
                        {m.nationalId || "-"}
                      </td>
                    )}

                    {/* آلية الانضمام */}
                    {visibleColumns.membership_type && (
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center font-mono text-xs font-black px-2 py-0.5 rounded-lg ${
                          m.joiningMechanism === "معين"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : m.joiningMechanism === "مرشح"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : m.joiningMechanism === "مشارك"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}>
                          {m.joiningMechanism === "ممثل لجهة حكومية" && m.govAgency ? `ممثل ${m.govAgency}` : (m.joiningMechanism || "مرشح")}
                        </span>
                      </td>
                    )}

                    {/* تاريخ الانضمام */}
                    {visibleColumns.joined_date && (
                      <td className="px-2 py-2 whitespace-nowrap text-center font-bold text-gray-600 text-xs font-mono">
                        {m.joinedDate}
                      </td>
                    )}

                    {/* الحالة */}
                    {visibleColumns.status && (
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                          m.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {m.active ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                    )}

                    {/* المرفقات */}
                    {visibleColumns.attachments && (
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        {missingDocs === 0 ? (
                           <span className="inline-flex items-center justify-center font-mono text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                             مكتملة
                           </span>
                        ) : (
                           <span className="inline-flex items-center justify-center font-mono text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200" title={`نواقص: ${requiredDocs.filter(d => !d.has).map(d => d.name).join(', ')}`}>
                             نواقص ({missingDocs})
                           </span>
                        )}
                      </td>
                    )}

                    {/* الإجراءات */}
                    <td className="px-2 py-2 text-center relative whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 relative dropdown-container">
                        <button
                          onClick={() => setActiveGearMenuId(activeGearMenuId === m.id ? null : m.id)}
                          className="p-1.5 hover:bg-gray-150 text-gray-650 hover:text-gray-900 rounded-lg border border-transparent hover:border-gray-350 transition-all cursor-pointer"
                          title="الإجراءات"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        {activeGearMenuId === m.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={() => setActiveGearMenuId(null)} 
                            />
                            <div className="absolute left-2 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-150 py-1 z-40 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailsMember(m);
                                  setActiveGearMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-slate-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                              >
                                <span>عرض السجل</span>
                                <FileText className="w-3.5 h-3.5 text-brand" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(m)}
                                className="w-full px-3 py-2 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                              >
                                <span>تعديل العضو</span>
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(m)}
                                className="w-full px-3 py-2 text-xs font-black text-red-650 hover:bg-red-50 flex items-center justify-end gap-2 transition-colors cursor-pointer"
                              >
                                <span>حذف العضو</span>
                                <Trash2 className="w-3.5 h-3.5 text-red-650" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODAL: ADD / EDIT MEMBER (إضافة وتعديل بيانات عضو) */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right flex flex-col max-h-[90vh]"
            >
              {/* Form header */}
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {editingMember ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {editingMember ? `تعديل ملف العضو في اللجان` : "ملف عضو لجنة جديد"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">سجل بيانات العضو بدقة واربطه باللجنة لتحقيق حوكمة السجلات</p>
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

              {/* Form body container */}
              <div className="overflow-y-auto p-6">
                {showSuccessPrompt ? (
                  <div className="py-12 px-6 text-center space-y-6 flex flex-col items-center justify-center animate-fadeIn">
                    <div className="w-16 h-16 bg-emerald-55 text-emerald-600 rounded-full flex items-center justify-center shadow-inner border border-emerald-100">
                      <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-gray-900">تمت إضافة العضو بنجاح!</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        تم تسجيل بيانات العضو الجديد وربطه باللجنة بنجاح في قاعدة البيانات الحية.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-4">
                      <button
                        type="button"
                        onClick={handleAddNewMemberPrompt}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>إضافة عضو آخر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddOpen(false);
                          setShowSuccessPrompt(false);
                        }}
                        className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-755 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>حفظ وإنهاء</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-black rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Title and Name Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* اللقب */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">اللقب *</label>
                    <select
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (e.target.value !== "غير ذلك") {
                          setCustomTitle("");
                        }
                      }}
                      className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      {TITLES.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* الاسم الثلاثي */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">الاسم الرباعي*</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: صالح بن محمد حسن السفياني"
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Custom Title manual writing box */}
                {title === "غير ذلك" && (
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-black text-blue-800 block">يرجى الاختيار*</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="مثال: الشيخ، المستشار، سعادة"
                      className="w-full h-9 px-3 bg-white border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Committee selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-500 block">اللجنة*</label>
                  <select
                    value={selectedCommitteeId}
                    onChange={(e) => setSelectedCommitteeId(Number(e.target.value))}
                    className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value={0}>يرجى اختيار اللجنة</option>
                    {allCommittees.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Role (Capacity) selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">الصفة*</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-black"
                    >
                      {ROLE_CAPACITIES.map((r, idx) => (
                        <option key={idx} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Joining Mechanism */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">آلية الانضمام*</label>
                    <select
                      value={joiningMechanism}
                      onChange={(e) => {
                        setJoiningMechanism(e.target.value);
                        if (e.target.value !== "ممثل لجهة حكومية") {
                          setGovAgency("");
                        }
                      }}
                      className="w-full h-10 px-2 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      {JOINING_MECHANISMS.map((m, idx) => (
                        <option key={idx} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom gov agency manual writing box */}
                {joiningMechanism === "ممثل لجهة حكومية" && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-black text-amber-800 block">اسم الجهة الحكومية الممثلة*</label>
                    <input
                      type="text"
                      value={govAgency}
                      onChange={(e) => setGovAgency(e.target.value)}
                      placeholder="مثال: وزارة السياحة، أمانة العاصمة المقدسة"
                      className="w-full h-9 px-3 bg-white border border-amber-250 rounded-xl text-xs font-bold text-right focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>
                )}

                {/* Contact Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">رقم الجوال*</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="مثال: 966501234567"
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-left focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">البريد الإلكتروني*</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g.member@mcci.sa"
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-left focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner font-mono"
                    />
                  </div>
                </div>

                {/* Identification and date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">رقم الهوية الوطنية / رقم الإقامة *</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="مكون من 10 خانات"
                      maxLength={10}
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-left focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-500 block">تاريخ الانضمام</label>
                    <input
                      type="date"
                      value={joinedDate}
                      onChange={(e) => setJoinedDate(e.target.value)}
                      className="w-full h-10 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold text-center focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-mono"
                    />
                  </div>
                </div>

                {/* Membership Status (نشط - غير نشط) */}
                <div className="space-y-1.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="text-[11px] font-black text-gray-500 block">حالة العضوية</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className={`h-11 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                        isActive
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
                      <span>نشط</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={`h-11 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                        !isActive
                          ? "bg-rose-100 text-rose-800 border-rose-300 shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                      <span>غير نشط</span>
                    </button>
                  </div>
                </div>

                {/* Desktop Attachments Area */}
                <div className="space-y-2.5 p-4 bg-slate-50 rounded-3xl border border-gray-200">
                  <h4 className="text-xs font-extrabold text-gray-700 flex items-center gap-1 pb-1 border-b border-gray-200">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span>المرفقات</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <AttachmentInput
                      id="photo"
                      label="الصورة الشخصية"
                      value={personalPhoto}
                      onChange={setPersonalPhoto}
                    />
                    <AttachmentInput
                      id="cv"
                      label="السيرة الذاتية"
                      value={cv}
                      onChange={setCv}
                    />
                    <AttachmentInput
                      id="cr"
                      label="السجل التجاري"
                      value={commercialRegister}
                      onChange={setCommercialRegister}
                    />
                    <AttachmentInput
                      id="certificate"
                      label="شهادة العضوية"
                      value={membershipCertificate}
                      onChange={setMembershipCertificate}
                    />
                  </div>
                  
                  <div className="pt-1.5">
                    <AttachmentInput
                      id="auth"
                      label="مستند التفويض والتمثيل"
                      value={authorization}
                      onChange={setAuthorization}
                    />
                  </div>
                </div>

                {/* Optional additional notes */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-500 block">نبذة وملاحظات عن مساهمته وأعماله</label>
                  <textarea
                    style={{ width: "610px", height: "70px" }}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثال: يمتلك العضو خلفيات علمية مميزة، يشارك في إعداد وصياغة التقارير التشغيلية..."
                    className="p-3 bg-gray-50 border border-gray-250 rounded-2xl text-xs font-semibold text-right focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Mandatory Edit reason for auditing audit */}
                {editingMember && (
                  <div className="p-3.5 bg-yellow-50 border border-yellow-250 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1 text-xs font-black text-yellow-850">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>تبرير تعديل بيانات الملف *</span>
                    </div>
                    <input
                      type="text"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      placeholder="امثلة: تعديل اللجان، تحديث خطة التواصل، تعديل المسمى الوظيفي..."
                      className="w-full h-9 px-3 bg-white border border-gray-250 rounded-xl text-xs font-bold text-right focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none"
                    />
                  </div>
                )}

                {/* Form footer buttons inside form */}
                <div className="bg-gray-55 px-1 pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="px-5 h-10 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{editingMember ? "تحديث السجل" : "اعتماد العضو"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-5 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    إلغاء الأمر
                  </button>
                </div>
              </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MODAL: DELETE CONFIRMATION SYSTEM */}
      <AnimatePresence>
        {deletingMember && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMember(null)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-150 relative overflow-hidden z-10 text-right p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 text-red-650 rounded-2xl flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-650" />
                </div>
                <div className="space-y-1 text-right">
                  <h3 className="font-extrabold text-gray-900 text-base">إلغاء اعتماد ملف عضوية</h3>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    هل أنت متأكد من رغبتك في حذف العضو <strong className="text-gray-900 font-black">{getMemberFullName(deletingMember)}</strong> بشكل نهائي من سجل اللجان؟ هذا الإجراء سيقوم بإزالة كامل ملف التواصل التاريخي.
                  </p>
                </div>
              </div>

              {/* Delete details reasoning input */}
              <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-2xl space-y-2">
                <label className="text-[10px] font-black text-red-800 block">سبب الحذف*</label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="مثال: انتهاء فترة التمثيل، ترقية وظيفية، تغيير الممثل الإداري للجهة..."
                  className="w-full h-9 px-3 bg-white border border-red-200 rounded-xl text-xs font-bold text-right focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>

              {/* Interactive confirmation action triggers */}
              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={!deleteReason.trim()}
                  className={`px-5 h-10 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
                    deleteReason.trim()
                      ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                      : "bg-red-300 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد الإزالة والأرشفة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingMember(null)}
                  className="px-5 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  التراجع عن الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL: MEMBER DETAILS PORTAL (عرض السجل) */}
      <AnimatePresence>
        {detailsMember && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Blurring viewport overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailsMember(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body Card with spring bounce animation */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-150 relative overflow-hidden z-10 text-right font-sans"
            >
              {/* Header profile panel */}
              <div className="bg-[#e8e4e4] p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-[#4ea0b0] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-brand/20">
                    {getMemberInitials(detailsMember.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-gray-900 text-sm leading-tight md:text-base">
                        {detailsMember.title && detailsMember.title !== "غير ذلك" ? `${detailsMember.title} ` : ""}
                        {detailsMember.title === "غير ذلك" && detailsMember.customTitle ? `${detailsMember.customTitle} ` : ""}
                        {detailsMember.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black ${
                        detailsMember.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${detailsMember.active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {detailsMember.active ? "نشط" : "مؤرشف"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-extrabold mt-1.5 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#4ea0b0] inline-block" />
                      <span>{detailsMember.role} - {detailsMember.membershipType}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailsMember(null)}
                  className="p-1.5 hover:bg-gray-200/55 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Core detailed parameters */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                
                {/* Linked Committee display block */}
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase block">اللجنة</span>
                  <div className="bg-gradient-to-l from-brand/5 to-[#4ea0b0]/5 border border-[#d2cece] rounded-2xl p-4 flex items-center gap-3 shadow-inner">
                    <div className="p-2 h-10 w-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                      <Users2 className="w-5 h-5 text-brand" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[10px] text-gray-400 font-black block leading-none">اللجنة</span>
                      <p className="text-xs font-black text-gray-900 mt-1 truncate">{detailsMember.committeeName}</p>
                    </div>
                  </div>
                </div>

                {/* Grid info stats parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-black block leading-none">جهة التمثيل</span>
                      <span className="text-xs font-extrabold text-[#1b5d6c] block mt-1 leading-snug">
                        {detailsMember.joiningMechanism === "ممثل لجهة حكومية" && detailsMember.govAgency
                          ? detailsMember.govAgency
                          : detailsMember.entity}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-black block leading-none">تاريخ الانضمام</span>
                      <span className="text-xs font-extrabold text-gray-800 block mt-1 font-mono">{detailsMember.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-black block leading-none">الهوية الوطنية / الإقامة</span>
                      <span className="text-xs font-extrabold text-gray-800 block mt-1 font-mono">{detailsMember.nationalId || "غير مسجل"}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-black block leading-none">آلية الانضمام</span>
                      <span className="text-xs font-extrabold text-gray-800 block mt-1">{detailsMember.joiningMechanism === "ممثل لجهة حكومية" && detailsMember.govAgency ? `ممثل ${detailsMember.govAgency}` : (detailsMember.joiningMechanism || "مرشح")}</span>
                    </div>
                  </div>
                </div>

                {/* Contact information details */}
                <div className="border border-gray-150 rounded-2xl p-4 bg-white space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 border-b border-gray-100 pb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand/70" />
                    <span>التواصل</span>
                  </h4>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-xs font-bold text-gray-700">{detailsMember.email}</span>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(detailsMember.email)}
                      className="text-[10px] text-brand font-black hover:underline cursor-pointer bg-slate-50 border border-gray-200 px-2 py-0.5 rounded-lg"
                    >
                      نسخ البريد
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 border-t border-gray-55">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-xs font-bold text-gray-700">{formatPhoneNumber(detailsMember.phone)}</span>
                    </div>
                    <a 
                      href={`tel:${detailsMember.phone}`}
                      className="text-[10px] text-brand font-black hover:underline px-2 py-0.5 rounded-lg bg-slate-50 border border-gray-200"
                    >
                      اتصال هاتفى
                    </a>
                  </div>
                </div>

                {/* Document attachments rendering */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-2">
                  <h4 className="text-[10px] font-black text-gray-550 border-b border-gray-250 pb-1.5 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                    <span>المستندات والمرفقات</span>
                  </h4>
                  
                  <div className="divide-y divide-gray-200 text-xs">
                    {/* Photo */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] font-bold text-gray-650">الصورة الشخصية</span>
                      {detailsMember.personalPhoto ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">{detailsMember.personalPhoto}</span>
                          <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">عرض</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}
                    </div>

                    {/* CV */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] font-bold text-gray-650">السيرة الذاتية</span>
                      {detailsMember.cv ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">{detailsMember.cv}</span>
                          <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">تحميل السجل</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}
                    </div>

                    {/* Commercial Register */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] font-bold text-gray-650">السجل التجاري</span>
                      {detailsMember.commercialRegister ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">{detailsMember.commercialRegister}</span>
                          <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">تحميل السجل</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}
                    </div>

                    {/* Certificate */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] font-bold text-gray-650">شهادة العضوية</span>
                      {detailsMember.membershipCertificate ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">{detailsMember.membershipCertificate}</span>
                          <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">عرض المستند</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}
                    </div>

                    {/* Authorization */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] font-bold text-gray-650">مستند التفويض</span>
                      {detailsMember.authorization ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">{detailsMember.authorization}</span>
                          <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">عرض المستند</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scribing notes field */}
                {detailsMember.note && (
                  <div className="p-3.5 bg-yellow-50/40 border border-[#e2dcdc] rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-gray-400 block uppercase">ملاحظات وقدرات العضو</span>
                    <p className="text-xs text-gray-700 font-bold leading-relaxed">{detailsMember.note}</p>
                  </div>
                )}

              </div>

              {/* Footer controls */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEdit(detailsMember);
                      setDetailsMember(null);
                    }}
                    className="h-10 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل الملف</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenDelete(detailsMember);
                      setDetailsMember(null);
                    }}
                    className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف العضو</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailsMember(null)}
                  className="px-5 h-10 bg-gray-200 hover:bg-gray-300 text-gray-750 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  إغلاق السجل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
