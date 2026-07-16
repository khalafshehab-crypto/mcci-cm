const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesMembers.tsx', 'utf8');

const replaceSection = (key, title, actionText) => {
  const regex = new RegExp(
    `\\{\\/\\* ${title === 'السيرة الذاتية' ? 'CV' : title === 'السجل التجاري' ? 'Commercial Register' : title === 'شهادة العضوية' ? 'Certificate' : 'Authorization'} \\*\\/\\}[\\s\\S]*?<span className="text-\\[11px\\] font-bold text-gray-650">${title}<\\/span>[\\s\\S]*?\\{detailsMember\\.${key} \\? \\([\\s\\S]*?<div className="flex items-center gap-2">[\\s\\S]*?<span className="text-\\[10px\\] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0\\.5 rounded-full">\\{detailsMember\\.${key}\\}<\\/span>[\\s\\S]*?<span className="text-\\[10px\\] text-\\[#4ea0b0\\] font-black cursor-pointer hover:underline">${actionText}<\\/span>[\\s\\S]*?<\\/div>[\\s\\S]*?\\) : \\([\\s\\S]*?<span className="text-\\[10px\\] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0\\.5 rounded-full">غير مرفق<\\/span>[\\s\\S]*?\\)[\\s\\S]*?<\\/div>`,
    'm'
  );

  const replacement = `{/* ${title === 'السيرة الذاتية' ? 'CV' : title === 'السجل التجاري' ? 'Commercial Register' : title === 'شهادة العضوية' ? 'Certificate' : 'Authorization'} */}
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] font-bold text-gray-650">${title}</span>
                      {detailsMember.${key} ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full max-w-[120px] truncate" title={detailsMember.${key}}>
                            {detailsMember.${key}.includes('http') ? 'مرفق (رابط)' : detailsMember.${key}}
                          </span>
                          {detailsMember.${key}.includes('http') ? (
                            <a href={detailsMember.${key}} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#4ea0b0] font-black hover:underline">${actionText}</a>
                          ) : (
                            <span className="text-[10px] text-[#4ea0b0] font-black cursor-pointer hover:underline">${actionText}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-800 font-extrabold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">غير مرفق</span>
                      )}
                    </div>`;

  if (content.match(regex)) {
    content = content.replace(regex, replacement);
  }
};

replaceSection('cv', 'السيرة الذاتية', 'تحميل السجل');
replaceSection('commercialRegister', 'السجل التجاري', 'تحميل السجل');
replaceSection('membershipCertificate', 'شهادة العضوية', 'عرض المستند');
replaceSection('authorization', 'مستند التفويض', 'عرض المستند');

fs.writeFileSync('src/pages/CommitteesMembers.tsx', content);
