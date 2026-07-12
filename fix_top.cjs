const fs = require('fs');

const topText = `import React, { useState, useEffect, FormEvent, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users2, 
  Search, 
  Plus, 
  X, 
  Users, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Trash2,
  Check,
  ChevronLeft,
  Settings2,
  Edit2,
  Save,
  Download,
  MoreVertical,
  Activity,
  AlertCircle
} from "lucide-react";
import { generateDocx } from "../lib/docxGenerator";

export interface Committee {
  id: number | string;
  name: string;
  description: string;
  membersCount: number;
  meetingsCount: number;
  recommendationsCount: number;
  eventsCount: number;
  president?: string;
  specialist?: string;
  status: "فعالة" | "غير فعالة";
  active?: boolean;
  libraryLink?: string;
  objectives?: string;
  attachments?: any[];
  strategicPlan?: string;
}

const EMPLOYEES = [
  "مدير النظام",
];

import { useFirestoreCollection } from '../lib/firebaseUtils';
import { cascadeCommitteeRename, cascadeCommitteeDelete } from '../lib/cascadeUpdates';

const advancedMatch = (commName: string, targetName: string) => {
  if (!commName || !targetName) return false;
  const clean = (s: string) => s.replace(/لجنة/g, "").replace(/الـ/g, "").replace(/ال/g, "").replace(/\\s+/g, " ").trim();
  const c1 = clean(commName);
  const c2 = clean(targetName);
  if (c1.includes(c2) || c2.includes(c1)) return true;
  const w1 = c1.split(" ").filter(w => w.length >= 3);
  const w2 = c2.split(" ").filter(w => w.length >= 3);
  return w1.some(word => w2.some(other => other.includes(word) || word.includes(other)));
};

function CommitteeDetailsModalContent({ detailsComm, setDetailsComm, handleOpenEdit, handleOpenDelete, dbMembers, dbEvents, dbRecs }: any) {
  const [showAllMembers, setShowAllMembers] = React.useState(false);

  const commMembers = (dbMembers || []).filter((m: any) => String(m.committeeId) === String(detailsComm.id) || advancedMatch(m.committeeName, detailsComm.name));
  const commEvents = (dbEvents || []).filter((e: any) => (String(e.committeeId) === String(detailsComm.id) || advancedMatch(e.committeeName, detailsComm.name)) && !e.recommendationClassification);
  const realMeetingsCount = commEvents.filter((e: any) => e.title && e.title.includes("اجتماع")).length;
  const realEventsCount = commEvents.filter((e: any) => e.title && !e.title.includes("اجتماع")).length;

  let allRecsModal = dbRecs ? [...dbRecs] : [];
  const agendaRecsModal: any[] = [];
  (dbEvents || []).forEach((evt: any) => {
    if (evt && evt.agenda && Array.isArray(evt.agenda)) {
      evt.agenda.forEach((item: any, index: number) => {
        if (item.recommendation && item.recommendation.trim() !== "" && !item.inactiveRecommendation) {
          agendaRecsModal.push({
            id: \`custom-rec-\${evt.id}-\${item.id || index}\`,
            eventId: evt.id,
            committeeId: evt.committeeId,
            title: item.recommendation,
            committeeName: evt.committeeName || "لجنة غير محددة",
            eventName: evt.title,
            status: "جديدة"
          });
        }
      });
    }
  });

  const mappedDbMapModal = new Map();
  allRecsModal.forEach((r: any) => mappedDbMapModal.set(String(r.id), r));
  
  agendaRecsModal.forEach((ar: any) => {
    if (!mappedDbMapModal.has(ar.id)) {
       allRecsModal.push(ar);
    } else {
       const existing = mappedDbMapModal.get(ar.id);
       existing.eventId = existing.eventId || ar.eventId;
       existing.committeeId = existing.committeeId || ar.committeeId;
       existing.committeeName = existing.committeeName || ar.committeeName;
       existing.eventName = existing.eventName || ar.eventName;
    }
  });

  const commRecs = allRecsModal.filter((r: any) => {
     if (!r) return false;
     const belongsByName = advancedMatch(r.committeeName || r.dept, detailsComm.name);
     const belongsById = String(r.committeeId) === String(detailsComm.id);
     const ev = (dbEvents || []).find((e: any) => String(e.id) === String(r.eventId) || (r.eventName && e.title === r.eventName));
     const belongsViaEvent = ev && (String(ev.committeeId) === String(detailsComm.id) || advancedMatch(ev.committeeName, detailsComm.name));
     return belongsByName || belongsById || belongsViaEvent;
  });
`;

let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// The file currently starts with "        }      });    }  });    const mappedDbMapModal = new Map();"
// Let's remove everything before the first "  return (" which is for the component rendering
const returnIdx = code.indexOf('  return (\n    <div className="fixed inset-0');
if (returnIdx !== -1) {
    code = code.substring(returnIdx);
    code = topText + "\n" + code;
    fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
} else {
    console.log("Could not find the start of the return statement!");
}
