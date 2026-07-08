const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // getEventKindStr
  const oldGetKind = `  const getEventKindStr = (title: string) => {
    if (title.startsWith("اجتماع")) return "اجتماع";
    if (title.startsWith("لقاء")) return "لقاء";
    if (title.startsWith("زيارة")) return "زيارة";
    if (title.startsWith("استضافة")) return "استضافة";
    if (title.startsWith("ورشة عمل")) return "ورشة عمل";
    if (title.startsWith("ندوة")) return "ندوة";
    if (title.startsWith("حفل")) return "حفل";
    if (title.startsWith("تدشين")) return "تدشين";
    if (title.startsWith("إطلاق مبادرة")) return "إطلاق مبادرة";
    if (title.startsWith("توقيع اتفاقية")) return "توقيع اتفاقية";
    return "فعالية";
  };`;

  const newGetKind = `  const getEventKindStr = (title: string) => {
    if (title.startsWith("اجتماع")) return "اجتماع";
    if (title.startsWith("لقاء")) return "لقاء";
    if (title.startsWith("زيارة")) return "زيارة";
    if (title.startsWith("استضافة")) return "استضافة";
    if (title.startsWith("ورشة عمل")) return "ورشة عمل";
    if (title.startsWith("ندوة")) return "ندوة";
    if (title.startsWith("حفل")) return "حفل";
    if (title.startsWith("تدشين")) return "تدشين";
    if (title.startsWith("إطلاق مبادرة")) return "إطلاق مبادرة";
    if (title.startsWith("توقيع اتفاقية")) return "توقيع اتفاقية";
    if (title.startsWith("معرض")) return "معرض";
    if (title.startsWith("دورة تدريبية") || title.startsWith("دورة")) return "دورة تدريبية";
    if (title.startsWith("ملتقى")) return "ملتقى";
    if (title.startsWith("منتدى")) return "منتدى";
    if (title.startsWith("محاضرة")) return "محاضرة";
    return "فعالية";
  };`;

  content = content.replace(oldGetKind, newGetKind);
  
  // getEventKindStyle
  const oldKindStyle = `  const getEventKindStyle = (title: string) => {
    const kind = getEventKindStr(title);
    switch (kind) {
      case "اجتماع": return "text-blue-800 bg-blue-100/80 border-blue-200";
      case "لقاء": return "text-emerald-800 bg-emerald-100/80 border-emerald-200";
      case "زيارة": return "text-indigo-800 bg-indigo-100/80 border-indigo-200";
      case "استضافة": return "text-pink-800 bg-pink-100/80 border-pink-200";
      case "ورشة عمل": return "text-amber-800 bg-amber-100/80 border-amber-200";
      case "ندوة": return "text-purple-800 bg-purple-100/80 border-purple-200";
      case "حفل": return "text-rose-800 bg-rose-100/80 border-rose-200";
      case "تدشين": return "text-cyan-800 bg-cyan-100/80 border-cyan-200";
      case "إطلاق مبادرة": return "text-lime-800 bg-lime-100/80 border-lime-200";
      case "توقيع اتفاقية": return "text-orange-800 bg-orange-100/80 border-orange-200";
      default: return "text-gray-800 bg-gray-100/80 border-gray-200";
    }
  };`;
  
  const newKindStyle = `  const getEventKindStyle = (title: string) => {
    const kind = getEventKindStr(title);
    switch (kind) {
      case "اجتماع": return "text-blue-800 bg-blue-100/80 border-blue-200";
      case "لقاء": return "text-emerald-800 bg-emerald-100/80 border-emerald-200";
      case "زيارة": return "text-indigo-800 bg-indigo-100/80 border-indigo-200";
      case "استضافة": return "text-pink-800 bg-pink-100/80 border-pink-200";
      case "ورشة عمل": return "text-amber-800 bg-amber-100/80 border-amber-200";
      case "ندوة": return "text-purple-800 bg-purple-100/80 border-purple-200";
      case "حفل": return "text-rose-800 bg-rose-100/80 border-rose-200";
      case "تدشين": return "text-cyan-800 bg-cyan-100/80 border-cyan-200";
      case "إطلاق مبادرة": return "text-lime-800 bg-lime-100/80 border-lime-200";
      case "توقيع اتفاقية": return "text-orange-800 bg-orange-100/80 border-orange-200";
      case "معرض": return "text-fuchsia-800 bg-fuchsia-100/80 border-fuchsia-200";
      case "دورة تدريبية": return "text-teal-800 bg-teal-100/80 border-teal-200";
      case "ملتقى": return "text-sky-800 bg-sky-100/80 border-sky-200";
      case "منتدى": return "text-violet-800 bg-violet-100/80 border-violet-200";
      case "محاضرة": return "text-yellow-800 bg-yellow-100/80 border-yellow-200";
      default: return "text-gray-800 bg-gray-100/80 border-gray-200";
    }
  };`;
  
  content = content.replace(oldKindStyle, newKindStyle);

  fs.writeFileSync(file, content);
}
console.log("Patched getEventKindStr successfully");
