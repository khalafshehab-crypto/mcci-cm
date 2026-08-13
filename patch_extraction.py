import re

with open('src/pages/CommitteesLibrary.tsx', 'r') as f:
    content = f.read()

old_extraction = '''          const fromMatch = text.match(/التعميم وارد من:\s*(.*)/);
          const numMatch = text.match(/رقم وتاريخ:\s*(.*)/);
          const subMatch = text.match(/الموضوع:\s*(.*)/);
          const textMatch = text.match(/نص توجيهي مقترح لإرساله للجان:\s*([\\s\\S]*)/);'''

new_extraction = '''          const fromMatch = text.match(/التعميم وارد من:\s*(.*)/);
          const numMatch = text.match(/رقم وتاريخ:\s*(.*)/);
          const subMatch = text.match(/الموضوع:\s*(.*)/);
          const textMatch = text.match(/عرض التعميم:\s*([\\s\\S]*)/);'''

content = content.replace(old_extraction, new_extraction)

old_prompt = '''نص توجيهي مقترح لإرساله للجان: [قم بصياغة رسالة توجيهية احترافية قصيرة توضح أهمية هذا التعميم وتوجيه اللجان للعمل بموجبه]`;'''
new_prompt = '''عرض التعميم: [قم بصياغة رسالة توجيهية احترافية قصيرة توضح أهمية هذا التعميم وتوجيه اللجان للعمل بموجبه]`;'''

content = content.replace(old_prompt, new_prompt)

with open('src/pages/CommitteesLibrary.tsx', 'w') as f:
    f.write(content)
