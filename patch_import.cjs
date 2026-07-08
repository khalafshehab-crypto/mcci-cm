const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

// 1. Update importStep === 1
const step1Regex = /\{importStep === 1 && \([\s\S]*?\{importStep === 2 && \(/;
const newStep1 = `{importStep === 1 && (
                  <div className="text-center space-y-4">
                    <div className="border border-blue-200 bg-blue-50/50 rounded-3xl p-8 flex flex-col items-center justify-center">
                      <ExternalLink className="w-12 h-12 text-blue-500 mb-4" />
                      <h4 className="text-lg font-black text-gray-900">استيراد من Google Drive</h4>
                      <p className="text-sm text-gray-500 font-medium mb-4 text-center max-w-sm">
                        قم بلصق رابط ملف جدول البيانات (Google Sheets). <br/> يجب أن يكون الملف "متاح لأي شخص لديه الرابط".
                      </p>
                      
                      <div className="flex gap-2 w-full max-w-md">
                        <input
                          type="url"
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={googleSheetUrl}
                          onChange={(e) => setGoogleSheetUrl(e.target.value)}
                          className="flex-1 h-11 px-4 bg-white border border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-left"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={handleFetchGoogleSheet}
                          disabled={isFetchingSheet || !googleSheetUrl}
                          className="h-11 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          {isFetchingSheet ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            "جلب الملف"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {importStep === 2 && (`;
content = content.replace(step1Regex, newStep1);

// 2. Update importStep === 2 mapping
const mappingRegex = /Object\.entries\(\{\s+name: "اسم العضو",\s+phone: "رقم الجوال",\s+email: "البريد الإلكتروني",\s+nationalId: "رقم الهوية",\s+committee: "اللجنة"\s+\}\)/;
const newMapping = `Object.entries({
                        name: "اسم العضو",
                        committee: "اللجنة",
                        phone: "رقم الجوال",
                        email: "البريد الإلكتروني",
                        nationalId: "رقم الهوية",
                        membership_type: "آلية الانضمام",
                        joined_date: "تاريخ الانضمام"
                      })`;
content = content.replace(mappingRegex, newMapping);

// 3. Update executeImport
const newMemberRegex = /const newMember: Omit<Member, "id"> = \{\s+name: getColValue\("name"\),\s+phone: getColValue\("phone"\),\s+email: getColValue\("email"\),\s+nationalId: getColValue\("nationalId"\),\s+role: "عضو", \/\/ default\s+title: "الأستاذ",\s+customTitle: "",\s+committeeId: defaultComm\?\.id \|\| 0,\s+committeeName: defaultComm\?\.name \|\| "",\s+joiningMechanism: "مرشح",\s+govAgency: "",\s+entity: "غرفة مكة المكرمة",\s+active: true,\s+joinedDate: new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],\s+note: "مستورد من ملف",\s+personalPhoto: "",\s+cv: "",\s+commercialRegister: "",\s+membershipCertificate: "",\s+authorization: ""\s+\};/;

const newNewMember = `const newMember: Omit<Member, "id"> = {
          name: getColValue("name"),
          phone: getColValue("phone"),
          email: getColValue("email"),
          nationalId: getColValue("nationalId"),
          role: "عضو", // default
          title: "الأستاذ",
          customTitle: "",
          committeeId: defaultComm?.id || 0,
          committeeName: defaultComm?.name || "",
          joiningMechanism: getColValue("membership_type") || "مرشح",
          govAgency: "",
          entity: "غرفة مكة المكرمة",
          active: true,
          joinedDate: getColValue("joined_date") || new Date().toISOString().split('T')[0],
          note: "مستورد من ملف",
          personalPhoto: "",
          cv: "",
          commercialRegister: "",
          membershipCertificate: "",
          authorization: ""
        };`;
content = content.replace(newMemberRegex, newNewMember);

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
fs.writeFileSync('src/pages/Members.tsx', content);
console.log("Patched import logic successfully");
