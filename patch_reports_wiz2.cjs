const fs = require('fs');
let code = fs.readFileSync('src/pages/CommitteesReports.tsx', 'utf-8');

const regex = /<h3 className="font-bold text-gray-800 text-sm">بطاقة مراجعة وتأكيد الشواهد والسجلات المنفذة<\/h3>\s*<p className="text-gray-500 text-xs">حدد العناصر التي تود إدراجها وتصميمها في عرض Google Slides النهائي\.<\/p>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="flex gap-2">/g;

const replacement = `<h3 className="font-bold text-gray-800 text-sm">بطاقة مراجعة وتأكيد الشواهد والسجلات المنفذة</h3>
                <p className="text-gray-500 text-xs">حدد العناصر التي تود إدراجها وتصميمها في عرض Google Slides النهائي.</p>
              </div>
            </div>
            
            <div className="mt-4 border rounded-xl bg-gray-50 max-h-64 overflow-y-auto custom-scrollbar p-3 space-y-2">
               {wizSearchFoundItems.map((item, idx) => (
                 <label key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                       <input 
                         type="checkbox"
                         className="w-4 h-4 text-blue-600 rounded border-gray-300"
                         checked={wizSelectedItems.includes(item.id)}
                         onChange={(e) => {
                            if(e.target.checked) setWizSelectedItems([...wizSelectedItems, item.id]);
                            else setWizSelectedItems(wizSelectedItems.filter(id => id !== item.id));
                         }}
                       />
                       <div>
                         <div className="flex items-center gap-2">
                            <span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold \${
                               item.category === 'event' ? 'bg-blue-50 text-blue-600' : 
                               item.category === 'recommendation' ? 'bg-purple-50 text-purple-600' : 
                               'bg-amber-50 text-amber-600'
                            }\`}>{item.type}</span>
                            <span className="font-bold text-gray-800 text-xs">{item.title}</span>
                         </div>
                         <div className="flex gap-3 text-[10px] text-gray-500 mt-1">
                            <span>اللجنة: {item.committee}</span>
                            <span>التاريخ: {item.date}</span>
                         </div>
                       </div>
                    </div>
                    <span className={\`text-[10px] px-2 py-1 rounded-md font-bold \${
                       ['منجزة', 'مكتملة', 'محجوز', 'مؤكد'].includes(item.status) ? 'bg-emerald-50 text-emerald-600' : 
                       ['متأخرة'].includes(item.status) ? 'bg-red-50 text-red-600' :
                       'bg-gray-100 text-gray-600'
                    }\`}>{item.status || 'مسجل'}</span>
                 </label>
               ))}
               {wizSearchFoundItems.length === 0 && (
                 <div className="text-center py-6 text-gray-500 font-bold text-xs">لا توجد أعمال مطابقة لشروط البحث والفترة المحددة.</div>
               )}
            </div>

          </div>
          <div className="flex gap-2">`;

if (code.includes('بطاقة مراجعة وتأكيد الشواهد والسجلات المنفذة')) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/pages/CommitteesReports.tsx', code);
    console.log("Patched Wiz2");
}

