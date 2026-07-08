const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesMembers.tsx',
  'src/pages/Members.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Update importStep === 2 mapping
  const mappingRegex = /Object\.entries\(\{\s+name: "اسم العضو",\s+committee: "اللجنة",\s+phone: "رقم الجوال",\s+email: "البريد الإلكتروني",\s+nationalId: "رقم الهوية",\s+membership_type: "آلية الانضمام",\s+joined_date: "تاريخ الانضمام"\s+\}\)/;
  
  const newMapping = `Object.entries({
                        title: "اللقب",
                        name: "اسم العضو",
                        committee: "اللجنة",
                        role: "الصفة",
                        phone: "رقم الجوال",
                        email: "البريد الإلكتروني",
                        nationalId: "رقم الهوية",
                        membership_type: "آلية الانضمام",
                        joined_date: "تاريخ الانضمام",
                        note: "ملاحظات"
                      })`;
  content = content.replace(mappingRegex, newMapping);

  // Update executeImport newMember
  const newMemberRegex = /const newMember: Omit<Member, "id"> = \{\s+name: getColValue\("name"\),\s+phone: getColValue\("phone"\),\s+email: getColValue\("email"\),\s+nationalId: getColValue\("nationalId"\),\s+role: "عضو", \/\/ default\s+title: "الأستاذ",\s+customTitle: "",\s+committeeId: defaultComm\?\.id \|\| 0,\s+committeeName: defaultComm\?\.name \|\| "",\s+joiningMechanism: getColValue\("membership_type"\) \|\| "مرشح",\s+govAgency: "",\s+entity: "غرفة مكة المكرمة",\s+active: true,\s+joinedDate: getColValue\("joined_date"\) \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],\s+note: "مستورد من ملف",\s+personalPhoto: "",\s+cv: "",\s+commercialRegister: "",\s+membershipCertificate: "",\s+authorization: ""\s+\};/;

  const newNewMember = `const newMember: Omit<Member, "id"> = {
          name: getColValue("name"),
          phone: getColValue("phone"),
          email: getColValue("email"),
          nationalId: getColValue("nationalId"),
          role: getColValue("role") || "عضو",
          title: getColValue("title") || "الأستاذ",
          customTitle: "",
          committeeId: defaultComm?.id || 0,
          committeeName: defaultComm?.name || "",
          joiningMechanism: getColValue("membership_type") || "مرشح",
          govAgency: "",
          entity: "غرفة مكة المكرمة",
          active: true,
          joinedDate: getColValue("joined_date") || new Date().toISOString().split('T')[0],
          note: getColValue("note") || "مستورد من ملف",
          personalPhoto: "",
          cv: "",
          commercialRegister: "",
          membershipCertificate: "",
          authorization: ""
        };`;
  content = content.replace(newMemberRegex, newNewMember);

  fs.writeFileSync(file, content);
}
console.log("Patched import logic again successfully");
