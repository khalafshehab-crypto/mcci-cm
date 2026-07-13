const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

// Add "name" to selectedExportFields default
code = code.replace(
  `"alphabetical", "president",`,
  `"alphabetical", "name", "president",`
);

// Add to EXPORT_FIELDS_META
code = code.replace(
  `{ key: "alphabetical", label: "مسلسل اللجنة أبجدياً" },`,
  `{ key: "alphabetical", label: "مسلسل اللجنة أبجدياً" },\n    { key: "name", label: "اسم اللجنة" },`
);

// Add to getFieldVal
code = code.replace(
  `val = String(index + 1);\n      } else if (hKey === "president") {`,
  `val = String(index + 1);\n      } else if (hKey === "name") {\n        val = comm.name;\n      } else if (hKey === "president") {`
);

// Add to triggerLocalCsvFallback (though maybe it maps directly over activeHeaders now)
// Yes, getFieldVal is used inside mapping! Wait, triggerLocalCsvFallback currently has duplicated code for mapping!
code = code.replace(
  `val = String(index + 1);\n        } else if (h.key === "president") {`,
  `val = String(index + 1);\n        } else if (h.key === "name") {\n          val = comm.name;\n        } else if (h.key === "president") {`
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', code);
