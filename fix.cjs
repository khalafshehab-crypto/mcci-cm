const fs = require('fs');
let text = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

const targetStr = `title="إتلاف التق\x12              <form onSubmit={handleSaveEmployee}`;

text = text.replace(/title="إتلاف التق[\s\S]*?<form onSubmit=\{handleSaveEmployee\}/, `title="إتلاف التقرير">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        )}

      </main>

      {/* 4. MODAL FORMS: CREATE / EDIT EMPLOYEE */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 280 }}
              className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="bg-[#e8e4e4] p-5 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    <UserPlus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-brand tracking-widest uppercase block mb-0.5">بطاقات العمل والبيانات</span>
                    <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                      {isEditing ? \`تعديل بيانات الموظف: \${getEmployeePrefix({ name: formName, gender: formGender, prefix: formPrefix })} \${formName}\` : "إضافة بطاقة موظف معتمد جديد"}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 hover:bg-gray-200/50 text-gray-500 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEmployee}`);

fs.writeFileSync('src/pages/OrgChart.tsx', text);
