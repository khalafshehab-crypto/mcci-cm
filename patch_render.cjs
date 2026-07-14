const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf-8');

const fields = [
  { key: 'personalPhoto', label: 'الصورة الشخصية' },
  { key: 'cv', label: 'السيرة الذاتية' },
  { key: 'commercialRegister', label: 'السجل التجاري' },
  { key: 'membershipCertificate', label: 'شهادة العضوية' },
  { key: 'authorization', label: 'مستند التفويض' }
];

for (const field of fields) {
  const target = `                      {detailsMember.${field.key} ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">{detailsMember.${field.key}}</span>
                          <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">عرض</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}`;
                      
  const replacement = `                      {detailsMember.${field.key} ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full max-w-[120px] truncate" title={detailsMember.${field.key}}>
                            {detailsMember.${field.key}.includes('drive.google.com') || detailsMember.${field.key}.includes('http') ? 'مرفق (رابط)' : detailsMember.${field.key}}
                          </span>
                          {detailsMember.${field.key}.includes('http') ? (
                            <a href={detailsMember.${field.key}} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#4ea0b0] font-black hover:underline">عرض</a>
                          ) : (
                            <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">عرض</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}`;
  
  content = content.replace(target, replacement);
}

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
