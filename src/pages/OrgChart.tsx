import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  UserCheck, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Briefcase, 
  Activity, 
  ArrowRightLeft, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  ChevronDown, 
  Lock, 
  Sparkles,
  Calendar,
  Layers,
  FileText,
  Printer,
  Database,
  FolderLock
} from "lucide-react";
import { useFirestoreCollection } from "../lib/firebaseUtils";
import GoogleWorkspaceCenter from "../components/GoogleWorkspaceCenter";

// AVATAR PRESETS - Professional placeholders for visual ease
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200", // Male 1
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", // Female 1
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200", // Male 2
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200", // Female 2
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", // Male 3
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", // Female 3
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", // Male 4
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", // Female 4
];

const compressImage = (base64Str: string, callback: (resized: string) => void) => {
  if (!base64Str || !base64Str.startsWith("data:image")) {
    callback(base64Str);
    return;
  }
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const MAX_WIDTH = 120;
    const MAX_HEIGHT = 120;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        callback(dataUrl);
      } catch (e) {
        console.error("Canvas export failed", e);
        callback(base64Str);
      }
    } else {
      callback(base64Str);
    }
  };
  img.onerror = () => {
    callback(base64Str);
  };
};

export interface Employee {
  id: string; // الرقم الوظيفي
  name: string; // الاسم
  role: "SYS_ADMIN" | "DEPT_HEAD" | "MANAG_DIR" | "SPECIALIST"; // الدور الصلاحيتي
  roleAr: string; // الدور بالعربية
  jobTitle: string; // المسمى الوظيفي
  phone: string; // رقم الجوال
  extension?: string; // رقم التحويلة
  email: string; // البريد الإلكتروني
  photo: string; // صورة الموظف
  committees: string[]; // اللجان المخصصة
  active: boolean; // حالة الموظف (فعال / غير فعال)
  joinDate: string; // تاريخ التعيين
  password?: string; // كلمة المرور
  allowedPages?: string[]; // الصفحات المصرح بها
}

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  requestedRole: string;
  requestedRoleAr: string;
  requestDate: string;
}

export interface ApprovedEmail {
  id: string;
  email: string;
  name: string;
  roleAr: string;
  approvedBy: string;
  approvedDate: string;
}

export interface SystemLog {
  id: string;
  employeeName: string;
  time: string;
  operationType: string;
  status: "ناجحة" | "مرفوضة";
  details: string;
}

export default function OrgChart() {
  const [activeTab, setActiveTab] = useState<"hierarchy" | "transfer" | "approvals" | "logs" | "permissions" | "master_data">("hierarchy");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Local state for administrative master data console
  const [selectedSubCol, setSelectedSubCol] = useState<string>("committees");
  const [masterSearchQuery, setMasterSearchQuery] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCol, setConfirmDeleteCol] = useState<string | null>(null);

  // Find current user's role
  const getLoggedInUser = () => {
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return null;
  };
  const currentUser = getLoggedInUser();
  const currentUserRole = currentUser?.role || "SPECIALIST";

  // Load state and collections from Firestore / offline sandbox
  const { data: dbEmployees, addDocument: addFirebaseEmp, updateDocument: updateFirebaseEmp, deleteDocument: deleteFirebaseEmp } = useFirestoreCollection<Employee>("employees", []);
  const { data: dbJoinRequests, deleteDocument: deleteFirebaseReq } = useFirestoreCollection<JoinRequest>("join_requests", []);
  const { data: dbApprovedEmails, addDocument: addFirebaseAppr, deleteDocument: deleteFirebaseAppr } = useFirestoreCollection<ApprovedEmail>("approved_emails", []);
  const { data: dbSystemLogs, addDocument: addFirebaseLog } = useFirestoreCollection<SystemLog>("system_logs", []);
  
  // Auxiliary collections to facilitate deep background transfer and comprehensive administrator control console
  const { data: dbCommittees, updateDocument: updateFirebaseComm, deleteDocument: deleteFirebaseComm } = useFirestoreCollection<any>("committees", []);
  const { data: dbTasks, updateDocument: updateFirebaseTask, deleteDocument: deleteFirebaseTask } = useFirestoreCollection<any>("tasks", []);
  const { data: dbEvents, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<any>("events", []);
  const { data: dbRecommendations, updateDocument: updateFirebaseRec, deleteDocument: deleteFirebaseRec } = useFirestoreCollection<any>("recommendations", []);
  const { data: dbMembers, updateDocument: updateFirebaseMember, deleteDocument: deleteFirebaseMember } = useFirestoreCollection<any>("members", []);

  const { data: dbReports, deleteDocument: deleteFirebaseReport } = useFirestoreCollection<any>("reports", []);
  const { data: dbKpis, deleteDocument: deleteFirebaseKpi } = useFirestoreCollection<any>("kpis", []);
  const { data: dbTemplates, deleteDocument: deleteFirebaseTemplate } = useFirestoreCollection<any>("templates", []);

  useEffect(() => {
    if (dbEmployees && dbEmployees.length > 0) {
      localStorage.setItem("app_employees", JSON.stringify(dbEmployees));
    }
  }, [dbEmployees]);

  const safeDbEmployees = React.useMemo(() => {
    const isMaster = currentUser && (currentUser.email?.trim().toLowerCase() === "khalafshehab@gmail.com" || currentUser.email?.trim().toLowerCase() === "khalafshehab-crypto@gmail.com");
    if (isMaster) {
      return dbEmployees;
    }
    return dbEmployees.filter(emp => 
      emp && 
      emp.id !== "01" && 
      emp.id !== "1" &&
      emp.name !== "شهاب الدين" && 
      emp.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
      emp.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
    );
  }, [dbEmployees, currentUser]);

  const masterFilteredData = React.useMemo(() => {
    const term = masterSearchQuery.trim().toLowerCase();
    let source: any[] = [];
    if (selectedSubCol === "committees") source = dbCommittees || [];
    else if (selectedSubCol === "members") source = dbMembers || [];
    else if (selectedSubCol === "events") source = dbEvents || [];
    else if (selectedSubCol === "recommendations") source = dbRecommendations || [];
    else if (selectedSubCol === "tasks") source = dbTasks || [];
    else if (selectedSubCol === "reports") source = dbReports || [];
    else if (selectedSubCol === "kpis") source = dbKpis || [];
    else if (selectedSubCol === "templates") source = dbTemplates || [];

    if (!term) return source;
    return source.filter((item) => {
      if (!item) return false;
      try {
        const strToSearch = JSON.stringify(item).toLowerCase();
        return strToSearch.includes(term);
      } catch (_) {
        return false;
      }
    });
  }, [selectedSubCol, masterSearchQuery, dbCommittees, dbMembers, dbEvents, dbRecommendations, dbTasks, dbReports, dbKpis, dbTemplates]);

  const handleDeleteMasterItem = async (itemId: string, collectionName: string) => {
    try {
      if (!itemId) return;
      if (collectionName === "committees") {
        await deleteFirebaseComm(itemId);
      } else if (collectionName === "members") {
        await deleteFirebaseMember(itemId);
      } else if (collectionName === "events") {
        await deleteFirebaseEvent(itemId);
      } else if (collectionName === "recommendations") {
        await deleteFirebaseRec(itemId);
      } else if (collectionName === "tasks") {
        await deleteFirebaseTask(itemId);
      } else if (collectionName === "reports") {
        await deleteFirebaseReport(itemId);
      } else if (collectionName === "kpis") {
        await deleteFirebaseKpi(itemId);
      } else if (collectionName === "templates") {
        await deleteFirebaseTemplate(itemId);
      }

      // Add a clean log to the audit log tracker
      await addFirebaseLog({
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        employeeName: currentUser?.name || "مدير النظام",
        operationType: "حذف إداري شامل",
        status: "ناجحة",
        details: `قام مدير النظام بحذف سجل ذو المعرف (${itemId}) نهائياً من مستوعب (${collectionName})`
      });

      // Clear state
      setConfirmDeleteId(null);
      setConfirmDeleteCol(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMasterCommitteesActive = async (item: any) => {
    try {
      if (!item || !item.id) return;
      const nextActive = item.active === false ? true : false;
      await updateFirebaseComm(item.id, { active: nextActive });
      
      await addFirebaseLog({
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        employeeName: currentUser?.name || "مدير النظام",
        operationType: "تعديل حالة لجنة",
        status: "ناجحة",
        details: `قام مدير النظام بتغيير حالة فاعلية لجنة (${item.name}) إلى (${nextActive ? 'نشطة' : 'غير نشطة'})`
      });
    } catch (_) {}
  };

  // UI state for search, filters, modals, and actions
  const [searchTerm, setSearchTerm] = useState("");
  const [permSearchTerm, setPermSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Administrative removal of raw committees linked to a specific specialist (تحت الإشراف حذف اللجان المرتبط بها)
  const handleRemoveCommitteeFromEmployee = async (committeeName: string) => {
    if (!selectedEmployee) return;
    const currentComms = selectedEmployee.committees || [];
    const updatedComms = currentComms.filter(c => c !== committeeName);
    
    try {
      await updateFirebaseEmp(selectedEmployee.id, { committees: updatedComms });
      
      // Update any physical committee record matching this to set specialist to unassigned or empty
      const matchedComm = dbCommittees.find(c => c.name === committeeName);
      if (matchedComm) {
        await updateFirebaseComm(matchedComm.id, {
          specialistId: "",
          specialistName: "غير معين"
        });
      }

      // Document this removal in System Logs catalog for audit checks
      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        operationType: "حذف لجنة مرتبطة بالمشرف",
        status: "ناجحة",
        details: `تم إلغاء ارتباط اللجنة: (${committeeName}) من ملف الموظف: ${selectedEmployee.name}`
      } as any);
      
      setSelectedEmployee({
        ...selectedEmployee,
        committees: updatedComms
      });
    } catch (error) {
      console.error("Failed to unbind committee from staff", error);
    }
  };
  
  // Add / Edit Modal fields state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<"SYS_ADMIN" | "DEPT_HEAD" | "MANAG_DIR" | "SPECIALIST">("SPECIALIST");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formExtension, setFormExtension] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhoto, setFormPhoto] = useState(PRESET_AVATARS[0]);
  const [formActive, setFormActive] = useState(true);
  const [formPassword, setFormPassword] = useState("");
  const [formCommittees, setFormCommittees] = useState<string[]>([]);
  const [formAllowedPages, setFormAllowedPages] = useState<string[]>([]);
  const [originalEditId, setOriginalEditId] = useState("");

  // Restrict tabs for non-SYS_ADMIN users
  useEffect(() => {
    if (currentUserRole !== "SYS_ADMIN" && activeTab !== "hierarchy") {
      setActiveTab("hierarchy");
    }
  }, [currentUserRole, activeTab]);

  // Safe duplicates detection: log warnings in console but do NOT delete silently to avoid asynchronous race conditions during updates
  useEffect(() => {
    if (dbEmployees && dbEmployees.length > 0) {
      const emailGroups: Record<string, Employee[]> = {};
      dbEmployees.forEach(emp => {
        if (emp.email) {
          const emailLower = emp.email.trim().toLowerCase();
          if (!emailGroups[emailLower]) {
            emailGroups[emailLower] = [];
          }
          emailGroups[emailLower].push(emp);
        }
      });

      Object.entries(emailGroups).forEach(([email, list]) => {
        if (list.length > 1) {
          console.warn(`تنبيه: يوجد حساب مكرر بنفس البريد الإلكتروني [${email}] للبطاقات ذات المعرفات: ${list.map(e => e.id).join(', ')}`);
        }
      });
    }
  }, [dbEmployees]);
  
  // Whitelist Email state fields
  const [whitelistEmailStr, setWhitelistEmailStr] = useState("");
  const [whitelistNameStr, setWhitelistNameStr] = useState("");
  const [whitelistRoleAr, setWhitelistRoleAr] = useState("أخصائي لجان");

  // Transfer states
  const [sourceEmpId, setSourceEmpId] = useState("");
  const [targetEmpId, setTargetEmpId] = useState("");
  const [transferCommittees, setTransferCommittees] = useState(true);
  const [transferTasks, setTransferTasks] = useState(true);
  const [transferEvents, setTransferEvents] = useState(true);
  const [transferRecs, setTransferRecs] = useState(true);
  const [transferSuccess, setTransferSuccess] = useState("");
  const [transferError, setTransferError] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Database Purge / Reset State & Logic
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [purgeError, setPurgeError] = useState("");

  const handlePurgeEntireSystem = async () => {
    setIsPurging(true);
    setPurgeError("");
    try {
      const collectionsToPurge = [
        "committees",
        "members",
        "events",
        "recommendations",
        "tasks",
        "system_logs",
        "templates",
        "kpis",
        "reports",
        "join_requests",
        "approved_emails"
      ];

      const { collection, getDocs, deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      // 1. Clear standard collections in Firestore
      for (const colName of collectionsToPurge) {
        try {
          const snap = await getDocs(collection(db, colName));
          for (const docSnap of snap.docs) {
            await deleteDoc(doc(db, colName, docSnap.id));
          }
        } catch (err) {
          console.warn(`Failed to purge Firestore collection: ${colName}`, err);
        }
        
        // Wipe local fallbacks/storage
        localStorage.removeItem(`mock_db_${colName}`);
        localStorage.removeItem(`app_${colName}`);
      }

      // 2. Clear employees except the system admin
      try {
        const empSnap = await getDocs(collection(db, "employees"));
        for (const docSnap of empSnap.docs) {
          const d = docSnap.data();
          const lowerEmail = d?.email?.trim().toLowerCase();
          const isSysAdmin = lowerEmail === "khalafshehab@gmail.com" || lowerEmail === "khalafshehab-crypto@gmail.com" || docSnap.id === "01";
          if (!isSysAdmin) {
            await deleteDoc(doc(db, "employees", docSnap.id));
          }
        }
      } catch (err) {
        console.warn("Failed to purge Firestore employees collection", err);
      }

      localStorage.removeItem(`mock_db_employees`);
      localStorage.removeItem(`app_employees`);
      localStorage.removeItem("app_deleted_templates");
      localStorage.removeItem("app_ignored_alarms_timestamps");
      localStorage.removeItem("app_custom_recommendations_alarms");
      localStorage.removeItem("app_recommendations_custom");
      localStorage.removeItem("app_member_columns_v2");

      setPurgeSuccess(true);
      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        operationType: "تهيئة النظام بالكامل",
        status: "ناجحة",
        details: "قام مدير النظام بتهيئة وتصفير قاعدة البيانات بالكامل وتطهير التخزين المؤقت."
      } as any);

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (e) {
      console.error("Purge action failed:", e);
      setPurgeError("حدث خطأ أثناء محاولة تصفير قاعدة البيانات سحابياً. يرجى المحاولة لاحقاً.");
    } finally {
      setIsPurging(false);
    }
  };

  // 1. Approve Join Request (اعتماد طلبات الانضمام)
  const handleApproveJoinRequest = async (req: JoinRequest) => {
    try {
      const emailLower = req.email.trim().toLowerCase();

      // Enforce email uniqueness
      const emailTaken = dbEmployees.some(emp => emp.email?.trim().toLowerCase() === emailLower);
      if (emailTaken) {
        alert(`عذراً، البريد الإلكتروني [${req.email}] مأخوذ مسبقاً لموظف آخر في النظام.`);
        return;
      }

      // Generate a unique 4-digit employee ID
      let parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      while (dbEmployees.some(emp => emp.id === parsedId)) {
        parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      }
      
      const payload: Omit<Employee, "id"> = {
        name: req.name,
        role: "SPECIALIST",
        roleAr: "أخصائي اللجان",
        jobTitle: "أخصائي لجان",
        phone: req.phone,
        email: emailLower,
        photo: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        committees: [],
        active: true,
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      // Set document with generated custom employee number as Firestore ID
      await updateFirebaseEmp(parsedId, payload);
      
      // Delete join request
      await deleteFirebaseReq(req.id);

      // Audit log
      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "ناجحة",
        operationType: "قبول طلب انضمام",
        details: `تمت الموافقة على طلب انضمام الموظف ${req.name} بالبريد ${req.email} برقم وظيفي [${parsedId}]`
      } as any);

      alert(`تمت الموافقة بنجاح وتم توليد رقم وظيفي مؤقت للموظف: ${parsedId}`);
    } catch (error) {
      console.error(error);
      alert("فشل في اعتماد طلب الانضمام. يرجى المحاولة لاحقاً.");
    }
  };

  const handleRejectJoinRequest = async (req: JoinRequest) => {
    if (!window.confirm(`هل أنت متأكد من رفض طلب الموظف: ${req.name}؟`)) return;
    try {
      await deleteFirebaseReq(req.id);

      // Audit log
      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "ناجحة",
        operationType: "رفض طلب انضمام",
        details: `تم رفض وإلغاء طلب انضمام الموظف ${req.name} بالبريد ${req.email}`
      } as any);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Add email to approved Whitelist (إضافة للبريد المسموح)
  const handleAddWhitelistEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistEmailStr.trim() || !whitelistNameStr.trim()) {
      alert("يرجى إدخال اسم الموظف والبريد الإلكتروني.");
      return;
    }
    const cleanEmail = whitelistEmailStr.trim().toLowerCase();
    try {
      await addFirebaseAppr({
        email: cleanEmail,
        name: whitelistNameStr.trim(),
        roleAr: whitelistRoleAr,
        approvedBy: currentUser?.name || "مدير النظام",
        approvedDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      });

      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "ناجحة",
        operationType: "إضافة للبريد المسموح Whitelist",
        details: `تمت إضافة بريد الموظف ${whitelistNameStr} (${cleanEmail}) للبريد المسموح بالنظام لتعيين دور: ${whitelistRoleAr}`
      } as any);

      setWhitelistEmailStr("");
      setWhitelistNameStr("");
      alert("تمت إضافة الموظف لقائمة البريد المعتمد بنجاح.");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveWhitelistEmail = async (appId: string, email: string) => {
    if (!window.confirm("هل أنت متأكد من إلغاء اعتماد هذا البريد؟")) return;
    try {
      await deleteFirebaseAppr(appId);
      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "ناجحة",
        operationType: "حذف من البريد المسموح Whitelist",
        details: `تم إلغاء اعتماد الموظف ذو البريد ${email} من قائمة البريد المسموح`
      } as any);
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Save Employee (حفظ بيانات الموظف) - Self and Admin editing logic combined
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      alert("يرجى تعبئة كافة الحقول الأساسية لبطاقة الموظف.");
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const isSysAdmin = currentUserRole === "SYS_ADMIN";
    const isPowerUser = isSysAdmin || currentUserRole === "MANAG_DIR" || currentUserRole === "DEPT_HEAD";

    // Security Gate check
    if (!isPowerUser) {
      if (!isEditing) {
        alert("عذراً، لا تملك صلاحية لإضافة موظفين جدد للنظام.");
        return;
      }
      const myEmp = dbEmployees.find(emp => emp.id === currentUser?.id || emp.email?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase());
      if (originalEditId !== currentUser?.id && !(myEmp && originalEditId === myEmp.id)) {
        alert("عذراً، تملك فقط الصلاحية لتحديث بيانات بطاقتك الشخصية فقط.");
        return;
      }
    }

    try {
      const existingEmployee = dbEmployees.find(emp => 
        (originalEditId && emp.id === originalEditId) || 
        emp.email?.trim().toLowerCase() === cleanEmail
      );

      const targetEditId = existingEmployee ? existingEmployee.id : originalEditId;

      // ROLE MAPPER
      const roleMapper: Record<string, string> = {
        SYS_ADMIN: "مدير النظام",
        MANAG_DIR: "مدير إدارة اللجان",
        DEPT_HEAD: "رئيس قسم اللجان",
        SPECIALIST: "أخصائي اللجان"
      };

      // Construction of strict payload: if not Admin/PowerUser, merge existing critical access fields directly
      // This protects the Specialist from losing email, active stance, or role privileges during self-updates
      const payload: Omit<Employee, "id"> = {
        name: formName.trim(),
        role: isPowerUser ? formRole : (existingEmployee?.role || "SPECIALIST"),
        roleAr: isPowerUser ? (roleMapper[formRole] || "أخصائي اللجان") : (existingEmployee?.roleAr || "أخصائي اللجان"),
        jobTitle: formJobTitle.trim() || (isPowerUser ? (roleMapper[formRole] || "أخصائي لجان") : (existingEmployee?.jobTitle || "أخصائي لجان")),
        phone: formPhone.trim(),
        extension: formExtension.trim(),
        email: isEditing && existingEmployee ? existingEmployee.email : cleanEmail, // البريد الإلكتروني هو معرف الحساب ولا يمكن تعديله لضمان عدم الخروج
        photo: formPhoto,
        active: isPowerUser ? formActive : (existingEmployee ? existingEmployee.active : true), // Lock active state
        committees: formCommittees,
        allowedPages: isPowerUser ? formAllowedPages : (existingEmployee?.allowedPages || []),
        password: formPassword.trim() || (existingEmployee?.password || ""),
        joinDate: existingEmployee?.joinDate || new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      if (isEditing) {
        // Did the ID change? (Only allowed for system admins / power users)
        if (formId !== targetEditId) {
          if (!isPowerUser) {
            alert("عذراً، الرقم الوظيفي غير قابل للتعديل.");
            return;
          }
          // Enforce uniqueness
          const IDTaken = dbEmployees.some(emp => emp.id === formId);
          if (IDTaken) {
            alert(`الرقم الوظيفي الجديد [${formId}] مستعمل بالفعل من قبل موظف آخر.`);
            return;
          }

          // Transact new ID write and delete old one
          await updateFirebaseEmp(formId, payload);
          await deleteFirebaseEmp(targetEditId);

          // Update any committees supervised by targetEditId to use the new formId
          const assignedComms = dbCommittees.filter(c => c.specialistId === targetEditId);
          for (const c of assignedComms) {
            await updateFirebaseComm(c.id, { specialistId: formId });
          }
        } else {
          // Normal merge/update under existing ID
          await updateFirebaseEmp(targetEditId, payload);
        }

        // Bidirectional sync for committees
        for (const comm of dbCommittees) {
          if (formCommittees.includes(comm.name)) {
            if (comm.specialist !== formName) {
              await updateFirebaseComm(comm.id, { specialist: formName });
            }
          } else if (comm.specialist === formName || (existingEmployee && comm.specialist === existingEmployee.name)) {
            await updateFirebaseComm(comm.id, { specialist: "غير محدد" });
          }
        }

        // Deep synchronization if modifying the active session
        const storedUser = localStorage.getItem("current_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.id === targetEditId || parsed.email?.trim().toLowerCase() === cleanEmail)) {
            const updatedUser = { ...payload, id: formId };
            localStorage.setItem("current_user", JSON.stringify(updatedUser));
            
            // Dispatch reactive storage cross tab update so UI updates immediately
            window.dispatchEvent(new Event("storage"));
          }
        }

        await addFirebaseLog({
          employeeName: currentUser?.name || "مدير النظام",
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: "ناجحة",
          operationType: "تعديل بطاقة موظف",
          details: `تم تعديل وتحديث بيانات الموظف ${formName} برقم وظيفي [${formId}]`
        } as any);

        alert("تم حفظ وتحديث بيانات الموظف بنجاح.");
      } else {
        // Strict system administrator creation block
        const IDTaken = dbEmployees.some(emp => emp.id === formId);
        if (IDTaken) {
          alert(`الرقم الوظيفي [${formId}] مأخوذ مسبقاً لموظف آخر.`);
          return;
        }

        const emailTaken = dbEmployees.some(emp => emp.email?.trim().toLowerCase() === cleanEmail);
        if (emailTaken) {
          alert(`البريد الإلكتروني [${cleanEmail}] مستخدم بالفعل من قبل موظف آخر في النظام.`);
          return;
        }

        await updateFirebaseEmp(formId, payload);

        // Bidirectional sync for committees on create
        for (const comm of dbCommittees) {
          if (formCommittees.includes(comm.name)) {
            if (comm.specialist !== formName) {
              await updateFirebaseComm(comm.id, { specialist: formName });
            }
          }
        }

        await addFirebaseLog({
          employeeName: currentUser?.name || "مدير النظام",
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: "ناجحة",
          operationType: "إضافة موظف جديد",
          details: `قام مدير النظام بإضافة موظف معتمد جديد: ${formName} بالرقم الوظيفي [${formId}]`
        } as any);

        alert("تمت إضافة الموظف الجديد للهيكل الوظيفي بنجاح.");
      }

      setShowFormModal(false);
      setIsEditing(false);
      resetFormFields();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع أثناء حفظ ملف الموظف.");
    }
  };

  const resetFormFields = () => {
    setFormId("");
    setFormName("");
    setFormRole("SPECIALIST");
    setFormJobTitle("");
    setFormPhone("");
    setFormExtension("");
    setFormEmail("");
    setFormPhoto(PRESET_AVATARS[0]);
    setFormActive(true);
    setFormPassword("");
    setFormCommittees([]);
    setFormAllowedPages([]);
    setOriginalEditId("");
  };

  const openAddModal = () => {
    resetFormFields();
    
    // Generate an automatic 4-digit ID
    const autoId = Math.floor(1000 + Math.random() * 9000).toString();
    setFormId(autoId);

    setIsEditing(false);
    setShowFormModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setOriginalEditId(emp.id);
    setFormId(emp.id);
    setFormName(emp.name || "");
    setFormRole(emp.role || "SPECIALIST");
    setFormJobTitle(emp.jobTitle || "");
    setFormPhone(emp.phone || "");
    setFormExtension(emp.extension || "");
    setFormEmail(emp.email || "");
    setFormPhoto(emp.photo || PRESET_AVATARS[0]);
    setFormActive(emp.active !== false);
    setFormPassword(emp.password || "");
    setFormCommittees(emp.committees || []);
    setFormAllowedPages(emp.allowedPages || []);
    
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDeleteEmployee = async (empId: string, empName: string) => {
    if (empId === currentUser?.id) {
      alert("عذراً، لا يمكنك حذف حسابك الشخصي النشط حالياً والمستخدم.");
      return;
    }
    if (empId === "01") {
      alert("عذراً، لا يمكن حذف حساب المشرف أو المالك الأعلى للنظام.");
      return;
    }

    const firstConfirm = window.confirm(`هل أنت متأكد من حذف الموظف: ${empName} وباقته بالكامل نهائياً؟`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(`تنبيه أمني: للحذف، سيتم تطهير بطاقة السجل التنظيمي له بالكامل. هل توافق على الحذف وإدارة الأرشفة اليدوية؟`);
    if (!secondConfirm) return;

    try {
      await deleteFirebaseEmp(empId);

      // Unbind from supervised committees
      const supervised = dbCommittees.filter(c => c.specialistId === empId);
      for (const c of supervised) {
        await updateFirebaseComm(c.id, {
          specialistId: "",
          specialistName: "غير معين"
        });
      }

      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "ناجحة",
        operationType: "حذف بطاقة موظف",
        details: `تم حذف ملف الموظف ${empName} (الرقم: ${empId}) بالكامل وتفريغ لجانه بالتنظيم.`
      } as any);

      alert("تم حذف بطاقة الموظف بنجاح.");
    } catch (error) {
      console.error(error);
      alert("فشل في حذف بطاقة الموظف.");
    }
  };

  // 4. Transfer Duties and Supervisions (نقل وتفويض الأعمال)
  const handleTransferDuties = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccess("");
    setTransferError("");
    
    if (!sourceEmpId || !targetEmpId) {
      setTransferError("يرجى اختيار الموظف المسؤول (المصدر) والموظف البديل (المستهدف) للبدء.");
      return;
    }

    if (sourceEmpId === targetEmpId) {
      setTransferError("لا يمكن نقل وتفويض الأعمال لنفس الموظف (المصدر والمستهدف متطابقان).");
      return;
    }

    setIsTransferring(true);
    try {
      const sourceEmp = dbEmployees.find(emp => emp.id === sourceEmpId);
      const targetEmp = dbEmployees.find(emp => emp.id === targetEmpId);

      if (!sourceEmp || !targetEmp) {
        setTransferError("تعذر العثور على سجلات الموظفين المحددين بقاعدة البيانات.");
        setIsTransferring(false);
        return;
      }

      let countCommittees = 0;
      let countTasks = 0;
      let countEvents = 0;
      let countRecs = 0;

      // A. Transfer supervised sector committees
      if (transferCommittees) {
        const matchingComms = dbCommittees.filter(c => c.specialistId === sourceEmpId);
        countCommittees = matchingComms.length;
        for (const c of matchingComms) {
          await updateFirebaseComm(c.id, {
            specialistId: targetEmpId,
            specialistName: targetEmp.name
          });
        }

        // Update employee document arrays
        const sourceCurrentComms = sourceEmp.committees || [];
        const targetCurrentComms = targetEmp.committees || [];
        
        // Merge without duplicates
        const updatedTargetComms = Array.from(new Set([...targetCurrentComms, ...sourceCurrentComms]));
        
        await updateFirebaseEmp(sourceEmpId, { committees: [] });
        await updateFirebaseEmp(targetEmpId, { committees: updatedTargetComms });
      }

      // B. Transfer independent administrative tasks
      if (transferTasks) {
        const matchingTasks = dbTasks.filter(t => t.assignedToId === sourceEmpId);
        countTasks = matchingTasks.length;
        for (const t of matchingTasks) {
          await updateFirebaseTask(t.id, {
            assignedToId: targetEmpId,
            assignedToName: targetEmp.name
          });
        }
      }

      // C. Transfer upcoming calendar events
      if (transferEvents) {
        // Some events may store creator or specialist link
        const matchingEvents = dbEvents.filter(ev => ev.employeeId === sourceEmpId || ev.specialistId === sourceEmpId);
        countEvents = matchingEvents.length;
        for (const ev of matchingEvents) {
          const updateObj: any = {};
          if (ev.employeeId === sourceEmpId) updateObj.employeeId = targetEmpId;
          if (ev.specialistId === sourceEmpId) {
            updateObj.specialistId = targetEmpId;
            updateObj.specialistName = targetEmp.name;
          }
          await updateFirebaseEvent(ev.id, updateObj);
        }
      }

      // D. Transfer specific recommendations and decisions
      if (transferRecs) {
        // recommendations assigned to source specialist
        const matchingRecs = dbRecommendations.filter(rec => rec.assignedId === sourceEmpId || rec.responsibleId === sourceEmpId);
        countRecs = matchingRecs.length;
        for (const r of matchingRecs) {
          const updateObj: any = {};
          if (r.assignedId === sourceEmpId) {
            updateObj.assignedId = targetEmpId;
            updateObj.assignedName = targetEmp.name;
          }
          if (r.responsibleId === sourceEmpId) {
            updateObj.responsibleId = targetEmpId;
            updateObj.responsibleName = targetEmp.name;
          }
          await updateFirebaseRec(r.id, updateObj);
        }
      }

      // Log the transfer action in security logs
      const detailsMsg = `تم نقل المهام من [${sourceEmp.name}] إلى [${targetEmp.name}] بنجاح. التفاصيل: ${countCommittees} لجان، ${countTasks} مهام، ${countEvents} فعاليات، ${countRecs} توصيات.`;
      await addFirebaseLog({
        employeeName: currentUser?.name || "مدير النظام",
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: "ناجحة",
        operationType: "تفويض ونقل المهام",
        details: detailsMsg
      } as any);

      setTransferSuccess(`تمت عملية تفويض ونقل الأعمال بنجاح تام! تم ترحيل: ${countCommittees} لجنة، ${countTasks} مهمة إدارية، ${countEvents} فعالية، ${countRecs} توصية ومتابعة.`);
      
      // Reset selections
      setSourceEmpId("");
      setTargetEmpId("");
    } catch (error: any) {
      console.error(error);
      setTransferError(`فشلت العملية: ${error.message || "خطأ داخلي أثناء تفويض قواعد البيانات"}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const handlePrintLogs = () => {
    window.print();
  };

  // Live filtering search matching names, roles, phone and email strings
  const filteredEmployees = safeDbEmployees.filter(emp => {
    const isMaster = currentUser && (currentUser.email?.trim().toLowerCase() === "khalafshehab@gmail.com" || currentUser.email?.trim().toLowerCase() === "khalafshehab-crypto@gmail.com");
    if (!isMaster && (emp.role === "SYS_ADMIN" || emp.id === "01" || emp.email?.trim().toLowerCase() === "khalafshehab@gmail.com" || emp.email?.trim().toLowerCase() === "khalafshehab-crypto@gmail.com")) {
      return false;
    }

    const term = searchTerm.toLowerCase().trim();
    const matchSearch = !term || 
      emp.name?.toLowerCase().includes(term) ||
      emp.jobTitle?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.phone?.includes(term) ||
      emp.id?.includes(term);

    const matchRole = roleFilter === "ALL" || emp.role === roleFilter;
    
    let matchStatus = true;
    if (statusFilter === "ACTIVE") matchStatus = emp.active !== false;
    else if (statusFilter === "INACTIVE") matchStatus = emp.active === false;

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12 text-right" dir="rtl">
      
      {/* 1. TOP HERO PANEL */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand" />
            <span>الهيكل الإداري والرقابة الذكية</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            إدارة الموظفين، تفويض ونقل الأعمال، واعتماد حسابات المنسقين الجدد لغرفة مكة المكرمة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUserRole === "SYS_ADMIN" && (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف معتمد</span>
            </button>
          )}

          {currentUserRole === "SYS_ADMIN" && (
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-red-200"
            >
              <ShieldAlert className="w-4 h-4 text-red-650 animate-pulse" />
              <span>تصفير النظام بالكامل</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUB-TABS SELECTOR RULER */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto custom-scrollbar pb-1">
        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "hierarchy"
              ? "border-brand text-brand font-black"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>الهيكل التنظيمي والموظفين</span>
          <span className="bg-gray-150 px-2 py-0.5 rounded-full text-[10px] text-gray-600 font-bold">
            {safeDbEmployees.length}
          </span>
        </button>

        {currentUserRole === "SYS_ADMIN" && (
          <button
            onClick={() => setActiveTab("transfer")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "transfer"
                ? "border-brand text-brand font-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            <span>نقل وتفويض الأعمال</span>
          </button>
        )}

        {currentUserRole === "SYS_ADMIN" && (
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "approvals"
                ? "border-brand text-brand font-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>اعتماد طلبات الانضمام</span>
            {dbJoinRequests.length > 0 && (
              <span className="bg-amber-500 px-2 py-0.5 rounded-full text-[10px] text-white font-black animate-bounce">
                {dbJoinRequests.length}
              </span>
            )}
          </button>
        )}

        {currentUserRole === "SYS_ADMIN" && (
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "permissions"
                ? "border-brand text-brand font-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>صلاحيات عرض الصفحات</span>
          </button>
        )}

        {currentUserRole === "SYS_ADMIN" && (
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "logs"
                ? "border-brand text-brand font-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>سجل مراقبة العمليات</span>
          </button>
        )}

        {currentUserRole === "SYS_ADMIN" && (
          <button
            onClick={() => setActiveTab("master_data")}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "master_data"
                ? "border-brand text-brand font-black"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>لوحة مستوعبات البيانات الموحدة</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black">
              أدمن
            </span>
          </button>
        )}
      </div>

      {/* 3. PRESENTATION OF ACTIVE VIEWPORT */}
      <div className="space-y-6">
        
        {/* TAB 1: EMPLOYEES & HIERARCHY */}
        {activeTab === "hierarchy" && (
          <>
            {/* Search Filters Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="ابحث بحرية عن موظف، رقم وظيفي، بريد أو جوال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all text-right font-medium"
                />
                <Search className="absolute top-3.5 right-3.5 text-gray-400 w-4 h-4" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Role Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-450 font-extrabold whitespace-nowrap">فلترة الدور:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="ALL">جميع المستويات الهيكلية</option>
                    <option value="SYS_ADMIN">مدراء النظام (أدمن)</option>
                    <option value="MANAG_DIR">مدير إدارة لجان</option>
                    <option value="DEPT_HEAD">رئيس قسم لجان</option>
                    <option value="SPECIALIST">أخصائي لجان</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-450 font-extrabold whitespace-nowrap">الحالة:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="ALL">جميع الحالات</option>
                    <option value="ACTIVE">الموظفون النشطون</option>
                    <option value="INACTIVE">المشرفون المعطلون</option>
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden p-0.5 bg-gray-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
                      viewMode === "grid" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    شبكة بطاقات
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
                      viewMode === "table" ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    جدول عام
                  </button>
                </div>
              </div>
            </div>

            {/* Empty view checks */}
            {filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center shadow-sm">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-gray-600">عذراً، لم يتم العثور على موظفين معتمدين</h3>
                <p className="text-gray-400 text-xs mt-1">يرجى تعديل الكلمات البحثية أو فلترة الدور.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map((emp) => {
                  const commsCount = emp.committees?.length || 0;
                  const isSelf = emp.id === currentUser?.id;
                  const isSAdmin = emp.role === "SYS_ADMIN";

                  // Dynamic Badge color
                  const badgeColors: Record<string, string> = {
                    SYS_ADMIN: "bg-red-50 text-red-600 border border-red-200",
                    MANAG_DIR: "bg-amber-50 text-amber-600 border border-amber-200",
                    DEPT_HEAD: "bg-teal-50 text-teal-600 border border-teal-200",
                    SPECIALIST: "bg-blue-50 text-blue-600 border border-blue-200"
                  };

                  return (
                    <motion.div
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md ${
                        isSelf ? "ring-2 ring-brand ring-offset-2" : "border-gray-200"
                      }`}
                    >
                      {/* Top profile row */}
                      <div>
                        
                        {/* Status + Online indicator */}
                        <div className="absolute top-4 left-4 flex items-center gap-1.5">
                          {emp.active !== false ? (
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                              <span>متصل الآن</span>
                            </span>
                          ) : (
                            <span className="bg-red-50 text-red-500 text-[9px] px-1.5 py-0.5 rounded-full border border-red-100 font-bold">
                              معطل
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3.5 mb-4">
                          <img
                            src={emp.photo || PRESET_AVATARS[0]}
                            alt={emp.name}
                            className="w-14 h-14 rounded-2xl object-crop ring-2 ring-gray-100 bg-gray-50"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h3 className="font-extrabold text-sm text-gray-900 leading-snug flex items-center gap-1">
                              <span>الأستاذ/ة {emp.name}</span>
                              {isSelf && <span className="text-[10px] text-brand bg-brand/10 px-1 py-0.5 rounded font-black">(أنت)</span>}
                            </h3>
                            <p className="text-gray-500 text-[10px] font-bold mt-0.5">{emp.jobTitle || "مسؤول بالنظم"}</p>
                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 mt-2 rounded-md ${badgeColors[emp.role] || "bg-gray-100 text-gray-700"}`}>
                              {emp.roleAr || "أخصائي"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-gray-100 pt-3 text-[11px] text-gray-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400">الرقم الوظيفي:</span>
                            <span className="font-mono font-black text-gray-800">{emp.id}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400">البريد:</span>
                            <span className="text-gray-800 truncate" style={{ maxWidth: "160px" }}>{emp.email}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400">الجوال:</span>
                            <span className="font-mono text-gray-800">{emp.phone}</span>
                          </div>

                          {emp.extension && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-gray-400">التحويلة:</span>
                              <span className="font-mono font-bold text-brand">{emp.extension}</span>
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-gray-50">
                            <div className="flex items-center justify-between text-xs font-black text-gray-700 mb-1.5">
                              <span className="flex items-center gap-1">
                                <Activity className="w-4 h-4 text-brand" />
                                <span>اللجان تحت الإشراف</span>
                              </span>
                              <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-lg text-[10px]">
                                {commsCount} لجان
                              </span>
                            </div>
                            
                            {commsCount > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {emp.committees.map((com, index) => (
                                  <span
                                    key={index}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="bg-slate-50 hover:bg-slate-100 text-gray-700 border border-gray-200 rounded-md px-1.5 py-0.5 text-[9px] font-bold cursor-pointer transition-all"
                                  >
                                    {com}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">لم يتم ربط أي لجان بعد</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-1.5">
                        {(currentUserRole === "SYS_ADMIN" || currentUserRole === "MANAG_DIR" || currentUserRole === "DEPT_HEAD" || isSelf) && (
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 bg-gray-50 hover:bg-brand/10 text-gray-600 hover:text-brand rounded-lg transition-all cursor-pointer border border-gray-200 hover:border-brand/20 flex items-center gap-1.5 text-[10px] font-extrabold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                        )}

                        {currentUserRole === "SYS_ADMIN" && !isSelf && !isSAdmin && (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-all cursor-pointer border border-red-100 hover:border-red-200"
                            title="حذف الموظف بالكامل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Sub view list table */
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">الرقم الوظيفي</th>
                        <th className="p-4">الموظف</th>
                        <th className="p-4">الدور</th>
                        <th className="p-4">المسمى الوظيفي</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">الجوال والتحويلة</th>
                        <th className="p-4">اللجان المشرف عليها</th>
                        <th className="p-4">حالة الحساب</th>
                        <th className="p-4 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredEmployees.map((emp) => {
                        const isSelf = emp.id === currentUser?.id;
                        return (
                          <tr key={emp.id} className={isSelf ? "bg-brand/5" : "hover:bg-gray-50/50"}>
                            <td className="p-4 font-mono font-black text-gray-900">{emp.id}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <img
                                  src={emp.photo || PRESET_AVATARS[0]}
                                  alt={emp.name}
                                  className="w-8 h-8 rounded-lg object-cover bg-gray-50 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <span className="font-extrabold text-gray-900 text-[13px]">الأستاذ/ة {emp.name}</span>
                                  {isSelf && <span className="mr-1 text-[9px] text-brand bg-brand/10 px-1 py-0.5 rounded font-black">(أنت)</span>}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold">
                                {emp.roleAr || "أخصائي"}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500">{emp.jobTitle}</td>
                            <td className="p-4 font-mono text-gray-600">{emp.email}</td>
                            <td className="p-4 font-mono text-gray-600">
                              <div>{emp.phone}</div>
                              {emp.extension && <div className="text-[10px] text-brand font-bold">تحويلة: {emp.extension}</div>}
                            </td>
                            <td className="p-4">
                              <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
                                {(emp.committees || []).length} لجان
                              </span>
                            </td>
                            <td className="p-4">
                              {emp.active !== false ? (
                                <span className="text-emerald-600 text-[10px] font-black">● فعال</span>
                              ) : (
                                <span className="text-red-500 text-[10px] font-black">● معطل</span>
                              )}
                            </td>
                            <td className="p-4 text-left">
                              <div className="flex items-center justify-end gap-1.5">
                                {(currentUserRole === "SYS_ADMIN" || currentUserRole === "MANAG_DIR" || currentUserRole === "DEPT_HEAD" || isSelf) && (
                                  <button
                                    onClick={() => openEditModal(emp)}
                                    className="p-1 px-2.5 bg-gray-100 hover:bg-brand/10 text-gray-600 hover:text-brand rounded-md border border-gray-200 text-[10px] font-bold"
                                  >
                                    تعديل
                                  </button>
                                )}
                                {currentUserRole === "SYS_ADMIN" && !isSelf && emp.id !== "01" && (
                                  <button
                                    onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                    className="p-1 bg-red-50 hover:bg-red-100 text-red-650 rounded-md border border-red-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
          </>
        )}

        {/* TAB 2: TRANSFER DUTIES & SUPERVISONS */}
        {activeTab === "transfer" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                <span>تفويض الصلاحيات وتبديل العهد الإدارية</span>
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                تتيح لك هذه الشاشة نقل اللجان القطاعية، المهام الإدارية، الفعاليات الحالية، والتوصيات فورياً من كاهل موظف أو مشرف لزميلة آخر (عند الانتقال أو الإجازات).
              </p>
            </div>

            {transferSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-xs font-bold leading-relaxed">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            {transferError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-650 text-xs font-bold leading-relaxed">
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <form onSubmit={handleTransferDuties} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Source Employee Select */}
                <div className="bg-gray-55/40 p-4 rounded-xl border border-gray-150">
                  <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">أولاً: الموظف المسؤول المكلف حالياً (المصدر/المنقول منه)</label>
                  <select
                    value={sourceEmpId}
                    onChange={(e) => {
                      setSourceEmpId(e.target.value);
                      setTransferSuccess("");
                      setTransferError("");
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700"
                  >
                    <option value="">-- اختر الموظف لترحيل أعماله --</option>
                    {safeDbEmployees.filter(e => e.active !== false).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.roleAr}) - الرقم الوظيفي: {emp.id} [لجان: {emp.committees?.length || 0}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Employee Select */}
                <div className="bg-gray-55/40 p-4 rounded-xl border border-gray-150">
                  <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">ثانياً: الموظف البديل المستهدف (المستقبل/المنقول إليه)</label>
                  <select
                    value={targetEmpId}
                    onChange={(e) => {
                      setTargetEmpId(e.target.value);
                      setTransferSuccess("");
                      setTransferError("");
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-700"
                  >
                    <option value="">-- اختر الموظف البديل لاستلام العهد --</option>
                    {safeDbEmployees.filter(e => e.active !== false && e.id !== sourceEmpId).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.roleAr}) - الرقم الوظيفي: {emp.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scope checkboxes selection */}
              <div className="bg-slate-50 p-5 rounded-xl border border-gray-200 space-y-3.5">
                <span className="block text-xs font-black text-gray-800">العناصر والعهد الإدارية المشمولة بالنقل الفوري:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={transferCommittees}
                      onChange={(e) => setTransferCommittees(e.target.checked)}
                      className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                    />
                    <span>إشراف اللجان القطاعية</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={transferTasks}
                      onChange={(e) => setTransferTasks(e.target.checked)}
                      className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                    />
                    <span>المهام الإدارية الداخلية</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={transferEvents}
                      onChange={(e) => setTransferEvents(e.target.checked)}
                      className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                    />
                    <span>جدولة الفعاليات والاجتماعات</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={transferRecs}
                      onChange={(e) => setTransferRecs(e.target.checked)}
                      className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                    />
                    <span>متابعة التوصيات وقرارات اللجان</span>
                  </label>

                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="px-6 py-3 bg-brand hover:bg-brand/95 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isTransferring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>جاري تهيئة ونقل الأعمال العشوائية...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>تأكيد الإحالة وتفويض المهام</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: JOIN REQUESTS & APPROVED WHITELIST */}
        {activeTab === "approvals" && currentUserRole === "SYS_ADMIN" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Pending Join requests (size 7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  <span>طلبات التسجيل والانضمام المعلقة ({dbJoinRequests.length})</span>
                </h2>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  يرسل الموظفون وعاملو الأقسام والمنسقون الجدد طلب انضمام بالاسم، الجوال والبريد. يمكنك مراجعتها واعتمادها فورياً هنا.
                </p>
              </div>

              {dbJoinRequests.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <span className="text-[11px] font-bold text-gray-500 block">لا توجد طلبات انضمام معلقة حالياً.</span>
                  <span className="text-gray-405 text-[10px]">كافة الحسابات مراجعة ومفعلة.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {dbJoinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-xs text-gray-900 block">
                          الأستاذ/ة {req.name}
                        </span>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-semibold font-mono">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{req.email}</span>
                          </span>

                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{req.phone}</span>
                          </span>

                          <span className="flex items-center gap-1 text-brand">
                            <Calendar className="w-3.5 h-3.5 text-brand" />
                            <span>تاريخ التقديم: {req.requestDate}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleApproveJoinRequest(req)}
                          className="px-3 py-1.5 bg-brand hover:bg-brand/90 text-white rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>اعتماد</span>
                        </button>
                        <button
                          onClick={() => handleRejectJoinRequest(req)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 border border-red-100"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: approved email Whitelist (size 5) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-5">
              <div>
                <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                  <Lock className="w-5 h-5 text-brand" />
                  <span>البريد الإلكتروني المسموح لوظائف Whitelist</span>
                </h2>
                <p className="text-gray-550 text-[11px] mt-0.5">
                  إعداد مسبق لعناوين البريد الإلكتروني للمنسقين لتسجيل الدخول المباشر فور تسجيلهم، دون قيود أو طلب مراجعة.
                </p>
              </div>

              {/* Form to Add Whitelist email */}
              <form onSubmit={handleAddWhitelistEmail} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="block text-[11px] font-black text-gray-800">إضافة اعتماد بريد موظف معتمد:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="اسم الموظف"
                      value={whitelistNameStr}
                      onChange={(e) => setWhitelistNameStr(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-[10px] sm:text-xs font-bold text-gray-700"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="X.XXXX@makkahchamber.sa"
                      dir="ltr"
                      value={whitelistEmailStr}
                      onChange={(e) => setWhitelistEmailStr(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-[10px] sm:text-xs text-left font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-gray-500 whitespace-nowrap">تعيين دور:</span>
                    <select
                      value={whitelistRoleAr}
                      onChange={(e) => setWhitelistRoleAr(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg py-1 px-2 text-[11px] font-bold"
                    >
                      <option value="أخصائي لجان">أخصائي لجان</option>
                      <option value="رئيس قسم اللجان">رئيس قسم لجان</option>
                      <option value="مدير إدارة اللجان">مدير إدارة لجان</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="p-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg cursor-pointer transition-all"
                  >
                    إضافة للقائمة المسموحة
                  </button>
                </div>
              </form>

              {/* whitelist entries list */}
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {dbApprovedEmails && dbApprovedEmails.length === 0 ? (
                  <span className="text-[10px] font-bold text-gray-400 block text-center pt-3">لا توجد عناوين بريدية معتمدة بشكل مسبق.</span>
                ) : (
                  dbApprovedEmails?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs leading-none"
                    >
                      <div className="space-y-1">
                        <span className="font-extrabold text-[11px] text-gray-900 block">{item.name}</span>
                        <span className="font-mono text-[10px] text-gray-400 block">{item.email}</span>
                        <span className="text-[9px] text-brand font-black block">لدور ومستوى: {item.roleAr}</span>
                      </div>

                      <button
                        onClick={() => handleRemoveWhitelistEmail(item.id, item.email)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg cursor-pointer transition-all border border-red-100 shrink-0"
                        title="إلغاء Whitelist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: CUSTOM PAGE VIEW PERMISSIONS (صلاحيات عرض صفحات النظام) */}
        {activeTab === "permissions" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                  <Lock className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>صلاحيات عرض صفحات النظام المخصصة (من صلاحيات مدير النظام)</span>
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  تتيح لك هذه اللوحة الرقابية تحديد الصفحات وأوراق العمل المسموح لكل أخصائي أو موظف تصفحها ضمن النظام. ضع علامة صح أمام المكون لتفعيله، أو أزلها لحجب المكون عن الموظف فورياً وبصورة حية.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="ابحث عن موظف لتعديل صلاحياته..."
                  value={permSearchTerm}
                  onChange={(e) => setPermSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-250 rounded-xl px-4 py-2 pr-9 text-xs focus:outline-none focus:ring-2 focus:ring-brand font-semibold text-right"
                />
                <Search className="absolute top-2.5 right-3 text-gray-400 w-3.5 h-3.5" />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200 shadow-inner bg-slate-50/20">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#fcfdfd] border-b border-gray-200 text-gray-700 font-extrabold text-[10.5px]">
                  <tr>
                    <th className="p-4 whitespace-nowrap">الموظف / الأخصائي</th>
                    <th className="p-4 text-center whitespace-nowrap">الرئيسية 🏠</th>
                    <th className="p-4 text-center whitespace-nowrap">تشكيل اللجان 👥</th>
                    <th className="p-4 text-center whitespace-nowrap">سجل الأعضاء 📇</th>
                    <th className="p-4 text-center whitespace-nowrap">الفعاليات 📅</th>
                    <th className="p-4 text-center whitespace-nowrap">التوصيات 🏆</th>
                    <th className="p-4 text-center whitespace-nowrap">المهام الإدارية 📋</th>
                    <th className="p-4 text-center whitespace-nowrap">التقارير 📊</th>
                    <th className="p-4 text-center whitespace-nowrap">المكتبة الرقمية 📚</th>
                    <th className="p-4 text-center whitespace-nowrap">الهيكل الإداري ⚙️</th>
                    <th className="p-4 text-center whitespace-nowrap bg-indigo-50/50">تحكم كلي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-bold text-gray-600 bg-white">
                  {(() => {
                    const SYSTEM_PAGES = [
                      { path: "/", label: "الرئيسية" },
                      { path: "/committees", label: "تشكيل اللجان" },
                      { path: "/members", label: "سجل الأعضاء" },
                      { path: "/events", label: "الفعاليات" },
                      { path: "/recommendations", label: "التوصيات" },
                      { path: "/tasks", label: "المهام" },
                      { path: "/reports", label: "التقارير" },
                      { path: "/library", label: "المكتبة" },
                      { path: "/org-chart", label: "الهيكل" }
                    ];

                    const filteredPermEmployees = safeDbEmployees.filter(emp => 
                      !permSearchTerm ||
                      emp.name.toLowerCase().includes(permSearchTerm.toLowerCase()) ||
                      emp.id.includes(permSearchTerm) ||
                      (emp.email && emp.email.toLowerCase().includes(permSearchTerm.toLowerCase())) ||
                      (emp.jobTitle && emp.jobTitle.toLowerCase().includes(permSearchTerm.toLowerCase())) ||
                      (emp.roleAr && emp.roleAr.toLowerCase().includes(permSearchTerm.toLowerCase()))
                    );

                    if (filteredPermEmployees.length === 0) {
                      return (
                        <tr>
                          <td colSpan={11} className="p-10 text-center text-gray-400 italic">
                            لا يوجد موظفون يطابقون معايير البحث الحالية.
                          </td>
                        </tr>
                      );
                    }

                    return filteredPermEmployees.map((emp) => {
                      const currentAllowed = (emp.allowedPages && emp.allowedPages.length > 0)
                        ? emp.allowedPages
                        : SYSTEM_PAGES.map(p => p.path);

                      const handleCheckboxToggle = async (path: string) => {
                        let updatedAllowed: string[];
                        if (currentAllowed.includes(path)) {
                          updatedAllowed = currentAllowed.filter(p => p !== path);
                        } else {
                          updatedAllowed = [...currentAllowed, path];
                        }
                        
                        try {
                          await updateFirebaseEmp(emp.id, { allowedPages: updatedAllowed });
                          
                          await addFirebaseLog({
                            employeeName: currentUser?.name || "مدير النظام",
                            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            operationType: "تعديل صلاحيات الوصول",
                            status: "ناجحة",
                            details: `تم تعديل صلاحيات الموظف [${emp.name}]. الصفحات المصرحة: ${updatedAllowed.length}`
                          });
                        } catch (err: any) {
                          alert("فشل التعديل: " + err.message);
                        }
                      };

                      const toggleAll = async (grantAll: boolean) => {
                        const updatedAllowed = grantAll ? SYSTEM_PAGES.map(p => p.path) : [];
                        try {
                          await updateFirebaseEmp(emp.id, { allowedPages: updatedAllowed });
                          
                          await addFirebaseLog({
                            employeeName: currentUser?.name || "مدير النظام",
                            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            operationType: grantAll ? "منح صلاحيات كلي" : "سحب صلاحيات كلي",
                            status: "ناجحة",
                            details: grantAll 
                              ? `تم منح كافة صلاحيات الصفحات للموظف [${emp.name}]`
                              : `تم حجب كافة صلاحيات الصفحات عن الموظف [${emp.name}]`
                          });
                        } catch (err: any) {
                          alert("فشل المزامنة: " + err.message);
                        }
                      };

                      const hasAll = SYSTEM_PAGES.every(p => currentAllowed.includes(p.path));
                      const hasNone = currentAllowed.length === 0;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Employee Info Card */}
                          <td className="p-4 flex items-center gap-3">
                            {emp.photo ? (
                              <img
                                src={emp.photo}
                                alt={emp.name}
                                className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs">
                                {emp.name ? emp.name.charAt(0) : "م"}
                              </div>
                            )}
                            <div className="space-y-0.5 text-right">
                              <span className="font-extrabold text-xs text-gray-900 block">
                                {emp.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-black">{emp.roleAr}</span>
                                <span className="truncate max-w-[120px]" title={emp.email}>{emp.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* SYSTEM PAGES CHECKBOXES */}
                          {SYSTEM_PAGES.map((page) => {
                            const isChecked = currentAllowed.includes(page.path);
                            return (
                              <td key={page.path} className="p-4 text-center">
                                <div className="flex items-center justify-center">
                                  <label className="relative flex items-center justify-center p-2 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleCheckboxToggle(page.path)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 bg-gray-50 border border-gray-300 rounded-md transition-all duration-200 flex items-center justify-center peer-checked:bg-emerald-600 peer-checked:border-emerald-750 peer-checked:shadow-sm group-hover:scale-105">
                                      {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                    </div>
                                  </label>
                                </div>
                              </td>
                            );
                          })}

                          {/* Quick Admin Toggles */}
                          <td className="p-4 text-center bg-indigo-50/10">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleAll(true)}
                                disabled={hasAll}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[9px] rounded-lg border border-emerald-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="تفعيل الكل"
                              >
                                الكل ✔️
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleAll(false)}
                                disabled={hasNone}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-800 font-extrabold text-[9px] rounded-lg border border-red-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="حجب كلي"
                              >
                                حجب ❌
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM EVENT / MONITORING LOGS */}
        {activeTab === "logs" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-red-650" />
                  <span>سجل مراقبة العمليات الأمني (Audit Logs)</span>
                </h2>
                <p className="text-gray-550 text-xs mt-0.5">
                  شاشة الأمن والرقابة الإدارية: ترصد حركات تسجيل الدخول، تعديل وتوثيق المحاضر والخطط، الحذف والترحيل.
                </p>
              </div>

              <button
                onClick={handlePrintLogs}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-gray-205"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السجلات A4</span>
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">تدرج التاريخ والتوقيت</th>
                    <th className="p-4">اسم الموظف المبادر</th>
                    <th className="p-4">نوعية العملية والتوثيق</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">تفاصيل الإجراء والمستند المترتب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                  {dbSystemLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 italic">لا توجد سجلات مراقبة مسجلة حالياً.</td>
                    </tr>
                  ) : (
                    dbSystemLogs.slice().reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-mono text-[10px] text-gray-500 whitespace-nowrap">{log.time}</td>
                        <td className="p-4 font-extrabold text-gray-900 whitespace-nowrap">{log.employeeName}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="bg-blue-50 text-brand px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                            {log.operationType}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {log.status === "ناجحة" ? (
                            <span className="text-emerald-605 font-bold">✓ ناجحة</span>
                          ) : (
                            <span className="text-red-500 font-bold">✗ مرفوضة</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-550 leading-relaxed font-semibold">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MASTER DATA EXPLORER & CONTROL PANEL */}
        {activeTab === "master_data" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-gray-800" />
                  <span>لوحة مستوعبات البيانات الموحدة للأدمن (Master Data Console)</span>
                </h2>
                <p className="text-gray-550 text-xs mt-0.5">
                  أنت مسجل كمدير نظام (SYS_ADMIN). تتيح لك هذه الشاشة الوصول الشامل والسيطرة الكاملة على كافة مستوعبات المحتوى المسجل في النظام وحذفه أو تعديل حالته.
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-gray-400 text-[10px] font-bold">إجمالي اللجان</span>
                <span className="text-lg font-black text-slate-800">{dbCommittees.length}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-gray-400 text-[10px] font-bold">إجمالي الأعضاء</span>
                <span className="text-lg font-black text-slate-800">{dbMembers.length}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-gray-400 text-[10px] font-bold">إجمالي الفعاليات</span>
                <span className="text-lg font-black text-slate-800">{dbEvents.length}</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                <span className="block text-gray-400 text-[10px] font-bold">إجمالي التوصيات</span>
                <span className="text-lg font-black text-slate-800">{dbRecommendations.length}</span>
              </div>
            </div>

            {/* Sub-Collection Pill Selectors Container */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {[
                { key: "committees", label: "اللجان القطاعية", count: dbCommittees.length },
                { key: "members", label: "أعضاء اللجان", count: dbMembers.length },
                { key: "events", label: "الفعاليات والاجتماعات", count: dbEvents.length },
                { key: "recommendations", label: "التوصيات المدرجة", count: dbRecommendations.length },
                { key: "tasks", label: "المهام الإدارية", count: dbTasks.length },
                { key: "reports", label: "التقارير الدورية", count: dbReports.length },
                { key: "kpis", label: "مؤشرات الأداء", count: dbKpis.length },
                { key: "templates", label: "النماذج والقوالب المؤسسية", count: dbTemplates.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setSelectedSubCol(tab.key);
                    setMasterSearchQuery("");
                    setConfirmDeleteId(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                    selectedSubCol === tab.key
                      ? "bg-brand text-white border-brand shadow-sm shadow-blue-100"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                    selectedSubCol === tab.key ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Global Search and Search Bar */}
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-450 pointer-events-none" />
              <input
                type="text"
                placeholder="البحث الفوري الشامل في هذا الجدول المختار للتحكم ومراجعة التفاصيل الكلية..."
                value={masterSearchQuery}
                onChange={(e) => setMasterSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-xs font-semibold bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-brand focus:bg-white text-right"
              />
            </div>

            {/* Inline Deletion Confirmation Overlay banner */}
            {confirmDeleteId && confirmDeleteCol === selectedSubCol && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-red-900"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                  <p className="text-xs font-bold leading-relaxed">
                    تحذير إداري: هل أنت متأكد تماماً من رغبتك في حذف هذا السجل ذو المعرف <strong>({confirmDeleteId})</strong> نهائياً من قاعدة البيانات للـ ({confirmDeleteCol})؟ لا يمكن التراجع عن هذا الإجراء!
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteMasterItem(confirmDeleteId, selectedSubCol)}
                    className="px-3 py-1 bg-red-650 text-white text-[11px] font-black rounded-lg cursor-pointer hover:bg-red-700 transition"
                  >
                    نعم، احذف السجل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(null);
                      setConfirmDeleteCol(null);
                    }}
                    className="px-3 py-1 bg-white border border-gray-350 text-gray-700 text-[11px] font-bold rounded-lg cursor-pointer animate-none"
                  >
                    تراجع
                  </button>
                </div>
              </motion.div>
            )}

            {/* Table explorer */}
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200">
              <table className="w-full text-right text-xs">
                
                {/* 1. Committees Collection Table UI */}
                {selectedSubCol === "committees" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">اسم اللجنة</th>
                        <th className="p-4">الأخصائي المسؤول</th>
                        <th className="p-4">رئيس اللجنة</th>
                        <th className="p-4">الأهداف والوصف</th>
                        <th className="p-4">الحالة العامة</th>
                        <th className="p-4">إجراءات الإدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-650">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 italic">لا نتائج مطابقة لفلترة اللجان.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black text-gray-900 whitespace-nowrap">{item.name}</td>
                            <td className="p-4 font-extrabold text-blue-800 whitespace-nowrap">{item.specialist || "غير معين"}</td>
                            <td className="p-4 whitespace-nowrap">{item.president || "لم يحدد"}</td>
                            <td className="p-4 max-w-xs truncate text-gray-500">{item.desc || "بلا وصف تفصيلي"}</td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => handleToggleMasterCommitteesActive(item)}
                                className={`px-2 py-0.5 rounded text-[10px] font-black border text-center cursor-pointer ${
                                  item.active !== false
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-650 border-red-200"
                                }`}
                              >
                                {item.active !== false ? "✓ لجنة فعالة" : "✗ غير فعالة"}
                              </button>
                            </td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("committees");
                                }}
                                className="p-1.5 text-red-550 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="حذف بالكامل"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 2. Members Collection Table UI */}
                {selectedSubCol === "members" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">الاسم بالكامل</th>
                        <th className="p-4">رقم الهوية الوطنية</th>
                        <th className="p-4">اللقب والمنصب</th>
                        <th className="p-4">رقم الجوال</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">آلية الانضمام وحالة العضوية</th>
                        <th className="p-4">إجراءات الإدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-650">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 italic">لا توجد سجلات أعضاء مطابقة للفرز.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black text-gray-900 whitespace-nowrap">
                              {(item.prefix || "") + " " + (item.name || "")}
                            </td>
                            <td className="p-4 font-mono select-all whitespace-nowrap">{item.nationalId || "-"}</td>
                            <td className="p-4 whitespace-nowrap font-semibold">
                              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-100">
                                {item.title || "عضو"}
                              </span>
                            </td>
                            <td className="p-4 font-mono select-all whitespace-nowrap">{item.phone || "-"}</td>
                            <td className="p-4 font-mono select-all text-xs text-slate-500 whitespace-nowrap">{item.email || "-"}</td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                item.active !== false && item.status !== "غير فعال"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-650 border-red-200"
                              }`}>
                                {item.active !== false && item.status !== "غير فعال" ? "نشط" : "غير نشط"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("members");
                                }}
                                className="p-1.5 text-red-550 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 3. Events Collection Table UI */}
                {selectedSubCol === "events" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">عنوان الفعالية</th>
                        <th className="p-4">التصنيف واللجنة</th>
                        <th className="p-4">تاريخ الانعقاد والوقت</th>
                        <th className="p-4">القاعة المخصصة</th>
                        <th className="p-4">الأخصائي والمنسق</th>
                        <th className="p-4">حالة جدول الأعمال والمشروع</th>
                        <th className="p-4">إجراءات الإدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-650">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 italic">لا توجد فعاليات مجدولة مطابقة للفرز.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black text-slate-900 truncate max-w-xs">{item.title}</td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold border border-blue-100">
                                {item.committeeName || item.committee || "مبسطة"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap text-xs font-bold font-mono">
                              {item.date} <span className="text-gray-400 font-semibold">{item.time}</span>
                            </td>
                            <td className="p-4 whitespace-nowrap text-gray-700 font-black">{item.room || "غير محدد"}</td>
                            <td className="p-4 whitespace-nowrap">{item.employee || item.specialist || "مدير النظام"}</td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                item.minutesSaved 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {item.minutesSaved ? "مكتمل ومرحل" : "مجدول بالانتظار"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("events");
                                }}
                                className="p-1.5 text-red-555 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="حذف الفعالية"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 4. Recommendations Collection Table UI */}
                {selectedSubCol === "recommendations" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">نص التوصية</th>
                        <th className="p-4">اللجنة الصادرة</th>
                        <th className="p-4">الموظف المكلف بالتنسيق</th>
                        <th className="p-4">مسؤول المتابعة بالمحضر</th>
                        <th className="p-4">مستوى الاعتماد الحالي</th>
                        <th className="p-4">حالة التوصية العاجلة</th>
                        <th className="p-4">إجراءات الإدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-650">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-400 italic">لا توجد توصيات مطابقة للتصفية.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-semibold text-gray-800">{item.title || item.text || item.description || "توصية عامة"}</td>
                            <td className="p-4 whitespace-nowrap font-bold text-blue-700">{item.committeeName || item.dept || "إشرافية"}</td>
                            <td className="p-4 whitespace-nowrap text-slate-500 font-bold">{item.assignedTo || "غير محدد"}</td>
                            <td className="p-4 whitespace-nowrap font-bold text-gray-800">{item.responsible || "أخصائي الحوكمة"}</td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <span className="bg-purple-50 text-purple-700 border border-purple-205 px-2 py-0.5 rounded text-[10px] font-black">
                                {item.approvalStage || "مكتملة"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                item.status === "منجزة"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : item.status === "متأخرة"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                              }`}>
                                {item.status || "جديدة"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("recommendations");
                                }}
                                className="p-1.5 text-red-555 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="حذف التوصية ومسح أثرها"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 5. Tasks Collection Table UI */}
                {selectedSubCol === "tasks" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">عنوان المهمة الإدارية</th>
                        <th className="p-4">المكلف بالإنجاز بالكامل</th>
                        <th className="p-4">موعد الاستلام والانتهاء</th>
                        <th className="p-4">الأولوية والخطورة</th>
                        <th className="p-4">حالة المهمة</th>
                        <th className="p-4">إجراءات الإدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-655">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400 italic">لا نتائج مطابقة لفلترة المهام.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black text-gray-800 whitespace-nowrap">{item.title}</td>
                            <td className="p-4 whitespace-nowrap font-black text-purple-800">{item.assignedTo || "غير معين"}</td>
                            <td className="p-4 whitespace-nowrap font-semibold font-mono">{item.dueDate || "-"}</td>
                            <td className="p-4 whitespace-nowrap text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                item.priority === "high" || item.priority === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {item.priority === "high" ? "عالية" : item.priority === "urgent" ? "حرجة جداً" : "عادية"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                item.status === "منجزة"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : item.status === "متأخرة"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                                {item.status || "جديدة"}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("tasks");
                                }}
                                className="p-1.5 text-red-550 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="إلغاء وحذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 6. Reports Collection Table UI */}
                {selectedSubCol === "reports" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">نوع/رقم التقرير الدورى</th>
                        <th className="p-4">منشئ التقرير</th>
                        <th className="p-4">النطاق والتواريخ المعتمدة</th>
                        <th className="p-4">تاريخ التوثيق</th>
                        <th className="p-4">التحكم الكلي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-655">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 italic">لا تتوفر أية تقارير مطبوعة حتى الآن.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black text-gray-900 whitespace-nowrap">
                              تقرير حوكمة {item.type === "annual" ? "سنوي" : item.type === "quarterly" ? "ربع سنوي" : "شهري"}
                            </td>
                            <td className="p-4 whitespace-nowrap font-bold text-blue-700">{item.creator || "معد النظام تلقائياً"}</td>
                            <td className="p-4 font-semibold text-gray-400 whitespace-nowrap">{item.timeframe || "-"}</td>
                            <td className="p-4 font-mono text-[10px] whitespace-nowrap">{item.createdAt || "-"}</td>
                            <td className="p-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("reports");
                                }}
                                className="p-1.5 text-red-550 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="إتلاف التقرير"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 7. KPIs Collection Table UI */}
                {selectedSubCol === "kpis" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">رقم واسم المؤشر</th>
                        <th className="p-4">المعيار الملحق</th>
                        <th className="p-4">معد المؤشر</th>
                        <th className="p-4">التدريج الزمنى</th>
                        <th className="p-4">التحكم الإدارى الكلي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-655">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 italic">لم تسجل أية عينات مؤشر أداء بعد.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black whitespace-nowrap">{item.title || "مؤشر حوكمة اللجان"}</td>
                            <td className="p-4 font-bold text-amber-700 whitespace-nowrap">{item.benchmark || "-"}</td>
                            <td className="p-4 whitespace-nowrap text-blue-700 font-bold">{item.creator || "مدير النظام"}</td>
                            <td className="p-4 font-semibold text-gray-400 whitespace-nowrap">{item.timeframe || "-"}</td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("kpis");
                                }}
                                className="p-1.5 text-red-550 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="شطب مؤشر"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

                {/* 8. Templates Collection Table UI */}
                {selectedSubCol === "templates" && (
                  <>
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">اسم النموذج المؤسسي</th>
                        <th className="p-4">عائلة التصنيف</th>
                        <th className="p-4">الموظف الأخصائى المنشئ</th>
                        <th className="p-4">تاريخ المرفق والتحميل الفوري</th>
                        <th className="p-4">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-655">
                      {masterFilteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 italic">لا تتوفر أية قوالب نماذج مسجلة في هذا المستوعب.</td>
                        </tr>
                      ) : (
                        masterFilteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/55">
                            <td className="p-4 font-black whitespace-nowrap">{item.title}</td>
                            <td className="p-4 font-bold text-purple-700 whitespace-nowrap">{item.classification || "مستندات عامة"}</td>
                            <td className="p-4 whitespace-nowrap font-black text-gray-800">{item.specialist || item.uploaderName || "غير محدد"}</td>
                            <td className="p-4 text-xs max-w-xs truncate text-slate-500">{item.fileLink || "رابط متصل بجوجل درايف"}</td>
                            <td className="p-4 whitespace-nowrap font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmDeleteId(item.id);
                                  setConfirmDeleteCol("templates");
                                }}
                                className="p-1.5 text-red-550 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="حذف بالكامل من المكتبة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}

              </table>
            </div>
          </div>
        )}

      </div>

      {/* 4. MODAL DIALOG: ADD/EDIT EMPLOYEE */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-right border-b border-gray-100 pb-4 mb-5">
                <span className="text-[11px] font-black text-brand tracking-widest uppercase block mb-1">بطاقات العمل والبيانات</span>
                <h3 className="text-base font-bold text-gray-900">
                  {isEditing ? `تعديل بيانات الموظف: الأستاذ/ة ${formName}` : "إضافة بطاقة موظف معتمد جديد"}
                </h3>
              </div>

              <form onSubmit={handleSaveEmployee} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* employee ID */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الرقم الوظيفي</label>
                    <input
                      type="text"
                      required
                      placeholder="امثلة: 1002"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      disabled={isEditing && currentUserRole !== "SYS_ADMIN"} // Locked for employees
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand focus:outline-none font-bold text-right disabled:opacity-50"
                    />
                  </div>

                  {/* Employee Name */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الاسم الثلاثي واللقب</label>
                    <input
                      type="text"
                      required
                      placeholder="خالد إبراهيم مدني"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand focus:outline-none font-extrabold text-right transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5 block">
                      البريد الإلكتروني المعتمد 
                      {isEditing && <span className="text-amber-650 mr-2">(معرف الحساب - غير قابل للتعديل)</span>}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="X.XXXX@makkahchamber.sa"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      disabled={isEditing} // Locked for all users on edit
                      dir="ltr"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand focus:outline-none font-semibold text-left transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم الجوال الشخصي</label>
                    <input
                      type="tel"
                      required
                      placeholder="+9665xxxxxxxx"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      dir="ltr"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand focus:outline-none font-semibold text-left transition-all"
                    />
                  </div>

                  {/* Extension */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم التحويلة الداخلية (اختياري)</label>
                    <input
                      type="text"
                      placeholder="مثال: 584"
                      value={formExtension}
                      onChange={(e) => setFormExtension(e.target.value)}
                      dir="ltr"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand focus:outline-none font-bold text-left transition-all"
                    />
                  </div>

                  {/* Job title */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">المسمى الوظيفي الفعلي</label>
                    <input
                      type="text"
                      placeholder="أخصائي لجان قطاعية وتنمية الاستثمار"
                      value={formJobTitle}
                      onChange={(e) => setFormJobTitle(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand focus:outline-none font-bold text-right"
                    />
                  </div>

                  {/* System role (admin editing only) */}
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">صلاحية ودور الموظف بالنظام</label>
                    <select
                      value={formRole}
                      onChange={(e: any) => setFormRole(e.target.value)}
                      disabled={currentUserRole !== "SYS_ADMIN"}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-700 disabled:opacity-50"
                    >
                      <option value="SPECIALIST">أخصائي لجان (SPECIALIST)</option>
                      <option value="DEPT_HEAD">رئيس قسم لجان (DEPT_HEAD)</option>
                      <option value="MANAG_DIR">مدير إدارة لجان (MANAG_DIR)</option>
                      <option value="SYS_ADMIN">مدير نظام كامل (SYS_ADMIN)</option>
                    </select>
                  </div>

                  {/* Active checkbox */}
                  {currentUserRole === "SYS_ADMIN" && (
                    <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-200 rounded-xl px-3.5 py-2.5 mt-5">
                      <input
                        type="checkbox"
                        id="formActiveCheck"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="rounded border-gray-300 text-brand focus:ring-brand cursor-pointer w-4 h-4"
                      />
                      <label htmlFor="formActiveCheck" className="text-xs font-extrabold text-gray-700 cursor-pointer select-none">
                        تنشيط الحساب والسماح بالدخول الفوري بالبريد
                      </label>
                    </div>
                  )}

                  {/* Committees Linkage (ربط الموظف باللجان) */}
                  <div className="col-span-1 sm:col-span-2 border border-gray-200 bg-gray-50/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                      <span className="text-xs font-extrabold text-gray-700 block">
                        الربط والتحميل على اللجان القطاعية
                      </span>
                      <span className="text-[10px] text-brand bg-brand/10 px-2.5 py-1 rounded-full font-extrabold">
                        {formCommittees.length} لجان مسندة
                      </span>
                    </div>

                    {[ "SYS_ADMIN", "DEPT_HEAD", "MANAG_DIR" ].includes(currentUserRole) ? (
                      <>
                        <p className="text-[11px] text-gray-500 font-bold leading-normal">
                          يمكنك اختيار لجنة أو أكثر ليسند تنظيمها وإدارتها لهذا الموظف:
                        </p>
                        {dbCommittees && dbCommittees.filter((c: any) => c && c.active !== false).length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                            {dbCommittees
                              .filter((c: any) => c && c.active !== false)
                              .map((comm: any) => {
                                const isSelected = formCommittees.includes(comm.name);
                                return (
                                  <label
                                    key={comm.id || comm.name}
                                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg border text-right cursor-pointer transition-all select-none ${
                                      isSelected
                                        ? "bg-brand/5 border-brand text-brand font-bold"
                                        : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormCommittees([...formCommittees, comm.name]);
                                        } else {
                                          setFormCommittees(formCommittees.filter((name) => name !== comm.name));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex flex-col text-right">
                                      <span className="text-xs font-bold">{comm.name}</span>
                                      {comm.specialist && comm.specialist !== "غير محدد" && comm.specialist !== "غير معين" && comm.specialist !== formName && (
                                        <span className="text-[10px] text-amber-600 font-bold mt-0.5">
                                          (مكلف حالياً للأخصائي: {comm.specialist})
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center p-4 bg-white border border-dashed border-gray-200 rounded-lg">
                            <span className="text-xs text-gray-400 font-bold">لا توجد لجان قطاعية نشطة مسجلة في النظام حالياً</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-gray-400 font-bold leading-normal">
                          عرض اللجان المسندة حالياً لهذا الموظف (يمكن تعديلها فقط بواسطة مدراء النظام والقطاعات):
                        </p>
                        {formCommittees.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {formCommittees.map((cName) => (
                              <span
                                key={cName}
                                className="inline-flex items-center bg-brand/5 border border-brand/20 text-brand px-2.5 py-1 rounded-md text-xs font-bold"
                              >
                                {cName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 block italic mt-1 text-right">
                            لا يوجد لجان قطاعية مسندة لهذا الموظف حتى الآن.
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Page Access Permissions - Checkboxes */}
                  <div className="col-span-1 sm:col-span-2 border border-gray-200 bg-gray-50/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                      <span className="text-xs font-extrabold text-gray-700 block">
                        صلاحيات عرض صفحات النظام المخصصة (من صلاحيات مدير النظام)
                      </span>
                      <span className="text-[10px] text-brand bg-brand/10 px-2.5 py-1 rounded-full font-extrabold">
                        {formAllowedPages.length || 9} صفحات نشطة مصرح بها
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-gray-500 font-bold leading-normal">
                      ضع علامة صح أمام الصفحات التي تود ظهورها لهذا الموظف (إذا لم يتم اختيار أي صفحة، ستظهر كافة الصفحات افتراضياً):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                      {[
                        { path: "/", label: "شاشة المتابعة (لوحة التحكم)" },
                        { path: "/committees", label: "تشكيل اللجان" },
                        { path: "/members", label: "سجل الأعضاء" },
                        { path: "/events", label: "الفعاليات" },
                        { path: "/recommendations", label: "التوصيات القطاعية" },
                        { path: "/tasks", label: "المهام الإدارية" },
                        { path: "/reports", label: "التقارير" },
                        { path: "/library", label: "المكتبة الرقمية" },
                        { path: "/org-chart", label: "الهيكل الإداري والرقابة" }
                      ].map((pg) => {
                        const isSelected = formAllowedPages.includes(pg.path) || formAllowedPages.length === 0;
                        const isSysAdmin = currentUserRole === "SYS_ADMIN";
                        return (
                          <label
                            key={pg.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-right transition-all select-none ${
                              isSysAdmin ? "cursor-pointer" : "opacity-80"
                            } ${
                              isSelected
                                ? "bg-emerald-50/40 border-emerald-300 text-emerald-800 font-bold"
                                : "bg-white border-gray-200 text-gray-500"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isSysAdmin}
                              onChange={(e) => {
                                if (!isSysAdmin) return;
                                let currentSelected = [...formAllowedPages];
                                // If first time unchecking and all pages were active by default (empty array)
                                if (formAllowedPages.length === 0) {
                                  // initialize with all except current pg
                                  currentSelected = [
                                    "/",
                                    "/committees",
                                    "/members",
                                    "/events",
                                    "/recommendations",
                                    "/tasks",
                                    "/reports",
                                    "/library",
                                    "/org-chart"
                                  ];
                                }
                                
                                if (e.target.checked) {
                                  if (!currentSelected.includes(pg.path)) {
                                    currentSelected.push(pg.path);
                                  }
                                } else {
                                  currentSelected = currentSelected.filter(p => p !== pg.path);
                                }
                                setFormAllowedPages(currentSelected);
                              }}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex flex-col text-right">
                              <span className="text-xs font-semibold">{pg.label}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  
                </div>

                {/* Avatar selection rule wrapper */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-2.5">
                  <span className="block text-[11px] font-black text-gray-500">اختر صورة الموظف الرمزية:</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((av, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormPhoto(av)}
                        className={`w-10 h-10 rounded-xl overflow-hidden ring-2 cursor-pointer transition-all ${
                          formPhoto === av ? "ring-brand scale-105" : "ring-transparent hover:scale-102"
                        }`}
                      >
                        <img src={av} alt="avatar option" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    
                    {/* Custom Base64 upload file selector */}
                    <label className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand flex items-center justify-center cursor-pointer text-gray-400 hover:text-brand transition-all relative">
                      <Plus className="w-5 h-5 shrink-0" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (reader.result) {
                                compressImage(reader.result.toString(), (comp) => {
                                  setFormPhoto(comp);
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black cursor-pointer transition-all"
                  >
                    إلغاء التراجع
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-all flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. AUXILIARY MODAL: SINGLE EMPLOYEE COMMITTEES UNDER MANAGEMENT VIEW */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl p-5 w-full max-w-md relative z-10 text-right"
            >
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-extrabold text-sm text-gray-900 mb-2">
                اللجان القطاعية المربوطة بالأخصائي: {selectedEmployee.name}
              </h3>
              <p className="text-[11px] text-gray-500 mb-4 font-semibold">
                تحرير اللجان المرتبطة بالمشرف المباشر. يمكنك إلغاء ارتباط المشرف باللجان لتفويضها لموظف آخر.
              </p>

              <div className="space-y-2 border-t border-gray-100 pt-3 max-h-60 overflow-y-auto custom-scrollbar">
                {(selectedEmployee.committees || []).length === 0 ? (
                  <span className="text-gray-450 text-xs block text-center py-4">لم يتم ربط هذا الموظف بأي لجان بعد.</span>
                ) : (
                  selectedEmployee.committees.map((comName, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-gray-800">{comName}</span>
                      
                      {currentUserRole === "SYS_ADMIN" && (
                        <button
                          onClick={() => handleRemoveCommitteeFromEmployee(comName)}
                          className="p-1 px-2 text-[10px] bg-red-50 hover:bg-red-100 text-red-650 rounded border border-red-100 cursor-pointer transition-all"
                        >
                          إلغاء الارتباط
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL DIALOG: SYSTEM PURGE DANGER CONFIRM */}
      <AnimatePresence>
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isPurging) setShowPurgeConfirm(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 w-full max-w-md relative z-10 text-center space-y-5"
            >
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-110">
                <ShieldAlert className="w-8 h-8 text-red-650 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-black text-gray-900">تأكيد أمني قصوى: إعادة ضبط المصنع الشامل</h3>
                <p className="text-xs text-red-650 leading-relaxed font-extrabold pr-2">
                  تنبيه: سيؤدي هذا الإجراء إلى حذف وتصفير وحصار كافة اللجان القطاعية، الموظفين، الأعضاء، الاجتماعات، المحاضر، التوصيات والمهام الإدارية نهائياً من قاعدة الجناح السحابي Firestore والتخزين المؤقت المحلي!
                </p>
                <p className="text-[11px] text-gray-450 leading-relaxed font-bold">
                  سيتم الاحتفاظ فقط بحساب مدير النظام الرئيسي لمنع فقدان التحكم.
                </p>
              </div>

              {purgeSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black animate-pulse">
                  ✓ تم تصفير قاعدة البيانات بنجاح! جاري تحويل وتحديث النافذة...
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {purgeError && (
                    <p className="text-[11px] text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-100">{purgeError}</p>
                  )}

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={isPurging}
                      onClick={handlePurgeEntireSystem}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isPurging ? "جاري الحذف والتصفير..." : "نعم، متأكد تصفير الكل"}
                    </button>
                    
                    <button
                      type="button"
                      disabled={isPurging}
                      onClick={() => setShowPurgeConfirm(false)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-black cursor-pointer transition-all"
                    >
                      تراجع وإلغاء
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
