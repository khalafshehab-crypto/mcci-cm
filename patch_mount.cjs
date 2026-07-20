const fs = require('fs');

let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// import mergeDuplicateMembers
code = `import { mergeDuplicateMembers } from './mergeDuplicates';\n` + code;

const mountTarget = `  useEffect(() => {
    localStorage.setItem("app_members", JSON.stringify(members));
  }, [members]);`;

const mountReplace = `  useEffect(() => {
    localStorage.setItem("app_members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (members.length > 0 && !(window as any).hasMergedDuplicates) {
      (window as any).hasMergedDuplicates = true;
      mergeDuplicateMembers();
    }
  }, [members]);`;

code = code.replace(mountTarget, mountReplace);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Patched mount");
