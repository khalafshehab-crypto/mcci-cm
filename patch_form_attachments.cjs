const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf-8');

const targetStr = `{/* Description Field */}`;
const replacement = `{/* Attachments Section */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-black text-gray-800">مرفقات اللجنة المؤسسية</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <AttachmentInput 
                            id="formationLetter" 
                            label="قرار التشكيل" 
                            value={formationLetter} 
                            onChange={setFormationLetter} 
                          />
                          <AttachmentInput 
                            id="membersApproval" 
                            label="اعتماد الأعضاء" 
                            value={membersApproval} 
                            onChange={setMembersApproval} 
                          />
                          <AttachmentInput 
                            id="regulations" 
                            label="اللوائح" 
                            value={regulations} 
                            onChange={setRegulations} 
                          />
                          <AttachmentInput 
                            id="guides" 
                            label="الأدلة" 
                            value={guides} 
                            onChange={setGuides} 
                          />
                        </div>
                      </div>

                      {/* Description Field */}`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
console.log("Patched form attachments");
