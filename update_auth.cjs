const fs = require('fs');
const glob = require('glob'); // Note: glob might not be installed, we can just list files manually.

const files = [
  'src/pages/CommitteesMembers.tsx',
  'src/pages/Recommendations.tsx',
  'src/pages/Committees.tsx',
  'src/pages/CommitteesRecommendations.tsx',
  'src/pages/CommitteesFormation.tsx',
  'src/pages/Members.tsx',
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx',
  'src/pages/CommitteesTasks.tsx',
  'src/pages/Tasks.tsx'
];

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

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace old auth function
  const regex = /const canUserEditCommittee = \(committeeName: string\): boolean => \{[\s\S]*?catch \(e\) \{[\s\S]*?return true;[\s\S]*?\}[\s\S]*?\};/;
  
  if (regex.test(content)) {
    content = content.replace(regex, newAuth);
    console.log('Replaced auth in ' + file);
  } else {
    console.log('Could not find auth regex in ' + file);
  }

  // Find places where it hides rows or buttons using style={{ display: canUserEditCommittee... ? 'flex' : 'none' }}
  // Sometimes we want to keep the buttons hidden for unauthorized users.
  // Wait, the prompt says: "يجب أن يسمح النظام لجميع الموظفين بإرفاق المحاضر والتوصيات في جميع النظام، وكل موظف حسب الصلاحيات المخصصة به واللجان الخاصة به"
  // Actually, the main issue in CommitteesEvents is that they couldn't see the event details to attach things, or maybe they couldn't see the event row at all.
  // Wait, in CommitteesEvents, I just added the overlay over the expanded event. 
  // Let's check CommitteesRecommendations for the overlay.

  fs.writeFileSync(file, content);
}
