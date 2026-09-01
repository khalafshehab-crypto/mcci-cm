const fs = require('fs');

const advancedWomenCheck = `const title = (m.title || "").trim();
          const name = (m.name || "").trim();
          const customTitle = (m.customTitle || "").trim();
          const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
          if (womenTitles.includes(title)) return true;
          if (title === "غير ذلك" && customTitle.endsWith("ة")) return true;
          if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
          
          // Additional heuristic: some common female names inside the string
          const femaleNames = ["سمر", "فاطمة", "أمل", "سارة", "خديجة", "نورة", "مها", "عبير", "ريم", "هند", "ندى", "بشاير", "عهود", "نوف", "روان", "امجاد"];
          for (let fn of femaleNames) {
              if (name.includes(fn)) return true;
          }
          return false;`;

function patchUseDashboardStats() {
  const path = 'src/hooks/useDashboardStats.ts';
  let code = fs.readFileSync(path, 'utf8');
  
  const targetPattern = /const womenMbrs = mbrs\.filter\(m => \{[\s\S]*?\}\)\.length;/;
  const replaceStr = `const womenMbrs = mbrs.filter(m => {
          ${advancedWomenCheck}
        }).length;`;
  
  code = code.replace(targetPattern, replaceStr);
  fs.writeFileSync(path, code);
  console.log("Patched useDashboardStats.ts");
}

function patchHome() {
  const path = 'src/pages/Home.tsx';
  let code = fs.readFileSync(path, 'utf8');
  
  const targetPattern = /const femaleCount = mbrs\.filter\(\(m: any\) => \{[\s\S]*?\}\)\.length;/g;
  const replaceStr = `const femaleCount = mbrs.filter((m: any) => {
          ${advancedWomenCheck}
        }).length;`;
        
  code = code.replace(targetPattern, replaceStr);
  fs.writeFileSync(path, code);
  console.log("Patched Home.tsx");
}

function patchCommitteesHome() {
  const path = 'src/pages/CommitteesHome.tsx';
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    const targetPattern = /const femaleCount = mbrs\.filter\(\(m: any\) => \{[\s\S]*?\}\)\.length;/g;
    const replaceStr = `const femaleCount = mbrs.filter((m: any) => {
          ${advancedWomenCheck}
        }).length;`;
    code = code.replace(targetPattern, replaceStr);
    fs.writeFileSync(path, code);
    console.log("Patched CommitteesHome.tsx");
  }
}

patchUseDashboardStats();
patchHome();
patchCommitteesHome();
