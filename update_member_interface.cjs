const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const oldInterface = `interface Member {
  id: number;
  title: string; // "الأستاذ" | "الأستاذة" | "المهندس" | "المهندسة" | "الدكتور" | "الدكتورة" | "غير ذلك"
  customTitle?: string;
  name: string; // الاسم الثلاثي
  role: string; // "رئيس" | "نائب" | "عضو" | "مشارك"
  committeeId: number | string;
  committeeName: string;
  joiningMechanism: string;`;

const newInterface = `interface Member {
  id: number;
  title: string; // "الأستاذ" | "الأستاذة" | "المهندس" | "المهندسة" | "الدكتور" | "الدكتورة" | "غير ذلك"
  customTitle?: string;
  name: string; // الاسم الثلاثي
  role: string; // "رئيس" | "نائب" | "عضو" | "مشارك"
  committeeId: number | string;
  committeeName: string;
  secondaryCommitteeId?: number | string;
  secondaryCommitteeName?: string;
  joiningMechanism: string;`;

if (code.includes('committeeId: number | string;')) {
  code = code.replace(oldInterface, newInterface);
  fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
  console.log("Interface updated");
} else {
  console.log("Could not update interface");
}
