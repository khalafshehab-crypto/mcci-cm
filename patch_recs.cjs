const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

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
                                <div className="absolute inset-0 z-[60] bg-slate-50/40 cursor-not-allowed rounded-lg" title="ليس لديك صلاحية لتعديل هذه التوصية" />
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

patchFile('src/pages/CommitteesRecommendations.tsx');
patchFile('src/pages/Recommendations.tsx');
