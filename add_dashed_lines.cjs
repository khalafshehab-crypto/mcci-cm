const fs = require('fs');
let content = fs.readFileSync('src/pages/CommitteesLibrary.tsx', 'utf8');

// Step 3 Out
content = content.replace(
  '<span className="text-gray-900 font-black tracking-wider text-[13px]">{circularOutNumber}</span>',
  '<span className="text-gray-900 font-black tracking-wider text-[13px] border-b border-dashed border-gray-400 pb-0.5">{circularOutNumber}</span>'
);
content = content.replace(
  '<span className="text-gray-900 font-black tracking-wider text-[13px]">{circularOutDate}</span>',
  '<span className="text-gray-900 font-black tracking-wider text-[13px] border-b border-dashed border-gray-400 pb-0.5">{circularOutDate}</span>'
);

// Step 3 Incoming
content = content.replace(
  '<strong className="text-[#133E87]">الوارد من:</strong> {circularIncomingFrom || "—"}',
  '<strong className="text-[#133E87]">الوارد من:</strong> <span className="text-gray-900 font-bold border-b border-dashed border-gray-400 pb-0.5">{circularIncomingFrom || "—"}</span>'
);
content = content.replace(
  '<span><strong className="text-[#133E87]">برقم:</strong> {circularIncomingNumber || "—"}</span>',
  '<span><strong className="text-[#133E87]">برقم:</strong> <span className="text-gray-900 font-bold border-b border-dashed border-gray-400 pb-0.5">{circularIncomingNumber || "—"}</span></span>'
);
content = content.replace(
  '<span><strong className="text-[#133E87]">بتاريخ:</strong> {circularIncomingDate || "—"}</span>',
  '<span><strong className="text-[#133E87]">بتاريخ:</strong> <span className="text-gray-900 font-bold border-b border-dashed border-gray-400 pb-0.5">{circularIncomingDate || "—"}</span></span>'
);

// Step 4 Out
content = content.replace(
  '<span className="text-gray-900 font-black tracking-wider text-base">{circularOutNumber || "—"}</span>',
  '<span className="text-gray-900 font-black tracking-wider text-base border-b border-dashed border-gray-400 pb-0.5">{circularOutNumber || "—"}</span>'
);
content = content.replace(
  '<span className="text-gray-900 font-black tracking-wider text-base">{circularOutDate || "—"}</span>',
  '<span className="text-gray-900 font-black tracking-wider text-base border-b border-dashed border-gray-400 pb-0.5">{circularOutDate || "—"}</span>'
);

// Step 4 Incoming
content = content.replace(
  '<span className="font-extrabold text-gray-900">{circularIncomingFrom || "—"}</span>',
  '<span className="font-extrabold text-gray-900 border-b border-dashed border-gray-400 pb-0.5">{circularIncomingFrom || "—"}</span>'
);
content = content.replace(
  '<span className="font-black text-[#133E87] tracking-wider">{circularIncomingNumber || "—"}</span>',
  '<span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-gray-400 pb-0.5">{circularIncomingNumber || "—"}</span>'
);
content = content.replace(
  '<span className="font-black text-[#133E87] tracking-wider">{circularIncomingDate || "—"}</span>',
  '<span className="font-black text-[#133E87] tracking-wider border-b border-dashed border-gray-400 pb-0.5">{circularIncomingDate || "—"}</span>'
);

fs.writeFileSync('src/pages/CommitteesLibrary.tsx', content);
