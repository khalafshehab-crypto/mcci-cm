const fs = require('fs');
let text = fs.readFileSync('src/pages/OrgChart.tsx', 'utf8');

let startIndex = text.indexOf('                              )}');
let nextAnimatePresence = text.indexOf('                </AnimatePresence>', startIndex);

if (startIndex === -1 || nextAnimatePresence === -1) {
  console.log("Could not find", startIndex, nextAnimatePresence);
  process.exit(1);
}

const target = text.substring(startIndex, nextAnimatePresence + '                </AnimatePresence>'.length);

const replacement = `                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-1.5">
                        {(currentUserRole === "SYS_ADMIN" || currentUserRole === "MANAG_DIR" || currentUserRole === "DEPT_HEAD" || isSelf) && (
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 bg-gray-50 hover:bg-brand/10 text-gray-600 hover:text-brand rounded-lg transition-all cursor-pointer border border-gray-200 flex items-center gap-1.5 text-[10px] font-extrabold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                        )}
                        {currentUserRole === "SYS_ADMIN" && !isSelf && emp.id !== "01" && (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-all cursor-pointer border border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>`;

text = text.replace(target, replacement);
fs.writeFileSync('src/pages/OrgChart.tsx', text);
console.log("Done");
