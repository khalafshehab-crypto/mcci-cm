with open('src/pages/CommitteesFormation.tsx', 'r') as f:
    content = f.read()

new_modal = '''        {activeCircularsComm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveCircularsComm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand" />
                  تعاميم لجنة {activeCircularsComm.name}
                </h2>
                <button onClick={() => setActiveCircularsComm(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {dbTemplates.filter((t: any) => t.type === "تعميم" && t.committeeId === activeCircularsComm.id).length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    لا توجد تعاميم مرسلة لهذه اللجنة بعد.
                  </div>
                ) : (
                  dbTemplates.filter((t: any) => t.type === "تعميم" && t.committeeId === activeCircularsComm.id).map((circ: any) => (
                    <div key={circ.id} className="border border-gray-200 rounded-xl p-4 hover:border-brand/40 transition-colors bg-white shadow-sm flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{circ.title || "بدون عنوان"}</h4>
                        <div className="text-xs text-gray-500 mb-3">{circ.lastUpdated}</div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto text-right">
                          {circ.templateText}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        {circ.cloudUrl && circ.cloudUrl !== "#" && (
                          <a href={circ.cloudUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors">
                            <Eye className="w-4 h-4" /> عرض المستند
                          </a>
                        )}
                        <button onClick={() => {
                          const printWin = window.open('', '_blank');
                          if (printWin) {
                            printWin.document.write(`
                              <html dir="rtl">
                                <head>
                                  <title>${circ.title}</title>
                                  <style>
                                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                                    body { font-family: 'Cairo', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.8; }
                                    .content { white-space: pre-wrap; font-size: 16px; }
                                    @media print {
                                      body { padding: 0; }
                                    }
                                  </style>
                                </head>
                                <body>
                                  <div class="content">${circ.templateText}</div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            printWin.document.close();
                          }
                        }} className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors">
                          <Printer className="w-4 h-4" /> طباعة
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>'''

content = content.replace('      </AnimatePresence>', new_modal)
with open('src/pages/CommitteesFormation.tsx', 'w') as f:
    f.write(content)
