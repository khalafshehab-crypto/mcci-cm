import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's see what connectGoogleWorkspace does
connect = r'const token = await connectGoogleWorkspace\(\);'
