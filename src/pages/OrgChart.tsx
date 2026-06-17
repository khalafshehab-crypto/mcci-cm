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
  Upload
} from "lucide-react";
import { useFirestoreCollection } from "../lib/firebaseUtils";

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
  const [activeTab, setActiveTab] = useState<"hierarchy" | "transfer" | "approvals" | "logs">("hierarchy");

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
  const { data: dbJoinRequests, addDocument: addFirebaseReq, deleteDocument: deleteFirebaseReq } = useFirestoreCollection<JoinRequest>("join_requests", []);
  const { data: dbApprovedEmails, addDocument: addFirebaseAppr, deleteDocument: deleteFirebaseAppr } = useFirestoreCollection<ApprovedEmail>("approved_emails", []);
  const { data: dbSystemLogs, addDocument: addFirebaseLog } = useFirestoreCollection<SystemLog>("system_logs", []);
  
  // Auxiliary collections to facilitate deep background transfer
  const { data: dbCommittees, updateDocument: updateFirebaseComm } = useFirestoreCollection<any>("committees", []);
  const { data: dbTasks, updateDocument: updateFirebaseTask } = useFirestoreCollection<any>("tasks", []);
  const { data: dbEvents, updateDocument: updateFirebaseEvent } = useFirestoreCollection<any>("events", []);
  const { data: dbRecommendations, updateDocument: updateFirebaseRec } = useFirestoreCollection<any>("recommendations", []);

  // UI state for search, filters, modals, and actions
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
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
  const [originalEditId, setOriginalEditId] = useState("");

  // Restrict tabs for non-SYS_ADMIN users
  useEffect(() => {
    if (currentUserRole !== "SYS_ADMIN" && activeTab !== "hierarchy") {
      setActiveTab("hierarchy");
    }
  }, [currentUserRole, activeTab]);
  
  // تنظيف تلقائي وتلقيم لتنقية كادر "خلف شهاب الدين" والمسميات القديمة والاحتفاظ بنسخة وحيدة نشطة
  useEffect(() => {
    if (dbEmployees && dbEmployees.length > 0) {
      dbEmployees.forEach(async (emp: any) => {
        const nameClean = (emp.name || "").trim();
        const jobTitleClean = (emp.jobTitle || "").trim();
        
        if (nameClean === "خلف شهاب الدين" || nameClean.includes("خلف شهاب الدين") || jobTitleClean === "مدير النظام والرقابة" || (nameClean === "شهاب الدين" && emp.id === "221550")) {
          console.log(`[Homing Cleanup OrgChart] Deleting target: ${emp.name} (ID: ${emp.id})`);
          await deleteFirebaseEmp(emp.id);
        }
        
        if (nameClean === "شهاب الدين" && emp.id === "01" && (emp.jobTitle !== "مشرف النظام" || !emp.active)) {
          console.log(`[Homing Cleanup OrgChart] Enforcing correct properties for: ${emp.name} (ID: ${emp.id})`);
          await updateFirebaseEmp(emp.id, {
            jobTitle: "مشرف النظام",
            roleAr: "مشرف النظام",
            active: true
          });
        }
      });
    }
  }, [dbEmployees]);
  
  // Whitelist Email state fields
  const [whitelistEmailStr, setWhitelistEmailStr] = useState("");
  const [whitelistNameStr, setWhitelistNameStr] = useState("");
  const [whitelistRoleAr, setWhitelistRoleAr] = useState("أخصائي لجان قطاعية");

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

  // System Logs search & filters
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");

  // Derived helper states for form dropdowns selection rules
  const hasSysAdmin = dbEmployees.some(emp => emp.id !== (isEditing ? originalEditId : formId) && emp.role === "SYS_ADMIN");
  const hasMgmtDir = dbEmployees.some(emp => emp.id !== (isEditing ? originalEditId : formId) && emp.role === "MANAG_DIR");
  const hasDeptHead = dbEmployees.some(emp => emp.id !== (isEditing ? originalEditId : formId) && emp.role === "DEPT_HEAD");

  const assignedCommitteeNames = dbEmployees
    .filter(emp => emp.id !== (isEditing ? originalEditId : formId))
    .flatMap(emp => emp.committees || []);

  const activeCommittees = dbCommittees.filter((comm: any) => comm.active !== false);
  const availableCommittees = activeCommittees.filter((comm: any) => !assignedCommitteeNames.includes(comm.name));

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("يرجى اختيار ملف صورة صالح (jpg, png, jpeg).");
    }
  };

  // Trigger immediate log registration
  const reportSystemLog = async (type: string, details: string, status: "ناجحة" | "مرفوضة" = "ناجحة") => {
    let activeUser = "نظام الحوكمة الذكي";
    try {
      const stored = localStorage.getItem("current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) activeUser = parsed.name;
      }
    } catch (_) {}

    const newLog: Omit<SystemLog, 'id'> = {
      employeeName: activeUser,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operationType: type,
      status,
      details
    };
    await addFirebaseLog(newLog);
  };

  // 1. ADD / EDIT EMPLOYEE ACTION HANDLER
  const openAddModal = () => {
    setIsEditing(false);
    setOriginalEditId("");
    setFormCommittees([]);
    setFormId(Math.floor(1000 + Math.random() * 9000).toString());
    setFormName("");
    setFormRole("SPECIALIST");
    setFormJobTitle("أخصائي لجان قطاعية");
    setFormPhone("");
    setFormExtension("");
    setFormEmail("");
    setFormPhoto("");
    setFormActive(true);
    setFormPassword("123456");
    setShowFormModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setIsEditing(true);
    setOriginalEditId(emp.id);
    setFormId(emp.id);
    setFormCommittees(emp.committees || []);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormJobTitle(emp.jobTitle);
    setFormPhone(emp.phone);
    setFormExtension(emp.extension || "");
    setFormEmail(emp.email);
    setFormPhoto(emp.photo);
    setFormActive(emp.active);
    setFormPassword(emp.password || "********");
    setShowFormModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert("يرجى ملء الحقول الإلزامية الأساسية.");
      return;
    }

    // Role, permission and security checks
    if (currentUserRole !== "SYS_ADMIN") {
      if (!isEditing) {
        alert("عذراً، لا تملك الصلاحية لإضافة موظفين جدد للنظام.");
        return;
      }
      if (originalEditId !== currentUser?.id) {
        alert("عذراً، يمكنك فقط تعديل بيانات ملفك الشخصي فقط، ولا تملك صلاحية تعديل بيانات موظف آخر.");
        return;
      }
    }

    const originalEmp = dbEmployees.find(emp => emp.id === (isEditing ? originalEditId : formId));

    const roleMapper: Record<string, string> = {
      SYS_ADMIN: "مشرف النظام",
      MANAG_DIR: "مدير إدارة لجان",
      DEPT_HEAD: "رئيس قسم لجان",
      SPECIALIST: "أخصائي لجان"
    };

    const jobTitleMapper: Record<string, string> = {
      SYS_ADMIN: "مشرف النظام",
      MANAG_DIR: "مدير إدارة لجان قطاعية",
      DEPT_HEAD: "رئيس قسم لجان قطاعية",
      SPECIALIST: "أخصائي لجان قطاعية"
    };

    // Auto-computed job title based on selected system role
    const computedJobTitle = isEditing && currentUserRole !== "SYS_ADMIN" && originalEmp 
      ? originalEmp.jobTitle 
      : (jobTitleMapper[formRole] || "أخصائي لجان قطاعية");

    const payload: Omit<Employee, 'id'> = {
      name: formName,
      role: isEditing && currentUserRole !== "SYS_ADMIN" && originalEmp ? originalEmp.role : formRole,
      roleAr: isEditing && currentUserRole !== "SYS_ADMIN" && originalEmp ? originalEmp.roleAr : (roleMapper[formRole] || "أخصائي لجان"),
      jobTitle: computedJobTitle,
      phone: formPhone,
      extension: formExtension,
      email: formEmail,
      photo: formPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      active: isEditing && currentUserRole !== "SYS_ADMIN" && originalEmp ? originalEmp.active : formActive,
      committees: formCommittees,
      joinDate: isEditing ? (dbEmployees.find(emp => emp.id === originalEditId)?.joinDate || new Date().toISOString().split('T')[0].replace(/-/g, '/')) : new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      password: formPassword
    };

    try {
      if (isEditing) {
        if (formId !== originalEditId) {
          // Enforce unique check for new ID
          const IDExists = dbEmployees.some(emp => emp.id === formId);
          if (IDExists) {
            alert("الرقم الوظيفي الجديد مأخوذ بالفعل من قبل موظف آخر.");
            return;
          }

          // Create document with new ID
          await updateFirebaseEmp(formId, payload);
          // Delete old document
          await deleteFirebaseEmp(originalEditId);

          // Update loggedInUser in localStorage if self-editing
          try {
            const stored = localStorage.getItem("current_user");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.id === originalEditId) {
                localStorage.setItem("current_user", JSON.stringify({ ...payload, id: formId }));
              }
            }
          } catch (err) {
            console.error(err);
          }

          await reportSystemLog("تعديل موظف", `تم تحديث ملف الموظف وتغيير الرقم الوظيفي من [${originalEditId}] إلى [${formId}] بنجاح.`);
        } else {
          await updateFirebaseEmp(formId, payload);

          // Update loggedInUser in localStorage if self-editing
          try {
            const stored = localStorage.getItem("current_user");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && parsed.id === formId) {
                localStorage.setItem("current_user", JSON.stringify({ ...payload, id: formId }));
              }
            }
          } catch (err) {
            console.error(err);
          }

          await reportSystemLog("تعديل موظف", `تم تحديث بيانات الموظف [${formName}] الرقم الوظيفي [${formId}] بنجاح.`);
        }
      } else {
        // Enforce unique check for ID
        const IDExists = dbEmployees.some(emp => emp.id === formId);
        const actualId = IDExists ? `${formId}_${Math.floor(Math.random() * 1000)}` : formId;
        
        await updateFirebaseEmp(actualId, payload);
        await reportSystemLog("إنشاء موظف جديد", `تم إدراج كادر جديد للهيكل [${formName}] في النظام بنجاح.`);
      }
      setShowFormModal(false);
    } catch (err: any) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الملف.");
    }
  };

  // Toggle active status straight from card
  const handleToggleActiveStatus = async (emp: Employee) => {
    if (currentUserRole !== "SYS_ADMIN") {
      alert("عذراً، تقتصر صلاحية تغيير حالة حساب الموظف (نشط/غير نشط) على مدير النظام فقط.");
      return;
    }
    const nextState = !emp.active;
    try {
      await updateFirebaseEmp(emp.id, { active: nextState });
      await reportSystemLog(
        "تعديل حالة موظف", 
        `تم تحويل حالة كادر العمل [${emp.name}] إلى [${nextState ? "نشط" : "غير نشط"}] بنجاح.`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (emp: Employee) => {
    if (currentUserRole !== "SYS_ADMIN") {
      alert("عذراً، لا تملك الصلاحية لحذف الموظف. تقتصر هذه العملية على مدير النظام فقط.");
      return;
    }
    if (!window.confirm(`هل أنت متأكد تماماً من حذف الموظف [${emp.name}] من قاعدة بيانات الهيكل الغرفي؟`)) {
      return;
    }
    try {
      await deleteFirebaseEmp(emp.id);
      await reportSystemLog("حذف موظف", `تمت إزالة الموظف [${emp.name}] بشكل كامل من النظام.`);
      if (selectedEmployee?.id === emp.id) setSelectedEmployee(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. REGISTRATION APPROVAL & WHITELISTEMAILS
  const handleApproveJoinRequest = async (req: JoinRequest) => {
    try {
      const parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      const payload: Omit<Employee, 'id'> = {
        name: req.name,
        role: "SPECIALIST",
        roleAr: "أخصائي اللجان",
        jobTitle: "أخصائي لجان قطاعية معتمد",
        phone: req.phone,
        email: req.email,
        photo: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        committees: [],
        active: true,
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      await updateFirebaseEmp(parsedId, payload);
      await deleteFirebaseReq(req.id);
      await reportSystemLog("اعتماد طلب انضمام", `تمت الموافقة على انضمام الموظف [${req.name}] وتعيينه بالرقم [${parsedId}].`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectJoinRequest = async (req: JoinRequest) => {
    if (!window.confirm(`هل تود بالتأكيد رفض طلب إنضمام [${req.name}]؟`)) return;
    try {
      await deleteFirebaseReq(req.id);
      await reportSystemLog("رفض طلب انضمام", `تم رفض طلب تسجيل الموظف [${req.name}] وتطهير الطلب من الطابور.`, "مرفوضة");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWhitelistEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistEmailStr || !whitelistNameStr) return;

    try {
      const generatedId = `whitelist_${Math.random().toString(36).substring(2, 9)}`;
      let currentAdmin = "شهاب الدين";
      try {
        const stored = localStorage.getItem("current_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) currentAdmin = parsed.name;
        }
      } catch (_) {}

      const newItem: ApprovedEmail = {
        id: generatedId,
        email: whitelistEmailStr.trim().toLowerCase(),
        name: whitelistNameStr.trim(),
        roleAr: whitelistRoleAr,
        approvedBy: currentAdmin,
        approvedDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      await deleteFirebaseAppr(generatedId); // ensure unique keying safely in list
      // Add domain whitelist item
      await addFirebaseAppr(newItem);
      await reportSystemLog("إضافة بريد معتمد", `تم إدراج البريد المعمّد [${whitelistEmailStr}] لصالح الموظف [${whitelistNameStr}].`);
      
      setWhitelistEmailStr("");
      setWhitelistNameStr("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveApprovedEmail = async (approved: ApprovedEmail) => {
    if (!window.confirm(`هل ترغب فعلاً في حذف هذا البريد المعتمد [${approved.email}]؟`)) return;
    try {
      await deleteFirebaseAppr(approved.id);
      await reportSystemLog("سحب بريد معتمد", `تم سحب الاعتماد المسبق للبريد الإلكتروني [${approved.email}].`);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. TRANSFER OF ACTIVE DUTIES (نقل وتفويض الأعمال والمسؤوليات)
  const handleTransferJobs = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccess("");
    setTransferError("");
    
    if (!sourceEmpId || !targetEmpId) {
      setTransferError("الرجاء الحرص على انتقاء الموظف المنقول منه والموظف البديل أولاً.");
      return;
    }
    
    if (sourceEmpId === targetEmpId) {
      setTransferError("الحقلين متطابقان! لا تدعم قواعد النظام محاكاة نقل المهام إلى نفس الشخص.");
      return;
    }
    
    const sourceEmp = dbEmployees.find(emp => emp.id === sourceEmpId);
    const targetEmp = dbEmployees.find(emp => emp.id === targetEmpId);
    
    if (!sourceEmp || !targetEmp) {
      setTransferError("عذراً، لم تنجح خوارزمية البحث في العثور على سجل الموظفين المحددين.");
      return;
    }
    
    setIsTransferring(true);
    let logMsgParts: string[] = [];
    
    try {
      // Step A: Transfer Sectoral Committees (اللجان المشرف عليها)
      if (transferCommittees) {
        const commsToTransfer = sourceEmp.committees || [];
        if (commsToTransfer.length > 0) {
          // Merge lists avoiding duplication
          const updatedTargetComms = Array.from(new Set([...(targetEmp.committees || []), ...commsToTransfer]));
          const updatedSourceComms = (sourceEmp.committees || []).filter(c => !commsToTransfer.includes(c));
          
          await updateFirebaseEmp(sourceEmp.id, { committees: updatedSourceComms });
          await updateFirebaseEmp(targetEmp.id, { committees: updatedTargetComms });
          
          // Go to Committees collection and update 'specialist' or specialistId with the target's name
          for (const commName of commsToTransfer) {
            const matchedComm = dbCommittees.find((c: any) => c.name === commName);
            if (matchedComm) {
              await updateFirebaseComm(String(matchedComm.id), { 
                specialist: targetEmp.name,
                specialistId: targetEmp.id,
                specialistName: targetEmp.name
              });
            }
          }
          logMsgParts.push(`اللجان المشرف عليها (${commsToTransfer.length} لجنة)`);
        }
      }
      
      // Step B: Transfer Direct Tasks (المهام الإدارية المباشرة)
      if (transferTasks) {
        const matchingTasks = dbTasks.filter((t: any) => t.assignedTo === sourceEmp.name || t.assignedToId === sourceEmp.id);
        if (matchingTasks.length > 0) {
          for (const task of matchingTasks) {
            await updateFirebaseTask(String(task.id), { 
              assignedTo: targetEmp.name,
              assignedToId: targetEmp.id 
            });
          }
          logMsgParts.push(`المهام الإدارية الموجهة (${matchingTasks.length} مهمة)`);
        }
      }
      
      // Step C: Transfer Schedule Events & Meetings (الفعاليات المجدولة)
      if (transferEvents) {
        const matchingEvents = dbEvents.filter((evt: any) => Array.isArray(evt.employees) && evt.employees.includes(sourceEmp.name));
        if (matchingEvents.length > 0) {
          for (const evt of matchingEvents) {
            const updatedEmps = evt.employees.map((name: string) => name === sourceEmp.name ? targetEmp.name : name);
            await updateFirebaseEvent(String(evt.id), { employees: updatedEmps });
          }
          logMsgParts.push(`الاجتماعات والمحاضر المجدولة (${matchingEvents.length} فعالية)`);
        }
      }
      
      // Step D: Transfer Recommendations Followups (تحديثات متابعة التوصيات والقرارات)
      if (transferRecs) {
        const matchingRecs = dbRecommendations.filter((r: any) => r.assignedTo === sourceEmp.name);
        if (matchingRecs.length > 0) {
          for (const rec of matchingRecs) {
            await updateFirebaseRec(String(rec.id), { assignedTo: targetEmp.name });
          }
          logMsgParts.push(`متابعة التوصيات والقرارات (${matchingRecs.length} توصية قطاعية)`);
        }
      }
      
      const summaryMsg = logMsgParts.length > 0 
        ? `تم تفويض: ${logMsgParts.join("، ")}`
        : "الموظف المذكور ليس لديه لجان أو مهام أو قرارات نشطة حالياً في قواعد النظام لنقلها.";
      
      // Submit log
      await reportSystemLog(
        "نقل وتفويض أعمال", 
        `نظامية النقل: تم ترحيل كامل مسؤوليات الموظف [${sourceEmp.name}] إلى الموظف المستلم [${targetEmp.name}]. حزمة البيانات: ${summaryMsg}`
      );
      
      setTransferSuccess(`تم نقل وتفويض كامل الصلاحيات والمسؤوليات بنجاح من كادر [${sourceEmp.name}] إلى كادر [${targetEmp.name}] وتحديث كافة السجلات والمهام التابعة بحوكمة أمنية تامة!`);
      
      // Clear selections
      setSourceEmpId("");
      setTargetEmpId("");
    } catch (e: any) {
      console.error(e);
      setTransferError(`حدث فشل غير متوقع في عملية التفويض الإلكتروني: ${e.message || e}`);
    } finally {
      setIsTransferring(false);
    }
  };

  // Filter out SYS_ADMIN accounts if logged-in user is not SYS_ADMIN
  const visibleEmployees = dbEmployees.filter(emp => {
    if (emp.role === "SYS_ADMIN" && currentUserRole !== "SYS_ADMIN") {
      return false;
    }
    return true;
  });

  // FILTERED STAFF COMPUTATION
  const filteredEmployees = visibleEmployees.filter(emp => {
    const matchSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.id.includes(searchTerm);
      
    const matchRole = roleFilter === "ALL" ? true : emp.role === roleFilter;
    const matchStatus = statusFilter === "ALL" ? true : (statusFilter === "ACTIVE" ? emp.active === true : emp.active === false);
    
    return matchSearch && matchRole && matchStatus;
  });

  // FILTERED AUDIT LOGS COMPUTATION
  const filteredLogs = dbSystemLogs.filter(log => {
    const matchSearch = 
      log.employeeName.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
      log.operationType.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase());
      
    const matchStatus = logStatusFilter === "ALL" ? true : log.status === logStatusFilter;
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans pb-12 text-right" dir="rtl">
      
      {/* 1. TOP HERO REGISTRATION / BAR */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-1 rounded-full border border-blue-150 uppercase tracking-wide">أمن وحوكمة الأنظمة</span>
          <h1 className="text-xl font-black text-gray-950 mt-2 font-sans">صفحة الهيكل الإداري وضوابط الأمان الفيدرالية</h1>
          <p className="text-xs text-gray-500 font-bold mt-1 max-w-2xl leading-relaxed">
            البوابة المتكاملة للتحكم برتب الموظفين، التحويل الفوري لحالة الكادر (نشط/غير نشط)، تفويض ونقل حزم اللجان والمهام، ومراقبة تتبع العمليات والاعتمادات في الغرفة.
          </p>
        </div>
        {currentUserRole === "SYS_ADMIN" && (
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-11 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>إضافة موظف معتمد جديد</span>
          </button>
        )}
      </div>

      {/* 2. TABBED DEVIATION CONTROLS */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1.5 select-none">
        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "hierarchy" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>الهيكل الوظيفي والموظفين</span>
        </button>

        {currentUserRole === "SYS_ADMIN" && (
          <>
            <button
              onClick={() => setActiveTab("transfer")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "transfer" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 shrink-0" />
              <span>نقل وتفويض الأعمال والمهمات ⇄</span>
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "approvals" ? "bg-slate-900 text-white shadow-sm animate-pulse" : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>اعتماد الموظفين والبريد Whitelist</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "logs" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:text-gray-900"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>سجل مراقبة النظام والعمليات</span>
            </button>
          </>
        )}
      </div>

      {/* 3. MULTI-TAB DISPLAY PANEL */}
      <AnimatePresence mode="wait">
        
        {/* ========================================================== */}
        {/* TAB A: الهيكل الوظيفي والموظفين */}
        {/* ========================================================== */}
        {activeTab === "hierarchy" && (
          <motion.div
            key="hierarchy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* SEARCH AND FILTERS BOX */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute right-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، المسمى الوظيفي، البريد، أو الرقم الوظيفي..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10.5 pr-10 pl-4 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                />
              </div>

              {/* Filter components */}
              <div className="flex gap-2.5 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10.5 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold outline-none focus:ring-2 focus:ring-blue-500 select-none cursor-pointer"
                >
                  <option value="ALL">تصنيف الرتبة (الكل)</option>
                  <option value="SYS_ADMIN">مدير نظام</option>
                  <option value="MANAG_DIR">مدير إدارة لجان</option>
                  <option value="DEPT_HEAD">رئيس قسم لجان</option>
                  <option value="SPECIALIST">أخصائي لجان</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10.5 px-3 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold outline-none focus:ring-2 focus:ring-blue-500 select-none cursor-pointer"
                >
                  <option value="ALL">حالة الحساب (الكل)</option>
                  <option value="ACTIVE">النشطون فقط</option>
                  <option value="INACTIVE">غير النشطين</option>
                </select>
              </div>
            </div>

            {/* MAIN STAFF CARDS LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((emp) => {
                const totalComms = emp.committees?.length || 0;
                
                return (
                  <div 
                    key={emp.id} 
                    className={`bg-white rounded-2xl border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                      emp.active ? "border-gray-200" : "border-red-200 bg-red-50/10"
                    }`}
                  >
                    {/* Active toggle capsule on upper left */}
                    <div className="absolute left-3 top-3 z-10">
                      {currentUserRole === "SYS_ADMIN" ? (
                        <button
                          onClick={() => handleToggleActiveStatus(emp)}
                          title={emp.active ? "انقر لتحويل الموظف إلى حالة غير نشطة" : "انقر لتنشيط حساب الموظف"}
                          className={`text-[9.5px] font-black px-2 py-1 rounded-md shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                            emp.active 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                              : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-150"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.active ? "bg-emerald-500" : "bg-red-500 animate-ping"}`} />
                          <span>{emp.active ? "نشط" : "غير نشط"}</span>
                        </button>
                      ) : (
                        <div
                          className={`text-[9.5px] font-black px-2 py-1 rounded-md shadow-sm flex items-center gap-1.5 ${
                            emp.active 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : "bg-red-50 text-red-700 border border-red-105"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.active ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span>{emp.active ? "نشط" : "غير نشط"}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Inner elements */}
                    <div className="p-5 space-y-4 text-right flex-grow" onClick={() => setSelectedEmployee(emp)}>
                      
                      {/* Avatar header block */}
                      <div className="flex items-center gap-3.5 pt-2">
                        <img 
                          src={emp.photo || PRESET_AVATARS[0]} 
                          alt={emp.name} 
                          className="w-13 h-13 rounded-full object-cover border border-gray-150 shadow-sm shrink-0" 
                        />
                        <div className="space-y-0.5 truncate">
                          <h3 className="font-extrabold text-xs text-slate-900 truncate">{emp.name}</h3>
                          <p className="text-[10px] text-gray-500 font-bold truncate leading-none">{emp.jobTitle}</p>
                          <span className={`inline-block text-[8.5px] font-black px-1.5 py-0.5 rounded mt-1.5 ${
                            emp.role === "SYS_ADMIN" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            emp.role === "MANAG_DIR" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            emp.role === "DEPT_HEAD" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>
                            {emp.roleAr}
                          </span>
                        </div>
                      </div>

                      {/* Details specs */}
                      <div className="space-y-2 text-[10.5px] font-bold text-gray-600 border-t border-gray-100 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">الرقم الوظيفي:</span>
                          <span className="font-mono font-black text-gray-800">{emp.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-sans">البريد الإلكتروني:</span>
                          <span className="font-mono text-gray-800 truncate max-w-[150px]">{emp.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">رقم الجوال:</span>
                          <span className="font-mono text-gray-800">{emp.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom stats and action bar */}
                    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-600 font-extrabold text-[10px]">
                        <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>تحت الإشراف: <strong>{totalComms} لجان</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(currentUserRole === "SYS_ADMIN" || emp.id === currentUser?.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(emp);
                            }}
                            className="p-1 px-2 border border-gray-250 bg-white hover:bg-blue-50/50 hover:text-blue-600 rounded-md transition-all text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>تعديل</span>
                          </button>
                        )}
                        {currentUserRole === "SYS_ADMIN" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmployee(emp);
                            }}
                            disabled={emp.role === "SYS_ADMIN"}
                            title={emp.role === "SYS_ADMIN" ? "لا يمكن حذف حساب مدير النظام الفيدرالي" : ""}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-all shrink-0 disabled:opacity-40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
                  <span className="text-3xl block">👥</span>
                  <p className="text-sm text-gray-500 font-extrabold">عذراً، لم يتم العثور على أي كادر موظفين يطابق الفلاتر النشطة حالياً.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* TAB B: نقل وتفويض الأعمال والمسؤوليات */}
        {/* ========================================================== */}
        {activeTab === "transfer" && (
          <motion.div
            key="transfer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6 max-w-4xl mx-auto text-right"
          >
            <div className="flex gap-3 border-b border-gray-150 pb-4">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600 shrink-0">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">أداة الحوكمة لنقل وتفويض الأعمال الإلكترونية بين الكوادر</h3>
                <p className="text-[11px] text-gray-400 font-bold mt-1 leading-relaxed">
                  نظام حوكمة تلقائي يعمل بمجرد اختيار الموظف المُراد نقل مسؤولياته والموظف المستلم. ستقوم هذه الأداة تلقائياً بالبحث وتعديل وتفويض اللجان والمهام باسم الكادر الجديد.
                </p>
              </div>
            </div>

            {/* Notification bubbles */}
            {transferSuccess && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-xs font-black animate-fadeIn leading-relaxed">
                ✅ {transferSuccess}
              </div>
            )}
            {transferError && (
              <div className="bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl text-xs font-black animate-fadeIn">
                ⚠️ {transferError}
              </div>
            )}

            <form onSubmit={handleTransferJobs} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* SOURCE SELECT ZONE */}
                <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-md">1. نقل صلاحيات وأعمال الموظف (المصدر):</span>
                    <p className="text-[10.5px] text-gray-400 font-bold">بموجب الاعتماد، سيتم سحب المسؤوليات الحالية المختارة من هذا الحساب.</p>
                    
                    <select
                      value={sourceEmpId}
                      required
                      onChange={(e) => setSourceEmpId(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-xl text-xs font-extrabold focus:ring-2 focus:ring-blue-500 outline-none mt-2 cursor-pointer"
                    >
                      <option value="">-- اختر الموظف الأصلي --</option>
                      {visibleEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} (الرقم: {emp.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MINI INFOCARD FOR SOURCE */}
                  {sourceEmpId && (() => {
                    const emp = dbEmployees.find(e => e.id === sourceEmpId);
                    if (!emp) return null;
                    
                    const commLength = emp.committees?.length || 0;
                    const taskLength = dbTasks.filter((t: any) => t.assignedTo === emp.name || t.assignedToId === emp.id).length;
                    const eventLength = dbEvents.filter((ev: any) => Array.isArray(ev.employees) && ev.employees.includes(emp.name)).length;
                    const recLength = dbRecommendations.filter((r: any) => r.assignedTo === emp.name).length;

                    return (
                      <div className="bg-white rounded-xl border border-amber-200 p-3.5 space-y-2 animate-fadeIn text-xs">
                        <div className="flex items-center gap-3">
                          <img src={emp.photo} alt="" className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <span className="font-extrabold block text-slate-900">{emp.name}</span>
                            <span className="text-[10px] text-gray-500 font-bold">{emp.jobTitle}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600 font-extrabold border-t pt-2 mt-1.5 font-sans">
                          <div>🏛️ اللجان المشرف عليها: <span className="font-mono text-amber-700">{commLength}</span></div>
                          <div>📋 المهام الصادرة: <span className="font-mono text-amber-700">{taskLength}</span></div>
                          <div>🕒 فعاليات نشطة: <span className="font-mono text-amber-700">{eventLength}</span></div>
                          <div>🗳️ توصيات قطاعية: <span className="font-mono text-amber-700">{recLength}</span></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* TARGET SELECT ZONE */}
                <div className="bg-slate-50 border border-slate-250 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md">2. نقل وتفويض الأعمال إلى الموظف (المستلم):</span>
                    <p className="text-[10.5px] text-gray-400 font-bold">بموجب الاعتماد، سيتم إدراج المسؤوليات وتعميد كادر العمل الجديد.</p>
                    
                    <select
                      value={targetEmpId}
                      required
                      onChange={(e) => setTargetEmpId(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-gray-300 rounded-xl text-xs font-extrabold focus:ring-2 focus:ring-blue-500 outline-none mt-2 cursor-pointer"
                    >
                      <option value="">-- اختر الكادر المستلم البديل --</option>
                      {visibleEmployees.map(emp => (
                        <option key={emp.id} value={emp.id} disabled={emp.id === sourceEmpId}>
                          {emp.name} (الرقم: {emp.id}) {emp.id === sourceEmpId ? "(غير مسموح كمنقول منه)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* MINI INFOCARD FOR TARGET */}
                  {targetEmpId && (() => {
                    const emp = dbEmployees.find(e => e.id === targetEmpId);
                    if (!emp) return null;

                    return (
                      <div className="bg-white rounded-xl border border-emerald-250 p-3.5 space-y-2 animate-fadeIn text-xs">
                        <div className="flex items-center gap-3">
                          <img src={emp.photo} alt="" className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <span className="font-extrabold block text-slate-900">{emp.name}</span>
                            <span className="text-[10px] text-gray-500 font-bold">{emp.jobTitle}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-150 inline-block font-extrabold mt-1">
                          ✓ الموظف جاهز ومعتمد كبديل أمني في النظام
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* DETAILS SELECTION CHECKBOXES */}
              {sourceEmpId && (
                <div className="bg-slate-50/50 rounded-2xl p-5 border border-gray-200 space-y-4 animate-fadeIn">
                  <span className="text-xs font-black text-slate-900 block">3. حدد حزم البيانات والمسؤوليات المرغوب بنقلها بالكامل:</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${transferCommittees ? "bg-white border-blue-600/30 text-slate-900" : "bg-white border-gray-200 text-gray-400"}`}>
                      <input 
                        type="checkbox" 
                        checked={transferCommittees} 
                        onChange={(e) => setTransferCommittees(e.target.checked)} 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="text-right">
                        <span className="text-xs font-black block">اللجان القطاعية</span>
                        <span className="text-[9.5px] font-bold text-gray-400">
                          ({(dbEmployees.find(e => e.id === sourceEmpId)?.committees || []).length} لجان)
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${transferTasks ? "bg-white border-blue-600/30 text-slate-900" : "bg-white border-gray-200 text-gray-400"}`}>
                      <input 
                        type="checkbox" 
                        checked={transferTasks} 
                        onChange={(e) => setTransferTasks(e.target.checked)} 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="text-right">
                        <span className="text-xs font-black block">المهام المباشرة</span>
                        <span className="text-[9.5px] font-bold text-gray-400">
                          ({(() => {
                            const emp = dbEmployees.find(e => e.id === sourceEmpId);
                            return emp ? dbTasks.filter((t: any) => t.assignedTo === emp.name || t.assignedToId === emp.id).length : 0;
                          })()} مهمة)
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${transferEvents ? "bg-white border-blue-600/30 text-slate-900" : "bg-white border-gray-200 text-gray-400"}`}>
                      <input 
                        type="checkbox" 
                        checked={transferEvents} 
                        onChange={(e) => setTransferEvents(e.target.checked)} 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="text-right">
                        <span className="text-xs font-black block">الفعاليات الحالية</span>
                        <span className="text-[9.5px] font-bold text-gray-400">
                          ({(() => {
                            const emp = dbEmployees.find(e => e.id === sourceEmpId);
                            return emp ? dbEvents.filter((ev: any) => Array.isArray(ev.employees) && ev.employees.includes(emp.name)).length : 0;
                          })()} فعالية)
                        </span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${transferRecs ? "bg-white border-blue-600/30 text-slate-900" : "bg-white border-gray-200 text-gray-400"}`}>
                      <input 
                        type="checkbox" 
                        checked={transferRecs} 
                        onChange={(e) => setTransferRecs(e.target.checked)} 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="text-right">
                        <span className="text-xs font-black block">متابعة التوصيات</span>
                        <span className="text-[9.5px] font-bold text-gray-400">
                          ({(() => {
                            const emp = dbEmployees.find(e => e.id === sourceEmpId);
                            return emp ? dbRecommendations.filter((r: any) => r.assignedTo === emp.name).length : 0;
                          })()} توصية)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* SECURITY STATEMENTS */}
              <div className="bg-amber-50 rounded-2xl p-4.5 border border-amber-250 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-900 font-extrabold text-xs space-y-1">
                  <span>تنفيذ آمن وإقرار إداري:</span>
                  <p className="text-[10.5px] text-amber-800 font-bold leading-relaxed">
                    هذا الخيار سوف يعيد تخصيص كافة الأعمال والمهام المختارة لصالح الكادر المستلم مع تدوين العملية تلقائياً في السجل الفيدرالي لمراقبة عمليات النظام بغرفة مكة المكرمة لحمايتها من الانقطاع.
                  </p>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex items-center justify-end font-sans">
                <button
                  type="submit"
                  disabled={isTransferring || !sourceEmpId || !targetEmpId}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-extrabold text-xs h-12 px-8 rounded-xl shadow-lg hover:shadow-blue-500/10 transition-all flex items-center gap-2.5 cursor-pointer shrink-0"
                >
                  {isTransferring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>جاري نقل وتفويض المسؤوليات التابعة...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>إقرار ونقل وتفويض الأعمال بالكامل ⇄</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* TAB C: اعتماد الموظفين والبريد Whitelist */}
        {/* ========================================================== */}
        {activeTab === "approvals" && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* JOIN REQUESTS COLUMN */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4 text-right">
                <div className="flex items-center gap-2.5 border-b pb-3 border-gray-150">
                  <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-extrabold text-sm text-gray-900">طلبات انضمام الموظفين والمنسقين النشطة</h3>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {dbJoinRequests.map((req) => (
                    <div key={req.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 transition-all hover:bg-slate-100/50">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-extrabold text-xs text-slate-900">{req.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 w-max">{req.requestedRoleAr || "أخصائي لجان"}</p>
                        </div>
                        <span className="text-[9.5px] font-mono font-bold text-gray-400">{req.requestDate}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px] font-bold text-slate-600 font-sans border-t pt-2.5">
                        <div className="truncate">📧 {req.email}</div>
                        <div>📞 {req.phone}</div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApproveJoinRequest(req)}
                          className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>قبول الطلب واعتماد الكادر</span>
                        </button>
                        <button
                          onClick={() => handleRejectJoinRequest(req)}
                          className="px-3 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-extrabold py-2 rounded-lg transition-all cursor-pointer"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  ))}

                  {dbJoinRequests.length === 0 && (
                    <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-500 font-extrabold">لا يوجد طلبات انضمام تتطلب المراجعة حالياً.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* WHITELIST EMAIL MANAGEMENT */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 border-b pb-3 border-gray-150">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-extrabold text-sm text-gray-900">عناوين البريد المسموح بتسجيلها (Whitelist)</h3>
                </div>

                <form onSubmit={handleAddWhitelistEmail} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <span className="text-[10.5px] font-black text-slate-800 block">إضافة بريد معتمد ومصرح مسبقاً بالتسجيل:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="اسم الموظف أو المسمى..."
                      required
                      value={whitelistNameStr}
                      onChange={(e) => setWhitelistNameStr(e.target.value)}
                      className="h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                    <input
                      type="email"
                      placeholder="امتداد البريد المعتمد..."
                      required
                      value={whitelistEmailStr}
                      onChange={(e) => setWhitelistEmailStr(e.target.value)}
                      className="h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <select
                      value={whitelistRoleAr}
                      onChange={(e) => setWhitelistRoleAr(e.target.value)}
                      className="h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-extrabold outline-none focus:ring-2 focus:ring-blue-500 select-none cursor-pointer flex-grow"
                    >
                      <option value="أخصائي لجان قطاعية">أخصائي لجان قطاعية</option>
                      <option value="رئيس قسم لجان">رئيس قسم لجان</option>
                      <option value="أخصائي لجان وتنسيق فعاليات">أخصائي لجان وتنسيق فعاليات</option>
                    </select>
                    
                    <button
                      type="submit"
                      className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-center shrink-0"
                    >
                      تعميد وإضافة للقائمة
                    </button>
                  </div>
                </form>

                {/* whitelisted list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {dbApprovedEmails.map((approved) => (
                    <div key={approved.id} className="bg-slate-50/50 border border-gray-250 rounded-xl p-3 flex justify-between items-center transition-all hover:bg-slate-100/50">
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">{approved.name}</p>
                        <p className="text-[10px] font-mono text-indigo-700 font-bold mt-0.5">{approved.email}</p>
                        <span className="text-[9px] text-gray-400 font-bold block mt-1">تاريخ الاعتماد: {approved.approvedDate} (بواسطة: {approved.approvedBy})</span>
                      </div>

                      <button
                        onClick={() => handleRemoveApprovedEmail(approved)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="إلغاء اعتماد هذا البريد وسحب الصلاحية"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {dbApprovedEmails.length === 0 && (
                    <div className="p-6 text-center text-gray-400 italic text-xs font-bold bg-gray-50/50 rounded-xl">
                      لا يوجد أي عناوين بريد إلكتروني معتمدة حالياً.
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* ========================================================== */}
        {/* TAB D: سجل مراقبة النظام والعمليات */}
        {/* ========================================================== */}
        {activeTab === "logs" && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4 text-right"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3.5 border-gray-150">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
                <h3 className="font-extrabold text-sm text-gray-900">سجل مراقبة العمليات والتحقق الفيدرالي</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-black px-2.5 py-1 rounded-md border text-left">
                العدد الكلي للعمليات المسجلة: {dbSystemLogs.length} عمليات
              </span>
            </div>

            {/* SEACH BAR FOR AUDIT LOGS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث باسم الموظف أو محتوى العملية..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="w-full h-10 pr-9 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="h-10 bg-gray-50 border border-gray-250 rounded-xl text-xs font-extrabold outline-none focus:ring-2 focus:ring-blue-500 select-none cursor-pointer"
              >
                <option value="ALL">تصفية حسب الحالة (الكل)</option>
                <option value="ناجحة">ناجحة مائة بالمائة</option>
                <option value="مرفوضة">مرفوضة / تنبيهات أمنية</option>
              </select>
            </div>

            {/* AUDIT LOG TABLE ROW */}
            <div className="overflow-x-auto border border-gray-250 rounded-xl">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black border-b border-gray-250 select-none">
                    <th className="p-3">اسم كادر العملية</th>
                    <th className="p-3">الوقت والتاريخ</th>
                    <th className="p-3 font-sans">فئة العملية</th>
                    <th className="p-3">تفاصيل الإجراء الإداري والمعاملة</th>
                    <th className="p-3 text-center">أمنية الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 font-bold text-gray-700 transition-all font-sans">
                      <td className="p-3 text-slate-900 font-extrabold">{log.employeeName}</td>
                      <td className="p-3 font-mono text-[10.5px] text-gray-500">{log.time}</td>
                      <td className="p-3">
                        <span className="bg-slate-200/50 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded border border-slate-300">
                          {log.operationType}
                        </span>
                      </td>
                      <td className="p-3 max-w-sm truncate text-gray-600" title={log.details}>{log.details}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                          log.status === "ناجحة" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                            : "bg-red-50 text-red-700 border border-red-250"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-500 italic font-extrabold bg-slate-50/50">
                        مرحباً! لا تتوفر أي قيود تدوين مطابقة للبحث حالياً.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================================== */}
      {/* 4. MODALS ZONE: ADD / EDIT EMPLOYEE */}
      {/* ========================================================== */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Dark background overlay with scale fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right"
            >
              {/* Header block with solid header representation - identical to Committees */}
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {isEditing ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm leading-tight">
                      {isEditing ? `تعديل ملف الموظف: ${formName || "الكادر"}` : "إدراج كادر جديد للهيكل الوظيفي"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">يرجى التأكد من تسجيل البيانات بعناية لربطها بالنظام</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body form */}
              <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
                
                <div className="bg-blue-50/50 border border-blue-150 p-3.5 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <div>
                    <span className="font-extrabold text-blue-900 block text-xs">ملف الكادر الشخصي الرسمي</span>
                    <p className="text-[10px] text-gray-400 font-bold leading-none mt-0.5">يرجى التأكد من مطابقة بيانات الهيكل للبيانات المعتمدة بالغرفة.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الرقم الوظيفي (ID) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الاسم الثلاثي للموظف <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="عبدالله محمد آل سعود"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-right outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الرتبة الصلاحيتية بالنظام <span className="text-red-500">*</span></label>
                    <select
                      value={formRole}
                      onChange={(e) => {
                        const selectedRole = e.target.value as any;
                        setFormRole(selectedRole);
                        const jobTitleMapper: Record<string, string> = {
                          SYS_ADMIN: "مشرف النظام",
                          MANAG_DIR: "مدير إدارة لجان قطاعية",
                          DEPT_HEAD: "رئيس قسم لجان قطاعية",
                          SPECIALIST: "أخصائي لجان قطاعية"
                        };
                        setFormJobTitle(jobTitleMapper[selectedRole] || "أخصائي لجان قطاعية");
                      }}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3 text-xs font-black text-right focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="SPECIALIST">أخصائي لجان (SPECIALIST)</option>
                      {!hasDeptHead && <option value="DEPT_HEAD">رئيس قسم لجان (DEPT_HEAD)</option>}
                      {!hasMgmtDir && <option value="MANAG_DIR">مدير إدارة لجان (MANAG_DIR)</option>}
                      {!hasSysAdmin && <option value="SYS_ADMIN">مشرف النظام (SYS_ADMIN)</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">البريد الإلكتروني للغرفة <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="abdullah@makkahchamber.sa"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left font-mono outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">رقم الجوال الفعال <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="+966500000000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left font-mono outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">التحويلة الداخلية (اختياري)</label>
                    <input
                      type="text"
                      placeholder="104"
                      value={formExtension}
                      onChange={(e) => setFormExtension(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left font-mono outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">كلمة المرور المشفرة <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left font-mono outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Drag and Drop Image File Upload */}
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-black text-gray-700">صورة الموظف الرسمية <span className="text-red-500">*</span></label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all relative ${
                      formPhoto
                        ? "border-emerald-300 bg-emerald-50/20"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="employee-photo-upload"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="employee-photo-upload" className="cursor-pointer block space-y-2">
                      {formPhoto ? (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <img
                            src={formPhoto}
                            alt="الموظف"
                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                          />
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>تم تحميل الصورة بنجاح</span>
                          </span>
                          <p className="text-[10px] text-gray-500 font-medium">اسحب صورة لتغييرها أو انقر للاختيار</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                          <div className="p-2.5 bg-gray-100 rounded-full text-gray-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-black text-gray-700">اسحب صورة الكادر هنا أو انقر للإدراج</p>
                          <p className="text-[10px] text-gray-400 font-medium">يدعم صيغ JPG, PNG, JPEG حتى 2 ميجابايت</p>
                        </div>
                      )}
                    </label>
                    {formPhoto && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setFormPhoto("");
                        }}
                        className="absolute left-3 top-3 p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="حذف الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active switch slider */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center text-right">
                  <div>
                    <span className="font-black text-slate-800 block text-xs">هل الحساب فعال ومصرح باستخدامه؟</span>
                    <span className="text-[10px] text-gray-400 font-bold leading-normal">الموظف غير الفعال سيتم منعه من تحرير وتوقيع محاضر اللجان تلقائياً.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all cursor-pointer shrink-0 flex ${
                      formActive ? "bg-emerald-600 justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <span className="w-4.5 h-4.5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* ربط الموظف باللجان الفعالة */}
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-black text-gray-700">ربط الموظف باللجان الفعالة</label>
                  <p className="text-[10px] text-gray-400 font-bold leading-normal">
                    يمكن ربط هذا الموظف بلجنة واحدة أو أكثر من اللجان النشطة المتاحة بالغرفة المكرمة.
                  </p>
                  <div className="border border-gray-200 rounded-xl p-3 bg-white max-h-36 overflow-y-auto space-y-1.5">
                    {availableCommittees.map((comm: any) => (
                      <label key={comm.id} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-all">
                        <input
                          type="checkbox"
                          checked={formCommittees.includes(comm.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormCommittees(prev => [...prev, comm.name]);
                            } else {
                              setFormCommittees(prev => prev.filter(c => c !== comm.name));
                            }
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{comm.name}</span>
                      </label>
                    ))}
                    {availableCommittees.length === 0 && (
                      <p className="text-[11px] text-gray-400 font-bold text-center py-2">لا توجد لجان فعالة متاحة (كل اللجان الفعالة مرتبطة بموظفين آخرين).</p>
                    )}
                  </div>
                </div>

                {/* Buttons block - identical to Committees */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-150">
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? "حفظ التعديلات الحالية" : "إضافة وتعميد الموظف"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
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

      {/* ========================================================== */}
      {/* 5. MODALS ZONE: PERSONAL STAFF DETAILS VIEW */}
      {/* ========================================================== */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedEmployee(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xl max-w-md w-full relative z-10 text-right space-y-4"
            >
              <div className="flex items-center gap-4 border-b border-gray-150 pb-4">
                <img 
                  src={selectedEmployee.photo} 
                  alt={selectedEmployee.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 shadow-sm shrink-0" 
                />
                <div className="truncate flex-grow">
                  <h3 className="font-extrabold text-sm text-slate-900 truncate">{selectedEmployee.name}</h3>
                  <p className="text-[10.5px] text-gray-500 font-bold truncate leading-none mt-1">{selectedEmployee.jobTitle}</p>
                  
                  <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-2 ${
                    selectedEmployee.role === "SYS_ADMIN" ? "bg-rose-50 text-rose-700 border border-rose-150" :
                    selectedEmployee.role === "MANAG_DIR" ? "bg-amber-50 text-amber-700 border border-amber-150" :
                    selectedEmployee.role === "DEPT_HEAD" ? "bg-purple-50 text-purple-700 border border-purple-150" :
                    "bg-blue-50 text-blue-700 border border-blue-150"
                  }`}>
                    {selectedEmployee.roleAr}
                  </span>
                </div>
              </div>

              {/* dossier content */}
              <div className="space-y-3 leading-normal font-sans text-xs">
                
                <div className="grid grid-cols-2 gap-2 text-right">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-gray-400 font-bold block mb-1">الرقم الوظيفي:</span>
                    <span className="font-mono font-black text-slate-800">{selectedEmployee.id}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-gray-400 font-bold block mb-1">تاريخ التعيين:</span>
                    <span className="font-mono font-black text-slate-800">{selectedEmployee.joinDate}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9.5px] text-gray-400 font-black block">البريد الإلكتروني للغرفة:</span>
                  <p className="font-mono text-indigo-700 font-bold bg-slate-50 p-2 rounded-lg border border-slate-200 text-left truncate">{selectedEmployee.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9.5px] text-gray-400 font-black block">رقم الجوال المعتمد:</span>
                  <p className="font-mono text-slate-800 font-bold bg-slate-50 p-2 rounded-lg border border-slate-200 text-left">{selectedEmployee.phone}</p>
                </div>

                {selectedEmployee.extension && (
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-gray-400 font-black block">التحويلة الداخلية (Extension):</span>
                    <p className="font-mono text-slate-800 font-bold bg-slate-50 p-2 rounded-lg border border-slate-200 text-left">{selectedEmployee.extension}</p>
                  </div>
                )}

                {/* Committees under custody */}
                <div className="space-y-1.5 border-t border-gray-150 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 text-[11px]">اللجان المشرف عليها والمطروحة عهدتها:</span>
                    <span className="text-[9.5px] bg-blue-50 text-blue-700 font-black px-1.5 rounded">{(selectedEmployee.committees || []).length} لجان</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl max-h-24 overflow-y-auto space-y-1 pr-1.5">
                    {(selectedEmployee.committees || []).length === 0 ? (
                      <p className="text-gray-400 italic text-[10.5px] font-bold">لم تخصص له أي لجان رسمية بعد.</p>
                    ) : (
                      (selectedEmployee.committees || []).map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-gray-700 text-[10.5px] font-bold">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Close footer button */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${selectedEmployee.active ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="text-[10px] text-gray-500 font-bold">حالة الكادر الحالية: {selectedEmployee.active ? "نشط ومصرح" : "محظور/غير نشط"}</span>
                </div>
                
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-4.5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[10.5px] rounded-xl cursor-pointer"
                >
                  إغلاق الدوسيه
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
