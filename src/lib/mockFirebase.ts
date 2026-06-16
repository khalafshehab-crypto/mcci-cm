// src/lib/mockFirebase.ts

// Global in-memory list of active reactive query subscriptions
const listeners: { [collectionName: string]: Array<(snapshot: any) => void> } = {};

// Helper to load collection from localStorage with institutional fallback seeds
export function getLocalCollection(collectionName: string): any[] {
  const dataStr = localStorage.getItem(`mock_db_${collectionName}`);
  if (!dataStr) {
    return getSeedData(collectionName);
  }
  try {
    return JSON.parse(dataStr);
  } catch (e) {
    return getSeedData(collectionName);
  }
}

// Helper to save collection to localStorage and notify all subscribers
export function saveLocalCollection(collectionName: string, data: any[]) {
  localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(data));
  const collectionListeners = listeners[collectionName] || [];
  collectionListeners.forEach(listener => {
    try {
      listener(makeSnapshot(data));
    } catch (e) {
      console.error("Error triggering mock listener for " + collectionName, e);
    }
  });
}

// Helper query mapper
function makeSnapshot(data: any[]) {
  return {
    docs: data.map(item => ({
      id: item.id || '',
      data: () => item
    }))
  };
}

// Seed data generators
function getSeedData(collectionName: string): any[] {
  let defaultData: any[] = [];
  if (collectionName === "employees") {
    defaultData = [
      {
        id: "221550",
        name: "خلف شهاب الدين",
        role: "SYS_ADMIN",
        roleAr: "مدير النظام",
        jobTitle: "مدير النظام والرقابة",
        phone: "+966558494158",
        email: "khalafshehab@gmail.com",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
        committees: ["الحج والعمرة", "الصناعية"],
        active: true,
        joinDate: "2024/01/15"
      },
      {
        id: "100200",
        name: "صالح بن محمد الحربي",
        role: "SPECIALIST",
        roleAr: "أخصائي لجان",
        jobTitle: "أخصائي لجان قطاعية",
        phone: "0554832991",
        email: "sales@makkahchamber.sa",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        committees: ["التغذية والإعاشة"],
        active: true,
        joinDate: "2025/03/10"
      }
    ];
  } else if (collectionName === "committees") {
    defaultData = [
      {
        id: "comm_1",
        name: "لجنة التغذية والإعاشة",
        description: "لجنة متخصصة بشؤون التموين والتغذية والإعاشة خلال مواسم الحج والعمرة غايتها تحسين تجربة الزوار وصناع الضيافة بمكة المكرمة.",
        goals: "تطوير منظومة الإعاشة الحديثة، تحسين معايير الجودة، وتحفيز الشراكات الاستراتيجية",
        specialistId: "100200",
        specialistName: "صالح بن محمد الحربي",
        status: "فعالة",
        driveLink: "",
        formationDecision: "قرار رقم 254-أ بشان تشكيل لجنة الإعاشة وتطوير الأعمال",
        memberApproval: "رقم 1092 معتمد من مجلس الإدارة",
        regulations: "اللائحة الموحدة للجان القطاعية مكة",
        guidelines: "دليل حماية وجودة أعمال التغذية والضيافة المطور",
        creationDate: "2025/03/20"
      },
      {
        id: "comm_2",
        name: "لجنة الحج والعمرة",
        description: "لجنة وطنية لمتابعة وتيسير شؤون حجاج بيت الله الحرام وتجويد الخدمات اللوجستية بمكة المكرمة والمشاعر المقدسة.",
        goals: "تعزيز كفاءة الفنادق السكنية، تطوير وسائل التنقل، وحوكمة المبادرات التطوعية",
        specialistId: "221550",
        specialistName: "خلف شهاب الدين",
        status: "فعالة",
        driveLink: "",
        formationDecision: "القرار الوزاري الموحد رقم 1289",
        memberApproval: "رقم 209 معتمد من معالي أمين عام الغرفة",
        regulations: "اللائحة العامة التأسيسية للجان الغرفة",
        guidelines: "الدليل الإرشادي لتحسين تجربة ضيوف الرحمن",
        creationDate: "2024/02/01"
      }
    ];
  } else if (collectionName === "members") {
    defaultData = [
      {
        id: "mem_1",
        name: "عبد الرحمن صالح الصبحي",
        title: "الأستاذ",
        jobTitle: "رئيس اللجنة",
        phone: "0559283741",
        email: "a.subhi@gmail.com",
        committeeName: "لجنة التغذية والإعاشة",
        membershipRole: "رئيس",
        joinMechanism: "مرشح",
        status: "فعالة",
        nationalId: "1083948291",
        attendedEvents: 5,
        assignedRecommendations: 2
      },
      {
        id: "mem_2",
        name: "سارة بنت خالد المطلق",
        title: "الدكتورة",
        jobTitle: "نائب رئيس اللجنة",
        phone: "0564938210",
        email: "s.mutlaq@makkahchamber.sa",
        committeeName: "لجنة التغذية والإعاشة",
        membershipRole: "نائب",
        joinMechanism: "توصية",
        recommendationType: "ممثل للقطاع",
        status: "فعالة",
        nationalId: "1049382716",
        attendedEvents: 4,
        assignedRecommendations: 3
      },
      {
        id: "mem_3",
        name: "فهد بن عبد العزيز السالم",
        title: "المهندس",
        jobTitle: "عضو اللجنة الفني",
        phone: "0504938271",
        email: "f.salem@makkahchamber.sa",
        committeeName: "لجنة التغذية والإعاشة",
        membershipRole: "عضو",
        joinMechanism: "معين",
        status: "فعالة",
        nationalId: "1062938472",
        attendedEvents: 6,
        assignedRecommendations: 1
      },
      {
        id: "mem_4",
        name: "أسامة بن علي العبد الله",
        title: "الأستاذ",
        jobTitle: "رئيس اللجنة الفخرية",
        phone: "0539182746",
        email: "o.abdullah@gmail.com",
        committeeName: "لجنة الحج والعمرة",
        membershipRole: "رئيس",
        joinMechanism: "مرشح",
        status: "فعالة",
        nationalId: "1092837465",
        attendedEvents: 3,
        assignedRecommendations: 2
      }
    ];
  } else if (collectionName === "events") {
    defaultData = [
      {
        id: "event_1",
        title: "اجتماع لجنة التغذية والإعاشة الدوري الأول",
        type: "اجتماع",
        committee: "لجنة التغذية والإعاشة",
        status: "دوري",
        employee: "صالح بن محمد الحربي",
        date: new Date().toISOString().split('T')[0],
        time: "10:30",
        room: "G2",
        priority: "مجدول",
        committeeConfirmed: true,
        invitationSent: true,
        attendanceConfirmed: true,
        preparationsConfirmed: true,
        agendaTransferred: true,
        minutesSaved: true,
        agenda: [
          { text: "مناقشة خطة الإعاشة والمقاصف لموسم رمضان المبارك", duration: "15 دقيقة" },
          { text: "استعراض الصعوبات والتحديات اللوجستية بالطرق المؤدية للحرم", duration: "25 دقيقة" }
        ],
        attendees: ["عبد الرحمن صالح الصبحي", "سارة بنت خالد المطلق", "فهد بن عبد العزيز السالم"]
      }
    ];
  } else if (collectionName === "recommendations") {
    defaultData = [
      {
        id: "rec_1",
        committee: "لجنة التغذية والإعاشة",
        eventTitle: "اجتماع لجنة التغذية والإعاشة الدوري الأول",
        text: "توصية عاجلة باعتماد اللائحة الصحية المطورة للمطابخ ومزودي الوجبات الموسمية بمكة المكرمة وتوزيعها على كافة الأطراف الفاعلة.",
        assignee: "فهد بن عبد العزيز السالم",
        duration: "30 يوم",
        status: "جاري العمل عليها",
        stage: "رئيس قسم",
        history: [
          { status: "توصية جديدة", changer: "صالح بن محمد الحربي", date: "2026/06/15" },
          { status: "جاري العمل عليها (رئيس قسم)", changer: "رئيس القسم المعتمد", date: "2026/06/16" }
        ],
        attachments: []
      }
    ];
  } else if (collectionName === "tasks") {
    defaultData = [
      {
        id: "task_1",
        title: "إعداد التقرير الربعي لأداء اللجان وتقديمه للأمانة العامة",
        creator: "خلف شهاب الدين",
        assignee: "صالح بن محمد الحربي",
        dueDate: "2026/06/30",
        priority: "عالية",
        status: "جاري العمل عليها",
        comments: "يرجى حصر كافة اجتماعات وتوصيات شهر مايو الماضي وتنزيلها من المحاضر المفعّلة",
        delayDuration: "",
        escalated: false
      }
    ];
  } else if (collectionName === "system_logs") {
    defaultData = [
      {
        id: "log_1",
        employeeName: "خلف شهاب الدين",
        time: "2026-06-16 11:20:15",
        operationType: "تسجيل دخول / انضمام",
        status: "ناجحة",
        details: "تسجيل دخول ناجح بصلاحية مدير النظام"
      }
    ];
  } else if (collectionName === "templates") {
    defaultData = [
      {
        id: "temp_1",
        name: "نموذج خطة عمل اللجنة القطاعية السنوية",
        type: "مستندات",
        creator: "خلف شهاب الدين",
        googleWorkspaceUrl: "https://docs.google.com",
        description: "القالب المؤسسي الموحد لصياغة الأهداف السنوية وتوصيف المبادرات لكل لجنة قطاعية"
      },
      {
        id: "temp_2",
        name: "جدول حصر وإرسال التوصيات الهامة للجهات الخارجية",
        type: "جداول بيانات",
        creator: "خلف شهاب الدين",
        googleWorkspaceUrl: "https://sheets.google.com",
        description: "جدول منظم مخصص أسبوعيا لتلخيص ومراجعة حالات الإحالة لشركاء التنمية"
      }
    ];
  } else if (collectionName === "reports") {
    defaultData = [
      {
        id: "rep_1",
        title: "التقرير النصف السنوي لأعمال وإنجازات اللجان القطاعية لعام 2026",
        periodType: "ربع سنوي",
        creator: "خلف شهاب الدين",
        date: "2026/06/16",
        additionalFocusWords: "توصية، إعاشة، حج وعمرة، نمو الأعمال",
        reportsList: ["لجنة التغذية والإعاشة", "لجنة الحج والعمرة"],
        statistics: {
          totalCommittees: 2,
          totalMeetings: 1,
          totalRecommendations: 1,
          totalMembers: 4
        }
      }
    ];
  } else if (collectionName === "kpis") {
    defaultData = [
      {
        id: "kpi_1",
        title: "مؤشر التزام اللجان بالاجتماعات الدورية المجدولة",
        metricName: "بناء على نسبة الاجتماعات المنفذة إلى المجدولة",
        periodType: "شهري",
        creator: "خلف شهاب الدين",
        date: "2026/06/16",
        reportsList: ["لجنة التغذية والإعاشة"],
        targetValue: 100,
        currentValue: 85,
        rating: "ممتاز"
      }
    ];
  } else if (collectionName === "join_requests") {
    defaultData = [];
  } else if (collectionName === "approved_emails") {
    defaultData = [];
  }

  localStorage.setItem(`mock_db_${collectionName}`, JSON.stringify(defaultData));
  return defaultData;
}

// Full offline local session manager for Authentication
export const auth: any = {
  get currentUser() {
    try {
      const u = localStorage.getItem("current_user");
      if (u) {
        const parsed = JSON.parse(u);
        return {
          uid: parsed.id || '221550',
          email: parsed.email,
          displayName: parsed.name,
          emailVerified: true,
          photoURL: parsed.photo,
          providerData: []
        };
      }
    } catch(e) {}
    return null;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    const checkAuth = () => {
      try {
        const u = localStorage.getItem("current_user");
        if (u) {
          const parsed = JSON.parse(u);
          callback({
            uid: parsed.id || '221550',
            email: parsed.email,
            displayName: parsed.name,
            emailVerified: true,
            photoURL: parsed.photo,
            providerData: []
          });
        } else {
          callback(null);
        }
      } catch(e) {
        callback(null);
      }
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }
};

export const db: any = {
  type: "mock_firestore",
  app: {},
  toJSON: () => ({})
};

// Official API compliance structure
export function initializeApp(): any { return {}; }
export function getAuth(): any { return auth; }
export function getFirestore(): any { return db; }

export function collection(dbRef: any, collectionName: string): any {
  return { 
    type: 'collection', 
    name: collectionName,
    id: collectionName,
    path: collectionName,
    parent: null,
    withConverter: () => ({})
  };
}

export function doc(dbRef: any, nameOrPath: string, maybeId?: string): any {
  let colName = "";
  let id = "";
  if (maybeId) {
    colName = nameOrPath;
    id = String(maybeId);
  } else {
    const parts = nameOrPath.split('/');
    colName = parts[0];
    id = parts[1] || '';
  }
  return { 
    type: 'doc', 
    collectionName: colName, 
    id, 
    path: `${colName}/${id}`,
    firestore: db,
    converter: null
  };
}

export function query(collectionRef: any): any {
  return { type: 'query', collectionRef, name: collectionRef.name };
}

export async function addDoc(collectionRef: any, data: any): Promise<any> {
  const colName = collectionRef.name;
  const list = getLocalCollection(colName);
  const newId = `${colName.substring(0, 4)}_${Math.random().toString(36).substring(2, 11)}`;
  const item = { id: newId, ...data };
  list.push(item);
  saveLocalCollection(colName, list);
  return { id: newId, path: `${colName}/${newId}` };
}

export async function setDoc(docRef: any, data: any, options: any = {}): Promise<any> {
  const colName = docRef.collectionName;
  const list = getLocalCollection(colName);
  const targetId = String(docRef.id);
  const index = list.findIndex(item => String(item.id) === targetId);
  if (index >= 0) {
    if (options.merge) {
      list[index] = { ...list[index], ...data };
    } else {
      list[index] = { id: targetId, ...data };
    }
  } else {
    list.push({ id: targetId, ...data });
  }
  saveLocalCollection(colName, list);
}

export async function updateDoc(docRef: any, data: any): Promise<any> {
  return setDoc(docRef, data, { merge: true });
}

export async function deleteDoc(docRef: any): Promise<any> {
  const colName = docRef.collectionName;
  const list = getLocalCollection(colName);
  const targetId = String(docRef.id);
  const filtered = list.filter(item => String(item.id) !== targetId);
  saveLocalCollection(colName, filtered);
}

export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  const colName = queryOrColRef.type === 'query' 
    ? queryOrColRef.collectionRef.name 
    : queryOrColRef.name;

  if (!listeners[colName]) {
    listeners[colName] = [];
  }
  listeners[colName].push(onNext);

  // Load and deliver initial snapshot synchronously/immediately
  const currentData = getLocalCollection(colName);
  onNext(makeSnapshot(currentData));

  return () => {
    listeners[colName] = (listeners[colName] || []).filter(l => l !== onNext);
  };
}
