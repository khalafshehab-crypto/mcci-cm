const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalToast.tsx', 'utf8');

// Add close button and allow infinite duration if duration is 0 for errors
content = content.replace(
  '          <div className="p-4 flex items-start gap-3">',
  '          <div className="p-4 flex items-start gap-3 relative">\n            {toast.type === "error" && (\n              <button onClick={() => setToast(null)} className="absolute top-2 left-2 p-1 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">\n                <XCircle className="w-4 h-4" />\n              </button>\n            )}'
);

content = content.replace(
  '        setTimeout(() => {\n          setToast(null);\n        }, duration || 5000);',
  '        if (duration !== -1) {\n          setTimeout(() => {\n            setToast(null);\n          }, duration || (type === "error" ? 15000 : 5000));\n        }'
);

fs.writeFileSync('src/components/GlobalToast.tsx', content);
