const fs = require('fs');
const path = 'src/pages/CommitteesReports.tsx';
let code = fs.readFileSync(path, 'utf8');

// Import CommitteesAnalytics
if (!code.includes('import CommitteesAnalytics')) {
  code = code.replace(
    "import { FileBarChart, Plus, Search, Table, Grid, Edit, Trash2, Check, RefreshCw, Filter, ListFilter, PlaySquare, CalendarDays, Download, ExternalLink, MessageSquare, AlertTriangle, X, MoreVertical, LayoutGrid, Clock, Users, Tag, CheckCircle2, Copy, FileText, ArrowUpRight, ChevronRight, Activity, TrendingUp, Presentation, Image as ImageIcon } from 'lucide-react';",
    "import { FileBarChart, Plus, Search, Table, Grid, Edit, Trash2, Check, RefreshCw, Filter, ListFilter, PlaySquare, CalendarDays, Download, ExternalLink, MessageSquare, AlertTriangle, X, MoreVertical, LayoutGrid, Clock, Users, Tag, CheckCircle2, Copy, FileText, ArrowUpRight, ChevronRight, Activity, TrendingUp, Presentation, Image as ImageIcon, BarChart2 } from 'lucide-react';\nimport CommitteesAnalytics from './CommitteesAnalytics';"
  );
}

// Add analytics to activeTab type
code = code.replace(
  'const [activeTab, setActiveTab] = useState<"reports" | "kpis">("reports");',
  'const [activeTab, setActiveTab] = useState<"reports" | "kpis" | "analytics">("reports");'
);

// Add the tab button
const kpiBtn = `            <button
              onClick={() => setActiveTab("kpis")}
              className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer \${
                activeTab === "kpis" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }\`}
              title="مصفوفة المؤشرات والمعايير (Google Sheets)"
            >
              <Activity className="w-4 h-4" />
            </button>`;

const newBtn = `
            <button
              onClick={() => setActiveTab("analytics")}
              className={\`px-3 py-1.5 rounded-lg font-black text-xs transition-all flex items-center gap-1 cursor-pointer \${
                activeTab === "analytics" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }\`}
              title="تحليل أداء اللجان"
            >
              <BarChart2 className="w-4 h-4" />
            </button>`;

if (code.includes(kpiBtn)) {
  code = code.replace(kpiBtn, kpiBtn + newBtn);
}

// Add the conditional rendering
const endKpisBlock = `        )}
      </div>

      {/* Reports Details Modal */}`;

const newContentBlock = `        )}
        
        {activeTab === "analytics" && (
          <div className="mt-4">
            <CommitteesAnalytics />
          </div>
        )}
      </div>

      {/* Reports Details Modal */}`;

if (code.includes(endKpisBlock)) {
  code = code.replace(endKpisBlock, newContentBlock);
} else {
  console.log("Could not find end of KPIs block.");
}

fs.writeFileSync(path, code);
console.log("CommitteesReports updated.");
