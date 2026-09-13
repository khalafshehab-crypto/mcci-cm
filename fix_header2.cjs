const fs = require('fs');

const file = '/app/applet/src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert NotificationCenter for mobile next to the Logo Dropdown
content = content.replace(
  /<\/AnimatePresence>\n\s*<\/div>\n\s*<\/div>\n\s*<div className="flex-grow hidden md:block"><\/div>/,
  `</AnimatePresence>
          </div>
          <div className="block md:hidden">
            <NotificationCenter />
          </div>
        </div>
        <div className="flex-grow hidden md:block"></div>`
);

// Hide the original NotificationCenter on mobile
content = content.replace(
  /<NotificationCenter \/>\n\s*{\/\* 1\. Date Cards \*\/}/,
  `<div className="hidden md:block">
              <NotificationCenter />
            </div>
            {/* 1. Date Cards */}`
);

fs.writeFileSync(file, content);
console.log('Fixed header layout logic in Layout.tsx');
