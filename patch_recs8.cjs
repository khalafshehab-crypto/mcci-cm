const fs = require('fs');
let code = fs.readFileSync('src/pages/Recommendations.tsx', 'utf8');

code = code.replace('\\nexport default function Recommendations() {', 'export default function Recommendations() {');
code = code.replace('\\nexport default function Events() {', 'export default function Events() {');

const ordDef = `
const getArabicOrdinalGlobal = (n: number | string): string => {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return typeof n === "string" ? n : n.toString();
  const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
  if (num >= 0 && num <= 20) return ordinals[num];
  return num.toString();
};
`;

if (!code.includes('const getArabicOrdinalGlobal =')) {
   code = code.replace('export default function Events() {', ordDef + '\nexport default function Events() {');
}

fs.writeFileSync('src/pages/Recommendations.tsx', code);
