const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  const oldAuth = `  const canUserEditCommittee = (committeeName: string): boolean => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return true;
      const user = JSON.parse(stored);
      if (!user) return true;
      if (user.role === "SYS_ADMIN") return true;
      if (user.committees && Array.isArray(user.committees)) {
        return user.committees.includes(committeeName);
      }
      return false;
    } catch (e) {
      return true;
    }
  };`;

  const newAuth = `  const canUserEditCommittee = (committeeName: string): boolean => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return true;
      const user = JSON.parse(stored);
      if (!user) return true;
      const mgmtRoles = ["SYS_ADMIN", "MANAGER", "DEPT_HEAD", "MANAG_DIR", "EXECUTIVE_OFFICE", "ASSISTANT_SEC_GEN", "SECRETARY_GENERAL"];
      if (mgmtRoles.includes(user.role)) return true;
      if (user.committees && Array.isArray(user.committees)) {
        return user.committees.includes(committeeName) || user.committees.includes("عام") || committeeName === "عام" || committeeName === "الجميع";
      }
      return false;
    } catch (e) {
      return true;
    }
  };`;

  content = content.replace(oldAuth, newAuth);

  const oldMotion = `<motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-y border-gray-200 text-right font-sans"
                            >
                              <div className="flex flex-col md:flex-row gap-6">`;

  const newMotion = `<motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: "auto" }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-y border-gray-200 text-right font-sans relative"
                            >
                              {!canUserEditCommittee(evt.committeeName) && (
                                <div className="absolute inset-0 z-[60] bg-slate-50/40 cursor-not-allowed rounded-lg" title="ليس لديك صلاحية لتعديل هذه الفعالية" />
                              )}
                              <div className={\`flex flex-col md:flex-row gap-6 relative \${!canUserEditCommittee(evt.committeeName) ? "opacity-80 pointer-events-none grayscale-[10%]" : ""}\`}>`;

  if (content.includes(oldMotion)) {
     content = content.replace(oldMotion, newMotion);
     console.log("Patched motion div in " + filepath);
  } else {
     console.log("Could not find motion div in " + filepath);
  }

  fs.writeFileSync(filepath, content);
  console.log("Patched " + filepath);
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');
