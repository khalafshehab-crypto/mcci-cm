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
  completedEvts: number;
  meetingsEvts: number;
  gatheringsEvts: number;
  workshopsEvts: number;
  visitsEvts: number;
  apprecCases: number;
}


const getEventKindStr = (rawTitle: string) => {
  if (!rawTitle) return "فعالية";
  const title = rawTitle.trim();
  if (title.startsWith("اجتماع") || title.includes("اجتماع")) return "اجتماع";
  if (title.startsWith("لقاء") || title.includes("لقاء")) return "لقاء";
  if (title.startsWith("زيارة") || title.includes("زيارة")) return "زيارة";
  if (title.startsWith("استضافة") || title.includes("استضافة")) return "استضافة";
  if (title.startsWith("ورشة عمل") || title.includes("ورشة عمل")) return "ورشة عمل";
  if (title.startsWith("ندوة") || title.includes("ندوة")) return "ندوة";
  if (title.startsWith("حفل") || title.includes("حفل")) return "حفل";
  if (title.startsWith("تدشين") || title.includes("تدشين")) return "تدشين";
  return "فعالية";
};

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
      const completedEvts = evts.filter(e => {
        const stepValues = [
          !!e.committeeConfirmed,
          !!e.invitationSent,
          !!e.attendanceConfirmed,
          !!e.preparationsConfirmed,
          !!(e.agenda && e.agenda.length > 0 && e.agendaTransferred),
          !!e.minutesSaved,
          !!e.exportedRecommendationsToPage
        ];
        const st = (e.status || "").trim();
        return stepValues.filter(Boolean).length === 7 || st.includes("منته") || st.includes("مكتمل") || st.includes("منجز") || st.includes("مؤكد");
      }).length;
      const meetingsEvts = evts.filter(e => e.type === "اجتماع" || getEventKindStr(e.title) === "اجتماع" || getEventKindStr(e.eventName) === "اجتماع").length;
      const gatheringsEvts = evts.filter(e => e.type === "لقاء" || getEventKindStr(e.title) === "لقاء" || getEventKindStr(e.eventName) === "لقاء").length;
      const workshopsEvts = evts.filter(e => e.type === "ورشة عمل" || getEventKindStr(e.title) === "ورشة عمل" || getEventKindStr(e.eventName) === "ورشة عمل").length;
      const visitsEvts = evts.filter(e => e.type === "زيارة" || getEventKindStr(e.title) === "زيارة" || getEventKindStr(e.eventName) === "زيارة").length;

      const mbrs = membersSnap.docs.map(d => d.data());
      const totalMbrs = mbrs.length;
      const activeMbrs = mbrs.filter(m => m.active === true).length;
      const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
      const womenMbrs = mbrs.filter(m => {
          const title = (m.title || "").trim();
          const name = (m.name || "").trim();
          const customTitle = (m.customTitle || "").trim();
          const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
          if (womenTitles.includes(title)) return true;
          if (title === "غير ذلك" && customTitle.endsWith("ة")) return true;
          if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
          
          // Additional heuristic: some common female names inside the string
          const femaleNames = ["سمر", "فاطمة", "أمل", "سارة", "خديجة", "نورة", "مها", "عبير", "ريم", "هند", "ندى", "بشاير", "عهود", "نوف", "روان", "امجاد"];
          for (let fn of femaleNames) {
              if (name.includes(fn)) return true;
          }
          return false;
        }).length;
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

console.log("Events array from DB in useDashboardStats:", evts.slice(0, 3));
      setStats({
        totalComms, activeComms, inactiveComms, approvedPlans,
        totalMbrs, activeMbrs, menMbrs, womenMbrs,
        totalRecs, completedRecs, activeRecs, delayedRecs,
        totalTsks, completedTsks, activeTsks,
        totalEvts, completedEvts, meetingsEvts, gatheringsEvts, workshopsEvts, visitsEvts,
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
