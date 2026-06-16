import React, { useState, useEffect, FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users2, 
  Search, 
  Plus, 
  X, 
  Users, 
  Check,
  LayoutGrid,
  List,
  Settings,
  AlertTriangle,
  Upload,
  UserCheck,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  ShieldAlert,
  Building2,
  Activity,
  FileSpreadsheet,
  Lock,
  ChevronDown,
  ArrowRightLeft,
  Bell,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  User
} from "lucide-react";

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
  password?: string; // كلمة المرور للصلاحية والاعتماد
}

export interface JoinRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  requestedRole: string;
  requestedRoleAr: string;
  requestDate: string;
}

export interface ApprovedEmail {
  id: number;
  email: string;
  name: string;
  roleAr: string;
  approvedBy: string;
  approvedDate: string;
}

export interface SystemLog {
  id: number;
  employeeName: string;
  time: string;
  operationType: string;
  status: "ناجحة" | "مرفوضة";
  details: string;
}

// Default initial employees list
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "221550",
    name: "باسم شهاب الدين",
    role: "SYS_ADMIN",
    roleAr: "مدير النظام / أخصائي",
    jobTitle: "مدير النظام والرقابة",
    phone: "+966558494158",
    email: "khalafshehab@gmail.com",
    photo: PRESET_AVATARS[1],
    committees: ["الحج والعمرة", "الصناعية"],
    active: true,
    joinDate: "2024/01/15",
    password: "password"
  },
  {
    id: "1004",
    name: "هشام عريف",
    role: "MANAG_DIR",
    roleAr: "مدير إدارة اللجان",
    jobTitle: "مدير عام إدارة اللجان والفعاليات",
    phone: "+966502593488",
    email: "hisham@makkahchamber.sa",
    photo: PRESET_AVATARS[2],
    committees: ["الإعلام والتسويق", "المعارض والفعاليات", "الأوقاف", "المعادن الثمينة والأحجار الكريمة"],
    active: true,
    joinDate: "2022/05/10"
  },
  {
    id: "1003",
    name: "موفق سندي",
    role: "DEPT_HEAD",
    roleAr: "رئيس قسم اللجان",
    jobTitle: "رئيس قسم اللجان القطاعية",
    phone: "+966555510949",
    email: "mowaffaq@makkahchamber.sa",
    photo: PRESET_AVATARS[4],
    committees: ["التعليم الأهلي والتدريب", "التغذية والإعاشة", "الأزياء"],
    active: true,
    joinDate: "2023/11/01"
  },
  {
    id: "1002",
    name: "عمار العمودي",
    role: "SPECIALIST",
    roleAr: "أخصائي اللجان",
    jobTitle: "أخصائي لجان قطاعية",
    phone: "+966555503159",
    email: "ammar@makkahchamber.sa",
    photo: PRESET_AVATARS[6],
    committees: ["التجارية", "المقاولين"],
    active: true,
    joinDate: "2024/02/10"
  },
  {
    id: "1005",
    name: "عبدالعزيز ناجي",
    role: "SPECIALIST",
    roleAr: "أخصائي اللجان",
    jobTitle: "أخصائي لجان أول",
    phone: "+966561114011",
    email: "abdulaziz.n@makkahchamber.sa",
    photo: PRESET_AVATARS[1],
    committees: ["التطوير العقاري", "الفنادق والسياحة"],
    active: true,
    joinDate: "2024/03/01"
  },
  {
    id: "1006",
    name: "يعقوب الريمي",
    role: "SPECIALIST",
    roleAr: "أخصائي اللجان",
    jobTitle: "أخصائي لجان وتنسيق فعاليات",
    phone: "+966555563378",
    email: "yaqoob@makkahchamber.sa",
    photo: PRESET_AVATARS[3],
    committees: ["الخدمات اللوجستية", "المسؤولية الاجتماعية والتطوع", "الاستقدام"],
    active: true,
    joinDate: "2024/02/20"
  },
  {
    id: "1007",
    name: "علاء الأهدل",
    role: "SPECIALIST",
    roleAr: "أخصائي اللجان",
    jobTitle: "أخصائي لجان صحية ومشتركة",
    phone: "+966500008136",
    email: "alaa@makkahchamber.sa",
    photo: PRESET_AVATARS[5],
    committees: ["الصحية والدوائية", "المهن الاستشارية", "المصاعد والسلامة", "مراكز التجميل والصوالين النسائية"],
    active: true,
    joinDate: "2024/04/15"
  },
  {
    id: "1008",
    name: "عماد جمال",
    role: "SPECIALIST",
    roleAr: "أخصائي اللجان",
    jobTitle: "أخصائي لجان تقنية متخصصة",
    phone: "+966504505027",
    email: "emad.j@makkahchamber.sa",
    photo: PRESET_AVATARS[7],
    committees: ["تقنية المعلومات والاتصالات", "ريادة الأعمال"],
    active: false,
    joinDate: "2024/05/20"
  }
];

const INITIAL_JOIN_REQUESTS: JoinRequest[] = [
  {
    id: 1,
    name: "فيصل الحربي",
    email: "faisal.harbi@makkahchamber.sa",
    phone: "+966504930101",
    requestedRole: "SPECIALIST",
    requestedRoleAr: "أخصائي",
    requestDate: "2026/06/08"
  },
  {
    id: 2,
    name: "نورة القحطاني",
    email: "noura.q@makkahchamber.sa",
    phone: "+966554520934",
    requestedRole: "SPECIALIST",
    requestedRoleAr: "أخصائي",
    requestDate: "2026/06/10"
  }
];

const INITIAL_APPROVED_EMAILS: ApprovedEmail[] = [
  {
    id: 1,
    email: "khalid.sh@makkahchamber.sa",
    name: "خالد الشهري",
    roleAr: "أخصائي لجان قطاعية",
    approvedBy: "باسم شهاب الدين",
    approvedDate: "2026/05/20"
  },
  {
    id: 2,
    email: "sara.f@makkahchamber.sa",
    name: "سارة الفضل",
    roleAr: "أخصائي لجان نسائية",
    approvedBy: "باسم شهاب الدين",
    approvedDate: "2026/06/01"
  }
];

const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 1,
    employeeName: "باسم شهاب الدين",
    time: "2026-06-10 10:45:22",
    operationType: "تسجيل دخول",
    status: "ناجحة",
    details: "تسجيل دخول للأخصائي من عنوان IP 192.168.1.55"
  },
  {
    id: 2,
    employeeName: "هشام عريف",
    time: "2026-06-10 10:12:05",
    operationType: "تعديل محضر",
    status: "ناجحة",
    details: "تعديل بنود محضر الاجتماع الخامس للجنة الإعلام والتسويق"
  },
  {
    id: 3,
    employeeName: "موفق سندي",
    time: "2026-06-10 09:44:12",
    operationType: "حذف مهمة",
    status: "ناجحة",
    details: "حذف المهمة الداخلية غير النشطة 'تحديث مستند دليل تجهيزات الفعاليات'"
  },
  {
    id: 4,
    employeeName: "عمر الرويزن",
    time: "2026-06-09 17:30:10",
    operationType: "تسجيل جديد",
    status: "مرفوضة",
    details: "محاولة تسجيل موظف ببريد خارجي غير معتمد omar.rowaizen@gmail.com"
  },
  {
    id: 5,
    employeeName: "باسم شهاب الدين",
    time: "2026-06-09 14:15:00",
    operationType: "اعتماد طلب انضمام",
    status: "ناجحة",
    details: "اعتماد انضمام الموظف عمار العمودي وتعيينه كأخصائي"
  },
  {
    id: 6,
    employeeName: "هشام عريف",
    time: "2026-06-09 11:05:03",
    operationType: "أرشفة وثيقة",
    status: "ناجحة",
    details: "ربط وثيقة قرار تشكيل لجنة الفنادق والسياحة بمجلد Google Drive"
  }
];

import { collection, onSnapshot, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirestoreCollection } from '../lib/firebaseUtils';

export default function OrgChart() {
  // Navigation tabs for this view
  const [activeTab, setActiveTab] = useState<"hierarchy" | "approvals" | "logs_audit" | "account_profile">("hierarchy");

  // Live Data arrays loaded with local persistence
  const { data: dbEmployees, addDocument: addFirebaseEmp, updateDocument: updateFirebaseEmp, deleteDocument: deleteFirebaseEmp } = useFirestoreCollection<Employee>("employees", []);
  const { data: dbJoinRequests, addDocument: addFirebaseReq, updateDocument: updateFirebaseReq, deleteDocument: deleteFirebaseReq } = useFirestoreCollection<JoinRequest>("join_requests", []);
  const { data: dbApprovedEmails, addDocument: addFirebaseAppr, updateDocument: updateFirebaseAppr, deleteDocument: deleteFirebaseAppr } = useFirestoreCollection<ApprovedEmail>("approved_emails", []);
  const { data: dbSystemLogs, addDocument: addFirebaseLog, updateDocument: updateFirebaseLog, deleteDocument: deleteFirebaseLog } = useFirestoreCollection<SystemLog>("system_logs", []);
  const { data: dbCommittees } = useFirestoreCollection<any>("committees", []);

  const setEmployees = (action: React.SetStateAction<Employee[]>) => {
    let nextItems = typeof action === 'function' ? action(dbEmployees) : action;
    dbEmployees.forEach(existing => {
       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseEmp(String(existing.id));
       }
    });

    nextItems.forEach(nextI => {
       updateFirebaseEmp(String(nextI.id), nextI);
    });
  };

  const setJoinRequests = (action: React.SetStateAction<JoinRequest[]>) => {
    let nextItems = typeof action === 'function' ? action(dbJoinRequests) : action;
    dbJoinRequests.forEach(existing => {
       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseReq(String(existing.id));
       }
    });
    nextItems.forEach(nextI => {
       updateFirebaseReq(String(nextI.id), nextI);
    });
  };

  const setApprovedEmails = (action: React.SetStateAction<ApprovedEmail[]>) => {
    let nextItems = typeof action === 'function' ? action(dbApprovedEmails) : action;
    dbApprovedEmails.forEach(existing => {
       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseAppr(String(existing.id));
       }
    });
    nextItems.forEach(nextI => {
       updateFirebaseAppr(String(nextI.id), nextI);
    });
  };

  const setSystemLogs = (action: React.SetStateAction<SystemLog[]>) => {
    let nextItems = typeof action === 'function' ? action(dbSystemLogs) : action;
    dbSystemLogs.forEach(existing => {
       if (!nextItems.find(e => e.id === existing.id)) {
          deleteFirebaseLog(String(existing.id));
       }
    });
    nextItems.forEach(nextI => {
       updateFirebaseLog(String(nextI.id), nextI);
    });
  };

  const employees = dbEmployees;
  const joinRequests = dbJoinRequests;
  const approvedEmails = dbApprovedEmails;
  const systemLogs = dbSystemLogs;

  const availableCommittees = dbCommittees.map(c => c.name);

  // Sync to database local storage on change
  useEffect(() => {
    try {
      localStorage.setItem("app_employees", JSON.stringify(employees));
    } catch (e) {
      console.error("Failed to write app_employees:", e);
    }

    try {
      const savedComms = localStorage.getItem("app_committees");
      if (savedComms) {
        const comms = JSON.parse(savedComms);
        if (Array.isArray(comms)) {
          const synced = comms.map((comm: any) => {
            if (!comm) return comm;
            // Find employee who has this committee in their list
            const assignedEmp = employees.find(emp => 
              emp && emp.active && emp.committees && emp.committees.includes(comm.name)
            );
            if (assignedEmp) {
              return { ...comm, specialist: assignedEmp.name };
            }
            return comm;
          });
          localStorage.setItem("app_committees", JSON.stringify(synced));
        }
      }
    } catch (e) {
      console.error("Error syncing committees with employees:", e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem("app_join_requests", JSON.stringify(joinRequests));
    } catch (e) {}
  }, [joinRequests]);

  useEffect(() => {
    try {
      localStorage.setItem("app_approved_emails", JSON.stringify(approvedEmails));
    } catch (e) {}
  }, [approvedEmails]);

  useEffect(() => {
    try {
      localStorage.setItem("app_system_logs", JSON.stringify(systemLogs));
    } catch (e) {}
  }, [systemLogs]);

  // View UI parameters for Hierarchy/Employees List
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilterQuery, setEmployeeFilterQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [activeGearMenuId, setActiveGearMenuId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [roleInfoMessage, setRoleInfoMessage] = useState("");

  // Search parameters for Logs Audit
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logFilterQuery, setLogFilterQuery] = useState("");
  const [isLogSearchExpanded, setIsLogSearchExpanded] = useState(false);

  // Form Fields for Add/Edit Employee
  const [empId, setEmpId] = useState("");
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState<Employee["role"]>("SPECIALIST");
  const [empJobTitle, setEmpJobTitle] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empExtension, setEmpExtension] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhoto, setEmpPhoto] = useState(PRESET_AVATARS[0]);
  const [empCommittees, setEmpCommittees] = useState<string[]>([]);
  const [empActive, setEmpActive] = useState(true);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [selectedCommToLink, setSelectedCommToLink] = useState("");

  // Quick avatar selector parameters
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  // Field for Pre-Approving Email
  const [newApprovedEmail, setNewApprovedEmail] = useState("");
  const [newApprovedName, setNewApprovedName] = useState("");
  const [newApprovedRole, setNewApprovedRole] = useState("أخصائي لجان قطاعية");

  // Profile Form State for standard "إعدادات الحساب" profile
  const [profileName, setProfileName] = useState(() => {
    try {
      const saved = localStorage.getItem("current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed.name;
      }
    } catch(e) {}
    return "باسم شهاب الدين";
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    try {
      const saved = localStorage.getItem("current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed.email;
      }
    } catch(e) {}
    return "khalafshehab@gmail.com";
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    try {
      const saved = localStorage.getItem("current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone) return parsed.phone;
      }
    } catch(e) {}
    return "+966558494158";
  });
  const [profileJob, setProfileJob] = useState(() => {
    try {
      const saved = localStorage.getItem("current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.jobTitle) return parsed.jobTitle;
      }
    } catch(e) {}
    return "مدير النظام والرقابة";
  });
  const [profilePhoto, setProfilePhoto] = useState(() => {
    try {
      const saved = localStorage.getItem("current_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.photo) return parsed.photo;
      }
    } catch(e) {}
    return PRESET_AVATARS[1];
  });
  const [profilePassword, setProfilePassword] = useState("********");
  const [profileNotif, setProfileNotif] = useState(true);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Details view Modal
  const [detailsEmployee, setDetailsEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Action: Add/Log dynamic logs
  const addSystemLog = (type: string, details: string, status: "ناجحة" | "مرفوضة" = "ناجحة") => {
    const admin = employees.find(e => e.role === "SYS_ADMIN");
    const name = admin ? admin.name : profileName;
    const newLog: SystemLog = {
      id: Date.now(),
      employeeName: name, // Logged in System Admin (dynamic)
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operationType: type,
      status: status,
      details: details
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Pre-approve an email
  const handleAddApprovedEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!newApprovedEmail.trim() || !newApprovedName.trim()) return;

    const emailStr = newApprovedEmail.trim().toLowerCase();
    
    // Check if duplicate
    if (approvedEmails.some(a => a.email.toLowerCase() === emailStr)) {
      alert("هذا البريد الإلكتروني معتمد مسبقاً!");
      return;
    }

    const item: ApprovedEmail = {
      id: Date.now(),
      email: emailStr,
      name: newApprovedName.trim(),
      roleAr: newApprovedRole,
      approvedBy: profileName,
      approvedDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    };

    setApprovedEmails([item, ...approvedEmails]);
    addSystemLog("اعتماد بريد مسبق", `تمت إضافة البريد ${emailStr} كبريد معتمد للأخصائي ${item.name}`);
    
    setNewApprovedEmail("");
    setNewApprovedName("");
  };

  // Delete a pre-approved email
  const handleDeleteApprovedEmail = (id: number, email: string) => {
    setApprovedEmails(prev => prev.filter(x => x.id !== id));
    addSystemLog("حذف بريد معتمد", `إلغاء أذونات التسجيل المسبق للبريد الإلكتروني ${email}`);
  };

  // Accept a join request
  const handleAcceptJoinRequest = (req: JoinRequest) => {
    // Check if the email exists in pre-approved list
    const isPreApproved = approvedEmails.some(a => a.email.toLowerCase() === req.email.toLowerCase());
    
    // Auto-generate employee id on accept
    const nextIdStr = String(1000 + employees.length + 1);

    // Create the new employee
    const newEmp: Employee = {
      id: nextIdStr,
      name: req.name,
      role: req.requestedRole as Employee["role"],
      roleAr: req.requestedRoleAr,
      jobTitle: `أخصائي لجان (${req.requestedRoleAr})`,
      phone: req.phone,
      email: req.email,
      photo: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      committees: [],
      active: true,
      joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    };

    // Append employee
    setEmployees([newEmp, ...employees]);
    // Delete from join requests
    setJoinRequests(prev => prev.filter(x => x.id !== req.id));

    addSystemLog(
      "اعتماد طلب انضمام", 
      `تمت الموافقة على طلب انضمام الموظف ${req.name} بالبريد ${req.email} وتعيينه برقم وظيفي ${nextIdStr}`
    );

    alert(`تم بنجاح اعتماد الموظف ${req.name} بالرقم الوظيفي الجديد: ${nextIdStr}`);
  };

  // Decline high priority join request
  const handleDeclineJoinRequest = (id: number, name: string) => {
    setJoinRequests(prev => prev.filter(x => x.id !== id));
    addSystemLog("رفض طلب انضمام", `تم رفض طلب تسجيل الموظف ${name} لمجلس اللجان`, "مرفوضة");
  };

  // Enforce unique role restriction
  // Only one Management Director (MANAG_DIR) and only one Department Head (DEPT_HEAD) can exist
  const checkRoleUniqueAndEnforce = (role: Employee["role"], currentEditingId: string | null) => {
    if (role !== "MANAG_DIR" && role !== "DEPT_HEAD") {
      setRoleInfoMessage("");
      return;
    }

    const existingConflict = employees.find(e => e.role === role && e.id !== currentEditingId);
    if (existingConflict) {
      if (role === "MANAG_DIR") {
        setRoleInfoMessage(`تنبيه: سيؤدي اختيار مدير الإدارة إلى سحب المنصب وإحالته من الموظف الحالي (${existingConflict.name}) وتحويله أخصائياً تلقائياً لتوافقاً مع الهيكل الحصري.`);
      } else {
        setRoleInfoMessage(`تنبيه: سيؤدي اختيار رئيس القسم إلى سحب المنصب من الموظف الحالي (${existingConflict.name}) وتحويله أخصائياً تلقائياً حسب التسلسل المعتمد.`);
      }
    } else {
      setRoleInfoMessage("");
    }
  };

  const handleRoleChange = (role: Employee["role"]) => {
    setEmpRole(role);
    checkRoleUniqueAndEnforce(role, editingEmpId);
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingEmpId(null);
    setEmpId("");
    setEmpName("");
    setEmpRole("SPECIALIST");
    setEmpJobTitle("");
    setEmpPhone("");
    setEmpExtension("");
    setEmpEmail("");
    setEmpPhoto(PRESET_AVATARS[0]);
    setEmpCommittees([]);
    setEmpActive(true);
    setFormError("");
    setRoleInfoMessage("");
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setEmpId(emp.id);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpJobTitle(emp.jobTitle);
    setEmpPhone(emp.phone);
    setEmpExtension(emp.extension || "");
    setEmpEmail(emp.email);
    setEmpPhoto(emp.photo);
    setEmpCommittees(emp.committees || []);
    setEmpActive(emp.active);
    setFormError("");
    setRoleInfoMessage("");
    // Check if conflict
    if (emp.role === "MANAG_DIR" || emp.role === "DEPT_HEAD") {
      checkRoleUniqueAndEnforce(emp.role, emp.id);
    }
    setIsFormOpen(true);
    setActiveGearMenuId(null);
  };

  // Delete employee
  const handleDeleteEmployee = (emp: Employee) => {
    setDeletingEmployee(emp);
    setActiveGearMenuId(null);
  };

  // Toggle active/inactive status
  const handleToggleActiveStatus = (emp: Employee) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === emp.id) {
        const nextState = !e.active;
        addSystemLog(
          "تعديل حالة موظف", 
          `تم تغيير حالة الموظف ${e.name} إلى: ${nextState ? "نشط" : "غير نشط"}`
        );
        return { ...e, active: nextState };
      }
      return e;
    }));
    setActiveGearMenuId(null);
  };

  // Toggle committee assignment
  const handleToggleCommittee = (commName: string) => {
    if (empCommittees.includes(commName)) {
      setEmpCommittees(prev => prev.filter(c => c !== commName));
    } else {
      setEmpCommittees(prev => [...prev, commName]);
    }
  };

  // Handle submit of employee add/edit
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!empId.trim()) {
      setFormError("يرجى إدخال الرقم الوظيفي بدقة");
      return;
    }
    if (!empName.trim()) {
      setFormError("يرجى كتابة الاسم الثلاثي بالكامل");
      return;
    }
    if (!empJobTitle.trim()) {
      setFormError("يرجى كتابة المسمى الوظيفي المعتمد");
      return;
    }
    if (!empEmail.trim()) {
      setFormError("يرجى تعبئة البريد الإلكتروني الرسمي");
      return;
    }

    // Role checking and enforcement logic:
    // If we are setting DEPT_HEAD or MANAG_DIR, downgrade others with same role to SPECIALIST
    let updatedEmployees = [...employees];
    if (empRole === "MANAG_DIR" || empRole === "DEPT_HEAD") {
      updatedEmployees = updatedEmployees.map(emp => {
        // Find existing with same role, other than the one currently edited
        if (emp.role === empRole && emp.id !== editingEmpId) {
          // Downgrade previous
          return {
            ...emp,
            role: "SPECIALIST" as const,
            roleAr: "أخصائي اللجان",
            jobTitle: emp.jobTitle.replace("مدير عام ", "أخصائي ").replace("رئيس قسم ", "أخصائي ")
          };
        }
        return emp;
      });
    }

    const mappingRolesAr = {
      SYS_ADMIN: "أخصائي لجان / مدير نظام",
      DEPT_HEAD: "رئيس قسم اللجان",
      MANAG_DIR: "مدير إدارة اللجان",
      SPECIALIST: "أخصائي اللجان"
    };

    if (editingEmpId) {
      // Edit
      setEmployees(updatedEmployees.map(emp => {
        if (emp.id === editingEmpId) {
          return {
            ...emp,
            id: empId.trim(),
            name: empName.trim(),
            role: empRole,
            roleAr: mappingRolesAr[empRole],
            jobTitle: empJobTitle.trim(),
            phone: empPhone.trim(),
            extension: empExtension.trim(),
            email: empEmail.trim(),
            photo: empPhoto,
            committees: empCommittees,
            active: empActive
          };
        }
        return emp;
      }));
      addSystemLog("تعديل ملف موظف", `تم تعديل بيانات الموظف ${empName.trim()}، تخصيص لجان: ${empCommittees.join(", ")}`);
    } else {
      // Add
      // Check ID unique
      if (employees.some(emp => emp.id === empId.trim())) {
        setFormError("هذا الرقم الوظيفي مسجل لموظف آخر بالفعل");
        return;
      }

      const newEmp: Employee = {
        id: empId.trim(),
        name: empName.trim(),
        role: empRole,
        roleAr: mappingRolesAr[empRole],
        jobTitle: empJobTitle.trim(),
        phone: empPhone.trim(),
        extension: empExtension.trim(),
        email: empEmail.trim(),
        photo: empPhoto,
        committees: empCommittees,
        active: empActive,
        joinDate: new Date().toISOString().split('T')[0].replace(/-/g, '/')
      };

      setEmployees([newEmp, ...updatedEmployees]);
      addSystemLog("إضافة موظف جديد", `تم إدراج الموظف ${newEmp.name} برقم وظيفي ${newEmp.id} وتعيين المهام له`);
    }

    setIsFormOpen(false);
    setFormError("");
    setRoleInfoMessage("");
  };

  // Filtered and sorted lists
  const filteredEmployees = employees
    .filter(e => {
      const term = (employeeFilterQuery || searchQuery).trim().toLowerCase();
      if (!term) return true;
      return (
        e.name.toLowerCase().includes(term) ||
        e.id.toLowerCase().includes(term) ||
        e.jobTitle.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        (e.committees || []).some(c => c.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      const getRolePriority = (role: string) => {
        if (role === "MANAG_DIR") return 1;
        if (role === "DEPT_HEAD") return 2;
        if (role === "SPECIALIST") return 3;
        if (role === "SYS_ADMIN") return 3; // Both are specialist roles
        return 4;
      };
      const pA = getRolePriority(a.role);
      const pB = getRolePriority(b.role);
      if (pA !== pB) {
        return pA - pB;
      }
      return a.name.localeCompare(b.name, "ar");
    });

  const filteredLogs = systemLogs.filter(log => {
    const term = (logFilterQuery || logSearchQuery).trim().toLowerCase();
    if (!term) return true;
    return (
      log.employeeName.toLowerCase().includes(term) ||
      log.operationType.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.status.toLowerCase().includes(term)
    );
  });

  // Action: update active profile settings
  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    
    // update in employees list matching logged in user or admin
    setEmployees(prev => prev.map(emp => {
      if (emp.email === "khalafshehab@gmail.com" || emp.name?.includes("باسم") || emp.email === profileEmail) {
        return {
          ...emp,
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          jobTitle: profileJob,
          photo: profilePhoto
        };
      }
      return emp;
    }));

    addSystemLog("تحديث حساب شخصي", `تحديث الملف الشخصي ومعلومات الأمان بنجاح للأخصائي ${profileName}`);
    
    setProfileSuccessMsg("تم تحديث معلومات الحساب والتفضيلات بنجاح!");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  // Export to Google Sheets as a formatted CSV with UTF-8 BOM
  const exportOrgChartToGoogleSheets = () => {
    // Columns specifically representing: Employee ID, Full Name, System Role, Job Title, Mobile Number, Official Email, Connected Committees, Connection Status
    const csvHeaders = [
      "الرقم الوظيفي",
      "الاسم الكامل",
      "الدور في النظام",
      "المسمى الوظيفي",
      "رقم الجوال",
      "البريد الإلكتروني",
      "اللجان المرتبطة",
      "الحالة"
    ];

    const csvRows = employees.map(emp => [
      emp.id,
      emp.name,
      emp.roleAr,
      emp.jobTitle,
      emp.phone,
      emp.email,
      (emp.committees || []).join(" - ") || "لا يوجد",
      emp.active ? "متصل حالياً" : "غير نشط"
    ]);

    // UTF-8 BOM signature to render Arabic correctly when imported/uploaded to Google Sheets
    let csvContent = "\ufeff";
    csvContent += [csvHeaders.join(","), ...csvRows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `الهيكل_الإداري_وغرفة_مكة_جوجل_شيت_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addSystemLog("تصدير جداول البيانات", `تصدير الهيكل الوظيفي بالكامل لجداول Google Sheets بنجاح (${employees.length} موظف).`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Main Header - Glassmorphic Royal Slate & Blue accents */}
      <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="text-right">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users2 className="w-8 h-8 text-[#246fff]" />
            <span>الهيكل الإداري وصلاحيات النظام</span>
          </h2>
          <p className="text-gray-600 text-sm font-medium mt-1">
            إدارة صلاحيات الكوادر الإدارية، أرشفة اللجان للأخصائيين، ومراقبة حركة النظام الأمنية.
          </p>
        </div>

        {/* System Active Profile Quick Badge */}
        <div className="bg-white/80 border border-gray-150 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
          <img 
            src={profilePhoto} 
            alt="User" 
            className="w-10 h-10 rounded-full border border-gray-100 object-cover" 
          />
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-[#246fff]/10 text-[#246fff] font-black px-1.5 py-0.5 rounded shadow-sm">حسابي المعتمد</span>
              <span className="font-extrabold text-xs text-gray-900">{profileName}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold">{profileJob}</p>
          </div>
        </div>
      </div>

      {/* 2. Top Portal Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-250 pb-1 select-none">
        {[
          { id: "hierarchy", label: "الهيكل الوظيفي والموظفين", icon: <Users className="w-4 h-4" /> },
          { id: "approvals", label: "اعتماد الموظفين والبريد المعتمد", icon: <UserCheck className="w-4 h-4" /> },
          { id: "logs_audit", label: "سجل مراقبة النظام والعمليات", icon: <Activity className="w-4 h-4" /> },
          { id: "account_profile", label: "إعدادات الحساب الشخصي", icon: <Settings className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#246fff] text-white shadow-md shadow-blue-500/10"
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Render dynamically based on Active Tab */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: Hierarchy / Staff Cards List */}
        {activeTab === "hierarchy" && (
          <motion.div
            key="hierarchy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Quick Metrics Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {[
                { 
                  label: "إجمالي طاقم العمل", 
                  val: employees.length, 
                  color: "border-r-4 border-blue-600 bg-white" 
                },
                { 
                  label: "مدير إدارة (حصري)", 
                  val: employees.filter(e => e.role === "MANAG_DIR").length, 
                  color: "border-r-4 border-amber-500 bg-white" 
                },
                { 
                  label: "رئيس قسم lجان (حصري)", 
                  val: employees.filter(e => e.role === "DEPT_HEAD").length, 
                  color: "border-r-4 border-purple-500 bg-white" 
                },
                { 
                  label: "أخصائيين اللجان", 
                  val: employees.filter(e => e.role === "SPECIALIST").length, 
                  color: "border-r-4 border-emerald-500 bg-white" 
                },
                { 
                  label: "متصل حالياً بالنظام", 
                  val: employees.filter(e => e.active).length, // simulated online
                  color: "border-r-4 border-teal-500 bg-white" 
                },
              ].map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between ${m.color}`}>
                  <span className="text-[10px] font-black text-gray-400 block tracking-wide">{m.label}</span>
                  <span className="text-2xl font-black text-gray-900 font-mono leading-none mt-2">{m.val}</span>
                </div>
              ))}
            </div>

            {/* Controls Row: Search + View mode toggler + Add Button */}
            <div className="bg-[#e8e4e4] rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Toggleable Search with Input */}
              <div className="flex items-center gap-2 relative">
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 170, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        setEmployeeFilterQuery(searchQuery);
                        setIsSearchExpanded(false);
                      }}
                      className="relative overflow-hidden"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (e.target.value === "") {
                            setEmployeeFilterQuery("");
                          }
                        }}
                        placeholder="ابحث عن موظف..."
                        autoFocus
                        className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold placeholder-gray-400 text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setEmployeeFilterQuery("");
                            setIsSearchExpanded(false);
                          }}
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
                      setEmployeeFilterQuery(searchQuery);
                      setIsSearchExpanded(false);
                    } else {
                      setIsSearchExpanded(true);
                    }
                  }}
                  className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                    isSearchExpanded || employeeFilterQuery || searchQuery
                      ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm animate-pulse-subtle"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                  title="البحث عن منسوبي الهيكل"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* View Toggler */}
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 select-none shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                      viewMode === "cards" ? "bg-[#246fff] text-white shadow-sm font-black" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>بطائق موظفين</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                      viewMode === "table" ? "bg-[#246fff] text-white shadow-sm font-black" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>سجل الهيكل</span>
                  </button>
                </div>

                {/* Print/Export Button */}
                <button
                  type="button"
                  onClick={exportOrgChartToGoogleSheets}
                  className="h-10 px-3 bg-[#e8f5e9] border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  title="تصدير الهيكل الإداري الحالي لجداول Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>تصدير الهيكل لجداول Google Sheets</span>
                </button>

                {/* Add Employee Button */}
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>إضافة موظف</span>
                </button>
              </div>
            </div>

            {/* Display: Cards or Table */}
            {filteredEmployees.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                <Users2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="font-extrabold text-gray-700 text-base">لم يعثر على موظفين في الفرز الحالي</p>
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="text-blue-650 font-black text-xs hover:underline mt-1"
                >
                  عرض كافة الموظفين
                </button>
              </div>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredEmployees.map((emp) => {
                    const isSelf = emp.role === "SYS_ADMIN";
                    const isAllowedToDelete = emp.role !== "SYS_ADMIN";
                    const numComms = (emp.committees || []).length;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={emp.id}
                        className={`bg-[#e8e4e4] rounded-2xl p-5 border border-gray-250 shadow-sm relative col-span-1 hover:border-gray-350 transition-all flex flex-col justify-between ${
                          !emp.active ? "opacity-60 grayscale-[25%]" : ""
                        }`}
                      >
                        {/* Status Role Badge */}
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                          {/* Active / Inactive Badge */}
                          <span className={`w-2.5 h-2.5 rounded-full inline-block ${emp.active ? "bg-green-500" : "bg-red-400"}`} title={emp.active ? "نشط" : "غير نشط"} />
                          
                          {/* Gear Actions Button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveGearMenuId(activeGearMenuId === emp.id ? null : emp.id)}
                              className="p-1 px-1.5 bg-white/95 text-gray-600 hover:text-gray-950 rounded border border-gray-200 shadow-sm cursor-pointer"
                              title="خيارات التحكم بالموظف"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                            {activeGearMenuId === emp.id && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setActiveGearMenuId(null)} />
                                <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-150 rounded-xl shadow-xl py-1 z-30 text-right">
                                  <button
                                    onClick={() => handleOpenEdit(emp)}
                                    className="w-full px-3 py-1.5 text-[11px] font-black text-gray-700 hover:bg-blue-50 hover:text-blue-650 flex items-center justify-end gap-2"
                                  >
                                    <span>تعديل الملف</span>
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleActiveStatus(emp)}
                                    className="w-full px-3 py-1.5 text-[11px] font-black text-gray-700 hover:bg-gray-100 flex items-center justify-end gap-2"
                                  >
                                    <span>{emp.active ? "إحالة لغير نشط" : "تنشيط الموظف"}</span>
                                    <Activity className="w-3 h-3 text-purple-600" />
                                  </button>
                                  {isAllowedToDelete && (
                                    <button
                                      onClick={() => handleDeleteEmployee(emp)}
                                      className="w-full px-3 py-1.5 text-[11px] font-black text-red-650 hover:bg-red-50 flex items-center justify-end gap-2 border-t border-gray-50"
                                    >
                                      <span>حذف كلي</span>
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Top: Card Profile Zone */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={emp.photo} 
                                alt={emp.name} 
                                className="w-14 h-14 rounded-full object-cover border border-[#246fff]/20 shadow-sm"
                              />
                              {isSelf && (
                                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">أنا</span>
                              )}
                            </div>
                            <div className="text-right flex-1 min-w-0">
                              <h4 className="font-extrabold text-sm text-gray-900 truncate flex items-center gap-1.5">
                                {emp.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 font-bold truncate leading-relaxed">{emp.jobTitle}</p>
                              
                              {/* Role custom badge */}
                              <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 ${
                                emp.role === "SYS_ADMIN" ? "bg-red-50 text-red-700 border border-red-200" :
                                emp.role === "MANAG_DIR" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                emp.role === "DEPT_HEAD" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                                "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}>
                                {emp.roleAr}
                              </span>
                            </div>
                          </div>

                          <hr className="border-gray-250/60" />

                          {/* Middle Contacts & Details */}
                          <div className="space-y-1.5 text-xs text-gray-600 block">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400 font-semibold">الرقم الوظيفي:</span>
                              <span className="font-mono font-black text-gray-800 bg-white/60 px-1 py-0.5 rounded">{emp.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400 font-semibold">رقم الجوال:</span>
                              <a href={`tel:${emp.phone}`} className="font-mono font-bold text-gray-800 hover:underline">{emp.phone}</a>
                            </div>
                            {emp.extension && (
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-gray-400 font-semibold">رقم التحويلة:</span>
                                <span className="font-mono font-bold text-gray-800">{emp.extension}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-400 font-semibold">البريد الإلكتروني:</span>
                              <a href={`mailto:${emp.email}`} className="font-mono font-bold text-gray-800 text-[10px] hover:underline truncate max-w-[150px]">{emp.email}</a>
                            </div>
                          </div>

                          <hr className="border-gray-250/60" />

                          {/* Committee Assignment Zone */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-400 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-[#246fff]" />
                                <span>اللجان المخصصة للأرشفة:</span>
                              </span>
                              <span className="text-[10px] bg-white/80 font-black text-[#246fff] px-1.5 py-0.5 rounded border border-gray-200 font-mono">
                                {numComms}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-0.5 pb-1 select-none">
                              {numComms === 0 ? (
                                <p className="text-[10px] text-gray-450 italic font-bold">لم تُسنَد له لجان بعد.</p>
                              ) : (
                                (emp.committees || []).map((c, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-[9px] bg-white text-gray-700 font-bold px-1.5 py-0.5 rounded border border-gray-150 shadow-inner block"
                                  >
                                    {c}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Profile Details Modal button fallback */}
                        <div className="pt-2 border-t border-gray-250 mt-4 flex items-center justify-between">
                          <span className="text-[9.5px] text-gray-400 font-black">تاريخ التعيين: {emp.joinDate}</span>
                          <button
                            type="button"
                            onClick={() => setDetailsEmployee(emp)}
                            className="text-[11px] font-black text-[#246fff] hover:underline bg-transparent"
                          >
                            الملف التفصيلي ←
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* TAB 1 TABLE REGISTER LAYOUT: سجل الكادر الوظيفي كامل */
              <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-xs font-semibold text-gray-700 select-none border-collapse text-right">
                    <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900">
                      <tr>
                        <th className="px-4 py-3.5 font-black text-right text-gray-800 tracking-tight text-xs">رقم وظيفي</th>
                        <th className="px-4 py-3.5 font-black text-right text-gray-800 tracking-tight text-xs">الاسم</th>
                        <th className="px-4 py-3.5 font-black text-right text-gray-800 tracking-tight text-xs">الدور الوظيفي والصلاحيات</th>
                        <th className="px-4 py-3.5 font-black text-right text-gray-800 tracking-tight text-xs">المسمى الوظيفي المعتمد</th>
                        <th className="px-4 py-3.5 font-black text-right text-gray-800 tracking-tight text-xs">البريد الإلكتروني</th>
                        <th className="px-4 py-3.5 font-black text-right text-gray-800 tracking-tight text-xs">رقم الجوال</th>
                        <th className="px-4 py-3.5 font-black text-center text-gray-850 tracking-tight text-xs w-28">إحصائيات اللجان</th>
                        <th className="px-4 py-3.5 font-black text-center text-gray-850 tracking-tight text-xs w-24">الحالة</th>
                        <th className="px-4 py-3.5 font-black text-center text-gray-850 tracking-tight text-xs w-20">خيارات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/80">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-[#e2dede] transition-colors text-[11px] font-bold text-gray-700">
                          <td className="px-4 py-3 font-mono font-black text-gray-850">{emp.id}</td>
                          <td className="px-4 py-3 white-nowrap">
                            <div className="flex items-center gap-2">
                              <img src={emp.photo} alt="" className="w-7 h-7 rounded-full object-cover border" />
                              <span className="font-extrabold text-gray-900">{emp.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              emp.role === "SYS_ADMIN" ? "bg-red-50 text-red-700" :
                              emp.role === "MANAG_DIR" ? "bg-amber-50 text-amber-700" :
                              emp.role === "DEPT_HEAD" ? "bg-purple-50 text-purple-700" :
                              "bg-blue-50 text-blue-700"
                            }`}>
                              {emp.roleAr}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-sans">{emp.jobTitle}</td>
                          <td className="px-4 py-3 font-mono text-gray-800">{emp.email}</td>
                          <td className="px-4 py-3 font-mono text-gray-800">{emp.phone} {emp.extension ? `(تحويلة: ${emp.extension})` : ""}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-white/80 border border-gray-200 shadow-inner px-2 py-0.5 rounded text-gray-800 text-[10px]" title={(emp.committees || []).join(", ")}>
                              {(emp.committees || []).length} لجنة قطاعية
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${emp.active ? "bg-green-500" : "bg-red-500"}`} />
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap relative">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleOpenEdit(emp)}
                                className="p-1 text-blue-700 hover:bg-white rounded"
                                title="تعديل هذا الموظف"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleToggleActiveStatus(emp)}
                                className="p-1 text-purple-700 hover:bg-white rounded"
                                title="تغيير حالة النشاط"
                              >
                                <Activity className="w-3.5 h-3.5" />
                              </button>
                              {emp.role !== "SYS_ADMIN" && (
                                <button 
                                  onClick={() => handleDeleteEmployee(emp)}
                                  className="p-1 text-red-600 hover:bg-white rounded"
                                  title="حذف كلي"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
          </motion.div>
        )}

        {/* TAB 2: approvals & pre-approved emails approvals system */}
        {activeTab === "approvals" && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* COLUMN 1: Pending Join Requests Approval Area */}
            <div className="bg-[#e8e4e4] rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="border-b border-gray-350 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">اعتمادات الموظفين الجدد</h3>
                  <p className="text-[11px] text-gray-500 font-bold">طلبات التسجيل المعلقة والواردة من البوابة الإجرائية للغرفة بمكة</p>
                </div>
                <span className="text-xs bg-red-150 text-red-700 px-2 py-0.5 rounded-full font-black">
                  {joinRequests.length} طلب معلق
                </span>
              </div>

              {joinRequests.length === 0 ? (
                <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-150">
                  <UserCheck className="w-10 h-10 text-emerald-600 mx-auto opacity-50 mb-1" />
                  <p className="font-extrabold text-sm text-gray-700">لا توجد طلبات انضمام واردة أو معلقة حالياً.</p>
                  <p className="text-[10px] text-gray-400 font-semibold">بوابة تسجيل الموظفين كاملة الاستقرار والاعتماد.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto">
                  {joinRequests.map((req) => {
                    const matchedApp = approvedEmails.find(a => a.email.toLowerCase() === req.email.toLowerCase());
                    const isPreApproved = !!matchedApp;

                    return (
                      <div key={req.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative">
                        <div className="text-right space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-gray-900">{req.name}</h4>
                            <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-black">
                              رزمة: {req.requestedRoleAr}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-[11px] text-gray-600 font-bold block">
                            <p className="flex items-center gap-1.5 justify-start">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-mono text-gray-800">{req.email}</span>
                            </p>
                            <p className="flex items-center gap-1.5 justify-start">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-mono text-gray-800">{req.phone}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1.5">
                            {isPreApproved ? (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>بريد معتمد مسبقاً: {matchedApp.name}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>غير مدرج بقائمة البريد المعتمد مسبقاً</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Approved vs Decline Buttons */}
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleAcceptJoinRequest(req)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shadow-emerald-500/10 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>موافقة واعتماد</span>
                          </button>
                          <button
                            onClick={() => handleDeclineJoinRequest(req.id, req.name)}
                            className="bg-white border border-gray-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 text-gray-600 text-xs font-black px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            <span>رفض</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2: Pre-Approved Emails List System */}
            <div className="bg-[#e8e4e4] rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <div className="border-b border-gray-350 pb-3">
                <h3 className="text-base font-extrabold text-gray-900">قائمة البريد المعتمد للتسجيل</h3>
                <p className="text-[11px] text-gray-500 font-bold">إضافة وتفويض العناوين البريدية والصفات الوظيفية مسبقاً للأخصائيين لمنع اختراقات الدخول</p>
              </div>

              {/* Add Pre-approved Form */}
              <form onSubmit={handleAddApprovedEmail} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
                <p className="text-[11px] font-black text-[#246fff] text-right">إضافة بريد رسمي معتمد مسبقاً:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-extrabold block text-right">البريد الإلكتروني الرسمي:</label>
                    <input
                      type="email"
                      required
                      placeholder="example@makkahchamber.sa"
                      value={newApprovedEmail}
                      onChange={(e) => setNewApprovedEmail(e.target.value)}
                      className="w-full h-9 px-3 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono font-bold text-right outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-extrabold block text-right">اسم الموظف الثلاثي:</label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم بالكامل"
                      value={newApprovedName}
                      onChange={(e) => setNewApprovedName(e.target.value)}
                      className="w-full h-9 px-3 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-right outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="space-y-1 w-full sm:w-1/2">
                    <label className="text-[10px] text-gray-500 font-extrabold block text-right">الدور المقترح للصلاحية:</label>
                    <select
                      value={newApprovedRole}
                      onChange={(e) => setNewApprovedRole(e.target.value)}
                      className="w-full h-9 px-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-right outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="أخصائي لجان قطاعية">أخصائي لجان قطاعية</option>
                      <option value="أخصائي لجان مشتركة">أخصائي لجان مشتركة</option>
                      <option value="رئيس قسم لجان قطاعية">رئيس قسم لجان قطاعية</option>
                      <option value="عضو مساعد">عضو لجان مساعد</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1.5 self-end cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                    <span>تخويل البريد</span>
                  </button>
                </div>
              </form>

              {/* Pre-approved list table */}
              <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm">
                <div className="overflow-x-auto text-right">
                  <table className="w-full text-[10.5px] font-bold text-gray-700 select-none border-collapse text-right">
                    <thead className="bg-[#f8fafc] border-b border-gray-200 text-gray-500 text-[10px] font-black">
                      <tr>
                        <th className="px-3.5 py-2.5 text-right">البريد المعتمد</th>
                        <th className="px-3.5 py-2.5 text-right">الاسم المفوض</th>
                        <th className="px-3.5 py-2.5 text-right">الصفة المسبقة</th>
                        <th className="px-3.5 py-2.5 text-center">أمر إلغاء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {approvedEmails.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="px-3.5 py-2 font-mono text-gray-800 text-[10px]">{app.email}</td>
                          <td className="px-3.5 py-2 text-gray-900">{app.name}</td>
                          <td className="px-3.5 py-2">
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-black">
                              {app.roleAr}
                            </span>
                          </td>
                          <td className="px-3.5 py-2 text-center text-red-650">
                            <button
                              type="button"
                              onClick={() => handleDeleteApprovedEmail(app.id, app.email)}
                              className="p-1 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer"
                              title="إلغاء تخويل البريد"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: System logs security activities monitor log */}
        {activeTab === "logs_audit" && (
          <motion.div
            key="logs_audit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Header of Logs with search */}
            <div className="bg-[#e8e4e4] rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-700" />
                  <span>لوحة مراقبة أمن وحركة النظام (Audit Trails)</span>
                </h3>
                <p className="text-[11px] text-gray-500 font-bold">تسجيل فوري ودقيق لكامل حركات الكادر: الدخول، التعديل، والحذف للأمان الشامل</p>
              </div>

              {/* Toggleable Search with Input for Logs */}
              <div className="flex items-center gap-2 relative">
                <AnimatePresence>
                  {isLogSearchExpanded && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 170, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        setLogFilterQuery(logSearchQuery);
                        setIsLogSearchExpanded(false);
                      }}
                      className="relative overflow-hidden"
                    >
                      <input
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => {
                          setLogSearchQuery(e.target.value);
                          if (e.target.value === "") {
                            setLogFilterQuery("");
                          }
                        }}
                        placeholder="ابحث بالعمليات..."
                        autoFocus
                        className="w-full h-10 pr-3 pl-8 bg-white border border-gray-300 rounded-xl text-xs font-bold placeholder-gray-400 text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                      />
                      {logSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogSearchQuery("");
                            setLogFilterQuery("");
                            setIsLogSearchExpanded(false);
                          }}
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
                    if (isLogSearchExpanded) {
                      setLogFilterQuery(logSearchQuery);
                      setIsLogSearchExpanded(false);
                    } else {
                      setIsLogSearchExpanded(true);
                    }
                  }}
                  className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                    isLogSearchExpanded || logFilterQuery || logSearchQuery
                      ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm animate-pulse-subtle"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                  title="البحث في سجل العمليات"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Logs Audit Trail Table */}
            <div className="bg-[#e8e4e4] rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-right">
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-xs font-semibold text-gray-750 select-none border-collapse text-right">
                  <thead className="bg-[#dfdada] border-b border-gray-300 text-gray-900 text-[11px] font-black">
                    <tr>
                      <th className="px-4 py-3 text-right">الموظف / الفاعل</th>
                      <th className="px-4 py-3 text-right">التوقيت الدقيق</th>
                      <th className="px-4 py-3 text-right">نوع العملية</th>
                      <th className="px-4 py-3 text-right">تفاصيل الحركة الإجرائية</th>
                      <th className="px-4 py-3 text-center w-24">الحالة الأمنية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-[#e8e4e4]/80 text-[11px] font-bold">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#e2dede] transition-colors text-right">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-extrabold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                          {log.employeeName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-600">{log.time}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#246fff]">{log.operationType}</td>
                        <td className="px-4 py-3 text-gray-800 leading-relaxed font-sans">{log.details}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border ${
                            log.status === "ناجحة"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-red-50 text-red-800 border-red-200"
                          }`}>
                            {log.status === "ناجحة" ? "عملية ناجحة" : "محاولة مرفوضة"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: Account settings profile */}
        {activeTab === "account_profile" && (
          <motion.div
            key="account_profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-[#e8e4e4] rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="border-b border-gray-350 pb-3">
                <h3 className="text-base font-extrabold text-gray-900">إعدادات ملف الموظف وبوابة الأمان</h3>
                <p className="text-[11px] text-gray-500 font-bold">تحديث تفاصيل ملفك الشخصي كمدير نظام وموظف نشط، مع إمكانية تعديل كلمة المرور والتنبيهات</p>
              </div>

              {profileSuccessMsg && (
                <div className="bg-emerald-100/90 text-emerald-800 border border-emerald-250 p-4 rounded-xl text-xs font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-right">
                {/* Profile Photo zone */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/70 p-4 rounded-xl border border-gray-200/60">
                  <img 
                    src={profilePhoto} 
                    alt="Active profile" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#246fff]/30 shadow"
                  />
                  <div className="text-right space-y-2 flex-1 w-full">
                    <p className="text-xs font-black text-gray-800">صورة الحساب الشخصي</p>
                    <p className="text-[10px] text-gray-400 font-bold leading-normal">اختر صورة مخصصة لتمثيل هويتك المهنية على بطاقات الهيكل والفعاليات في الغرفة.</p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {PRESET_AVATARS.map((av, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setProfilePhoto(av)}
                            className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                              profilePhoto === av ? "ring-2 ring-blue-600 border-white scale-110" : "border-gray-200 hover:scale-105"
                            }`}
                          >
                            <img src={av} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <div className="w-px h-6 bg-gray-300 mx-2" />
                      <input
                        type="file"
                        id="profile-photo-file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64Str = reader.result as string;
                              const img = new Image();
                              img.src = base64Str;
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const max_size = 120;
                                let width = img.width;
                                let height = img.height;
                                if (width > height) {
                                  if (width > max_size) {
                                    height *= max_size / width;
                                    width = max_size;
                                  }
                                } else {
                                  if (height > max_size) {
                                    width *= max_size / height;
                                    height = max_size;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const compressed = canvas.toDataURL("image/jpeg", 0.7);
                                  setProfilePhoto(compressed);
                                } else {
                                  setProfilePhoto(base64Str);
                                }
                              };
                              img.onerror = () => setProfilePhoto(base64Str);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-photo-file"
                        className="h-8 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3 h-3" />
                        <span>اختر من جهازك</span>
                      </label>
                      {profilePhoto && !PRESET_AVATARS.includes(profilePhoto) && (
                        <button
                          type="button"
                          onClick={() => setProfilePhoto(PRESET_AVATARS[0])}
                          className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-500 font-extrabold block">الاسم بالكامل:</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-right outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-500 font-extrabold block">المسمى الوظيفي المعتمد:</label>
                    <input
                      type="text"
                      required
                      value={profileJob}
                      onChange={(e) => setProfileJob(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-right outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-500 font-extrabold block">البريد الإلكتروني الرسمي:</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-right outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-500 font-extrabold block">رقم الجوال:</label>
                    <input
                      type="text"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-right outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-500 font-extrabold block">تعديل كلمة المرور (أمان):</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full h-10 pl-10 pr-3 bg-white border border-gray-300 rounded-xl text-xs font-mono text-left outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-250/60 my-4" />

                {/* Notifications setup */}
                <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-gray-200/40">
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900">بوابة الإشعارات والإنذار العاجل</p>
                    <p className="text-[10px] text-gray-500 font-bold leading-normal">تلقي تنبيهات بريدية عاجلة للمحاضر والاجندات عند اقتراب حصر الموعد.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileNotif(!profileNotif)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${
                      profileNotif ? "bg-emerald-600 flex justify-end" : "bg-gray-300 flex justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    حفظ التغييرات وتحديث الهيكل
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 4. DIALOG / MODAL FOR ADDING AND EDITING STAFF */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Dark glass backdrop with fade overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body Card with Zoom bounce */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 relative overflow-hidden z-10 text-right max-h-[90vh] flex flex-col font-sans"
            >
              {/* Header block with solid header representation - identical to Committees page style */}
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    {editingEmpId ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {editingEmpId ? `تعديل ملف الموظف بالهيكل` : "إدراج موظف ومسؤول أرشفة جديد"}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">يرجى التأكد من تسجيل البيانات بعناية لربطها بالنظام</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-[11px] font-bold text-right flex items-center gap-2">
                  <span className="w-2 h-2 shrink-0 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="flex-1">{formError}</span>
                </div>
              )}

              {/* Form Content - Scrollable area */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-right scrollbar-thin">
                
                {/* Image Upload Zone */}
                <div className="bg-[#fcfaf2]/50 border-2 border-dashed border-amber-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative">
                    {empPhoto ? (
                      <img 
                        src={empPhoto} 
                        alt="صورة الموظف" 
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-amber-500/10"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center text-gray-400">
                        <User className="w-10 h-10 text-amber-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-gray-800">تحميل صورة الحساب من جهاز الكمبيوتر</p>
                    <p className="text-[10px] text-gray-500 font-bold">بإمكانك إرفاق ملف صورة PNG, JPG أو JPEG (الحد الأقصى: 3MB)</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="emp-photo-file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target && event.target.result) {
                              const base64Str = event.target.result as string;
                              // Compress using HTML Canvas
                              const img = new Image();
                              img.src = base64Str;
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const max_size = 120; // 120px is perfect for avatar
                                let width = img.width;
                                let height = img.height;
                                if (width > height) {
                                  if (width > max_size) {
                                    height *= max_size / width;
                                    width = max_size;
                                  }
                                } else {
                                  if (height > max_size) {
                                    width *= max_size / height;
                                    height = max_size;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  ctx.drawImage(img, 0, 0, width, height);
                                  const compressed = canvas.toDataURL("image/jpeg", 0.7); // highly efficient compression
                                  setEmpPhoto(compressed);
                                } else {
                                  setEmpPhoto(base64Str);
                                }
                              };
                              img.onerror = () => {
                                setEmpPhoto(base64Str);
                              };
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="emp-photo-file"
                      className="h-9 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[11px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>اختر الملف من جهاز الحاسوب</span>
                    </label>

                    {empPhoto && (
                      <button
                        type="button"
                        onClick={() => setEmpPhoto("")}
                        className="h-9 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>إزالة الصورة</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Employee ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الرقم الوظيفي (ID): <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="امثلة: 1009، 1010"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      disabled={!!editingEmpId}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Employee Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الاسم الثلاثي بالكامل: <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم بالكامل باللغة العربية"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Org hierarchical roles */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">الصفة والدور بالهيكل: <span className="text-red-500">*</span></label>
                    <select
                      value={empRole}
                      onChange={(e) => handleRoleChange(e.target.value as any)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-black text-right focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="SPECIALIST">أخصائي اللجان (مكلف بالفعاليات والمحاضر)</option>
                      <option value="DEPT_HEAD">رئيس قسم اللجان (حصري - شخص واحد)</option>
                      <option value="MANAG_DIR">مدير إدارة اللجان (حصري - شخص واحد)</option>
                    </select>
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">المسمى الوظيفي المعتمد: <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="امثلة: أخصائي لجان قطاعية، مدير عام"
                      value={empJobTitle}
                      onChange={(e) => setEmpJobTitle(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Mail */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">البريد الإلكتروني الرسمي: <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="name@makkahchamber.sa"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">رقم الجوال: <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="+9665xxxxxxxx"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Extension */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-700">رقم التحويلة (Extension):</label>
                    <input
                      type="text"
                      placeholder="مثال: 124 أو 550"
                      value={empExtension}
                      onChange={(e) => setEmpExtension(e.target.value)}
                      className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-xs font-mono font-bold text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                </div>

                {/* Conflicting Role notice warning if necessary */}
                {roleInfoMessage && (
                  <div className="bg-amber-50 text-amber-900 border border-amber-220 p-3 rounded-xl text-xs font-bold leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                    <span>{roleInfoMessage}</span>
                  </div>
                )}

                <hr className="border-gray-250/50" />

                {/* Committees assignment custom list with dynamic sorting and transferability */}
                <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[13px] font-black text-gray-800 flex items-center gap-1.5">
                      <Building2 className="w-4.5 h-4.5 text-blue-600" />
                      <span>ربط وتوزيع اللجان على الموظفين الحاليين:</span>
                    </label>
                    <span className="text-[11px] text-blue-800 font-extrabold bg-blue-100 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                      اللجان المحددة: {empCommittees.length}
                    </span>
                  </div>

                  {/* Badges of currently linked committees */}
                  {empCommittees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white border border-gray-200 rounded-xl shadow-inner min-h-[60px] items-center">
                      {empCommittees.map(commName => (
                        <div key={commName} className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-100 text-blue-900 px-3 py-1.5 rounded-xl font-black text-[11px] shadow-sm">
                          <span className="text-blue-600 font-extrabold">&bull;</span>
                          <span>{commName}</span>
                          <button
                            type="button"
                            onClick={() => setEmpCommittees(prev => prev.filter(c => c !== commName))}
                            className="mr-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="إلغاء ارتباط اللجنة"
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropdown Add Row */}
                  <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm form-element">
                    <select
                      value={selectedCommToLink}
                      onChange={(e) => setSelectedCommToLink(e.target.value)}
                      className="flex-1 bg-transparent border-none text-[13px] font-bold text-gray-700 focus:ring-0 outline-none pr-1 cursor-pointer"
                    >
                      <option value="">-- اختر لجنة لربطها بالموظف --</option>
                      {availableCommittees.map(commName => {
                        const ownerEmp = employees.find(emp => emp.id !== editingEmpId && emp.committees && emp.committees.includes(commName));
                        const isLinkedToCurrent = empCommittees.includes(commName);
                        if (isLinkedToCurrent) return null; // Hide already selected ones
                        return (
                          <option key={commName} value={commName}>
                            {commName} {ownerEmp ? `(حالتها: مربوطة بـ ${ownerEmp.name})` : ""}
                          </option>
                        );
                      })}
                    </select>
                    
                    <button
                      type="button"
                      disabled={!selectedCommToLink}
                      onClick={() => {
                        if (!selectedCommToLink) return;
                        
                        // Check if it belongs to someone else to transfer it
                        const ownerEmp = employees.find(emp => emp.id !== editingEmpId && emp.committees && emp.committees.includes(selectedCommToLink));
                        if (ownerEmp) {
                          setEmployees(prev => prev.map(emp => {
                            if (emp.id === ownerEmp.id) {
                              return {
                                ...emp,
                                committees: (emp.committees || []).filter(c => c !== selectedCommToLink)
                              };
                            }
                            return emp;
                          }));
                          addSystemLog("تحويل لجنة بين الموظفين", `تحويل وإعادة تخصيص اللجنة (${selectedCommToLink}) من الموظف ${ownerEmp.name} إلى هذا الملف.`);
                        }

                        setEmpCommittees(prev => [...prev, selectedCommToLink]);
                        setSelectedCommToLink(""); // reset
                      }}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-black px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>إضافة ارتباط</span>
                    </button>
                  </div>
                </div>

                {/* Active user status switch */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-xs font-black text-gray-800">حالة الموظف بالبوابة</p>
                    <p className="text-[10px] text-gray-400 font-bold leading-normal">تحويل الحالة لنشط / غير نشط لغلق صلاحيات التشفير والدخول.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmpActive(!empActive)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer ${
                      empActive ? "bg-emerald-600 flex justify-end" : "bg-gray-300 flex justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* Footer submit */}
                <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="h-11 px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-black text-xs rounded-xl cursor-pointer transition-all"
                  >
                    إلغاء التراجع
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-750 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {editingEmpId ? "اعتماد حفظ البيانات" : "إدراج الموظف وتعميده"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. DETAILS VIEW MODAL FOR PERSONAL DOSSIER */}
      <AnimatePresence>
        {detailsEmployee && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setDetailsEmployee(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-350 shadow-2xl max-w-md w-full relative z-10 text-right space-y-5 font-sans"
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <img 
                  src={detailsEmployee.photo} 
                  alt={detailsEmployee.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#246fff]/20 max-h-16"
                />
                <div className="text-right flex-grow">
                  <h3 className="font-extrabold text-base text-gray-900">{detailsEmployee.name}</h3>
                  <p className="text-xs text-gray-500 font-bold leading-normal">{detailsEmployee.jobTitle}</p>
                  <span className={`inline-block text-[9.5px] font-black px-2 py-0.5 rounded-full mt-2 ${
                    detailsEmployee.role === "SYS_ADMIN" ? "bg-red-50 text-red-700 border border-red-200" :
                    detailsEmployee.role === "MANAG_DIR" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    detailsEmployee.role === "DEPT_HEAD" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {detailsEmployee.roleAr}
                  </span>
                </div>
              </div>

              {/* Dossier Body */}
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="grid grid-cols-2 gap-2 text-right">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-gray-400 font-extrabold block leading-none mb-1">الرقم الوظيفي:</span>
                    <span className="font-mono font-black text-gray-800 text-xs">{detailsEmployee.id}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-gray-400 font-extrabold block leading-none mb-1">تاريخ الانضمام:</span>
                    <span className="font-mono font-black text-gray-800 text-xs">{detailsEmployee.joinDate}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-black block">البريد الإلكتروني للغرفة:</span>
                  <p className="font-mono font-black text-indigo-700 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 text-left truncate">{detailsEmployee.email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-black block">رقم الجوال الشخصي:</span>
                  <p className="font-mono font-black text-gray-800 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">{detailsEmployee.phone}</p>
                </div>

                {detailsEmployee.extension && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-black block">رقم التحويلة الداخلية (Extension):</span>
                    <p className="font-mono font-black text-gray-800 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">{detailsEmployee.extension}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-gray-800">اللجان المخصصة تحت إشرافه للأرشفة والفعاليات:</span>
                    <span className="bg-blue-50 text-blue-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-blue-200">{(detailsEmployee.committees || []).length} لجنة</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl max-h-32 overflow-y-auto space-y-1">
                    {(detailsEmployee.committees || []).length === 0 ? (
                      <p className="text-gray-400 italic text-[11px] font-bold">لم يسند له أي لجان رسمية بعد.</p>
                    ) : (
                      (detailsEmployee.committees || []).map((c) => (
                        <div key={c} className="flex items-center gap-1.5 text-gray-800 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 bg-[#246fff] rounded-full" />
                          <span>{c}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Dossier footer */}
              <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${detailsEmployee.active ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-[10px] text-gray-500 font-black">حالة الحساب المتصل: {detailsEmployee.active ? "نشط" : "غير نشط"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsEmployee(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-950 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  إغلاق نافذة الملف
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DELETE CONFIRMATION MODAL FOR EMPLOYEES */}
      <AnimatePresence>
        {deletingEmployee && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* dark glass overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingEmployee(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden z-10 text-right space-y-5 border border-red-100 font-sans"
            >
              {deletingEmployee.role === "SYS_ADMIN" ? (
                <>
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-950 text-base">إجراء محظور أمنياً</h3>
                      <p className="text-[11px] text-gray-400 font-extrabold">صلاحيات حوكمة النظام والأمان</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs font-semibold text-red-850 leading-relaxed text-right space-y-2">
                    <p className="font-bold text-red-900">غير مسموح بحذف مدير النظام الأساسي أو رئيس الحسابات الهيكلية!</p>
                    <p className="text-[11px] text-red-700 leading-normal">
                      لضمان حماية المسارات الاستراتيجية واسترداد البيانات، يُحظر إزالة الحساب القيادي الرئيسي ({deletingEmployee.name}) من النظام.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingEmployee(null)}
                      className="w-full h-10 bg-gray-900 hover:bg-black text-white font-black text-xs rounded-xl cursor-pointer transition-all"
                    >
                      حسناً، فهمت
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-950 text-base">تأكيد حذف الموظف كلياً</h3>
                      <p className="text-[11px] text-gray-400 font-bold">{deletingEmployee.name} - {deletingEmployee.jobTitle}</p>
                    </div>
                  </div>

                  <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 space-y-2 text-right">
                    <p className="text-xs font-black text-red-950">تنبيه حرج لحوكمة البيانات:</p>
                    <p className="text-[11px] text-red-700 leading-relaxed font-semibold">
                      سيؤدي هذا الإجراء لاستبعاد الموظف بشكل نهائي من الهيكل الإداري للغرفة وتجريد كافة الصلاحيات الممنوحة له.
                      {(deletingEmployee.committees || []).length > 0 && (
                        <span> سيتم إلغاء تكليفه باللجان التالية: ({(deletingEmployee.committees || []).join("، ")}).</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {/* Delete permanently */}
                    <button
                      type="button"
                      onClick={() => {
                        setEmployees(prev => prev.filter(e => e.id !== deletingEmployee.id));
                        addSystemLog("حذف موظف", `تم حذف ملف الموظف ${deletingEmployee.name} وإلغاء تخصيصه للجان: ${(deletingEmployee.committees || []).join("، ")}`);
                        setDeletingEmployee(null);
                      }}
                      className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>تأكيد الحذف النهائي للموظف</span>
                    </button>

                    {/* Disable instead of delete */}
                    <button
                      type="button"
                      onClick={() => {
                        setEmployees(prev => prev.map(e => {
                          if (e.id === deletingEmployee.id) {
                            return { ...e, active: false };
                          }
                          return e;
                        }));
                        addSystemLog("تعديل حالة موظف", `تم تعطيل حساب الموظف ${deletingEmployee.name} بدلاً من الحذف لتأمين السجلات.`);
                        setDeletingEmployee(null);
                      }}
                      className="w-full h-10 bg-amber-50 hover:bg-amber-100 text-amber-850 font-black text-xs rounded-xl border border-amber-250 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-amber-600" />
                      <span>تعطيل الحساب وتجميده (بدون حذف)</span>
                    </button>

                    {/* Cancel button */}
                    <button
                      type="button"
                      onClick={() => setDeletingEmployee(null)}
                      className="w-full h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء والتراجع
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
