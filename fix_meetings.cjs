const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesHome.tsx', 'utf8');

const targetStr = `const meetings = (dbEvents || []).map((e: any) => ({ ...e, dateObj: e.date ? new Date(e.date) : new Date(0) }));`;

const replacementStr = `const getDayName = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[d.getDay()];
  };

  const getMonthName = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    return months[d.getMonth()];
  };

  const meetings = (dbEvents || []).map((e: any) => {
    const dObj = e.date ? new Date(e.date) : new Date(0);
    return { 
      ...e, 
      dateObj: dObj,
      event: e.title || "بدون عنوان",
      section: e.committeeName || "جهة غير محددة",
      dept: e.type || "فعالية",
      responsible: (e.employees && e.employees.length > 0) ? e.employees[0] : "غير محدد",
      room: e.location || "غير محدد",
      day: getDayName(e.date),
      monthName: getMonthName(e.date),
      category: "event"
    };
  });`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/CommitteesHome.tsx', code);
  console.log("Fixed meetings map in CommitteesHome");
} else {
  console.log("Could not find target string in CommitteesHome");
}
