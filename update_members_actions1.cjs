const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const fieldsDef = `
const EXPORT_FIELDS_META = [
  { key: "alphabetical", label: "مسلسل العضو أبجدياً" },
  { key: "title", label: "اللقب" },
  { key: "name", label: "اسم العضو" },
  { key: "committeeName", label: "اللجنة" },
  { key: "role", label: "الصفة" },
  { key: "phone", label: "رقم الجوال" },
  { key: "email", label: "البريد الإلكتروني" },
  { key: "nationalId", label: "رقم الهوية" },
  { key: "joiningMechanism", label: "آلية الانضمام" },
  { key: "joinedDate", label: "تاريخ الانضمام" },
  { key: "active", label: "حالة العضوية" },
  { key: "note", label: "ملاحظات" },
];
`;

if (!code.includes('EXPORT_FIELDS_META')) {
  code = code.replace(
    /export default function CommitteesMembers\(\) \{/,
    `${fieldsDef}\nexport default function CommitteesMembers() {`
  );
}

const stateVars = `
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportModalMode, setExportModalMode] = useState<'import' | 'export'>('export');
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(
    EXPORT_FIELDS_META.map(f => f.key)
  );

  const toggleExportField = (key: string) => {
    setSelectedExportFields(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleExportToGoogleSheets = async () => {
    try {
      const activeHeaders = EXPORT_FIELDS_META.filter(f => selectedExportFields.includes(f.key));
      const csvHeader = activeHeaders.map(h => h.label).join(",");
      
      const filtered = selectedMembers.size > 0 
        ? synchronizedMembers.filter(m => selectedMembers.has(m.id))
        : synchronizedMembers;

      const csvRows = filtered.map((m, index) => {
        return activeHeaders.map(h => {
          if (h.key === "alphabetical") return index + 1;
          if (h.key === "active") return m.active ? "نشط" : "غير نشط";
          return m[h.key as keyof typeof m] || "";
        }).join(",");
      });

      const csvContent = [csvHeader, ...csvRows].join("\\n");
      const blob = new Blob(["\\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "الأعضاء.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExportOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
`;

if (!code.includes('isAddMenuOpen')) {
  code = code.replace(
    /const \[isImportOpen, setIsImportOpen\] = useState\(false\);/,
    `const [isImportOpen, setIsImportOpen] = useState(false);\n${stateVars}`
  );
}

fs.writeFileSync('src/pages/CommitteesMembers.tsx', code);
console.log("Added state vars");
