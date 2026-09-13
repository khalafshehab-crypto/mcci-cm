import re

with open('src/lib/googleApi.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the trailing `tokenToUse`
content = content.replace(', 5, tokenToUse)', ', 5)')
content = content.replace(', tokenToUse)', ')')

with open('src/lib/googleApi.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
