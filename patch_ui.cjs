const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesFormation.tsx', 'utf8');

const replacement = `
                {/* Documents and Attachments Section */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700">المستندات والقرارات الرسمية</label>
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
`;

content = content.replace(
  /\{\/\* Formation Letter Link with computer upload emulation \*\/\}[\s\S]*?<\/div>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/pages/CommitteesFormation.tsx', content);
