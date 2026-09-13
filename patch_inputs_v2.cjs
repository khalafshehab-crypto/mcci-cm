const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // singleKind
  const kindRegex = /onChange=\{\(e\) => \{\s*const newK = e\.target\.value;\s*setNewTitle\(prev => singleKind && prev\.includes\(singleKind\) \? prev\.replace\(singleKind, newK\) : prev\);\s*setSingleKind\(newK\);\s*if \(newK !== "اجتماع"\) \{\s*setSingleClassification\(""\);\s*\}\s*\}\}/;
  content = content.replace(kindRegex, `onChange={(e) => {
                                const newK = e.target.value;
                                setSingleKind(newK);
                                if (newK !== "اجتماع") {
                                  setSingleClassification("");
                                }
                                setIsTitleManuallyEdited(false);
                              }}`);

  // singleClassification
  const classRegex = /onChange=\{\(e\) => \{\s*const newC = e\.target\.value;\s*setNewTitle\(prev => singleClassification && prev\.includes\(singleClassification\) \? prev\.replace\(singleClassification, newC\) : prev\);\s*setSingleClassification\(newC\);\s*\}\}/;
  content = content.replace(classRegex, `onChange={(e) => {
                                const newC = e.target.value;
                                setSingleClassification(newC);
                                setIsTitleManuallyEdited(false);
                              }}`);

  // newCommitteeId (Committees & Centers) / newPartyName (Affiliates) / newEmployeeName (AssistantSecGen)
  // Let's just find where setIsTitleManuallyEdited is and where they change the related subject.
  
  // Also we need to fix the title parsing in handleOpenEdit so it extracts "تدشين" properly!
  // It checks EVENT_KINDS, but EVENT_KINDS is defined. Let's replace the array with EVENT_KINDS!
  const parseKindRegex = /for \(const k of \["اجتماع", "لقاء", "زيارة", "ورشة عمل", "استضافة", "معرض", "دورة", "ملتقى", "منتدى", "محاضرة"\]\) \{/;
  content = content.replace(parseKindRegex, `for (const k of ["اجتماع", "لقاء", "زيارة", "استضافة", "ورشة عمل", "ندوة", "حفل", "تدشين", "إطلاق مبادرة", "توقيع اتفاقية", "معرض", "دورة تدريبية", "ملتقى", "منتدى", "محاضرة"]) {`);

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
