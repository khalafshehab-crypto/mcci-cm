
const ordinalsToNum = {
  "التأسيسي": "1", "الأول": "1", "الثاني": "2", "الثالث": "3", "الرابع": "4", "الخامس": "5",
  "السادس": "6", "السابع": "7", "الثامن": "8", "التاسع": "9", "العاشر": "10",
  "الحادي عشر": "11", "الثاني عشر": "12", "الثالث عشر": "13", "الرابع عشر": "14", "الخامس عشر": "15",
  "السادس عشر": "16", "السابع عشر": "17", "الثامن عشر": "18", "التاسع عشر": "19", "العشرون": "20"
};

const getMeetingNumber = (title) => {
  if (!title) return "1";
  for (const [key, val] of Object.entries(ordinalsToNum)) {
    if (title.includes(` ${key} `) || title.endsWith(` ${key}`) || title.includes(`(${key})`)) {
      return val;
    }
  }
  const match = title.match(/(\d+)/);
  if (match) return match[1];
  return "1";
};

const getCommitteeAbbrev = (name) => {
  if (!name) return "عام";
  const words = name.split(/\s+/).filter(w => !['و', 'في', 'من', 'عبر', 'على', 'لجنة'].includes(w));
  return words.map(w => w.replace(/^ال/, '')[0]).join(' ');
};

const getItemNumber = (recTitle) => {
    const match = recTitle.match(/توصية البند (.*?) "/);
    if (match && match[1]) {
        return ordinalsToNum[match[1]] || "1";
    }
    return "1";
}

const getYearStr = (dateStr) => {
    if (!dateStr) return "26";
    const year = new Date(dateStr).getFullYear();
    if (isNaN(year)) return "26";
    return year.toString().slice(-2);
}

const generateRecNumber = (evt) => {
    const cAbbrev = getCommitteeAbbrev(evt.committeeName || "");
    const mNum = getMeetingNumber(evt.eventName || "");
    const iNum = getItemNumber(evt.title || "");
    const yr = getYearStr(evt.date);
    return `ل ${cAbbrev}-${mNum}-${iNum}-${yr}`;
}

console.log(generateRecNumber({
    committeeName: "لجنة الحج والعمرة",
    eventName: "اجتماع لجنة الحج والعمرة الدوري الأول (التأسيسي)",
    title: 'توصية البند الأول "دراسة المشاكل"',
    date: "2026-06-11"
}));

console.log(generateRecNumber({
    committeeName: "لجنة الحج والعمرة",
    eventName: "اجتماع لجنة الحج والعمرة الدوري الأول (التأسيسي)",
    title: 'توصية البند الثاني "اعتماد الميزانية"',
    date: "2026-06-11"
}));
