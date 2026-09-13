const fs = require('fs');
const path = require('path');

const files = [
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/CommitteesEvents.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace single event logic
  content = content.replace(
    /onKeyDown=\{\(e\) => \{\s*if \(e\.key === 'Enter' && externalInput\.trim\(\)\) \{\s*e\.preventDefault\(\);\s*if \(!singleExternalInvitees\.includes\(externalInput\.trim\(\)\)\) \{\s*setSingleExternalInvitees\(prev => \[\.\.\.prev, externalInput\.trim\(\)\]\);\s*\}\s*setExternalInput\(""\);\s*\}\s*\}\}/g,
    `onKeyDown={(e) => {
                                    if (e.key === 'Enter' && externalInput.trim()) {
                                      e.preventDefault();
                                      const items = externalInput.split(/[,;\\n]+/).map(s => s.trim()).filter(Boolean);
                                      setSingleExternalInvitees(prev => {
                                        const newItems = [...prev];
                                        items.forEach(item => {
                                          if (!newItems.includes(item)) newItems.push(item);
                                        });
                                        return newItems;
                                      });
                                      setExternalInput("");
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedText = e.clipboardData.getData('text');
                                    const items = pastedText.split(/[,;\\n]+/).map(s => s.trim()).filter(Boolean);
                                    if (items.length > 0) {
                                      setSingleExternalInvitees(prev => {
                                        const newItems = [...prev];
                                        items.forEach(item => {
                                          if (!newItems.includes(item)) newItems.push(item);
                                        });
                                        return newItems;
                                      });
                                    }
                                  }}`
  );

  // Replace series event logic
  content = content.replace(
    /onKeyDown=\{\(e\) => \{\s*if \(e\.key === 'Enter' && seriesExternalInput\.trim\(\)\) \{\s*e\.preventDefault\(\);\s*if \(!seriesExternalInvitees\.includes\(seriesExternalInput\.trim\(\)\)\) \{\s*setSeriesExternalInvitees\(prev => \[\.\.\.prev, seriesExternalInput\.trim\(\)\]\);\s*\}\s*setSeriesExternalInput\(""\);\s*\}\s*\}\}/g,
    `onKeyDown={(e) => {
                                    if (e.key === 'Enter' && seriesExternalInput.trim()) {
                                      e.preventDefault();
                                      const items = seriesExternalInput.split(/[,;\\n]+/).map(s => s.trim()).filter(Boolean);
                                      setSeriesExternalInvitees(prev => {
                                        const newItems = [...prev];
                                        items.forEach(item => {
                                          if (!newItems.includes(item)) newItems.push(item);
                                        });
                                        return newItems;
                                      });
                                      setSeriesExternalInput("");
                                    }
                                  }}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    const pastedText = e.clipboardData.getData('text');
                                    const items = pastedText.split(/[,;\\n]+/).map(s => s.trim()).filter(Boolean);
                                    if (items.length > 0) {
                                      setSeriesExternalInvitees(prev => {
                                        const newItems = [...prev];
                                        items.forEach(item => {
                                          if (!newItems.includes(item)) newItems.push(item);
                                        });
                                        return newItems;
                                      });
                                    }
                                  }}`
  );

  // Allow wrapping inside the pill
  content = content.replace(
    /className="px-2 py-0\.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold flex items-center gap-1"/g,
    'className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold flex items-center gap-1 break-all"'
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
