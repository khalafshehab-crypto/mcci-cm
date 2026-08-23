const fs = require('fs');

function modifyFile(filePath, modifications) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const mod of modifications) {
    if (typeof mod.search === 'string') {
        content = content.replace(mod.search, mod.replace);
    } else {
        content = content.replace(mod.search, mod.replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Modified ${filePath}`);
}

const modifications = [
  {
    search: '<label className="text-[8.5px] font-bold text-gray-750">المكلف برصد ومتابعة تنفيذ التوصية</label>',
    replace: '<label className="text-[8.5px] font-bold text-gray-750">المكلف بالتوصية</label>'
  },
  {
    search: '<option value="برنامج التطوير">فريق العمل الفني (موظف أخر)</option>',
    replace: ''
  }
];

modifyFile('src/pages/Events.tsx', modifications);
modifyFile('src/pages/CommitteesEvents.tsx', modifications);
