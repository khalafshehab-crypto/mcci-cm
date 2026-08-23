const fs = require('fs');
let content = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

content = content.replace(
  `| "design_settings">("hierarchy");`,
  `| "design_settings" | "account_settings">("hierarchy");`
);

content = content.replace(
  `        <button
          onClick={() => setActiveTab("org_chart")}
          className={\`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer \${
            activeTab === "org_chart" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
          }\`}
        >
          <Network className="w-4 h-4 shrink-0" />
          <span>بناء الهيكل التنظيمي</span>
        </button>`,
  `        <button
          onClick={() => setActiveTab("account_settings")}
          className={\`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer \${
            activeTab === "account_settings" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
          }\`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>إعدادات الحساب</span>
        </button>
        <button
          onClick={() => setActiveTab("org_chart")}
          className={\`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer \${
            activeTab === "org_chart" ? "border-brand text-brand font-black" : "border-transparent text-gray-500 hover:text-gray-900"
          }\`}
        >
          <Network className="w-4 h-4 shrink-0" />
          <span>بناء الهيكل التنظيمي</span>
        </button>`
);

fs.writeFileSync('src/pages/OrgChart.tsx', content);
