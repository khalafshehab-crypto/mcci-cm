const titles = [
  "معرض لجنة الحج والعمرة الأول",
  "فعالية معرض",
  " معرض "
];

const getEventKindStr = (rawTitle) => {
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
};

titles.forEach(t => console.log(t, "=>", getEventKindStr(t)));
