const fs = require('fs');

const filesToPatch = [
  'src/pages/CommitteesEvents.tsx',
  'src/pages/Events.tsx'
];

for (const file of filesToPatch) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Change Level 4 back button
  const oldBtn = `                <button
                  onClick={() => setSelectedClassificationForCards(null)}
                  className="text-xs text-brand font-black hover:underline"
                >
                  الرجوع خطوة للأعلى (الفرز والتصنيفات) ↑
                </button>`;
                
  const newBtn = `                <button
                  onClick={() => {
                    if (selectedEventKindForCards !== "اجتماع") {
                      setSelectedEventKindForCards(null);
                    } else {
                      setSelectedClassificationForCards(null);
                    }
                  }}
                  className="text-xs text-brand font-black hover:underline"
                >
                  {selectedEventKindForCards !== "اجتماع" ? "الرجوع خطوة للأعلى (عناوين أنواع الفعاليات) ↑" : "الرجوع خطوة للأعلى (الفرز والتصنيفات) ↑"}
                </button>`;

  content = content.replace(oldBtn, newBtn);

  fs.writeFileSync(file, content);
}
console.log("Patched back button");
