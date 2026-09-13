const fs = require('fs');
const files = ['/app/applet/src/pages/AffiliatesEvents.tsx', '/app/applet/src/pages/AssistantSecGenEvents.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /setSingleKind\(matchedKind\);\s*setSingleClassification\(matchedClass\);\s*setSingleEventNumber\(matchedNum\);/,
    `let mKind = "";
    for (const k of ["اجتماع", "لقاء", "زيارة", "استضافة", "ورشة عمل", "ندوة", "حفل", "تدشين", "إطلاق مبادرة", "توقيع اتفاقية", "معرض", "دورة تدريبية", "ملتقى", "منتدى", "محاضرة"]) {
      if (evt.title.includes(k)) { mKind = k; break; }
    }
    setSingleKind(mKind || "اجتماع");

    let mClass = "";
    for (const c of ["دوري", "استثنائي", "طارئ", "فريق عمل"]) {
      if (evt.title.includes(c === "دوري" ? "الدوري" : c === "استثنائي" ? "الاستثنائي" : c === "طارئ" ? "الطارئ" : "فريق العمل")) {
        mClass = c; break;
      }
    }
    setSingleClassification(mClass || "دوري");

    let mNum = "";
    const ordinals = ["الصفر", "الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر", "التاسع عشر", "العشرون"];
    for (const ord of ordinals) {
      if (evt.title.includes(ord)) { mNum = ord; break; }
    }
    setSingleEventNumber(mNum);
    setIsSeqManuallyEdited(false);`
  );
  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
