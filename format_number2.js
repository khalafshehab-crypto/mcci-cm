const getCommitteeAbbrev = (name) => {
  if (!name) return "عام";
  const words = name.replace(/و/g, ' ').split(/\s+/).filter(w => w.trim() !== '' && !['في', 'من', 'عبر', 'على', 'لجنة', 'اللجنة', 'قطاع'].includes(w));
  return 'ل ' + words.map(w => w.replace(/^ال/, '')[0]).join(' ');
};

console.log(getCommitteeAbbrev("لجنة الحج والعمرة"));
console.log(getCommitteeAbbrev("لجنة ريادة الأعمال"));
console.log(getCommitteeAbbrev("اللجنة العقارية"));
