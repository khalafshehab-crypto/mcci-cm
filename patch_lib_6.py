import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_cond = '''                            isAIGenGenerating || 
                            (aiGenMode === 'new' ? (!aiGenSubject && !aiGenDetails) : (!aiPrompt && !aiGenReplyFile && !aiGenReplyContent))'''

new_cond = '''                            isAIGenGenerating || 
                            (workspaceService === 'circular' ? !circularMainFile : (aiGenMode === 'new' ? (!aiGenSubject && !aiGenDetails) : (!aiPrompt && !aiGenReplyFile && !aiGenReplyContent)))'''

content = content.replace(old_cond, new_cond)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
