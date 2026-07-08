const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx',
  'src/pages/Recommendations.tsx',
  'src/pages/CommitteesRecommendations.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  const regex = /const getEventKindStr = \([^)]+\) => \{[\s\S]*?return "فعالية";\n  };/;
  
  const newGetKind = `const getEventKindStr = (rawTitle: string) => {
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
    if (title.startsWith("إطلاق مبادرة") || title.includes("إطلاق مبادرة")) return "إطلاق مبادرة";
    if (title.startsWith("توقيع اتفاقية") || title.includes("توقيع اتفاقية")) return "توقيع اتفاقية";
    if (title.startsWith("معرض") || title.includes("معرض")) return "معرض";
    if (title.startsWith("دورة تدريبية") || title.startsWith("دورة") || title.includes("دورة")) return "دورة تدريبية";
    if (title.startsWith("ملتقى") || title.includes("ملتقى")) return "ملتقى";
    if (title.startsWith("منتدى") || title.includes("منتدى")) return "منتدى";
    if (title.startsWith("محاضرة") || title.includes("محاضرة")) return "محاضرة";
    return "فعالية";
  };`;

  if (regex.test(content)) {
      content = content.replace(regex, newGetKind);
      fs.writeFileSync(file, content);
      console.log("Patched getEventKindStr in " + file);
  } else {
      console.log("Could not find getEventKindStr in " + file);
  }

  const styleRegex = /const getEventKindStyle = \([^)]+\) => \{[\s\S]*?return "text-gray-800 bg-gray-100\/80 border-gray-200";\n    \}\n  \};/;
  const newStyle = `const getEventKindStyle = (title: string) => {
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

  if (styleRegex.test(content)) {
      content = content.replace(styleRegex, newStyle);
      fs.writeFileSync(file, content);
      console.log("Patched getEventKindStyle in " + file);
  }
}
