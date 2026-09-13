import re

with open('src/pages/CommitteesEvents.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

edit_block = r'''    setNewEmployees(evt.employees || []);
    setNewMembers(evt.members || []);
    setNewNotes(evt.notes);'''
    
new_edit_block = r'''    setNewEmployees(evt.employees || []);
    setNewMembers(evt.members || []);
    setNewNotes(evt.notes);
    if (evt.employees && evt.employees.length > 0) {
      setSingleEmployee(evt.employees[0]);
      if (evt.employees.length > 1) {
        setSingleAdditionalInvitees(evt.employees.slice(1));
      } else {
        setSingleAdditionalInvitees([]);
      }
    } else {
      setSingleEmployee("");
      setSingleAdditionalInvitees([]);
    }'''
    
content = content.replace(edit_block, new_edit_block)

# Do the same for others if needed
files = [
    'src/pages/AffiliatesEvents.tsx',
    'src/pages/AssistantSecGenEvents.tsx',
    'src/pages/CentersEvents.tsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        file_content = f.read()
    file_content = file_content.replace(edit_block, new_edit_block)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(file_content)

with open('src/pages/CommitteesEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
