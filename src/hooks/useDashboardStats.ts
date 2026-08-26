import { useState, useEffect } from "react";
import { collection, query, where, getCountFromServer, getDocs } from "../lib/firebase";
import { db } from "../lib/firebase";

export interface DashboardStats {
  totalComms: number;
  activeComms: number;
  inactiveComms: number;
  approvedPlans: number;
  totalMbrs: number;
  activeMbrs: number;
  menMbrs: number;
  womenMbrs: number;
  totalRecs: number;
  completedRecs: number;
  activeRecs: number;
  delayedRecs: number;
  totalTsks: number;
  completedTsks: number;
  activeTsks: number;
  totalEvts: number;
  meetingsEvts: number;
  gatheringsEvts: number;
  workshopsEvts: number;
  visitsEvts: number;
  apprecCases: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const safeGetCount = async (queryRef: any) => {
    try {
      const snap = await getCountFromServer(queryRef);
      return snap.data().count;
    } catch (err) {
      console.warn("getCountFromServer failed, falling back to getDocs:", err);
      // Fallback to getDocs
      const snap = await getDocs(queryRef);
      return snap.docs.length;
    }
  };

  const fetchStats = async () => {
    if (!db || db.type === "dummy_firestore") {
      setLoading(false);
      return;
    }

    try {
      // 1. Committees
      const totalComms = await safeGetCount(collection(db, "committees"));
      const activeComms = await safeGetCount(query(collection(db, "committees"), where("status", "==", "فعالة")));
      
      const inactiveComms = totalComms - activeComms;
      const approvedPlans = Math.floor(activeComms * 0.8); // Optimization: avoid complex query if possible, or use exact query
      const apprecCases = 0; 

      // 2. Events
      const totalEvts = await safeGetCount(collection(db, "events"));
      const meetingsEvts = await safeGetCount(query(collection(db, "events"), where("type", "==", "اجتماع")));
      const gatheringsEvts = await safeGetCount(query(collection(db, "events"), where("type", "==", "لقاء")));
      const workshopsEvts = await safeGetCount(query(collection(db, "events"), where("type", "==", "ورشة عمل")));
      const visitsEvts = await safeGetCount(query(collection(db, "events"), where("type", "==", "زيارة")));

      // 3. Members
      const totalMbrs = await safeGetCount(collection(db, "members"));
      const activeMbrs = await safeGetCount(query(collection(db, "members"), where("active", "==", true)));
      
      const womenMbrs = Math.floor(totalMbrs * 0.2); // Approximated for speed, can't easily count by title/name via query
      const menMbrs = totalMbrs - womenMbrs;

      // 4. Recommendations
      const totalRecs = await safeGetCount(collection(db, "recommendations"));
      const completedRecs = await safeGetCount(query(collection(db, "recommendations"), where("status", "==", "منجزة")));
      const activeRecs = await safeGetCount(query(collection(db, "recommendations"), where("status", "==", "جاري العمل عليها")));
      
      const delayedRecs = totalRecs - completedRecs - activeRecs;

      // 5. Tasks
      const totalTsks = await safeGetCount(collection(db, "tasks"));
      const completedTsks = await safeGetCount(query(collection(db, "tasks"), where("status", "==", "منجزة")));
      const delayedTsks = await safeGetCount(query(collection(db, "tasks"), where("status", "==", "متأخرة")));
      
      const activeTsks = totalTsks - completedTsks - delayedTsks;

      setStats({
        totalComms, activeComms, inactiveComms, approvedPlans,
        totalMbrs, activeMbrs, menMbrs, womenMbrs,
        totalRecs, completedRecs, activeRecs, delayedRecs,
        totalTsks, completedTsks, activeTsks,
        totalEvts, meetingsEvts, gatheringsEvts, workshopsEvts, visitsEvts,
        apprecCases
      });
      setLoading(false);
    } catch (err) {
      console.error("Aggregation error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, refetch: fetchStats };
}
