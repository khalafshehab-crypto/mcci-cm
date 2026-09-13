const fs = require('fs');

const files = [
  '/app/applet/src/pages/CommitteesEvents.tsx',
  '/app/applet/src/pages/CentersEvents.tsx',
  '/app/applet/src/pages/AffiliatesEvents.tsx',
  '/app/applet/src/pages/AssistantSecGenEvents.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix modal overlay padding
  content = content.replace(/<div className="fixed inset-0 flex items-center justify-center z-50 p-4">/g, '<div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">');

  // Fix modal body padding
  content = content.replace(/<div className="overflow-y-auto p-6">/g, '<div className="overflow-y-auto p-4 sm:p-6">');
  
  // Fix header padding in modals
  content = content.replace(/<div className="bg-\[#e8e4e4\] p-5 border-b/g, '<div className="bg-[#e8e4e4] p-4 sm:p-5 border-b');

  // Fix the sync modal padding
  content = content.replace(/<div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50\/50">/g, '<div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">');
  content = content.replace(/<div className="p-6 overflow-y-auto custom-scrollbar flex-1">/g, '<div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">');
  content = content.replace(/<div className="p-6 bg-gray-50\/50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">/g, '<div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">');
  
  // Fix Add Form buttons container
  content = content.replace(/<div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">/g, '<div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
