import re
import os

files_events = [
    'src/pages/CentersEvents.tsx',
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx'
]

files_tasks = [
    'src/pages/CentersTasks.tsx',
    'src/pages/AffiliatesTasks.tsx',
    'src/pages/AssistantSecGenTasks.tsx'
]

for file_path in files_events:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add importedFrom to EventItem interface
        if "importedFrom?:" not in content:
            content = re.sub(
                r'(interface EventItem \{)',
                r'\1\n  importedFrom?: string;',
                content
            )
            
        # Add visual tag to Table View (Title cell)
        table_title = r'(<span className="text-\[11px\] font-bold text-gray-900 leading-tight transition-colors group-hover/row:text-brand underline decoration-dotted decoration-brand/45 underline-offset-4 truncate mb-1">\s*\{evt\.title\}\s*</span>)'
        new_table_title = r'\1\n                            {evt.importedFrom && <span className="inline-block ms-1.5 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-800 border border-amber-200">مستورد من: {evt.importedFrom}</span>}'
        content = re.sub(table_title, new_table_title, content)
        
        # Add visual tag to Grid View
        grid_title = r'(<h3 className="text-xs font-black text-gray-900 leading-snug line-clamp-2">\s*\{evt\.title\}\s*</h3>)'
        new_grid_title = r'\1\n                            {evt.importedFrom && <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-800 border border-amber-200">مستورد من: {evt.importedFrom}</span>}'
        content = re.sub(grid_title, new_grid_title, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

for file_path in files_tasks:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add importedFrom to TaskItem interface
        if "importedFrom?:" not in content:
            content = re.sub(
                r'(interface TaskItem \{)',
                r'\1\n  importedFrom?: string;',
                content
            )
            
        # Add visual tag
        title_pattern = r'(<h3 className="text-xs font-black text-gray-900 leading-snug">\{task\.title\}</h3>)'
        new_title = r'\1\n                      {task.importedFrom && <div className="mt-1"><span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-800 border border-amber-200">مستورد من: {task.importedFrom}</span></div>}'
        content = re.sub(title_pattern, new_title, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
