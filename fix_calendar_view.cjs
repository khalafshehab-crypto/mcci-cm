const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = ['Events.tsx', 'CommitteesEvents.tsx', 'CentersEvents.tsx', 'AffiliatesEvents.tsx', 'AssistantSecGenEvents.tsx']
  .map(file => path.join(srcDir, file));

const iframeCode = `      ) : viewMode === "calendar" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 h-[700px]">
          <iframe
            src={\`https://calendar.google.com/calendar/embed?src=\${encodeURIComponent(JSON.parse(localStorage.getItem("current_user") || "{}")?.email || "")}&ctz=Asia/Riyadh&hl=ar&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0\`}
            style={{ border: 0, width: "100%", height: "100%" }}
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          ></iframe>
        </div>
`;

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  const regex = /\) : viewMode === "calendar"\s*\?\s*\([\s\S]*?\) : viewMode === "grid" \? \(/;
  
  if (regex.test(content)) {
    content = content.replace(regex, iframeCode + '      ) : viewMode === "grid" ? (');
    fs.writeFileSync(file, content);
    console.log("Updated calendar view in", path.basename(file));
  } else {
    console.log("Could not find calendar view pattern in", path.basename(file));
  }
});
