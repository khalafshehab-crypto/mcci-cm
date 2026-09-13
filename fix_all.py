import os
import re

files = [
    'src/pages/CommitteesRecommendations.tsx',
    'src/pages/Recommendations.tsx',
    'src/pages/Events.tsx'
]

for filename in files:
    if not os.path.exists(filename): continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the setEvents block
    pattern = r'setEvents\(prev => prev\.map\(evt => \{.*?\n\s+if \(String\(evt\.id\) === String\(eventId\)\) \{\n(.*?)return evt;\n\s+\}\)\);'
    
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        inner_content = match.group(1)
        # We need to extract the part inside the if block, which is:
        # const updated = ...
        # ...
        # return updated;
        # }
        
        replacement = f'''const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {{
{inner_content}
        if (updated.isAgendaSource) {{
           const idx = allDbRecommendations.findIndex(r => String(r.id) === String(eventId));
           if (idx !== -1) {{
              updateFirebaseRecommendation(String(eventId), updated);
           }}
        }} else {{
           updateFirebaseEvent(String(eventId), updated);
        }}
    }}'''
        # Wait, the inner_content already contains the `return updated;` and `}` at the end.
        
    # Actually, simpler:
    content = re.sub(
        r'setEvents\(prev => prev\.map\(evt => \{\s*if \(String\(evt\.id\) === String\(eventId\)\) \{',
        r'const evt = events.find(e => String(e.id) === String(eventId));\n    if (evt) {',
        content
    )
    content = re.sub(
        r'return updated;\n\s+\}\n\s+return evt;\n\s+\}\)\);',
        r'if (updated.isAgendaSource) { updateFirebaseRecommendation(String(eventId), updated); } else { updateFirebaseEvent(String(eventId), updated); }\n    }',
        content
    )

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
