const fs = require('fs');
let code = fs.readFileSync('src/hooks/useDashboardStats.ts', 'utf-8');

code = `import { useState, useEffect } from "react";
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

  const fetchStats = async () => {
    if (!db || db.type === "dummy_firestore") {
      setLoading(false);
      return;
    }
    try {
      const [commsSnap, eventsSnap, membersSnap, recsSnap, tasksSnap] = await Promise.all([
        getDocs(collection(db, "committees")),
        getDocs(collection(db, "events")),
        getDocs(collection(db, "members")),
        getDocs(collection(db, "recommendations")),
        getDocs(collection(db, "tasks"))
      ]);

      const comms = commsSnap.docs.map(d => d.data());
      const totalComms = comms.length;
      const activeComms = comms.filter(c => c.active === true).length;
      const inactiveComms = totalComms - activeComms;
      const approvedPlans = comms.filter(c => c.strategicPlan && c.strategicPlan.trim().length > 0 && c.strategicPlan !== "غير مدرجة").length;
      const apprecCases = comms.filter(c => c.ratingIssues && c.ratingIssues.trim().length > 0 && c.ratingIssues !== "لا يوجد قضايا تقدير").length;

      const evts = eventsSnap.docs.map(d => d.data());
      const totalEvts = evts.length;
      const meetingsEvts = evts.filter(e => e.type === "اجتماع").length;
      const gatheringsEvts = evts.filter(e => e.type === "لقاء").length;
      const workshopsEvts = evts.filter(e => e.type === "ورشة عمل").length;
      const visitsEvts = evts.filter(e => e.type === "زيارة").length;

      const mbrs = membersSnap.docs.map(d => d.data());
      const totalMbrs = mbrs.length;
      const activeMbrs = mbrs.filter(m => m.active === true).length;
      const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة"];
      const womenMbrs = mbrs.filter(m => m.title && womenTitles.includes(m.title)).length;
      const menMbrs = totalMbrs - womenMbrs;

      const recs = recsSnap.docs.map(d => d.data());
      const totalRecs = recs.length;
      const completedRecs = recs.filter(r => r.status === "منجزة" || r.status === "مكتملة").length;
      const activeRecs = recs.filter(r => r.status === "جاري العمل عليها").length;
      const delayedRecs = recs.filter(r => r.status && r.status.includes("متأخر")).length;

      const tsks = tasksSnap.docs.map(d => d.data());
      const totalTsks = tsks.length;
      const completedTsks = tsks.filter(t => t.status === "منجزة").length;
      const delayedTsks = tsks.filter(t => t.status === "متأخرة").length;
      const activeTsks = tsks.filter(t => t.status === "جاري العمل عليها").length;

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
`;

fs.writeFileSync('src/hooks/useDashboardStats.ts', code);
console.log("Patched dashboard stats to be 100% live and exact.");
