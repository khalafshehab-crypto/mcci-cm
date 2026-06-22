// src/components/GoogleWorkspaceCenter.tsx
import React, { useState, useEffect } from "react";
import { 
  connectGoogleWorkspace, 
  disconnectGoogleWorkspace, 
  subscribeToAccessToken,
  listDriveFiles,
  createDriveFolder,
  createAndPopulateSheet,
  sendGmailMessage,
  createCalendarEvent,
  createGoogleDoc,
  createGoogleSlide,
  createGoogleTask,
  listChatSpaces,
  sendChatMessage,
  createGoogleForm,
  uploadFileToDrive
} from "../lib/googleApi";
import { 
  Sparkles, 
  HardDrive, 
  FileSpreadsheet, 
  Mail, 
  Calendar, 
  FileText, 
  Presentation, 
  CheckSquare, 
  MessageSquare, 
  FileCheck, 
  Video, 
  Send,
  Loader2,
  CheckCircle,
  ExternalLink,
  Shield,
  Trash2,
  AlertCircle,
  X
} from "lucide-react";
import { auth } from "../lib/firebase";

interface GoogleWorkspaceCenterProps {
  // Pass current committees or members statistics to populate exports with real dynamic data!
  statsData?: {
    committeesCount: number;
    activeCommitteesCount: number;
    membersCount: number;
    recommendationsCount: number;
    tasksCount: number;
    committees: any[];
    members: any[];
    events: any[];
  };
  templates?: any[]; // Passed dynamically from the Library/Templates page
  onImportTemplate?: (title: string, desc: string, type: any, url: string) => Promise<any>;
  targetEmployee?: {
    id: string;
    name: string;
    role: string;
    roleAr: string;
    jobTitle: string;
    phone: string;
    email: string;
    committees: string[];
    active: boolean;
  };
}

export default function GoogleWorkspaceCenter({ statsData, targetEmployee, templates, onImportTemplate }: GoogleWorkspaceCenterProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("drive");
  const [userEmail, setUserEmail] = useState<string>("");
  
  // States for integration of committees & templates
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  // States for importing a template from Google Drive
  const [importTitle, setImportTitle] = useState("");
  const [importDesc, setImportDesc] = useState("");
  const [importType, setImportType] = useState<"مستندات" | "عروض تقديمية" | "جداول بيانات" | "بريد إلكتروني" | "أخرى">("مستندات");
  const [importUrl, setImportUrl] = useState("");
  
  // Status feedback alerts
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null);

  // States for specific tab operations
  // -- Gmail
  const [mailTo, setMailTo] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  
  // -- Calendar
  const [calTitle, setCalTitle] = useState("");
  const [calDesc, setCalDesc] = useState("");
  const [calStart, setCalStart] = useState("");
  const [calDuration, setCalDuration] = useState("60");
  const [calMeet, setCalMeet] = useState(true);

  // -- Google Tasks
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDue, setTaskDue] = useState("");

  // -- Google Chat
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  // -- Google Drive / Upload file demo
  const [uploadName, setUploadName] = useState("توصية_جديدة.txt");
  const [uploadContent, setUploadContent] = useState("هذا المستند تم توليده ورفعه آلياً باستخدام نظام غرفة مكة لإدارة اللجان القطاعية");

  // Subscribe to changes in the token
  useEffect(() => {
    const unsub = subscribeToAccessToken((tk) => {
      setToken(tk);
      if (tk) {
        setUserEmail(auth.currentUser?.email || "khalafshehab@gmail.com");
        // Load initial dependent data
        loadChatSpaces();
      } else {
        setUserEmail("");
      }
    });

    return () => {
      unsub();
    };
  }, []);

  // Sync inputs dynamically when a specific targetEmployee is provided or loaded in focus
  useEffect(() => {
    if (targetEmployee) {
      // 1. Pre-fill Gmail recipients and copy text in pure elegant Arabic matching user context
      setMailTo(targetEmployee.email || "");
      setMailSubject(`متابعة أعمال وتجهيزات اللجان القطاعية - الأستاذ/ة ${targetEmployee.name}`);
      setMailBody(`السلام عليكم ورحمة الله وبركاته،

الأستاذ/ة ${targetEmployee.name} المحترم/ة (${targetEmployee.jobTitle || "الأخصائي المسؤول"})،

نود التنسيق معكم لمراجعة وتحديث حالة أعمال ومستندات اللجان التي تقع تحت إشرافكم التنظيمي حالياً:
${(targetEmployee.committees || []).length > 0 
  ? (targetEmployee.committees || []).map(com => `• ${com}`).join("\n") 
  : "• لا توجد لجان مخصصة تحت إشرافكم المباشر حالياً."}

يرجى استكمال ومراجعة جدول الأعمال، ومحاضر الاجتماعات، وحالة التجهيزات لضمان دقة التقارير.

شاكرين لكم عظيم جهودكم وتكاملكم المستمر.

إدارة تكامل الخدمات - غرفة مكة المكرمة`);

      // 2. Pre-fill Calendar Invitation with precise context
      setCalTitle(`مراجعة وتكامل أداء اللجان - الأستاذ/ة ${targetEmployee.name}`);
      setCalDesc(`جلسة عمل ومتابعة فنية لمراجعة مسار اعتماد التوصيات والتقارير وسجلات الأعضاء تحت إشراف الأخصائي: ${targetEmployee.name}.
اللجان المرتبطة: ${(targetEmployee.committees || []).join("، ") || "لا يوجد"}`);
      
      const now = new Date();
      now.setHours(now.getHours() + 1); // default to 1 hour from now
      const pad = (num: number) => num.toString().padStart(2, "0");
      const localString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
      setCalStart(localString);

      // 3. Pre-fill Tasks to delegate directly via Google Tasks
      setTaskTitle(`مستندات وتجهيزات الموظف ${targetEmployee.name}`);
      setTaskNotes(`الأعمال المطلوبة من الموظف ${targetEmployee.name} (${targetEmployee.email}):
1. أرشفة اللوائح ومحاضر الاجتماعات السابقة على جوجل درايف للجان.
2. مطابقة سجل وتفاصيل الأعضاء وتحديث أرقام هواتفهم.
3. مراجعة التجهيزات والضيافة للفعاليات القادمة.`);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setTaskDue(`${nextWeek.getFullYear()}-${pad(nextWeek.getMonth() + 1)}-${pad(nextWeek.getDate())}`);

      // 4. Pre-fill Google Chat notification
      setChatMessage(`تنبيه تكاملي: @${targetEmployee.name}، يرجى التكرم ببدء أرشفة ملفات اللجان وتأكيد محاضر الاجتماعات عبر بوابة Google Workspace الموحدة.`);

      // 5. Default view tab for employee card view -> Gmail for quick direct emailing/notifying!
      setActiveTab("gmail");
    }
  }, [targetEmployee]);

  // Auto-select starting values for committee and template selectors
  useEffect(() => {
    if (statsData?.committees && statsData.committees.length > 0 && !selectedCommitteeId) {
      setSelectedCommitteeId(String(statsData.committees[0].id));
    }
  }, [statsData?.committees, selectedCommitteeId]);

  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const loadChatSpaces = async () => {
    try {
      const spaces = await listChatSpaces();
      setChatSpaces(spaces);
      if (spaces.length > 0) {
        setSelectedSpace(spaces[0].name);
      }
    } catch(e) {}
  };

  const showFeedback = (text: string, type: "success" | "error" | "info" = "success", url: string | null = null) => {
    setFeedback({ text, type });
    setFeedbackUrl(url);
    if (type !== "error") {
      // auto dismiss only non-error alerts
      setTimeout(() => {
        setFeedback(null);
        setFeedbackUrl(null);
      }, 15000); // 15 seconds visibility
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const authHeader = await connectGoogleWorkspace();
      showFeedback("تم الاتصال بـ Google Workspace بنجاح وتم تفعيل حزم الصلاحيات لجميع الخدمات العشرة!", "success");
    } catch(err: any) {
      console.error(err);
      showFeedback(`فشل الاتصال: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm("هل أنت متأكد من رغبتك في إنهاء جلسة اتصال Google Workspace وحذف الرمز التعريفي من الذاكرة؟");
    if (!confirmed) return;

    await disconnectGoogleWorkspace();
    showFeedback("تم قطع الاتصال بـ Google Workspace بنجاح.", "info");
  };

  // 1. Google Drive Demo
  const handleCreateFolder = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const folderName = `غرفة مكة - مجلد اللجان القطاعية (${new Date().getFullYear()})`;
      const folder = await createDriveFolder(folderName);
      showFeedback(`تم تأسيس مجلد الحفظ المشترك للجنة على Google Drive بنجاح: "${folderName}"`, "success", `https://drive.google.com/drive/folders/${folder.id}`);
    } catch(err: any) {
      showFeedback(`خطأ أثناء إنشاء المجلد: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await uploadFileToDrive(uploadName, uploadContent, "text/plain");
      showFeedback(`تم أرشفة ورفع الملف "${uploadName}" على جوجل درايف مباشرة بنجاح!`, "success", result.webViewLink);
    } catch(err: any) {
      showFeedback(`فشل الرفع والأرشفة: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportTemplateToDrive = async () => {
    if (!selectedCommitteeId) {
      alert("الرجاء اختيار اللجنة القطاعية المستهدفة للربط والأرشفة.");
      return;
    }
    if (!selectedTemplateId) {
      alert("الرجاء اختيار القالب الرقمي المراد تصديره.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const committee = statsData?.committees.find(c => String(c.id) === selectedCommitteeId);
      const template = templates?.find(t => t.id === selectedTemplateId);

      if (!committee) throw new Error("لم يتم العثور على اللجنة المحددة.");
      if (!template) throw new Error("لم يتم العثور على القالب المعتمد.");

      const fileName = `أرشيف_قالب_${template.title.replace(/\s+/g, "_")}_لجنة_${committee.name.replace(/\s+/g, "_")}.txt`;
      const fileContent = `
========================================
تقرير أرشفة وتكامل مستندات اللجان القطاعية
========================================
تاريخ الأرشفة: ${new Date().toLocaleDateString("ar-SA")} - ${new Date().toLocaleTimeString("ar-SA")}
صانع القالب: ${template.creator || "أخصائي الحوكمة"}
البريد الإلكتروني للأخصائي: ${userEmail || "khalafshehab@gmail.com"}

1) تفاصيل اللجنة القطاعية المشتركة:
----------------------------------
- اسم اللجنة: ${committee.name}
- رئيس اللجنة: ${committee.president || "غير محدد"}
- الأخصائي المسؤول: ${committee.specialist || "غير محدد"}
- الخطة الاستراتيجية: ${committee.strategicPlan || "لا توجد خطة استراتيجية حالياً"}
- عدد الأعضاء المقيدين: ${committee.membersCount || 0}
- عدد الفعاليات المنجزة: ${committee.eventsCount || 0}
- عدد التوصيات المعتمدة: ${committee.recommendationsCount || 0}

2) تفاصيل القالب الفهرسي السحابي:
---------------------------------
- عنوان القالب: ${template.title}
- نوع وتصنيف القالب: ${template.type}
- وصف القالب: ${template.description}
- رابط الارتباط السحابي الأصلي: ${template.cloudUrl}

----------------------------------------
بوابة خدمات Google Workspace الموحدة - غرفة مكة المكرمة
جميع الحقوق محفوظة © 2026
========================================
      `;

      const result = await uploadFileToDrive(fileName, fileContent, "text/plain");
      showFeedback(
        `🎉 تم تصدير القالب [${template.title}] ورسمه وأرشفته تلقائياً في سحابة لجنة ${committee.name} بنجاح!`, 
        "success", 
        result.webViewLink
      );
    } catch(err: any) {
      showFeedback(`فشل دمج وتصدير وأرشفة القالب: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImportTemplateToSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle.trim() || !importUrl.trim()) {
      alert("يرجى تعبئة عنوان القالب ورابطه السحابي أولاً.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      if (onImportTemplate) {
        await onImportTemplate(importTitle.trim(), importDesc.trim(), importType, importUrl.trim());
        showFeedback(`📥 تم استيراد وفك أرشفة القالب [${importTitle}] من Google Drive وإلحاقه ببطاقات المكتبة الفهرسية حياً بنجاح!`, "success");
        setImportTitle("");
        setImportDesc("");
        setImportType("مستندات");
        setImportUrl("");
      } else {
        throw new Error("آلية الاستيراد غير معرفة حالياً في هذا السياق.");
      }
    } catch(err: any) {
      showFeedback(`فشل فك واستيراد القالب: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Sheets
  const handleExportStatsToSheets = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const headers = ["البند الإحصائي", "القيمة المستخرجة من النظام"];
      const rows = [
        ["إجمالي عدد اللجان", String(statsData?.committeesCount || 0)],
        ["عدد اللجان الفعالة", String(statsData?.activeCommitteesCount || 0)],
        ["إجمالي عدد الأعضاء", String(statsData?.membersCount || 0)],
        ["إجمالي التوصيات المرحلة", String(statsData?.recommendationsCount || 0)],
        ["عدد المهام الإدارية", String(statsData?.tasksCount || 0)],
        ["تاريخ التوليد الإحصائي", new Date().toLocaleString("ar-SA")]
      ];

      // Add detailed lists if available
      const title = `التقرير العام والتحليلي لإدارة اللجان القطاعية - غرفة مكة`;
      const result = await createAndPopulateSheet(title, headers, rows);

      showFeedback("تم تصدير الإحصائيات وبطاقات الأداء لملف Google Sheets بنجاح! انقر لفتحه واستعراض المحتوى المشترك.", "success", result.webUrl);
    } catch(err: any) {
      showFeedback(`فشل التصدير: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Gmail Notification
  const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailTo) {
      alert("الرجاء تحديد البريد المستلم أولاً.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const finalSubject = mailSubject || "إشعار نظام اللجان القطاعية - غرفة مكة المكرمة";
      const finalBody = mailBody || `
        <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #246fff;">إشعار نظام إدارة اللجان - غرفة مكة المكرمة</h2>
          <p>السلام عليكم ورحمة الله وبركاته،</p>
          <p>هذا إشعار آلي مرسل من النظام بخصوص تابعة اجتماعات ومهام أعمالك المشتركة.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #777;">جميع الحقوق محفوظة - غرفة مكة المكرمة 2026.</p>
        </div>
      `;

      await sendGmailMessage(mailTo, finalSubject, finalBody);
      showFeedback(`تم إرسال نص الدعوة / البريد التنبيهي إلى [${mailTo}] مباشرة بنجاح عبر حساب Gmail الخاص بك!`, "success");
      setMailSubject("");
      setMailBody("");
    } catch(err: any) {
      showFeedback(`خطأ أثناء إرسال البريد: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Google Calendar + Meet
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calTitle || !calStart) {
      alert("الطلب يحتاج عنواناً وتوقيتاً للاجتماع.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const startIso = new Date(calStart).toISOString();
      // add duration
      const durationMin = parseInt(calDuration) || 60;
      const endObj = new Date(new Date(calStart).getTime() + durationMin * 60 * 1000);
      const endIso = endObj.toISOString();

      const event = await createCalendarEvent({
        title: calTitle,
        description: calDesc || "اجتماع مجدول لمتابعة أعمال اللجان القطاعية بغرفة مكة.",
        startTime: startIso.slice(0, 19),
        endTime: endIso.slice(0, 19),
        createMeetLink: calMeet,
        location: "غرفة مكة المكرمة - قاعات الاجتماعات الطابق العلوي"
      });

      let msg = `تم حجز وجدولة الفعالية في تقويم Google بنجاح وإحالتها للمواعيد المؤكدة المبرمجة.`;
      if (event.meetUrl) {
        msg += ` \n تم توليد رابط Google Meet الآمن للاجتماع المرئي: ${event.meetUrl}`;
      }

      showFeedback(msg, "success", event.eventUrl);
      setCalTitle("");
      setCalDesc("");
    } catch(err: any) {
      showFeedback(`فشل إرسال الفعالية للتقويم: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 5. Google Docs Exporter
  const handleExportToDoc = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const docTitle = `مذكرة وقائع محضر اجتماعات اللجان القطاعية - غرفة مكة`;
      const bodyText = `
محضر اجتماع اللجان القطاعية - غرفة مكة المكرمة
=============================================
التوقيت: ${new Date().toLocaleString("ar-SA")}
المنشئ الأخصائي: ${auth.currentUser?.displayName || "مشرف اللجان"}
البريد الإلكتروني المنسق: ${userEmail}

البند الأول: مناقشة أهداف الخطة الاستراتيجية المعتمدة
-------------------------------------------------
وقد تمت مراجعة المخرجات وتحديد الخطوات الأساسية لتسريع تنفيذ التوصيات الصادرة من لجان التغذية والإعاشة وكذا لجنة المعارض والمؤتمرات بغرفة مكة.

القرارات والتوجيهات الإدارية:
-------------------------
1. ترحيل التوصيات الحالية فوراً للوحة الاعتماد ليرفع للأخصائي ورئيس القسم.
2. تزويد الهيئة المشرفة بكشف تفصيلي بأسماء الأعضاء الحاضرين النصاب القانوني.
3. تفعيل الأرشفة التلقائية لجميع المستندات على سحابة Google Drive.

نهاية المحضر وتم التوثيق إلكترونياً.
      `;
      const result = await createGoogleDoc(docTitle, bodyText);
      showFeedback("تم إنشاء مذكرة محضر الاجتماع وتصديرها كملف Google Docs ذكي بنجاح!", "success", result.documentUrl);
    } catch(err: any) {
      showFeedback(`فشل التصدير والمزامنة: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 6. Google Slides Presentation
  const handleGenerateSlides = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const presentationTitle = `العرض التعريفي والتقرير الإحصائي العام`;
      const slides = [
        { title: "غرفة مكة المكرمة", text: "لوحة التحكم الذكية ومتابعة أعمال اللجان القطاعية ومؤشرات الأداء" },
        { title: "إحصائيات وقراءات حية", text: `إجمالي اللجان المتشكلة: ${statsData?.committeesCount || 4}\nاللجان الفعالة: ${statsData?.activeCommitteesCount || 3}\nإجمالي عدد الأعضاء: ${statsData?.membersCount || 24}\nالقضايا والتوصيات المنجزة: ${statsData?.recommendationsCount || 10}` },
        { title: "التوصيات والخطط المستقبلية", text: "مزامنة جميع البنود الإجرائية وتجهيز الضيافة والتغطيات الإعلامية بانتظام." }
      ];

      const result = await createGoogleSlide(presentationTitle, slides);
      showFeedback("تم تصميم وإنشاء عرض توضيحي مميز على Google Slides بنجاح!", "success", result.presentationUrl);
    } catch(err: any) {
      showFeedback(`فشل إنشاء العرض التقديمي: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 7. Google Tasks
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) {
      alert("يرجى تسمية المهمة.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const dueIso = taskDue ? new Date(taskDue).toISOString() : undefined;
      await createGoogleTask({
        title: taskTitle,
        notes: taskNotes || "مهمة إدارية منقولة من نظام اللجان القطاعية",
        due: dueIso
      });
      showFeedback(`تم تسجيل ومزامنة المهمة الإدارية "${taskTitle}" وحفظها في قائمة مهام Google Tasks الخاصة بك بنجاح!`, "success");
      setTaskTitle("");
      setTaskNotes("");
      setTaskDue("");
    } catch(err: any) {
      showFeedback(`فشل تسجيل المهمة: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 8. Google Chat Messages
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !selectedSpace) {
      alert("يرجى اختيار الغرفة وتدوين نص الرسالة.");
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await sendChatMessage(selectedSpace, chatMessage);
      showFeedback("تم إرسال الرسالة الإجرائية والتحديث الإداري إلى مساحة عمل Google Chat المخصصة للتنسيق بنجاح!", "success");
      setChatMessage("");
    } catch(err: any) {
      showFeedback(`فشل إرسال رسالة غرف Google Chat: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 9. Google Forms Builder
  const handleCreateForm = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const formTitle = `استبيان قياس جودة وفعالية لقاءات لجان غرفة مكة (${new Date().getFullYear()})`;
      const result = await createGoogleForm(formTitle);
      showFeedback(`تم تصميم نموذج الاستبيان الرقمي Google Forms لتقييم حضور الأعضاء والاجتماعات بنجاح!`, "success", result.responderUrl);
    } catch(err: any) {
      showFeedback(`فشل تصميم النموذج: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e8e4e4] border border-gray-250 shadow-sm rounded-3xl p-5 md:p-6 text-right space-y-5 animate-fadeIn">
      
      {/* Header with Google color bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-300 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-full border border-gray-150 shadow-inner flex items-center justify-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EA4335" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#4285F4" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FBBC05" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#34A853" }} />
          </div>
          <div>
            <h3 className="text-gray-900 font-extrabold text-sm flex items-center gap-1.5 leading-tight">
              <span>مدير تكامل خدمات Google Workspace الموحد</span>
              <Sparkles className="w-4 h-4 text-brand" />
            </h3>
            <p className="text-[10px] text-gray-500 font-extrabold mt-1">تفعيل وترابط جميع عوائل جوجل (10 خدمات حية ومتزامنة 100%) لغرفة مكة</p>
          </div>
        </div>

        {/* Action button to authorize */}
        <div>
          {token ? (
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black py-1 px-3 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>متصل بحساب: {userEmail}</span>
              </span>
              <button
                type="button"
                onClick={handleDisconnect}
                className="p-1 px-2.5 text-red-650 hover:bg-red-50 text-[10px] font-bold rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer flex items-center gap-1"
                title="إنهاء الجلسة الآمنة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>فصل</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-gray-300 rounded-xl shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2.5 text-xs font-black text-slate-850 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
              ) : (
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                  alt="Google logo" 
                  className="w-4.5 h-4.5 shrink-0" 
                />
              )}
              <span>تفعيل وترقية الاتصال بـ Google Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational guidelines warnings */}
      {!token && (
        <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed text-blue-900">
          <Shield className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">مستوى الأمان وحوكمة الاتصال التلقائي:</p>
            <p className="font-semibold text-[11px] text-blue-800">
              يرجى تنشيط المفتاح أعلاه للمصادقة وتخزين رمز الوصول الآمن مؤقتاً في الذاكرة النشطة للتطبيق.
              سيتيح هذا للنظام تولي جدولة فعالياتك، وإرسال تنبيهات بريدك للموظفين، وتصدير إحصائياتك وجداول أعمالك لملفات جوجل المنظمة فوراً!
            </p>
          </div>
        </div>
      )}

      {/* Feedback messaging block */}
      {feedback && (() => {
        // Extract any URL containing google console or developers from the text
        const urlRegex = /(https?:\/\/(?:console\.developers\.google\.com|console\.cloud\.google\.com)[^\s"']*)/i;
        const matchedLink = feedback.text.match(urlRegex);
        const googleConsoleUrl = matchedLink ? matchedLink[0] : null;
        const isGoogleApiDisabled = feedback.text.includes("disabled") || feedback.text.includes("not been used") || googleConsoleUrl;

        // Custom alternative actions for quick user bypass
        const handleMailtoFallback = () => {
          const cleanBodyMsg = mailBody
            ? mailBody.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n')
            : "تم توليد وتنبيه هذا الاجتماع من قبل نظام إدارة اللجان بنقرة سريعة.";
          const subjectEncoded = encodeURIComponent(mailSubject || "إشعار نظام اللجان القطاعية - غرفة مكة المكرمة");
          const bodyEncoded = encodeURIComponent(cleanBodyMsg);
          window.open(`mailto:${mailTo}?subject=${subjectEncoded}&body=${bodyEncoded}`, "_blank");
        };

        return (
          <div className={`p-4.5 rounded-2.5xl border text-[11.5px] font-bold leading-relaxed flex flex-col gap-3.5 transition-all animate-fadeIn relative ${
            feedback.type === "success" ? "bg-emerald-50 border-emerald-250 text-emerald-800" :
            feedback.type === "info" ? "bg-cyan-50 border-cyan-200 text-cyan-850" :
            "bg-red-50 border-red-200 text-red-800"
          }`}>
            {/* Dismiss button */}
            <button
              onClick={() => { setFeedback(null); setFeedbackUrl(null); }}
              className="absolute top-2.5 left-2.5 p-1 text-gray-400 hover:text-gray-700 bg-white/50 hover:bg-white rounded-lg transition-all cursor-pointer border border-transparent hover:border-gray-200"
              title="إغلاق التنبيه"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              {feedback.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p className="font-extrabold leading-normal pl-5 text-right">{feedback.text}</p>
                {feedbackUrl && (
                  <a 
                    href={feedbackUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white text-[10px] font-black rounded-lg hover:bg-brand/90 transition-all shadow-sm"
                  >
                    <span>افتح البند على سحابة Google للتحقق والمعاينة الحية</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* If Google API is disabled, provide an outstanding, helpful guide and fallbacks */}
            {feedback.type === "error" && isGoogleApiDisabled && (
              <div className="bg-white/95 p-4 rounded-xl border border-red-200 text-[10.5px] space-y-3.5 text-slate-800 mt-1 shadow-sm text-right">
                <div className="flex items-center gap-1.5 text-red-700 font-extrabold">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-ping" />
                  <span>خطوات إصلاح وتجاوز هذا التحدي الفني:</span>
                </div>
                <p className="font-semibold text-slate-650 leading-relaxed">
                  هذا التنبيه يظهر لأن الخدمة المطلوبة <strong>(Gmail API / Google Drive / Calendar)</strong> لم تفعّل بعد في مشروع Google Cloud المطورين المربوط بنظامك وتطبيقك الحالي.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {googleConsoleUrl && (
                    <a
                      href={googleConsoleUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-850 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm text-center"
                    >
                      <span>تفعيل الخدمة في كونسول Google مباشراً 🌐</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {mailTo && (
                    <button
                      type="button"
                      onClick={handleMailtoFallback}
                      className="p-2.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 text-emerald-850 rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <span>التبديل والإرسال السريع عبر بريدك المحلي (mailto) ✉️</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-2.5 bg-yellow-50/50 border border-yellow-250 rounded-lg text-[9.5px] text-yellow-800 font-bold leading-normal">
                  💡 <strong>ملاحظة هامة للمدير المسؤول:</strong> بعد تفعيل الخدمة من كونسول جوجل، يرجى الانتظار لحوالي دقيقة إلى دقيقتين كي ينتشر التحديث وتنشط الخدمة تماماً من طرف خوادم جوجل، ثم أعد المحاولة.
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tab select menu for connecting utilities */}
      {token && (
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-9 gap-1.5 bg-white/70 p-1 rounded-2xl border border-gray-300/40">
          {[
            { id: "drive", label: "جوجل درايف", icon: <HardDrive className="w-4 h-4" /> },
            { id: "sheets", label: "جداول البيانات", icon: <FileSpreadsheet className="w-4 h-4" /> },
            { id: "gmail", label: "جيميل", icon: <Mail className="w-4 h-4" /> },
            { id: "calendar", label: "تقويم جوجل", icon: <Calendar className="w-4 h-4" /> },
            { id: "docs", label: "جوجل دوكس", icon: <FileText className="w-4 h-4" /> },
            { id: "slides", label: "العروض", icon: <Presentation className="w-4 h-4" /> },
            { id: "tasks", label: "مهام جوجل", icon: <CheckSquare className="w-4 h-4" /> },
            { id: "chat", label: "محادثات جوجل", icon: <MessageSquare className="w-4 h-4" /> },
            { id: "forms", label: "نماذج جوجل", icon: <FileCheck className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); }}
              className={`py-2 rounded-xl text-[10px] font-black flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? "bg-brand text-white shadow-brand/10" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Embedded active tabs execution dashboard */}
      {token && (
        <div className="bg-white/95 rounded-2.5xl border border-gray-300/60 p-4 min-h-[220px]">
          
          {/* TAB 1: GOOGLE DRIVE */}
          {activeTab === "drive" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <h4 className="text-gray-900 font-extrabold text-xs">خدمات الأرشفة والملفات (Google Drive API)</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-normal">
                تتيح لك منصة أرشفة ملفات اللقاءات رفع المستندات، الكتب الرسمية، التوصيات، والقرارات المشتركة مباشرة إلى حساب Google Drive السحابي المشترك وتوليد مسارات الأمان الرقمية.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* 1. Integration console: Archive Template to Committee s Google Drive */}
                <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-900">حوكمة أعمال الأرشفة: ربط القوالب وتصديرها لسحابة اللجنة</h5>
                  </div>
                  <p className="text-[10.5px] text-gray-500 font-medium">
                    اختر اللجنة القطاعية المربوطة من النظام، واختر القالب المطلوب، لتوليد مسودة الأرشفة المنسقة وتصديرها كملف فني مباشرة في مساحة Google Drive المعتمدة للجنة.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Committee Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-extrabold">1. اختر اللجنة المستهدفة بالربط</label>
                      <select
                        value={selectedCommitteeId}
                        onChange={(e) => setSelectedCommitteeId(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        {statsData?.committees && statsData.committees.length > 0 ? (
                          statsData.committees.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                          ))
                        ) : (
                          <option value="">لا توجد لجان بالنظام حالياً</option>
                        )}
                      </select>

                      {/* Display Selected Committee Live Properties */}
                      {(() => {
                        const comm = statsData?.committees.find(c => String(c.id) === selectedCommitteeId);
                        if (!comm) return null;
                        return (
                          <div className="p-2.5 bg-white/80 rounded-xl border border-gray-200/50 space-y-1 text-[10px] font-bold text-gray-600">
                            <div className="flex justify-between">
                              <span className="text-gray-400">الأخصائي:</span>
                              <span className="text-gray-900">{comm.specialist || "غير محدد"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">رئيس اللجنة:</span>
                              <span className="text-gray-900">{comm.president || "غير محدد"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">الخطة الاستراتيجية:</span>
                              <span className="text-gray-900 truncate max-w-[170px]">{comm.strategicPlan || "غير متوفرة"}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-gray-100 font-extrabold text-[9px] text-brand">
                              <span>الأعضاء: {comm.membersCount || 0} | الاجتماعات: {comm.meetingsCount || 0}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 font-extrabold">2. حدد القالب المراد أرشفته</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        {templates && templates.length > 0 ? (
                          templates.map((t) => (
                            <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
                          ))
                        ) : (
                          <option value="">لا توجد قوالب بالمكتبة حالياً</option>
                        )}
                      </select>

                      {/* Selected Template Preview */}
                      {(() => {
                        const temp = templates?.find(t => t.id === selectedTemplateId);
                        if (!temp) return null;
                        return (
                          <div className="p-2.5 bg-white/80 rounded-xl border border-gray-200/50 space-y-1 text-[10px] font-bold text-gray-600">
                            <div className="font-extrabold text-gray-900 line-clamp-1">{temp.title}</div>
                            <p className="text-gray-400 text-[9px] line-clamp-2 leading-relaxed">{temp.description}</p>
                            <div className="pt-1 text-[8.5px] text-emerald-600">رابط السحابة: {temp.cloudUrl ? "متوفر 🔗" : "غير متوفر"}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleExportTemplateToDrive}
                      disabled={loading || !selectedCommitteeId || !selectedTemplateId}
                      className="px-5 py-2.5 bg-brand text-white font-black text-xs rounded-xl hover:bg-brand/90 cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand/10"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>تصدير القالب وأرشفته سحابياً في مجلد اللجنة</span>
                    </button>
                  </div>
                </div>

                {/* 2. Import form: Bring custom template from Google Drive to local templates db */}
                <div className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-r from-purple-50/20 to-fuchsia-50/20 space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                      <Send className="w-4 h-4" />
                    </div>
                    <h5 className="font-extrabold text-xs text-gray-900">استيراد وتأصيل قالب رقمي من Google Drive سحابياً</h5>
                  </div>
                  <p className="text-[10.5px] text-gray-500 font-medium">
                    إذا كان لديك ملف قالب جديد معتمد على مساحتك بـ Google Drive، يمكنك إدخال تفاصيله واستيراده فورياً ليدخل في فهرس القوالب والبطاقات الرقمية للنظام.
                  </p>

                  <form onSubmit={handleImportTemplateToSystem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9.5px] text-gray-400 font-extrabold mb-1">اسم/عنوان القالب المستورد</label>
                        <input
                          type="text"
                          required
                          value={importTitle}
                          onChange={(e) => setImportTitle(e.target.value)}
                          placeholder="مثلاً: قالب خطة استراتيجية للقطاع"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-gray-400 font-extrabold mb-1">نوع وتصنيف القالب</label>
                        <select
                          value={importType}
                          onChange={(e) => setImportType(e.target.value as any)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-right"
                        >
                          <option value="مستندات">مستندات Google Docs / Word</option>
                          <option value="عروض تقديمية">عروض تقديمية Slides / PPT</option>
                          <option value="جداول بيانات">جداول تفاعلية Sheets / Excel</option>
                          <option value="بريد إلكتروني">مراسلات إلكترونية Email</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9.5px] text-gray-400 font-extrabold mb-1">رابط المشاركة / الارتباط السحابي (Google Drive URL)</label>
                        <input
                          type="url"
                          required
                          value={importUrl}
                          onChange={(e) => setImportUrl(e.target.value)}
                          placeholder="https://docs.google.com/..."
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-left font-sans"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[9.5px] text-gray-400 font-extrabold mb-1">وصف مبسط للقالب المستورد</label>
                        <input
                          type="text"
                          value={importDesc}
                          onChange={(e) => setImportDesc(e.target.value)}
                          placeholder="مثال: يخدم هذا القالب وضع المعايير للربع القادم للمقاولات"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={loading || !importTitle.trim() || !importUrl.trim()}
                        className="px-5 py-2.5 bg-[#121212] hover:bg-black text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-black/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>تأصيل واستيراد القالب فوري وبثه في بطاقات المنسقين</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 3. Original Quick Actions: Create master folder */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <h5 className="font-extrabold text-xs text-gray-900">تأسيس مجلد لجنة قطاعية جديد</h5>
                    <p className="text-[10px] text-gray-400 mt-1">توليد مجلد سحابي مخصص لأعمال الأرشفة والتقارير بمقاييس الحوكمة</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    disabled={loading}
                    className="w-full text-center py-2 bg-brand text-white font-black text-[10.5px] rounded-xl hover:bg-brand/90 transition-all cursor-pointer"
                  >
                    إنشاء مجلد اللجنة ومزامنته بمكتبة الأخصائي
                  </button>
                </div>
                
                {/* 4. Original Quick Actions: Drag & drop upload simulator */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                  <h5 className="font-extrabold text-xs text-gray-900">أرشفة ورفع ملف فوري (سريع)</h5>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="اسم الملف مثلاً: توصية_جديدة.txt"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-[10.5px] font-bold text-right"
                    />
                    <textarea
                      value={uploadContent}
                      onChange={(e) => setUploadContent(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadFile}
                    disabled={loading}
                    className="w-full text-center py-2 bg-brand text-white font-black text-[10.5px] rounded-xl hover:bg-brand/90 transition-all cursor-pointer"
                  >
                    رفع وأرشفة الملف إلى Google Drive الفعلي
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === "sheets" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h4 className="text-gray-900 font-extrabold text-xs">تصدير جداول البيانات السحابية (Google Sheets API)</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-normal">
                تصدير كافة أرقام وجداول أداء اللجان وسجلات الأعضاء النشطين إلى ملفات Google Sheets مباشرة بطرق حية بدلاً من ملفات CSV البدائية والجامدة.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h5 className="font-extrabold text-xs text-gray-900">تصدير تقرير الإحصائيات وبطاقات الأداء العامة للجان</h5>
                  <p className="text-[10px] text-gray-400 mt-1">سيتم ترحيل قراءة إجمالي اللجان المتشكلة، الفعالة، وسجل الأعضاء في جدول Sheets منسق</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportStatsToSheets}
                  disabled={loading}
                  className="bg-brand text-white font-black text-[11px] px-5 py-2.5 rounded-xl hover:bg-brand/90 transition-all cursor-pointer shadow-md shadow-brand/10 self-start sm:self-auto"
                >
                  تصدير التقرير في Google Sheet
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GMAIL */}
          {activeTab === "gmail" && (
            <form onSubmit={handleSendGmail} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <Mail className="w-5 h-5 text-red-500" />
                <h4 className="text-gray-900 font-extrabold text-xs">إرسال التنبيهات ونصوص الدعوات الرسمية (Gmail API)</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold mb-1">البريد الإلكتروني للمستلم</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@makkahchamber.sa"
                      value={mailTo}
                      onChange={(e) => setMailTo(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold mb-1">عنوان الرسالة / الدعوة</label>
                    <input
                      type="text"
                      placeholder="e.g. دعوة رسمية لحضور اجتماع لجنة التغذية الدوري"
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold mb-1">تفاصيل المحتوى (HTML مدعوم)</label>
                  <textarea
                    rows={4}
                    placeholder="اكتب رسالة الإشعار أو نص الدعوة بالكامل..."
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand text-white font-black text-xs rounded-xl hover:bg-brand/90 cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand/15"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الإشعار والتعديل الفوري عبر Gmail</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: GOOGLE CALENDAR + GOOGLE MEET */}
          {activeTab === "calendar" && (
            <form onSubmit={handleScheduleMeeting} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h4 className="text-gray-900 font-extrabold text-xs">جدولة المواعيد وتوليد غرف Google Meet</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold mb-1">عنوان الفعالية / الاجتماع</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. اجتماع لجنة المقاولات والتشييد التأسيسي الأول"
                      value={calTitle}
                      onChange={(e) => setCalTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 font-extrabold mb-1">وقت البدء</label>
                      <input
                        type="datetime-local"
                        required
                        value={calStart}
                        onChange={(e) => setCalStart(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-extrabold mb-1">المدة (بالدقائق)</label>
                      <select
                        value={calDuration}
                        onChange={(e) => setCalDuration(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                      >
                        <option value="30">30 دقيقة</option>
                        <option value="60">ساعة واحدة</option>
                        <option value="90">ساعة ونصف</option>
                        <option value="120">ساعتان</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold mb-1">الوصف والتعليمات للأعضاء</label>
                    <textarea
                      rows={2}
                      placeholder="اكتب بنود جدول الأعمال أو الأجندة للإلحاق بالموعد..."
                      value={calDesc}
                      onChange={(e) => setCalDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-gray-150">
                    <input
                      type="checkbox"
                      id="meetCheck"
                      checked={calMeet}
                      onChange={(e) => setCalMeet(e.target.checked)}
                      className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand cursor-pointer"
                    />
                    <label htmlFor="meetCheck" className="text-[11px] font-bold text-gray-700 cursor-pointer select-none flex items-center gap-1">
                      <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                      إنشاء موعد في تقويم جوجل + توليد رابط Google Meet ذكي وتلقائي
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand text-white font-black text-xs rounded-xl hover:bg-brand/90 cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand/15"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>تأكيد الموعد وإضافة الاجتماع للتقويم الفعلي</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: GOOGLE DOCS */}
          {activeTab === "docs" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h4 className="text-gray-900 font-extrabold text-xs">صياغة وتوليد المحاضر المكتوبة (Google Docs API)</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-normal">
                مزود الصياغة التلقائية لخطابات الاجتماعات يتيح تحويل وتصدير نصوص وقائع الاجتماعات وبنود المناقشات إلى ملفات Google Docs سحابية منسقة ومعتمدة بضغطة زر واحدة.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h5 className="font-extrabold text-xs text-gray-900">تصدير وقائع مسار الاعتماد الإجرائي الحالي لـ Google Docs</h5>
                  <p className="text-[10px] text-gray-400 mt-1">توليد مسودة فنية تحاكي بنود جدول أعمال وسير العمل للمناقشات بشكل منسق تلقائياً</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportToDoc}
                  disabled={loading}
                  className="bg-brand text-white font-black text-[11px] px-5 py-2.5 rounded-xl hover:bg-brand/90 transition-all cursor-pointer shadow-md shadow-brand/10 self-start sm:self-auto"
                >
                  توليد مستند Google Docs
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE SLIDES */}
          {activeTab === "slides" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <Presentation className="w-5 h-5 text-amber-500" />
                <h4 className="text-gray-900 font-extrabold text-xs">صناعة العروض التعريفية للبنود والفعاليات (Google Slides API)</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-normal">
                صمم العروض التقديمية الخاصة بوضع اللجان ومؤشرات الأداء وصيرها لقوالب Google Slides المخصصة لتقديم عروض مجالس الإدارة المشتركة بشكل مميز ومرئي.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h5 className="font-extrabold text-xs text-gray-900">إنشاء وتصميم عرض شرائح إحصائي شامل وموجز</h5>
                  <p className="text-[10px] text-gray-400 mt-1">توليد ملف Slides يحتوي على شرائح اللقاء والتقرير الإحصائي العام للجان القطاعية</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSlides}
                  disabled={loading}
                  className="bg-brand text-white font-black text-[11px] px-5 py-2.5 rounded-xl hover:bg-brand/90 transition-all cursor-pointer shadow-md shadow-brand/10 self-start sm:self-auto"
                >
                  توليد عرض شرائح بالكامل
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: GOOGLE TASKS */}
          {activeTab === "tasks" && (
            <form onSubmit={handleAddTask} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <CheckSquare className="w-5 h-5 text-sky-500" />
                <h4 className="text-gray-900 font-extrabold text-xs">مزامنة وترحيل المهام والواجبات (Google Tasks API)</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold mb-1">عنوان المهمة</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. مراجعة كشوفات حضور لقاء المقاولات والتشييد"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-extrabold mb-1">التاريخ المستهدف للتسليم (Due Date)</label>
                    <input
                      type="date"
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold mb-1">تفاصيل المهمة والملاحظات الإجرائية</label>
                  <textarea
                    rows={4}
                    placeholder="ملاحظات وتفاصيل إضافية عن البند الإداري المشترك..."
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand text-white font-black text-xs rounded-xl hover:bg-brand/90 cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand/15"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>تأكيد الإرسال والمزامنة مع Google Tasks</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: GOOGLE CHAT */}
          {activeTab === "chat" && (
            <form onSubmit={handleSendChatMessage} className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h4 className="text-gray-900 font-extrabold text-xs">بث الإشعارات لغرف التنسيق (Google Chat API)</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-400 font-extrabold mb-1">اختر غرفة/مساحة التنسيق بمسار أعمال جوجل</label>
                  <select
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold"
                  >
                    {chatSpaces.map((sp) => (
                      <option key={sp.name} value={sp.name}>{sp.displayName}</option>
                    ))}
                  </select>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-800 font-semibold leading-relaxed">
                    ⚙️ <strong>حوكمة النشر الآلي:</strong> سيقوم النظام بإرسال إشعار فوري لممثلي الإدارة أو الأخصائيين المنسقين لتيسير الاتصال الداخلي الموحد لغرفة مكة المكرمة.
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold mb-1">نص الرسالة للمشاركة المباشرة</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. الزملاء الأعزاء، تم تدوين واعتماد محضر لجنة المقاولات والتشييد وبدء رصد التوصيات لإرسالها."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand text-white font-black text-xs rounded-xl hover:bg-brand/90 cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand/15"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>إرسال وتحديث رسائل Google Chat</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 9: GOOGLE FORMS */}
          {activeTab === "forms" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-gray-150 pb-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h4 className="text-gray-900 font-extrabold text-xs">بناء وتكوين النماذج الرقمية للاستبيانات (Google Forms API)</h4>
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-normal">
                أنشئ وصمم استبيانات قياس جودة ونماذج التسجيل في اللقاءات وورش العمل للجان القطاعية، ثم استقبل ونظم الردود في جدول Sheets المتصل بها تلقائياً.
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <h5 className="font-extrabold text-xs text-gray-900">تكوين نموذج قياس الجودة ورضا الأعضاء على Google Forms</h5>
                  <p className="text-[10px] text-gray-400 mt-1">توليد نموذج استبيان رسمي باسم غرفة مكة وتفاصيلها الفنية بنقرة واحدة</p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateForm}
                  disabled={loading}
                  className="bg-brand text-white font-black text-[11px] px-5 py-2.5 rounded-xl hover:bg-brand/90 transition-all cursor-pointer shadow-md shadow-brand/10 self-start sm:self-auto"
                >
                  تصميم النموذج وتوليد الرابط السحابي
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
