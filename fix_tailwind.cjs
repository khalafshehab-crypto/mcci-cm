const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

code = code.replace(
  `  const getStatusColor = (status: string) => {
    if (!status) return "bg-blue-50 text-blue-700 border-blue-200";
    if (status.includes("مكتمل") || status.includes("منجز") || status.includes("مؤكد") || status.includes("تم التنفيذ")) {
       return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status.includes("جاري") || status.includes("محجوز") || status.includes("قيد")) {
       return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status.includes("متأخر") || status.includes("غير منجز") || status.includes("ملغي")) {
       return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };`,
  `  const getStatusColor = (status: string) => {
    if (!status) return "bg-blue-50 text-blue-700 border-blue-200 border-l-4 border-l-blue-700";
    if (status.includes("مكتمل") || status.includes("منجز") || status.includes("مؤكد") || status.includes("تم التنفيذ")) {
       return "bg-emerald-50 text-emerald-700 border-emerald-200 border-l-4 border-l-emerald-700";
    }
    if (status.includes("جاري") || status.includes("محجوز") || status.includes("قيد")) {
       return "bg-amber-50 text-amber-700 border-amber-200 border-l-4 border-l-amber-700";
    }
    if (status.includes("متأخر") || status.includes("غير منجز") || status.includes("ملغي")) {
       return "bg-red-50 text-red-700 border-red-200 border-l-4 border-l-red-700";
    }
    return "bg-blue-50 text-blue-700 border-blue-200 border-l-4 border-l-blue-700";
  };`
);

code = code.replace(
  `className={\`bg-white p-3 rounded-xl border flex flex-col gap-2 \${getStatusColor(e.status).replace('text-', 'border-l-4 border-l-')}\`}`,
  `className={\`bg-white p-3 rounded-xl border flex flex-col gap-2 \${getStatusColor(e.status)}\`}`
);

code = code.replace(
  `className={\`bg-white p-3 rounded-xl border flex flex-col gap-2 \${getStatusColor(r.status).replace('text-', 'border-l-4 border-l-')}\`}`,
  `className={\`bg-white p-3 rounded-xl border flex flex-col gap-2 \${getStatusColor(r.status)}\`}`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
console.log("Done fixing tailwind JIT");
