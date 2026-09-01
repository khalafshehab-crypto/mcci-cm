import { useEffect, useRef } from "react";
import { collection, onSnapshot, query, db } from "../lib/firebase";
import { showGlobalToast } from "../lib/toastUtils";

export function GlobalNotificationListener() {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Only set up listeners once after initial mount to prevent a flood of old notifications
    const timeout = setTimeout(() => {
      isFirstLoad.current = false;
    }, 5000); // 5 seconds wait to skip initial load

    const qTasks = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(qTasks, (snapshot: any) => {
      if (isFirstLoad.current) return;
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          const task = change.doc.data();
          showGlobalToast(`🔔 تم تكليفك بمهمة جديدة: ${task.title || "مهمة"}`, "success");
        }
      });
    });

    const qRecs = query(collection(db, "recommendations"));
    const unsubRecs = onSnapshot(qRecs, (snapshot: any) => {
      if (isFirstLoad.current) return;
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          const rec = change.doc.data();
          showGlobalToast(`💡 تكليف بتوصية: ${rec.text?.substring(0,30) || rec.title || "توصية"}...`, "success");
        }
      });
    });

    return () => {
      clearTimeout(timeout);
      unsubTasks();
      unsubRecs();
    };
  }, []);

  return null;
}
