const fs = require('fs');

const path = 'src/pages/Members.tsx';
let code = fs.readFileSync(path, 'utf8');

const advancedWomenCheck = `const femaleCount = members.filter(m => {
    const title = (m.title || "").trim();
    const name = (m.name || "").trim();
    const customTitle = (m.customTitle || "").trim();
    const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
    if (womenTitles.includes(title)) return true;
    if (title === "غير ذلك" && customTitle.endsWith("ة")) return true;
    if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
    const femaleNames = ["سمر", "فاطمة", "أمل", "سارة", "خديجة", "نورة", "مها", "عبير", "ريم", "هند", "ندى", "بشاير", "عهود", "نوف", "روان", "امجاد"];
    for (let fn of femaleNames) {
        if (name.includes(fn)) return true;
    }
    return false;
  }).length;`;

code = code.replace(/const femaleTitles = \["الأستاذة", "المهندسة", "الدكتورة"\];\s*const femaleCount = members\.filter\(m => femaleTitles\.includes\(m\.title\) \|\| \(m\.title === "غير ذلك" && m\.customTitle\?\.trim\(\)\.endsWith\("ة"\)\)\)\.length;/, advancedWomenCheck);

fs.writeFileSync(path, code);
console.log("Members.tsx patched!");
