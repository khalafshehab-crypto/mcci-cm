import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Calendar, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, where, onSnapshot } from "../lib/firebase";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";

interface NotificationItem {
  id: string;
  type: "task" | "event" | "recommendation";
  title: string;
  message: string;
  date: string;
  isUrgent: boolean;
  link: string;
  rawDocId: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load dismissed from local storage
  useEffect(() => {
    const stored = localStorage.getItem("dismissed_notifications");
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const saveDismissed = (ids: string[]) => {
    setDismissedIds(ids);
    localStorage.setItem("dismissed_notifications", JSON.stringify(ids));
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    saveDismissed([...dismissedIds, id]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("current_user");
    if (!userStr || !db || db.type === "dummy_firestore") return;
    
    let user: any = null;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      return;
    }

    const userName = user.name;
    const userCommittees = user.committees || [];

    // 1. Listen to tasks assigned to user (جديدة or متأخرة)
    const qTasks = query(
      collection(db, "tasks"),
      where("assignedTo", "==", userName)
    );

    const unsubTasks = onSnapshot(qTasks, (snap: any) => {
      const activeTasks: NotificationItem[] = [];
      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (data.status === "جديدة" || data.status === "متأخرة") {
          const isUrgent = data.status === "متأخرة" || data.priority === "عاجلة";
          activeTasks.push({
            id: `task_${docSnap.id}`,
            type: "task",
            title: data.title || "مهمة إدارية",
            message: data.status === "متأخرة" ? "لديك مهمة متأخرة تحتاج لإنجاز" : "تم تكليفك بمهمة جديدة",
            date: data.dueDate || "",
            isUrgent,
            link: "/tasks",
            rawDocId: docSnap.id
          });
        }
      });
      setNotifications(prev => {
        const filtered = prev.filter(p => p.type !== "task");
        return [...filtered, ...activeTasks];
      });
    });

    // 2. Listen to recommendations assigned to user (جديدة or متأخرة)
    const qRecs = query(
      collection(db, "recommendations"),
      where("assignedTo", "==", userName)
    );

    const unsubRecs = onSnapshot(qRecs, (snap: any) => {
      const activeRecs: NotificationItem[] = [];
      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (data.status === "جديدة" || data.status === "متأخرة") {
          activeRecs.push({
            id: `rec_${docSnap.id}`,
            type: "recommendation",
            title: data.text || "توصية جديدة",
            message: data.status === "متأخرة" ? "لديك توصية متأخرة تحتاج لتحديث" : "تم تكليفك بتنفيذ توصية جديدة",
            date: data.dueDate || "",
            isUrgent: data.status === "متأخرة",
            link: "/recommendations",
            rawDocId: docSnap.id
          });
        }
      });
      setNotifications(prev => {
        const filtered = prev.filter(p => p.type !== "recommendation");
        return [...filtered, ...activeRecs];
      });
    });

    // 4. Listen to system alerts explicitly targeted to the user
    const qAlerts = query(
      collection(db, "system_alerts"),
      where("targetUser", "==", userName)
    );

    const unsubAlerts = onSnapshot(qAlerts, (snap: any) => {
      const activeAlerts: NotificationItem[] = [];
      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        activeAlerts.push({
          id: `alert_${docSnap.id}`,
          type: data.type || "alert",
          title: data.title || "تنبيه",
          message: data.message || "",
          date: data.createdAt || new Date().toISOString(),
          isUrgent: true,
          link: data.link || "#",
          rawDocId: docSnap.id
        });
      });
      setNotifications(prev => {
        const filtered = prev.filter(p => !p.id.startsWith("alert_"));
        return [...filtered, ...activeAlerts];
      });
    });

    // 3. Listen to events for user's committees (coming in 7 days)
    const qEvents = query(
      collection(db, "events"),
      where("status", "in", ["مجدولة", "محجوز", "مؤكد"])
    );

    const unsubEvents = onSnapshot(qEvents, (snap: any) => {
      const activeEvents: NotificationItem[] = [];
      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);

      snap.forEach((docSnap: any) => {
        const data = docSnap.data();
        // Check if event belongs to user committees
        if (userCommittees.includes(String(data.committeeId))) {
          if (data.date) {
            const evtDate = new Date(data.date);
            if (evtDate >= now && evtDate <= in7Days) {
              activeEvents.push({
                id: `evt_${docSnap.id}`,
                type: "event",
                title: data.title || data.eventName || "فعالية قادمة",
                message: `اقترب موعد الفعالية: ${data.date}`,
                date: data.date,
                isUrgent: true,
                link: "/events",
                rawDocId: docSnap.id
              });
            }
          }
        }
      });
      setNotifications(prev => {
        const filtered = prev.filter(p => p.type !== "event");
        return [...filtered, ...activeEvents];
      });
    });

    return () => {
      unsubTasks();
      unsubRecs();
      unsubEvents();
      unsubAlerts();
    };
  }, []);

  const displayNotifs = notifications
    .filter(n => !dismissedIds.includes(n.id))
    .sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  const unreadCount = displayNotifs.length;

  const getIcon = (type: string) => {
    switch (type) {
      case "task": return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case "recommendation": return <FileText className="w-5 h-5 text-amber-500" />;
      case "event": return <Calendar className="w-5 h-5 text-brand" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-[90vw] max-w-sm sm:w-96 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-right"
            style={{ direction: "rtl" }}
          >
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand" />
                مركز التنبيهات
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-brand/10 text-brand px-2 py-1 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {displayNotifs.length === 0 ? (
                <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500 flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-600">لا توجد تنبيهات جديدة</p>
                  <p className="text-[10px] text-gray-400 mt-1">لقد قمت بمتابعة جميع مهامك بنجاح</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {displayNotifs.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      onClick={() => setIsOpen(false)}
                      className={`block p-3 hover:bg-gray-50 transition-colors group relative ${notif.isUrgent ? "bg-red-50/30" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          notif.type === "task" ? "bg-blue-50" : 
                          notif.type === "event" ? "bg-brand/10" : "bg-amber-50"
                        }`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate pr-1">
                            {notif.title}
                          </p>
                          <p className={`text-[10px] font-semibold mt-1 line-clamp-1 pr-1 ${notif.isUrgent ? "text-red-600" : "text-gray-500"}`}>
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-gray-400 font-mono mt-1.5 block pr-1">
                            {notif.date}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleDismiss(e, notif.id)}
                          className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                          title="إهمال"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
