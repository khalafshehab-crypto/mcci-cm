const fs = require('fs');

// Patch OrgChart.tsx
let orgFile = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

if (!orgFile.includes('verifyJoinRequestsIntegrity')) {
  // Add ShieldCheck icon
  orgFile = orgFile.replace(/import \{([^}]+)\} from "lucide-react";/, (match, group) => {
    if (!group.includes('ShieldCheck')) {
      return `import {${group}, ShieldCheck} from "lucide-react";`;
    }
    return match;
  });

  // Add the status field to interface
  orgFile = orgFile.replace(/export interface JoinRequest \{([\s\S]*?)\}/, (match, body) => {
    if (!body.includes('status?: string')) {
      return `export interface JoinRequest {${body}  status?: 'pending' | 'approved' | 'rejected';\n}`;
    }
    return match;
  });

  // Add the function inside OrgChart
  const funcStr = `
  const verifyJoinRequestsIntegrity = async () => {
    try {
      const { collection, getDocs, query, where } = await import("firebase/firestore");
      const { db, isUseMock } = await import("../lib/firebase");
      
      if (isUseMock()) {
         toast.error("النظام يعمل حالياً في وضع الذاكرة المحلية (Offline) بسبب مشكلة في الاتصال أو صلاحيات الكلاود.");
         return;
      }

      const q = query(collection(db, "join_requests"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      
      toast.success(\`اكتمل الفحص: يوجد \${snap.size} طلب انضمام معلق في قاعدة البيانات الحقيقية.\`);
      snap.forEach(doc => console.log("Join Req:", doc.id, doc.data()));
    } catch (err: any) {
      console.error("Integrity check failed:", err);
      if (err.code === "permission-denied") {
        toast.error("فشل الاستعلام: الجدار الناري (Firestore Rules) يمنع قراءة الطلبات. يرجى تحديث القواعد من لوحة تحكم Firebase.");
      } else {
        toast.error(\`فشل الاستعلام: \${err.message}\`);
      }
    }
  };
`;
  orgFile = orgFile.replace(/(const \[viewMode, setViewMode\] = useState<"grid" | "table">[^;]+;)/, `$1\n${funcStr}`);

  // Replace header and filter map
  const oldHeader = `<h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><UserCheck className="w-5 h-5 text-amber-500" /><span>طلبات الانضمام المعلقة</span></h2>`;
  const newHeader = `<div className="flex justify-between items-center">\n                <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><UserCheck className="w-5 h-5 text-amber-500" /><span>طلبات الانضمام المعلقة</span></h2>\n                <button onClick={verifyJoinRequestsIntegrity} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /><span>فحص الاستعلام</span></button>\n              </div>`;
  orgFile = orgFile.replace(oldHeader, newHeader);

  // Apply filtering logic locally to satisfy the visual constraint as well
  orgFile = orgFile.replace(/{dbJoinRequests\.map/g, '{dbJoinRequests.filter(req => !req.status || req.status === "pending").map');

  fs.writeFileSync('src/pages/OrgChart.tsx', orgFile);
}

// Patch AuthGate.tsx
let authFile = fs.readFileSync('src/components/AuthGate.tsx', 'utf8');
if (!authFile.includes('status: "pending"')) {
  authFile = authFile.replace(/gender: regGender/g, 'gender: regGender,\n        status: "pending"');
  fs.writeFileSync('src/components/AuthGate.tsx', authFile);
}
console.log("Patched successfully");
