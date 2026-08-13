import re

with open('src/pages/CommitteesFormation.tsx', 'r') as f:
    content = f.read()

old_block = '''                        {circ.cloudUrl && circ.cloudUrl !== "#" && (
                          <a href={circ.cloudUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors">
                            <Eye className="w-4 h-4" /> عرض المستند
                          </a>
                        )}'''

new_block = '''                        {circ.cloudUrl && circ.cloudUrl !== "#" && (
                          <a href={circ.cloudUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors">
                            <Eye className="w-4 h-4" /> عرض المستند
                          </a>
                        )}
                        {circ.attachments && circ.attachments.length > 0 && circ.attachments.map((att: string, idx: number) => (
                          <a key={idx} href={att} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors">
                            <Paperclip className="w-4 h-4" /> مرفق {idx + 1}
                          </a>
                        ))}'''

content = content.replace(old_block, new_block)

with open('src/pages/CommitteesFormation.tsx', 'w') as f:
    f.write(content)
