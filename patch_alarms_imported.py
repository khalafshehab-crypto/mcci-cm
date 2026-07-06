import re
import os

files = [
    'src/pages/Centers.tsx',
    'src/pages/Affiliates.tsx',
    'src/pages/AssistantSecGen.tsx'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        alarm_title = r'(<h4 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">\{a\.title\}</h4>)'
        new_alarm_title = r'\1\n                        {evtObj?.importedFrom && <div className="mt-1"><span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-800 border border-amber-200">مستورد من: {evtObj.importedFrom}</span></div>}'
        content = re.sub(alarm_title, new_alarm_title, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
