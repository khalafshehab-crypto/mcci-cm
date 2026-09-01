const fs = require('fs');

function patchUseDashboardStats() {
  const path = 'src/hooks/useDashboardStats.ts';
  let code = fs.readFileSync(path, 'utf8');
  
  code = code.replace(
    'const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة"];',
    'const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];'
  );
  
  fs.writeFileSync(path, code);
  console.log("Patched useDashboardStats.ts");
}

function patchHome() {
  const path = 'src/pages/Home.tsx';
  let code = fs.readFileSync(path, 'utf8');
  
  const targetPattern = /const femaleCount = mbrs\.filter\(\(m: any\) => \{[\s\S]*?\}\)\.length;/g;
  
  const replaceWith = `const femaleCount = mbrs.filter((m: any) => {
          const title = (m.title || "").trim();
          const name = (m.name || "").trim();
          const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
          if (womenTitles.includes(title)) return true;
          if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
          return false;
        }).length;`;
        
  code = code.replace(targetPattern, replaceWith);
  fs.writeFileSync(path, code);
  console.log("Patched Home.tsx");
}

function patchCommitteesHome() {
  const path = 'src/pages/CommitteesHome.tsx';
  if (fs.existsSync(path)) {
    let code = fs.readFileSync(path, 'utf8');
    const targetPattern = /const femaleCount = mbrs\.filter\(\(m: any\) => \{[\s\S]*?\}\)\.length;/g;
    
    const replaceWith = `const femaleCount = mbrs.filter((m: any) => {
          const title = (m.title || "").trim();
          const name = (m.name || "").trim();
          const womenTitles = ["أستاذة", "دكتورة", "مهندسة", "سيدة", "الأستاذة", "المهندسة", "الدكتورة"];
          if (womenTitles.includes(title)) return true;
          if (name.includes("استاذة") || name.includes("أستاذة") || name.includes("دكتورة") || name.includes("مهندسة") || name.includes("سيدة") || name.includes("الأستاذة") || name.includes("المهندسة") || name.includes("الدكتورة")) return true;
          return false;
        }).length;`;
        
    code = code.replace(targetPattern, replaceWith);
    fs.writeFileSync(path, code);
    console.log("Patched CommitteesHome.tsx");
  }
}

patchUseDashboardStats();
patchHome();
patchCommitteesHome();

