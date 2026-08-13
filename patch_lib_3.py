import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

# Fix validation check
content = content.replace('''if (!aiGenCommittee) {
                             showGlobalToast("الرجاء اختيار اللجنة للربط والأرشفة", "error");
                             return;
                          }''',
'''if (aiGenCommittees.length === 0) {
                             showGlobalToast("الرجاء اختيار اللجنة للربط والأرشفة", "error");
                             return;
                          }''')

# Fix commName mapping (not perfect since multiple committees, but we can just map them)
# Wait, let's see where commName is defined: 
# const commName = aiGenCommittee === "all" ? "لجان الغرفة" : (committees.find(c => String(c.id) === String(aiGenCommittee))?.name || aiGenCommittee);
content = content.replace('''const commName = aiGenCommittee === "all" ? "لجان الغرفة" : (committees.find(c => String(c.id) === String(aiGenCommittee))?.name || aiGenCommittee);''',
'''const commName = aiGenCommittees.map(id => committees.find(c => String(c.id) === id)?.name || id).join("، ");''')


# Fix saveAIGeneratedLetter
old_save = '''      const targetCommittees = [];
      if (aiGenCommittee === "all") {
        if (currentUser && currentUser.committees && currentUser.committees.length > 0) {
          targetCommittees.push(...committees.filter(c => currentUser.committees.includes(c.id)));
        } else {
          targetCommittees.push(...committees);
        }
      } else {
        const selectedCommittee = committees.find(c => String(c.id) === String(aiGenCommittee));
        if (selectedCommittee) targetCommittees.push(selectedCommittee);
      }'''

new_save = '''      const targetCommittees = committees.filter(c => aiGenCommittees.includes(String(c.id)));'''
content = content.replace(old_save, new_save)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
