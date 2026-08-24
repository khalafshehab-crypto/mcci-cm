const fs = require('fs');
const file = 'src/pages/CommitteesLibrary.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update newDoc generation to include circularDetails
code = code.replace(
  'attachments: urlAttachments,',
  \`attachments: urlAttachments,
        circularDetails: isCircular ? {
            outNumber: circularOutNumber,
            outDate: circularOutDate,
            incomingFrom: circularIncomingFrom,
            incomingNumber: circularIncomingNumber,
            incomingDate: circularIncomingDate,
            subject: circularSubject,
            contactName: circularContactName,
            contactPhone: circularContactPhone,
            contactEmail: circularContactEmail,
            body: aiGenGeneratedText.split("عرض التعميم:")[1]?.trim() || aiGenGeneratedText,
        } : null\`
);

// Update modal rendering to show circular details
const modalRegex = /\{circularDetailsOpen && \([\s\S]*?<div>\s*<label className="block text-sm font-bold text-gray-700 mb-2">\s*الموضوع:\s*<\/label>\s*<div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">\s*\{circularDetailsOpen\.title\}\s*<\/div>\s*<\/div>/;

const modalReplacement = \`{circularDetailsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    تفاصيل التعميم
                  </h2>
                </div>
                <button
                  onClick={() => setCircularDetailsOpen(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {circularDetailsOpen.circularDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الموضوع</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.subject || circularDetailsOpen.title}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">رقم التعميم</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.outNumber || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">تاريخ التعميم</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.outDate || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">الوارد من</label>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-bold text-sm">
                        {circularDetailsOpen.circularDetails.incomingFrom || "—"}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">نص التعميم</label>
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-gray-800 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                        {circularDetailsOpen.circularDetails.body}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الموضوع:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">
                      {circularDetailsOpen.title}
                    </div>
                  </div>
                )\`;

code = code.replace(modalRegex, modalReplacement);

// Fix the PDF download button for circular cards
const downloadBtnRegex = /<a\\n\\s*href=\\{t\\.cloudUrl\\}\\n\\s*target="_blank"\\n\\s*rel="noopener noreferrer"\\n\\s*className="flex items-center justify-center gap-1\\.5 px-3 py-2 bg-white text-gray-750 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"\\n\\s*title="تحميل مباشرة"\\n\\s*>\\n\\s*تحميل\\n\\s*<Download className="w-3\\.5 h-3\\.5" \/>\\n\\s*<\\/a>/g;

const downloadBtnReplacement = \`<button
                      onClick={(e) => {
                         e.preventDefault();
                         handleDownloadTemplate(t);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-750 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"
                      title="تحميل مباشرة"
                    >
                      تحميل
                      <Download className="w-3.5 h-3.5" />
                    </button>\`;
                    
code = code.replace(/<a\n\s*href=\{t\.cloudUrl\}\n\s*target="_blank"\n\s*rel="noopener noreferrer"\n\s*className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-750 hover:text-black hover:bg-gray-100 rounded-lg text-xs font-extrabold transition-colors border border-gray-300 shadow-sm"\n\s*title="تحميل مباشرة"\n\s*>\n\s*تحميل\n\s*<Download className="w-3.5 h-3.5" \/>\n\s*<\/a>/g, downloadBtnReplacement);

fs.writeFileSync(file, code);
