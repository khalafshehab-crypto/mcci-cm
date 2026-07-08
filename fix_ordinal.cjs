const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesEvents.tsx', 'utf8');

const getArabicOrdinalGlobal = `
const getArabicOrdinalGlobal = (n) => {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return typeof n === "string" ? n : n.toString();
  const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
  if (num >= 0 && num <= 10) return ordinals[num];
  return num.toString();
};
`;

content = content.replace('const DAYSMaps: Record<string, number>', getArabicOrdinalGlobal + '\nconst DAYSMaps: Record<string, number>');

content = content.replace(/getArabicOrdinal\(/g, 'getArabicOrdinalGlobal(');

fs.writeFileSync('src/pages/CommitteesEvents.tsx', content, 'utf8');
console.log('Fixed ordinal scope');
