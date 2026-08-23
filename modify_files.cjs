const fs = require('fs');

function modifyFile(filePath, modifications) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const mod of modifications) {
    if (typeof mod.search === 'string') {
        content = content.replace(mod.search, mod.replace);
    } else {
        content = content.replace(mod.search, mod.replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Modified ${filePath}`);
}

// 1. Events.tsx
modifyFile('src/pages/Events.tsx', [
  {
    search: /const CLASSIFICATIONS = \["دوري", "استثنائي", "فريق عمل", "طارئ"\];/g,
    replace: 'const CLASSIFICATIONS = ["دوري", "طارئ"];'
  },
  {
    search: 'hasImpact?: boolean;',
    replace: 'hasImpact?: boolean;\n    impactType?: "عادية" | "آجل" | "ذات أثر";\n    isUrgent?: boolean;\n    isImportant?: boolean;'
  },
  {
    search: `<div className="md:col-span-3 flex items-center justify-end h-8.5 pb-1">\n                                                        <label className="flex items-center gap-2 cursor-pointer select-none">\n                                                          <input \n                                                            type="checkbox"\n                                                            checked={!!item.hasImpact}\n                                                            onChange={(e) => handleUpdateAgendaMinutes(item.id, { hasImpact: e.target.checked })}\n                                                            className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"\n                                                          />\n                                                          <span className="text-[9.5px] text-slate-900 font-extrabold">\n                                                            توصية ذات أثر (مهمة ومؤثرة)\n                                                          </span>\n                                                        </label>\n                                                      </div>`,
    replace: `<div className="md:col-span-3 flex flex-col justify-end min-h-[34px]">\n                                                        <select\n                                                          value={item.impactType || "عادية"}\n                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { impactType: e.target.value as any })}\n                                                          className="w-full text-[10px] font-bold p-1 border border-gray-200 rounded bg-white text-right focus:outline-none focus:border-brand"\n                                                        >\n                                                          <option value="عادية">توصية عادية</option>\n                                                          <option value="آجل">توصية آجل</option>\n                                                          <option value="ذات أثر">توصية ذات أثر</option>\n                                                        </select>\n                                                        {item.impactType === "ذات أثر" && (\n                                                          <div className="flex items-center gap-3 mt-1.5 px-1">\n                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">\n                                                              <input\n                                                                type="checkbox"\n                                                                checked={!!item.isUrgent}\n                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isUrgent: e.target.checked })}\n                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"\n                                                              />\n                                                              <span className="text-[9px] text-slate-900 font-extrabold">عاجل</span>\n                                                            </label>\n                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">\n                                                              <input\n                                                                type="checkbox"\n                                                                checked={!!item.isImportant}\n                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isImportant: e.target.checked })}\n                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"\n                                                              />\n                                                              <span className="text-[9px] text-slate-900 font-extrabold">مهم</span>\n                                                            </label>\n                                                          </div>\n                                                        )}\n                                                      </div>`
  }
]);

// 2. CommitteesEvents.tsx
modifyFile('src/pages/CommitteesEvents.tsx', [
  {
    search: /const CLASSIFICATIONS = \["دوري", "استثنائي", "فريق عمل", "طارئ"\];/g,
    replace: 'const CLASSIFICATIONS = ["دوري", "طارئ"];'
  },
  {
    search: 'hasImpact?: boolean;',
    replace: 'hasImpact?: boolean;\n    impactType?: "عادية" | "آجل" | "ذات أثر";\n    isUrgent?: boolean;\n    isImportant?: boolean;'
  },
  {
    search: `<div className="md:col-span-3 flex items-center justify-end h-8.5 pb-1">\n                                                        <label className="flex items-center gap-2 cursor-pointer select-none">\n                                                          <input \n                                                            type="checkbox"\n                                                            checked={!!item.hasImpact}\n                                                            onChange={(e) => handleUpdateAgendaMinutes(item.id, { hasImpact: e.target.checked })}\n                                                            className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"\n                                                          />\n                                                          <span className="text-[9.5px] text-slate-900 font-extrabold">\n                                                            توصية ذات أثر (مهمة ومؤثرة)\n                                                          </span>\n                                                        </label>\n                                                      </div>`,
    replace: `<div className="md:col-span-3 flex flex-col justify-end min-h-[34px]">\n                                                        <select\n                                                          value={item.impactType || "عادية"}\n                                                          onChange={(e) => handleUpdateAgendaMinutes(item.id, { impactType: e.target.value as any })}\n                                                          className="w-full text-[10px] font-bold p-1 border border-gray-200 rounded bg-white text-right focus:outline-none focus:border-brand"\n                                                        >\n                                                          <option value="عادية">توصية عادية</option>\n                                                          <option value="آجل">توصية آجل</option>\n                                                          <option value="ذات أثر">توصية ذات أثر</option>\n                                                        </select>\n                                                        {item.impactType === "ذات أثر" && (\n                                                          <div className="flex items-center gap-3 mt-1.5 px-1">\n                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">\n                                                              <input\n                                                                type="checkbox"\n                                                                checked={!!item.isUrgent}\n                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isUrgent: e.target.checked })}\n                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"\n                                                              />\n                                                              <span className="text-[9px] text-slate-900 font-extrabold">عاجل</span>\n                                                            </label>\n                                                            <label className="flex items-center gap-1.5 cursor-pointer select-none">\n                                                              <input\n                                                                type="checkbox"\n                                                                checked={!!item.isImportant}\n                                                                onChange={(e) => handleUpdateAgendaMinutes(item.id, { isImportant: e.target.checked })}\n                                                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"\n                                                              />\n                                                              <span className="text-[9px] text-slate-900 font-extrabold">مهم</span>\n                                                            </label>\n                                                          </div>\n                                                        )}\n                                                      </div>`
  }
]);

// 3. CommitteesRecommendations.tsx
modifyFile('src/pages/CommitteesRecommendations.tsx', [
  {
    search: `className="px-2.5 py-1.5 bg-slate-900 border-transparent hover:bg-slate-800 text-brand text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 shadow transition-all duration-200 animate-pulse font-sans"\n                                                  >\n                                                    <Sparkles className="w-3.5 h-3.5" />\n                                                    توليد النص المقترح\n                                                  </button>`,
    replace: `className="p-2 bg-slate-900 border-transparent hover:bg-slate-800 text-brand rounded-lg cursor-pointer flex items-center justify-center shadow transition-all duration-200 animate-pulse w-8 h-8"\n                                                    title="توليد النص المقترح ونسخه"\n                                                  >\n                                                    <Copy className="w-4 h-4" />\n                                                  </button>`
  },
  {
    search: `updateEventWorkflow(evt.id, { preparationsText: generatedProposal });\n                                                    }`,
    replace: `updateEventWorkflow(evt.id, { preparationsText: generatedProposal });\n                                                      try { navigator.clipboard.writeText(generatedProposal); } catch(e) {}\n                                                    }`
  },
  {
    search: `className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-gray-200 font-sans"\n                                                      >\n                                                        <Mail className="w-3.5 h-3.5" />\n                                                        إرسال بالإيميل\n                                                      </button>`,
    replace: `className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer flex items-center justify-center transition-all border border-gray-200 w-8 h-8"\n                                                        title="إرسال بالإيميل"\n                                                      >\n                                                        <Mail className="w-4 h-4" />\n                                                      </button>`
  }
]);

// 4. Recommendations.tsx
modifyFile('src/pages/Recommendations.tsx', [
  {
    search: `className="px-2.5 py-1.5 bg-slate-900 border-transparent hover:bg-slate-800 text-brand text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 shadow transition-all duration-200 animate-pulse font-sans"\n                                                  >\n                                                    <Sparkles className="w-3.5 h-3.5" />\n                                                    توليد النص المقترح\n                                                  </button>`,
    replace: `className="p-2 bg-slate-900 border-transparent hover:bg-slate-800 text-brand rounded-lg cursor-pointer flex items-center justify-center shadow transition-all duration-200 animate-pulse w-8 h-8"\n                                                    title="توليد النص المقترح ونسخه"\n                                                  >\n                                                    <Copy className="w-4 h-4" />\n                                                  </button>`
  },
  {
    search: `updateEventWorkflow(evt.id, { preparationsText: generatedProposal });\n                                                    }`,
    replace: `updateEventWorkflow(evt.id, { preparationsText: generatedProposal });\n                                                      try { navigator.clipboard.writeText(generatedProposal); } catch(e) {}\n                                                    }`
  },
  {
    search: `className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[8.5px] font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-gray-200 font-sans"\n                                                      >\n                                                        <Mail className="w-3.5 h-3.5" />\n                                                        إرسال بالإيميل\n                                                      </button>`,
    replace: `className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer flex items-center justify-center transition-all border border-gray-200 w-8 h-8"\n                                                        title="إرسال بالإيميل"\n                                                      >\n                                                        <Mail className="w-4 h-4" />\n                                                      </button>`
  }
]);
