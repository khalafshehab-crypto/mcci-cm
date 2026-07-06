const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // Patch singleKind
    content = content.replace(
        /onChange=\{\(e\) => setSingleKind\(e.target.value\)\}/g,
        `onChange={(e) => {\n                                setSingleKind(e.target.value);\n                                if (e.target.value !== "اجتماع") {\n                                  setSingleClassification("");\n                                }\n                              }}`
    );

    // Patch singleClassification
    content = content.replace(
        /onChange=\{\(e\) => setSingleClassification\(e.target.value\)\}\n\s+className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2\.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"/g,
        `onChange={(e) => setSingleClassification(e.target.value)}
                              disabled={singleKind !== "اجتماع"}
                              className={\`w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand \${singleKind !== "اجتماع" ? "opacity-50 cursor-not-allowed" : ""}\`}`
    );

    // Patch seriesKind
    content = content.replace(
        /onChange=\{\(e\) => setSeriesKind\(e.target.value\)\}/g,
        `onChange={(e) => {\n                                setSeriesKind(e.target.value);\n                                if (e.target.value !== "اجتماع") {\n                                  setSeriesClassification("");\n                                }\n                              }}`
    );

    // Patch seriesClassification
    content = content.replace(
        /onChange=\{\(e\) => setSeriesClassification\(e.target.value\)\}\n\s+className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2\.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand"/g,
        `onChange={(e) => setSeriesClassification(e.target.value)}
                              disabled={seriesKind !== "اجتماع"}
                              className={\`w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand focus:border-brand \${seriesKind !== "اجتماع" ? "opacity-50 cursor-not-allowed" : ""}\`}`
    );

    fs.writeFileSync(file, content);
}

patchFile('src/pages/CommitteesEvents.tsx');
patchFile('src/pages/Events.tsx');

