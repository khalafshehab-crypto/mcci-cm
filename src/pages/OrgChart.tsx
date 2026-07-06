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
  UserPlus,
  User,
  Lock, 
  Sparkles,
  Calendar,
  Layers,
  FileText,
  Printer,
  Database,
  FolderLock,
  Network
} from "lucide-react";
import { useFirestoreCollection } from "../lib/firebaseUtils";

// AVATAR PRESETS - Professional placeholders for visual ease
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", 
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", 
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

export interface OrgNode {
  id: string;
  name: string;
  type: "ROOT" | "STAFF" | "SECTOR" | "DEPARTMENT" | "SECTION" | "JOB_TITLE";
  parent: string; // The name of the parent node
}

export interface Employee {
  id: string; 
  name: string; 
  prefix?: string; 
  role: "SYS_ADMIN" | "SECRETARY_GENERAL" | "EXECUTIVE_OFFICE" | "ASSISTANT_SEC_GEN" | "SECRETARY" | "DEPT_HEAD" | "MANAG_DIR" | "SPECIALIST"; 
  roleAr: string; 
  jobTitle: string; 
  // الهيكل الإداري المتسلسل المعتمد
  orgLevel1?: string; // الأمانة العامة
  orgLevel2?: string; // القطاع
  orgLevel3?: string; // الإدارة
  orgLevel4?: string; // القسم
  orgLevel5?: string; // التخصص الدقيق
  phone: string; 
  extension?: string; 
  email: string; 
  photo: string; 
  committees: string[]; 
  active: boolean; 
  loginEnabled?: boolean; 
  joinDate: string; 
  password?: string; 
  allowedPages?: string[]; 
  canEditDeleteAll?: boolean; 
  canEditOwnCommitteesOnly?: boolean; 
  adminPermissions?: boolean; 
  gender?: "MALE" | "FEMALE" | string; 
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

export function getEmployeePrefix(emp?: { name?: string; gender?: "MALE" | "FEMALE" | string; prefix?: string }) {
  if (!emp) return "الأستاذ";
  if (emp.prefix) return emp.prefix;
  if (emp.gender === "FEMALE") return "الأستاذة";
  if (emp.gender === "MALE") return "الأستاذ";
  const name = emp.name || "";
  const femaleKeywords = [
    "فاطمة", "عائشة", "مريم", "سارة", "نورة", "هند", "أمل", "خلود", "أروى", "منى", 
    "مها", "رنا", "رشا", "عبير", "ريم", "غادة", "دلال", "وفاء", "نهى", "منال", 
    "تهاني", "نجلاء", "ريهام", "دينا", "سلمى", "إيمان", "زينب", "رقية", "أسماء", "هدير"
  ];
  const hasFemaleKeyword = femaleKeywords.some(kw => name.includes(kw));
  if (hasFemaleKeyword || name.trim().endsWith("ة") || name.trim().endsWith("ى") || name.trim().endsWith("اء")) {
    return "الأستاذة";
  }
  return "الأستاذ";
}

export default function OrgChart() {
  const [activeTab, setActiveTab] = useState<"hierarchy" | "org_chart" | "transfer" | "approvals" | "logs" | "permissions" | "master_data">("hierarchy");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Local state for administrative master data console
  const [selectedSubCol, setSelectedSubCol] = useState<string>("committees");
  const [masterSearchQuery, setMasterSearchQuery] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCol, setConfirmDeleteCol] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isAlert?: boolean;
  } | null>(null);

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

  // Load state and collections from Firestore
  const { data: dbEmployees, addDocument: addFirebaseEmp, updateDocument: updateFirebaseEmp, deleteDocument: deleteFirebaseEmp } = useFirestoreCollection<Employee>("employees", []);
  const { data: dbJoinRequests, deleteDocument: deleteFirebaseReq } = useFirestoreCollection<JoinRequest>("join_requests", []);
  const { data: dbApprovedEmails, addDocument: addFirebaseAppr, deleteDocument: deleteFirebaseAppr } = useFirestoreCollection<ApprovedEmail>("approved_emails", []);
  const { data: dbSystemLogs, addDocument: addFirebaseLog } = useFirestoreCollection<SystemLog>("system_logs", []);
  
  // Org Structure Builder Collection
  const { data: dbOrgNodes, addDocument: addOrgNode, updateDocument: updateOrgNode, deleteDocument: deleteOrgNode } = useFirestoreCollection<OrgNode>("org_structure", []);

  // Auxiliary collections
  const { data: dbCommittees, updateDocument: updateFirebaseComm, deleteDocument: deleteFirebaseComm } = useFirestoreCollection<any>("committees", []);
  const { data: dbTasks, updateDocument: updateFirebaseTask, deleteDocument: deleteFirebaseTask } = useFirestoreCollection<any>("tasks", []);
  const { data: dbEvents, updateDocument: updateFirebaseEvent, deleteDocument: deleteFirebaseEvent } = useFirestoreCollection<any>("events", []);
  const { data: dbRecommendations, updateDocument: updateFirebaseRec, deleteDocument: deleteFirebaseRec } = useFirestoreCollection<any>("recommendations", []);
  const { data: dbMembers, updateDocument: updateFirebaseMember, deleteDocument: deleteFirebaseMember } = useFirestoreCollection<any>("members", []);

  const { data: dbReports, deleteDocument: deleteFirebaseReport } = useFirestoreCollection<any>("reports", []);
  const { data: dbKpis, deleteDocument: deleteFirebaseKpi } = useFirestoreCollection<any>("kpis", []);
  const { data: dbTemplates, deleteDocument: deleteFirebaseTemplate } = useFirestoreCollection<any>("templates", []);
  const { data: dbDelegations, addDocument: addFirebaseDelegation, updateDocument: updateFirebaseDelegation } = useFirestoreCollection<any>("delegations", []);

  useEffect(() => {
    if (dbEmployees && dbEmployees.length > 0) {
      localStorage.setItem("app_employees", JSON.stringify(dbEmployees));
    }
  }, [dbEmployees]);

  const safeDbEmployees = React.useMemo(() => {
    return dbEmployees.filter(emp => 
      emp && 
      emp.role !== "SYS_ADMIN" &&
      emp.id !== "01" && 
      emp.id !== "1" &&
      emp.name !== "شهاب الدين" && 
      emp.email?.trim().toLowerCase() !== "khalafshehab@gmail.com" && 
      emp.email?.trim().toLowerCase() !== "khalafshehab-crypto@gmail.com"
    );
  }, [dbEmployees]);

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

    source = (source || []).filter(item => item && typeof item === "object");

    if (!term) return source;
    return source.filter((item) => {
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
      if (collectionName === "committees") await deleteFirebaseComm(itemId);
      else if (collectionName === "members") await deleteFirebaseMember(itemId);
      else if (collectionName === "events") await deleteFirebaseEvent(itemId);
      else if (collectionName === "recommendations") await deleteFirebaseRec(itemId);
      else if (collectionName === "tasks") await deleteFirebaseTask(itemId);
      else if (collectionName === "reports") await deleteFirebaseReport(itemId);
      else if (collectionName === "kpis") await deleteFirebaseKpi(itemId);
      else if (collectionName === "templates") await deleteFirebaseTemplate(itemId);

      await addFirebaseLog({
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        employeeName: currentUser?.name || "مدير النظام",
        operationType: "حذف إداري شامل",
        status: "ناجحة",
        details: `قام مدير النظام بحذف سجل ذو المعرف (${itemId}) نهائياً من مستوعب (${collectionName})`
      } as any);

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
        details: `تغيير حالة فاعلية لجنة (${item.name}) إلى (${nextActive ? 'نشطة' : 'غير نشطة'})`
      } as any);
    } catch (_) {}
  };

  // UI state for search, filters, modals, and actions
  const [searchTerm, setSearchTerm] = useState("");
  const [permSearchTerm, setPermSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Modals for Org Builder
  const [showOrgNodeModal, setShowOrgNodeModal] = useState(false);
  const [orgNodeForm, setOrgNodeForm] = useState<{ id: string; name: string; type: "ROOT" | "STAFF" | "SECTOR" | "DEPARTMENT" | "SECTION" | "JOB_TITLE"; parent: string; isSubcategory?: boolean }>({
    id: "", name: "", type: "ROOT", parent: "", isSubcategory: false
  });

  const handleSaveOrgNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgNodeForm.name.trim()) return;

    let finalParent = orgNodeForm.parent;
    if (orgNodeForm.type === "SECTOR" || (orgNodeForm.type === "STAFF" && !orgNodeForm.parent)) {
      const rootNode = dbOrgNodes.find(n => n.type === "ROOT");
      finalParent = rootNode ? rootNode.name : "الأمانة العامة";
    }

    const payload = { ...orgNodeForm, parent: finalParent };
    delete payload.isSubcategory;

    try {
      if (orgNodeForm.id) {
        const existingNode = dbOrgNodes.find(n => n.id === orgNodeForm.id);
        const oldName = existingNode ? existingNode.name : "";
        const oldParent = existingNode ? existingNode.parent : "";
        await updateOrgNode(orgNodeForm.id, payload);
        
        if (oldName && oldName !== orgNodeForm.name) {
          const children = dbOrgNodes.filter(n => n.parent === oldName);
          for (const child of children) {
            await updateOrgNode(child.id, { parent: orgNodeForm.name });
          }
          
          let levelKey = '';
          if (orgNodeForm.type === 'ROOT') levelKey = 'orgLevel1';
          else if (orgNodeForm.type === 'SECTOR') levelKey = 'orgLevel2';
          else if (orgNodeForm.type === 'DEPARTMENT') levelKey = 'orgLevel3';
          else if (orgNodeForm.type === 'SECTION') levelKey = 'orgLevel4';
          else if (orgNodeForm.type === 'JOB_TITLE') levelKey = 'orgLevel5';
                       
          if (levelKey) {
            const employeesToUpdate = dbEmployees.filter(emp => (emp as any)[levelKey] === oldName);
            for (const emp of employeesToUpdate) {
              await updateFirebaseEmp(emp.id, { [levelKey]: orgNodeForm.name });
            }
          }
        }
        
        if (oldParent && oldParent !== orgNodeForm.parent) {
          if (orgNodeForm.type === 'DEPARTMENT') {
             const employeesToUpdate = dbEmployees.filter(emp => emp.orgLevel3 === orgNodeForm.name);
             for (const emp of employeesToUpdate) {
               await updateFirebaseEmp(emp.id, { orgLevel2: orgNodeForm.parent });
             }
             const children = dbOrgNodes.filter(n => n.parent === orgNodeForm.name);
             for (const child of children) {
                const childEmps = dbEmployees.filter(emp => emp.orgLevel4 === child.name);
                for (const emp of childEmps) {
                  await updateFirebaseEmp(emp.id, { orgLevel2: orgNodeForm.parent });
                }
             }
          } else if (orgNodeForm.type === 'SECTION') {
             const newDept = dbOrgNodes.find(n => n.name === orgNodeForm.parent && n.type === 'DEPARTMENT');
             const newSector = newDept ? newDept.parent : "";
             const employeesToUpdate = dbEmployees.filter(emp => emp.orgLevel4 === orgNodeForm.name);
             for (const emp of employeesToUpdate) {
               await updateFirebaseEmp(emp.id, { orgLevel3: orgNodeForm.parent, orgLevel2: newSector });
             }
             const children = dbOrgNodes.filter(n => n.parent === orgNodeForm.name);
             for (const child of children) {
                const childEmps = dbEmployees.filter(emp => emp.orgLevel5 === child.name && emp.orgLevel4 === orgNodeForm.name);
                for (const emp of childEmps) {
                  await updateFirebaseEmp(emp.id, { orgLevel3: orgNodeForm.parent, orgLevel2: newSector });
                }
             }
          } else if (orgNodeForm.type === 'JOB_TITLE') {
             const newSection = dbOrgNodes.find(n => n.name === orgNodeForm.parent && n.type === 'SECTION');
             const newDept = dbOrgNodes.find(n => n.name === newSection?.parent && n.type === 'DEPARTMENT');
             const newSector = newDept ? newDept.parent : "";
             const employeesToUpdate = dbEmployees.filter(emp => emp.orgLevel5 === orgNodeForm.name && emp.orgLevel4 === oldParent);
             for (const emp of employeesToUpdate) {
               await updateFirebaseEmp(emp.id, { orgLevel4: orgNodeForm.parent, orgLevel3: newDept?.name || "", orgLevel2: newSector });
             }
          }
        }

        await addFirebaseLog({
          employeeName: currentUser?.name || "مدير النظام",
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          operationType: "تعديل هيكل",
          status: "ناجحة",
          details: `تعديل مسمى أو ارتباط العقدة (${orgNodeForm.name}) في الهيكل التنظيمي.`
        } as any);
      } else {
        await addOrgNode({
          name: payload.name.trim(),
          type: payload.type,
          parent: payload.parent
        });
        await addFirebaseLog({
          employeeName: currentUser?.name || "مدير النظام",
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          operationType: "إضافة للهيكل",
          status: "ناجحة",
          details: `إضافة عقدة جديدة (${payload.name}) ${payload.parent ? `تحت (${payload.parent})` : ''}.`
        } as any);
      }
      setShowOrgNodeModal(false);
    } catch (err) {
      console.error(err);
      setConfirmDialog({
        isOpen: true,
        title: "خطأ",
        message: "حدث خطأ أثناء حفظ التحديث في الهيكل.",
        confirmText: "حسناً",
        isAlert: true,
        onConfirm: () => setConfirmDialog(null)
      });
    }
  };

  const handleDeleteOrgNode = async (node: OrgNode) => {
    // Check if there are children
    const hasChildren = dbOrgNodes.some(n => n.parent === node.name);
    if (hasChildren) {
      setConfirmDialog({
        isOpen: true,
        title: "تنبيه",
        message: "لا يمكن حذف هذا المكون لوجود إدارات أو أقسام تتفرع منه. يرجى حذف الفروع أولاً.",
        confirmText: "حسناً",
        isAlert: true,
        onConfirm: () => setConfirmDialog(null)
      });
      return;
    }
    // Check if employees are assigned to it
    const hasEmployees = dbEmployees.some(e => 
      e.orgLevel1 === node.name || e.orgLevel2 === node.name || 
      e.orgLevel3 === node.name || e.orgLevel4 === node.name || 
      e.orgLevel5 === node.name
    );
    if (hasEmployees) {
      setConfirmDialog({
        isOpen: true,
        title: "تنبيه",
        message: "لا يمكن حذف هذا المكون لوجود موظفين مسكنين عليه. يرجى نقل الموظفين أولاً.",
        confirmText: "حسناً",
        isAlert: true,
        onConfirm: () => setConfirmDialog(null)
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "تأكيد حذف من الهيكل",
      message: `هل أنت متأكد من رغبتك في حذف (${node.name}) من الهيكل التنظيمي المعتمد؟`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteOrgNode(node.id);
          await addFirebaseLog({
            employeeName: currentUser?.name || "مدير النظام",
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            operationType: "حذف من الهيكل",
            status: "ناجحة",
            details: `تم حذف العقدة التنظيمية (${node.name}) من الهيكل المعتمد.`
          } as any);
        } catch(err) {
          console.error(err);
          setConfirmDialog({
            isOpen: true,
            title: "خطأ",
            message: "حدث خطأ أثناء الحذف.",
            confirmText: "حسناً",
            isAlert: true,
            onConfirm: () => setConfirmDialog(null)
          });
        }
      }
    });
  };

  const handleRemoveCommitteeFromEmployee = async (committeeName: string) => {
    if (!selectedEmployee) return;
    const currentComms = selectedEmployee.committees || [];
    const updatedComms = currentComms.filter(c => c !== committeeName);
    
    try {
      await updateFirebaseEmp(selectedEmployee.id, { committees: updatedComms });
      const matchedComm = dbCommittees.find(c => c.name === committeeName);
      if (matchedComm) {
        await updateFirebaseComm(matchedComm.id, {
          specialistId: "",
          specialistName: "غير معين"
        });
      }
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
      console.error(error);
    }
  };
  
  // Add / Edit Employee Modal fields state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<Employee["role"]>("SPECIALIST");
  const [formPhone, setFormPhone] = useState("");
  const [formExtension, setFormExtension] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhoto, setFormPhoto] = useState(PRESET_AVATARS[0]);
  const [formPrefix, setFormPrefix] = useState("الأستاذ");
  
  // 5 Levels Hierarchy
  const [formOrgLevel1, setFormOrgLevel1] = useState("الأمانة العامة");
  const [formOrgLevel2, setFormOrgLevel2] = useState("");
  const [formOrgLevel3, setFormOrgLevel3] = useState("");
  const [formOrgLevel4, setFormOrgLevel4] = useState("");
  const [formOrgLevel5, setFormOrgLevel5] = useState(""); // Job Title

  const [formActive, setFormActive] = useState(true);
  const [formLoginEnabled, setFormLoginEnabled] = useState(true);
  const [formPassword, setFormPassword] = useState("");
  const [formCommittees, setFormCommittees] = useState<string[]>([]);
  const [formAllowedPages, setFormAllowedPages] = useState<string[]>([]);
  const [formGender, setFormGender] = useState<"MALE" | "FEMALE">("MALE");
  const [originalEditId, setOriginalEditId] = useState("");



  useEffect(() => {
    if (currentUserRole !== "SYS_ADMIN" && activeTab !== "hierarchy" && activeTab !== "org_chart") {
      setActiveTab("hierarchy");
    }
  }, [currentUserRole, activeTab]);

  const [whitelistEmailStr, setWhitelistEmailStr] = useState("");
  const [whitelistNameStr, setWhitelistNameStr] = useState("");
  const [whitelistRoleAr, setWhitelistRoleAr] = useState("أخصائي لجان");

  const [transferMode, setTransferMode] = useState<"full" | "delegation">("full");
  const [delegationEndDate, setDelegationEndDate] = useState("");
  const [delegatePermissions, setDelegatePermissions] = useState(true);

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

  // Purge State
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [purgeError, setPurgeError] = useState("");

  const handlePurgeEntireSystem = async () => {
    setIsPurging(true);
    setPurgeError("");
    try {
      const collectionsToPurge = [
        "committees", "members", "events", "recommendations", "tasks",
        "system_logs", "templates", "kpis", "reports", "join_requests", "approved_emails", "org_structure"
      ];

      const { collection, getDocs, deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");

      for (const colName of collectionsToPurge) {
        try {
          const snap = await getDocs(collection(db, colName));
          for (const docSnap of snap.docs) {
            await deleteDoc(doc(db, colName, docSnap.id));
          }
        } catch (err) {}
        localStorage.removeItem(`mock_db_${colName}`);
        localStorage.removeItem(`app_${colName}`);
      }

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
      } catch (err) {}

      localStorage.removeItem(`mock_db_employees`);
      localStorage.removeItem(`app_employees`);
      setPurgeSuccess(true);
      
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (e) {
      setPurgeError("حدث خطأ أثناء محاولة تصفير قاعدة البيانات.");
    } finally {
      setIsPurging(false);
    }
  };

  const handleApproveJoinRequest = async (req: JoinRequest) => {
    try {
      const emailLower = req.email.trim().toLowerCase();
      const emailTaken = dbEmployees.some(emp => emp.email?.trim().toLowerCase() === emailLower);
      if (emailTaken) {
        alert(`عذراً، البريد الإلكتروني [${req.email}] مأخوذ.`);
        return;
      }

      let parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      while (dbEmployees.some(emp => emp.id === parsedId)) {
        parsedId = Math.floor(1000 + Math.random() * 9000).toString();
      }
      
      const payload: Omit<Employee, "id"> = {
        name: req.name,
        role: "SPECIALIST",
        roleAr: "أخصائي اللجان",
        jobTitle: "أخصائي",
        orgLevel1: "الأمانة العامة",
        phone: req.phone,
        email: emailLower,
        photo: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        committees: [],
        active: true,
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        gender: (req as any).gender || "MALE"
      };

      await updateFirebaseEmp(parsedId, payload);
      await deleteFirebaseReq(req.id);
      alert(`تمت الموافقة بنجاح وتم توليد رقم وظيفي مؤقت للموظف: ${parsedId}`);
    } catch (error) {
      alert("فشل في اعتماد طلب الانضمام.");
    }
  };

  const handleRejectJoinRequest = async (req: JoinRequest) => {
    setConfirmDialog({
      isOpen: true,
      title: "تأكيد رفض طلب الانضمام",
      message: `هل أنت متأكد من رفض طلب الموظف: ${req.name}؟`,
      onConfirm: async () => {
        try {
          await deleteFirebaseReq(req.id);
          setConfirmDialog(null);
        } catch (error) {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleAddWhitelistEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whitelistEmailStr.trim() || !whitelistNameStr.trim()) return;
    const cleanEmail = whitelistEmailStr.trim().toLowerCase();
    try {
      await addFirebaseAppr({
        email: cleanEmail,
        name: whitelistNameStr.trim(),
        roleAr: whitelistRoleAr,
        approvedBy: currentUser?.name || "مدير النظام",
        approvedDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      });
      setWhitelistEmailStr("");
      setWhitelistNameStr("");
      alert("تمت إضافة الموظف لقائمة البريد المعتمد بنجاح.");
    } catch (error) { }
  };

  const handleRemoveWhitelistEmail = async (appId: string, email: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "تأكيد إلغاء الاعتماد",
      message: "هل أنت متأكد من إلغاء اعتماد هذا البريد؟",
      onConfirm: async () => {
        try {
          await deleteFirebaseAppr(appId);
          setConfirmDialog(null);
        } catch (error) {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      alert("يرجى تعبئة كافة الحقول الأساسية لبطاقة الموظف.");
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const isSysAdmin = currentUserRole === "SYS_ADMIN";
    const isPowerUser = isSysAdmin || currentUserRole === "MANAG_DIR" || currentUserRole === "DEPT_HEAD";

    if (!isPowerUser) {
      if (!isEditing) {
        alert("عذراً، لا تملك صلاحية لإضافة موظفين جدد للنظام.");
        return;
      }
      const myEmp = dbEmployees.find(emp => emp.id === currentUser?.id || emp.email?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase());
      if (originalEditId !== currentUser?.id && !(myEmp && originalEditId === myEmp.id)) {
        alert("تأكد من صلاحياتك.");
        return;
      }
    }

    try {
      const emailTakenByOther = dbEmployees.some(emp => {
        if (isEditing) return emp.id !== originalEditId && emp.email?.trim().toLowerCase() === cleanEmail;
        else return emp.email?.trim().toLowerCase() === cleanEmail;
      });
      if (emailTakenByOther) {
        alert(`البريد [${cleanEmail}] مستخدم مسبقاً.`);
        return;
      }

      const existingEmployee = dbEmployees.find(emp => 
        (originalEditId && emp.id === originalEditId) || 
        emp.email?.trim().toLowerCase() === cleanEmail
      );
      const targetEditId = existingEmployee ? existingEmployee.id : originalEditId;

      const isCommittees = [formOrgLevel1, formOrgLevel2, formOrgLevel3, formOrgLevel4].includes('إدارة اللجان');
      const roleMapper: Record<string, string> = {
        SYS_ADMIN: "مدير النظام",
        SECRETARY_GENERAL: "أمين عام",
        EXECUTIVE_OFFICE: "المكتب التنفيذي",
        ASSISTANT_SEC_GEN: "مساعد الأمين العام",
        SECRETARY: "السكرتير",
        MANAG_DIR: isCommittees ? "مدير إدارة اللجان" : "مدير إدارة",
        DEPT_HEAD: isCommittees ? "رئيس قسم اللجان" : "رئيس قسم",
        SPECIALIST: isCommittees ? "أخصائي اللجان" : "أخصائي"
      };

      let finalOrgLevel5 = formOrgLevel5;
      if (formRole === "SECRETARY" && !finalOrgLevel5) {
        const parentNode = formOrgLevel4 || formOrgLevel3 || formOrgLevel2 || formOrgLevel1;
        const staffNode = dbOrgNodes.find(n => n.type === 'STAFF' && n.parent === parentNode);
        if (staffNode) {
          finalOrgLevel5 = staffNode.name;
        }
      }

      let calculatedJobTitle = "غير مسكن";
      if (finalOrgLevel5) {
        const node = dbOrgNodes.find(n => n.name === finalOrgLevel5);
        if (node && node.type === 'STAFF') {
          calculatedJobTitle = finalOrgLevel5.trim();
        } else if (finalOrgLevel5 === 'أخصائي' || finalOrgLevel5 === 'أخصائي اللجان') {
          const cleanLevelName = (name: string) => name.replace(/^(قسم|إدارة)\s+/i, '').trim();
          if (formOrgLevel4) {
            calculatedJobTitle = `أخصائي ${cleanLevelName(formOrgLevel4)}`;
          } else if (formOrgLevel3) {
             calculatedJobTitle = `أخصائي ${cleanLevelName(formOrgLevel3)}`;
          } else if (formOrgLevel2) {
             calculatedJobTitle = `مساعد الأمين العام لـ ${formOrgLevel2}`;
          } else if (formOrgLevel1) {
             calculatedJobTitle = `الأمانة العامة`;
          }
        } else {
          calculatedJobTitle = finalOrgLevel5.trim();
        }
      }
      
      // If it's still 'غير مسكن', or formOrgLevel5 wasn't set, calculate based on levels
      if (calculatedJobTitle === "غير مسكن") {
        if (formOrgLevel4) {
          calculatedJobTitle = `رئيس ${formOrgLevel4}`;
        } else if (formOrgLevel3) {
          calculatedJobTitle = `مدير ${formOrgLevel3}`;
        } else if (formOrgLevel2) {
          calculatedJobTitle = `مساعد الأمين العام لـ ${formOrgLevel2}`;
        } else if (formOrgLevel1) {
          calculatedJobTitle = `الأمانة العامة`;
        }
      }

      let calculatedAllowedPages = isPowerUser ? formAllowedPages : (existingEmployee?.allowedPages || []);
      let calculatedAdminPerms = existingEmployee?.adminPermissions || false;

      if (!isEditing && isPowerUser) {
        if (formRole === "SYS_ADMIN" || formRole === "ASSISTANT_SEC_GEN") {
          calculatedAdminPerms = true;
        }
        
        if (formAllowedPages.length === 0) {
          const allLevels = [formOrgLevel1, formOrgLevel2, formOrgLevel3, formOrgLevel4, formOrgLevel5].join(" ");
          const autoPages = [];
          if (allLevels.includes("لجان")) {
            autoPages.push("/", "/committees", "/members", "/events", "/recommendations", "/tasks", "/reports", "/library");
          }
          if (allLevels.includes("مراكز")) {
            autoPages.push("/centers");
          }
          if (allLevels.includes("مساعد")) {
            autoPages.push("/assistant-sec-gen");
          }
          if (allLevels.includes("منتسبين")) {
            autoPages.push("/affiliates");
          }
          
          if (autoPages.length === 0) {
            autoPages.push("/", "/committees", "/members", "/events", "/recommendations", "/tasks", "/reports", "/library");
          }
          calculatedAllowedPages = autoPages;
        }
      }

      const payload: Omit<Employee, "id"> = {
        name: formName.trim(),
        prefix: formPrefix,
        role: isPowerUser ? formRole : (existingEmployee?.role || "SPECIALIST"),
        roleAr: isPowerUser ? (roleMapper[formRole] || "أخصائي اللجان") : (existingEmployee?.roleAr || "أخصائي اللجان"),
        jobTitle: calculatedJobTitle,
        orgLevel1: formOrgLevel1,
        orgLevel2: formOrgLevel2,
        orgLevel3: formOrgLevel3,
        orgLevel4: formOrgLevel4,
        orgLevel5: finalOrgLevel5,
        phone: formPhone.trim(),
        extension: formExtension.trim(),
        email: isEditing && existingEmployee ? existingEmployee.email : cleanEmail,
        photo: formPhoto,
        active: isPowerUser ? formActive : (existingEmployee ? existingEmployee.active : true),
        loginEnabled: isPowerUser ? formLoginEnabled : (existingEmployee ? existingEmployee.loginEnabled !== false : true),
        committees: formCommittees,
        allowedPages: calculatedAllowedPages,
        adminPermissions: calculatedAdminPerms,
        password: formPassword.trim() || (existingEmployee?.password || ""),
        joinDate: existingEmployee?.joinDate || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      };

      if (isEditing) {
        if (formId !== targetEditId) {
          if (!isPowerUser) { alert("لا تملك صلاحية لتعديل الرقم."); return; }
          const IDTaken = dbEmployees.some(emp => emp.id === formId);
          if (IDTaken) { alert(`الرقم [${formId}] مستعمل.`); return; }
          await updateFirebaseEmp(formId, payload);
          await deleteFirebaseEmp(targetEditId);
          const assignedComms = dbCommittees.filter(c => c.specialistId === targetEditId);
          for (const c of assignedComms) {
            await updateFirebaseComm(c.id, { specialistId: formId });
          }
        } else {
          await updateFirebaseEmp(targetEditId, payload);
        }

        for (const comm of dbCommittees) {
          if (formCommittees.includes(comm.name)) {
            if (comm.specialist !== formName) {
              await updateFirebaseComm(comm.id, { specialist: formName });
            }
          } else if (comm.specialist === formName || (existingEmployee && comm.specialist === existingEmployee.name)) {
            await updateFirebaseComm(comm.id, { specialist: "غير محدد" });
          }
        }

        const storedUser = localStorage.getItem("current_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.id === targetEditId || parsed.email?.trim().toLowerCase() === cleanEmail)) {
            const updatedUser = { ...payload, id: formId };
            localStorage.setItem("current_user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
          }
        }

        alert("تم حفظ وتحديث بيانات الموظف بنجاح.");
      } else {
        const IDTaken = dbEmployees.some(emp => emp.id === formId);
        if (IDTaken) { alert(`الرقم الوظيفي [${formId}] مأخوذ.`); return; }
        await updateFirebaseEmp(formId, payload);
        for (const comm of dbCommittees) {
          if (formCommittees.includes(comm.name)) {
            if (comm.specialist !== formName) {
              await updateFirebaseComm(comm.id, { specialist: formName });
            }
          }
        }
        alert("تمت إضافة الموظف بنجاح.");
      }

      setShowFormModal(false);
      setIsEditing(false);
      resetFormFields();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع.");
    }
  };

  const resetFormFields = () => {
    setFormId("");
    setFormName("");
    setFormRole("SPECIALIST");
    setFormOrgLevel1("الأمانة العامة");
    setFormOrgLevel2("");
    setFormOrgLevel3("");
    setFormOrgLevel4("");
    setFormOrgLevel5("");
    setFormPhone("");
    setFormExtension("");
    setFormEmail("");
    setFormPhoto(PRESET_AVATARS[0]);
    setFormPrefix("الأستاذ");
    setFormActive(true);
    setFormLoginEnabled(true);
    setFormPassword("");
    setFormCommittees([]);
    setFormAllowedPages([]);
    setFormGender("MALE");
    setOriginalEditId("");
  };

  const openAddModal = () => {
    resetFormFields();
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
    setFormOrgLevel1(emp.orgLevel1 || "الأمانة العامة");
    setFormOrgLevel2(emp.orgLevel2 || "");
    setFormOrgLevel3(emp.orgLevel3 || "");
    setFormOrgLevel4(emp.orgLevel4 || "");
    setFormOrgLevel5(emp.orgLevel5 || emp.jobTitle || "");
    setFormPhone(emp.phone || "");
    setFormExtension(emp.extension || "");
    setFormEmail(emp.email || "");
    setFormPhoto(emp.photo || PRESET_AVATARS[0]);
    setFormPrefix(emp.prefix || "الأستاذ");
    setFormActive(emp.active !== false);
    setFormLoginEnabled(emp.loginEnabled !== false);
    setFormPassword(emp.password || "");
    setFormCommittees(emp.committees || []);
    setFormAllowedPages(emp.allowedPages || []);
    setFormGender((emp as any).gender || "MALE");
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDeleteEmployee = async (empId: string, empName: string) => {
    if (empId === currentUser?.id) return;
    if (empId === "01") return;

    try {
      const associatedSupervised = dbCommittees.filter(c => c.specialistId === empId || c.specialist === empName);
      const alertDetails = `تأكيد حذف (${empName}) نهائياً؟`;

      setConfirmDialog({
        isOpen: true,
        title: "تأكيد الحذف",
        message: alertDetails,
        onConfirm: async () => {
          try {
            if (associatedSupervised.length > 0) {
              for (const c of associatedSupervised) {
                await updateFirebaseComm(c.id, { specialistId: "", specialist: "غير محدد" });
              }
            }
            await deleteFirebaseEmp(empId);
            setConfirmDialog(null);
          } catch (error) {
            setConfirmDialog(null);
          }
        }
      });
    } catch (error) { }
  };

  const sourceEmpStats = React.useMemo(() => {
    if (!sourceEmpId) return { committees: 0, tasks: 0, events: 0 };
    const sourceEmp = dbEmployees.find(emp => emp.id === sourceEmpId);
    const comms = dbCommittees.filter(c => c.specialistId === sourceEmpId || (sourceEmp && c.specialistName === sourceEmp.name)).length;
    const tasks = dbTasks.filter(t => t.assignedToId === sourceEmpId || (sourceEmp && t.assignedTo === sourceEmp.name)).length;
    const events = dbEvents.filter(ev => ev.employeeId === sourceEmpId || ev.specialistId === sourceEmpId || (sourceEmp && ev.specialistName === sourceEmp.name)).length;
    return { committees: comms, tasks: tasks, events: events };
  }, [sourceEmpId, dbCommittees, dbTasks, dbEvents, dbEmployees]);

  React.useEffect(() => {
    if (sourceEmpStats) {
      setTransferCommittees(sourceEmpStats.committees > 0);
      setTransferTasks(sourceEmpStats.tasks > 0);
      setTransferEvents(sourceEmpStats.events > 0);
    }
  }, [sourceEmpStats]);



  const handleEndDelegation = async (delId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "تأكيد إنهاء التكليف",
      message: "هل أنت متأكد من إنهاء فترة التكليف وإرجاع المهام للموظف الأساسي؟",
      confirmText: "تأكيد وإنهاء",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const del = dbDelegations.find((d: any) => d.id === delId);
          if (!del) return;

          const sourceEmp = dbEmployees.find((e: any) => e.id === del.sourceEmpId);
          const targetEmp = dbEmployees.find((e: any) => e.id === del.targetEmpId);

          if (sourceEmp && targetEmp) {
            const noteStr = `

[تم إنهاء التكليف وإرجاع الأعمال من الموظف ${targetEmp.name} إلى ${sourceEmp.name}]`;
            
            if (del.transferCommittees) {
              const matchingComms = dbCommittees.filter((c: any) => c.specialistId === targetEmp.id);
              for (const c of matchingComms) {
                const newDesc = c.desc ? c.desc + noteStr : noteStr;
                await updateFirebaseComm(c.id, { specialistId: sourceEmp.id, specialistName: sourceEmp.name, desc: newDesc });
              }
              const sourceComms = sourceEmp.committees || [];
              await updateFirebaseEmp(sourceEmp.id, { committees: Array.from(new Set([...sourceComms, ...matchingComms.map((c: any) => c.name)])) });
            }

            if (del.transferTasks) {
              const matchingTasks = dbTasks.filter((t: any) => (t.assignedToId === targetEmp.id || t.assignedTo === targetEmp.name));
              for (const t of matchingTasks) {
                const newNotes = t.additionalNotes ? t.additionalNotes + noteStr : noteStr;
                await updateFirebaseTask(t.id, { assignedToId: sourceEmp.id, assignedTo: sourceEmp.name, assignedToName: sourceEmp.name, additionalNotes: newNotes });
              }
            }

            if (del.transferEvents) {
              const matchingEvents = dbEvents.filter((ev: any) => (ev.employeeId === targetEmp.id || ev.specialistId === targetEmp.id));
              for (const ev of matchingEvents) {
                const updateObj: any = {};
                if (ev.employeeId === targetEmp.id) updateObj.employeeId = sourceEmp.id;
                if (ev.specialistId === targetEmp.id) { updateObj.specialistId = sourceEmp.id; updateObj.specialistName = sourceEmp.name; }
                await updateFirebaseEvent(ev.id, updateObj);
              }
            }
          }

          await updateFirebaseDelegation(delId, { status: "ended", endTimestamp: new Date().toISOString() });
          setTransferSuccess("تم إنهاء التكليف بنجاح واسترجاع الأعمال.");
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => setTransferSuccess(""), 4000);
        } catch (e: any) {
          console.error("Failed to end delegation", e);
          setTransferError("حدث خطأ أثناء إنهاء التكليف: " + e.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  };

  const handleTransferDuties = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccess("");
    setTransferError("");
    if (!sourceEmpId || !targetEmpId || sourceEmpId === targetEmpId) return;

    if (transferMode === "delegation" && !delegationEndDate) {
      setTransferError("يرجى تحديد تاريخ انتهاء التكليف.");
      return;
    }

    setIsTransferring(true);
    try {
      const sourceEmp = dbEmployees.find(emp => emp.id === sourceEmpId);
      const targetEmp = dbEmployees.find(emp => emp.id === targetEmpId);
      if (!sourceEmp || !targetEmp) return;

      let noteStr = "";
      if (transferMode === "full") {
        noteStr = `[تم نقل الأعمال بشكل دائم من الموظف ${sourceEmp.name} إلى ${targetEmp.name}]`;
      } else {
        noteStr = `[تكليف بأعمال الموظف ${sourceEmp.name} إلى ${targetEmp.name} حتى تاريخ ${delegationEndDate}]`;
      }

      if (transferCommittees) {
        const matchingComms = dbCommittees.filter(c => c.specialistId === sourceEmpId);
        for (const c of matchingComms) {
          const newDesc = c.desc ? c.desc + "\n\n" + noteStr : noteStr;
          await updateFirebaseComm(c.id, { specialistId: targetEmpId, specialistName: targetEmp.name, desc: newDesc });
        }
        const updatedTargetComms = Array.from(new Set([...(targetEmp.committees || []), ...(sourceEmp.committees || [])]));
        
        if (transferMode === "full") {
          await updateFirebaseEmp(sourceEmpId, { committees: [] });
        }
        await updateFirebaseEmp(targetEmpId, { committees: updatedTargetComms });
      }

      if (transferTasks) {
        const matchingTasks = dbTasks.filter(t => t.assignedToId === sourceEmpId || t.assignedTo === sourceEmp.name);
        for (const t of matchingTasks) {
          const newNotes = t.additionalNotes ? t.additionalNotes + "\n\n" + noteStr : noteStr;
          await updateFirebaseTask(t.id, { assignedToId: targetEmpId, assignedTo: targetEmp.name, assignedToName: targetEmp.name, additionalNotes: newNotes });
        }
      }

      if (transferEvents) {
        const matchingEvents = dbEvents.filter(ev => ev.employeeId === sourceEmpId || ev.specialistId === sourceEmpId);
        for (const ev of matchingEvents) {
          const updateObj: any = {};
          if (ev.employeeId === sourceEmpId) updateObj.employeeId = targetEmpId;
          if (ev.specialistId === sourceEmpId) { updateObj.specialistId = targetEmpId; updateObj.specialistName = targetEmp.name; }
          // We can append to event notes if we have a field for it, or just leave it.
          await updateFirebaseEvent(ev.id, updateObj);
        }
      }

      if (transferMode === "delegation" && delegatePermissions) {
        const currentTargetAllowed = targetEmp.allowedPages || [];
        const sourceAllowed = sourceEmp.allowedPages || [];
        const updatedAllowed = Array.from(new Set([...currentTargetAllowed, ...sourceAllowed]));
        await updateFirebaseEmp(targetEmpId, { allowedPages: updatedAllowed });
      }

      // Record delegation in db
      await addFirebaseDelegation({
        sourceEmpId,
        sourceEmpName: sourceEmp.name,
        targetEmpId,
        targetEmpName: targetEmp.name,
        transferMode,
        delegationEndDate: transferMode === "delegation" ? delegationEndDate : "",
        transferCommittees,
        transferTasks,
        transferEvents,
        delegatePermissions: transferMode === "delegation" ? delegatePermissions : false,
        timestamp: new Date().toISOString(),
        status: "active"
      });


      setTransferSuccess(transferMode === "full" ? `تمت عملية تفويض ونقل الأعمال بالكامل بنجاح.` : `تم تكليف المهام والصلاحيات بنجاح حتى ${delegationEndDate}.`);
      setSourceEmpId("");
      setTargetEmpId("");
      setDelegationEndDate("");
    } catch (error: any) {
      setTransferError(`فشلت العملية.`);
    } finally {
      setIsTransferring(false);
    }
  };

  const filteredEmployees = React.useMemo(() => {
    return safeDbEmployees.filter(emp => {
      // Unconditionally hide sys admin and root users from all employee lists, regardless of current user role
      if (emp.role === "SYS_ADMIN" || emp.id === "01" || emp.email?.trim().toLowerCase() === "khalafshehab@gmail.com" || emp.email?.trim().toLowerCase() === "khalafshehab-crypto@gmail.com") {
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
  }, [safeDbEmployees, currentUser, searchTerm, roleFilter, statusFilter]);

  // Helper to dynamically calculate job title
  const calculateDisplayJobTitle = (emp: Employee) => {
    if (emp.orgLevel5) {
      const node = dbOrgNodes.find(n => n.name === emp.orgLevel5);
      if (node && node.type === 'STAFF') {
        return emp.orgLevel5.trim();
      }
      
      if (emp.orgLevel5 === 'أخصائي' || emp.orgLevel5 === 'أخصائي اللجان') {
        const cleanLevelName = (name: string) => name.replace(/^(قسم|إدارة)\s+/i, '').trim();
        if (emp.orgLevel4) {
          return `أخصائي ${cleanLevelName(emp.orgLevel4)}`;
        } else if (emp.orgLevel3) {
          return `أخصائي ${cleanLevelName(emp.orgLevel3)}`;
        }
      } else {
        return emp.orgLevel5.trim();
      }
    }
    
    if (emp.orgLevel4) {
      return `رئيس ${emp.orgLevel4}`;
    } else if (emp.orgLevel3) {
      return `مدير ${emp.orgLevel3}`;
    } else if (emp.orgLevel2) {
      return `مساعد الأمين العام لـ ${emp.orgLevel2}`;
    } else if (emp.orgLevel1) {
      return `الأمانة العامة`;
    }
    return emp.jobTitle || "غير مسكن";
  };

  // Helper to get formatted hierarchy path
  const getHierarchyPath = (emp: Employee) => {
    const parts = [];
    if (emp.orgLevel1) parts.push(emp.orgLevel1);
    if (emp.orgLevel2) parts.push(emp.orgLevel2);
    if (emp.orgLevel3) parts.push(emp.orgLevel3);
    if (emp.orgLevel4) parts.push(emp.orgLevel4);
    
    parts.push(calculateDisplayJobTitle(emp));
    
    return parts;
  };

  const renderEmployeesForNode = (employees: Employee[]) => {
    if (employees.length === 0) return null;
    
    const rolePriority: Record<string, number> = {
      SYS_ADMIN: 1,
      SECRETARY_GENERAL: 2,
      EXECUTIVE_OFFICE: 3,
      ASSISTANT_SEC_GEN: 4,
      MANAG_DIR: 5,
      DEPT_HEAD: 6,
      SPECIALIST: 7,
      SECRETARY: 8
    };

    const sortedEmployees = [...employees].sort((a, b) => {
      const aPriority = rolePriority[a.role] || 99;
      const bPriority = rolePriority[b.role] || 99;
      return aPriority - bPriority;
    });

    return (
      <div className="mt-2 flex flex-col gap-1 w-full px-1 z-30 relative">
        {sortedEmployees.map(emp => (
          <div key={emp.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-1.5 py-1 text-[9px] group shadow-sm hover:border-brand/30 hover:bg-brand/5">
            <div className="flex flex-col items-start truncate">
              <span className="truncate text-gray-700 font-bold">{emp.name}</span>
              {calculateDisplayJobTitle(emp) && (
                <span className="text-[8px] font-black text-brand bg-brand/10 px-1 py-0.5 rounded mt-0.5">
                  {calculateDisplayJobTitle(emp)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={() => openEditModal(emp)} className="p-0.5 bg-gray-100 text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-2.5 h-2.5" /></button>
              {currentUserRole === "SYS_ADMIN" && emp.id !== "01" && emp.id !== currentUser?.id && (
                <button onClick={() => handleDeleteEmployee(emp.id, emp.name)} className="p-0.5 bg-gray-100 text-red-600 rounded hover:bg-red-50"><Trash2 className="w-2.5 h-2.5" /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans pb-12 text-right" dir="rtl">
      
      {/* 1. TOP HERO PANEL */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-brand" />
            <span>الهيكل الإداري والرقابة الذكية</span>
          </h1>
          <p className="text-gray-600 text-sm font-medium mt-1">
            إدارة الموظفين، تفويض ونقل الأعمال، واعتماد حسابات المنسقين الجدد لغرفة مكة المكرمة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
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
            activeTab === "hierarchy" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>الموظفين</span>
          <span className="bg-gray-150 px-2 py-0.5 rounded-full text-[10px] text-gray-600 font-bold">
            {safeDbEmployees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("org_chart")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === "org_chart" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Network className="w-4 h-4 shrink-0" />
          <span>بناء الهيكل التنظيمي</span>
        </button>

        {currentUserRole === "SYS_ADMIN" && (
          <>
            <button
              onClick={() => setActiveTab("transfer")}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "transfer" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 shrink-0" />
              <span>نقل الأعمال</span>
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "approvals" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>طلبات الانضمام</span>
              {dbJoinRequests.length > 0 && <span className="bg-amber-500 px-2 py-0.5 rounded-full text-[10px] text-white font-black animate-bounce">{dbJoinRequests.length}</span>}
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "logs" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>سجل العمليات</span>
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "permissions" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>الصلاحيات</span>
            </button>
            <button
              onClick={() => setActiveTab("master_data")}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === "master_data" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>البيانات الموحدة</span>
            </button>
          </>
        )}
      </div>

      {/* 3. PRESENTATION OF ACTIVE VIEWPORT */}
      <div className="space-y-6">
        
        {/* TAB 1: EMPLOYEES */}
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

            {filteredEmployees.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center shadow-sm">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-gray-600">عذراً، لم يتم العثور على موظفين</h3>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredEmployees.map((emp) => {
                    const isSelf = emp.id === currentUser?.id;
                    const path = getHierarchyPath(emp);

                    return (
                      <motion.div
                        key={emp.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-[#e8e4e4] hover:bg-[#e2dede] transition-colors duration-300 rounded-2xl p-5 border shadow-sm flex flex-col justify-between relative overflow-hidden group ${
                          isSelf ? "ring-2 ring-brand ring-offset-2 border-brand/40" : "border-gray-200"
                        } ${emp.active === false ? "opacity-50 grayscale-[30%] border-gray-300" : ""}`}
                      >
                      <div>
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
                              <span>{getEmployeePrefix(emp)} {emp.name}</span>
                              {isSelf && <span className="text-[10px] text-brand bg-brand/10 px-1 py-0.5 rounded font-black">(أنت)</span>}
                            </h3>
                            <p className="text-gray-500 text-[10px] font-bold mt-0.5">{calculateDisplayJobTitle(emp) || emp.roleAr}</p>
                            <span className="inline-block text-[9px] font-black px-2 py-0.5 mt-2 rounded-md bg-white border border-gray-200 text-gray-700">
                              {emp.roleAr}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-gray-100 pt-3 text-[11px] text-gray-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400">الرقم:</span>
                            <span className="font-mono font-black text-gray-800">{emp.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400">البريد:</span>
                            <span className="text-gray-800 truncate">{emp.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-gray-400">الجوال:</span>
                            <span className="font-mono text-gray-800">{emp.phone} {emp.extension && <span className="text-brand">(تحويلة: {emp.extension})</span>}</span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-[10px] font-black text-gray-800 flex items-center gap-1.5 mb-2">
                              <Building2 className="w-3.5 h-3.5 text-brand" />
                              الارتباط بالهيكل:
                            </span>
                            <div className="flex flex-wrap items-center gap-1 text-[9px] font-bold text-gray-600 bg-white p-2 rounded-lg border border-gray-100 shadow-inner">
                              {path.length > 0 ? path.map((level, index, array) => (
                                <div key={index} className="flex items-center gap-1">
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    index === array.length - 1 ? "bg-brand text-white" : "bg-gray-50 border border-gray-200"
                                  }`}>
                                    {level}
                                  </span>
                                  {index < array.length - 1 && <ChevronDown className="w-2.5 h-2.5 text-gray-400 rotate-90" />}
                                </div>
                              )) : (
                                <span className="text-gray-400">غير مسكن في الهيكل</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-1.5">
                        {(currentUserRole === "SYS_ADMIN" || currentUserRole === "MANAG_DIR" || currentUserRole === "DEPT_HEAD" || isSelf) && (
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 bg-gray-50 hover:bg-brand/10 text-gray-600 hover:text-brand rounded-lg transition-all cursor-pointer border border-gray-200 flex items-center gap-1.5 text-[10px] font-extrabold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                        )}
                        {currentUserRole === "SYS_ADMIN" && !isSelf && emp.id !== "01" && (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-all cursor-pointer border border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">الرقم</th>
                        <th className="p-4">الموظف</th>
                        <th className="p-4">الارتباط التنظيمي</th>
                        <th className="p-4">البريد الإلكتروني</th>
                        <th className="p-4">الجوال</th>
                        <th className="p-4">حالة الحساب</th>
                        <th className="p-4 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {filteredEmployees.map((emp) => {
                        const isSelf = emp.id === currentUser?.id;
                        const path = getHierarchyPath(emp);
                        return (
                          <tr key={emp.id} className={isSelf ? "bg-brand/5" : "hover:bg-gray-50/50"}>
                            <td className="p-4 font-mono font-black text-gray-900">{emp.id}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <img src={emp.photo || PRESET_AVATARS[0]} alt={emp.name} className="w-8 h-8 rounded-lg object-cover bg-gray-50" />
                                <div>
                                  <span className="font-extrabold text-gray-900 text-[12px]">{getEmployeePrefix(emp)} {emp.name}</span>
                                  <div className="text-[10px] text-gray-500">{calculateDisplayJobTitle(emp)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-[9px] text-gray-500 mt-1 block">
                                {path.length > 0 ? path.join(" ← ") : "غير مسكن"}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-gray-600">{emp.email}</td>
                            <td className="p-4 font-mono text-gray-600">{emp.phone}</td>
                            <td className="p-4">
                              {emp.active !== false ? <span className="text-emerald-600 text-[10px] font-black">● فعال</span> : <span className="text-red-500 text-[10px] font-black">● معطل</span>}
                            </td>
                            <td className="p-4 text-left">
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => openEditModal(emp)} className="p-1 px-2.5 bg-gray-100 text-gray-600 rounded-md border text-[10px] font-bold">تعديل</button>
                                {currentUserRole === "SYS_ADMIN" && !isSelf && emp.id !== "01" && (
                                  <button onClick={() => handleDeleteEmployee(emp.id, emp.name)} className="p-1 bg-red-50 text-red-650 rounded-md border border-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
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

        {/* TAB 2: ORG BUILDER */}
        {activeTab === "org_chart" && (
          <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-200 shadow-sm relative min-h-[600px] overflow-x-auto custom-scrollbar">
            
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4 min-w-[800px]">
              <div>
                <h2 className="text-xl font-black text-gray-900">بناء الهيكل التنظيمي</h2>
                <p className="text-xs text-gray-500 font-bold mt-1">تأسيس القطاعات والإدارات والأقسام بشكل مستقل لتسكين الموظفين عليها لاحقاً.</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 min-w-[800px] pb-10">
              
              {/* Level 1: ROOT */}
              {(() => {
                const rootNode = dbOrgNodes.find(n => n.type === "ROOT");
                return (
                  <div className="flex flex-col items-center w-full">
                    {!rootNode ? (
                      <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "ROOT", parent: "", isSubcategory: false }); setShowOrgNodeModal(true); }} className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-md relative z-10 mt-4">
                        <Plus className="w-5 h-5" /> إضافة الإدارة العليا
                      </button>
                    ) : (
                      <div className="relative flex flex-col items-center">
                        <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 w-64 text-center shadow-md relative z-10 group hover:shadow-lg transition-all">
                          {currentUserRole === "SYS_ADMIN" && (
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button onClick={() => { setOrgNodeForm({ ...rootNode, isSubcategory: false } as any); setShowOrgNodeModal(true); }} className="p-1 bg-white text-blue-600 rounded hover:bg-blue-50 border border-blue-100 shadow-sm"><Edit2 className="w-3 h-3" /></button>
                              <button onClick={() => handleDeleteOrgNode(rootNode)} className="p-1 bg-white text-red-600 rounded hover:bg-red-50 border border-red-100 shadow-sm"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          )}
                          <h3 className="font-black text-amber-900 text-sm">{rootNode.name}</h3>
                          <span className="text-[10px] text-amber-700 mt-1 block">مستوى الإدارة العليا</span>
                          {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel1 === rootNode.name && !e.orgLevel2 && (!e.orgLevel5 || !dbOrgNodes.some(n => n.name === e.orgLevel5 && n.type === 'STAFF'))))}
                        </div>
                        
                        {currentUserRole === "SYS_ADMIN" && (
                          <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "STAFF", parent: rootNode.name, isSubcategory: false }); setShowOrgNodeModal(true); }} className="mt-4 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm relative z-20 border border-blue-200">
                            <Plus className="w-3.5 h-3.5" /> إضافة (سكرتير / تصنيف فرعي)
                          </button>
                        )}

                        {dbOrgNodes.filter(n => n.type === "STAFF" && n.parent === rootNode.name).length > 0 && (
                          <div className="flex flex-wrap justify-center gap-3 mt-4 w-full relative z-20">
                            {dbOrgNodes.filter(n => n.type === "STAFF" && n.parent === rootNode.name).map(staff => (
                              <div key={staff.id} className="bg-purple-50 border border-purple-300 rounded-lg p-2.5 w-40 text-center relative group shadow-sm hover:shadow-md transition-all">
                                {currentUserRole === "SYS_ADMIN" && (
                                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => { setOrgNodeForm({ ...staff, isSubcategory: false } as any); setShowOrgNodeModal(true); }} className="p-0.5 bg-white text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3 h-3" /></button>
                                    <button onClick={() => handleDeleteOrgNode(staff)} className="p-0.5 bg-white text-red-600 rounded hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                )}
                                <h6 className="font-bold text-purple-900 text-[10px] mb-1">{staff.name}</h6>
                                <span className="text-[8px] text-purple-700 block">سكرتير / وظيفة مساندة</span>
                                {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel5 === staff.name && e.orgLevel1 === rootNode.name && !e.orgLevel2))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              
              <div className="w-px h-8 bg-gray-300 -my-6 z-0"></div>

              {/* Level 2: Sectors */}
              <div className="flex flex-row justify-center items-start gap-8 flex-wrap w-full relative pt-6">
                <div className="absolute top-0 left-10 right-10 h-px bg-gray-300 z-0"></div>
                {dbOrgNodes.filter(n => n.type === "SECTOR").length === 0 ? (
                  <div className="text-gray-400 text-[11px] font-bold p-4 border border-dashed border-gray-300 rounded-xl bg-white w-full text-center">لا توجد قطاعات مسجلة. اضغط على إضافة بالأعلى لتأسيس قطاع.</div>
                ) : (
                  dbOrgNodes.filter(n => n.type === "SECTOR").map(sector => (
                    <div key={sector.id} className="flex flex-col items-center relative z-10">
                      <div className="absolute top-0 w-px h-6 bg-gray-300 -mt-6 z-0"></div>
                      
                      <div className="bg-indigo-50 border-2 border-indigo-400 rounded-xl p-4 w-56 text-center shadow-sm relative group hover:shadow-md transition-all">
                        {currentUserRole === "SYS_ADMIN" && (
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => { setOrgNodeForm({ ...sector, isSubcategory: true } as any); setShowOrgNodeModal(true); }} className="p-1 bg-white text-blue-600 rounded hover:bg-blue-50 border border-blue-100 shadow-sm"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteOrgNode(sector)} className="p-1 bg-white text-red-600 rounded hover:bg-red-50 border border-red-100 shadow-sm"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        )}
                        <h4 className="font-black text-indigo-900 text-xs mb-2">{sector.name}</h4>
                        <div className="flex items-center justify-center gap-1 text-[9px] text-indigo-700 bg-white rounded-full px-2 py-0.5 border border-indigo-200 w-fit mx-auto">
                          <Users className="w-3 h-3" />
                          <span>{safeDbEmployees.filter(e => e.orgLevel2 === sector.name).length} موظف</span>
                        </div>
                        {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel2 === sector.name && !e.orgLevel3 && (!e.orgLevel5 || !dbOrgNodes.some(n => n.name === e.orgLevel5 && n.type === 'STAFF'))))}
                      </div>

                      {currentUserRole === "SYS_ADMIN" && (
                        <div className="flex gap-2 mt-3 relative z-20">
                          <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "STAFF", parent: sector.name, isSubcategory: false }); setShowOrgNodeModal(true); }} className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[9px] font-bold transition-all flex items-center gap-1 shadow-sm border border-purple-200">
                            <Plus className="w-3 h-3" /> إضافة سكرتير
                          </button>
                          <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "DEPARTMENT", parent: sector.name, isSubcategory: true }); setShowOrgNodeModal(true); }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[9px] font-bold transition-all flex items-center gap-1 shadow-sm border border-gray-200">
                            <Plus className="w-3 h-3" /> إضافة إدارة
                          </button>
                        </div>
                      )}

                      {dbOrgNodes.filter(n => n.type === "STAFF" && n.parent === sector.name).length > 0 && (
                        <div className="flex flex-col gap-2 mt-3 relative z-20 w-full items-center">
                          {dbOrgNodes.filter(n => n.type === "STAFF" && n.parent === sector.name).map(staff => (
                            <div key={staff.id} className="bg-purple-50 border border-purple-300 rounded-lg p-2 w-48 text-center relative group shadow-sm hover:shadow-md transition-all">
                              {currentUserRole === "SYS_ADMIN" && (
                                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button onClick={() => { setOrgNodeForm({ ...staff, isSubcategory: false } as any); setShowOrgNodeModal(true); }} className="p-0.5 bg-white text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3 h-3" /></button>
                                  <button onClick={() => handleDeleteOrgNode(staff)} className="p-0.5 bg-white text-red-600 rounded hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                              <h6 className="font-bold text-purple-900 text-[10px] mb-0.5">{staff.name}</h6>
                              <span className="text-[8px] text-purple-700 block">سكرتير / وظيفة مساندة</span>
                              {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel5 === staff.name && e.orgLevel2 === sector.name && !e.orgLevel3))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Level 3: Departments under this sector */}
                      {dbOrgNodes.filter(n => n.type === "DEPARTMENT" && n.parent === sector.name).length > 0 && (
                        <div className="flex flex-col items-center mt-6 relative w-full">
                          <div className="absolute top-0 w-px h-6 bg-gray-300 -mt-6 z-0"></div>
                          
                          <div className="flex flex-row justify-center items-start gap-6 flex-wrap relative w-full pt-6 mt-2">
                            {dbOrgNodes.filter(n => n.type === "DEPARTMENT" && n.parent === sector.name).length > 1 && (
                              <div className="absolute top-0 left-10 right-10 h-px bg-gray-300 z-0"></div>
                            )}
                            {dbOrgNodes.filter(n => n.type === "DEPARTMENT" && n.parent === sector.name).map(dept => (
                              <div key={dept.id} className="flex flex-col items-center relative z-10">
                                <div className="absolute top-0 w-px h-6 bg-gray-300 -mt-6 z-0"></div>
                                <div className="bg-teal-50 border border-teal-400 rounded-xl p-3 w-48 text-center shadow-sm relative group hover:shadow-md transition-all">
                                {currentUserRole === "SYS_ADMIN" && (
                                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => { setOrgNodeForm({ ...dept, isSubcategory: true } as any); setShowOrgNodeModal(true); }} className="p-1 bg-white text-blue-600 rounded hover:bg-blue-50 border border-blue-100 shadow-sm"><Edit2 className="w-3 h-3" /></button>
                                    <button onClick={() => handleDeleteOrgNode(dept)} className="p-1 bg-white text-red-600 rounded hover:bg-red-50 border border-red-100 shadow-sm"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                )}
                                <h5 className="font-black text-teal-900 text-[11px] mb-2">{dept.name}</h5>
                                <div className="flex items-center justify-center gap-1 text-[9px] text-teal-700 bg-white rounded-full px-2 py-0.5 border border-teal-200 w-fit mx-auto">
                                  <Users className="w-3 h-3" />
                                  <span>{safeDbEmployees.filter(e => e.orgLevel3 === dept.name && e.orgLevel2 === sector.name).length} موظف</span>
                                </div>
                                {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel3 === dept.name && e.orgLevel2 === sector.name && !e.orgLevel4 && (!e.orgLevel5 || !dbOrgNodes.some(n => n.name === e.orgLevel5 && n.type === 'STAFF'))))}
                              </div>

                              {currentUserRole === "SYS_ADMIN" && (
                                <div className="flex gap-2 mt-2 relative z-20">
                                  <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "STAFF", parent: dept.name, isSubcategory: false }); setShowOrgNodeModal(true); }} className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[9px] font-bold transition-all flex items-center gap-1 shadow-sm border border-purple-200">
                                    <Plus className="w-3 h-3" /> إضافة سكرتير
                                  </button>
                                  <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "SECTION", parent: dept.name, isSubcategory: true }); setShowOrgNodeModal(true); }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[9px] font-bold transition-all flex items-center gap-1 shadow-sm relative z-20 border border-gray-200">
                                    <Plus className="w-3 h-3" /> إضافة قسم / مركز
                                  </button>
                                </div>
                              )}

                              {dbOrgNodes.filter(n => n.type === "STAFF" && n.parent === dept.name).length > 0 && (
                                <div className="flex flex-col gap-2 mt-2 relative z-20 w-full items-center">
                                  {dbOrgNodes.filter(n => n.type === "STAFF" && n.parent === dept.name).map(staff => (
                                    <div key={staff.id} className="bg-purple-50 border border-purple-300 rounded-lg p-2 w-48 text-center relative group shadow-sm hover:shadow-md transition-all">
                                      {currentUserRole === "SYS_ADMIN" && (
                                        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                          <button onClick={() => { setOrgNodeForm({ ...staff, isSubcategory: false } as any); setShowOrgNodeModal(true); }} className="p-0.5 bg-white text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3 h-3" /></button>
                                          <button onClick={() => handleDeleteOrgNode(staff)} className="p-0.5 bg-white text-red-600 rounded hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                      )}
                                      <h6 className="font-bold text-purple-900 text-[10px] mb-0.5">{staff.name}</h6>
                                      <span className="text-[8px] text-purple-700 block">سكرتير / وظيفة مساندة</span>
                                      {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel5 === staff.name && e.orgLevel3 === dept.name && e.orgLevel2 === sector.name && !e.orgLevel4))}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Level 4: Sections under this department */}
                              {dbOrgNodes.filter(n => n.type === "SECTION" && n.parent === dept.name).length > 0 && (
                                <div className="flex flex-col items-center mt-6 relative w-full">
                                  <div className="absolute top-0 w-px h-6 bg-gray-300 -mt-6 z-0"></div>
                                  
                                  <div className="flex flex-row justify-center items-start gap-4 flex-wrap relative w-full pt-6 mt-2">
                                    {dbOrgNodes.filter(n => n.type === "SECTION" && n.parent === dept.name).length > 1 && (
                                      <div className="absolute top-0 left-10 right-10 h-px bg-gray-300 z-0"></div>
                                    )}
                                    {dbOrgNodes.filter(n => n.type === "SECTION" && n.parent === dept.name).map(sec => {
                                      const explicitJobTitles = dbOrgNodes.filter(n => n.type === "JOB_TITLE" && n.parent === sec.name);
                                      const inferredJobTitles = Array.from(new Set(
                                        dbEmployees
                                          .filter(e => e.orgLevel4 === sec.name && e.orgLevel5 && e.role !== "DEPT_HEAD" && e.role !== "MANAG_DIR")
                                          .map(e => e.orgLevel5)
                                      )).filter(Boolean)
                                        .filter(title => !explicitJobTitles.some(n => n.name === title));
                                      
                                      return (
                                        <div key={sec.id} className="flex flex-col items-center gap-2 relative z-10 w-fit">
                                          <div className="absolute top-0 w-px h-6 bg-gray-300 -mt-6 z-0"></div>
                                          <div className="bg-blue-50 border border-blue-300 rounded-lg p-2.5 w-40 text-center relative group shadow-sm hover:shadow-md transition-all">
                                            {currentUserRole === "SYS_ADMIN" && (
                                              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={() => { setOrgNodeForm({ ...sec, isSubcategory: true } as any); setShowOrgNodeModal(true); }} className="p-0.5 bg-white text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3 h-3" /></button>
                                                <button onClick={() => handleDeleteOrgNode(sec)} className="p-0.5 bg-white text-red-600 rounded hover:bg-red-50"><X className="w-3 h-3" /></button>
                                              </div>
                                            )}
                                            <h6 className="font-bold text-blue-900 text-[10px] mb-1">{sec.name}</h6>
                                            <div className="flex items-center justify-center gap-1 text-[8px] text-blue-700 bg-white rounded-full px-1.5 py-0.5 border border-blue-200 w-fit mx-auto">
                                              <Users className="w-2.5 h-2.5" />
                                              <span>{safeDbEmployees.filter(e => e.orgLevel4 === sec.name && e.orgLevel3 === dept.name && e.orgLevel2 === sector.name).length} موظف</span>
                                            </div>
                                            {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel4 === sec.name && e.orgLevel3 === dept.name && e.orgLevel2 === sector.name && (!e.orgLevel5 || e.role === "DEPT_HEAD" || e.role === "MANAG_DIR")))}
                                          </div>

                                          {currentUserRole === "SYS_ADMIN" && (
                                            <button onClick={() => { setOrgNodeForm({ id: "", name: "", type: "JOB_TITLE", parent: sec.name, isSubcategory: false }); setShowOrgNodeModal(true); }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[8px] font-bold transition-all flex items-center gap-1 shadow-sm border border-gray-200 mt-1">
                                              <Plus className="w-3 h-3" /> إضافة أخصائي / مسمى
                                            </button>
                                          )}

                                          {dbOrgNodes.filter(n => n.type === "JOB_TITLE" && n.parent === sec.name).length > 0 && (
                                            <div className="flex flex-col gap-2 mt-2 w-full items-center relative z-20">
                                              {dbOrgNodes.filter(n => n.type === "JOB_TITLE" && n.parent === sec.name).map(job => (
                                                <div key={job.id} className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 w-36 text-center shadow-sm relative group hover:shadow-md transition-all">
                                                  {currentUserRole === "SYS_ADMIN" && (
                                                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                      <button onClick={() => { setOrgNodeForm({ ...job, isSubcategory: false } as any); setShowOrgNodeModal(true); }} className="p-0.5 bg-white text-blue-600 rounded hover:bg-blue-50"><Edit2 className="w-3 h-3" /></button>
                                                      <button onClick={() => handleDeleteOrgNode(job)} className="p-0.5 bg-white text-red-600 rounded hover:bg-red-50"><X className="w-3 h-3" /></button>
                                                    </div>
                                                  )}
                                                  <h6 className="font-bold text-indigo-900 text-[9px] mb-1 truncate">{job.name}</h6>
                                                  {renderEmployeesForNode(safeDbEmployees.filter(e => e.orgLevel5 === job.name && e.orgLevel4 === sec.name && e.orgLevel3 === dept.name && e.orgLevel2 === sector.name))}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            </div>
                          ))}
                        </div>
                      </div>
                      )}

                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB: TRANSFER DUTIES */}
        {activeTab === "transfer" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <ArrowRightLeft className="w-5 h-5 text-amber-500" />
                <span>تفويض الصلاحيات وتبديل العهد الإدارية</span>
              </h2>
              <p className="text-gray-500 text-xs mt-1">تتيح لك هذه الشاشة نقل اللجان والمهام من موظف لآخر.</p>
            </div>
            {transferSuccess && <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">{transferSuccess}</div>}
            {transferError && <div className="p-4 bg-red-50 text-red-650 text-xs font-bold rounded-xl">{transferError}</div>}
            
            <form onSubmit={handleTransferDuties} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-[11px] text-gray-500 font-extrabold mb-3">نوع النقل</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="transferMode" value="full" checked={transferMode === "full"} onChange={() => setTransferMode("full")} className="w-4 h-4 text-brand focus:ring-brand" />
                    <span className="text-xs font-bold text-gray-800">نقل أعمال كامل (نقل دائم)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="transferMode" value="delegation" checked={transferMode === "delegation"} onChange={() => setTransferMode("delegation")} className="w-4 h-4 text-brand focus:ring-brand" />
                    <span className="text-xs font-bold text-gray-800">تكليف أعمال (تفويض مؤقت للصلاحيات والمهام)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الموظف الحالي (المصدر)</label>
                  <select value={sourceEmpId} onChange={(e) => setSourceEmpId(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-bold">
                    <option value="">-- اختر الموظف لترحيل أعماله --</option>
                    {safeDbEmployees.filter(e => e.active !== false).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الموظف البديل (المستهدف)</label>
                  <select value={targetEmpId} onChange={(e) => setTargetEmpId(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-bold">
                    <option value="">-- اختر الموظف البديل --</option>
                    {safeDbEmployees.filter(e => e.active !== false && e.id !== sourceEmpId).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {transferMode === "delegation" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">تاريخ انتهاء التكليف</label>
                    <input type="date" value={delegationEndDate} onChange={(e) => setDelegationEndDate(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs font-bold" />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                      <input type="checkbox" checked={delegatePermissions} onChange={(e) => setDelegatePermissions(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4" />
                      <span className="text-xs font-bold text-gray-800">تفويض الصلاحيات (نقل صلاحيات الوصول للشاشات للموظف البديل)</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-5 rounded-xl border border-gray-200 space-y-3.5">
                <span className="block text-xs font-black text-gray-800">العناصر المشمولة بالنقل:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input type="checkbox" disabled={sourceEmpStats.committees === 0} checked={transferCommittees} onChange={(e) => setTransferCommittees(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4" />
                    <span>اللجان القطاعية ({sourceEmpStats.committees})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input type="checkbox" disabled={sourceEmpStats.tasks === 0} checked={transferTasks} onChange={(e) => setTransferTasks(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4" />
                    <span>المهام الإدارية ({sourceEmpStats.tasks})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input type="checkbox" disabled={sourceEmpStats.events === 0} checked={transferEvents} onChange={(e) => setTransferEvents(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4" />
                    <span>الفعاليات ({sourceEmpStats.events})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input type="checkbox" checked={transferRecs} onChange={(e) => setTransferRecs(e.target.checked)} className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4" />
                    <span>التوصيات</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isTransferring} className="px-6 py-3 bg-brand text-white rounded-xl text-xs font-black disabled:opacity-50">
                  {isTransferring ? "جاري النقل..." : "تأكيد تفويض المهام"}
                </button>
              </div>
            </form>
            
            {dbDelegations && dbDelegations.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>سجل عمليات النقل والتكليف</span>
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-extrabold text-gray-500">التاريخ</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">النوع</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">المصدر</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">المستهدف</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">التفاصيل</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">الحالة</th>
                        <th className="px-4 py-3 font-extrabold text-gray-500">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dbDelegations.slice().sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((del: any) => (
                        <tr key={del.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600 font-mono" dir="ltr">{new Date(del.timestamp).toLocaleDateString('en-GB')}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{del.transferMode === "full" ? "نقل دائم" : "تكليف مؤقت"}</td>
                          <td className="px-4 py-3 font-bold text-red-700">{del.sourceEmpName}</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">{del.targetEmpName}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {[
                              del.transferCommittees ? "لجان" : "",
                              del.transferTasks ? "مهام" : "",
                              del.transferEvents ? "فعاليات" : ""
                            ].filter(Boolean).join("، ")}
                          </td>
                          <td className="px-4 py-3">
                            {del.transferMode === "full" ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black">مكتمل</span>
                            ) : del.status === "ended" ? (
                              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-black">منتهي</span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">نشط حتى {del.delegationEndDate}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {del.transferMode === "delegation" && del.status !== "ended" && (
                              <button
                                type="button"
                                onClick={() => handleEndDelegation(del.id)}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[10px] font-black transition-colors"
                              >
                                إنهاء التكليف
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        )}

        {/* TAB: APPROVALS */}
        {activeTab === "approvals" && currentUserRole === "SYS_ADMIN" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><UserCheck className="w-5 h-5 text-amber-500" /><span>طلبات الانضمام المعلقة</span></h2>
              {dbJoinRequests.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-xl text-center text-[11px] font-bold text-gray-500">لا توجد طلبات معلقة.</div>
              ) : (
                <div className="space-y-3">
                  {dbJoinRequests.map((req) => (
                    <div key={req.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center gap-4">
                      <div>
                        <span className="font-extrabold text-xs text-gray-900 block">{req.name}</span>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">{req.email} | {req.phone}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleApproveJoinRequest(req)} className="px-3 py-1.5 bg-brand text-white rounded-lg text-[10px] font-black"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleRejectJoinRequest(req)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><Lock className="w-5 h-5 text-brand" /><span>البريد المسموح (Whitelist)</span></h2>
              <form onSubmit={handleAddWhitelistEmail} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="اسم الموظف" value={whitelistNameStr} onChange={(e) => setWhitelistNameStr(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-[10px] font-bold text-gray-700" />
                  <input type="email" placeholder="البريد" value={whitelistEmailStr} onChange={(e) => setWhitelistEmailStr(e.target.value)} dir="ltr" className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-left" />
                </div>
                <div className="flex items-center justify-between">
                  <select value={whitelistRoleAr} onChange={(e) => setWhitelistRoleAr(e.target.value)} className="bg-white border border-gray-200 rounded-lg py-1 px-2 text-[10px] font-bold">
                    <option value="أخصائي">أخصائي</option>
                    <option value="رئيس قسم">رئيس قسم</option>
                    <option value="مدير إدارة">مدير إدارة</option>
                  </select>
                  <button type="submit" className="p-2 px-3.5 bg-slate-900 text-white text-[10px] font-black rounded-lg">إضافة</button>
                </div>
              </form>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {dbApprovedEmails.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-extrabold text-[11px] text-gray-900 block">{item.name}</span>
                      <span className="text-[10px] text-gray-400 block">{item.email} - {item.roleAr}</span>
                    </div>
                    <button onClick={() => handleRemoveWhitelistEmail(item.id, item.email)} className="p-1.5 bg-red-50 text-red-650 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PERMISSIONS */}
        {activeTab === "permissions" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5"><Lock className="w-5 h-5 text-indigo-600" /><span>صلاحيات الوصول</span></h2>
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#fcfdfd] border-b border-gray-200 text-gray-700 font-extrabold text-[10.5px]">
                  <tr>
                    <th rowSpan={2} className="p-4 border-l border-gray-200 align-middle">الموظف</th>
                    <th colSpan={9} className="p-2 text-center border-b border-l border-gray-200 bg-gray-50/50">إدارة اللجان</th>
                    <th colSpan={4} className="p-2 text-center border-b border-l border-gray-200 bg-gray-50/50">مساعد الأمين العام</th>
                    <th colSpan={4} className="p-2 text-center border-b border-l border-gray-200 bg-gray-50/50">إدارة المراكز</th>
                    <th colSpan={4} className="p-2 text-center border-b border-gray-200 bg-gray-50/50">إدارة المنتسبين</th>
                    <th rowSpan={2} className="p-4 text-center bg-blue-50 border-r border-gray-200 align-middle">إدارة النظام</th>
                  </tr>
                  <tr>
                    <th className="p-2 text-center border-l border-gray-200 bg-gray-100/50">الكل</th>
                    <th className="p-2 text-center border-l border-gray-200">الرئيسية</th>
                    <th className="p-2 text-center border-l border-gray-200">التشكيل</th>
                    <th className="p-2 text-center border-l border-gray-200">الأعضاء</th>
                    <th className="p-2 text-center border-l border-gray-200">الفعاليات</th>
                    <th className="p-2 text-center border-l border-gray-200">التوصيات</th>
                    <th className="p-2 text-center border-l border-gray-200">المهام</th>
                    <th className="p-2 text-center border-l border-gray-200">التقارير</th>
                    <th className="p-2 text-center border-l border-gray-200">المكتبة</th>
                    <th className="p-2 text-center border-l border-gray-200 bg-gray-100/50">الكل</th>
                    <th className="p-2 text-center border-l border-gray-200">الرئيسية</th>
                    <th className="p-2 text-center border-l border-gray-200">الفعاليات</th>
                    <th className="p-2 text-center border-l border-gray-200">المهام</th>
                    <th className="p-2 text-center border-l border-gray-200 bg-gray-100/50">الكل</th>
                    <th className="p-2 text-center border-l border-gray-200">الرئيسية</th>
                    <th className="p-2 text-center border-l border-gray-200">الفعاليات</th>
                    <th className="p-2 text-center border-l border-gray-200">المهام</th>
                    <th className="p-2 text-center border-l border-gray-200 bg-gray-100/50">الكل</th>
                    <th className="p-2 text-center border-l border-gray-200">الرئيسية</th>
                    <th className="p-2 text-center border-l border-gray-200">الفعاليات</th>
                    <th className="p-2 text-center border-gray-200">المهام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-bold text-gray-600">
                  
                  {Object.entries(
                    safeDbEmployees.reduce((acc, emp) => {
                      const dept = emp.orgLevel3 || emp.orgLevel2 || emp.orgLevel1 || "أخرى";
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(emp);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ).map(([dept, empsRaw]) => {
                    const emps = empsRaw as any[];
                    return (
                    <React.Fragment key={dept}>
                      <tr className="bg-gray-100">
                        <td colSpan={23} className="p-2 font-black text-xs text-gray-800 border-y border-gray-200">
                          {dept} <span className="text-[10px] text-gray-500 font-bold ml-2">({emps.length} موظف)</span>
                        </td>
                      </tr>
                      {emps.map((emp: any) => {

                    const COMMITTEES_PAGES = ["/", "/committees", "/members", "/events", "/recommendations", "/tasks", "/reports", "/library"];
                    const ASSISTANT_SEC_GEN_PAGES = ["/assistant-sec-gen", "/assistant-sec-gen/events", "/assistant-sec-gen/tasks"];
                    const CENTERS_PAGES = ["/centers", "/centers/events", "/centers/tasks"];
                    const AFFILIATES_PAGES = ["/affiliates", "/affiliates/events", "/affiliates/tasks"];
                    
                    const currentAllowed = Array.isArray(emp.allowedPages) ? emp.allowedPages : [];
                    
                    const handleCheckbox = async (path: string) => {
                      const updated = currentAllowed.includes(path) ? currentAllowed.filter(p => p !== path) : [...currentAllowed, path];
                      await updateFirebaseEmp(emp.id, { allowedPages: updated });
                    };

                    const handleDeptCheckbox = async (paths: string[]) => {
                      const allIncluded = paths.every(p => currentAllowed.includes(p));
                      let updated;
                      if (allIncluded) {
                        updated = currentAllowed.filter(p => !paths.includes(p));
                      } else {
                        updated = Array.from(new Set([...currentAllowed, ...paths]));
                      }
                      await updateFirebaseEmp(emp.id, { allowedPages: updated });
                    };

                    const hasAllCommittees = COMMITTEES_PAGES.every(p => currentAllowed.includes(p));
                    const hasAllAssistant = ASSISTANT_SEC_GEN_PAGES.every(p => currentAllowed.includes(p));
                    const hasAllCenters = CENTERS_PAGES.every(p => currentAllowed.includes(p));
                    const hasAllAffiliates = AFFILIATES_PAGES.every(p => currentAllowed.includes(p));

                    return (
                      <tr key={emp.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-xs font-extrabold text-gray-900 border-l border-gray-200">{emp.name}</td>
                        
                        {/* Committees */}
                        <td className="p-2 text-center border-l border-gray-200 bg-gray-50/50">
                          <input type="checkbox" checked={hasAllCommittees} onChange={() => handleDeptCheckbox(COMMITTEES_PAGES)} className="w-4 h-4 text-gray-800 rounded border-gray-300" />
                        </td>
                        {COMMITTEES_PAGES.map(path => (
                          <td key={path} className="p-2 text-center border-l border-gray-200">
                            <input type="checkbox" checked={currentAllowed.includes(path)} onChange={() => handleCheckbox(path)} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                          </td>
                        ))}
                        
                        {/* Assistant Sec Gen */}
                        <td className="p-2 text-center border-l border-gray-200 bg-gray-50/50">
                          <input type="checkbox" checked={hasAllAssistant} onChange={() => handleDeptCheckbox(ASSISTANT_SEC_GEN_PAGES)} className="w-4 h-4 text-gray-800 rounded border-gray-300" />
                        </td>
                        {ASSISTANT_SEC_GEN_PAGES.map(path => (
                          <td key={path} className="p-2 text-center border-l border-gray-200">
                            <input type="checkbox" checked={currentAllowed.includes(path)} onChange={() => handleCheckbox(path)} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                          </td>
                        ))}
                        
                        {/* Centers */}
                        <td className="p-2 text-center border-l border-gray-200 bg-gray-50/50">
                          <input type="checkbox" checked={hasAllCenters} onChange={() => handleDeptCheckbox(CENTERS_PAGES)} className="w-4 h-4 text-gray-800 rounded border-gray-300" />
                        </td>
                        {CENTERS_PAGES.map(path => (
                          <td key={path} className="p-2 text-center border-l border-gray-200">
                            <input type="checkbox" checked={currentAllowed.includes(path)} onChange={() => handleCheckbox(path)} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                          </td>
                        ))}
                        
                        {/* Affiliates */}
                        <td className="p-2 text-center border-l border-gray-200 bg-gray-50/50">
                          <input type="checkbox" checked={hasAllAffiliates} onChange={() => handleDeptCheckbox(AFFILIATES_PAGES)} className="w-4 h-4 text-gray-800 rounded border-gray-300" />
                        </td>
                        {AFFILIATES_PAGES.map(path => (
                          <td key={path} className="p-2 text-center border-gray-200">
                            <input type="checkbox" checked={currentAllowed.includes(path)} onChange={() => handleCheckbox(path)} className="w-4 h-4 text-emerald-600 rounded border-gray-300" />
                          </td>
                        ))}
                        
                        {/* System Admin */}
                        <td className="p-4 text-center bg-blue-50/50 border-r border-gray-200">
                          <input type="checkbox" checked={emp.adminPermissions || false} onChange={async (e) => await updateFirebaseEmp(emp.id, { adminPermissions: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        </td>
                      </tr>
                    );
                  })}
                  </React.Fragment>
                  );
                 })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: LOGS */}
        {activeTab === "logs" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5"><FileText className="w-5 h-5 text-red-650" /><span>سجل المراقبة الأمني</span></h2>
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[10px]">
                  <tr><th className="p-4">التوقيت</th><th className="p-4">الموظف</th><th className="p-4">العملية</th><th className="p-4">التفاصيل</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {dbSystemLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/55">
                      <td className="p-4 font-mono text-[10px] text-gray-500">{log.time}</td>
                      <td className="p-4 font-extrabold text-gray-900">{log.employeeName}</td>
                      <td className="p-4"><span className="bg-blue-50 text-brand px-2 py-0.5 rounded text-[10px] font-bold">{log.operationType}</span></td>
                      <td className="p-4 text-gray-550 leading-relaxed font-semibold">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MASTER DATA */}
        {activeTab === "master_data" && currentUserRole === "SYS_ADMIN" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5"><Database className="w-5 h-5 text-gray-800" /><span>إدارة البيانات الموحدة</span></h2>
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {[{ key: "committees", label: "اللجان", count: dbCommittees?.length || 0 }, { key: "members", label: "الأعضاء", count: dbMembers?.length || 0 }].map((tab) => (
                <button key={tab.key} onClick={() => setSelectedSubCol(tab.key)} className={`px-3 py-1.5 rounded-full text-xs font-black border ${selectedSubCol === tab.key ? "bg-brand text-white border-brand" : "bg-gray-50 text-gray-600 border-gray-200"}`}>{tab.label} ({tab.count})</button>
              ))}
            </div>
            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200">
              <table className="w-full text-right text-xs">
                {selectedSubCol === "committees" && (
                  <tbody className="divide-y divide-gray-100">
                    {dbCommittees.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/55">
                        <td className="p-4 font-black">{item.name}</td>
                        <td className="p-4 text-blue-800">{item.specialist || "غير معين"}</td>
                        <td className="p-4"><button onClick={() => handleDeleteMasterItem(item.id, "committees")} className="p-1.5 text-red-550"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                )}
                {selectedSubCol === "members" && (
                  <tbody className="divide-y divide-gray-100">
                    {dbMembers.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/55">
                        <td className="p-4 font-black">{item.name}</td>
                        <td className="p-4 text-blue-800">{item.phone}</td>
                        <td className="p-4"><button onClick={() => handleDeleteMasterItem(item.id, "members")} className="p-1.5 text-red-550"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ORG BUILDER MODAL */}
      <AnimatePresence>
        {showOrgNodeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrgNodeModal(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-gray-900">{orgNodeForm.id ? "تعديل عقدة في الهيكل التنظيمي" : "إضافة عقدة للهيكل التنظيمي"}</h3>
                <button onClick={() => setShowOrgNodeModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSaveOrgNode} className="space-y-4">
                {orgNodeForm.type === "ROOT" ? (
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">مسمى الإدارة العليا</label>
                    <input type="text" required value={orgNodeForm.name} onChange={(e) => setOrgNodeForm({...orgNodeForm, name: e.target.value})} placeholder="اكتب المسمى هنا..." className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand" />
                  </div>
                ) : (
                  <>
                    {!orgNodeForm.id && orgNodeForm.type !== "JOB_TITLE" && (
                      <div className="mb-4">
                        <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">نوع العقدة المضافة</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={orgNodeForm.type === "STAFF"} onChange={() => setOrgNodeForm({...orgNodeForm, type: "STAFF", isSubcategory: false})} className="w-4 h-4 text-brand" />
                            <span className="text-xs font-bold">سكرتير / وظيفة مساندة</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={orgNodeForm.type !== "STAFF"} onChange={() => setOrgNodeForm({...orgNodeForm, type: "SECTOR", isSubcategory: true})} className="w-4 h-4 text-brand" />
                            <span className="text-xs font-bold">جهة تابعة (تصنيف فرعي)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {orgNodeForm.type !== "STAFF" && orgNodeForm.type !== "JOB_TITLE" && orgNodeForm.isSubcategory && !orgNodeForm.id && (
                      <div className="mb-4">
                        <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">اختر نوع التصنيف الفرعي (القائمة)</label>
                        <select value={orgNodeForm.type} onChange={(e) => setOrgNodeForm({...orgNodeForm, type: e.target.value as any})} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand">
                          <option value="SECTOR">قطاع (مرتبط بالإدارة العليا)</option>
                          <option value="DEPARTMENT">إدارة (مرتبطة بقطاع)</option>
                          <option value="SECTION">قسم (مرتبط بإدارة)</option>
                        </select>
                      </div>
                    )}

                    {orgNodeForm.type === "DEPARTMENT" && (
                      <div className="mb-4">
                        <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">اختر القطاع المرجعي</label>
                        <select required value={orgNodeForm.parent} onChange={(e) => setOrgNodeForm({...orgNodeForm, parent: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand">
                          <option value="">-- اختر قطاع --</option>
                          {dbOrgNodes.filter(n => n.type === "SECTOR").map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    )}

                    {orgNodeForm.type === "SECTION" && (
                      <div className="mb-4">
                        <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">اختر الإدارة المرجعية</label>
                        <select required value={orgNodeForm.parent} onChange={(e) => setOrgNodeForm({...orgNodeForm, parent: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand">
                          <option value="">-- اختر إدارة --</option>
                          {dbOrgNodes.filter(n => n.type === "DEPARTMENT").map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                    )}

                    {orgNodeForm.type === "JOB_TITLE" && (
                      <div className="mb-4">
                        <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">القسم / المركز المرجعي</label>
                        <select required value={orgNodeForm.parent} onChange={(e) => setOrgNodeForm({...orgNodeForm, parent: e.target.value})} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand">
                          <option value="">-- اختر قسم / مركز --</option>
                          {dbOrgNodes.filter(n => n.type === "SECTION").map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">
                        مسمى {orgNodeForm.type === 'STAFF' ? 'الوظيفة' : orgNodeForm.type === 'JOB_TITLE' ? 'المسمى / الأخصائي' : 'التصنيف'} (يكتب يدوياً)
                      </label>
                      <input type="text" required value={orgNodeForm.name} onChange={(e) => setOrgNodeForm({...orgNodeForm, name: e.target.value})} placeholder="اكتب المسمى هنا..." className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand" />
                    </div>
                  </>
                )}

                <div className="pt-2 flex justify-end">
                  <button type="submit" className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-black">{orgNodeForm.id ? "حفظ التعديلات" : "حفظ وإضافة"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DIALOG */}
      <AnimatePresence>
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDialog(null)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-4 text-red-600"><AlertTriangle className="w-6 h-6" /><h3 className="text-lg font-black">{confirmDialog.title}</h3></div>
              <p className="text-sm font-semibold text-gray-700 whitespace-pre-wrap">{confirmDialog.message}</p>
              <div className="mt-6 flex justify-end gap-3">
                {!confirmDialog.isAlert && (
                  <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg">
                    {confirmDialog.cancelText || "إلغاء"}
                  </button>
                )}
                <button onClick={confirmDialog.onConfirm} className={`px-4 py-2 text-xs font-black text-white rounded-lg ${confirmDialog.isAlert ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {confirmDialog.confirmText || "تأكيد الحذف"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EMPLOYEE FORM MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 15, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 15, opacity: 0 }} className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden">
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand text-white rounded-xl"><UserPlus className="w-5 h-5 stroke-[2.5]" /></div>
                  <div>
                    <span className="text-[9px] font-black text-brand uppercase block mb-0.5">بطاقات العمل</span>
                    <h3 className="font-extrabold text-gray-900 text-base">{isEditing ? `تعديل بيانات: ${formName}` : "إضافة موظف معتمد جديد"}</h3>
                  </div>
                </div>
                <button onClick={() => setShowFormModal(false)} className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveEmployee} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                
                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-20 h-20 mb-2">
                    <div className="w-full h-full rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
                      {formPhoto ? <img src={formPhoto} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-gray-300" />}
                    </div>
                    <label className="absolute bottom-[-8px] right-[-8px] w-7 h-7 bg-brand rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-blue-700">
                      <Plus className="w-3.5 h-3.5" />
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

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الرقم الوظيفي</label>
                    <input type="text" required value={formId} onChange={(e) => setFormId(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-center outline-none focus:border-brand" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم التحويلة</label>
                    <input type="text" value={formExtension} onChange={(e) => setFormExtension(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-center outline-none focus:border-brand" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الصفة</label>
                    <select value={formPrefix} onChange={(e) => setFormPrefix(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-gray-700 outline-none focus:border-brand">
                      <option value="الأستاذ">الأستاذ</option><option value="الأستاذة">الأستاذة</option><option value="الدكتور">الدكتور</option><option value="الدكتورة">الدكتورة</option><option value="المهندس">المهندس</option><option value="المهندسة">المهندسة</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">الاسم الثلاثي</label>
                    <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold outline-none focus:border-brand" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">البريد الإلكتروني {isEditing && <span className="text-amber-600">(ثابت)</span>}</label>
                    <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} disabled={isEditing} dir="ltr" className="w-full h-10 bg-gray-50 border border-gray-300 rounded-xl px-3 text-xs font-semibold text-left outline-none focus:border-brand disabled:opacity-80" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-extrabold mb-1.5">رقم الجوال</label>
                    <input type="tel" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)} dir="ltr" className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-semibold text-left outline-none focus:border-brand" />
                  </div>
                </div>

                {/* الهيكل الإداري المتسلسل 5 مستويات */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <span className="block text-xs font-black text-gray-800 mb-3">التسكين في الهيكل التنظيمي المعتمد:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* 1 */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-500 font-extrabold">1. الأمانة العامة</label>
                      <select value={formOrgLevel1} onChange={(e) => setFormOrgLevel1(e.target.value)} className="w-full h-9 bg-white border border-gray-300 rounded-lg px-2 text-[11px] font-bold outline-none focus:border-brand">
                        <option value="الأمانة العامة">الأمانة العامة</option>
                      </select>
                    </div>

                    {/* 2 */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-500 font-extrabold">2. القطاع</label>
                      <select value={formOrgLevel2} onChange={(e) => {
                        setFormOrgLevel2(e.target.value);
                        setFormOrgLevel3("");
                        setFormOrgLevel4("");
                        setFormOrgLevel5("");
                      }} className="w-full h-9 bg-white border border-gray-300 rounded-lg px-2 text-[11px] font-bold outline-none focus:border-brand">
                        <option value="">-- اختر القطاع --</option>
                        {dbOrgNodes.filter(n => n.type === "SECTOR").map(node => (
                          <option key={node.id} value={node.name}>{node.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3 */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-500 font-extrabold">3. الإدارة</label>
                      <select value={formOrgLevel3} onChange={(e) => {
                        setFormOrgLevel3(e.target.value);
                        setFormOrgLevel4("");
                        setFormOrgLevel5("");
                      }} disabled={!formOrgLevel2} className="w-full h-9 bg-white border border-gray-300 rounded-lg px-2 text-[11px] font-bold outline-none focus:border-brand disabled:bg-gray-100">
                        <option value="">-- اختر الإدارة --</option>
                        {dbOrgNodes.filter(n => n.type === "DEPARTMENT" && n.parent === formOrgLevel2).map(node => (
                          <option key={node.id} value={node.name}>{node.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4 */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-500 font-extrabold">4. القسم / المركز</label>
                      <select value={formOrgLevel4} onChange={(e) => {
                        setFormOrgLevel4(e.target.value);
                        setFormOrgLevel5("");
                      }} disabled={!formOrgLevel3} className="w-full h-9 bg-white border border-gray-300 rounded-lg px-2 text-[11px] font-bold outline-none focus:border-brand disabled:bg-gray-100">
                        <option value="">-- اختر القسم / المركز --</option>
                        {dbOrgNodes.filter(n => n.type === "SECTION" && n.parent === formOrgLevel3).map(node => (
                          <option key={node.id} value={node.name}>{node.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 5 */}
                    <div className="space-y-1.5 lg:col-span-2">
                      <label className="block text-[10px] text-gray-500 font-extrabold">5. التخصص أو المسمى الوظيفي المعتمد</label>
                      <select value={formOrgLevel5} onChange={(e) => setFormOrgLevel5(e.target.value)} className="w-full h-9 bg-white border border-gray-300 rounded-lg px-2 text-[11px] font-bold outline-none focus:border-brand">
                        <option value="">-- يرجى الاختيار (حسب الهيكل) --</option>
                        {dbOrgNodes.filter(n => 
                          (n.type === 'JOB_TITLE' && n.parent === formOrgLevel4) ||
                          (n.type === 'STAFF' && n.parent === formOrgLevel4) ||
                          (n.type === 'STAFF' && !formOrgLevel4 && n.parent === formOrgLevel3) ||
                          (n.type === 'STAFF' && !formOrgLevel3 && n.parent === formOrgLevel2) ||
                          (n.type === 'STAFF' && !formOrgLevel2 && n.parent === formOrgLevel1)
                        ).map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                      </select>
                      {/* Fallback for manually typed ones previously */}
                      {!dbOrgNodes.some(n => n.name === formOrgLevel5 && (n.type === 'JOB_TITLE' || n.type === 'STAFF')) && formOrgLevel5 && (
                         <input type="text" placeholder="اكتب المسمى..." value={formOrgLevel5} onChange={(e) => setFormOrgLevel5(e.target.value)} className="w-full h-9 mt-1 bg-white border border-gray-300 rounded-lg px-2 text-[11px] font-bold outline-none focus:border-brand" />
                      )}
                    </div>
                    
                    {/* Committees Selection */}
                    {(formOrgLevel5 === 'أخصائي' || formOrgLevel5 === 'أخصائي اللجان') && [formOrgLevel1, formOrgLevel2, formOrgLevel3, formOrgLevel4].includes('إدارة اللجان') && (
                      <div className="space-y-1.5 lg:col-span-full">
                        <label className="block text-[10px] text-gray-500 font-extrabold">ارتباط اللجان (متعدد)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                          {dbCommittees.map(comm => (
                            <label key={comm.id} className="flex items-start gap-2 cursor-pointer bg-white p-2 rounded shadow-sm border border-gray-200 hover:border-brand/30 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={formCommittees.includes(comm.name)} 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormCommittees([...formCommittees, comm.name]);
                                  } else {
                                    setFormCommittees(formCommittees.filter(c => c !== comm.name));
                                  }
                                }} 
                                className="w-3.5 h-3.5 mt-0.5 text-brand rounded border-gray-300" 
                              />
                              <span className="text-[10px] font-bold text-gray-700 leading-tight">{comm.name}</span>
                            </label>
                          ))}
                          {dbCommittees.length === 0 && (
                            <span className="text-[10px] text-gray-500 col-span-full">لا توجد لجان مشكلة حالياً.</span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-500 font-extrabold">صلاحيات الموظف بالنظام</label>
                    <select value={formRole} onChange={(e: any) => setFormRole(e.target.value)} disabled={currentUserRole !== "SYS_ADMIN"} className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold outline-none focus:border-brand disabled:opacity-50">
                      <option value="SPECIALIST">أخصائي / مستخدم عادي</option>
                      <option value="DEPT_HEAD">رئيس قسم</option>
                      <option value="MANAG_DIR">مدير إدارة</option>
                      <option value="SECRETARY">السكرتير</option>
                      <option value="ASSISTANT_SEC_GEN">مساعد الأمين العام</option>
                      <option value="EXECUTIVE_OFFICE">المكتب التنفيذي</option>
                      <option value="SECRETARY_GENERAL">أمين عام</option>
                      <option value="SYS_ADMIN">مدير نظام</option>
                    </select>
                  </div>
                  {currentUserRole === "SYS_ADMIN" && (
                    <div className="flex gap-4">
                      <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 h-10">
                        <input type="checkbox" id="fActive" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="w-4 h-4 text-brand" />
                        <label htmlFor="fActive" className="text-[10px] font-extrabold cursor-pointer">موظف نشط</label>
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 h-10">
                        <input type="checkbox" id="fLogin" checked={formLoginEnabled} onChange={(e) => setFormLoginEnabled(e.target.checked)} className="w-4 h-4 text-brand" />
                        <label htmlFor="fLogin" className="text-[10px] font-extrabold cursor-pointer">تفعيل الدخول</label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowFormModal(false)} className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">إلغاء</button>
                  <button type="submit" className="px-5 py-2.5 text-xs font-bold text-white bg-brand rounded-xl hover:bg-brand/90 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /><span>حفظ بيانات الموظف</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUX MODAL: EMPLOYEE COMMITTEES */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEmployee(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl p-5 w-full max-w-md relative z-10 text-right">
              <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 left-4 text-gray-400"><X className="w-5 h-5" /></button>
              <h3 className="font-extrabold text-sm mb-2">اللجان المربوطة بـ: {selectedEmployee.name}</h3>
              <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                {selectedEmployee.committees.length === 0 ? <span className="text-gray-400 text-xs">لا يوجد.</span> : selectedEmployee.committees.map((comName, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{comName}</span>
                    {currentUserRole === "SYS_ADMIN" && (
                      <button onClick={() => handleRemoveCommitteeFromEmployee(comName)} className="p-1 px-2 text-[10px] bg-red-50 text-red-650 rounded border border-red-100">إلغاء</button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}