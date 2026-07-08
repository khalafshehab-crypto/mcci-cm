const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

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
    if (title.startsWith("معرض")) return "معرض";
    if (title.startsWith("دورة تدريبية") || title.startsWith("دورة")) return "دورة تدريبية";
    if (title.startsWith("ملتقى")) return "ملتقى";
    if (title.startsWith("منتدى")) return "منتدى";
    if (title.startsWith("محاضرة")) return "محاضرة";
    return "فعالية";
  };`;

  const newGetKind = `  const getEventKindStr = (rawTitle: string) => {
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

  content = content.replace(oldGetKind, newGetKind);
  fs.writeFileSync(file, content);
}
console.log("Patched getEventKindStr again successfully");
